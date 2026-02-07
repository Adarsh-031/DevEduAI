"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Database, Users, ShieldCheck, AlertTriangle, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { withInteractable, useTamboThread } from "@tambo-ai/react";
import { z } from "zod";
import confetti from "canvas-confetti";

// --- Schema ---
export const systemScalerSchema = z.object({
  scenarioName: z.string().describe("Name of the system design scenario"),
  description: z.string().describe("The problem the user needs to solve"),
  initialTraffic: z.number().describe("Initial requests per second (1-100)"),
  initialReplicas: z.number().describe("Initial number of app server replicas (1-10)"),
  initialDbCapacity: z.number().describe("Initial database capacity units (1-10)"),
  initialCacheCapacity: z.number().optional().default(0).describe("Initial cache capacity units (0-10)"),
  targetLatency: z.number().describe("Target latency in ms to win"),
});

type SystemScalerProps = z.infer<typeof systemScalerSchema>;

// --- Component ---
function SystemScalerBase({
  scenarioName,
  description,
  initialTraffic = 50,
  initialReplicas = 1,
  initialDbCapacity = 1,
  initialCacheCapacity = 0,
  targetLatency = 100,
}: SystemScalerProps) {
  const [traffic, setTraffic] = useState(initialTraffic);
  const [replicas, setReplicas] = useState(initialReplicas);
  const [dbCapacity, setDbCapacity] = useState(initialDbCapacity);
  const [cacheCapacity, setCacheCapacity] = useState(initialCacheCapacity);
  
  const [latency, setLatency] = useState(20);
  const [errorRate, setErrorRate] = useState(0);
  const [isStable, setIsStable] = useState(true);
  const [particles, setParticles] = useState<{id: number, status: 'ok' | 'error', y: number, target: 'cache' | 'db'}[]>([]);
  const [history, setHistory] = useState<{latency: number, errors: number}[]>([]);
  
  const { sendThreadMessage } = useTamboThread();
  const wasStable = useRef(true);

  useEffect(() => {
    setTraffic(initialTraffic);
    setReplicas(initialReplicas);
    setDbCapacity(initialDbCapacity);
    setCacheCapacity(initialCacheCapacity);
    setHistory([]);
    wasStable.current = true;
  }, [scenarioName, initialTraffic, initialReplicas, initialDbCapacity, initialCacheCapacity]);

  useEffect(() => {
    const interval = setInterval(() => {
      const appLoad = traffic / (replicas * 15);
      const cacheEfficiency = (cacheCapacity / 10) * 0.8;
      const trafficToDb = traffic * (1 - cacheEfficiency);
      const dbLoad = trafficToDb / (dbCapacity * 20);
      const cacheLoad = (traffic * (cacheCapacity > 0 ? 1 : 0)) / (Math.max(cacheCapacity, 1) * 50);
      
      const bottleneck = Math.max(appLoad, dbLoad, cacheLoad);
      const newLatency = 20 + (bottleneck > 0.7 ? Math.pow(bottleneck - 0.7, 2) * 1000 : 0);
      const newErrorRate = bottleneck > 1.1 ? Math.min((bottleneck - 1.1) * 100, 100) : 0;

      setLatency(prev => prev * 0.6 + newLatency * 0.4);
      setErrorRate(prev => prev * 0.8 + newErrorRate * 0.2);
      setHistory(prev => [...prev.slice(-30), { latency: newLatency, errors: newErrorRate }]);
      
      const stable = newLatency <= targetLatency && newErrorRate < 1;
      setIsStable(stable);

      if (stable && !wasStable.current) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7, x: 0.5 }, colors: ['#10b981', '#3b82f6'] });
      }
      wasStable.current = stable;

      if (Math.random() < 0.8) {
        const id = Math.random();
        const status = Math.random() * 100 > newErrorRate ? 'ok' : 'error';
        const target = Math.random() < cacheEfficiency ? 'cache' : 'db';
        setParticles(prev => [...prev.slice(-15), { id, status, y: Math.random() * 40 - 20, target }]);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [traffic, replicas, dbCapacity, cacheCapacity, targetLatency]);

  const handleSolve = () => {
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#3b82f6', '#6366f1', '#10b981'] });
    sendThreadMessage(`System Scaled! Replicas: ${replicas}, DB: ${dbCapacity}, Cache: ${cacheCapacity}. Steady at ${Math.round(latency)}ms.`, { streamResponse: true });
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden font-sans my-6 select-none">
      <div className="bg-zinc-900 text-white p-6 relative">
        <div className="flex justify-between items-start z-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-xl font-black tracking-tight uppercase italic">{scenarioName}</h2>
            </div>
            <p className="text-zinc-400 text-xs font-medium max-w-md">{description}</p>
          </div>
          <div className={cn(
            "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-500",
            isStable ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-red-500/10 border-red-500 text-red-400 animate-pulse"
          )}>
            {isStable ? "STATUS: OPTIMIZED" : "STATUS: CRITICAL"}
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="bg-zinc-950 p-8 relative overflow-hidden flex items-center justify-between min-h-[300px]">
        <div className="flex flex-col items-center gap-4 z-10">
          <Users className={cn("w-10 h-10 transition-colors duration-300", traffic > 100 ? "text-amber-400" : "text-zinc-500")} />
          <div className="text-center">
            <div className="text-xl font-mono font-black text-white">{traffic}</div>
            <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Requests</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 z-10">
          <div className="flex flex-wrap justify-center gap-1 w-24">
            {Array.from({length: replicas}).map((_, i) => (
              <motion.div key={i} animate={{ rotate: latency > targetLatency ? [0, -2, 2, 0] : 0 }} transition={{ rotate: { repeat: Infinity, duration: 0.1 } }} className={cn("w-6 h-5 rounded-sm bg-blue-500 border border-blue-400 flex items-center justify-center shadow-md")}>
                <Server className="w-3 h-3 text-white" />
              </motion.div>
            ))}
          </div>
          <span className="text-[8px] font-bold text-zinc-500 uppercase">App Cluster</span>
        </div>

        <div className="flex flex-col items-center gap-2 z-10">
          <motion.div 
            animate={{ 
              opacity: cacheCapacity > 0 ? 1 : 0.2,
              scale: cacheCapacity > 0 ? 1 : 0.8,
              boxShadow: cacheCapacity > 0 ? "0 0 20px #f59e0b" : "none"
            }}
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center border-2 transition-all duration-300",
              cacheCapacity > 0 ? "bg-amber-500/20 border-amber-500 text-amber-500" : "bg-zinc-800 border-zinc-700 text-zinc-600"
            )}
          >
            <Zap className="w-6 h-6" />
          </motion.div>
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest text-center">Redis<br/>Cache</span>
        </div>

        <div className="flex flex-col items-center gap-2 z-10">
          <motion.div 
            animate={{ scale: dbCapacity < traffic/25 ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 0.4 }}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-lg",
              dbCapacity < 3 ? "bg-red-900/20 border-red-500 text-red-500" : "bg-indigo-900 border-indigo-400 text-indigo-400"
            )}
          >
            <Database className="w-6 h-6" />
          </motion.div>
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Database</span>
        </div>

        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ left: "10%", opacity: 0, y: p.y }}
              animate={{ 
                left: p.target === 'cache' ? "60%" : "90%", 
                opacity: [0, 1, 1, 0],
                scale: p.target === 'cache' ? 0.5 : 1
              }}
              transition={{ duration: 1, ease: "linear" }}
              className={cn(
                "absolute w-1.5 h-1.5 rounded-full z-0",
                p.status === 'ok' ? "bg-blue-400 shadow-[0_0_8px_#60a5fa]" : "bg-red-500 shadow-[0_0_10px_#ef4444]"
              )}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 divide-x divide-zinc-100 border-b border-zinc-100 bg-white">
        <div className="p-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Latency Spectrum</span>
            <span className={cn("text-2xl font-mono font-black leading-none", latency > targetLatency ? "text-red-500" : "text-emerald-500")}>
              {Math.round(latency)}ms
            </span>
          </div>
          <div className="h-12 flex items-end gap-0.5">
            {history.map((h, i) => (
              <div key={i} className={cn("flex-1 rounded-full min-w-[2px]", h.latency > targetLatency ? "bg-red-200" : "bg-emerald-100")} style={{ height: `${Math.min(h.latency / 5, 100)}%` }} />
            ))}
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Success Capacity</span>
            <div className={cn("text-3xl font-mono font-black", errorRate > 0 ? "text-red-500" : "text-emerald-500")}>
              {Math.round(100 - errorRate)}%
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-zinc-50 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">App Replicas</h4>
              <div className="flex gap-1">
                <button onClick={() => setReplicas(Math.max(1, replicas - 1))} className="w-6 h-6 rounded bg-white border border-zinc-200 flex items-center justify-center text-xs">-</button>
                <button onClick={() => setReplicas(Math.min(10, replicas + 1))} className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs">+</button>
              </div>
            </div>
            <input type="range" min="1" max="10" value={replicas} onChange={(e) => setReplicas(Number(e.target.value))} className="w-full accent-blue-600 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Redis Cache</h4>
              <div className="flex gap-1">
                <button onClick={() => setCacheCapacity(Math.max(0, cacheCapacity - 1))} className="w-6 h-6 rounded bg-white border border-zinc-200 flex items-center justify-center text-xs">-</button>
                <button onClick={() => setCacheCapacity(Math.min(10, cacheCapacity + 1))} className="w-6 h-6 rounded bg-amber-500 text-white flex items-center justify-center text-xs">+</button>
              </div>
            </div>
            <input type="range" min="0" max="10" value={cacheCapacity} onChange={(e) => setCacheCapacity(Number(e.target.value))} className="w-full accent-amber-500 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">DB Units</h4>
              <div className="flex gap-1">
                <button onClick={() => setDbCapacity(Math.max(1, dbCapacity - 1))} className="w-6 h-6 rounded bg-white border border-zinc-200 flex items-center justify-center text-xs">-</button>
                <button onClick={() => setDbCapacity(Math.min(10, dbCapacity + 1))} className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center text-xs">+</button>
              </div>
            </div>
            <input type="range" min="1" max="10" value={dbCapacity} onChange={(e) => setDbCapacity(Number(e.target.value))} className="w-full accent-indigo-600 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-200">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Simulated Traffic Load</label>
            <span className="font-mono font-bold text-zinc-700">{traffic} RPS</span>
          </div>
          <input type="range" min="10" max="250" step="10" value={traffic} onChange={(e) => setTraffic(Number(e.target.value))} className="w-full accent-zinc-800 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer" />
        </div>

        <button
          onClick={handleSolve}
          disabled={!isStable}
          className={cn(
            "w-full py-4 rounded-xl font-black uppercase tracking-[0.3em] text-xs transition-all shadow-xl",
            isStable ? "bg-zinc-900 text-white hover:bg-black hover:scale-[1.01] active:scale-95 cursor-pointer" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          )}
        >
          {isStable ? "COMMIT INFRASTRUCTURE" : "SYSTEM UNSTABLE - FIX BOTTLENECKS"}
        </button>
      </div>
    </div>
  );
}

const SystemScaler = withInteractable(SystemScalerBase, {
  componentName: "SystemScaler",
  description: "Advanced system design simulator with App, Cache, and DB scaling knobs.",
  propsSchema: systemScalerSchema,
});

export default SystemScaler;