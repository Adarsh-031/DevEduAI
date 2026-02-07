"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw, Trophy, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

// --- Types ---

interface AlgoRaceProps {
  algoA: string;
  algoB: string;
  dataSize: number;
}

// --- Audio Engine ---

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

const playNote = (frequency: number, type: "sine" | "triangle" = "sine", volume = 0.05) => {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === "suspended") return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

// --- Sorting Algorithms (Generators) ---

function* bubbleSortGenerator(arr: number[]) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { type: 'compare', indices: [j, j + 1] };
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        yield { type: 'swap', indices: [j, j + 1], newArr: [...arr] };
      }
    }
  }
}

function* selectionSortGenerator(arr: number[]) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            yield { type: 'compare', indices: [minIdx, j] };
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            yield { type: 'swap', indices: [i, minIdx], newArr: [...arr] };
        }
    }
}

function* quickSortGenerator(arr: number[], low = 0, high = arr.length - 1): Generator<any> {
  if (low < high) {
    // Partition
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      yield { type: 'compare', indices: [j, high] };
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        yield { type: 'swap', indices: [i, j], newArr: [...arr] };
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    yield { type: 'swap', indices: [i + 1, high], newArr: [...arr] };
    const pi = i + 1;

    yield* quickSortGenerator(arr, low, pi - 1);
    yield* quickSortGenerator(arr, pi + 1, high);
  }
}

function* mergeSortGenerator(arr: number[], l = 0, r = arr.length - 1): Generator<any> {
    if(l >= r){
        return;//returns recursively
    }
    const m = l + Math.floor((r - l) / 2);
    yield* mergeSortGenerator(arr, l, m);
    yield* mergeSortGenerator(arr, m + 1, r);
    yield* merge(arr, l, m, r);
}

function* merge(arr: number[], l: number, m: number, r: number) {
    const n1 = m - l + 1;
    const n2 = r - m;
    const L = new Array(n1);
    const R = new Array(n2);

    for (let i = 0; i < n1; i++)
        L[i] = arr[l + i];
    for (let j = 0; j < n2; j++)
        R[j] = arr[m + 1 + j];

    let i = 0;
    let j = 0;
    let k = l;

    while (i < n1 && j < n2) {
        yield { type: 'compare', indices: [l + i, m + 1 + j] }; // Visual comparison approximation
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        yield { type: 'swap', indices: [k], newArr: [...arr] }; // Visual update
        k++;
    }

    while (i < n1) {
        arr[k] = L[i];
        yield { type: 'swap', indices: [k], newArr: [...arr] };
        i++;
        k++;
    }

    while (j < n2) {
        arr[k] = R[j];
        yield { type: 'swap', indices: [k], newArr: [...arr] };
        j++;
        k++;
    }
}


function getGenerator(algo: string, arr: number[]) {
  const normalized = algo.toLowerCase().replace(/ /g, "");
  if (normalized.includes("quick")) return quickSortGenerator(arr);
  if (normalized.includes("merge")) return mergeSortGenerator(arr);
  if (normalized.includes("selection")) return selectionSortGenerator(arr);
  // Default to bubble sort
  return bubbleSortGenerator(arr);
}

// --- Visualizer Component ---

function ArrayVisualizer({ 
  data, 
  activeIndices, 
  label, 
  timer, 
  isFinished, 
  isWinner,
  color 
}: { 
  data: number[]; 
  activeIndices: number[]; 
  label: string; 
  timer: number;
  isFinished: boolean;
  isWinner: boolean;
  color: string;
}) {
  return (
    <div className={cn(
      "flex flex-col gap-2 w-full p-4 rounded-lg border transition-all duration-500",
      isWinner ? "bg-green-50 border-green-500 ring-2 ring-green-200" : "bg-gray-50 border-gray-200"
    )}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-700">{label}</h3>
          {isWinner && (
            <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1 animate-bounce">
              <Trophy className="w-3 h-3" /> Winner
            </span>
          )}
        </div>
        <div className="font-mono text-sm bg-white px-2 py-1 rounded border border-gray-200 min-w-20 text-right">
          {timer.toFixed(0)} ms
        </div>
      </div>
      
      <div className="h-40 flex items-end gap-px w-full">
        {data.map((value, idx) => {
          const isActive = activeIndices.includes(idx);
          return (
            <div
              key={idx}
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-75",
                isWinner ? "bg-green-500" : isFinished ? "bg-gray-400" : isActive ? "bg-amber-500" : color
              )}
              style={{ height: `${value}%` }}
            />
          );
        })}
      </div>
      {isFinished && !isWinner && (
        <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mt-1 italic">
          Finished
        </div>
      )}
    </div>
  );
}

// --- Main Component ---

