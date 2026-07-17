import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Package, 
  DollarSign, 
  Layers, 
  TrendingUp, 
  Plus, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Activity,
  ArrowUpRight,
  ClipboardList
} from 'lucide-react';
import { Product, UserSession } from '../types';

interface SellerPortalProps {
  user: UserSession;
  onRefreshUser: () => void;
}

export default function SellerPortal({ user, onRefreshUser }: SellerPortalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add-product'>('dashboard');

  // Form states for new product
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [subcategory, setSubcategory] = useState('');
  const [specs, setSpecs] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [image, setImage] = useState('');

  const [description, setDescription] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'success' | 'error'; msg: string } | null>(null);

  // Stock edit states
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [newStockVal, setNewStockVal] = useState('');

  const fetchSellerProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then((data: Product[]) => {
        // Sellers can manage items. Since this is local, let's list all catalog items as customizable by active vendor
        setProducts(data);
      });
  };

  useEffect(() => {
    fetchSellerProducts();
  }, [activeTab]);

  const handleGenerateAIDescription = async () => {
    if (!name || !brand || !category) {
      setFeedback({ status: 'error', msg: 'Name, Brand, and Category are mandatory for AI text generation.' });
      return;
    }

    setIsGeneratingDesc(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/ai/generate-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, brand, category, specs })
      });
      const data = await res.json();
      if (data.description) {
        setDescription(data.description);
      }
    } catch (e) {
      setFeedback({ status: 'error', msg: 'AI Description Generator encountered a network failure.' });
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handlePublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description || !category || !brand) {
      setFeedback({ status: 'error', msg: 'Please complete all required fields and description.' });
      return;
    }

    setIsPublishing(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          brand,
          category,
          subcategory,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          specifications: specs.split('\n').reduce((acc, line) => {
            const parts = line.split(':');
            if (parts.length >= 2) {
              acc[parts[0].trim()] = parts.slice(1).join(':').trim();
            }
            return acc;
          }, {} as Record<string, string>)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ status: 'success', msg: `Successfully published ${name} to live catalog!` });
        // Clear form
        setName('');
        setBrand('');
        setSpecs('');
        setPrice('');
        setStock('20');
        setImage('');
        setDescription('');
        onRefreshUser();
        setTimeout(() => {
          setActiveTab('dashboard');
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ status: 'error', msg: data.error || 'Failed to publish product.' });
      }
    } catch (err) {
      setFeedback({ status: 'error', msg: 'A network failure occurred.' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUpdateStock = (productId: string) => {
    const s = parseInt(newStockVal);
    if (isNaN(s) || s < 0) return;

    fetch(`/api/products/${productId}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: s })
    })
      .then(res => res.json())
      .then(() => {
        setEditingStockId(null);
        setNewStockVal('');
        fetchSellerProducts();
      });
  };

  // Math aggregates for metrics
  const totalSellerStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockItems = products.filter(p => p.stock <= 15).length;

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Merchant Capital
            </span>
            <div className="text-2xl font-black text-white font-mono">${user.walletBalance.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/30 text-teal-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Market Catalog Items
            </span>
            <div className="text-2xl font-black text-white font-mono">{products.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/30 text-cyan-400">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Units In Stock
            </span>
            <div className="text-2xl font-black text-white font-mono">{totalSellerStock}</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/30 text-indigo-400">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Critically Low Stocks
            </span>
            <div className={`text-2xl font-black font-mono ${lowStockItems > 0 ? 'text-yellow-400 animate-pulse' : 'text-slate-300'}`}>
              {lowStockItems}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${lowStockItems > 0 ? 'bg-yellow-950/40 border border-yellow-800/30 text-yellow-400' : 'bg-slate-800 text-slate-400'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex border-b border-slate-800/80 gap-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Catalog Control Center
          {activeTab === 'dashboard' && (
            <motion.div layoutId="selActiveLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('add-product')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'add-product' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Add Product with AI Assist
          {activeTab === 'add-product' && (
            <motion.div layoutId="selActiveLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>
      </div>

      {/* CATALOG DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-slate-400" />
              Platform Inventory Log ({products.length} SKU)
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Live Stock Status
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-800">
              <thead>
                <tr className="text-slate-500 font-bold uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">SKU / Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Stock Units</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-800" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-black text-slate-200 block">{p.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{p.brand} • {p.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">{p.category}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-300 font-mono">${p.price}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-teal-400 font-bold font-mono bg-teal-950/40 border border-teal-900/30 px-2 py-0.5 rounded-lg">
                        {p.rating} ★
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {editingStockId === p.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={newStockVal}
                            onChange={(e) => setNewStockVal(e.target.value)}
                            className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-200"
                            placeholder="Stock"
                          />
                          <button
                            onClick={() => handleUpdateStock(p.id)}
                            className="text-[10px] bg-teal-600 hover:bg-teal-500 text-white px-2 py-0.5 rounded font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${p.stock <= 15 ? 'text-yellow-400 font-black' : 'text-slate-300'}`}>
                            {p.stock} units
                          </span>
                          {p.stock <= 15 && (
                            <span className="text-[9px] bg-yellow-950 text-yellow-400 px-1 py-0.5 rounded font-mono uppercase">
                              Low
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {editingStockId === p.id ? (
                        <button
                          onClick={() => setEditingStockId(null)}
                          className="text-slate-400 hover:text-slate-200 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingStockId(p.id);
                            setNewStockVal(p.stock.toString());
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          Modify Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD PRODUCT FORM */}
      {activeTab === 'add-product' && (
        <form onSubmit={handlePublishProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metadata inputs */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-100 pb-3 border-b border-slate-850">
              New Product Technical Parameters
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-bold">Product Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., NovaWave Smart Projector"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-bold">Brand Line <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., NovaBeam"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-bold">Sector Category <span className="text-red-400">*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-bold">Sub-category</label>
                <input
                  type="text"
                  placeholder="e.g., Audio, Projectors, Keyboards"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-bold">Retail Price ($) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  placeholder="149.99"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-bold">Initial Inventory <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  placeholder="20"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-bold">Thumbnail Image URL</label>
                <input
                  type="text"
                  placeholder="Leave empty for generic photo"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 block font-bold">
                Bulleted Specifications / Attributes (Enter as Key:Value, one per line)
              </label>
              <textarea
                placeholder="Resolution: 1080p Full HD&#10;Brightness: 800 ANSI Lumens&#10;Connectivity: Wi-Fi 6 & Bluetooth"
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none h-24 font-mono resize-none"
              />
            </div>
          </div>

          {/* AI Copywriting & Publishing */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/30 rounded-3xl p-6 shadow-xl space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-5 w-5 text-cyan-400 animate-spin [animation-duration:15s]" />
                  <h3 className="font-extrabold text-sm text-slate-200 tracking-wide">
                    Gemini Copywriting Engine
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Provide title parameters on the left, then click below to draft a highly persuasive, SEO-optimized marketing copy.
                </p>

                <button
                  type="button"
                  onClick={handleGenerateAIDescription}
                  disabled={isGeneratingDesc || !name || !brand}
                  className="w-full bg-slate-950 hover:bg-slate-850 text-cyan-400 font-bold border border-cyan-900/30 rounded-xl py-2.5 text-xs transition-all disabled:opacity-40"
                >
                  {isGeneratingDesc ? 'Generating AI copy...' : '✨ Generate Product Description'}
                </button>

                <div className="space-y-1 pt-2">
                  <label className="text-xs text-slate-400 block font-bold">Marketing copy / Description <span className="text-red-400">*</span></label>
                  <textarea
                    placeholder="AI generated text or manual description goes here..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none h-40 resize-none leading-relaxed font-sans"
                    required
                  />
                </div>
              </div>

              {/* Publish feedback log */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                {feedback && (
                  <div className={`p-3 rounded-xl text-xs flex gap-2 ${
                    feedback.status === 'success' ? 'bg-teal-950 text-teal-400' : 'bg-red-950 text-red-400'
                  }`}>
                    {feedback.status === 'success' ? <CheckCircle className="h-4.5 w-4.5" /> : <AlertTriangle className="h-4.5 w-4.5" />}
                    <span className="font-semibold">{feedback.msg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPublishing || !description}
                  className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg transition-all"
                >
                  {isPublishing ? 'Publishing SKU...' : 'Publish Product to NexusMart'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
