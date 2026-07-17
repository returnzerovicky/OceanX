import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Boxes, 
  CheckCircle, 
  Play, 
  Truck, 
  Package, 
  Clock, 
  MapPin, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';

export default function WarehousePortal() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchWarehouseOrders = () => {
    setIsLoading(true);
    fetch('/api/orders')
      .then(res => res.json())
      .then((data: Order[]) => {
        // Warehouse is interested in active, non-delivered orders
        setOrders(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching warehouse orders:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchWarehouseOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: Order['status'], description: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, description })
      });
      if (res.ok) {
        fetchWarehouseOrders();
        setSelectedOrder(null);
      }
    } catch (e) {
      console.error('Fulfillment update error:', e);
    }
  };

  // Filter orders by status
  const pendingPicking = orders.filter(o => o.status === 'Confirmed');
  const activePacking = orders.filter(o => o.status === 'Processing');
  const dispatchedList = orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered');

  return (
    <div className="space-y-6">
      {/* Warehouse stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Pending Picking Line
            </span>
            <div className="text-2xl font-black text-white font-mono">{pendingPicking.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-yellow-950/40 border border-yellow-800/30 text-yellow-400">
            <Boxes className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              In Packing / Assembly
            </span>
            <div className="text-2xl font-black text-white font-mono">{activePacking.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/30 text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Dispatched Transactions
            </span>
            <div className="text-2xl font-black text-white font-mono">{dispatchedList.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/30 text-teal-400">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Kanban fulfillment layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Confirmed Orders (Awaiting Picking) */}
        <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-xs uppercase text-yellow-400 tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
              Awaiting Picking ({pendingPicking.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {pendingPicking.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-6">No pending pick queues.</p>
            ) : (
              pendingPicking.map(o => (
                <div 
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl cursor-pointer space-y-3 transition-all"
                >
                  <div className="flex justify-between text-xs">
                    <span className="font-mono font-bold text-slate-400">{o.id}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate max-w-[180px]">{it.name}</span>
                        <span className="font-mono font-bold">x{it.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(
                        o.id, 
                        'Processing', 
                        'Fulfillment queue matched: items picked from shelf and transferred to workstation.'
                      );
                    }}
                    className="w-full bg-slate-950 hover:bg-slate-800 border border-yellow-500/30 text-yellow-400 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="h-3.5 w-3.5" /> Start Picking
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Processing Orders (In Assembly) */}
        <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-xs uppercase text-blue-400 tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400"></span>
              Packing & Quality Control ({activePacking.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {activePacking.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-6">No active packing workstation queues.</p>
            ) : (
              activePacking.map(o => (
                <div 
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl cursor-pointer space-y-3 transition-all"
                >
                  <div className="flex justify-between text-xs">
                    <span className="font-mono font-bold text-slate-400">{o.id}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate max-w-[180px]">{it.name}</span>
                        <span className="font-mono font-bold">x{it.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(
                        o.id, 
                        'Shipped', 
                        'Package completed QA inspection, double-wall packed, and handed over to DHL Express.'
                      );
                    }}
                    className="w-full bg-slate-950 hover:bg-slate-800 border border-blue-500/30 text-blue-400 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Truck className="h-3.5 w-3.5" /> Handover to Carrier
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Logistics overview (Details / Shipped list) */}
        <div className="bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">
              Workstation details panel
            </h3>
          </div>

          {selectedOrder ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Active Target</span>
                <div className="font-mono font-bold text-slate-200">{selectedOrder.id}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Items checklist</span>
                <div className="divide-y divide-slate-800 pt-1 mt-1 space-y-1.5">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between pt-1.5">
                      <span className="text-slate-300 font-medium">{it.name}</span>
                      <span className="font-mono text-cyan-400">Qty {it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Delivery point</span>
                <p className="text-slate-300 mt-1">{selectedOrder.shippingAddress}</p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Order status</span>
                <span className="inline-block mt-1 font-mono font-bold bg-slate-950 px-2.5 py-1 rounded text-cyan-400 border border-slate-850">
                  {selectedOrder.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500">
              <Package className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-medium">Select any pick block above to load workstation manifest details.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