export default function AlgoRace({ algoA, algoB, dataSize = 50 }: AlgoRaceProps) {
  const [dataA, setDataA] = useState<number[]>([]);
  const [dataB, setDataB] = useState<number[]>([]);
  
  const [indicesA, setIndicesA] = useState<number[]>([]);
  const [indicesB, setIndicesB] = useState<number[]>([]);
  
  const [timerA, setTimerA] = useState(0);
  const [timerB, setTimerB] = useState(0);
  
  const [finishedA, setFinishedA] = useState(false);
  const [finishedB, setFinishedB] = useState(false);
  
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const bothFinished = finishedA && finishedB;
  const isWinnerA = bothFinished && timerA < timerB;
  const isWinnerB = bothFinished && timerB < timerA;
  
  // Refs for simulation loop
  const genA = useRef<Generator<any> | null>(null);
  const genB = useRef<Generator<any> | null>(null);
  const reqIdA = useRef<number | null>(null);
  const reqIdB = useRef<number | null>(null);
  const startTimeA = useRef<number>(0);
  const startTimeB = useRef<number>(0);

  const generateData = useCallback(() => {
    const newData = Array.from({ length: dataSize }, () => Math.floor(Math.random() * 90) + 10);
    setDataA([...newData]);
    setDataB([...newData]);
    setIndicesA([]);
    setIndicesB([]);
    setTimerA(0);
    setTimerB(0);
    setFinishedA(false);
    setFinishedB(false);
    setIsRunning(false);
    
    if (reqIdA.current) cancelAnimationFrame(reqIdA.current);
    if (reqIdB.current) cancelAnimationFrame(reqIdB.current);
  }, [dataSize]);

  useEffect(() => {
    generateData();
    return () => {
      if (reqIdA.current) cancelAnimationFrame(reqIdA.current);
      if (reqIdB.current) cancelAnimationFrame(reqIdB.current);
    };
  }, [generateData]);

  const stepAlgo = (
    genRef: React.MutableRefObject<Generator<any> | null>, 
    setIndices: React.Dispatch<React.SetStateAction<number[]>>,
    setData: React.Dispatch<React.SetStateAction<number[]>>,
    setTimer: React.Dispatch<React.SetStateAction<number>>,
    setFinished: React.Dispatch<React.SetStateAction<boolean>>,
    startTimeRef: React.MutableRefObject<number>,
    reqIdRef: React.MutableRefObject<number | null>,
    speedMultiplier: number = 1, // Higher is slower (frames per step)
    onFinish?: () => void
  ) => {
    let frameCount = 0;
    
    const loop = (timestamp: number) => {
      // Throttle speed visually
      if (frameCount % speedMultiplier === 0) {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        setTimer(timestamp - startTimeRef.current);

        if (genRef.current) {
          const { value, done } = genRef.current.next();
          
          if (done) {
            setFinished(true);
            setIndices([]);
            if (onFinish) onFinish();
            return;
          }
          
          if (value) {
            setIndices(value.indices);
            
            // Sonification: Play note based on the value at the first active index
            if (!isMuted && value.indices.length > 0) {
              const currentData = value.newArr || (genRef.current as any).arr || [];
              const val = currentData[value.indices[0]] || 50;
              // Map 10-100 to 200Hz - 800Hz
              const freq = 200 + (val * 6);
              playNote(freq, value.type === 'swap' ? 'triangle' : 'sine');
            }

            if (value.type === 'swap' && value.newArr) {
              setData(value.newArr);
            }
          }
        }
      }
      
      frameCount++;
      reqIdRef.current = requestAnimationFrame(loop);
    };
    
    reqIdRef.current = requestAnimationFrame(loop);
  };

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    
    // Initialize Generators
    genA.current = getGenerator(algoA, [...dataA]);
    genB.current = getGenerator(algoB, [...dataB]);
    
    startTimeA.current = performance.now();

    // Run A, then B
    stepAlgo(genA, setIndicesA, setDataA, setTimerA, setFinishedA, startTimeA, reqIdA, 1, () => {
      startTimeB.current = performance.now();
      stepAlgo(genB, setIndicesB, setDataB, setTimerB, setFinishedB, startTimeB, reqIdB, 1);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-3xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Algorithm Race</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={generateData}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            title="Reset Data"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleStart}
            disabled={isRunning && (!finishedA || !finishedB)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-colors",
              isRunning && (!finishedA || !finishedB)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <Play className="w-4 h-4 fill-current" />
            {isRunning ? "Racing..." : "Start Race"}
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <ArrayVisualizer 
          data={dataA} 
          activeIndices={indicesA} 
          label={algoA} 
          timer={timerA}
          isFinished={finishedA}
          isWinner={isWinnerA}
          color="bg-blue-500" 
        />
        <ArrayVisualizer 
          data={dataB} 
          activeIndices={indicesB} 
          label={algoB} 
          timer={timerB}
          isFinished={finishedB}
          isWinner={isWinnerB}
          color="bg-purple-500"
        />
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
        Comparing {algoA} vs {algoB} with {dataSize} elements
      </div>
    </div>
  );
}
