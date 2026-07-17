import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Phone, 
  ArrowRight, 
  Upload, 
  User, 
  Globe, 
  DollarSign, 
  Check, 
  CheckCircle2, 
  MapPin, 
  Bell, 
  Camera, 
  Mic, 
  Calendar, 
  Sparkles, 
  Shield, 
  X, 
  RefreshCw,
  ChevronRight,
  Info,
  Smartphone,
  Cpu,
  Bookmark,
  Coffee,
  Heart,
  Palette,
  Compass,
  Zap,
  Music,
  Gamepad2,
  ChevronLeft,
  Github,
  Chrome
} from 'lucide-react';
import { UserSession } from '../types';

interface AuthWizardProps {
  onAuthSuccess: (user: UserSession) => void;
  initialStep?: 'splash' | 'login' | 'register' | 'otp' | 'profile' | 'interests' | 'permissions';
  isModal?: boolean;
  onClose?: () => void;
}

export default function AuthWizard({ onAuthSuccess, initialStep = 'splash', isModal = false, onClose }: AuthWizardProps) {
  const [step, setStep] = useState<string>(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Splash states
  const [splashFinished, setSplashFinished] = useState(false);

  // Session user details tracker
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Personalization flow states
  const [loadingMessage, setLoadingMessage] = useState('Constructing personalized boutique...');
  const [lastOrderStatus, setLastOrderStatus] = useState('Loading...');

  const startPersonalizationFlow = (user: UserSession) => {
    setCurrentUser(user);
    setStep('loading-personalization');
  };

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration Form States
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAcceptTerms, setRegAcceptTerms] = useState(false);
  const [regNewsletter, setRegNewsletter] = useState(false);

  // OTP Verification States
  const [otpTarget, setOtpTarget] = useState(''); // email or phone
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpExpiry, setOtpExpiry] = useState(60);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Profile Details States
  const [selectedAvatar, setSelectedAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  const [profileGender, setProfileGender] = useState('unspecified');
  const [profileBirthday, setProfileBirthday] = useState('');
  const [profileLanguage, setProfileLanguage] = useState('English');
  const [profileCurrency, setProfileCurrency] = useState('USD');
  const [profileCountry, setProfileCountry] = useState('United States');
  const [profileCity, setProfileCity] = useState('');
  const [profileAddress, setProfileAddress] = useState('');

  // Interest Selection States
  const availableInterests = [
    { id: 'Electronics', label: 'Electronics', icon: Cpu, desc: 'Phones, laptops, accessories', bg: 'bg-blue-50 text-blue-600 border-blue-100' },
    { id: 'Fashion', label: 'Fashion', icon: Shield, desc: 'Apparel, shoes, accessories', bg: 'bg-pink-50 text-pink-600 border-pink-100' },
    { id: 'Gaming', label: 'Gaming', icon: Gamepad2, desc: 'Consoles, games, headsets', bg: 'bg-purple-50 text-purple-600 border-purple-100' },
    { id: 'Books', label: 'Books & Read', icon: Bookmark, desc: 'Literature, self-help, educational', bg: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 'Beauty', label: 'Beauty & Care', icon: Heart, desc: 'Skincare, cosmetics, perfume', bg: 'bg-rose-50 text-rose-600 border-rose-100' },
    { id: 'Fitness', label: 'Sports & Fitness', icon: Zap, desc: 'Activewear, equipment, logs', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 'Luxury', label: 'Luxury Collections', icon: Sparkles, desc: 'Premium luxury and designer wear', bg: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
    { id: 'Home', label: 'Home Decor', icon: Coffee, desc: 'Furniture, rugs, styling', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { id: 'Kitchen', label: 'Kitchen & Dining', icon: Palette, desc: 'Cookware, gadgets, dining', bg: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    { id: 'Music', label: 'Music & Audio', icon: Music, desc: 'Instruments, speakers, vinyls', bg: 'bg-red-50 text-red-600 border-red-100' }
  ];
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Permissions States
  const [permLocation, setPermLocation] = useState(false);
  const [permNotifications, setPermNotifications] = useState(false);
  const [permCamera, setPermCamera] = useState(false);
  const [permMicrophone, setPermMicrophone] = useState(false);

  // Extra registration & Forgot Password States
  const [regUsername, setRegUsername] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  
  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotSimOtp, setForgotSimOtp] = useState<string | null>(null);
  const [forgotExpiry, setForgotExpiry] = useState(60);

  // Avatar Options
  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  ];

  // 1. Splash check & initialization
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setSplashFinished(true);
        // Check session
        fetch('/api/auth/session')
          .then(res => res.json())
          .then(data => {
            if (data && data.id) {
              setCurrentUser(data);
              if (data.isOnboarded) {
                onAuthSuccess(data);
              } else {
                // Determine which onboarding step is next
                if (!data.avatar || !data.city) {
                  setStep('profile');
                } else if (!data.interests || data.interests.length < 3) {
                  setStep('interests');
                } else {
                  setStep('permissions');
                }
              }
            } else {
              setStep('login');
            }
          })
          .catch(() => {
            setStep('login');
          });
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // OTP Countdown timer
  useEffect(() => {
    if (step === 'otp' && otpExpiry > 0) {
      const timer = setInterval(() => {
        setOtpExpiry(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, otpExpiry]);

  // Forgot OTP Countdown timer
  useEffect(() => {
    if (step === 'forgot-password-otp' && forgotExpiry > 0) {
      const timer = setInterval(() => {
        setForgotExpiry(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, forgotExpiry]);

  // Loading Personalization cycling messages
  useEffect(() => {
    if (step === 'loading-personalization') {
      const msgs = [
        'Constructing personalized boutique...',
        'Curating active brand opportunities...',
        'Aligning prime shipping channels...',
        'Fine-tuning custom search indexes...'
      ];
      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        if (idx < msgs.length) {
          setLoadingMessage(msgs[idx]);
        }
      }, 500);

      const timer = setTimeout(() => {
        setStep('welcome-back');
      }, 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [step]);

  // Welcome back state transitions
  useEffect(() => {
    if (step === 'welcome-back' && currentUser) {
      // Fetch user orders to display real last order status
      fetch('/api/orders')
        .then(res => res.json())
        .then(orders => {
          if (orders && orders.length > 0) {
            const sorted = [...orders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setLastOrderStatus(sorted[0].status);
          } else {
            setLastOrderStatus('No active orders');
          }
        })
        .catch(() => {
          setLastOrderStatus('No recent purchases');
        });

      // Automatic smooth transition to home after 3.5 seconds
      const transitionTimer = setTimeout(() => {
        onAuthSuccess(currentUser);
      }, 3500);

      return () => clearTimeout(transitionTimer);
    }
  }, [step, currentUser]);

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please provide both your email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, rememberMe })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      setCurrentUser(data.active);

      // Trigger standard email OTP simulation for security
      sendSimulatedOtp(data.active.email);
    } catch (err) {
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Handle registration submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regFirstName || !regLastName || !regEmail || !regPhone || !regPassword || !regConfirmPassword) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!regAcceptTerms) {
      setError('You must accept the Ocean Terms of Service and Privacy Policy to create an account.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          confirmPassword: regConfirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed. Email or phone may already be registered.');
        setLoading(false);
        return;
      }

      setCurrentUser(data.active);
      // Success, go to OTP verification
      sendSimulatedOtp(regPhone);
    } catch (err) {
      setError('Could not connect to registration server.');
      setLoading(false);
    }
  };

  // Send Simulated OTP helper
  const sendSimulatedOtp = async (target: string) => {
    setLoading(true);
    setOtpTarget(target);
    try {
      const res = await fetch('/api/auth/otp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: target })
      });
      const data = await res.json();
      if (res.ok) {
        setSimulatedOtp(data.otp);
        setOtpCode(['', '', '', '', '', '']);
        setOtpExpiry(60);
        setStep('otp');
        setInfoMessage(`We have simulated sending a secure 6-digit OTP code to ${target}.`);
      } else {
        setError('Failed to transmit security OTP code.');
      }
    } catch (e) {
      setError('Network transmission of security code failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP keying
  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newCode = [...otpCode];
    newCode[index] = val.slice(-1);
    setOtpCode(newCode);

    // Auto focus next
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: otpTarget, otp: code })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Incorrect security code. Please review and try again.');
        setLoading(false);
        return;
      }

      setSimulatedOtp(null);
      setInfoMessage(null);

      // Check if user is already onboarded
      if (currentUser && currentUser.isOnboarded) {
        startPersonalizationFlow(currentUser);
      } else {
        setStep('profile');
      }
    } catch (e) {
      setError('Validation service failed. Please check internet access.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Profile Completion
  const handleProfileComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/profile-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar: selectedAvatar,
          gender: profileGender,
          birthday: profileBirthday,
          preferredLanguage: profileLanguage,
          currency: profileCurrency,
          country: profileCountry,
          city: profileCity,
          address: profileAddress
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to complete profile details.');
        setLoading(false);
        return;
      }

      setCurrentUser(data.active);
      setStep('interests');
    } catch (err) {
      setError('Failed to update server profile.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Interest select
  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Submit Interest Onboarding
  const handleInterestsComplete = async () => {
    if (selectedInterests.length < 3) {
      setError('Please select at least 3 categories to personalize your feed.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/interests-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: selectedInterests })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save selected interests.');
        setLoading(false);
        return;
      }

      setCurrentUser(data.active);
      setStep('permissions');
    } catch (e) {
      setError('Error uploading selected topics.');
    } finally {
      setLoading(false);
    }
  };

  // Request real or simulated browser APIs
  const handleTogglePermission = async (type: 'location' | 'notifications' | 'camera' | 'microphone') => {
    if (type === 'location') {
      setPermLocation(p => !p);
      if (!permLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(() => {}, () => {});
      }
    } else if (type === 'notifications') {
      setPermNotifications(p => !p);
      if (!permNotifications && 'Notification' in window) {
        Notification.requestPermission();
      }
    } else if (type === 'camera') {
      setPermCamera(p => !p);
      if (!permCamera) {
        navigator.mediaDevices?.getUserMedia({ video: true }).catch(() => {});
      }
    } else if (type === 'microphone') {
      setPermMicrophone(p => !p);
      if (!permMicrophone) {
        navigator.mediaDevices?.getUserMedia({ audio: true }).catch(() => {});
      }
    }
  };

  // Complete onboarding
  const handlePermissionsComplete = async (skip = false) => {
    setLoading(true);
    setError(null);

    const permissionsPayload = skip ? {} : {
      location: permLocation,
      notifications: permNotifications,
      camera: permCamera,
      microphone: permMicrophone
    };

    try {
      const res = await fetch('/api/auth/permissions-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: permissionsPayload })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to finalize your permission settings.');
        setLoading(false);
        return;
      }

      startPersonalizationFlow(data.active);
    } catch (e) {
      setError('Could not establish persistent onboarding validation.');
    } finally {
      setLoading(false);
    }
  };

  // Guest Browsing mode
  const handleGuestBrowsing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        onAuthSuccess(data.active);
      } else {
        setError('Could not connect guest browsing node.');
      }
    } catch (e) {
      setError('Network block starting guest mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`font-sans flex items-center justify-center p-4 relative ${
      isModal 
        ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto' 
        : 'min-h-screen bg-slate-50 overflow-hidden'
    }`}>
      {/* Visual background gradient accents for "Silent Luxury" atmosphere */}
      {!isModal && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-slate-100 blur-[120px] opacity-80" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-100 blur-[120px] opacity-80" />
        </div>
      )}

      <div id="auth-wizard-container" className={`w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100/40 relative overflow-hidden transition-all duration-300 z-10 ${isModal ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
        
        {isModal && onClose && (
          <button 
            id="close-auth-modal"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <AnimatePresence mode="wait">
          
          {/* STEP 1: SPLASH SCREEN */}
          {step === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 px-8 flex flex-col items-center justify-center min-h-[420px] text-center"
            >
              <div className="relative mb-6">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 4, 
                    ease: "easeInOut" 
                  }}
                  className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20"
                >
                  <ShoppingBag className="w-10 h-10 text-white" />
                </motion.div>
                {/* Simulated luxury wave ripple */}
                <div className="absolute inset-0 border-2 border-slate-900 rounded-2xl scale-125 animate-ping opacity-15" />
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 mb-2">OCEAN</h1>
              <p className="text-sm font-medium tracking-wide text-slate-400 uppercase">Premium Enterprise Marketplace</p>

              <div className="mt-12 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          {/* STEP 2: LOGIN */}
          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="p-8 md:p-10"
            >
              <div className="flex flex-col items-center mb-8 text-center">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-slate-900">Welcome Back</h2>
                <p className="text-sm text-slate-500 mt-1">Access your personalized enterprise account</p>
              </div>

              {error && (
                <div id="login-error-alert" className="p-4 mb-6 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email Field */}
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all placeholder:text-slate-400"
                  />
                  <label className="absolute left-11 -top-2.5 px-1 bg-white text-[10px] font-semibold text-slate-500 rounded pointer-events-none transition-all">Email Address</label>
                </div>

                {/* Password Field */}
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-sm outline-none transition-all placeholder:text-slate-400"
                  />
                  <label className="absolute left-11 -top-2.5 px-1 bg-white text-[10px] font-semibold text-slate-500 rounded pointer-events-none transition-all">Password</label>
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    Remember Me
                  </label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setError(null);
                      setInfoMessage('If you are standard Vicky, use email "vicky.b1902@gmail.com" and password "ocean123" to login!');
                    }} 
                    className="text-slate-900 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {infoMessage && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{infoMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3.5 rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* OR Divider */}
              <div className="relative my-7 text-center">
                <hr className="border-slate-200" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-white text-[10px] font-bold text-slate-400 tracking-wider uppercase">or sign in with</span>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={handleGuestBrowsing}
                  className="flex items-center justify-center gap-2 border border-slate-200/80 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  <Chrome className="w-4 h-4 text-rose-500" />
                  Google
                </button>
                <button 
                  onClick={handleGuestBrowsing}
                  className="flex items-center justify-center gap-2 border border-slate-200/80 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-900" />
                  Apple ID
                </button>
                <button 
                  onClick={handleGuestBrowsing}
                  className="flex items-center justify-center gap-2 border border-slate-200/80 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  <Github className="w-4 h-4 text-slate-800" />
                  GitHub
                </button>
                <button 
                  onClick={() => {
                    setError(null);
                    setInfoMessage('To register with a Phone Number, please click "Create Account" below!');
                  }}
                  className="flex items-center justify-center gap-2 border border-slate-200/80 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Phone
                </button>
              </div>

              <div className="flex flex-col gap-3.5 text-center mt-6">
                <button
                  onClick={() => {
                    setError(null);
                    setInfoMessage(null);
                    setStep('register');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                >
                  Don't have an account? <span className="text-slate-900 underline">Create Account</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuestBrowsing}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 tracking-wide transition-all cursor-pointer bg-indigo-50 hover:bg-indigo-100 py-3 rounded-xl border border-indigo-100/50"
                >
                  Explore as Guest (Immediate Access)
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: REGISTRATION */}
          {step === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="p-8 md:p-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <button 
                  onClick={() => { setError(null); setStep('login'); }}
                  className="p-2 border border-slate-200/80 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">Create Account</h2>
                  <p className="text-xs text-slate-500">Join Ocean premier marketplace</p>
                </div>
              </div>

              {error && (
                <div className="p-4 mb-5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* First Name */}
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs font-medium outline-none"
                    />
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">First Name</label>
                  </div>
                  {/* Last Name */}
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs font-medium outline-none"
                    />
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Last Name</label>
                  </div>
                </div>

                {/* Email Address */}
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs font-medium outline-none"
                  />
                  <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Email Address</label>
                </div>

                {/* Phone Number */}
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs font-medium outline-none"
                  />
                  <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Mobile Phone</label>
                </div>

                {/* Password */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs font-medium outline-none"
                    />
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs font-medium outline-none"
                    />
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Confirm Password</label>
                  </div>
                </div>

                {/* Accept Terms */}
                <div className="space-y-2 mt-2">
                  <label className="flex items-start gap-2.5 text-[11px] font-semibold text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={regAcceptTerms}
                      onChange={(e) => setRegAcceptTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span>I accept the Ocean <span className="text-slate-900 underline">Terms of Service</span> and consent to data storage on our database.</span>
                  </label>

                  <label className="flex items-start gap-2.5 text-[11px] font-semibold text-slate-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={regNewsletter}
                      onChange={(e) => setRegNewsletter(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-900"
                    />
                    <span>Receive notifications about personalized seasonal deals and catalog releases.</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/15 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: OTP VERIFICATION */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-8 md:p-10 text-center"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                <Smartphone className="w-6 h-6 text-slate-900" />
              </div>

              <h2 className="font-display text-2xl font-semibold text-slate-900 mb-1.5">Verify Identity</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Enter the 6-digit authentication code sent to <span className="font-semibold text-slate-800">{otpTarget}</span>
              </p>

              {error && (
                <div className="p-4 mb-5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 text-left flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Secure simulated SMS notification */}
              {simulatedOtp && (
                <div id="simulated-otp-banner" className="mb-6 p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-700 flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider text-indigo-500">
                    <Shield className="w-3.5 h-3.5" />
                    Simulated Carrier Broadcast
                  </div>
                  <div className="text-slate-600">
                    Use security passcode: <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-indigo-200/50">{simulatedOtp}</span>
                  </div>
                </div>
              )}

              {/* OTP Input grid */}
              <div className="flex justify-center gap-2.5 mb-6">
                {otpCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold bg-slate-50 border border-slate-200/80 focus:border-slate-900 focus:bg-white rounded-xl outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Verification'}
              </button>

              <div className="mt-6 text-xs">
                {otpExpiry > 0 ? (
                  <span className="text-slate-400 font-medium">Resend validation code in <span className="text-slate-700 font-bold">{otpExpiry}s</span></span>
                ) : (
                  <button
                    onClick={() => sendSimulatedOtp(otpTarget)}
                    className="text-slate-900 hover:underline font-semibold cursor-pointer"
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 5: PROFILE COMPLETION */}
          {step === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-8 md:p-10"
            >
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-slate-900">Personalize Profile</h2>
                <p className="text-xs text-slate-500">Provide account specifics for an tailored experience</p>
              </div>

              {error && (
                <div className="p-4 mb-5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleProfileComplete} className="space-y-4">
                {/* Avatar Selection Grid */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Select Avatar Profile</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedAvatar}
                      alt="Current avatar preview"
                      className="w-14 h-14 rounded-full object-cover border border-slate-200/80 p-0.5 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="grid grid-cols-6 gap-2">
                      {avatarPresets.map((av, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedAvatar(av)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${selectedAvatar === av ? 'border-slate-900 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                          <img src={av} alt={`Preset ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Custom URL Field */}
                  <input
                    type="url"
                    placeholder="Or paste custom image URL"
                    value={selectedAvatar.startsWith('http') && !avatarPresets.includes(selectedAvatar) ? selectedAvatar : ''}
                    onChange={(e) => setSelectedAvatar(e.target.value || avatarPresets[0])}
                    className="w-full mt-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-slate-900 text-[11px] font-medium outline-none rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Gender Select */}
                  <div className="relative">
                    <select
                      value={profileGender}
                      onChange={(e) => setProfileGender(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none appearance-none"
                    >
                      <option value="unspecified">Prefer Not to Say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Non-binary / Other</option>
                    </select>
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Gender (Optional)</label>
                  </div>

                  {/* Birthday Select */}
                  <div className="relative">
                    <input
                      type="date"
                      value={profileBirthday}
                      onChange={(e) => setProfileBirthday(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    />
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Date of Birth</label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Currency Selection */}
                  <div className="relative">
                    <select
                      value={profileCurrency}
                      onChange={(e) => setProfileCurrency(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Preferred Currency</label>
                  </div>

                  {/* Language Selection */}
                  <div className="relative">
                    <select
                      value={profileLanguage}
                      onChange={(e) => setProfileLanguage(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    >
                      <option value="English">English (EN)</option>
                      <option value="Spanish">Español (ES)</option>
                      <option value="French">Français (FR)</option>
                      <option value="German">Deutsch (DE)</option>
                      <option value="Japanese">日本語 (JA)</option>
                    </select>
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">System Language</label>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="grid grid-cols-2 gap-3">
                  {/* Country Field */}
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={profileCountry}
                      onChange={(e) => setProfileCountry(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    />
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Country</label>
                  </div>

                  {/* City Field */}
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      placeholder="e.g. Seattle"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                    />
                    <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">City / Municipality</label>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    placeholder="e.g. 123 Pine Street, Suite 400"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-xs font-semibold outline-none"
                  />
                  <label className="absolute left-3 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Primary Delivery Address</label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/15 flex items-center justify-center gap-2 transition-all cursor-pointer mt-5"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Profile Details'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 6: INTEREST SELECTION */}
          {step === 'interests' && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-8 md:p-10"
            >
              <div className="mb-6">
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600 tracking-wider uppercase">Tailored Recommendations</span>
                <h2 className="font-display text-xl font-bold text-slate-900 mt-1.5">Choose Interests</h2>
                <p className="text-xs text-slate-500">Select at least <span className="font-bold text-slate-900">3 categories</span> to personalize your catalog discoveries</p>
              </div>

              {error && (
                <div className="p-4 mb-5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Grid of Interests */}
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar mb-6">
                {availableInterests.map((interest) => {
                  const IconComponent = interest.icon;
                  const isSelected = selectedInterests.includes(interest.id);

                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer relative group ${isSelected ? 'border-slate-900 bg-slate-950 text-white shadow-md' : 'border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-1.5 rounded-lg border ${isSelected ? 'bg-slate-900 text-white border-slate-800' : interest.bg}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-slate-950">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold leading-tight">{interest.label}</h3>
                        <p className={`text-[10px] mt-0.5 leading-tight ${isSelected ? 'text-slate-400' : 'text-slate-400 font-medium'}`}>{interest.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleInterestsComplete}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-sm font-semibold py-3.5 rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Save Selections ({selectedInterests.length}/3)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 7: PERMISSIONS SCREEN */}
          {step === 'permissions' && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-8 md:p-10"
            >
              <div className="mb-6">
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600 tracking-wider uppercase">System Preferences</span>
                <h2 className="font-display text-xl font-bold text-slate-900 mt-1.5">Configure Permissions</h2>
                <p className="text-xs text-slate-500">Grant browser accessibility features to activate AI and location benefits</p>
              </div>

              {error && (
                <div className="p-4 mb-5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 flex items-start gap-2.5">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Permission list */}
              <div className="space-y-3.5 mb-7">
                {/* Location */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${permLocation ? 'bg-slate-950 text-white' : 'bg-white text-slate-500 border-slate-200/80'}`}>
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-slate-900">Location Authorization</h4>
                      <p className="text-[10px] text-slate-400 font-medium">To display localized Deals and calculate shipping distances</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTogglePermission('location')}
                    className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer border ${permLocation ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'}`}
                  >
                    {permLocation ? 'Allowed' : 'Enable'}
                  </button>
                </div>

                {/* Notifications */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${permNotifications ? 'bg-slate-950 text-white' : 'bg-white text-slate-500 border-slate-200/80'}`}>
                      <Bell className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-slate-900">Broadcast Notifications</h4>
                      <p className="text-[10px] text-slate-400 font-medium">For delivery timelines and lightning deal alert pings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTogglePermission('notifications')}
                    className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer border ${permNotifications ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'}`}
                  >
                    {permNotifications ? 'Allowed' : 'Enable'}
                  </button>
                </div>

                {/* Camera */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${permCamera ? 'bg-slate-950 text-white' : 'bg-white text-slate-500 border-slate-200/80'}`}>
                      <Camera className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-slate-900">Camera Interface</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Allows smart catalog image queries and scans</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTogglePermission('camera')}
                    className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer border ${permCamera ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'}`}
                  >
                    {permCamera ? 'Allowed' : 'Enable'}
                  </button>
                </div>

                {/* Microphone */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${permMicrophone ? 'bg-slate-950 text-white' : 'bg-white text-slate-500 border-slate-200/80'}`}>
                      <Mic className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-slate-900">Microphone Interface</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Utilized to trigger voice searches and commands</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTogglePermission('microphone')}
                    className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer border ${permMicrophone ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'}`}
                  >
                    {permMicrophone ? 'Allowed' : 'Enable'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePermissionsComplete(true)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                >
                  Skip All
                </button>
                <button
                  type="button"
                  onClick={() => handlePermissionsComplete(false)}
                  className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Grant & Finish Onboarding</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP: LOADING PERSONALIZATION */}
          {step === 'loading-personalization' && (
            <motion.div
              key="loading-personalization"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 px-8 flex flex-col items-center justify-center min-h-[420px] text-center"
            >
              <div className="relative mb-8">
                {/* Outer spin circle */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-t-2 border-b-2 border-slate-900 border-l-2 border-r-2 border-l-transparent border-r-transparent"
                />
                <Sparkles className="w-6 h-6 text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2 font-display">
                Personalizing Your Experience
              </h2>
              
              <div className="h-6 overflow-hidden max-w-xs mx-auto mb-4">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingMessage}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="text-xs text-slate-400 font-medium"
                  >
                    {loadingMessage}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div className="w-48 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  className="h-full bg-slate-900 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {/* STEP: WELCOME BACK SCREEN */}
          {step === 'welcome-back' && currentUser && (
            <motion.div
              key="welcome-back"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 px-8 flex flex-col items-center justify-center min-h-[460px] text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="relative mb-6"
              >
                {/* Avatar with prime accent border */}
                <div className={`p-1 rounded-full ${currentUser?.subscriptions?.prime ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-lg shadow-amber-200/50' : 'bg-slate-100'}`}>
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser?.name}
                    className="w-20 h-20 rounded-full object-cover bg-white"
                  />
                </div>
                {currentUser?.subscriptions?.prime && (
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow-sm tracking-wider">
                    Prime
                  </span>
                )}
              </motion.div>

              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1 font-mono">
                Welcome Back
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6 font-display">
                {currentUser?.name?.split(' ')[0] || 'Member'}
              </h2>

              {/* Dynamic user dashboard properties panel */}
              <div className="w-full grid grid-cols-2 gap-3 mb-8 text-left">
                {/* Loyalty Tier Card */}
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Loyalty Tier</span>
                  <div className="mt-1">
                    <span className="text-xs font-extrabold text-slate-900 block">
                      {(() => {
                        const coins = currentUser?.rewardCoins || 0;
                        if (coins >= 1500) return 'Diamond Elite';
                        if (coins >= 500) return 'Platinum';
                        if (coins >= 100) return 'Gold Member';
                        return 'Silver Level';
                      })()}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Earned +5% rewards</span>
                  </div>
                </div>

                {/* Reward Coins */}
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Ocean Coins</span>
                  <div className="mt-1">
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      {currentUser?.rewardCoins || 0} COINS
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Value: ${((currentUser?.rewardCoins || 0) * 0.1).toFixed(2)}</span>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Wallet Balance</span>
                  <div className="mt-1">
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      ${(currentUser?.walletBalance || 0).toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Instant checkout active</span>
                  </div>
                </div>

                {/* Last Order Status */}
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Last Order Status</span>
                  <div className="mt-1">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {lastOrderStatus}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Recent purchase update</span>
                  </div>
                </div>
              </div>

              {/* Progress and countdown status */}
              <div className="flex flex-col items-center gap-3 w-full">
                <button
                  onClick={() => onAuthSuccess(currentUser)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Enter Store</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[9px] text-slate-400 font-medium animate-pulse">
                  Launching personalized store environment...
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
