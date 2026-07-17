import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Navigation, 
  MapPin, 
  CheckCircle, 
  Compass, 
  Clock, 
  Package, 
  Truck,
  RotateCw
} from 'lucide-react';
import { Order } from '../types';

export default function DeliveryPortal() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchDeliveryOrders = () => {
    setIsLoading(true);
    fetch('/api/orders')
      .then(res => res.json())
      .then((data: Order[]) => {
        // Delivery focuses on Shipped items
        setOrders(data.filter(o => o.status === 'Shipped' || o.status === 'Delivered'));
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching delivery orders:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Delivered',
          description: 'Package successfully hand-delivered by local courier at doorstep. GPS coordinates captured and verified.'
        })
      });
      if (res.ok) {
        fetchDeliveryOrders();
        setSelectedOrder(null);
      }
    } catch (e) {
      console.error('Delivery status update error:', e);
    }
  };

  const activeDeliveries = orders.filter(o => o.status === 'Shipped');
  const completedDeliveries = orders.filter(o => o.status === 'Delivered');

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Dispatch List */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Truck className="h-5 w-5 text-cyan-400" />
              Active Courier Routes
            </h3>
            <button 
              onClick={fetchDeliveryOrders}
              className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {activeDeliveries.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No active delivery dispatches on your route.</p>
            ) : (
              activeDeliveries.map(o => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    selectedOrder?.id === o.id ? 'bg-slate-850 border-cyan-500' : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between text-xs">
                    <span className="font-mono font-bold text-slate-400">{o.id}</span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950 px-2 py-0.5 rounded uppercase">
                      In Transit
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Destination Point</span>
                    <p className="text-xs text-slate-300 font-medium truncate">{o.shippingAddress}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmDelivery(o.id);
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <CheckCircle className="h-4 w-4" /> Sign Doorstep Delivery
                  </button>
                </div>
              ))
            )}

            {completedDeliveries.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono pl-1">
                  Completed Routes Today ({completedDeliveries.length})
                </span>
                {completedDeliveries.map(o => (
                  <div key={o.id} className="bg-slate-950/20 border border-slate-850 p-3 rounded-xl flex justify-between items-center text-xs opacity-60">
                    <div>
                      <span className="font-mono font-bold text-slate-400 block">{o.id}</span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[150px] block">{o.shippingAddress}</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-400 uppercase font-mono">Delivered</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Simulated GPS Routing Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[460px]">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              Global GPS Telematics console
            </span>
            <h3 className="text-lg font-black text-white mt-0.5">
              Fulfillment Route Vector Map
            </h3>
          </div>

          {/* Custom vector graphics simulated map with routing animations! */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl h-[300px] my-4 relative overflow-hidden flex items-center justify-center">
            {/* Grid lines background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>

            {/* Custom SVG Maps HUD */}
            <svg className="absolute inset-0 w-full h-full text-slate-800" xmlns="http://www.w3.org/2000/svg">
              {/* Path lines */}
              <path d="M 50 150 Q 150 50 250 180 T 450 120" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6,6" className="text-slate-800" />
              <path d="M 50 150 Q 150 50 250 180 T 450 120" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="300" strokeDashoffset="300" className="animate-[dash_10s_linear_infinite]" style={{ strokeDashoffset: 0 }} />
              
              {/* Warehouse Pin */}
              <circle cx="50" cy="150" r="10" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="2" />
              <circle cx="50" cy="150" r="4" fill="#6366f1" />

              {/* Delivery Destination Pin */}
              <circle cx="450" cy="120" r="12" fill="#115e59" stroke="#14b8a6" strokeWidth="2" className="animate-pulse" />
              <circle cx="450" cy="120" r="4" fill="#2dd4bf" />
            </svg>

            {/* Simulated Animated Van */}
            <motion.div 
              animate={{ 
                x: [0, 100, 220, 400], 
                y: [0, -80, 30, -30] 
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute left-[50px] top-[150px] -ml-4 -mt-4 bg-cyan-500 text-slate-950 p-2 rounded-full border border-white/20 shadow-xl"
            >
              <Truck className="h-4.5 w-4.5 animate-bounce" />
            </motion.div>

            {/* Heads Up Display (HUD) overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono text-slate-300 space-y-1">
              <div>LAT RANGE: 47.6062° N</div>
              <div>LONG RANGE: 122.3321° W</div>
              <div className="text-cyan-400 font-bold">STATUS: TELEMETRY ACTIVE</div>
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono text-slate-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping"></span>
              <span>GPS SYNCED</span>
            </div>
          </div>

          {/* Delivery destination target info */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs space-y-2">
            {selectedOrder ? (
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <MapPin className="h-5 w-5 text-teal-400" />
                  <div>
                    <span className="font-bold text-slate-200 block">Deliver to: {selectedOrder.id}</span>
                    <p className="text-slate-400">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleConfirmDelivery(selectedOrder.id)}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-lg"
                >
                  Confirm doorstep drop
                </button>
              </div>
            ) : (
              <div className="text-slate-500 flex items-center gap-2">
                <Compass className="h-5 w-5 text-slate-600" />
                <span>Select any active route on the left to highlight transit telemetry and check addresses.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
