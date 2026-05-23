import React, { useState, useEffect, useRef } from 'react';
import { MicroStep } from '../types';
import { BrutalistButton } from './BrutalistButton';

interface StepCardProps {
  step: MicroStep;
  index: number;
  isCompleted: boolean;
  onToggle: () => void;
}

export const StepCard: React.FC<StepCardProps> = ({ step, index, isCompleted, onToggle }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Timer Logic
    if (isActive && !isCompleted) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isCompleted]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAction = () => {
    if (isCompleted) {
      // If unmarking, just toggle
      onToggle();
      setIsActive(false);
      setSeconds(0);
    } else if (!isActive) {
      // Start Immediately
      setIsActive(true);
    } else {
      // Complete Task
      setIsActive(false);
      onToggle();
    }
  };

  return (
    <div 
      className={`group relative border-4 p-6 transition-all duration-300 
        ${isCompleted 
            ? 'bg-[#0a0a0a] border-[#333] opacity-60' 
            : isActive
                ? 'bg-[#0a0a0a] border-[#00F0FF] shadow-[8px_8px_0px_0px_#FAFF00] scale-[1.02]'
                : 'bg-[#111] border-[#333] shadow-[8px_8px_0px_0px_#00F0FF] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#FF003C] hover:border-white'
        }`}
    >
      <div className={`absolute -top-5 -right-3 border-4 border-white text-white font-black px-3 py-1 text-sm shadow-[2px_2px_0px_0px_#000] transform rotate-3 ${isCompleted ? 'bg-gray-600' : 'bg-[#FF003C]'}`}>
        {step.time_estimate}
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <span className={`text-4xl md:text-5xl transition-transform duration-300 filter ${isCompleted ? 'grayscale' : 'drop-shadow-[0px_0px_10px_rgba(0,240,255,0.5)]'}`}>
            {step.emoji}
          </span>
          <div className="flex-1">
            <h4 className={`text-2xl md:text-3xl font-black uppercase leading-none mb-2 text-white ${isCompleted ? 'line-through decoration-[#FF003C] decoration-4' : ''}`}>
              {step.action_verb}
            </h4>
            <p className="text-sm font-bold text-gray-400 bg-[#1a1a1a] inline-block px-2 py-1 border-2 border-[#333]">
              WHY: {step.reason}
            </p>
          </div>
        </div>
        
        {/* Timer Display */}
        <div className="flex justify-between items-end border-t-2 border-[#333] pt-4">
             <div className="font-mono">
                <span className="text-xs text-gray-500 block mb-1">
                   SPEEDRUN TIMER
                </span>
                <div className={`text-3xl font-black tracking-widest ${isActive ? 'text-[#00F0FF] animate-pulse' : 'text-gray-600'}`}>
                    {formatTime(seconds)}
                </div>
             </div>

            <BrutalistButton 
                onClick={handleAction}
                variant={isCompleted ? "secondary" : isActive ? "danger" : "primary"}
                className={`text-lg py-2 px-6 min-w-[160px] ${isActive ? 'animate-[pulse_1s_infinite]' : ''}`}
            >
                {isCompleted ? 'COMPLETED' : isActive ? 'FINISH' : 'START'}
            </BrutalistButton>
        </div>
      </div>
      
      <div className={`absolute -left-4 top-4 w-8 h-8 text-black flex items-center justify-center font-bold border-2 border-black rounded-sm shadow-[2px_2px_0px_0px_#000] ${isCompleted ? 'bg-gray-500' : isActive ? 'bg-[#FAFF00]' : 'bg-[#00F0FF]'}`}>
        {index + 1}
      </div>
    </div>
  );
};