"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Lightbulb, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { withInteractable } from "@tambo-ai/react";
import { z } from "zod";

// --- Schema Definition ---

export const buggySandboxSchema = z.object({
  initialCode: z.string().describe("The initial buggy code to display in the editor"),
  correctCode: z.string().describe("The correct code to compare the user's input against"),
  hint: z.string().describe("A helpful hint to display when the user clicks the hint button"),
  language: z.string().optional().default("javascript").describe("The programming language for syntax highlighting"),
});

type BuggySandboxProps = z.infer<typeof buggySandboxSchema>;

// --- Base Component ---

function BuggySandboxBase({
  initialCode,
  correctCode,
  hint,
  language = "javascript",
}: BuggySandboxProps) {
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [showHint, setShowHint] = useState(false);

  // Synchronize internal editor state when AI updates the props
  useEffect(() => {
    setCode(initialCode);
    setStatus("idle");
    setShowHint(false);
  }, [initialCode]);

  const normalizeCode = (str: string = "") => {
    return str
      .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "") // Remove comments
      .replace(/['"`]/g, "'") // Normalize all quotes to single quotes
      .replace(/;/g, "") // Remove semicolons
      .replace(/\s+/g, "") // Remove all whitespace
      .trim();
  };

  const handleRun = () => {
    if (!correctCode) return;
    
    const isMatch = normalizeCode(code) === normalizeCode(correctCode);

    if (isMatch) {
      setStatus("success");
    } else {
      setStatus("error");
      // Reset status after a brief animation delay to allow re-running
      setTimeout(() => setStatus("idle"), 500);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setStatus("idle");
    setShowHint(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto font-sans my-4">
      <motion.div
        animate={status === "error" ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={cn(
          "relative overflow-hidden rounded-xl border-2 bg-white shadow-xl transition-all duration-300",
          status === "success"
            ? "border-green-500 shadow-green-100"
            : status === "error"
            ? "border-red-500 shadow-red-100"
            : "border-gray-200"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="ml-3 text-sm font-medium text-gray-500 font-mono">
              {language === "javascript" ? "script.js" : `solution.${language}`}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
             <button
              onClick={handleReset}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
              title="Reset Code"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowHint(!showHint)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors border",
                showHint
                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {showHint ? "Hide Hint" : "Hint"}
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="h-[300px] relative group">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              padding: { top: 16, bottom: 16 },
              fontFamily: "var(--font-mono)",
            }}
            className="pt-2"
          />
          
          {/* Success Overlay */}
          <AnimatePresence>
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-green-50/50 backdrop-blur-[1px] flex items-center justify-center z-10"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center border border-green-100"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Bug Fixed!
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Great job squashing that bug.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer / Actions */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-400 font-mono">
            {status === "idle" && "Ready to run..."}
            {status === "error" && <span className="text-red-500 font-semibold flex items-center gap-1"><XCircle className="w-3 h-3"/> Incorrect logic</span>}
            {status === "success" && <span className="text-green-600 font-semibold">All tests passed</span>}
          </div>

          <button
            onClick={handleRun}
            disabled={status === "success"}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm",
              status === "success"
                ? "bg-green-600 text-white cursor-default"
                : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
            )}
          >
            {status === "success" ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Fixed
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Run Code
              </>
            )}
          </button>
        </div>

        {/* Hint Panel */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-yellow-100 bg-yellow-50 overflow-hidden"
            >
              <div className="px-4 py-3 text-sm text-yellow-800 flex gap-3">
                <Lightbulb className="w-5 h-5 shrink-0 text-yellow-600 mt-0.5" />
                <p>{hint}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- Interactable Export ---

const BuggySandbox = withInteractable(BuggySandboxBase, {
  componentName: "BuggySandbox",
  description: "An interactive code sandbox for fixing bugs with real-time feedback and hints.",
  propsSchema: buggySandboxSchema,
});

export default BuggySandbox;