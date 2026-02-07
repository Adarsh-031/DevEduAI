"use client";

import Link from "next/link";
import { 
  Zap, 
  BrainCircuit, 
  Bug, 
  Trophy, 
  ChevronRight, 
  Github,
  Code2,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Interactive AI Quizzes",
    description: "Test your engineering knowledge with dynamic, AI-generated quizzes. Get instant feedback and detailed explanations.",
    icon: <BrainCircuit className="w-8 h-8 text-blue-500" />,
    query: "Give me a quiz on React and Next.js performance optimization using the QuizCard component. Make it 3 questions.",
    tag: "Knowledge"
  },
  {
    title: "Bug Squashing Sandbox",
    description: "Become a master debugger. Fix intentional bugs in a real code editor across multiple languages and verify your logic.",
    icon: <Bug className="w-8 h-8 text-red-500" />,
    query: "I want to solve a BuggySandbox challenge about asynchronous JavaScript closures.",
    tag: "Practice"
  },
  {
    title: "Algorithm Race",
    description: "Visualize Big-O in real-time. Watch algorithms compete side-by-side with live performance timers and audio sonification.",
    icon: <Zap className="w-8 h-8 text-amber-500" />,
    query: "Run an AlgoRace between Bubble Sort and Quick Sort with 50 elements.",
    tag: "Visualization"
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Code2 className="w-5 h-5" />
          </div>
          <span>DevEdu <span className="text-blue-600 font-mono">AI</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/chat" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Open Chat
          </Link>
          <a href="#" className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-all">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="py-24 px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-6 tracking-wider uppercase">
              <Sparkles className="w-3 h-3" />
              Tambo Hackathon 2026
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-600">
              Interactive Engineering <br /> Mastery.
            </h1>
            <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop watching videos. Start interacting with real-world engineering concepts using our AI-powered visual playground.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/chat" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                Launch Platform
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white border-y border-zinc-200 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div key={idx} whileHover={{ y: -8 }}>
                <Link 
                  href={`/chat?q=${encodeURIComponent(feature.query)}`}
                  className="block h-full bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all"
                >
                  <div className="mb-6">{feature.icon}</div>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">{feature.tag}</div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-zinc-600 leading-relaxed mb-8">{feature.description}</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                    Try Example <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 bg-zinc-50 border-t border-zinc-200 text-center text-zinc-400 text-sm font-medium">
        © 2026 DevEdu AI. Built with the Tambo SDK.
      </footer>
    </div>
  );
}