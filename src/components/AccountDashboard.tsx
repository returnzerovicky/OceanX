import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  CreditCard, 
  ShoppingBag, 
  Heart, 
  Gift, 
  Award, 
  Bell, 
  History, 
  MapPin, 
  Shield, 
  Laptop, 
  Mail, 
  MessageSquare, 
  Trash2, 
  Download, 
  Key, 
  Lock, 
  Check, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  HelpCircle,
  Clock,
  Landmark,
  FileText,
  Smartphone,
  Globe
} from 'lucide-react';
import { UserSession, Order, Product } from '../types';
import { COUNTRIES, CURRENCIES, LANGUAGES, TIMEZONES } from '../server/globalPreferencesData';
import { getLocalizationDetails, formatCurrency } from '../lib/preferences';

interface AccountDashboardProps {
  user: UserSession | null;
  onRefreshUser: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  initialTab?: string;
}

export default function AccountDashboard({ user, onRefreshUser, onLogout, onNavigate, initialTab = 'profile' }: AccountDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const securityLogs = user?.loginHistory || [];

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setAccountBio] = useState('');
  const [birthday, setAccountBirthday] = useState('');
  const [gender, setAccountGender] = useState('unspecified');
  const [language, setAccountLanguage] = useState('English');
  const [currency, setAccountCurrency] = useState('USD');
  const [country, setAccountCountry] = useState('United States');
  const [city, setAccountCity] = useState('');
  const [address, setAccountAddress] = useState('');
  const [timezone, setAccountTimezone] = useState('UTC');
  const [units, setUnits] = useState<'Metric' | 'Imperial'>('Imperial');
  const [dateFormat, setDateFormat] = useState<'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'>('MM/DD/YYYY');
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'System'>('Light');
  
  // Dialog / Modal / Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [prefLoading, setPrefLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // States for Profile update feedback
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Avatar Options
  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  ];
  const [selectedAvatar, setSelectedAvatar] = useState(avatarPresets[0]);

  // Wallet states
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 2FA States
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFactorType, setTwoFactorType] = useState('authenticator'); // 'authenticator' | 'sms' | 'email'
  const [show2FAConfig, setShow2FAConfig] = useState(false);
  const [twoFactorInput, setTwoFactorInput] = useState('');
  const [twoFactorSecret] = useState('OS-G2FA-3829-1092');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  // Security Questions State
  const [securityQuestion, setSecurityQuestion] = useState('first_pet');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [secSuccess, setSecSuccess] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');

  // Cards
  const [cards, setCards] = useState<any[]>([
    { id: '1', brand: 'Visa', last4: '4242', expMonth: '12', expYear: '2028', holder: 'Vicky B' },
    { id: '2', brand: 'Mastercard', last4: '8888', expMonth: '08', expYear: '2029', holder: 'Vicky B' }
  ]);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');

  // Subscriptions
  const [primeSubscribed, setPrimeSubscribed] = useState(true);
  const [promoSubscribed, setPromoSubscribed] = useState(false);
  const [alertsSubscribed, setAlertsSubscribed] = useState(true);

  // Notifications toggles
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifPush, setNotifPush] = useState(true);
  const [notifWhatsApp, setNotifWhatsApp] = useState(false);

  // Companion Sessions
  const [companionSessions, setCompanionSessions] = useState<any[]>([
    { id: '1', os: 'iOS on Apple iPhone 15 Pro', location: 'Seattle, WA, USA', ip: '24.19.102.3', current: false, trusted: true },
    { id: '2', os: 'Chrome on Windows 11', location: 'Dublin, Ireland', ip: '104.93.20.1', current: false, trusted: true }
  ]);
  const [logoutAllSuccess, setLogoutAllSuccess] = useState(false);

  // Support State
  const [tickets, setTickets] = useState<any[]>([
    { id: 'TCK-1092', subject: 'Escrow dispute for Order #1002', status: 'Under Review', timestamp: '2026-07-10T14:20:00Z' },
    { id: 'TCK-0832', subject: 'Inquiry on Loyalty Coins conversions', status: 'Resolved', timestamp: '2026-07-02T09:15:00Z' }
  ]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Privacy Center
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load user data on mount / prop updates
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').trim().split(/\s+/);
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setUsername(user.username || '');
      setAccountBio(user.bio || '');
      setAccountBirthday(user.birthday || '');
      setAccountGender(user.gender || 'unspecified');
      setAccountLanguage(user.preferredLanguage || 'English');
      setAccountCurrency(user.currency || 'USD');
      setAccountCountry(user.country || 'United States');
      setAccountCity(user.city || '');
      setAccountAddress(user.address || '');
      setAccountTimezone(user.timezone || 'UTC');
      setUnits((user as any).units || 'Imperial');
      setDateFormat((user as any).dateFormat || 'MM/DD/YYYY');
      setTheme((user as any).theme || 'Light');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setIs2FAEnabled(!!user.is2FAEnabled);
      setTwoFactorType(user.twoFactorType || 'authenticator');
      setSelectedAvatar(user.avatar || avatarPresets[0]);
      
      if (user.address) {
        setAddresses([user.address, '456 Oak Avenue, Apt 2B, San Francisco, CA 94102']);
      } else {
        setAddresses(['123 Pine Street, Suite 400, Seattle, WA 98101', '456 Oak Avenue, Apt 2B, San Francisco, CA 94102']);
      }

      if (user.communicationPreferences) {
        setNotifEmail(!!user.communicationPreferences.email);
        setNotifSMS(!!user.communicationPreferences.sms);
        setNotifPush(!!user.communicationPreferences.push);
        setNotifWhatsApp(!!user.communicationPreferences.whatsapp);
      }
    }
  }, [user]);

  // Synchronize initialTab if changed externally
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSelectCountry = (newCountry: string) => {
    setAccountCountry(newCountry);
    
    // Cascading updates like Amazon!
    const details = getLocalizationDetails(newCountry);
    setAccountCurrency(details.currency);
    
    // Suggest language
    if (details.languages.length > 0) {
      setAccountLanguage(details.languages[0]);
    }
    
    // Timezone offset mapping matching currency or country
    const tzMatch = TIMEZONES.find(t => t.countries && t.countries.includes(newCountry)) || 
                    TIMEZONES.find(t => t.code === details.currency) || 
                    TIMEZONES[0];
    if (tzMatch) {
      setAccountTimezone(tzMatch.offset);
    }
    
    // Auto-select weights/dimensions system
    if (['United States', 'Myanmar', 'Liberia'].includes(newCountry)) {
      setUnits('Imperial');
    } else {
      setUnits('Metric');
    }
    
    // Auto-select date format
    if (newCountry === 'United States') {
      setDateFormat('MM/DD/YYYY');
    } else if (['Japan', 'China', 'Korea', 'South Korea'].includes(newCountry)) {
      setDateFormat('YYYY-MM-DD');
    } else {
      setDateFormat('DD/MM/YYYY');
    }

    setCountryModalOpen(false);
  };

  const handleSaveGlobalPreferences = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPrefLoading(true);
    setPrefError(null);
    setPrefSuccess(false);

    try {
      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country,
          language,
          currency,
          timezone,
          units,
          dateFormat,
          theme
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPrefSuccess(true);
        onRefreshUser(); // Updates the top-level user session instantly across all views!
        setTimeout(() => setPrefSuccess(false), 4000);
      } else {
        setPrefError(data.error || 'Failed to update preferences.');
      }
    } catch (err) {
      setPrefError('Connection error.');
    } finally {
      setPrefLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await fetch('/api/auth/profile-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          username,
          bio,
          birthday,
          gender,
          preferredLanguage: language,
          currency,
          country,
          city,
          address,
          timezone,
          email,
          phone,
          communicationPreferences: {
            email: notifEmail,
            sms: notifSMS,
            push: notifPush,
            promo: notifWhatsApp
          },
          subscriptions: {
            prime: primeSubscribed,
            newsletter: promoSubscribed,
            dailyDeals: alertsSubscribed,
            securityAlerts: true
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setProfileSuccess(true);
        onRefreshUser();
        setTimeout(() => setProfileSuccess(false), 4000);
      } else {
        setProfileError(data.error || 'Failed to update user identity profile details.');
      }
    } catch (err) {
      setProfileError('Network communication failure.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositError('Please enter a positive transaction deposit amount.');
      return;
    }

    setDepositLoading(true);
    setDepositError(null);
    setDepositSuccess(false);

    try {
      const res = await fetch('/api/auth/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok) {
        setDepositSuccess(true);
        setDepositAmount('');
        onRefreshUser();
        setTimeout(() => setDepositSuccess(false), 3000);
      } else {
        setDepositError(data.error || 'Deposit failed.');
      }
    } catch (err) {
      setDepositError('Network transaction error.');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordError(data.error || 'Failed to securely update password.');
      }
    } catch (err) {
      setPasswordError('Password modification network block.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggle2FA = async (enable: boolean) => {
    setTwoFactorError(null);
    setTwoFactorSuccess(false);

    if (enable) {
      setShow2FAConfig(true);
    } else {
      try {
        const res = await fetch('/api/auth/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: false })
        });
        if (res.ok) {
          setIs2FAEnabled(false);
          onRefreshUser();
        } else {
          setTwoFactorError('Could not disable 2FA.');
        }
      } catch (e) {
        setTwoFactorError('Connection error.');
      }
    }
  };

  const handleVerify2FACode = async () => {
    setTwoFactorError(null);
    if (twoFactorInput !== '123456') {
      setTwoFactorError('Invalid OTP token. Please enter verification code: 123456.');
      return;
    }

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true, type: twoFactorType, code: twoFactorInput })
      });
      const data = await res.json();
      if (res.ok) {
        setIs2FAEnabled(true);
        setShow2FAConfig(false);
        setTwoFactorInput('');
        setTwoFactorSuccess(true);
        onRefreshUser();
        setTimeout(() => setTwoFactorSuccess(false), 4000);
      } else {
        setTwoFactorError(data.error || 'Verification failed.');
      }
    } catch (e) {
      setTwoFactorError('Connection error.');
    }
  };

  const handleSaveSecurityQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer.trim()) return;
    setSecSuccess(true);
    setTimeout(() => setSecSuccess(false), 3000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    setAddresses([...addresses, newAddress.trim()]);
    setNewAddress('');
  };

  const handleRemoveAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !cardExp) return;
    const last4 = cardNumber.replace(/\s+/g, '').slice(-4) || '8888';
    const [month, year] = cardExp.split('/');
    const newC = {
      id: String(Date.now()),
      brand: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
      last4,
      expMonth: month || '12',
      expYear: year ? `20${year}` : '2029',
      holder: cardHolder
    };
    setCards([...cards, newC]);
    setCardNumber('');
    setCardHolder('');
    setCardExp('');
  };

  const handleRemoveCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const handleLogoutAllOther = () => {
    setCompanionSessions([]);
    setLogoutAllSuccess(true);
    setTimeout(() => setLogoutAllSuccess(false), 3000);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketLoading(true);
    setTicketSuccess(false);

    setTimeout(() => {
      setTickets([{
        id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: ticketSubject,
        status: 'Open',
        timestamp: new Date().toISOString()
      }, ...tickets]);
      setTicketSubject('');
      setTicketMessage('');
      setTicketLoading(false);
      setTicketSuccess(true);
      setTimeout(() => setTicketSuccess(false), 3000);
    }, 1200);
  };

  const handleDownloadData = () => {
    window.location.href = '/api/auth/download-data';
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type "DELETE" to authorize account termination.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await fetch('/api/auth/delete-account', { method: 'POST' });
      if (res.ok) {
        onLogout();
        onNavigate('/');
      } else {
        setDeleteError('Purge sequence rejected by database protocol.');
      }
    } catch (e) {
      setDeleteError('Network error during account termination.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Sidebar List configuration
  const sidebarItems = [
    { id: 'profile', label: 'Merchant Profile', icon: User, desc: 'Public identity, bio, and delivery' },
    { id: 'global-preferences', label: 'Language & Region', icon: Globe, desc: 'Country, language, currency, units settings' },
    { id: 'wallet', label: 'Digital Wallet', icon: CreditCard, desc: 'Digital funds balance & cash deposit' },
    { id: 'orders', label: 'Order History', icon: ShoppingBag, desc: 'Catalog checkouts, escrows, and timelines' },
    { id: 'wishlist', label: 'My Wishlist', icon: Heart, desc: 'Items currently saved to wishlist' },
    { id: 'coupons', label: 'Active Coupons', icon: Gift, desc: 'Coupons and promotional credit benefits' },
    { id: 'coins', label: 'Loyalty Coins', icon: Award, desc: 'Coins ledger rewards & conversions' },
    { id: 'subscriptions', label: 'Subscriptions', icon: Bell, desc: 'Ocean Prime & notification channels' },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, desc: 'Primary and secondary drop points' },
    { id: 'cards', label: 'Saved Cards', icon: CreditCard, desc: 'Tokenized security sandboxed bank cards' },
    { id: 'security', label: 'Security & 2FA', icon: Shield, desc: 'Credential policies, auth app, device locks' },
    { id: 'devices', label: 'Authorized Sessions', icon: Laptop, desc: 'Companion sessions, recent IPs and times' },
    { id: 'notifications', label: 'Notification Sliders', icon: Mail, desc: 'Push, Email, SMS, WhatsApp triggers' },
    { id: 'support', label: 'Support Terminal', icon: MessageSquare, desc: 'Frequently asked queries & tickets ledger' },
    { id: 'privacy', label: 'Privacy Control Center', icon: Trash2, desc: 'Download personal logs or terminate node' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column - Sidebar Navigation */}
        <div className="w-full lg:w-1/4 shrink-0 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-6 text-left">
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
            <img 
              src={selectedAvatar} 
              alt={user?.name || 'Explorer'} 
              className="w-12 h-12 rounded-full object-cover border border-slate-200 p-0.5"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="font-display font-bold text-slate-900 leading-tight text-sm flex items-center gap-1.5">
                {user?.name || 'Vicky B'}
                {primeSubscribed && <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full tracking-wider">PRIME</span>}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">@{username || 'vicky_b'} • {user?.role || 'Customer'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map(item => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer text-left ${isSelected ? 'bg-slate-950 text-white shadow-sm' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <IconComp className={`w-4.5 h-4.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <div>
                    <h4 className="text-xs font-bold leading-normal">{item.label}</h4>
                    <p className={`text-[9px] truncate max-w-[160px] leading-tight ${isSelected ? 'text-slate-400' : 'text-slate-400 font-medium'}`}>{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Column - Active Panel */}
        <div className="flex-1 w-full bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-left"
            >
              
              {/* PANEL 1: PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Merchant & Identity Settings</h2>
                    <p className="text-xs text-slate-500">Configure your global identity, bio, and default checkout settings</p>
                  </div>

                  {profileSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Identity parameters updated successfully!</p>
                        <p className="text-[11px] opacity-90 mt-0.5">Your changes are compiled and synchronized with the Ocean global ledger.</p>
                      </div>
                    </div>
                  )}

                  {profileError && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    {/* Avatar Customization */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Preset Avatar Profile</label>
                      <div className="flex items-center gap-4">
                        <img 
                          src={selectedAvatar} 
                          alt="Preview" 
                          className="w-14 h-14 rounded-full object-cover border border-slate-200 p-0.5"
                          referrerPolicy="no-referrer"
                        />
                        <div className="grid grid-cols-6 gap-2">
                          {avatarPresets.map((av, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedAvatar(av)}
                              className={`w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${selectedAvatar === av ? 'border-slate-900 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                              <img src={av} alt={`Preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <input 
                        type="url"
                        placeholder="Or paste custom image avatar URL"
                        value={selectedAvatar.startsWith('http') && !avatarPresets.includes(selectedAvatar) ? selectedAvatar : ''}
                        onChange={(e) => setSelectedAvatar(e.target.value || avatarPresets[0])}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                        />
                        <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">First Name</label>
                      </div>

                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                        />
                        <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Last Name</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                        />
                        <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Unique Username</label>
                      </div>

                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                        />
                        <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Merchant Mobile Phone</label>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        value={bio}
                        onChange={(e) => setAccountBio(e.target.value)}
                        placeholder="Write a brief bio..."
                        rows={2}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all resize-none"
                      />
                      <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Merchant Biography Profile Bio</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input 
                          type="date" 
                          value={birthday} 
                          onChange={(e) => setAccountBirthday(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                        />
                        <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Date of Birth</label>
                      </div>

                      <div className="relative">
                        <select 
                          value={gender} 
                          onChange={(e) => setAccountGender(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all appearance-none"
                        >
                          <option value="unspecified">Prefer Not to Say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Non-binary / Other</option>
                        </select>
                        <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Gender</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <select 
                          value={language} 
                          onChange={(e) => setAccountLanguage(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                        >
                          <option value="English">English (EN)</option>
                          <option value="Spanish">Español (ES)</option>
                          <option value="French">Français (FR)</option>
                          <option value="German">Deutsch (DE)</option>
                          <option value="Japanese">日本語 (JA)</option>
                        </select>
                        <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">System Language</label>
                      </div>

                      <div className="relative">
                        <select 
                          value={currency} 
                          onChange={(e) => setAccountCurrency(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="JPY">JPY (¥)</option>
                          <option value="CAD">CAD (C$)</option>
                        </select>
                        <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Preferred Currency</label>
                      </div>

                      <div className="relative">
                        <select 
                          value={timezone} 
                          onChange={(e) => setAccountTimezone(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                        >
                          <option value="UTC">UTC (GMT+00:00)</option>
                          <option value="America/New_York">EST (GMT-05:00)</option>
                          <option value="America/Chicago">CST (GMT-06:00)</option>
                          <option value="America/Denver">MST (GMT-07:00)</option>
                          <option value="America/Los_Angeles">PST (GMT-08:00)</option>
                        </select>
                        <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Timezone Node</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          value={country} 
                          onChange={(e) => setAccountCountry(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                        />
                        <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Country</label>
                      </div>

                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          value={city} 
                          onChange={(e) => setAccountCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                        />
                        <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">City / Municipality</label>
                      </div>
                    </div>

                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        value={address} 
                        onChange={(e) => setAccountAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 focus:bg-white transition-all"
                      />
                      <label className="absolute left-3.5 -top-2 px-1 bg-white text-[9px] font-bold text-slate-400">Primary Delivery Address</label>
                    </div>

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full bg-slate-950 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-slate-900/10"
                    >
                      {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>Save Profile Details</span>
                    </button>
                  </form>
                </div>
              )}

              {/* PANEL 1.5: GLOBAL PREFERENCES */}
              {activeTab === 'global-preferences' && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-900">Language & Region Preferences</h2>
                      <p className="text-xs text-slate-500">Configure your country-specific e-commerce personalized experience, currencies, language settings and units.</p>
                    </div>
                    {prefSuccess && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold animate-pulse">
                        ✓ Preferences synchronized successfully
                      </span>
                    )}
                    {prefError && (
                      <span className="text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-3.5 py-1.5 rounded-xl font-bold">
                        ⚠ {prefError}
                      </span>
                    )}
                  </div>

                  {/* Amazon-like preferences grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* CARD 1: Country Selection */}
                    <div className="border border-slate-200 rounded-3xl p-5 hover:border-slate-400 transition-all cursor-pointer bg-white text-left shadow-xs flex flex-col justify-between h-48"
                      onClick={() => setCountryModalOpen(true)}>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Country / Region</span>
                          <span className="text-xs text-indigo-600 font-bold">Edit</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-2">
                          <span className="text-2xl shrink-0">
                            {COUNTRIES.find(c => c.name === country)?.flag || '🇺🇸'}
                          </span>
                          <span>{country}</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium mt-1">
                          Changes your recommended catalog listings, local tax rules, and delivery estimates.
                        </p>
                      </div>
                      <div className="text-[10px] bg-slate-50 text-slate-500 font-semibold px-2.5 py-1.5 rounded-xl border border-slate-100 mt-2 truncate">
                        Shipping Zone: {country}
                      </div>
                    </div>

                    {/* CARD 2: Language */}
                    <div className="border border-slate-200 rounded-3xl p-5 hover:border-slate-400 transition-all bg-white text-left shadow-xs flex flex-col justify-between h-48">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preferred Language</span>
                        <select 
                          value={language}
                          onChange={(e) => setAccountLanguage(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2 mt-2 text-xs font-bold outline-none cursor-pointer focus:bg-white focus:border-slate-900 transition-all"
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.name} value={lang.name}>{lang.name} ({lang.code.toUpperCase()})</option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium mt-1">
                          Localized customer service alerts and smart search translation prompts.
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold mt-2 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span>Greeting: {
                          language.includes('Spanish') ? '¡Hola, Bienvenido!' :
                          language.includes('French') ? 'Bonjour, Bienvenue!' :
                          language.includes('German') ? 'Guten Tag, Willkommen!' :
                          language.includes('Japanese') ? 'こんにちは、ようこそ！' :
                          'Hello, Welcome!'
                        }</span>
                      </div>
                    </div>

                    {/* CARD 3: Currency */}
                    <div className="border border-slate-200 rounded-3xl p-5 hover:border-slate-400 transition-all bg-white text-left shadow-xs flex flex-col justify-between h-48">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Currency Exchange</span>
                        <select 
                          value={currency}
                          onChange={(e) => setAccountCurrency(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2 mt-2 text-xs font-bold outline-none cursor-pointer focus:bg-white focus:border-slate-900 transition-all"
                        >
                          {CURRENCIES.map(curr => (
                            <option key={curr.code} value={curr.code}>{curr.code} - {curr.name}</option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium mt-1">
                          Prices convert automatically. Indian Rupees format in Lakhs and Crores.
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-900 font-bold mt-2 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1.5 rounded-xl flex justify-between items-center">
                        <span>Converted Sample:</span>
                        <span className="font-mono">{formatCurrency(1500, currency)}</span>
                      </div>
                    </div>

                    {/* CARD 4: Time Zone */}
                    <div className="border border-slate-200 rounded-3xl p-5 hover:border-slate-400 transition-all bg-white text-left shadow-xs flex flex-col justify-between h-48">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Local Time Zone</span>
                        <select 
                          value={timezone}
                          onChange={(e) => setAccountTimezone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2 mt-2 text-xs font-bold outline-none cursor-pointer focus:bg-white focus:border-slate-900 transition-all"
                        >
                          {TIMEZONES.map(tz => (
                            <option key={tz.offset} value={tz.offset}>{tz.name} ({tz.offset})</option>
                          ))}
                        </select>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium mt-1">
                          Synchronizes live flash sales countdown times and customer service availability slots.
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-2 flex items-center justify-between">
                        <span>Active Time:</span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-black font-bold">
                          {new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' })}
                        </span>
                      </div>
                    </div>

                    {/* CARD 5: Weights & Measures Units */}
                    <div className="border border-slate-200 rounded-3xl p-5 hover:border-slate-400 transition-all bg-white text-left shadow-xs flex flex-col justify-between h-48">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Units System</span>
                        <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                          <button 
                            type="button"
                            onClick={() => setUnits('Metric')}
                            className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${units === 'Metric' ? 'bg-white text-black shadow-xs border border-slate-200/50' : 'text-slate-400'}`}
                          >
                            Metric (kg, cm)
                          </button>
                          <button 
                            type="button"
                            onClick={() => setUnits('Imperial')}
                            className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${units === 'Imperial' ? 'bg-white text-black shadow-xs border border-slate-200/50' : 'text-slate-400'}`}
                          >
                            Imperial (lbs, in)
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium mt-1">
                          Displays product weight dimensions and length specifications in your preferred format.
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold mt-2 flex justify-between items-center">
                        <span>Catalog Display Weight:</span>
                        <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-black">
                          {units === 'Metric' ? '500g / 10.5cm' : '1.10 lbs / 4.1 in'}
                        </span>
                      </div>
                    </div>

                    {/* CARD 6: Date Format */}
                    <div className="border border-slate-200 rounded-3xl p-5 hover:border-slate-400 transition-all bg-white text-left shadow-xs flex flex-col justify-between h-48">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date Format Style</span>
                        <select 
                          value={dateFormat}
                          onChange={(e) => setDateFormat(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2 mt-2 text-xs font-bold outline-none cursor-pointer focus:bg-white focus:border-slate-900 transition-all"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY (US style)</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY (Global style)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                        </select>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium mt-1">
                          Applies clean localized calendar formats to order invoice timestamps and security tracking logs.
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-2 flex justify-between items-center">
                        <span>Formatted Today:</span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-black font-bold">
                          {dateFormat === 'DD/MM/YYYY' ? '16/07/2026' : dateFormat === 'YYYY-MM-DD' ? '2026-07-16' : '07/16/2026'}
                        </span>
                      </div>
                    </div>

                    {/* CARD 7: Theme */}
                    <div className="border border-slate-200 rounded-3xl p-5 hover:border-slate-400 transition-all bg-white text-left shadow-xs flex flex-col justify-between h-48">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Theme Profile Mode</span>
                        <div className="grid grid-cols-3 gap-1 mt-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                          {['Light', 'Dark', 'System'].map(t => (
                            <button 
                              key={t}
                              type="button"
                              onClick={() => setTheme(t as any)}
                              className={`py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${theme === t ? 'bg-white text-black shadow-xs border border-slate-200/50' : 'text-slate-400'}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal font-medium mt-1">
                          Customize your screen theme. Ocean defaults to a gorgeous slate-light styling.
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-2 flex justify-between items-center">
                        <span>Current styling:</span>
                        <span className="font-sans font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase text-[9px]">{theme} Mode</span>
                      </div>
                    </div>

                  </div>

                  {/* Cascading Details Banner */}
                  {country && (
                    <div className="p-6 border border-indigo-100 bg-indigo-50/30 rounded-3xl text-left space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-indigo-600" />
                        <span>Cascading Localization Protocols for {country}</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800">📦 Tax Rules & Logistics</p>
                          <p>Standard Tax System: <span className="font-semibold text-slate-900">{getLocalizationDetails(country).taxName}</span></p>
                          <p>Estimated Delivery Window: <span className="font-semibold text-slate-900">{getLocalizationDetails(country).shippingDays} Business Days</span></p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800">🛍 Regional Festival & Events</p>
                          <p className="font-semibold text-indigo-700">{getLocalizationDetails(country).festival?.name || 'Standard Season'}</p>
                          <p className="text-[11px] text-slate-500 leading-normal mt-0.5">{getLocalizationDetails(country).festival?.description || 'Curated high-precision global delivery is currently active across all territories.'}</p>
                        </div>
                        <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-1">
                          <p className="font-bold text-slate-800">🔥 Trending Regional Searches</p>
                          <p className="italic text-slate-500 font-serif">"{getLocalizationDetails(country).trendingSearch}"</p>
                        </div>
                      </div>

                      {/* Special country promotions */}
                      <div className="pt-3 border-t border-indigo-100/50 space-y-2">
                        <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest">Active Marketplace Offers</p>
                        <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                          {getLocalizationDetails(country).offers.map((offer, oIdx) => (
                            <li key={oIdx} className="font-medium text-slate-700">{offer}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Save changes sticky bar */}
                  <div className="pt-5 border-t border-slate-100 flex justify-end gap-3.5">
                    <button 
                      type="button" 
                      onClick={onRefreshUser}
                      className="px-5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                    >
                      Reset to Saved
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSaveGlobalPreferences()}
                      disabled={prefLoading}
                      className="px-8 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-slate-900/10 flex items-center gap-2"
                    >
                      {prefLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>Save Global Preferences</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SEARCHABLE COUNTRY SELECT MODAL */}
              <AnimatePresence>
                {countryModalOpen && (
                  <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden text-left"
                    >
                      {/* Modal Header */}
                      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <div>
                          <h3 className="font-display font-bold text-slate-900 text-base">Select Your Country / Region</h3>
                          <p className="text-[11px] text-slate-400 font-medium">Select your shipping destination region to update prices, tax rules, and active regional banners.</p>
                        </div>
                        <button 
                          onClick={() => setCountryModalOpen(false)}
                          className="p-1.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-black transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Modal Search Bar */}
                      <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <input 
                          type="text" 
                          placeholder="Search from 100+ countries..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-slate-900 focus:shadow-xs transition-all font-semibold"
                        />
                      </div>

                      {/* Modal Country List */}
                      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[50vh]">
                        {COUNTRIES.filter(c =>
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.code.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length > 0 ? (
                          COUNTRIES.filter(c =>
                            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.code.toLowerCase().includes(searchQuery.toLowerCase())
                          ).map(c => {
                            const isSelected = country === c.name;
                            return (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => handleSelectCountry(c.name)}
                                className={`w-full px-5 py-3.5 flex justify-between items-center hover:bg-slate-50/50 cursor-pointer transition-colors text-left ${isSelected ? 'bg-indigo-50/30' : ''}`}
                              >
                                <div className="flex items-center gap-3.5">
                                  <span className="text-2xl shrink-0 select-none">{c.flag}</span>
                                  <div>
                                    <p className="text-xs font-bold text-slate-900 leading-none">{c.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">{c.code} • {c.currency} • Zone {(c as any).zone || 'A'}</p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                            No countries found matching "{searchQuery}"
                          </div>
                        )}
                      </div>

                      {/* Modal Footer */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button 
                          onClick={() => setCountryModalOpen(false)}
                          className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                      </div>

                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* PANEL 2: WALLET */}
              {activeTab === 'wallet' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Digital Wallet Account Balance</h2>
                    <p className="text-xs text-slate-500">Add secure mock sandboxed credits to fund instant item checkouts</p>
                  </div>

                  <div className="bg-slate-950 text-white rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-lg">
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                      <CreditCard className="w-60 h-60 -mr-12 -mt-12 text-white" />
                    </div>
                    <div className="space-y-1.5 relative z-10 text-left">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Primary Funds Balance</span>
                      <h3 className="text-4xl font-mono font-bold">${user?.walletBalance?.toFixed(2) || '100.00'}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Equivalent USD Sandbox Credits</p>
                    </div>

                    <div className="space-y-1 relative z-10 text-left">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Reward Coins Loyalty</span>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span className="text-xl font-mono font-bold">{user?.rewardCoins || 10} COINS</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Estimated value: ${(user?.rewardCoins ? user.rewardCoins * 0.10 : 1.00).toFixed(2)} USD</p>
                    </div>
                  </div>

                  {depositSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Sandbox transaction approved instantly!</p>
                        <p className="text-[11px] opacity-90 mt-0.5">Your digital wallet has been credited. Loyalty bonus of +10 coins awarded.</p>
                      </div>
                    </div>
                  )}

                  {depositError && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{depositError}</span>
                    </div>
                  )}

                  <div className="border border-slate-100 rounded-3xl p-6 bg-slate-50/50 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Fund Wallet Node</h3>
                    <p className="text-xs text-slate-400">Type sandbox deposit value to instantly fund your wallet balance:</p>
                    
                    <form onSubmit={handleDeposit} className="flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-400 font-bold">$</span>
                        <input 
                          type="number"
                          placeholder="e.g. 250.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-slate-900 transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={depositLoading}
                        className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {depositLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Instantly Top Up'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* PANEL 3: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Purchase & Order History</h2>
                    <p className="text-xs text-slate-500">Track and manage your enterprise orders, active escrows, and disputes</p>
                  </div>

                  <div className="border border-slate-100 rounded-3xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                          <th className="p-4">Order ID</th>
                          <th className="p-4">Purchased Item</th>
                          <th className="p-4">Transaction Price</th>
                          <th className="p-4">Escrow Status</th>
                          <th className="p-4">Delivery Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        <tr>
                          <td className="p-4 font-mono">#ORD-1002</td>
                          <td className="p-4 flex items-center gap-2">
                            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&auto=format&fit=crop&q=80" alt="ANC Headphones" className="w-8 h-8 rounded-lg object-cover" />
                            <span>Ocean SoundWave ANC Pro</span>
                          </td>
                          <td className="p-4 font-mono">$299.99</td>
                          <td className="p-4"><span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 border border-yellow-100 rounded-full text-[10px]">IN ESCROW</span></td>
                          <td className="p-4"><span className="px-2 py-0.5 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-[10px]">SHIPPED</span></td>
                        </tr>
                        <tr>
                          <td className="p-4 font-mono">#ORD-0923</td>
                          <td className="p-4 flex items-center gap-2">
                            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&auto=format&fit=crop&q=80" alt="Watch" className="w-8 h-8 rounded-lg object-cover" />
                            <span>Ocean Ascent GPS Sport Watch</span>
                          </td>
                          <td className="p-4 font-mono">$349.99</td>
                          <td className="p-4"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px]">RELEASED</span></td>
                          <td className="p-4"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px]">DELIVERED</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PANEL 4: WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">My Curated Wishlist</h2>
                    <p className="text-xs text-slate-500">Items you saved for future procurement and catalog checkouts</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-100 rounded-2xl flex gap-3.5 items-center text-left">
                      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80" alt="ANC Headphones" className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">Ocean SoundWave ANC Pro</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Category: Electronics • Audio</p>
                        <p className="text-xs font-mono font-bold mt-1.5">$299.99</p>
                      </div>
                      <button 
                        onClick={() => onNavigate('/product')} 
                        className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Procure
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 5: COUPONS */}
              {activeTab === 'coupons' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Active Coupons & Promo Keys</h2>
                    <p className="text-xs text-slate-500">Promotional discount codes applicable during catalog item checkouts</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl flex justify-between items-center text-left">
                      <div>
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">10% DIRECT OFF</span>
                        <h4 className="text-xs font-mono font-bold text-slate-900 mt-1.5">WELCOME10</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Valid on your first purchase order.</p>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">READY TO USE</span>
                    </div>

                    <div className="p-4 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl flex justify-between items-center text-left">
                      <div>
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">20% PRIME OFF</span>
                        <h4 className="text-xs font-mono font-bold text-slate-900 mt-1.5">PRIME20</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Exclusive to Ocean Prime membership nodes.</p>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">READY TO USE</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 6: COINS */}
              {activeTab === 'coins' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Loyalty Coins Ledger</h2>
                    <p className="text-xs text-slate-500">Accumulate Loyalty Coins on every transaction purchase and convert to checkout credits</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500 text-white rounded-2xl">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Coins Balance</span>
                        <h4 className="text-2xl font-mono font-bold text-slate-900">{user?.rewardCoins || 10} COINS</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">Redeem Value</p>
                      <p className="text-sm font-mono font-bold text-amber-600">${(user?.rewardCoins ? user.rewardCoins * 0.10 : 1.00).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-3xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900">Recent Coins Transactions Ledger</h3>
                    <div className="divide-y divide-slate-50 text-[11px] text-slate-600">
                      <div className="py-2.5 flex justify-between">
                        <span>Account Registration Bonus</span>
                        <span className="text-emerald-600 font-bold">+10 COINS</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 7: SUBSCRIPTIONS */}
              {activeTab === 'subscriptions' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">System Subscription Management</h2>
                    <p className="text-xs text-slate-500">Deactivate or activate your premium access node licenses and notifications</p>
                  </div>

                  <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Ocean Prime Enterprise Membership</span>
                        <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded">ACTIVE</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">Allows free immediate express delivery, 20% prime coupon benefits, and early checkout releases.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrimeSubscribed(!primeSubscribed)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${primeSubscribed ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
                    >
                      {primeSubscribed ? 'Unsubscribe' : 'Subscribe Prime'}
                    </button>
                  </div>

                  <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">Daily Deals & Flash Sales Alerts</h4>
                      <p className="text-[11px] text-slate-400">Receive flash sale countdown alerts immediately via browser triggers.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAlertsSubscribed(!alertsSubscribed)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${alertsSubscribed ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
                    >
                      {alertsSubscribed ? 'Deactivate Alerts' : 'Activate Alerts'}
                    </button>
                  </div>
                </div>
              )}

              {/* PANEL 8: ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Saved Shipping Addresses</h2>
                    <p className="text-xs text-slate-500">Manage drop points for your standard and express checkouts</p>
                  </div>

                  <div className="space-y-3">
                    {addresses.map((addr, idx) => (
                      <div key={idx} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center text-left">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">Address {idx === 0 ? ' (Primary Delivery Drop)' : `#${idx + 1}`}</p>
                            <p className="text-[11px] text-slate-500 mt-1">{addr}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveAddress(idx)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddAddress} className="flex gap-3 pt-3">
                    <input 
                      type="text"
                      placeholder="Type a new shipping address"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 transition-all"
                    />
                    <button 
                      type="submit" 
                      className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Add Address
                    </button>
                  </form>
                </div>
              )}

              {/* PANEL 9: CARDS */}
              {activeTab === 'cards' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Saved Bank Cards</h2>
                    <p className="text-xs text-slate-500">Add secure sandboxed debit or credit cards for sandbox payments</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cards.map(c => (
                      <div key={c.id} className="p-5 border border-slate-100 bg-slate-50 rounded-2xl flex justify-between items-start text-left">
                        <div className="space-y-2">
                          <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">{c.brand.toUpperCase()}</span>
                          <p className="text-xs font-mono font-bold text-slate-900">•••• •••• •••• {c.last4}</p>
                          <div className="text-[10px] text-slate-400">
                            <p>Holder: {c.holder}</p>
                            <p>Expires: {c.expMonth}/{c.expYear}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveCard(c.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddCard} className="border border-slate-100 p-5 rounded-2xl space-y-4 pt-4">
                    <h3 className="text-xs font-bold text-slate-900">Add Sandbox Card</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        placeholder="Cardholder Name"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 transition-all"
                      />
                      <input 
                        type="text" 
                        placeholder="Card Number"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-slate-900 transition-all"
                      />
                      <input 
                        type="text" 
                        placeholder="Expiry MM/YY"
                        required
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-slate-900 transition-all"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      Save Card Token
                    </button>
                  </form>
                </div>
              )}

              {/* PANEL 10: SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Credential Policies & 2FA</h2>
                    <p className="text-xs text-slate-500">Secure your digital login, change password, and toggle two-factor authentication</p>
                  </div>

                  {/* Change Password */}
                  <div className="space-y-4 border-b border-slate-100 pb-6 text-left">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Change Account Password</h3>
                    
                    {passwordSuccess && (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700">
                        Password updated securely. Use your new password on subsequent logins.
                      </div>
                    )}

                    {passwordError && (
                      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700">
                        {passwordError}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input 
                          type="password" 
                          required
                          placeholder="Current Password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 transition-all"
                        />
                        <input 
                          type="password" 
                          required
                          placeholder="New Password (min 8 chars)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 transition-all"
                        />
                        <input 
                          type="password" 
                          required
                          placeholder="Confirm New Password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 transition-all"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={passwordLoading}
                        className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                      >
                        {passwordLoading ? 'Updating...' : 'Update Password securely'}
                      </button>
                    </form>
                  </div>

                  {/* Two-Factor Authentication (2FA) */}
                  <div className="space-y-4 border-b border-slate-100 pb-6 text-left">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Two-Factor Authentication (2FA)</h3>
                        <p className="text-[11px] text-slate-400 font-medium">Verify your login using a second device OTP layer</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle2FA(!is2FAEnabled)}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${is2FAEnabled ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-950 text-white'}`}
                      >
                        {is2FAEnabled ? 'Disable 2FA' : 'Configure 2FA'}
                      </button>
                    </div>

                    {twoFactorSuccess && (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700">
                        Two-Factor Authentication configuration verified and enabled successfully.
                      </div>
                    )}

                    {show2FAConfig && (
                      <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4 max-w-lg">
                        <div className="flex gap-4">
                          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 flex items-center justify-center font-mono font-bold h-24 w-24 select-none text-[10px]">
                            [ MOCK QR ]
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-xs font-bold">Configure Authenticator App</p>
                            <p className="text-[11px] text-slate-400">Scan QR Code or copy manual setup secret key below in Google Authenticator or Apple Keychain:</p>
                            <p className="font-mono text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 border border-slate-100 rounded inline-block select-all">{twoFactorSecret}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type Simulated Verification Code</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Enter mock code: 123456"
                              value={twoFactorInput}
                              onChange={(e) => setTwoFactorInput(e.target.value)}
                              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-slate-900 transition-all flex-1"
                            />
                            <button 
                              type="button"
                              onClick={handleVerify2FACode}
                              className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-5 rounded-xl text-xs transition-all cursor-pointer"
                            >
                              Verify
                            </button>
                          </div>
                          {twoFactorError && <p className="text-[10px] text-rose-600 font-bold">{twoFactorError}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Security Questions */}
                  <div className="space-y-4 border-b border-slate-100 pb-6 text-left">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Security Challenge Questions</h3>
                    <p className="text-[11px] text-slate-400">Verify account ownership during forgot password workflows</p>
                    
                    {secSuccess && (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700">
                        Security challenge question and answers saved successfully.
                      </div>
                    )}

                    <form onSubmit={handleSaveSecurityQuestions} className="space-y-4 max-w-xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select 
                          value={securityQuestion}
                          onChange={(e) => setSecurityQuestion(e.target.value)}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                        >
                          <option value="first_pet">What was the name of your first pet?</option>
                          <option value="mother_maiden">What is your mother's maiden name?</option>
                          <option value="first_car">What was the make and model of your first car?</option>
                        </select>
                        <input 
                          type="text" 
                          required
                          placeholder="Answer here"
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 transition-all"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                      >
                        Save Challenge Answers
                      </button>
                    </form>
                  </div>

                  {/* Audit Logs */}
                  <div className="space-y-4 text-left">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Security & Login Audit Logs</h3>
                    <p className="text-[11px] text-slate-400">Trace your active and past ledger login timestamps and event logs</p>

                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 border-b border-slate-100 font-bold">
                            <th className="p-3">Timestamp (UTC)</th>
                            <th className="p-3">Action / Event log</th>
                            <th className="p-3">IP Address</th>
                            <th className="p-3">Device / Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                          {securityLogs.length > 0 ? (
                            securityLogs.map((log, idx) => (
                              <tr key={idx}>
                                <td className="p-3">{new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}</td>
                                <td className="p-3 font-semibold text-slate-800">{log.status || 'Success'}</td>
                                <td className="p-3">{log.ip}</td>
                                <td className="p-3">{log.device || 'Authorized Node'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="p-3 text-center text-slate-400" colSpan={4}>No audit logs compiled yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 11: DEVICES */}
              {activeTab === 'devices' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Authorized Companion Sessions</h2>
                    <p className="text-xs text-slate-500">View and terminate other active sessions currently authenticated with your ledger credentials</p>
                  </div>

                  {logoutAllSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700">
                      All other companion sessions have been successfully terminated.
                    </div>
                  )}

                  <div className="space-y-4 text-left">
                    {/* Current Session */}
                    <div className="p-4 border-2 border-slate-900 rounded-3xl flex justify-between items-center">
                      <div className="flex gap-3.5 items-center">
                        <div className="p-2.5 bg-slate-950 text-white rounded-xl">
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Chrome on Linux Container (Current Session)</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">IP: 127.0.0.1 • Irish Cloud Node proxy</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-slate-950 text-white font-bold px-2 py-0.5 rounded-full uppercase">CURRENT</span>
                    </div>

                    {/* Other Sessions */}
                    {companionSessions.map(sess => (
                      <div key={sess.id} className="p-4 border border-slate-100 rounded-3xl flex justify-between items-center bg-slate-50/50">
                        <div className="flex gap-3.5 items-center">
                          <div className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl">
                            {sess.os.includes('iPhone') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{sess.os}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">IP: {sess.ip} • {sess.location}</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded-full uppercase">TRUSTED</span>
                      </div>
                    ))}
                  </div>

                  {companionSessions.length > 0 && (
                    <button
                      type="button"
                      onClick={handleLogoutAllOther}
                      className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-3 rounded-2xl transition-all cursor-pointer border border-rose-100/50"
                    >
                      Logout From All Other Sessions
                    </button>
                  )}
                </div>
              )}

              {/* PANEL 12: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Communication & Notification Settings</h2>
                    <p className="text-xs text-slate-500">Fine-tune the channel triggers where Ocean sends order updates, receipts, and deals</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-slate-100 rounded-3xl flex justify-between items-center text-left">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Direct Email Broadcasts</h4>
                        <p className="text-[10px] text-slate-400">Order invoices, digital receipts, and platform updates</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifEmail} 
                        onChange={(e) => setNotifEmail(e.target.checked)}
                        className="w-9 h-5 rounded-full border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer"
                      />
                    </div>

                    <div className="p-4 border border-slate-100 rounded-3xl flex justify-between items-center text-left">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">SMS Verification Codes & Updates</h4>
                        <p className="text-[10px] text-slate-400">Delivery alerts, security change verifications, and OTP checks</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifSMS} 
                        onChange={(e) => setNotifSMS(e.target.checked)}
                        className="w-9 h-5 rounded-full border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer"
                      />
                    </div>

                    <div className="p-4 border border-slate-100 rounded-3xl flex justify-between items-center text-left">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Browser Push Notifications</h4>
                        <p className="text-[10px] text-slate-400">Real-time flash sale countdown alerts and delivery drops</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifPush} 
                        onChange={(e) => setNotifPush(e.target.checked)}
                        className="w-9 h-5 rounded-full border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer"
                      />
                    </div>

                    <div className="p-4 border border-slate-100 rounded-3xl flex justify-between items-center text-left">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">WhatsApp Merchant Updates</h4>
                        <p className="text-[10px] text-slate-400">Special coupon code alerts and VIP seller invitations</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notifWhatsApp} 
                        onChange={(e) => setNotifWhatsApp(e.target.checked)}
                        className="w-9 h-5 rounded-full border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleProfileUpdate}
                    className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Save Communication Triggers
                  </button>
                </div>
              )}

              {/* PANEL 13: SUPPORT */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Support Terminal Portal</h2>
                    <p className="text-xs text-slate-500">Contact a merchant dispute manager, file a ticket, or read global platform FAQs</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* File a Support Ticket */}
                    <div className="border border-slate-100 p-5 rounded-3xl space-y-4 text-left">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">File a Support Ticket</h3>
                      
                      {ticketSuccess && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-700">
                          Support ticket created successfully. A mediator will review your dispute shortly.
                        </div>
                      )}

                      <form onSubmit={handleCreateTicket} className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Subject of ticket"
                          required
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 transition-all"
                        />
                        <textarea
                          placeholder="Type your message details here..."
                          required
                          rows={3}
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-slate-900 transition-all resize-none"
                        />
                        <button
                          type="submit"
                          disabled={ticketLoading}
                          className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all"
                        >
                          {ticketLoading ? 'Generating ticket...' : 'Create Ticket'}
                        </button>
                      </form>
                    </div>

                    {/* Open Ticket Ledger */}
                    <div className="space-y-4 text-left">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">My Support Tickets</h3>
                      <div className="divide-y divide-slate-100 text-[11px]">
                        {tickets.map((t, i) => (
                          <div key={i} className="py-3 flex justify-between items-center">
                            <div>
                              <p className="font-mono font-bold text-slate-900">{t.id}</p>
                              <p className="text-slate-500 mt-0.5">{t.subject}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' : t.status === 'Open' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {t.status.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 14: PRIVACY */}
              {activeTab === 'privacy' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">Privacy Control Center</h2>
                    <p className="text-xs text-slate-500">Download complete structured backup files or purge your explorer nodes from our memory database</p>
                  </div>

                  {/* Backup data */}
                  <div className="p-5 border border-slate-100 bg-slate-50 rounded-3xl flex justify-between items-center text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">Download Account Profile Data Backup</h4>
                      <p className="text-[11px] text-slate-400">Download a full certified JSON file containing profile, wallet balance, loyalty ledger, and history.</p>
                    </div>
                    <button
                      onClick={handleDownloadData}
                      className="bg-slate-950 hover:bg-slate-800 text-white font-bold p-3 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-xs shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download JSON</span>
                    </button>
                  </div>

                  {/* Purge / delete account */}
                  <div className="p-5 border border-rose-100 bg-rose-50/50 rounded-3xl space-y-4 text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Danger Zone: Permanent Account Deletion</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">This operations is irreversible. Purging deletes wallet balance, loyalty coins, order tracking nodes, and invalidates your login credentials completely.</p>
                    </div>

                    <div className="space-y-2 max-w-md">
                      <label className="block text-[10px] font-bold text-rose-800 uppercase tracking-wider">Type word "DELETE" to authorize purge sequence</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="DELETE"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-rose-500 transition-all flex-1"
                        />
                        <button 
                          onClick={handleDeleteAccount}
                          disabled={deleteLoading}
                          className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                        >
                          {deleteLoading ? 'Purging...' : 'Purge Node'}
                        </button>
                      </div>
                      {deleteError && <p className="text-[10px] text-rose-600 font-bold">{deleteError}</p>}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
