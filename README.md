# DevEdu AI 🚀
### Interactive Engineering Mastery through AI

**DevEdu AI** is a next-generation educational platform built for the **Tambo Global Hackathon 2026**. It transforms traditional, static learning into a dynamic, sensory, and interactive experience by leveraging the **Tambo SDK** to bridge the gap between AI chat and rich client-side applications.

---

## 🌟 Key Features

### 1. Interactive AI Quizzes (`QuizCard`)
Test your knowledge with deep-dive technical questions generated on the fly.
- **Instant Feedback:** Green/Red visual cues for immediate learning.
- **Deep Context:** Detailed explanations reveal after selection to reinforce concepts.
- **Celebration:** Confetti explosions for correct answers!

### 2. Bug Squashing Sandbox (`BuggySandbox`)
A "LeetCode-style" game for debugging real-world logic errors.
- **Multi-Language Support:** Solve challenges in **JavaScript, Python, C, or C++**.
- **Integrated Editor:** Powered by Monaco (VS Code's engine).
- **In-place Updates:** AI updates the sandbox in real-time as you switch languages or request new hints.
- **Validation:** Compare your fix against the solution logic with one click.

### 3. Algorithm Race (`AlgoRace`)
Visualize performance complexity (Big-O) like never before.
- **Side-by-Side Duel:** Watch two algorithms (e.g., Bubble Sort vs. Quick Sort) compete on the same data.
- **Sequential Execution:** Tracks run one-by-one for clear auditory and visual focus.
- **Sonification:** Hear the sort! Pitch shifts based on element values, turning data into music.
- **Winner Podium:** Automatic timing and victory highlighting for the most efficient algorithm.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **AI Integration:** [Tambo SDK](https://tambo.co/)
- **Styling:** Tailwind CSS + Framer Motion
- **Editor:** @monaco-editor/react
- **Audio:** Web Audio API
- **Celebrations:** canvas-confetti

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+ 
- A Tambo API Key ([Get one here](https://tambo.co/dashboard))

### 2. Installation
```bash
git clone <your-repo-url>
cd tambo-default
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_TAMBO_API_KEY=your_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the landing page.

---

## 📂 Project Structure

- `src/components/`: Core interactive modules (`QuizCard`, `BuggySandbox`, `AlgoRace`).
- `src/app/page.tsx`: Modern landing page with feature cards.
- `src/app/chat/page.tsx`: The primary interactive AI interface.
- `src/lib/tambo.ts`: Central registry for Tambo components and schemas.

---

## 🏆 Why this project?

This project showcases the power of **Interactable Generative UI**. Instead of the AI simply *explaining* a concept, it *builds* a specialized tool for the user to practice that concept. By removing the friction of manual setup and providing a polished, high-feedback environment, **DevEdu AI** represents the future of developer education.
