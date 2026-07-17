import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Activity, 
  Users, 
  DollarSign, 
  Layers, 
  Terminal,
  RotateCw,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { AuditLog } from '../types';

export default function AdminPortal() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = () => {
    setIsLoading(true);
    fetch('/api/logs')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching admin logs:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const alertLogsCount = logs.filter(l => l.status === 'Alert' || l.status === 'Warning').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Platform Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Aggregate platform throughput
            </span>
            <div className="text-2xl font-black text-white font-mono">$11,480.49</div>
          </div>
          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/30 text-teal-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Identity verification logs
            </span>
            <div className="text-2xl font-black text-white font-mono">5 active</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/30 text-cyan-400">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Active Security Alerts
            </span>
            <div className={`text-2xl font-black font-mono ${alertLogsCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
              {alertLogsCount}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${alertLogsCount > 0 ? 'bg-red-950/40 border border-red-800/30 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Fulfillment Node Health
            </span>
            <div className="text-2xl font-black text-teal-400 font-mono">99.98%</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/30 text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Audit Log Console */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-slate-400" />
                <h3 className="font-extrabold text-sm text-slate-200 tracking-wide">
                  Market Security Audit Log
                </h3>
              </div>
              <button 
                onClick={fetchLogs}
                className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg"
              >
                <RotateCw className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-850 max-h-[360px] overflow-y-auto pr-2 mt-4 space-y-3">
              {logs.length === 0 ? (
                <p className="text-center text-slate-500 text-xs py-8">No security actions compiled.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="pt-3 first:pt-0 flex gap-4 text-xs items-start">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                      log.status === 'Alert' 
                        ? 'bg-red-950 border border-red-500/20 text-red-400' 
                        : (log.status === 'Warning' ? 'bg-yellow-950 border border-yellow-500/20 text-yellow-400' : 'bg-teal-950 border border-teal-500/20 text-teal-400')
                    }`}>
                      {log.status}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-200">{log.action}</p>
                      <div className="flex gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>User: {log.user} ({log.role})</span>
                        <span>•</span>
                        <span>IP: {log.ip}</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Security Stats & Visual Reports */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              Global Platform Security
            </span>
            <h3 className="text-base font-extrabold text-white">
              AI Risk Analysis Summary
            </h3>
          </div>

          {/* Custom SVG Analytics Graphics */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col items-center justify-center space-y-4">
            <svg className="w-24 h-24" viewBox="0 0 36 36">
              {/* Outer circle */}
              <circle cx="18" cy="18" r="16" fill="none" stroke="#1e293b" strokeWidth="4" />
              {/* Safe segment (85%) */}
              <circle 
                cx="18" 
                cy="18" 
                r="16" 
                fill="none" 
                stroke="#0ea5e9" 
                strokeWidth="4" 
                strokeDasharray="85 100" 
                strokeDashoffset="25" 
                transform="rotate(-90 18 18)" 
              />
              {/* Flagged segment (15%) */}
              <circle 
                cx="18" 
                cy="18" 
                r="16" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="4" 
                strokeDasharray="15 100" 
                strokeDashoffset="10" 
                transform="rotate(-90 18 18)" 
              />
            </svg>

            <div className="text-center">
              <span className="text-lg font-black text-white font-mono">85% Safe Index</span>
              <p className="text-[10px] text-slate-500 mt-0.5">15% flagged items / fraud attempts blocked</p>
            </div>
          </div>

          {/* Bulleted checklist of security settings */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-850">
              <span className="text-slate-400">PCI-DSS Tokenization</span>
              <span className="font-mono text-teal-400 font-bold uppercase">Enforced</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-850">
              <span className="text-slate-400">SSO / OAuth2 Login</span>
              <span className="font-mono text-teal-400 font-bold uppercase">Active</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">Review Spam AI checks</span>
              <span className="font-mono text-teal-400 font-bold uppercase">Enforced</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
