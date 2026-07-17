import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  User, 
  ShoppingBag, 
  CheckCircle2, 
  RotateCcw,
  Volume2,
  X,
  HelpCircle
} from 'lucide-react';
import { Product, ChatMessage } from '../types';

interface AIAssistantProps {
  onAddProductToCart?: (product: Product) => void;
  onNavigateToProduct?: (productId: string) => void;
}

export default function AIAssistant({ onAddProductToCart, onNavigateToProduct }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Welcome to Ocean Customer Support. I am your silent shopping companion. I can compare item specifications, provide size guidance, and help find custom fits. How may I assist you with your shopping experience today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setCatalog(data))
      .catch(err => console.error('Error fetching catalog in support:', err));
  }, []);

  useEffect(() => {
    const handleOpenAssistant = (e: any) => {
      setIsOpen(true);
      if (e.detail?.query) {
        handleSend(e.detail.query);
      }
    };
    window.addEventListener('open-ai-assistant', handleOpenAssistant);
    return () => {
      window.removeEventListener('open-ai-assistant', handleOpenAssistant);
    };
  }, [messages, catalog]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) {
      setInput('');
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.text || "I apologize, I am experiencing a brief connection error. Please let me try that again for you.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Support service error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string, msgId: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking === msgId) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
      utterance.onend = () => setIsSpeaking(null);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(msgId);
    }
  };

  // Find products mentioned in response
  const getRelevantProductsFromMessage = (text: string): Product[] => {
    const found: Product[] = [];
    const textLower = text.toLowerCase();
    
    catalog.forEach(p => {
      const nameParts = p.name.toLowerCase().split(' ');
      const matchName = nameParts.length > 2 
        ? textLower.includes(p.name.toLowerCase()) || (textLower.includes(nameParts[0]) && textLower.includes(nameParts[1]))
        : textLower.includes(p.name.toLowerCase());

      if (matchName || textLower.includes(p.brand.toLowerCase())) {
        if (!found.some(x => x.id === p.id)) {
          found.push(p);
        }
      }
    });
    return found.slice(0, 2);
  };

  const suggestedPrompts = [
    "Tell me about the SoundWave ANC headphones specs",
    "Compare the GPS watch and keyboard specifications",
    "What products are currently in stock?"
  ];

  return (
    <>
      {/* 
        SILENT SUPPORT TRIGGER 
        Elegant, white pill button with subtle drop shadow and HelpCircle icon. 
        Completely free of telemetry and AI-slop neon branding.
      */}
      <button
        id="ai-copilot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4.5 py-3 rounded-full shadow-lg hover:scale-105 border border-gray-800 transition-all font-sans select-none cursor-pointer text-xs font-semibold tracking-wide"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Support & Guidance</span>
      </button>

      {/* Clean, Bright Shopping Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-copilot-console"
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-20 right-6 w-[380px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-120px)] bg-white border border-gray-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex flex-col z-50 overflow-hidden font-sans text-gray-800 text-left"
          >
            {/* Header: Bright white with light gray border */}
            <div className="bg-white p-4.5 border-b border-gray-100 flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <div className="bg-gray-100 p-2 rounded-lg text-black">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-black uppercase tracking-wider">
                    Ocean Support
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-black"></span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-wide">Live Help desk</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-black p-1 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat message threads */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                const relevantProducts = !isUser ? getRelevantProductsFromMessage(m.text) : [];

                return (
                  <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}>
                    
                    {/* Timestamp & Name */}
                    <div className="flex items-center gap-1 text-[9px] font-medium text-gray-400 uppercase tracking-wider px-1">
                      {isUser ? (
                        <>
                          <span>{m.timestamp}</span>
                          <span>• You</span>
                        </>
                      ) : (
                        <>
                          <span>Ocean Guide •</span>
                          <span>{m.timestamp}</span>
                        </>
                      )}
                    </div>

                    {/* Chat Bubble Layout */}
                    <div className={`relative max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                      isUser 
                        ? 'bg-black text-white rounded-tr-none font-medium shadow-xs' 
                        : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                    }`}>
                      <div className="whitespace-pre-line">
                        {m.text}
                      </div>

                      {/* Speaks Voice Button */}
                      {!isUser && (
                        <button
                          onClick={() => handleSpeak(m.text, m.id)}
                          className={`absolute top-2.5 right-2.5 p-0.5 rounded hover:bg-gray-150 transition-colors ${
                            isSpeaking === m.id ? 'text-black animate-pulse' : 'text-gray-300 hover:text-gray-400'
                          }`}
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Interactive matched products widgets */}
                    {relevantProducts.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-black space-y-2 w-[85%]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Suggested Items:
                        </span>
                        {relevantProducts.map(p => (
                          <div 
                            key={p.id} 
                            className="bg-white border border-gray-100 rounded-lg p-2.5 flex gap-2.5 hover:border-black transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                          >
                            <img 
                              src={p.image} 
                              alt={p.name} 
                              className="w-10 h-10 rounded object-cover border border-gray-100 flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0 text-left">
                              <h4 className="font-semibold text-[10px] text-gray-900 truncate">
                                {p.name}
                              </h4>
                              <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                                <span className="font-semibold">${p.price}</span> • <span>{p.rating} ★</span>
                              </p>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    onNavigateToProduct?.(p.id);
                                  }}
                                  className="text-[9px] text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-medium"
                                >
                                  View Item
                                </button>
                                {p.stock > 0 && onAddProductToCart && (
                                  <button
                                    onClick={() => onAddProductToCart(p)}
                                    className="text-[9px] text-white bg-black hover:bg-gray-850 px-2 py-0.5 rounded font-medium flex items-center gap-1 shadow-xs"
                                  >
                                    Add to Bag
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}

              {/* Loader */}
              {isLoading && (
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">Assistant is replying...</span>
                  <div className="bg-white border border-gray-150 rounded-xl px-4 py-2.5 rounded-tl-none text-xs">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Prompts */}
            {messages.length === 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-100 select-none">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Common Inquiries
                </span>
                <div className="flex flex-col gap-1.5">
                  {suggestedPrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(p)}
                      className="text-left text-xs text-gray-600 hover:text-black font-medium hover:underline transition-colors"
                    >
                      ➜ {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Send input footer bar */}
            <div className="p-3.5 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask us anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="bg-black hover:bg-gray-850 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
