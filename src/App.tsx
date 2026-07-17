import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  MapPin,
  Search,
  ChevronDown,
  ShoppingCart,
  Menu,
  HelpCircle,
  MessageSquare,
  Mic,
  Camera,
  Sparkles,
  History,
  TrendingUp,
  ChevronRight,
  Trash2,
  X
} from 'lucide-react';

import { Product, UserSession } from './types';
import CustomerPortal from './components/CustomerPortal';
import SellerPortal from './components/SellerPortal';
import WarehousePortal from './components/WarehousePortal';
import DeliveryPortal from './components/DeliveryPortal';
import AdminPortal from './components/AdminPortal';
import AIAssistant from './components/AIAssistant';
import AuthWizard from './components/AuthWizard';
import { CameraSearchModal } from './components/CameraSearchModal';
import { COUNTRIES, LANGUAGES, CURRENCIES } from './server/globalPreferencesData';

type UserRole = 'Customer' | 'Seller' | 'Warehouse' | 'Delivery' | 'Admin';

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('Customer');
  const [cart, setCart] = useState<{ product: Product; quantity: number; selectedColor: string; selectedSize: string }[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [searchGlobalQuery, setSearchGlobalQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [triggerSearch, setTriggerSearch] = useState(0);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Delivery Location States (Amazon Style Header)
  const [deliveryPinCode, setDeliveryPinCode] = useState(() => localStorage.getItem('ocean-delivery-pincode') || '788010');
  const [deliveryCity, setDeliveryCity] = useState(() => localStorage.getItem('ocean-delivery-city') || 'Silchar');
  const [deliveryCountry, setDeliveryCountry] = useState(() => localStorage.getItem('ocean-delivery-country') || 'India');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(() => localStorage.getItem('ocean-delivery-pincode') || '788010');
  const [cityInput, setCityInput] = useState(() => localStorage.getItem('ocean-delivery-city') || 'Silchar');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  // Language Preference States (Amazon Style Header)
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('ocean-current-language');
      return saved ? JSON.parse(saved) : { name: 'English', code: 'EN', flag: '🇮🇳' };
    } catch {
      return { name: 'English', code: 'EN', flag: '🇮🇳' };
    }
  });
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');

  // Account Menu States
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Toast / Alert States
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleCategoryNavigation = (categoryName: string) => {
    setActiveRole('Customer');
    setSearchCategory(categoryName);
    const path = `/category/${encodeURIComponent(categoryName)}`;
    window.history.pushState({}, '', path);
    
    const navEvent = new CustomEvent('ocean-category-navigation', {
      detail: { category: categoryName, path }
    });
    window.dispatchEvent(navEvent);
    
    window.dispatchEvent(new Event('popstate'));
    setActiveMegaMenu(null);
  };

  // Enterprise Search States
  const [searchSuggestions, setSearchSuggestions] = useState<any>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  });
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceSearchStatus, setVoiceSearchStatus] = useState<'listening' | 'error' | 'not-supported'>('listening');
  const [voiceErrorMessage, setVoiceErrorMessage] = useState('');
  const recognitionRef = React.useRef<any>(null);

  const handleStartVoiceSearch = () => {
    setVoiceSearchStatus('listening');
    setVoiceErrorMessage('');
    setIsVoiceSearching(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSearchStatus('not-supported');
      // Fallback
      setTimeout(() => {
        setSearchGlobalQuery("Noise Cancelling Headphones");
        saveSearch("Noise Cancelling Headphones");
        setIsVoiceSearching(false);
        window.history.pushState({}, '', `/search?q=${encodeURIComponent("Noise Cancelling Headphones")}`);
        window.dispatchEvent(new Event('popstate'));
      }, 3000);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setVoiceSearchStatus('listening');
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchGlobalQuery(transcript);
          saveSearch(transcript);
          window.history.pushState({}, '', `/search?q=${encodeURIComponent(transcript)}`);
          window.dispatchEvent(new Event('popstate'));
        }
        setIsVoiceSearching(false);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setVoiceSearchStatus('error');
        if (event.error === 'not-allowed') {
          setVoiceErrorMessage('Microphone access is not allowed. Please grant microphone permissions.');
        } else if (event.error === 'no-speech') {
          setVoiceErrorMessage('No speech was detected. Please try speaking again.');
        } else {
          setVoiceErrorMessage(`Speech recognition error: ${event.error || 'Unknown error'}`);
        }
      };

      rec.onend = () => {
        // Auto end
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e: any) {
      console.error('Error starting speech recognition:', e);
      setVoiceSearchStatus('error');
      setVoiceErrorMessage(e.message || 'Could not access speech recognition service.');
    }
  };

  const handleStopVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.error(e);
      }
    }
    setIsVoiceSearching(false);
  };

  const [isImageUploading, setIsImageUploading] = useState(false);
  const [showAiSemanticDialog, setShowAiSemanticDialog] = useState(false);
  const [aiSemanticQueryText, setAiSemanticQueryText] = useState('');
  const [aiSemanticLoading, setAiSemanticLoading] = useState(false);
  const [aiSemanticResult, setAiSemanticResult] = useState<any>(null);

  const saveSearch = (term: string) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(x => x.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (!searchGlobalQuery.trim()) {
      setSearchSuggestions(null);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/v1/search?q=${encodeURIComponent(searchGlobalQuery)}`)
        .then(res => res.json())
        .then(data => {
          setSearchSuggestions(data);
        })
        .catch(err => console.error(err));
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchGlobalQuery]);

  // Load active session user from server on startup
  const fetchSessionUser = () => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setIsSessionLoaded(true);
      })
      .catch(err => {
        console.error('Error fetching user session:', err);
        setUser(null);
        setIsSessionLoaded(true);
      });
  };

  const handleLogout = () => {
    setIsSessionLoaded(false);
    fetch('/api/auth/logout', { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        setUser(null);
        fetchSessionUser();
      })
      .catch(err => {
        console.error('Error logging out:', err);
        setIsSessionLoaded(true);
      });
  };

  useEffect(() => {
    fetchSessionUser();

    // Global capturing listener to instantly catch and heal any broken product images
    const handleGlobalImageError = (e: Event) => {
      const target = e.target;
      if (target instanceof HTMLImageElement) {
        if (target.getAttribute('data-fallback-tried') === 'true') {
          return;
        }
        target.setAttribute('data-fallback-tried', 'true');

        const altText = target.alt || '';
        const category = target.getAttribute('data-category') || '';
        const nameLower = altText.toLowerCase();
        const catLower = category.toLowerCase();
        
        let fallbackUrl = '';
        
        if (nameLower.includes('phone') || nameLower.includes('case') || catLower.includes('mobile') || nameLower.includes('smartphones') || nameLower.includes('nothing') || nameLower.includes('xiaomi') || nameLower.includes('asus')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80';
        } else if (nameLower.includes('charger') || nameLower.includes('power') || nameLower.includes('cable') || nameLower.includes('battery')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80';
        } else if (catLower.includes('electronic') || nameLower.includes('laptop') || nameLower.includes('audio') || nameLower.includes('camera')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80';
        } else if (catLower.includes('fashion') || catLower.includes('apparel') || nameLower.includes('shirt') || nameLower.includes('jacket') || nameLower.includes('dress') || nameLower.includes('shoe')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80';
        } else if (catLower.includes('home') || catLower.includes('kitchen') || nameLower.includes('decor') || nameLower.includes('furniture')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80';
        } else if (catLower.includes('beauty') || nameLower.includes('skincare') || nameLower.includes('cream')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&auto=format&fit=crop&q=80';
        } else if (catLower.includes('book') || nameLower.includes('read') || nameLower.includes('literature')) {
          fallbackUrl = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80';
        } else {
          const seed = encodeURIComponent(altText.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15) || 'ocean-product');
          fallbackUrl = `https://picsum.photos/seed/${seed}/400/400`;
        }
        
        target.src = fallbackUrl;
      }
    };

    window.addEventListener('error', handleGlobalImageError, true);
    return () => {
      window.removeEventListener('error', handleGlobalImageError, true);
    };
  }, []);

  const handleAddProductToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === p.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === p.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        product: p,
        quantity: 1,
        selectedColor: p.variants?.colors?.[0] || 'Default',
        selectedSize: p.variants?.sizes?.[0] || 'Standard'
      }];
    });
  };

  if (!isSessionLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-900 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
          <span className="text-xs font-semibold text-gray-400 tracking-wider">
            Loading Ocean...
          </span>
        </div>
      </div>
    );
  }

  if (!user || !user.isOnboarded) {
    return (
      <AuthWizard
        onAuthSuccess={(updatedUser) => {
          setUser(updatedUser);
        }}
      />
    );
  }

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to open the shopping cart sidebar trigger
  const handleOpenCart = () => {
    const btn = document.getElementById('cart-sidebar-toggle-btn');
    if (btn) btn.click();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans flex flex-col antialiased">
      
      {/* 
        PREMIUM MINIMALIST OCEAN-THEMED STICKY HEADER (NAV BELT 1)
        Elegant dark ocean navy background with sleek high-contrast sky blue and white controls.
      */}
      <header className="sticky top-0 z-40 bg-[#0C2B4E] text-white border-b border-[#0a233f] shadow-md select-none">
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex flex-wrap md:flex-nowrap items-center justify-between gap-x-2 md:gap-x-4 gap-y-2 h-auto md:h-[64px] lg:h-[70px]">
          
            {/* 1. Elegant Ocean Logo with Custom SVG Wave */}
          <div 
            onClick={() => { 
              setActiveRole('Customer'); 
              setActiveProductId(null);
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new Event('popstate'));
            }}
            className="flex flex-col items-start cursor-pointer group px-2 py-1 rounded-md border border-transparent hover:border-white/20 transition-all select-none"
          >
            <div className="flex items-baseline leading-none">
              <span className="font-sans font-bold text-2xl text-white tracking-wider uppercase">
                ocean
              </span>
              <span className="text-xs text-sky-400 font-bold ml-1">.in</span>
            </div>
            {/* Elegant custom-designed wave underline representing a premium ocean wave */}
            <svg className="w-24 h-4 text-sky-400 fill-current mt-0.5 select-none" viewBox="0 0 100 15" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M 2,11 C 20,14 38,6 58,10 C 78,14 90,8 98,2.5 C 99,1.5 99.5,2 98.5,3.5 C 94,10 78,14.5 58,11.5 C 38,8.5 20,15 2,11 Z" 
                className="transition-all duration-300 group-hover:text-sky-300"
              />
            </svg>
          </div>

          {/* 2. Delivery Location Widget (Fully Interactive) */}
          <div 
            onClick={() => setShowLocationModal(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md border border-transparent hover:border-white/20 cursor-pointer transition-all text-left"
          >
            <MapPin className="h-5 w-5 text-sky-400 mt-1.5" />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] text-gray-300 block font-normal">
                Deliver to {user?.isGuest || user?.id === 'guest' ? 'Guest' : (user?.firstName || 'User')}
              </span>
              <span className="text-xs font-bold text-white block truncate max-w-[130px]">
                {deliveryCity} {deliveryPinCode}
              </span>
            </div>
          </div>

          {/* Luxury Rounded Search Bar (Subtle gray theme) with absolute dropdown anchor */}
          <div 
            className="w-full md:flex-1 md:max-w-2xl order-last md:order-none relative pb-1 md:pb-0" 
            onFocus={() => setShowSearchDropdown(true)} 
            onBlur={(e) => {
              // Delay slightly so that click inside the dropdown completes before the dropdown is closed
              setTimeout(() => {
                setShowSearchDropdown(false);
              }, 250);
            }}
          >
            <div className="flex items-center bg-white rounded-md overflow-hidden h-10 md:h-11 border border-transparent focus-within:ring-2 focus-within:ring-sky-400 focus-within:ring-offset-1 focus-within:ring-offset-[#0C2B4E] transition-all duration-200">
              
              {/* Category selector on left */}
              <div className="relative h-full bg-[#f3f3f3] hover:bg-[#e3e3e3] border-r border-gray-300 text-gray-700 flex items-center px-3 gap-1 cursor-pointer select-none transition-colors">
                <select 
                  value={searchCategory}
                  onChange={(e) => {
                    if (e.target.value !== 'All') {
                      handleCategoryNavigation(e.target.value);
                    } else {
                      setSearchCategory('All');
                      setActiveRole('Customer');
                      window.history.pushState({}, '', '/');
                      window.dispatchEvent(new Event('popstate'));
                    }
                  }}
                  className="bg-transparent text-gray-700 text-[11px] font-bold focus:outline-none cursor-pointer pr-4 appearance-none h-full"
                >
                  <option value="All">All</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Home & Kitchen">Home</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Books">Books</option>
                </select>
                <ChevronDown className="absolute right-1.5 top-3.5 h-3 w-3 text-gray-500 pointer-events-none" />
              </div>

              {/* Input text field */}
              <input
                type="text"
                placeholder="Search Ocean.in"
                value={searchGlobalQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setSearchGlobalQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveRole('Customer');
                    const q = searchGlobalQuery.trim();
                    if (q) {
                      saveSearch(q);
                      window.history.pushState({}, '', `/search?q=${encodeURIComponent(q)}`);
                      window.dispatchEvent(new Event('popstate'));
                    }
                  }
                }}
                className="flex-1 bg-white text-gray-900 placeholder-gray-400 px-3 h-full text-xs font-sans font-medium focus:outline-none"
              />

              {/* Advanced search controls inside input */}
              <div className="flex items-center gap-1 px-2 bg-white h-full">
                <button 
                  type="button"
                  onClick={handleStartVoiceSearch}
                  title="Voice Search"
                  className="text-gray-400 hover:text-sky-500 p-1 rounded-full transition-all"
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsImageUploading(true);
                    setTimeout(() => {
                      setSearchGlobalQuery("Leather Sneakers");
                      saveSearch("Leather Sneakers");
                      setIsImageUploading(false);
                      window.history.pushState({}, '', `/search?q=${encodeURIComponent("Leather Sneakers")}`);
                      window.dispatchEvent(new Event('popstate'));
                    }, 3000);
                  }}
                  title="Search by Image"
                  className="text-gray-400 hover:text-sky-500 p-1 rounded-full transition-all"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAiSemanticDialog(true);
                  }}
                  title="AI Semantic Search"
                  className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1 rounded-full transition-all"
                >
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </button>
              </div>

              {/* Clean White/Transparent Search Button */}
              <button 
                onClick={() => {
                  setActiveRole('Customer');
                  const q = searchGlobalQuery.trim();
                  if (q) {
                    saveSearch(q);
                    window.history.pushState({}, '', `/search?q=${encodeURIComponent(q)}`);
                  } else {
                    window.history.pushState({}, '', '/');
                  }
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="bg-white hover:bg-gray-50 text-gray-600 h-full px-5 transition-all flex items-center justify-center cursor-pointer border-l border-gray-150"
              >
                <Search className="h-4.5 w-4.5 text-gray-600 stroke-[2.5]" />
              </button>
            </div>

            {/* Interactive Search Suggestions Dropdown Overlay */}
            <AnimatePresence>
              {showSearchDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 4 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200/80 rounded-2xl shadow-2xl overflow-hidden z-50 text-left"
                >
                  {!searchGlobalQuery.trim() ? (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column: Recent Searches */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <History className="h-3.5 w-3.5" /> Recent Searches
                          </h4>
                          {recentSearches.length > 0 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecentSearches([]);
                                localStorage.removeItem('recentSearches');
                              }}
                              className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5"
                            >
                              <Trash2 className="h-3 w-3" /> Clear All
                            </button>
                          )}
                        </div>
                        {recentSearches.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {recentSearches.map((term, i) => (
                              <button
                                key={i}
                                onMouseDown={() => {
                                  setSearchGlobalQuery(term);
                                  window.history.pushState({}, '', `/search?q=${encodeURIComponent(term)}`);
                                  window.dispatchEvent(new Event('popstate'));
                                }}
                                className="text-xs text-gray-600 hover:text-black text-left py-1.5 px-2 hover:bg-gray-50 rounded-lg flex items-center justify-between"
                              >
                                <span>{term}</span>
                                <ChevronRight className="h-3 w-3 text-gray-300" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic py-2">No recent searches.</p>
                        )}
                      </div>

                      {/* Right Column: Trending Now */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-2">
                          <TrendingUp className="h-3.5 w-3.5" /> Trending Searches
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {["Acoustic Pro", "Workstation Keyboard", "M3 Macbook", "Dual GNSS Watch", "Sustainable Desk"].map((term, i) => (
                            <button
                              key={i}
                              onMouseDown={() => {
                                setSearchGlobalQuery(term);
                                saveSearch(term);
                                window.history.pushState({}, '', `/search?q=${encodeURIComponent(term)}`);
                                window.dispatchEvent(new Event('popstate'));
                              }}
                              className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-black py-1.5 px-3 rounded-full border border-gray-100 transition-all flex items-center gap-1"
                            >
                              <Search className="h-3 w-3 text-gray-400" />
                              <span>{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 max-h-[480px] overflow-y-auto">
                      {!searchSuggestions ? (
                        <div className="flex items-center justify-center p-8 gap-2 text-gray-400 text-xs">
                          <div className="h-4 w-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                          Optimizing suggestions...
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                          {/* Column 1: Products & Related */}
                          <div className="col-span-1 p-2">
                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Matched Products</h5>
                            {searchSuggestions.products && searchSuggestions.products.length > 0 ? (
                              <div className="flex flex-col gap-1.5">
                                {searchSuggestions.products.slice(0, 4).map((p: any) => (
                                  <div
                                    key={p.id}
                                    onMouseDown={() => {
                                      setActiveProductId(p.id);
                                      saveSearch(p.name);
                                      window.history.pushState({}, '', `/product/${p.id}`);
                                      window.dispatchEvent(new Event('popstate'));
                                    }}
                                    className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-all"
                                  >
                                    <img src={p.image} alt={p.name} data-category={p.category} className="w-8 h-8 rounded-md object-cover border border-gray-100" referrerPolicy="no-referrer" />
                                    <div className="flex flex-col overflow-hidden text-left">
                                      <span className="text-xs font-semibold text-gray-800 truncate leading-tight">{p.name}</span>
                                      <span className="text-[10px] text-gray-500 font-mono">${p.price} • {p.brand}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 italic px-2 py-4">No matching products.</p>
                            )}

                            {searchSuggestions.relatedSearches && searchSuggestions.relatedSearches.length > 0 && (
                              <div className="mt-4 border-t border-gray-50 pt-3">
                                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-2">Related Searches</h5>
                                <div className="flex flex-col gap-0.5">
                                  {searchSuggestions.relatedSearches.slice(0, 3).map((term: string, i: number) => (
                                    <button
                                      key={i}
                                      onMouseDown={() => {
                                        setSearchGlobalQuery(term);
                                        saveSearch(term);
                                        window.history.pushState({}, '', `/search?q=${encodeURIComponent(term)}`);
                                        window.dispatchEvent(new Event('popstate'));
                                      }}
                                      className="text-xs text-gray-600 hover:text-black py-1.5 px-2 hover:bg-gray-50 rounded-md text-left flex items-center gap-1.5"
                                    >
                                      <Search className="h-3.5 w-3.5 text-gray-300" />
                                      <span>{term}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Column 2: Brands & Collections */}
                          <div className="col-span-1 p-2">
                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Suggested Brands & Collections</h5>
                            {searchSuggestions.brands && searchSuggestions.brands.length > 0 && (
                              <div className="flex flex-col gap-1 mb-3">
                                {searchSuggestions.brands.slice(0, 3).map((b: any, i: number) => (
                                  <div
                                    key={i}
                                    onMouseDown={() => {
                                      saveSearch(b.name);
                                      window.history.pushState({}, '', b.path);
                                      window.dispatchEvent(new Event('popstate'));
                                    }}
                                    className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer text-xs font-semibold text-gray-700 hover:text-black transition-all"
                                  >
                                    <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold font-mono">B</div>
                                    <span className="truncate">{b.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {searchSuggestions.collections && searchSuggestions.collections.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {searchSuggestions.collections.map((c: any) => (
                                  <div
                                    key={c.id}
                                    onMouseDown={() => {
                                      saveSearch(c.name);
                                      window.history.pushState({}, '', `/collection/${c.id}`);
                                      window.dispatchEvent(new Event('popstate'));
                                    }}
                                    className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-left transition-all border border-transparent hover:border-gray-100"
                                  >
                                    <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                                      <Sparkles className="h-3 w-3 text-yellow-500" /> {c.name}
                                    </div>
                                    <div className="text-[10px] text-gray-400 truncate mt-0.5">{c.description}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 italic px-2 py-4">No matching curations.</p>
                            )}
                          </div>

                          {/* Column 3: Accessories, Cases & Chargers */}
                          <div className="col-span-1 p-2">
                            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Accessories & Adapters</h5>
                            <div className="flex flex-col gap-3">
                              {searchSuggestions.accessories && searchSuggestions.accessories.length > 0 && (
                                <div>
                                  <span className="text-[9px] font-bold text-gray-400 px-2 uppercase block mb-1">Cables & Audio</span>
                                  <div className="flex flex-col gap-1">
                                    {searchSuggestions.accessories.slice(0, 2).map((p: any) => (
                                      <div
                                        key={p.id}
                                        onMouseDown={() => {
                                          setActiveProductId(p.id);
                                          saveSearch(p.name);
                                          window.history.pushState({}, '', `/product/${p.id}`);
                                          window.dispatchEvent(new Event('popstate'));
                                        }}
                                        className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-md cursor-pointer text-left"
                                      >
                                        <img src={p.image} alt={p.name} data-category={p.category} className="w-6 h-6 rounded object-cover" referrerPolicy="no-referrer" />
                                        <span className="text-[11px] text-gray-700 truncate leading-tight font-medium flex-1">{p.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {searchSuggestions.cases && searchSuggestions.cases.length > 0 && (
                                <div>
                                  <span className="text-[9px] font-bold text-gray-400 px-2 uppercase block mb-1">Sleeves & Cases</span>
                                  <div className="flex flex-col gap-1">
                                    {searchSuggestions.cases.slice(0, 2).map((p: any) => (
                                      <div
                                        key={p.id}
                                        onMouseDown={() => {
                                          setActiveProductId(p.id);
                                          saveSearch(p.name);
                                          window.history.pushState({}, '', `/product/${p.id}`);
                                          window.dispatchEvent(new Event('popstate'));
                                        }}
                                        className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-md cursor-pointer text-left"
                                      >
                                        <img src={p.image} alt={p.name} data-category={p.category} className="w-6 h-6 rounded object-cover" referrerPolicy="no-referrer" />
                                        <span className="text-[11px] text-gray-700 truncate leading-tight font-medium flex-1">{p.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {searchSuggestions.chargers && searchSuggestions.chargers.length > 0 && (
                                <div>
                                  <span className="text-[9px] font-bold text-gray-400 px-2 uppercase block mb-1">Power Adapters</span>
                                  <div className="flex flex-col gap-1">
                                    {searchSuggestions.chargers.slice(0, 2).map((p: any) => (
                                      <div
                                        key={p.id}
                                        onMouseDown={() => {
                                          setActiveProductId(p.id);
                                          saveSearch(p.name);
                                          window.history.pushState({}, '', `/product/${p.id}`);
                                          window.dispatchEvent(new Event('popstate'));
                                        }}
                                        className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-md cursor-pointer text-left"
                                      >
                                        <img src={p.image} alt={p.name} data-category={p.category} className="w-6 h-6 rounded object-cover" referrerPolicy="no-referrer" />
                                        <span className="text-[11px] text-gray-700 truncate leading-tight font-medium flex-1">{p.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Right Side Interactive Links (Language, Account Dropdown, Returns, Cart) */}
          <div className="flex items-center gap-1 lg:gap-3 text-white">
            
            {/* 4a. Language Selector Widget (Interactive flag) */}
            <div 
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center gap-1 px-2.5 py-2 rounded-md border border-transparent hover:border-white/20 cursor-pointer transition-all h-[40px] select-none"
              title="Change Language"
            >
              <span className="text-base leading-none">{currentLanguage.flag}</span>
              <span className="text-xs font-bold text-white tracking-wide uppercase">{currentLanguage.code}</span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </div>

            {/* 4b. Account & Lists Dropdown */}
            <div 
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="relative px-2.5 py-1.5 rounded-md border border-transparent hover:border-white/20 cursor-pointer transition-all flex flex-col justify-center leading-tight text-left h-[44px] select-none"
            >
              <span 
                onClick={(e) => {
                  if (!user || user.isGuest || user.id === 'guest') {
                    e.stopPropagation();
                    setShowAuthModal(true);
                  }
                }}
                className="text-[11px] text-gray-300 block font-normal hover:text-white hover:underline transition-all"
              >
                Hello, {user?.isGuest || user?.id === 'guest' ? 'sign in' : (user?.firstName || 'User')}
              </span>
              <span className="text-xs font-bold text-white flex items-center gap-0.5">
                Account & Lists <ChevronDown className="h-3 w-3 text-gray-400" />
              </span>

              {/* Popover Dropdown Panel */}
              <AnimatePresence>
                {showAccountDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 4 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1 bg-white text-gray-800 border border-gray-200 shadow-[0_10px_35px_rgba(0,0,0,0.2)] rounded-lg py-4 px-5 w-64 z-50 text-left font-sans"
                  >
                    {/* Sign-in Call To Action segment */}
                    <div className="border-b border-gray-100 pb-3.5 mb-3 text-center">
                      {user?.isGuest || user?.id === 'guest' ? (
                        <div className="flex flex-col items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAuthModal(true);
                              setShowAccountDropdown(false);
                            }}
                            className="w-full bg-[#0C2B4E] hover:bg-[#091F39] text-white border border-[#0C2B4E] py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                          >
                            Sign In / Register
                          </button>
                          <p className="text-[10px] text-gray-500 mt-1.5">
                            New customer? <span onClick={(e) => { e.stopPropagation(); setShowAuthModal(true); setShowAccountDropdown(false); }} className="text-blue-600 hover:underline cursor-pointer">Start here.</span>
                          </p>
                        </div>
                      ) : (
                        <div className="text-left">
                          <p className="text-xs font-bold text-gray-900">Signed in as</p>
                          <p className="text-xs text-gray-600 truncate">{user?.firstName} {user?.lastName}</p>
                          <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                        </div>
                      )}
                    </div>

                    {/* Quick Access List */}
                    <div className="space-y-2 text-xs">
                      <h5 className="font-bold text-[10px] uppercase text-gray-400 tracking-wider">Your Account</h5>
                      <div 
                        onClick={() => {
                          setShowAccountDropdown(false);
                          setActiveRole('Customer');
                          window.history.pushState({}, '', '/account');
                          window.dispatchEvent(new Event('popstate'));
                        }}
                        className="hover:text-sky-600 cursor-pointer py-0.5 font-medium flex items-center justify-between font-sans transition-colors"
                      >
                        <span>Your Profile & Prefs</span>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </div>
                      <div 
                        onClick={() => {
                          setShowAccountDropdown(false);
                          setActiveRole('Customer');
                          window.history.pushState({}, '', '/orders');
                          window.dispatchEvent(new Event('popstate'));
                        }}
                        className="hover:text-sky-600 cursor-pointer py-0.5 font-medium flex items-center justify-between font-sans transition-colors"
                      >
                        <span>Your Orders</span>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </div>
                      <div 
                        onClick={() => {
                          setShowAccountDropdown(false);
                          setActiveRole('Customer');
                          window.history.pushState({}, '', '/wishlist');
                          window.dispatchEvent(new Event('popstate'));
                        }}
                        className="hover:text-sky-600 cursor-pointer py-0.5 font-medium flex items-center justify-between font-sans transition-colors"
                      >
                        <span>Your Wish List</span>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </div>
                      <div 
                        onClick={() => {
                          setShowAccountDropdown(false);
                          setActiveRole('Customer');
                          window.history.pushState({}, '', '/wallet');
                          window.dispatchEvent(new Event('popstate'));
                        }}
                        className="hover:text-sky-600 cursor-pointer py-0.5 font-medium flex items-center justify-between font-sans transition-colors"
                      >
                        <span>Your Wallet Balance</span>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>

                    {/* Enterprise Role Selector inside Dropdown */}
                    <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                      <h5 className="font-bold text-[10px] uppercase text-gray-400 tracking-wider">Switch View Mode</h5>
                      <div className="relative mt-1">
                        <select
                          value={activeRole}
                          onChange={(e) => {
                            const targetRole = e.target.value as UserRole;
                            setShowAccountDropdown(false);
                            if ((user?.isGuest || user?.id === 'guest') && targetRole !== 'Customer') {
                              setShowAuthModal(true);
                              return;
                            }
                            fetch('/api/auth/switch-role', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ role: targetRole })
                            })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                setActiveRole(targetRole);
                                fetchSessionUser();
                              }
                            })
                            .catch(err => console.error('Error switching role:', err));
                          }}
                          className="w-full bg-gray-50 text-gray-700 text-xs font-semibold px-2 py-1.5 border border-gray-200 rounded focus:outline-none cursor-pointer appearance-none pr-8"
                        >
                          <option value="Customer">🛒 Customer View</option>
                          <option value="Seller">💼 Merchant Partner</option>
                          <option value="Warehouse">📦 Warehouse Node</option>
                          <option value="Delivery">🚚 Delivery Fleet</option>
                          <option value="Admin">🛡️ System Admin</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Sign Out Action button */}
                    {!user?.isGuest && user?.id !== 'guest' && (
                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <button
                          onClick={() => {
                            setShowAccountDropdown(false);
                            handleLogout();
                          }}
                          className="w-full bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-700 text-xs py-1.5 rounded border border-gray-200 transition-all font-medium text-center cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4c. Returns & Orders link */}
            <div 
              onClick={() => {
                setActiveRole('Customer');
                window.history.pushState({}, '', '/orders');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="hidden sm:flex px-2.5 py-1.5 rounded-md border border-transparent hover:border-white/20 cursor-pointer transition-all flex flex-col justify-center leading-tight text-left h-[44px] select-none"
              title="View your orders"
            >
              <span className="text-[11px] text-gray-300 block font-normal">
                Returns
              </span>
              <span className="text-xs font-bold text-white block">
                & Orders
              </span>
            </div>

            {/* 4d. Shopping Cart Icon with Badge */}
            <div 
              id="shopping-cart-button"
              onClick={handleOpenCart}
              className="px-2.5 py-2 rounded-md border border-transparent hover:border-white/20 cursor-pointer transition-all flex items-end gap-1.5 relative h-[44px] select-none"
              title="Open Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="h-6.5 w-6.5 text-white" />
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-sky-500 text-white font-extrabold text-[10px] rounded-full px-1 min-w-[16px] text-center shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
                  {cartItemCount}
                </span>
              </div>
              <span className="text-xs font-bold text-white mt-1 hidden lg:inline">Cart</span>
            </div>

          </div>

        </div>
      </header>

      {/* 
        PREMIUM SUBNAV (NAV BELT 2) WITH ENTERPRISE-GRADE MEGA MENU
        Sleek, bright gray bar with charcoal category options and interactive dropdown flyouts.
      */}
      <div className="relative bg-gray-50/80 border-b border-gray-100 text-xs text-gray-600 select-none z-30">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 md:gap-6 whitespace-nowrap min-w-max pr-4">
            {/* General Curation Links */}
            <span 
              onClick={() => {
                setActiveRole('Customer');
                window.history.pushState({}, '', '/new-releases');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="hover:text-black cursor-pointer font-semibold transition-colors"
            >
              New Releases
            </span>
            <span 
              onClick={() => {
                setActiveRole('Customer');
                window.history.pushState({}, '', '/best-sellers');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="hover:text-black cursor-pointer font-semibold transition-colors"
            >
              Best Sellers
            </span>

            <div className="h-3 w-px bg-gray-200"></div>

            {/* Mega Menu Category Tabs */}
            {[
              { label: 'Electronics', key: 'Electronics', categoryPath: '/category/Electronics' },
              { label: 'Fashion & Apparel', key: 'Fashion', categoryPath: '/category/Fashion Women' },
              { label: 'Home & Kitchen', key: 'Home', categoryPath: '/category/Home & Kitchen' },
              { label: 'Beauty & Personal Care', key: 'Beauty', categoryPath: '/category/Beauty' },
              { label: 'Books & Literature', key: 'Books', categoryPath: '/category/Books' }
            ].map(tab => (
              <div
                key={tab.key}
                onMouseEnter={() => setActiveMegaMenu(tab.key)}
                onMouseLeave={() => setActiveMegaMenu(null)}
                onClick={() => {
                  const categoryName = tab.categoryPath.substring('/category/'.length);
                  handleCategoryNavigation(decodeURIComponent(categoryName));
                }}
                className={`flex items-center gap-1 hover:text-black cursor-pointer py-1 font-semibold transition-all duration-150 ${
                  activeMegaMenu === tab.key ? 'text-black border-b-2 border-black -mb-[12px] pb-[10px]' : ''
                }`}
              >
                <span>{tab.label}</span>
                <ChevronDown className={`h-3 w-3 opacity-60 transition-transform duration-200 ${activeMegaMenu === tab.key ? 'rotate-180 text-black' : ''}`} />
              </div>
            ))}

            <div className="h-3 w-px bg-gray-200"></div>

            <span 
              onClick={() => {
                setActiveRole('Customer');
                window.history.pushState({}, '', '/gifts');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="hover:text-black cursor-pointer font-semibold transition-colors hidden lg:inline"
            >
              Curated Gift Guides
            </span>
            <span 
              onClick={() => {
                setActiveRole('Customer');
                window.history.pushState({}, '', '/brands');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="hover:text-black cursor-pointer font-semibold transition-colors hidden lg:inline"
            >
              Top Brands
            </span>
          </div>

          <div className="text-[11px] text-gray-500 font-medium hidden md:block">
            <span>Special Welcome Offer: Use code </span>
            <span className="text-black font-semibold font-mono bg-white px-1.5 py-0.5 rounded-md border border-gray-200">OCEAN15</span>
            <span> for 15% off at checkout.</span>
          </div>
        </div>

        {/* Interactive Enterprise Mega Menu Panel */}
        <AnimatePresence>
          {activeMegaMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.12 }}
              onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
              onMouseLeave={() => setActiveMegaMenu(null)}
              className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-[0_20px_40px_rgba(0,0,0,0.06)] z-50 overflow-hidden"
            >
              <div className="max-w-[1400px] mx-auto px-8 py-8 grid grid-cols-5 gap-8 text-left">
                {/* Render column 1: Primary Categories */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Explore Categories
                  </h4>
                  <div className="flex flex-col gap-2.5 text-xs text-gray-700 font-semibold">
                    {getMegaMenuItems(activeMegaMenu).categories.map(cat => (
                      <span
                        key={cat.label}
                        onClick={() => {
                          if (cat.path.startsWith('/category/')) {
                            const categoryName = decodeURIComponent(cat.path.substring('/category/'.length));
                            handleCategoryNavigation(categoryName);
                          } else {
                            setActiveRole('Customer');
                            window.history.pushState({}, '', cat.path);
                            window.dispatchEvent(new Event('popstate'));
                            setActiveMegaMenu(null);
                          }
                        }}
                        className="hover:text-black cursor-pointer transition-colors"
                      >
                        {cat.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Render column 2: Specialty / Curated Listings */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Curations & Collections
                  </h4>
                  <div className="flex flex-col gap-2.5 text-xs text-gray-700 font-semibold">
                    {getMegaMenuItems(activeMegaMenu).curations.map(cur => (
                      <span
                        key={cur.label}
                        onClick={() => {
                          setActiveRole('Customer');
                          window.history.pushState({}, '', cur.path);
                          window.dispatchEvent(new Event('popstate'));
                          setActiveMegaMenu(null);
                        }}
                        className="hover:text-black cursor-pointer transition-colors"
                      >
                        {cur.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Render column 3: Premium Partners */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Certified Brands
                  </h4>
                  <div className="flex flex-col gap-2.5 text-xs text-gray-700 font-semibold">
                    {getMegaMenuItems(activeMegaMenu).brands.map(brand => (
                      <span
                        key={brand.label}
                        onClick={() => {
                          setActiveRole('Customer');
                          window.history.pushState({}, '', brand.path);
                          window.dispatchEvent(new Event('popstate'));
                          setActiveMegaMenu(null);
                        }}
                        className="hover:text-black cursor-pointer transition-colors"
                      >
                        {brand.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Render column 4: Featured Spotlight Deal */}
                <div className="col-span-2 bg-gray-50/70 border border-gray-100 rounded-xl p-5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] text-white bg-black px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      CAMPAIGN EXCLUSIVE
                    </span>
                    <h5 className="text-xs font-extrabold text-black tracking-tight leading-snug">
                      {getMegaMenuItems(activeMegaMenu).spotlight.title}
                    </h5>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                      {getMegaMenuItems(activeMegaMenu).spotlight.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const spotlightPath = getMegaMenuItems(activeMegaMenu).spotlight.path;
                      if (spotlightPath.startsWith('/category/')) {
                        const categoryName = decodeURIComponent(spotlightPath.substring('/category/'.length));
                        handleCategoryNavigation(categoryName);
                      } else {
                        setActiveRole('Customer');
                        window.history.pushState({}, '', spotlightPath);
                        window.dispatchEvent(new Event('popstate'));
                        setActiveMegaMenu(null);
                      }
                    }}
                    className="w-full mt-4 bg-black hover:bg-gray-800 text-white py-1.5 rounded-lg text-[10px] font-bold transition-all text-center block"
                  >
                    Access Spotlight Offers
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Container Stage */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto pb-16 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeRole === 'Customer' && (
              <CustomerPortal
                onAddProductToCart={handleAddProductToCart}
                cart={cart}
                setCart={setCart}
                user={user}
                onRefreshUser={fetchSessionUser}
                activeProductId={activeProductId}
                setActiveProductId={setActiveProductId}
                searchGlobalQuery={searchGlobalQuery}
                setSearchGlobalQuery={setSearchGlobalQuery}
                searchCategory={searchCategory}
                setSelectedCategoryState={setSearchCategory}
                triggerSearchCount={triggerSearch}
                onRequireLogin={() => setShowAuthModal(true)}
                onLogout={handleLogout}
                deliveryCountry={deliveryCountry}
                currentLanguageCode={currentLanguage.code}
              />
            )}
            {activeRole === 'Seller' && (
              <SellerPortal 
                user={user}
                onRefreshUser={fetchSessionUser}
              />
            )}
            {activeRole === 'Warehouse' && (
              <WarehousePortal />
            )}
            {activeRole === 'Delivery' && (
              <DeliveryPortal />
            )}
            {activeRole === 'Admin' && (
              <AdminPortal />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Subtle support chat assistant (styled like a professional live support desk) */}
      <AIAssistant 
        onAddProductToCart={handleAddProductToCart}
        onNavigateToProduct={(productId) => {
          setActiveRole('Customer');
          setActiveProductId(productId);
        }}
      />

      {/* 
        PREMIUM MINIMALIST PUBLIC FOOTER
        Sleek, luxury-focused public site footer. Contains no developer controls or telemetry.
      */}
      <footer className="bg-white border-t border-gray-100 text-gray-500 text-sm mt-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          <div>
            <h4 className="text-black font-semibold text-sm uppercase tracking-wider mb-4">Ocean Story</h4>
            <ul className="space-y-3 text-xs text-gray-500 font-medium">
              <li onClick={() => { window.history.pushState({}, '', '/about'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Our Ethos</li>
              <li onClick={() => { window.history.pushState({}, '', '/trending'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Curated Selections</li>
              <li onClick={() => { window.history.pushState({}, '', '/sustainability'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Sustainable Logistics</li>
              <li onClick={() => { window.history.pushState({}, '', '/press'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Press & Publications</li>
            </ul>
          </div>
          <div>
            <h4 className="text-black font-semibold text-sm uppercase tracking-wider mb-4">Business & Partners</h4>
            <ul className="space-y-3 text-xs text-gray-500 font-medium">
              <li onClick={() => { window.history.pushState({}, '', '/partners'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Curators on Ocean</li>
              <li onClick={() => { window.history.pushState({}, '', '/gift-cards'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Corporate Gifting</li>
              <li onClick={() => { window.history.pushState({}, '', '/supplier-portal'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Supplier Directory</li>
              <li onClick={() => { window.history.pushState({}, '', '/brand-registry'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Brand Registry</li>
            </ul>
          </div>
          <div>
            <h4 className="text-black font-semibold text-sm uppercase tracking-wider mb-4">Payment & Gifting</h4>
            <ul className="space-y-3 text-xs text-gray-500 font-medium">
              <li onClick={() => { window.history.pushState({}, '', '/membership'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Ocean Premium Membership</li>
              <li onClick={() => { window.history.pushState({}, '', '/gift-cards'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Corporate Gift Cards</li>
              <li onClick={() => { window.history.pushState({}, '', '/wallet'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Redeem Credits</li>
              <li onClick={() => { window.history.pushState({}, '', '/privacy'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Card Protection</li>
            </ul>
          </div>
          <div>
            <h4 className="text-black font-semibold text-sm uppercase tracking-wider mb-4">Customer Support</h4>
            <ul className="space-y-3 text-xs text-gray-500 font-medium">
              <li onClick={() => { window.history.pushState({}, '', '/orders'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Your Order Status</li>
              <li onClick={() => { window.history.pushState({}, '', '/support'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Curator Protection</li>
              <li onClick={() => { window.history.pushState({}, '', '/shipping'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Express Courier Delivery</li>
              <li onClick={() => { window.history.pushState({}, '', '/returns'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer transition-colors">Return Policy</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 py-8 px-6 text-center text-xs text-gray-400">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-widest text-black select-none uppercase">
                Ocean
              </span>
              <span>© 2026 Ocean Inc. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-4 text-gray-400">
              <span onClick={() => { window.history.pushState({}, '', '/terms'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span onClick={() => { window.history.pushState({}, '', '/privacy'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer">Privacy Charter</span>
              <span>•</span>
              <span onClick={() => { window.history.pushState({}, '', '/accessibility'); window.dispatchEvent(new Event('popstate')); }} className="hover:text-black cursor-pointer">Compliance</span>
            </div>
          </div>
        </div>
      </footer>

       {/* 1. Voice Search Modal Overlay */}
      <AnimatePresence>
        {isVoiceSearching && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative"
            >
              <button 
                onClick={handleStopVoiceSearch} 
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-all"
              >
                <X className="h-5 w-5" />
              </button>
              
              {voiceSearchStatus === 'listening' && (
                <>
                  <div className="mx-auto h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center animate-pulse mb-6">
                    <Mic className="h-10 w-10 animate-bounce" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Listening...</h3>
                  <p className="text-xs text-gray-500 mb-6">Try saying "Noise Cancelling Headphones" or "Premium Leather Shoes"</p>
                  
                  {/* Animated audio bars */}
                  <div className="flex items-center justify-center gap-1.5 h-10">
                    {[1, 2, 3, 4, 5, 6, 7].map((b) => (
                      <motion.div
                        key={b}
                        animate={{ height: [12, Math.random() * 32 + 10, 12] }}
                        transition={{ repeat: Infinity, duration: 0.6 + b * 0.1, ease: "easeInOut" }}
                        className="w-1.5 bg-red-400 rounded-full"
                      />
                    ))}
                  </div>
                </>
              )}

              {voiceSearchStatus === 'error' && (
                <>
                  <div className="mx-auto h-20 w-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-6">
                    <Mic className="h-10 w-10 opacity-50" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Voice Search Error</h3>
                  <p className="text-xs text-red-600 mb-4 bg-red-50 p-3 rounded-xl leading-normal">{voiceErrorMessage}</p>
                  <p className="text-[10px] text-gray-400 leading-normal">Please make sure microphone access is granted in your browser settings and the AI Studio frame permissions are active.</p>
                </>
              )}

              {voiceSearchStatus === 'not-supported' && (
                <>
                  <div className="mx-auto h-20 w-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Mic className="h-10 w-10" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Speech Recognition</h3>
                  <p className="text-xs text-gray-500 mb-4 leading-normal">Web Speech API is not supported in this environment.</p>
                  <p className="text-xs text-blue-600 font-semibold bg-blue-50 py-1.5 px-3 rounded-lg animate-pulse inline-block">Starting fallback demo search...</p>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Real AI Product Lens / Camera Search Modal */}
      <AnimatePresence>
        {isImageUploading && (
          <CameraSearchModal
            isOpen={isImageUploading}
            onClose={() => setIsImageUploading(false)}
            allProducts={[]}
            onSelectProduct={(productId) => {
              setActiveProductId(productId);
              window.history.pushState({}, '', `/product/${productId}`);
              window.dispatchEvent(new Event('popstate'));
            }}
          />
        )}
      </AnimatePresence>

      {/* 3. AI Semantic Search Modal Dialog */}
      <AnimatePresence>
        {showAiSemanticDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left"
            >
              <button 
                onClick={() => {
                  setShowAiSemanticDialog(false);
                  setAiSemanticResult(null);
                  setAiSemanticQueryText('');
                }} 
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-all"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">AI Semantic Search</h3>
                  <p className="text-[11px] text-gray-500">Describe what you need in plain natural language</p>
                </div>
              </div>

              <div className="mb-4">
                <textarea
                  rows={3}
                  placeholder='e.g., "I want some high quality noise cancelling headphones with soft ear cups for long flights"'
                  value={aiSemanticQueryText}
                  onChange={(e) => setAiSemanticQueryText(e.target.value)}
                  className="w-full border border-gray-200/80 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 resize-none font-sans"
                />
              </div>

              {aiSemanticResult && (
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 mb-4 text-xs">
                  <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Translation Successful:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-gray-700 mb-2">
                    <div>Category: <span className="text-purple-700 font-mono">{aiSemanticResult.category}</span></div>
                    <div>Search term: <span className="text-purple-700 font-mono">"{aiSemanticResult.query}"</span></div>
                  </div>
                  <p className="text-[10px] text-gray-500 italic leading-snug">{aiSemanticResult.explanation}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAiSemanticDialog(false);
                    setAiSemanticResult(null);
                    setAiSemanticQueryText('');
                  }}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 rounded-full text-xs transition-all border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={aiSemanticLoading || !aiSemanticQueryText.trim()}
                  onClick={() => {
                    setAiSemanticLoading(true);
                    fetch('/api/v1/ai/semantic-search', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ query: aiSemanticQueryText })
                    })
                      .then(res => res.json())
                      .then(data => {
                        setAiSemanticResult(data);
                        setAiSemanticLoading(false);
                        setTimeout(() => {
                          setShowAiSemanticDialog(false);
                          setSearchGlobalQuery(data.query);
                          saveSearch(data.query);
                          if (data.category && data.category !== 'All') {
                            setSearchCategory(data.category);
                            window.history.pushState({}, '', `/category/${encodeURIComponent(data.category)}?q=${encodeURIComponent(data.query)}`);
                          } else {
                            window.history.pushState({}, '', `/search?q=${encodeURIComponent(data.query)}`);
                          }
                          window.dispatchEvent(new Event('popstate'));
                          setAiSemanticResult(null);
                          setAiSemanticQueryText('');
                        }, 2000);
                      })
                      .catch(err => {
                        console.error(err);
                        setAiSemanticLoading(false);
                      });
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-full text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {aiSemanticLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      AI Translating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Translate Query
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthModal && (
          <AuthWizard
            isModal={true}
            initialStep="login"
            onClose={() => setShowAuthModal(false)}
            onAuthSuccess={(updatedUser) => {
              setUser(updatedUser);
              setShowAuthModal(false);
              fetchSessionUser();
            }}
          />
        )}
      </AnimatePresence>

      {/* Location Selector Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-gray-900 border border-gray-100 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-sky-500" />
                  Choose your delivery location
                </h3>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Section A: Enter Pin Code & City */}
                <div className="space-y-3 bg-sky-50/20 border border-sky-100/50 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Provide a PIN Code / Postal Address</h4>
                  <p className="text-[11px] text-sky-700 font-medium">Enter your local PIN code and city to check accurate shipping speeds and local options.</p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">PIN / Postal Code</label>
                      <input
                        type="text"
                        value={pincodeInput}
                        onChange={(e) => setPincodeInput(e.target.value)}
                        placeholder="788010"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">City / Region</label>
                      <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        placeholder="Silchar"
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDeliveryPinCode(pincodeInput);
                      setDeliveryCity(cityInput);
                      localStorage.setItem('ocean-delivery-pincode', pincodeInput);
                      localStorage.setItem('ocean-delivery-city', cityInput);
                      setShowLocationModal(false);
                      setToastMessage(`Delivery location updated to ${cityInput} (${pincodeInput})`);
                    }}
                    className="w-full mt-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm"
                  >
                    Apply Local Address
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-4">
                  <hr className="w-full border-gray-100" />
                  <span className="absolute bg-white px-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">OR SELECT COUNTRY/REGION</span>
                </div>

                {/* Section B: Search Country / Region */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search from 100+ countries..."
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:bg-white focus:border-gray-300 transition-all"
                    />
                    {countrySearchQuery && (
                      <button
                        onClick={() => setCountrySearchQuery('')}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Scrollable list of filtered countries */}
                  <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 max-h-64 overflow-y-auto font-sans bg-gray-50/20">
                    {COUNTRIES.filter(country =>
                      country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
                      country.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
                    ).map((country) => {
                      const isSelected = deliveryCountry.toLowerCase() === country.name.toLowerCase();
                      return (
                        <div
                          key={country.code}
                          onClick={() => {
                            setDeliveryCountry(country.name);
                            localStorage.setItem('ocean-delivery-country', country.name);
                            
                            // Automatically update city and postal code based on selected country fallback
                            let defaultCity = 'Capital City';
                            let defaultPin = '000000';
                            if (country.name === 'India') {
                              defaultCity = 'Silchar';
                              defaultPin = '788010';
                            } else if (country.name === 'United States') {
                              defaultCity = 'Seattle';
                              defaultPin = '98101';
                            } else if (country.name === 'United Kingdom') {
                              defaultCity = 'London';
                              defaultPin = 'EC1A';
                            } else if (country.name === 'Canada') {
                              defaultCity = 'Toronto';
                              defaultPin = 'M5H';
                            } else if (country.name === 'Germany') {
                              defaultCity = 'Munich';
                              defaultPin = '80331';
                            } else if (country.name === 'Japan') {
                              defaultCity = 'Tokyo';
                              defaultPin = '100-0001';
                            } else if (country.name === 'Australia') {
                              defaultCity = 'Sydney';
                              defaultPin = '2000';
                            } else if (country.name === 'UAE') {
                              defaultCity = 'Dubai';
                              defaultPin = '00000';
                            }

                            setDeliveryCity(defaultCity);
                            setDeliveryPinCode(defaultPin);
                            setPincodeInput(defaultPin);
                            setCityInput(defaultCity);
                            localStorage.setItem('ocean-delivery-city', defaultCity);
                            localStorage.setItem('ocean-delivery-pincode', defaultPin);

                            // Find and update Language if available for this country
                            if (country.languages && country.languages.length > 0) {
                              const firstLangName = country.languages[0];
                              const matchLang = LANGUAGES.find(l => l.name.toLowerCase() === firstLangName.toLowerCase());
                              const langObj = {
                                name: firstLangName,
                                code: matchLang ? matchLang.code.toUpperCase() : 'EN',
                                flag: country.flag
                              };
                              setCurrentLanguage(langObj);
                              localStorage.setItem('ocean-current-language', JSON.stringify(langObj));
                            }

                            setShowLocationModal(false);
                            setToastMessage(`Preferences customized to ${country.name}. Language & local offerings adjusted!`);
                          }}
                          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-sky-50/60 font-bold text-sky-900' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl leading-none">{country.flag}</span>
                            <div className="text-xs">
                              <span className="font-semibold">{country.name}</span>
                              <span className="text-gray-400 font-mono text-[10px] ml-1.5">({country.code})</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-right">
                            <div className="text-[10px] text-gray-500 font-mono">
                              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">{country.currency}</span>
                            </div>
                            {isSelected && (
                              <span className="text-sky-500 text-xs font-bold">Active</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Language Preferences Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-gray-900 border border-gray-100 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xl leading-none">🌐</span>
                  Language Settings
                </h3>
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Select your preferred language for shopping, communication, and real-time localized listings.
                </p>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={languageSearchQuery}
                    onChange={(e) => setLanguageSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:bg-white focus:border-gray-300 transition-all"
                  />
                </div>

                {/* Language list */}
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 max-h-60 overflow-y-auto font-sans bg-gray-50/20">
                  {LANGUAGES.filter(lang => 
                    lang.name.toLowerCase().includes(languageSearchQuery.toLowerCase()) || 
                    lang.code.toLowerCase().includes(languageSearchQuery.toLowerCase())
                  ).map((lang) => {
                    const isSelected = currentLanguage.name.toLowerCase() === lang.name.toLowerCase();
                    return (
                      <div
                        key={lang.code}
                        onClick={() => {
                          const langObj = {
                            name: lang.name,
                            code: lang.code.toUpperCase(),
                            flag: currentLanguage.flag // Keep current country flag
                          };
                          setCurrentLanguage(langObj);
                          localStorage.setItem('ocean-current-language', JSON.stringify(langObj));
                          setShowLanguageModal(false);
                          setToastMessage(`Language preference set to ${lang.name} (${lang.code.toUpperCase()})`);
                        }}
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-sky-50/60 font-bold text-sky-900' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold">{lang.name}</span>
                          <span className="text-gray-400 font-mono text-[10px] uppercase">({lang.code})</span>
                        </div>
                        {isSelected && (
                          <span className="text-sky-500 text-xs font-bold">Selected</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating sliding interactive toast alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 font-sans text-xs font-semibold border border-slate-800"
          >
            <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></div>
            <span>{toastMessage}</span>
            <button 
              onClick={() => setToastMessage(null)} 
              className="text-gray-400 hover:text-white ml-2 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getMegaMenuItems(category: string) {
  const data: Record<string, {
    categories: { label: string; path: string }[];
    curations: { label: string; path: string }[];
    brands: { label: string; path: string }[];
    spotlight: { title: string; description: string; path: string };
  }> = {
    'Electronics': {
      categories: [
        { label: 'Mobiles', path: '/category/Mobiles' },
        { label: 'Laptops', path: '/category/Laptops' },
        { label: 'Gaming', path: '/gaming' },
        { label: 'TV', path: '/category/Electronics' },
        { label: 'Camera', path: '/category/Electronics' },
        { label: 'Accessories', path: '/category/Accessories' },
        { label: 'Audio', path: '/category/Electronics' },
        { label: 'Smart Home', path: '/category/Smart%20Home' }
      ],
      curations: [
        { label: 'Futuristic Gaming Zone', path: '/gaming' },
        { label: "Editor's Choice Tech", path: '/editors-choice' },
        { label: 'New Technology Releases', path: '/new-releases' },
        { label: 'Premium Luxury Computing', path: '/luxury' }
      ],
      brands: [
        { label: 'Sony Direct Store', path: '/brand/Sony' },
        { label: 'Apple Certified Store', path: '/brand/Sony' },
        { label: 'ASUS Republic Store', path: '/brand/Sony' }
      ],
      spotlight: {
        title: "The Next-Gen Audio Drop.",
        description: "Up to 30% off high-fidelity acoustic headphones, true-wireless ambient earbuds, and surround soundstages.",
        path: "/category/Electronics"
      }
    },
    'Fashion': {
      categories: [
        { label: 'Men', path: '/category/Fashion Men' },
        { label: 'Women', path: '/category/Fashion Women' },
        { label: 'Kids', path: '/category/Kids' },
        { label: 'Shoes', path: '/category/Shoes' },
        { label: 'Watches', path: '/category/Fashion Men' },
        { label: 'Bags', path: '/category/Fashion Women' },
        { label: 'Jewellery', path: '/category/Fashion Women' }
      ],
      curations: [
        { label: 'Best Selling Outfits', path: '/best-sellers' },
        { label: 'Trending Apparel', path: '/trending' },
        { label: 'Fashion Deals of the Day', path: '/deals' },
        { label: 'Seasonal Outfits Campaign', path: '/seasonal' }
      ],
      brands: [
        { label: 'Nike Store Front', path: '/brand/Nike' },
        { label: 'Patagonia Premium Wear', path: '/brand/Nike' },
        { label: 'Levi Strauss Certified', path: '/brand/Nike' }
      ],
      spotlight: {
        title: "Sustainable Apparel Campaigns.",
        description: "Breathe in recycled knit fibers, lightweight warmth down coats, and functional modern garments.",
        path: "/category/Fashion Women"
      }
    },
    'Home': {
      categories: [
        { label: 'Kitchen', path: '/category/Kitchen' },
        { label: 'Furniture', path: '/category/Furniture' },
        { label: 'Lighting', path: '/category/Home & Kitchen' },
        { label: 'Decor', path: '/category/Home & Kitchen' },
        { label: 'Storage', path: '/category/Home & Kitchen' },
        { label: 'Cleaning', path: '/category/Home & Kitchen' }
      ],
      curations: [
        { label: 'Premium Smart Home Setups', path: '/gaming' },
        { label: 'Sustainable Living', path: '/luxury' },
        { label: 'Home Decor of the Day', path: '/deals' }
      ],
      brands: [
        { label: 'Dyson Certified Store', path: '/brand/Sony' },
        { label: 'Herman Miller Direct', path: '/brand/Sony' },
        { label: 'Philips Ambient Hue', path: '/brand/Sony' }
      ],
      spotlight: {
        title: "Ergonomic Evolution.",
        description: "Invest in spinal longevity, posture-positive workspaces, and task-oriented atmospheric desks.",
        path: "/category/Home & Kitchen"
      }
    },
    'Beauty': {
      categories: [
        { label: 'Bioactive Skincare', path: '/category/Beauty' },
        { label: 'Organic Nutrients', path: '/category/Beauty' },
        { label: 'Solar & Hydration Care', path: '/category/Beauty' }
      ],
      curations: [
        { label: 'Luxury Skincare Serums', path: '/luxury' },
        { label: 'Trending Beauty Rituals', path: '/trending' },
        { label: "Editor's Choice Botanicals", path: '/editors-choice' }
      ],
      brands: [
        { label: 'Aesop Direct Store', path: '/brand/Sony' },
        { label: 'Shiseido Global', path: '/brand/Sony' },
        { label: 'The Ordinary Labs', path: '/brand/Sony' }
      ],
      spotlight: {
        title: "Botanical Skincare Routine.",
        description: "Nourish cellular elasticity with daily minerals, moisture-locking botanicals, and clean ingredients.",
        path: "/category/Beauty"
      }
    },
    'Books': {
      categories: [
        { label: 'Curated Technical Records', path: '/category/Books' },
        { label: 'Timeless Literature', path: '/category/Books' },
        { label: 'Educational Playbooks', path: '/category/Books' }
      ],
      curations: [
        { label: 'Best Selling Novels', path: '/best-sellers' },
        { label: 'New Historical Releases', path: '/new-releases' },
        { label: 'Ocean Library Favorites', path: '/editors-choice' }
      ],
      brands: [
        { label: 'MIT Press Archives', path: '/brand/Sony' },
        { label: 'Taschen Design Volumes', path: '/brand/Sony' },
        { label: 'Penguin Classics', path: '/brand/Sony' }
      ],
      spotlight: {
        title: "Design Heritage Monographs.",
        description: "Expand your mind with high-contrast architectural logs, luxury artist collections, and visual books.",
        path: "/category/Books"
      }
    }
  };
  return data[category] || { categories: [], curations: [], brands: [], spotlight: { title: '', description: '', path: '' } };
}
