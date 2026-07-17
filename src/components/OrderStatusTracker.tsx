import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Package, 
  Truck, 
  MapPin, 
  HelpCircle, 
  Compass, 
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { Order, OrderTimelineEvent } from '../types';

interface OrderStatusTrackerProps {
  order: Order;
  onStatusUpdated?: () => void;
}

const MILESTONES = [
  { status: 'Pending', label: 'Placed', desc: 'Order received', icon: FileText },
  { status: 'Confirmed', label: 'Confirmed', desc: 'Payment secure', icon: ShieldCheck },
  { status: 'Processing', label: 'Processed', desc: 'Package prepared', icon: Package },
  { status: 'Shipped', label: 'Shipped', desc: 'In transit', icon: Truck },
  { status: 'Delivered', label: 'Delivered', desc: 'Package received', icon: Check }
];

export default function OrderStatusTracker({ order, onStatusUpdated }: OrderStatusTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState<string>(order.status);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStatus, setDemoStatus] = useState<string>(order.status);
  const [updating, setUpdating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Sync internal state when order prop changes
  useEffect(() => {
    if (!isDemoMode) {
      setCurrentStatus(order.status);
      setDemoStatus(order.status);
    }
  }, [order.status, isDemoMode]);

  const activeStatus = isDemoMode ? demoStatus : currentStatus;

  // Map status string to index
  const getStatusIndex = (statusStr: string): number => {
    const idx = MILESTONES.findIndex(m => m.status.toLowerCase() === statusStr.toLowerCase());
    return idx === -1 ? 0 : idx;
  };

  const activeIdx = getStatusIndex(activeStatus);
  const progressPercent = (activeIdx / (MILESTONES.length - 1)) * 100;

  // Calculate estimated delivery: 3 days after creation
  const getEstimatedDelivery = () => {
    try {
      const placedDate = new Date(order.createdAt);
      placedDate.setDate(placedDate.getDate() + 3);
      return placedDate.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Within 3 business days';
    }
  };

  // Simulate pushing a new timeline event on the client side for testing
  const handleSimulateNextStage = () => {
    setUpdating(true);
    setTimeout(() => {
      const currentIdx = getStatusIndex(demoStatus);
      const nextIdx = (currentIdx + 1) % MILESTONES.length;
      const nextStatusObj = MILESTONES[nextIdx];
      
      setDemoStatus(nextStatusObj.status);
      setFeedbackMessage(`Simulated milestone: ${nextStatusObj.label}`);
      setUpdating(false);

      setTimeout(() => setFeedbackMessage(null), 2500);
    }, 450);
  };

  const handleResetDemo = () => {
    setDemoStatus(order.status);
    setFeedbackMessage('Reset simulator to actual database status');
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  return (
    <div id={`order-tracker-${order.id}`} className="bg-slate-50/50 border border-slate-150/80 rounded-2xl p-5 md:p-6 space-y-6 text-left">
      
      {/* Top Quick Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight font-sans">
              Delivery Logistics Progress
            </h3>
            {isDemoMode && (
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono animate-pulse">
                Live Simulator Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Real-time milestone tracker for your package transit.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsDemoMode(!isDemoMode);
              if (!isDemoMode) {
                setDemoStatus(order.status);
              }
            }}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer ${
              isDemoMode 
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-300/30' 
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isDemoMode ? 'Exit Interactive Demo' : 'Interactive Simulator'}</span>
          </button>
        </div>
      </div>

      {/* Main Stepper Container */}
      <div className="relative pt-6 pb-10 px-4 md:px-6">
        
        {/* Background Track Line */}
        <div className="absolute left-6 right-6 top-[44px] h-[3px] bg-slate-200/60 rounded-full" />

        {/* Animated Progress Track Line */}
        <div className="absolute left-6 right-6 top-[44px] h-[3px]">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="h-full bg-slate-900 rounded-full shadow-xs"
          />
        </div>

        {/* Floating Driving Delivery Truck */}
        <div className="absolute left-6 right-6 top-[28px] h-0 pointer-events-none">
          <motion.div
            initial={{ left: '0%' }}
            animate={{ left: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-md shadow-slate-100/50"
          >
            <Truck className="w-4 h-4 text-slate-900" />
          </motion.div>
        </div>

        {/* Milestones Steppers */}
        <div className="relative flex justify-between items-center w-full">
          {MILESTONES.map((milestone, idx) => {
            const isCompleted = idx < activeIdx;
            const isActive = idx === activeIdx;
            const isPending = idx > activeIdx;
            
            const IconComponent = milestone.icon;

            return (
              <div key={milestone.status} className="flex flex-col items-center text-center relative z-10 select-none">
                {/* Stepper Node Bubble */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                    isCompleted 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                      : isActive 
                        ? 'bg-white border-slate-900 text-slate-900 ring-4 ring-slate-100 shadow-sm font-bold' 
                        : 'bg-white border-slate-200 text-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4.5 h-4.5 stroke-[3px]" />
                  ) : (
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-slate-900 stroke-[2.5px]' : 'text-slate-400'}`} />
                  )}
                </motion.div>

                {/* Milestone Text Info */}
                <div className="absolute top-12 w-20 md:w-24 flex flex-col items-center">
                  <span className={`text-[11px] font-bold block leading-none ${
                    isActive ? 'text-slate-900' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {milestone.label}
                  </span>
                  <span className="text-[8px] text-slate-400 mt-0.5 leading-none font-medium hidden sm:block">
                    {milestone.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Extra Tracking Information & ETA Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-150/40">
        
        {/* Estimated Window */}
        <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-slate-500 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-700 block">Estimated Arrival</span>
            <span className="text-slate-500 font-medium">{getEstimatedDelivery()}</span>
          </div>
        </div>

        {/* Live GPS Dispatch Courier details */}
        <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-700 block">Shipment Location</span>
            <span className="text-slate-500 font-medium">
              {(() => {
                if (activeIdx === 0) return 'Awaiting dispatch confirmation';
                if (activeIdx === 1) return 'Sorting facility, Mumbai Main';
                if (activeIdx === 2) return 'Ocean Hub Logistics, New Delhi';
                if (activeIdx === 3) return 'In transit near destination hub';
                return 'Delivered to Vicky B.';
              })()}
            </span>
          </div>
        </div>

      </div>

      {/* Interactive Live Simulator Panel */}
      <AnimatePresence>
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-800">Milestone Demonstration Suite</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetDemo}
                    className="text-[9px] font-bold uppercase text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded border border-slate-150"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-amber-700/80 font-medium leading-relaxed">
                As a client reviewer, you can simulate different steps of the delivery route. Clicking the button below drives the delivery truck across milestones in real-time, executing fluid layout transitions and progress percentages!
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  disabled={updating}
                  onClick={handleSimulateNextStage}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white text-white" />
                  <span>{updating ? 'Driving...' : 'Simulate Next Stage'}</span>
                </button>

                {MILESTONES.map((milestone) => (
                  <button
                    key={milestone.status}
                    onClick={() => setDemoStatus(milestone.status)}
                    className={`text-[9px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      demoStatus === milestone.status
                        ? 'bg-amber-600 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {milestone.label}
                  </button>
                ))}
              </div>

              {feedbackMessage && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-emerald-600 font-bold"
                >
                  ✓ {feedbackMessage}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
