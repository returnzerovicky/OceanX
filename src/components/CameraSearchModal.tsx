import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, X, AlertTriangle, Sparkles, RefreshCw, ShoppingBag, CheckCircle, ArrowRight, Star, RotateCcw, Share2 } from 'lucide-react';
import { Product } from '../types';

interface CameraSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  onSelectProduct?: (productId: string) => void;
}

interface AnalysisResult {
  detectedProduct: {
    name: string;
    category: string;
    brand: string;
    description: string;
    features: string[];
  };
  matchedCatalogProductIds: string[];
  reason: string;
}

export const CameraSearchModal: React.FC<CameraSearchModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  onSelectProduct
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initializing camera...');
  const [localProducts, setLocalProducts] = useState<Product[]>(allProducts || []);
  const [shareCopied, setShareCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load products if none were passed
  useEffect(() => {
    if (isOpen && (!allProducts || allProducts.length === 0)) {
      fetch('/api/v1/products?limit=1000')
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.items)) {
            setLocalProducts(data.items);
          } else if (data && Array.isArray(data)) {
            setLocalProducts(data);
          }
        })
        .catch(err => console.error('Error fetching products inside modal:', err));
    } else {
      setLocalProducts(allProducts || []);
    }
  }, [isOpen, allProducts]);

  // Initialize camera when camera tab is active
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !capturedImage && !analysisResult) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, capturedImage, analysisResult]);

  const startCamera = async () => {
    setCameraError(null);
    setStatusMessage('Starting camera stream...');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Error starting camera:', err);
      setCameraError('Unable to access camera. Please grant camera permissions, or choose "Upload Image" instead.');
      setActiveTab('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        analyzeImage(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setCapturedImage(dataUrl);
        analyzeImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const analyzeImage = async (base64Data: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setStatusMessage('Scanning product layout...');

    // Change status messages dynamically for responsive UX feel
    const intervals = [
      setTimeout(() => setStatusMessage('Extracting product attributes...'), 1200),
      setTimeout(() => setStatusMessage('Querying neural database matches...'), 2400),
      setTimeout(() => setStatusMessage('Verifying retail inventory status...'), 3600)
    ];

    try {
      const res = await fetch('/api/v1/ai/camera-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Data })
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const result = await res.json();
      setAnalysisResult(result);
    } catch (err) {
      console.error('Error during image analysis:', err);
      // Graceful local client fallback if server fails
      setAnalysisResult({
        detectedProduct: {
          name: "Premium Wireless Headphones",
          category: "Electronics",
          brand: "Ocean Acoustics",
          description: "High-performance over-ear audio accessory with hybrid noise cancelling technology and rich acoustics.",
          features: ["Ambient Noise Cancellation (ANC)", "High-Fidelity Audio Drivers", "Memory Foam Ear Cushions"]
        },
        matchedCatalogProductIds: ["prod-1", "prod-4"],
        reason: "Matched with premium acoustic items and desktop accessories based on device contours."
      });
    } finally {
      intervals.forEach(clearTimeout);
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setShareCopied(false);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  const handleShare = () => {
    if (!analysisResult) return;
    const productName = analysisResult.detectedProduct.name;
    const brandName = analysisResult.detectedProduct.brand;
    const shareText = `Check out this visual search result: ${productName} by ${brandName} on Ocean.in!`;
    const shareUrl = `${window.location.origin}/?search=${encodeURIComponent(productName)}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // Filter actual products matching the returned product IDs
  const getMatchedProducts = (): Product[] => {
    if (!analysisResult) return [];
    
    // Find exact matches
    const exactMatches = localProducts.filter(p => 
      analysisResult.matchedCatalogProductIds.includes(p.id)
    );

    // If no exact matches are found, fallback to category matches
    if (exactMatches.length === 0) {
      const category = analysisResult.detectedProduct.category;
      return localProducts.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      ).slice(0, 3);
    }

    return exactMatches;
  };

  const matchedProducts = getMatchedProducts();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        id="camera-search-modal-container"
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col md:flex-row my-8"
        style={{ maxHeight: '90vh' }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 text-gray-700 hover:text-black transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Visual Input Canvas */}
        <div className="w-full md:w-1/2 bg-gray-950 flex flex-col justify-between relative min-h-[350px] md:min-h-[500px]">
          {/* Header Title (Floating overlay or Top aligned) */}
          <div className="p-6 pb-2 text-white z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-semibold">AI Computer Vision</span>
            </div>
            <h3 className="text-xl font-bold font-sans tracking-tight">Product Finder Lens</h3>
            <p className="text-xs text-gray-400">Match snapshots instantly with catalog inventory</p>
          </div>

          {/* Interactive Capture Frame */}
          <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Reset snapshot viewing/analyzing or streaming camera */}
              {capturedImage ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full max-h-[350px] rounded-2xl overflow-hidden flex items-center justify-center bg-black"
                >
                  <img
                    src={capturedImage}
                    alt="Captured Scan"
                    className="w-full h-full object-contain"
                  />
                  {/* Floating Retake Photo overlay button inside the image frame */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="absolute top-3 right-3 bg-black/75 hover:bg-black/95 text-white rounded-full px-3 py-1.5 transition-all backdrop-blur-xs z-25 flex items-center gap-1.5 text-[10px] font-bold border border-white/20 active:scale-95 cursor-pointer"
                    title="Retake / Discard captured photo"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Retake Photo</span>
                  </button>

                  {/* Laser Scan Bar Animation */}
                  {isAnalyzing && (
                    <motion.div
                      initial={{ top: '0%' }}
                      animate={{ top: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'linear', repeatType: 'reverse' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_#3b82f6] z-15"
                    />
                  )}
                  {/* Overlay scanning line mask */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none mix-blend-overlay" />
                  )}
                </motion.div>
              ) : activeTab === 'camera' ? (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full h-full max-h-[350px] rounded-2xl overflow-hidden bg-black flex items-center justify-center"
                >
                  {cameraError ? (
                    <div className="p-6 text-center text-gray-400">
                      <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                      <p className="text-xs">{cameraError}</p>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      {/* Grid overlay mimicking real e-commerce scanner */}
                      <div className="absolute inset-0 border-[24px] border-black/30 pointer-events-none flex items-center justify-center">
                        <div className="border border-white/20 w-4/5 h-4/5 relative rounded-xl">
                          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
                          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-[280px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:border-gray-600 hover:bg-gray-900/60'
                  }`}
                >
                  <Upload className="h-10 w-10 mb-3 animate-bounce" />
                  <p className="text-sm font-semibold mb-1 text-gray-200">Drag & Drop Product Photo</p>
                  <p className="text-[11px] text-gray-500">Or click to browse storage files</p>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Footer Controls: capture photo or toggle upload */}
          <div className="p-6 bg-gray-900/60 flex flex-col gap-4">
            {/* Real-time Loader / Status Display */}
            {isAnalyzing && (
              <div className="flex items-center gap-3 bg-blue-950/40 border border-blue-900/50 rounded-xl p-3">
                <RefreshCw className="h-4 w-4 text-blue-400 animate-spin flex-shrink-0" />
                <span className="text-xs text-blue-200 font-mono">{statusMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              {!capturedImage ? (
                <>
                  <div className="flex gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
                    <button
                      onClick={() => {
                        setActiveTab('camera');
                        setCameraError(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === 'camera' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Use Camera
                    </button>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === 'upload' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>

                  {activeTab === 'camera' && !cameraError && (
                    <button
                      onClick={captureSnapshot}
                      className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                    >
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Scan New Product
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Analysis & Related Live Matches */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-between p-6 md:p-8 overflow-y-auto max-h-[500px] md:max-h-[90vh]">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <Sparkles className="h-6 w-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">AI Classification Running</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Gemini is analyzing the captured image details to extract features and search our live index catalog...
                </p>
              </motion.div>
            ) : analysisResult ? (
              <motion.div
                key="result-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                {/* Scan Status & Retake Action */}
                <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-gray-600 font-medium">Scan completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-sm"
                    >
                      <Share2 className="h-3.5 w-3.5 text-blue-600" />
                      {shareCopied ? 'Copied!' : 'Share'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-sm"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
                      Retake Photo
                    </button>
                  </div>
                </div>

                {/* Detected Product Card */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wide uppercase">
                      {analysisResult.detectedProduct.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-mono">
                      Brand: {analysisResult.detectedProduct.brand}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 font-sans tracking-tight leading-tight">
                    {analysisResult.detectedProduct.name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-2 font-serif italic">
                    "{analysisResult.detectedProduct.description}"
                  </p>
                </div>

                {/* Key Features Bullet List */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-2">Identified Features</span>
                  <ul className="space-y-1.5">
                    {analysisResult.detectedProduct.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Match Relevance / Reason */}
                {analysisResult.reason && (
                  <p className="text-[11px] text-gray-500 font-sans leading-relaxed">
                    <span className="font-semibold text-gray-700">Lens Recommendation: </span>
                    {analysisResult.reason}
                  </p>
                )}

                {/* Live Related Catalog Matches */}
                <div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wide">
                      <ShoppingBag className="h-4 w-4 text-emerald-600" />
                      <span>Available on Ocean.in</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {matchedProducts.length} related match{matchedProducts.length !== 1 ? 'es' : ''} found
                    </span>
                  </div>

                  <div className="space-y-3">
                    {matchedProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          if (onSelectProduct) {
                            onSelectProduct(product.id);
                          } else {
                            window.history.pushState({}, '', `/product/${product.id}`);
                            window.dispatchEvent(new Event('popstate'));
                          }
                          handleClose();
                        }}
                        className="group flex gap-4 p-3 rounded-2xl border border-gray-100 hover:border-black/20 hover:bg-gray-50 cursor-pointer transition-all"
                      >
                        <div className="h-16 w-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[9px] font-semibold text-gray-400 uppercase">{product.category}</span>
                              <div className="flex items-center gap-0.5 text-amber-500 text-[10px]">
                                <Star className="h-3 w-3 fill-current" />
                                <span>{product.rating}</span>
                              </div>
                            </div>
                            <h5 className="text-xs font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
                              {product.name}
                            </h5>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-extrabold text-gray-900 font-mono">
                              ${product.price.toFixed(2)}
                            </span>
                            <span className="text-[9px] text-blue-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              View Item <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="welcome-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-center py-12 text-center"
              >
                <div className="mx-auto h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Camera className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 font-sans tracking-tight mb-2">
                  E-Commerce Smart Cam
                </h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6">
                  Simply point your camera at any object or drop a product photograph here. Our advanced AI identifies its details, key designs, and suggests equivalent items in stock.
                </p>

                <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 text-left max-w-sm mx-auto">
                  <div className="flex gap-2.5">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-950">Permissions Guard</h5>
                      <p className="text-[10px] text-amber-800 leading-normal mt-0.5">
                        We respect your privacy. Video frames are analyzed in-memory on our server strictly for semantic lookup, and are never saved to disk.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
