<div align="center">

# 🧠 ZenStep: Executive Dysfunction Override

[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Groq](https://img.shields.io/badge/AI-Groq_Llama_4_Vision-F55036?style=for-the-badge&logo=ai)](https://groq.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**A cognitively-aware, gamified AI intervention system designed to break paralysis by analysis.**

[View Live Demo](https://zenstep-pi.vercel.app/) 

</div>

---

## 🚀 The Vision: Beyond an "AI Wrapper"

ZenStep is not a chat interface. It is a **programmatic behavioral intervention tool**. 

When individuals (particularly neurodivergent users or those with ADHD) face intense visual clutter, cognitive overload prevents action. ZenStep utilizes **high-throughput multimodal AI** to analyze environmental chaos, assess the user's available time/energy, and dynamically construct a highly structured, gamified "Speedrun" protocol.

### 🧠 Core Architectural Innovations

*   **Multimodal Semantic Deconstruction:** Utilizes Groq's bleeding-edge `qwen/qwen3.6-27b` vision model to parse complex environmental imagery (messy rooms, cluttered desks) into structured spatial data.
*   **Dynamic Cognitive Load Balancing:** The LLM's system prompt acts as a "Productivity Psychologist." It dynamically adjusts the generated protocol based on two vectors: *Visual Entropy* (how messy the room is) and *Energy Commitment* (2m, 10m, or 30m). High chaos + low time = hyper-granular micro-steps.
*   **Structured JSON Orchestration:** We enforce strict JSON schema adherence from the LLM to drive a programmatic, interactive UI. The AI doesn't output markdown text; it outputs a state machine of tasks, timestamps, emotional cues, and psychological analysis.
*   **Contextual Agentic Assistant (ZenBot):** Powered by `qwen/qwen3.6-27b`, the integrated agent acts as a stateful, in-context motivational engine. It observes the user's progress through the generated protocol and provides adaptive encouragement.
*   **Synthesized Emotional TTS Cues:** The AI explicitly dictates the prosody and emotional tone of the Text-to-Speech (TTS) engine for every single micro-step (e.g., `urgent`, `calm`, `robotic`, `cheerful`), creating a uniquely tailored audio-visual feedback loop.

---

## 🎯 Key Use Cases

1.  **ADHD & Executive Dysfunction Management:** Bypasses the prefrontal cortex's struggle to prioritize tasks by dictating an immediate, undeniable "first step."
2.  **The "Dopamine Speedrun":** Converts overwhelming chores into rapid-fire, low-friction micro-tasks (e.g., "Rescue 1 coffee mug," "Neutralize 3 pieces of trash") rewarding the user with immediate UI feedback and XP.
3.  **Time-Boxed Interventions:** Adapts strictly to the user's current energy levels. Only have 2 minutes? The AI synthesizes a protocol optimized purely for high-impact visual changes within that constraint.

---

## 🛠️ Technical Stack & Architecture

ZenStep is built for maximum speed and zero client-side payload leakage, utilizing an Edge/Serverless architecture.

*   **Frontend:** React 19 + TypeScript + Vite.
*   **Styling:** Tailwind CSS (Custom Cyber-Brutalist Aesthetic).
*   **Backend / API:** Vercel Serverless Functions (`@vercel/node`).
*   **AI Engine (Vision):** Groq API (`qwen/qwen3.6-27b`).
*   **AI Engine (Chat):** Groq API (`qwen/qwen3.6-27b`).

### 🔒 Security Highlight: Serverless AI Proxying
The frontend **never** communicates directly with the AI provider. To protect API keys and prevent abuse, the React application posts Base64 payloads to highly optimized Vercel Serverless Functions (`/api/analyze`, `/api/chat`). These functions handle authentication, payload sanitization, strict error catching (429s, 400s), and communicate securely with the Groq API.

---


## 💻 Local Development Setup

To run ZenStep locally, you need [Node.js](https://nodejs.org/) installed and a free [Groq API Key](https://console.groq.com/keys).

```bash
# 1. Clone the repository
git clone https://github.com/theShivansh/Zenstep.git
cd Zenstep

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
cp .env.example .env.local
# Add your GROQ_API_KEY to .env.local

# 4. Start the Vite development server
npm run dev
```

---

## 🌐 Deployment (Vercel)

ZenStep is heavily optimized for seamless Vercel deployment.

1. Push your code to GitHub.
2. Import the project into your Vercel Dashboard.
3. In the project settings, add the following Environment Variable:
   * `GROQ_API_KEY` : `your_groq_api_key_here`
4. Click **Deploy**. Vercel will automatically detect the Vite framework and configure the `/api` directory as Serverless Functions via the provided `vercel.json` and `api/tsconfig.json`.

---

<div align="center">
  <b>Built by <a href="https://github.com/theShivansh">Shivansh</a></b>
</div>
