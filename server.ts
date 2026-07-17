import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

import { db } from './src/server/db';
import { matchesSearch } from './src/server/utils';
import { COUNTRIES, CURRENCIES, LANGUAGES, TIMEZONES } from './src/server/globalPreferencesData';
import { 
  getShoppingAssistantResponse, 
  getReviewSummary, 
  generateProductDescription, 
  checkReviewValidity 
} from './src/server/gemini';
import { Order, UserRole, UserSession } from './src/types';

// Global state tracking
let activeUserId: string | null = null; // Starts as unauthenticated

const GUEST_SESSION: UserSession = {
  id: 'guest',
  name: 'Guest User',
  email: 'guest@ocean.com',
  role: 'Customer',
  walletBalance: 0,
  rewardCoins: 0,
  isOnboarded: true
};

const otpStorage = new Map<string, { otp: string; expires: number }>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Attach activeUserId to request context for api-v1 routes
  app.use((req: any, res: any, next: any) => {
    req.userId = activeUserId;
    next();
  });

  // Versioned Enterprise REST API Router (v1)
  const { apiV1Router } = await import('./src/server/routes/api-v1');
  app.use('/api/v1', apiV1Router);

  // --- API ROUTES ---

  // Auth/Session endpoints
  app.get('/api/auth/sessions', (req: Request, res: Response) => {
    const sessions = db.getUserSessions();
    const active = activeUserId === 'guest' ? GUEST_SESSION : (sessions.find(s => s.id === activeUserId) || null);
    res.json({ sessions, active });
  });

  app.get('/api/auth/session', (req: Request, res: Response) => {
    const sessions = db.getUserSessions();
    const active = activeUserId === 'guest' ? GUEST_SESSION : (sessions.find(s => s.id === activeUserId) || null);
    res.json(active);
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Identity (Email/Username/Phone) and password are required.' });
    }

    const inputLower = email.toLowerCase().trim();
    const sessions = db.getUserSessions();
    const user = sessions.find(s => 
      s.email.toLowerCase() === inputLower || 
      (s.username && s.username.toLowerCase() === inputLower) || 
      (s.phone && s.phone.replace(/[^0-9+]/g, '') === inputLower.replace(/[^0-9+]/g, ''))
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid identifier (Email/Username/Phone) or password.' });
    }

    // Check account lock
    const now = Date.now();
    if (user.lockedUntil && new Date(user.lockedUntil).getTime() > now) {
      const remainingMinutes = Math.ceil((new Date(user.lockedUntil).getTime() - now) / 60000);
      return res.status(403).json({ error: `Account is temporarily locked due to repeated failures. Please try again in ${remainingMinutes} minutes.` });
    }

    const { hashPassword } = require('./src/server/db');
    const inputHash = hashPassword(password);

    if (user.password !== inputHash) {
      const attempts = (user.failedAttempts || 0) + 1;
      const updates: Partial<UserSession> = { failedAttempts: attempts };
      
      db.addAuditLog({
        action: `Failed login attempt for ${inputLower}`,
        user: user.name,
        role: user.role,
        status: 'Warning',
        ip: req.ip || '127.0.0.1'
      });

      if (attempts >= 5) {
        updates.lockedUntil = new Date(now + 5 * 60 * 1000).toISOString(); // lock for 5 mins
        db.updateUserProfile(user.id, updates);
        return res.status(403).json({ error: 'Account locked due to 5 consecutive failed attempts. Please try again in 5 minutes.' });
      }

      db.updateUserProfile(user.id, updates);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Success
    const historyItem = {
      timestamp: new Date().toISOString(),
      ip: req.ip || '127.0.0.1',
      device: req.headers['user-agent'] || 'Unknown Device',
      status: 'Success'
    };

    const updates: Partial<UserSession> = {
      failedAttempts: 0,
      lockedUntil: null,
      loginHistory: [historyItem, ...(user.loginHistory || [])].slice(0, 10)
    };

    db.updateUserProfile(user.id, updates);
    activeUserId = user.id;

    db.addAuditLog({
      action: `User logged in successfully: ${user.name}`,
      user: user.name,
      role: user.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, active: user });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { firstName, lastName, username, email, phone, password, confirmPassword } = req.body;
    
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const emailLower = email.toLowerCase().trim();
    const sessions = db.getUserSessions();
    const existingEmail = sessions.find(s => s.email.toLowerCase() === emailLower);
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const existingPhone = sessions.find(s => s.phone === phone);
    if (existingPhone) {
      return res.status(400).json({ error: 'An account with this phone number already exists.' });
    }

    if (username) {
      const uLower = username.toLowerCase().trim();
      const existingUser = sessions.find(s => s.username?.toLowerCase() === uLower);
      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken by another merchant or explorer.' });
      }
    }

    const { hashPassword } = require('./src/server/db');
    const newUser = db.registerUser({
      name: `${firstName} ${lastName}`,
      username: username || `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
      email: emailLower,
      phone,
      role: 'Customer',
      password: hashPassword(password),
      isOnboarded: false,
      failedAttempts: 0,
      loginHistory: [{
        timestamp: new Date().toISOString(),
        ip: req.ip || '127.0.0.1',
        device: req.headers['user-agent'] || 'Unknown Device',
        status: 'Registered'
      }]
    });

    db.addAuditLog({
      action: `New account registered: ${emailLower}`,
      user: newUser.name,
      role: newUser.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    activeUserId = newUser.id;
    res.json({ success: true, active: newUser });
  });

  app.post('/api/auth/otp-send', (req: Request, res: Response) => {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({ error: 'Email or Phone is required.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 mins

    otpStorage.set(emailOrPhone.toLowerCase().trim(), { otp, expires });

    db.addAuditLog({
      action: `OTP simulated send for ${emailOrPhone} (Code: ${otp})`,
      user: 'System',
      role: 'Admin',
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'OTP sent successfully (Simulated)', otp });
  });

  app.post('/api/auth/otp-verify', (req: Request, res: Response) => {
    const { emailOrPhone, otp } = req.body;
    if (!emailOrPhone || !otp) {
      return res.status(400).json({ error: 'Email/Phone and OTP are required.' });
    }

    const key = emailOrPhone.toLowerCase().trim();
    const record = otpStorage.get(key);

    if (!record) {
      return res.status(400).json({ error: 'No OTP code was sent to this address.' });
    }

    if (Date.now() > record.expires) {
      return res.status(400).json({ error: 'OTP code has expired. Please request a new one.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP code.' });
    }

    otpStorage.delete(key);

    db.addAuditLog({
      action: `OTP verified successfully for ${emailOrPhone}`,
      user: 'System',
      role: 'Admin',
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true });
  });

  app.post('/api/auth/profile-complete', (req: Request, res: Response) => {
    if (!activeUserId) {
      return res.status(401).json({ error: 'No active session.' });
    }

    const { avatar, gender, birthday, preferredLanguage, currency, country, city, address } = req.body;
    const updatedUser = db.updateUserProfile(activeUserId, {
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      gender,
      birthday,
      preferredLanguage: preferredLanguage || 'English',
      currency: currency || 'USD',
      country: country || 'United States',
      city: city || 'Seattle',
      address: address || '123 Pine St'
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    db.addAuditLog({
      action: `Profile details completed: ${updatedUser.name}`,
      user: updatedUser.name,
      role: updatedUser.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, active: updatedUser });
  });

  app.post('/api/auth/interests-complete', (req: Request, res: Response) => {
    if (!activeUserId) {
      return res.status(401).json({ error: 'No active session.' });
    }

    const { interests } = req.body;
    if (!interests || !Array.isArray(interests) || interests.length < 3) {
      return res.status(400).json({ error: 'Please select at least 3 interests.' });
    }

    const updatedUser = db.updateUserProfile(activeUserId, { interests });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    db.addAuditLog({
      action: `Interests completed: ${interests.join(', ')}`,
      user: updatedUser.name,
      role: updatedUser.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, active: updatedUser });
  });

  app.post('/api/auth/permissions-complete', (req: Request, res: Response) => {
    if (!activeUserId) {
      return res.status(401).json({ error: 'No active session.' });
    }

    const { permissions } = req.body;
    const updatedUser = db.updateUserProfile(activeUserId, {
      permissions: permissions || {},
      isOnboarded: true
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    db.addAuditLog({
      action: `Permissions screen processed. App entry complete.`,
      user: updatedUser.name,
      role: updatedUser.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, active: updatedUser });
  });

  // Profile Update API Endpoint
  app.post('/api/auth/profile-update', (req: Request, res: Response) => {
    if (!activeUserId) {
      return res.status(401).json({ error: 'No active session.' });
    }

    const { 
      name, 
      username, 
      bio, 
      birthday, 
      gender, 
      preferredLanguage, 
      currency, 
      country, 
      city, 
      address, 
      timezone, 
      communicationPreferences,
      subscriptions,
      email,
      phone
    } = req.body;

    const sessions = db.getUserSessions();
    
    // Check username duplicates if username is changed
    if (username) {
      const uLower = username.toLowerCase().trim();
      const duplicate = sessions.find(s => s.id !== activeUserId && s.username?.toLowerCase() === uLower);
      if (duplicate) {
        return res.status(400).json({ error: 'Username is already taken by another merchant or explorer.' });
      }
    }

    // Check email duplicates if email is changed
    if (email) {
      const eLower = email.toLowerCase().trim();
      const duplicate = sessions.find(s => s.id !== activeUserId && s.email.toLowerCase() === eLower);
      if (duplicate) {
        return res.status(400).json({ error: 'Email address is already in use by another account.' });
      }
    }

    const updates: Partial<UserSession> = {};
    if (name !== undefined) updates.name = name;
    if (username !== undefined) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (birthday !== undefined) updates.birthday = birthday;
    if (gender !== undefined) updates.gender = gender;
    if (preferredLanguage !== undefined) updates.preferredLanguage = preferredLanguage;
    if (currency !== undefined) updates.currency = currency;
    if (country !== undefined) updates.country = country;
    if (city !== undefined) updates.city = city;
    if (address !== undefined) updates.address = address;
    if (timezone !== undefined) updates.timezone = timezone;
    if (communicationPreferences !== undefined) updates.communicationPreferences = communicationPreferences;
    if (subscriptions !== undefined) updates.subscriptions = subscriptions;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;

    const updatedUser = db.updateUserProfile(activeUserId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    db.addAuditLog({
      action: `Profile fields updated successfully: ${updatedUser.name}`,
      user: updatedUser.name,
      role: updatedUser.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, active: updatedUser });
  });

  // Security change password
  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    if (!activeUserId) {
      return res.status(401).json({ error: 'No active session.' });
    }

    const { currentPassword, newPassword } = req.body;
    const sessions = db.getUserSessions();
    const user = sessions.find(s => s.id === activeUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { hashPassword } = require('./src/server/db');
    const inputHash = hashPassword(currentPassword);

    if (user.password !== inputHash) {
      return res.status(400).json({ error: 'The current password you provided is incorrect.' });
    }

    const newHash = hashPassword(newPassword);
    db.updateUserProfile(activeUserId, { password: newHash });

    db.addAuditLog({
      action: `Password updated securely for ${user.name}`,
      user: user.name,
      role: user.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true });
  });

  // Verify 2FA configuration
  app.post('/api/auth/2fa/verify', (req: Request, res: Response) => {
    if (!activeUserId) {
      return res.status(401).json({ error: 'No active session.' });
    }

    const { enabled, type, code } = req.body;
    const sessions = db.getUserSessions();
    const user = sessions.find(s => s.id === activeUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (enabled) {
      if (!code || code !== '123456') {
        return res.status(400).json({ error: 'Invalid verification token. Please type mock code: 123456.' });
      }

      db.updateUserProfile(activeUserId, {
        is2FAEnabled: true,
        twoFactorType: type || 'authenticator'
      });

      db.addAuditLog({
        action: `Two-Factor Authentication enabled (${type}) for ${user.name}`,
        user: user.name,
        role: user.role,
        status: 'Success',
        ip: req.ip || '127.0.0.1'
      });
    } else {
      db.updateUserProfile(activeUserId, {
        is2FAEnabled: false
      });

      db.addAuditLog({
        action: `Two-Factor Authentication disabled for ${user.name}`,
        user: user.name,
        role: user.role,
        status: 'Warning',
        ip: req.ip || '127.0.0.1'
      });
    }

    res.json({ success: true, active: db.getUserSessions().find(s => s.id === activeUserId) });
  });

  // Download complete account data
  app.get('/api/auth/download-data', (req: Request, res: Response) => {
    if (!activeUserId) {
      return res.status(401).json({ error: 'No active session.' });
    }

    const sessions = db.getUserSessions();
    const user = sessions.find(s => s.id === activeUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const auditLogs = db.getAuditLogs().filter(l => l.user === user.name);

    const backupData = {
      downloadTimestamp: new Date().toISOString(),
      provider: "Ocean Enterprise Digital Platform LLC",
      userProfile: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        role: user.role,
        gender: user.gender,
        birthday: user.birthday,
        preferredLanguage: user.preferredLanguage,
        currency: user.currency,
        country: user.country,
        city: user.city,
        address: user.address,
        timezone: user.timezone,
        walletBalance: user.walletBalance,
        rewardCoins: user.rewardCoins,
        isOnboarded: user.isOnboarded,
        is2FAEnabled: user.is2FAEnabled,
        twoFactorType: user.twoFactorType,
        interests: user.interests
      },
      auditLogs: auditLogs,
      securityHistory: user.loginHistory || []
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=ocean_account_data_${user.id}.json`);
    res.json(backupData);
  });

  // Terminate account
  app.post('/api/auth/delete-account', (req: Request, res: Response) => {
    if (!activeUserId) {
      return res.status(401).json({ error: 'No active session.' });
    }

    const sessions = db.getUserSessions();
    const userIndex = sessions.findIndex(s => s.id === activeUserId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = sessions[userIndex];
    db.addAuditLog({
      action: `Account permanently deleted: ${user.name}`,
      user: 'System',
      role: 'Admin',
      status: 'Warning',
      ip: req.ip || '127.0.0.1'
    });

    sessions.splice(userIndex, 1);
    db.save();

    activeUserId = null;
    res.json({ success: true });
  });

  // Forgot password request OTP
  app.post('/api/auth/forgot-password/request', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const sessions = db.getUserSessions();
    const user = sessions.find(s => s.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }

    const otp = '999999'; // standard test OTP for password forgot
    const key = `forgot:${email.toLowerCase().trim()}`;
    otpStorage.set(key, { otp, expires: Date.now() + 10 * 60 * 1000 });

    db.addAuditLog({
      action: `Recovery OTP code generated for ${email}`,
      user: user.name,
      role: user.role,
      status: 'Warning',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, simulatedOtp: otp });
  });

  // Forgot password verify OTP
  app.post('/api/auth/forgot-password/verify', (req: Request, res: Response) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const key = `forgot:${email.toLowerCase().trim()}`;
    const record = otpStorage.get(key);
    if (!record) {
      return res.status(400).json({ error: 'Verification window expired. Please request a new code.' });
    }

    if (record.otp !== code) {
      return res.status(400).json({ error: 'Invalid verification token. Please type: 999999.' });
    }

    res.json({ success: true });
  });

  // Forgot password reset
  app.post('/api/auth/forgot-password/reset', (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const key = `forgot:${email.toLowerCase().trim()}`;
    const record = otpStorage.get(key);
    if (!record || record.otp !== code) {
      return res.status(400).json({ error: 'Verification token invalid or expired.' });
    }

    const sessions = db.getUserSessions();
    const user = sessions.find(s => s.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: 'User session not found.' });
    }

    const { hashPassword } = require('./src/server/db');
    const newHash = hashPassword(newPassword);

    db.updateUserProfile(user.id, {
      password: newHash,
      failedAttempts: 0,
      lockedUntil: null
    });

    otpStorage.delete(key);

    db.addAuditLog({
      action: `Password reset successfully via OTP recovery: ${user.name}`,
      user: user.name,
      role: user.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true });
  });

  app.post('/api/auth/guest', (req: Request, res: Response) => {
    activeUserId = 'guest';
    db.addAuditLog({
      action: 'Guest browsing session initiated',
      user: 'Guest',
      role: 'Customer',
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });
    res.json({ success: true, active: GUEST_SESSION });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const sessions = db.getUserSessions();
    const user = activeUserId === 'guest' ? GUEST_SESSION : sessions.find(s => s.id === activeUserId);
    
    db.addAuditLog({
      action: `User session ended / logged out`,
      user: user ? user.name : 'Unknown',
      role: user ? user.role : 'Customer',
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    activeUserId = null;
    res.json({ success: true });
  });

  app.post('/api/auth/switch-role', (req: Request, res: Response) => {
    const { role } = req.body;
    const session = db.getUserSessions().find(s => s.role === role);
    if (session) {
      activeUserId = session.id;
      db.addAuditLog({
        action: `User switched role to ${role} (${session.name})`,
        user: session.name,
        role: session.role,
        status: 'Success',
        ip: req.ip || '127.0.0.1'
      });
      res.json({ success: true, active: session });
    } else {
      res.status(404).json({ error: `Session user with role ${role} not found.` });
    }
  });

  app.post('/api/auth/select', (req: Request, res: Response) => {
    const { userId } = req.body;
    const session = db.getUserSessions().find(s => s.id === userId);
    if (session) {
      activeUserId = userId;
      db.addAuditLog({
        action: `User session switched to ${session.name}`,
        user: session.name,
        role: session.role,
        status: 'Success',
        ip: req.ip || '127.0.0.1'
      });
      res.json({ success: true, active: session });
    } else {
      res.status(404).json({ error: 'Session user not found.' });
    }
  });

  // Get active session wallet & coins
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const sessions = db.getUserSessions();
    const active = activeUserId === 'guest' ? GUEST_SESSION : (sessions.find(s => s.id === activeUserId) || null);
    res.json(active);
  });

  // Products endpoints
  app.get('/api/products', (req: Request, res: Response) => {
    const { q, category, brand, collection, minPrice, maxPrice, sortBy, limit, offset, paginated, deals, luxury, editorsChoice, trending, newReleases, bestSellers, seasonal, gifts } = req.query;
    let products = db.getProducts();

    if (category && category !== 'All') {
      const catLower = (category as string).toLowerCase();
      // Handle "Living Room" custom subnav categories mapping
      if (catLower === 'living room' || catLower === 'living room design') {
        products = products.filter(p => 
          p.category === 'Home' || 
          p.category === 'Home & Kitchen' ||
          p.subcategory?.toLowerCase() === 'furniture' ||
          p.subcategory?.toLowerCase() === 'decor' ||
          p.subcategory?.toLowerCase() === 'lighting' ||
          p.subcategory?.toLowerCase() === 'sofas' ||
          p.subcategory?.toLowerCase() === 'tables' ||
          p.subcategory?.toLowerCase() === 'plants' ||
          p.subcategory?.toLowerCase() === 'wall art'
        );
      } else {
        products = products.filter(p => p.category.toLowerCase() === catLower);
      }
    }

    if (brand) {
      const brandLower = (brand as string).toLowerCase();
      products = products.filter(p => p.brand.toLowerCase() === brandLower);
    }

    if (collection) {
      const collLower = (collection as string).toLowerCase();
      products = products.filter(p => 
        ((p as any).collection && (p as any).collection.toLowerCase().includes(collLower)) ||
        (collLower === 'sustainable' && (
          (p as any).collection?.toLowerCase().includes('eco') || 
          (p as any).collection?.toLowerCase().includes('sustainable') ||
          p.description.toLowerCase().includes('eco-friendly') || 
          p.description.toLowerCase().includes('organic') ||
          p.description.toLowerCase().includes('sustainable')
        )) ||
        (collLower === 'minimal-workspace' && (p.category === 'Accessories' || p.category === 'Laptops' || p.subcategory?.toLowerCase() === 'audio'))
      );
    }

    if (minPrice) {
      const min = parseFloat(minPrice as string);
      products = products.filter(p => p.price >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      products = products.filter(p => p.price <= max);
    }

    if (q) {
      products = products.filter(p => matchesSearch(p, q as string));
    }

    if (deals === 'true') {
      products = products.filter(p => p.price > 40);
    }

    if (luxury === 'true') {
      products = products.filter(p => p.price > 500 || ['rolex', 'omega', 'gucci', 'prada', 'louis vuitton', 'leica', 'bose', 'apple'].includes(p.brand.toLowerCase()));
    }

    if (editorsChoice === 'true') {
      products = products.filter(p => p.rating >= 4.7);
    }

    if (seasonal === 'true') {
      products = products.filter(p => p.description.toLowerCase().includes('seasonal') || p.description.toLowerCase().includes('summer') || p.description.toLowerCase().includes('winter') || p.description.toLowerCase().includes('spring') || p.description.toLowerCase().includes('autumn'));
    }

    if (gifts === 'true') {
      products = products.filter(p => p.description.toLowerCase().includes('gift') || p.description.toLowerCase().includes('present'));
    }

    // Apply Sorting
    let activeSortBy = sortBy;
    if (trending === 'true' && !sortBy) activeSortBy = 'rating';
    if (newReleases === 'true' && !sortBy) activeSortBy = 'newest';
    if (bestSellers === 'true' && !sortBy) activeSortBy = 'popularity';

    if (activeSortBy === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (activeSortBy === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (activeSortBy === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (activeSortBy === 'popularity') {
      products.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (activeSortBy === 'newest') {
      products.sort((a, b) => b.id.localeCompare(a.id));
    }

    const total = products.length;

    // Apply Pagination
    if (limit) {
      const lim = parseInt(limit as string);
      const off = offset ? parseInt(offset as string) : 0;
      products = products.slice(off, off + lim);
    }

    if (paginated === 'true') {
      res.json({
        items: products,
        total
      });
    } else {
      res.json(products);
    }
  });

  // Homepage curated discovery endpoint (only returns 80-150 products across sections)
  app.get('/api/homepage-discovery', (req: Request, res: Response) => {
    const products = db.getProducts();

    const heroBanners = [
      {
        id: 'banner-1',
        title: 'The Next-Gen Audio Drop',
        subtitle: 'Immersive Active Noise Cancellation and high-fidelity soundscapes.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
        cta: 'Explore Acoustics',
        path: '/category/Electronics'
      },
      {
        id: 'banner-2',
        title: 'Minimalist Wardrobe',
        subtitle: 'Tailored garments crafted with natural, breathable fibers.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80',
        cta: 'View Apparel',
        path: '/category/Fashion Men'
      },
      {
        id: 'banner-3',
        title: 'Living Space Aesthetics',
        subtitle: 'Architectural home accessories designed for modern living.',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=80',
        cta: 'Shop Collection',
        path: '/home'
      }
    ];

    // Featured: first 12 items
    const featuredProducts = products.slice(0, 12);

    // 1. New Releases (12 newest products, or first 12 in the list)
    const newReleases = [...products]
      .filter(p => p.rating && p.stock > 0)
      .slice(0, 12);

    // 2. Best Sellers (12 highest rating or reviewsCount products)
    const bestSellers = [...products]
      .filter(p => p.rating >= 4.5 && p.stock > 0)
      .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
      .slice(0, 12);

    // 3. Trending Today (sorted by reviews count or rating)
    const trending = [...products]
      .filter(p => p.stock > 0)
      .sort((a, b) => {
        return (b.rating * (b.reviewsCount || 1)) - (a.rating * (a.reviewsCount || 1));
      })
      .slice(0, 12);

    // 4. Deals of the Day (discounted products with fake limited stock & countdown context)
    const deals = [...products]
      .filter(p => p.price > 40 && p.stock > 0)
      .slice(15, 27)
      .map((p, i) => ({
        ...p,
        originalPrice: Math.round(p.price * 1.3),
        discountPercent: 15 + (i * 3) % 25,
        limitedStock: p.stock > 6 ? 3 : p.stock
      }));

    // 5. Luxury Collection (Rolex, Omega, high price products)
    const luxury = [...products]
      .filter(p => p.price > 700 || ['rolex', 'omega', 'gucci', 'prada', 'louis vuitton', 'leica', 'bose', 'apple'].includes(p.brand.toLowerCase()))
      .slice(0, 12);

    // Collections
    const collections = [
      { id: 'sustainable', name: 'Sustainable Materials', description: 'Eco-friendly, recycled, and organic designs.', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80' },
      { id: 'minimal-workspace', name: 'Minimalist Workspaces', description: 'High-efficiency setups for deep focus.', image: 'https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=800&auto=format&fit=crop&q=80' }
    ];

    // Brands
    const brands = [
      { name: 'Sony Direct Store', logo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&auto=format&fit=crop&q=80', path: '/brand/Sony' },
      { name: 'Apple Certified Store', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format&fit=crop&q=80', path: '/brand/Sony' },
      { name: 'Nike Store Front', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=80', path: '/brand/Nike' },
      { name: 'Aesop Direct Store', logo: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=100&auto=format&fit=crop&q=80', path: '/brand/Sony' }
    ];

    // Recently Viewed
    const recentlyViewed = products.filter(p => ['prod-1', 'prod-2', 'prod-5'].includes(p.id));

    // Recommended
    const recommended = products.slice(4, 16);

    // Flash Sale
    const flashSale = products.slice(8, 14).map((p, i) => ({
      ...p,
      originalPrice: Math.round(p.price * 1.4),
      discountPercent: 25 + (i * 4) % 25,
      limitedStock: Math.max(1, p.stock % 4)
    }));

    // New arrivals
    const newArrivals = [...products]
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 12);

    // 6. Curated Category Sections (12 items each)
    const electronics = products.filter(p => p.category === 'Electronics').slice(0, 12);
    const fashion = products.filter(p => p.category === 'Fashion Men' || p.category === 'Fashion Women').slice(0, 12);
    const homeKitchen = products.filter(p => p.category === 'Home & Kitchen' || p.category === 'Home').slice(0, 12);
    const gaming = products.filter(p => p.category === 'Laptops' || p.subcategory?.toLowerCase() === 'gaming').slice(0, 12);
    const beauty = products.filter(p => p.category === 'Beauty').slice(0, 12);
    const books = products.filter(p => p.category === 'Books').slice(0, 12);
    const toys = products.filter(p => p.category === 'Toys').slice(0, 12);
    const sports = products.filter(p => p.category === 'Sports').slice(0, 12);

    res.json({
      heroBanners,
      featuredProducts,
      newReleases,
      bestSellers,
      trending,
      deals,
      luxury,
      electronics,
      fashion,
      homeKitchen,
      gaming,
      beauty,
      books,
      toys,
      sports,
      collections,
      brands,
      recentlyViewed,
      recommended,
      flashSale,
      newArrivals
    });
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const activeUser = db.getUserSessions().find(s => s.id === activeUserId);
    if (!activeUser || (activeUser.role !== 'Seller' && activeUser.role !== 'Admin')) {
      return res.status(403).json({ error: 'Forbidden. Only sellers/admins can list products.' });
    }

    const { name, price, description, category, subcategory, stock, brand, variants, specifications } = req.body;

    if (!name || !price || !description || !category || !brand) {
      return res.status(400).json({ error: 'Missing mandatory fields.' });
    }

    const newProd = {
      id: `prod-${Date.now()}`,
      name,
      price: parseFloat(price),
      description,
      category,
      subcategory: subcategory || 'General',
      stock: parseInt(stock) || 10,
      brand,
      image: req.body.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      variants: variants || { colors: ['Default'], sizes: ['Standard'] },
      specifications: specifications || {},
      sellerId: activeUser.id,
      reviewsCount: 0,
      rating: 5.0
    };

    db.addProduct(newProd);
    db.addAuditLog({
      action: `Product listed: ${name}`,
      user: activeUser.name,
      role: activeUser.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, product: newProd });
  });

  app.put('/api/products/:id/stock', (req: Request, res: Response) => {
    const activeUser = db.getUserSessions().find(s => s.id === activeUserId);
    if (!activeUser || !['Seller', 'Admin', 'Warehouse'].includes(activeUser.role)) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({ error: 'Stock count required.' });
    }

    db.updateProductStock(id, parseInt(stock));
    const prod = db.getProducts().find(p => p.id === id);

    db.addAuditLog({
      action: `Adjusted stock for ${prod?.name || id} to ${stock}`,
      user: activeUser.name,
      role: activeUser.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, stock });
  });

  // Get and Post Reviews
  app.get('/api/products/:productId/reviews', (req: Request, res: Response) => {
    const { productId } = req.params;
    const reviews = db.getReviews().filter(r => r.productId === productId);
    res.json(reviews);
  });

  app.post('/api/products/:productId/reviews', async (req: Request, res: Response) => {
    const activeUser = db.getUserSessions().find(s => s.id === activeUserId);
    if (!activeUser) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required.' });
    }

    // AI Check for fake/spam reviews!
    const aiCheck = await checkReviewValidity(comment, parseInt(rating));

    const newReview = {
      id: `rev-${Date.now()}`,
      productId,
      userName: activeUser.name,
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      rating: parseInt(rating),
      comment,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      sentiment: rating >= 4 ? 'positive' as const : (rating <= 2 ? 'negative' as const : 'neutral' as const),
      isFake: aiCheck.isFake
    };

    db.addReview(newReview);

    // Add security audit log if fraud is flagged
    if (aiCheck.isFake) {
      db.addAuditLog({
        action: `Fraud review blocked/flagged for product ${productId}. Confidence: ${aiCheck.confidence}%`,
        user: activeUser.name,
        role: activeUser.role,
        status: 'Alert',
        ip: req.ip || '127.0.0.1'
      });
    } else {
      db.addAuditLog({
        action: `Submitted review for product ID ${productId}`,
        user: activeUser.name,
        role: activeUser.role,
        status: 'Success',
        ip: req.ip || '127.0.0.1'
      });
    }

    res.status(201).json({ 
      success: true, 
      review: newReview,
      aiFeedback: aiCheck
    });
  });

  // Orders & checkout
  app.get('/api/orders', (req: Request, res: Response) => {
    const activeUser = db.getUserSessions().find(s => s.id === activeUserId);
    if (!activeUser) {
      return res.json([]);
    }

    let orders = db.getOrders();
    if (activeUser.role === 'Customer') {
      orders = orders.filter(o => o.userId === activeUser.id);
    }
    // Sellers, Admins, Warehouse, and Delivery see all orders for orchestration
    res.json(orders);
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const activeUser = db.getUserSessions().find(s => s.id === activeUserId);
    if (!activeUser || activeUser.role !== 'Customer') {
      return res.status(403).json({ error: 'Only customers can checkout.' });
    }

    const { items, total, shippingAddress } = req.body;

    if (!items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ error: 'Missing order parameters.' });
    }

    // Check balance / deduct
    if (activeUser.walletBalance < total) {
      db.addAuditLog({
        action: `Payment declined: Insufficient account balance ($${activeUser.walletBalance} available for $${total} order)`,
        user: activeUser.name,
        role: activeUser.role,
        status: 'Warning',
        ip: req.ip || '127.0.0.1'
      });
      return res.status(400).json({ error: 'Insufficient account or gift card balance. Please top up your balance or use another payment method.' });
    }

    // Deduct wallet and reward 5% coins
    const coinsEarned = Math.floor(total * 0.05);
    db.updateUserWallet(activeUser.id, -total, coinsEarned);

    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: activeUser.id,
      items,
      total,
      status: 'Confirmed',
      timeline: [
        { status: 'Pending', timestamp: new Date().toISOString(), description: 'Order created.' },
        { status: 'Confirmed', timestamp: new Date().toISOString(), description: 'Payment captured securely.' }
      ],
      shippingAddress,
      createdAt: new Date().toISOString()
    };

    db.addOrder(newOrder);
    db.addAuditLog({
      action: `Order placed successfully: ${newOrder.id} ($${total})`,
      user: activeUser.name,
      role: activeUser.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, order: newOrder });
  });

  // Update order status (CRM/Warehouse/Delivery orchestration)
  app.put('/api/orders/:id/status', (req: Request, res: Response) => {
    const activeUser = db.getUserSessions().find(s => s.id === activeUserId);
    if (!activeUser || !['Admin', 'Warehouse', 'Delivery', 'Seller'].includes(activeUser.role)) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const { id } = req.params;
    const { status, description } = req.body;

    if (!status || !description) {
      return res.status(400).json({ error: 'Status and description required.' });
    }

    db.updateOrderStatus(id, status, description);
    res.json({ success: true, status, description });
  });

  // Coupons
  app.get('/api/coupons', (req: Request, res: Response) => {
    res.json(db.getCoupons());
  });

  // Logs
  app.get('/api/logs', (req: Request, res: Response) => {
    const activeUser = db.getUserSessions().find(s => s.id === activeUserId);
    if (!activeUser || activeUser.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden. Admin credentials required.' });
    }
    res.json(db.getAuditLogs());
  });

  // --- AI ENDPOINTS ---

  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const { history, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message query required.' });
    }

    try {
      const activeUser = db.getUserSessions().find(s => s.id === activeUserId) || (activeUserId === 'guest' ? GUEST_SESSION : null);
      const userPrefs = activeUser ? {
        country: activeUser.country || 'United States',
        language: activeUser.language || activeUser.preferredLanguage || 'English',
        currency: activeUser.currency || 'USD',
        timezone: activeUser.timezone || 'UTC'
      } : undefined;

      const response = await getShoppingAssistantResponse(history || [], message, userPrefs);
      res.json({ text: response });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'AI Chat failed.' });
    }
  });

  // --- GLOBAL PREFERENCES ENDPOINTS ---

  app.get('/api/preferences', (req: Request, res: Response) => {
    const sessions = db.getUserSessions();
    const active = activeUserId === 'guest' ? GUEST_SESSION : (sessions.find(s => s.id === activeUserId) || null);
    if (!active) {
      return res.json({
        country: 'United States',
        language: 'English',
        currency: 'USD',
        timezone: 'UTC',
        units: 'Imperial',
        dateFormat: 'MM/DD/YYYY',
        theme: 'Light'
      });
    }
    res.json({
      country: active.country || 'United States',
      language: active.language || active.preferredLanguage || 'English',
      currency: active.currency || 'USD',
      timezone: active.timezone || 'UTC',
      units: (active as any).units || 'Imperial',
      dateFormat: (active as any).dateFormat || 'MM/DD/YYYY',
      theme: (active as any).theme || 'Light'
    });
  });

  app.put('/api/preferences', (req: Request, res: Response) => {
    const { country, language, currency, timezone, units, dateFormat, theme } = req.body;
    
    if (activeUserId && activeUserId !== 'guest') {
      const updates: any = {};
      if (country !== undefined) updates.country = country;
      if (language !== undefined) {
        updates.language = language;
        updates.preferredLanguage = language;
      }
      if (currency !== undefined) updates.currency = currency;
      if (timezone !== undefined) updates.timezone = timezone;
      if (units !== undefined) updates.units = units;
      if (dateFormat !== undefined) updates.dateFormat = dateFormat;
      if (theme !== undefined) updates.theme = theme;

      const updatedUser = db.updateUserProfile(activeUserId, updates);
      if (updatedUser) {
        db.addAuditLog({
          action: `Global Preferences updated: Country=${country || updatedUser.country}, Currency=${currency || updatedUser.currency}`,
          user: updatedUser.name,
          role: updatedUser.role,
          status: 'Success',
          ip: req.ip || '127.0.0.1'
        });
        return res.json({ success: true, preferences: updates, user: updatedUser });
      }
    } else {
      if (activeUserId === 'guest') {
        if (country !== undefined) GUEST_SESSION.country = country;
        if (language !== undefined) GUEST_SESSION.language = language;
        if (currency !== undefined) GUEST_SESSION.currency = currency;
        if (timezone !== undefined) GUEST_SESSION.timezone = timezone;
        if (units !== undefined) (GUEST_SESSION as any).units = units;
        if (dateFormat !== undefined) (GUEST_SESSION as any).dateFormat = dateFormat;
        if (theme !== undefined) (GUEST_SESSION as any).theme = theme;
      }
      return res.json({ 
        success: true, 
        preferences: { 
          country: country || GUEST_SESSION.country, 
          language: language || GUEST_SESSION.language, 
          currency: currency || GUEST_SESSION.currency, 
          timezone: timezone || GUEST_SESSION.timezone,
          units: units || (GUEST_SESSION as any).units || 'Imperial',
          dateFormat: dateFormat || (GUEST_SESSION as any).dateFormat || 'MM/DD/YYYY',
          theme: theme || (GUEST_SESSION as any).theme || 'Light'
        } 
      });
    }
    res.status(401).json({ error: 'No active session.' });
  });

  app.get('/api/currencies', (req: Request, res: Response) => {
    res.json(CURRENCIES);
  });

  app.get('/api/languages', (req: Request, res: Response) => {
    res.json(LANGUAGES);
  });

  app.get('/api/countries', (req: Request, res: Response) => {
    res.json(COUNTRIES);
  });

  app.get('/api/timezones', (req: Request, res: Response) => {
    res.json(TIMEZONES);
  });

  app.get('/api/exchange-rates', (req: Request, res: Response) => {
    const rates: Record<string, number> = {};
    CURRENCIES.forEach(c => {
      rates[c.code] = c.rate;
    });
    res.json(rates);
  });

  app.get('/api/ai/reviews-summary/:productId', async (req: Request, res: Response) => {
    const { productId } = req.params;
    try {
      const summary = await getReviewSummary(productId);
      res.json(summary);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'AI Summary failed.' });
    }
  });

  app.post('/api/ai/generate-desc', async (req: Request, res: Response) => {
    const { name, brand, category, specs } = req.body;
    if (!name || !brand || !category) {
      return res.status(400).json({ error: 'Missing parameters for AI text generation.' });
    }

    try {
      const desc = await generateProductDescription({ name, brand, category, specs: specs || '' });
      res.json({ description: desc });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'AI description generator failed.' });
    }
  });

  // Add credits/wallet funds
  app.post('/api/auth/add-funds', (req: Request, res: Response) => {
    const activeUser = db.getUserSessions().find(s => s.id === activeUserId);
    if (!activeUser) {
      return res.status(401).json({ error: 'No active session.' });
    }

    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid deposit amount required.' });
    }

    db.updateUserWallet(activeUser.id, parseFloat(amount), 50); // Gives 50 free coins as loyalty bonus!
    db.addAuditLog({
      action: `Wallet credited with $${amount} (Stripe Verified Simulation)`,
      user: activeUser.name,
      role: activeUser.role,
      status: 'Success',
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, balance: activeUser.walletBalance + parseFloat(amount) });
  });

  // Vite Integration in Development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ocean] Premium server successfully active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error('[Ocean Server Panic]:', e);
});
