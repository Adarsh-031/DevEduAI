/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";
import QuizCard, { quizCardSchema } from "@/components/QuizCard";
import BuggySandbox, { buggySandboxSchema } from "@/components/BuggySandbox";
import AlgoRace from "@/components/AlgoRace";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  
  // Add more tools here
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "QuizCard",
    description: "A component that renders a quiz card with interactive options and an explanation.",
    component: QuizCard,
    propsSchema: quizCardSchema,
  },
  {
    name: "BuggySandbox",
    description: "An interactive code sandbox where users can fix buggy code. It compares their solution to a correct version.",
    component: BuggySandbox,
    propsSchema: buggySandboxSchema,
  },
  {
    name: "AlgoRace",
    description: "A component that visualizes a race between two sorting algorithms. It displays side-by-side array visualizations and live timers.",
    component: AlgoRace,
    propsSchema: z.object({
      algoA: z.enum(["Bubble Sort", "Selection Sort", "Quick Sort", "Merge Sort"]).describe("The name of the first algorithm"),
      algoB: z.enum(["Bubble Sort", "Selection Sort", "Quick Sort", "Merge Sort"]).describe("The name of the second algorithm"),
      dataSize: z.number().describe("The size of the array to sort (e.g. 50)"),
    }),
  },
  // Add more components here
];
