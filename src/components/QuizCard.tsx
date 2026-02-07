"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTamboThread, withInteractable } from "@tambo-ai/react";
import { z } from "zod";
import confetti from "canvas-confetti";

export const quizCardSchema = z.object({
  question: z.string().describe("The question to ask the user"),
  options: z.array(z.string()).describe("The list of options for the quiz"),
  correctAnswerIndex: z.number().describe("The index of the correct answer in the options array"),
  explanation: z.string().describe("The explanation to reveal after the user selects an answer"),
});

interface QuizCardProps {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

function QuizCardBase({
  question,
  options = [],
  correctAnswerIndex,
  explanation,
}: QuizCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isRevealed = selectedIndex !== null;
  const { sendThreadMessage, streaming } = useTamboThread();

  // Reset state when question changes
  useEffect(() => {
    setSelectedIndex(null);
  }, [question, options, correctAnswerIndex, explanation]);

  const handleOptionClick = (index: number) => {
    if (isRevealed) return;
    setSelectedIndex(index);
    if (index === correctAnswerIndex) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const onNextClick = async () => {
    sendThreadMessage("Next question please", { streamResponse: true });
  };

  return (
    <div className="bg-white max-w-md w-full rounded-xl shadow-lg overflow-hidden border border-gray-200 my-4">
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <HelpCircle className="w-6 h-6 text-blue-500 mt-1 shrink-0" />
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {question}
          </h2>
        </div>

        <div className="space-y-3 mb-6">
          {options.map((option, index) => {
            const isCorrect = index === correctAnswerIndex;
            const isSelected = index === selectedIndex;
            
            let variant = "default";
            if (isRevealed) {
              if (isCorrect) variant = "correct";
              else if (isSelected) variant = "incorrect";
              else variant = "dimmed";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={isRevealed}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between group",
                  variant === "default" && "border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700",
                  variant === "correct" && "border-green-500 bg-green-50 text-green-900",
                  variant === "incorrect" && "border-red-500 bg-red-50 text-red-900",
                  variant === "dimmed" && "border-gray-100 bg-gray-50 text-gray-400 opacity-60"
                )}
              >
                <span className="font-medium">{option}</span>
                {isRevealed && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
                {isRevealed && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className={cn(
              "p-4 rounded-lg",
              selectedIndex === correctAnswerIndex ? "bg-green-50 border border-green-100" : "bg-blue-50 border border-blue-100"
            )}>
              <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                {selectedIndex === correctAnswerIndex ? (
                  <span className="text-green-700 font-bold">Correct!</span>
                ) : (
                  <span className="text-blue-700 font-bold">Explanation</span>
                )}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {explanation}
              </p>
            </div>

            <button
              onClick={onNextClick}
              disabled={streaming}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
            >
              {streaming ? "Loading..." : "Next Question"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const QuizCard = withInteractable(QuizCardBase, {
  componentName: "QuizCard",
  description: "An interactive quiz card with multiple choice questions and instant feedback.",
  propsSchema: quizCardSchema,
});

export default QuizCard;
