import React, { useState, useRef } from 'react';
import { analyzeChaos } from './services/gemini';
import { ZenStepResponse } from './types';
import { BrutalistCard } from './components/BrutalistCard';
import { BrutalistButton } from './components/BrutalistButton';
import { StepCard } from './components/StepCard';
import { ChatBot } from './components/ChatBot';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [response, setResponse] = useState<ZenStepResponse | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [timeAvailable, setTimeAvailable] = useState<string>("10 minutes");
  
  // Gamification State
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [dopamineScore, setDopamineScore] = useState(0);
  const [agentUnlocked, setAgentUnlocked] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResponse(null);
      setError(null);
      resetGame();
    }
  };

  const resetGame = () => {
    setCompletedSteps(new Set());
    setDopamineScore(0);
    setAgentUnlocked(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResponse(null);
      setError(null);
      resetGame();
    }
  };

  const runAnalysis = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeChaos(file, timeAvailable);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze the chaos. Try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResponse(null);
    setError(null);
    resetGame();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const speak = (text: string, cue: string = 'robotic') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Dynamic Persona Configuration
      switch(cue) {
        case 'urgent':
          utterance.rate = 1.3;
          utterance.pitch = 1.1;
          break;
        case 'calm':
          utterance.rate = 0.85;
          utterance.pitch = 0.8;
          break;
        case 'cheerful':
          utterance.rate = 1.1;
          utterance.pitch = 1.2;
          break;
        case 'robotic':
        default:
          utterance.rate = 1.0;
          utterance.pitch = 0.9;
          break;
      }

      // Prefer a robotic/system voice if available
      const voices = window.speechSynthesis.getVoices();
      const systemVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang.includes('en-US'));
      if (systemVoice) utterance.voice = systemVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleStep = (index: number) => {
    if (!response) return;
    
    const newCompleted = new Set(completedSteps);
    let newScore = dopamineScore;
    
    if (newCompleted.has(index)) {
      // Uncheck
      newCompleted.delete(index);
      newScore -= 100;
    } else {
      // Complete
      newCompleted.add(index);
      newScore += 100;
      
      // Speak the specific completion phrase for this micro-step
      const step = response.micro_steps[index];
      if (step.completion_phrase) {
        // Pass the speech cue from the AI
        speak(step.completion_phrase, step.speech_cue || 'robotic');
      }
    }

    setCompletedSteps(newCompleted);
    setDopamineScore(newScore);

    // Agent Unlock Logic (>= 2 steps)
    if (newCompleted.size >= 2 && !agentUnlocked) {
      setAgentUnlocked(true);
      setTimeout(() => {
        speak(response.encouragement_phrase, 'cheerful');
      }, 2500); 
    }
  };

  const progressPercentage = response 
    ? (completedSteps.size / response.micro_steps.length) * 100 
    : 0;

  const timeOptions = [
    { label: "Quick (2m)", value: "2 minutes" },
    { label: "Balanced (10m)", value: "10 minutes" },
    { label: "Deep (30m+)", value: "30 minutes" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 flex flex-col items-center">
      {/* Chat Bot */}
      <ChatBot />

      {/* Header */}
      <header className="w-full max-w-3xl mb-12 flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-black bg-black text-white p-4 inline-block transform -rotate-2 border-4 border-[#00F0FF] shadow-[8px_8px_0px_0px_#FF003C]">
          ZENSTEP v1
        </h1>
        <div className="flex flex-wrap justify-center gap-4 mt-6 items-center">
           <p className="font-bold text-xl uppercase tracking-widest bg-[#FAFF00] text-black inline-block px-2 border-2 border-[#00F0FF]">
            Executive Dysfunction Override
          </p>
          {/* Dopamine Score Display */}
          <div className="flex items-center gap-2 bg-[#111] border-2 border-[#FF003C] px-4 py-1 shadow-[4px_4px_0px_0px_#FF003C]">
             <span className="text-[#FF003C] text-sm font-bold uppercase">XP:</span>
             <span className="text-2xl font-black text-white">{dopamineScore}</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl">
        
        {/* Error State */}
        {error && (
            <BrutalistCard color="magenta" className="animate-bounce">
              <h2 className="text-2xl font-bold mb-2">SYSTEM ERROR</h2>
              <p>{error}</p>
              <button onClick={reset} className="mt-4 underline font-bold">RESET SYSTEM</button>
            </BrutalistCard>
        )}

        {/* Input Section */}
        {!analyzing && !response && (
          <div 
            className={`
              border-4 bg-[#0a0a0a] p-8 md:p-12 text-center cursor-pointer
              transition-all duration-300
              ${file 
                ? 'border-dashed border-[#00F0FF] text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.3)]' 
                : 'border-dashed border-[#333] text-gray-500 hover:border-[#00F0FF] hover:text-[#00F0FF] hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]'
              }
            `}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,video/*"
            />
            
            {!file ? (
              <div className="space-y-6">
                <div className="text-6xl filter grayscale hover:grayscale-0 transition-all">📸/🎥</div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">SCAN THE CHAOS</h2>
                <p className="font-bold text-sm tracking-widest">DRAG MEDIA (IMAGE/VIDEO) HERE OR CLICK TO UPLOAD</p>
              </div>
            ) : (
              <div className="space-y-6">
                 {file.type.startsWith('video/') ? (
                   <video 
                     controls
                     src={URL.createObjectURL(file)} 
                     className="max-h-64 w-full object-cover mx-auto border-4 border-[#00F0FF] shadow-[4px_4px_0px_0px_#FF003C]"
                   />
                 ) : (
                   <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="max-h-64 mx-auto border-4 border-[#00F0FF] shadow-[4px_4px_0px_0px_#FF003C]"
                   />
                 )}
                
                {/* Time Selection */}
                <div className="bg-[#111] border-2 border-[#333] p-4 text-left" onClick={(e) => e.stopPropagation()}>
                    <label className="text-sm font-bold text-[#FAFF00] uppercase mb-2 block">Available Time / Energy:</label>
                    <div className="flex flex-wrap gap-2">
                        {timeOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setTimeAvailable(opt.value)}
                                className={`px-3 py-2 text-sm font-bold border-2 transition-all ${
                                    timeAvailable === opt.value 
                                    ? 'bg-[#00F0FF] text-black border-white shadow-[2px_2px_0px_0px_white]' 
                                    : 'bg-black text-gray-400 border-[#333] hover:border-[#00F0FF]'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                  <BrutalistButton onClick={(e) => { e.stopPropagation(); runAnalysis(); }}>
                    INITIATE DEEP THINK
                  </BrutalistButton>
                  <button 
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="font-bold underline text-gray-500 hover:text-[#FF003C]"
                  >
                    CANCEL UPLOAD
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {analyzing && (
          <div className="text-center py-20 space-y-8">
            <div className="text-6xl animate-spin inline-block text-[#00F0FF]">⚙️</div>
            <h2 className="text-2xl md:text-3xl font-black bg-black text-[#00F0FF] p-4 inline-block animate-pulse border-4 border-[#00F0FF]">
              INITIALIZING DEEP THINK PROTOCOL...
            </h2>
            <div className="w-full border-4 border-[#333] h-8 bg-black max-w-md mx-auto relative overflow-hidden">
               <div className="absolute top-0 left-0 h-full bg-[#00F0FF] w-full animate-[shimmer_2s_infinite]"></div>
            </div>
            {/* Dynamic Loading Text */}
            <p className="font-bold text-sm uppercase text-gray-400 animate-pulse">
               {`Configuring neural pathways for ${timeAvailable} intervention sequence...`}
            </p>
          </div>
        )}

        {/* Output Section */}
        {response && (
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            {/* Vibe Summary */}
            <div className="bg-[#FAFF00] border-4 border-[#00F0FF] p-6 shadow-[8px_8px_0px_0px_#FF003C] transform rotate-1 text-black">
              <span className="block text-sm font-bold mb-2 uppercase tracking-widest border-b-2 border-black pb-1">Current Status</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight">
                {response.vibe_summary}
              </h2>
            </div>

             {/* Progress Bar */}
             <div className="w-full">
                <div className="flex justify-between mb-2 font-bold text-[#00F0FF] text-sm uppercase">
                    <span>Protocol Completion</span>
                    <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full h-6 border-4 border-white bg-[#111] p-1">
                    <div 
                        className="h-full bg-[#00F0FF] transition-all duration-500 ease-out shadow-[0_0_10px_#00F0FF]"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
             </div>

            {/* Deep Think Log - Collapsible */}
            <div className="border-4 border-[#333] bg-black shadow-[8px_8px_0px_0px_#00F0FF]">
              <button 
                onClick={() => setShowLog(!showLog)}
                className="w-full text-left p-4 font-black flex justify-between items-center bg-[#111] text-[#00F0FF] hover:bg-[#222] transition-colors border-b-4 border-[#333]"
              >
                <span>🧠 VIEW INTERNAL LOGIC</span>
                <span>{showLog ? '[-]' : '[+]'}</span>
              </button>
              
              {showLog && (
                <div className="p-6 bg-black">
                  <p className="whitespace-pre-wrap text-sm md:text-base font-mono leading-relaxed text-[#39FF14] opacity-90">
                    {'>'} {response.deep_think_log}
                  </p>
                </div>
              )}
            </div>

             {/* Agentic Assistant Unlock */}
             {agentUnlocked && (
                <div className="animate-[slideIn_0.5s_ease-out] border-4 border-[#FF0099] bg-[#0a0a0a] p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#FF0099] animate-pulse"></div>
                    <div className="flex gap-4 items-center">
                        <div className="text-4xl">🤖</div>
                        <div>
                            <h3 className="text-[#FF0099] font-black uppercase text-xl mb-1">Agentic Assistant Unlocked</h3>
                            <p className="text-white font-mono text-lg">"{response.encouragement_phrase}"</p>
                        </div>
                    </div>
                </div>
             )}

            {/* Micro Steps Deck */}
            <div className="space-y-6 mt-4">
              <div className="flex justify-between items-end mb-4 border-b-4 border-[#00F0FF] pb-2">
                  <h3 className="text-2xl font-black bg-black text-white inline-block">
                    PROTOCOL ACTIONS:
                  </h3>
                  <span className="text-[#00F0FF] font-bold text-xs uppercase">Target Time: {timeAvailable}</span>
              </div>
              
              {response.micro_steps.map((step, idx) => (
                <StepCard
                    key={idx}
                    index={idx}
                    step={step}
                    isCompleted={completedSteps.has(idx)}
                    onToggle={() => toggleStep(idx)}
                />
              ))}
            </div>

            <div className="mt-12 text-center pb-20">
              <BrutalistButton onClick={reset} variant="secondary">
                SCAN NEW CHAOS
              </BrutalistButton>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default App;