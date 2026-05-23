import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/gemini';
import { BrutalistButton } from './BrutalistButton';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'PROTOCOL ACTIVATED. I AM ZENBOT. ASK ME ANYTHING.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Convert to Gemini format history
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await getChatResponse(history, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'ERROR: COMMUNICATION SEVERED.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 bg-black border-4 border-[#00F0FF] shadow-[8px_8px_0px_0px_#FF003C] mb-4 animate-[slideIn_0.3s_ease-out] flex flex-col h-96">
          <div className="bg-[#00F0FF] p-2 flex justify-between items-center border-b-4 border-black">
            <h3 className="font-black text-black uppercase">ZENBOT ASSISTANT</h3>
            <button onClick={() => setIsOpen(false)} className="text-black font-bold hover:bg-white px-2">X</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 border-2 text-sm font-bold ${
                    msg.role === 'user' 
                      ? 'bg-[#FF003C] text-white border-white' 
                      : 'bg-[#111] text-[#00F0FF] border-[#333]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-[#FAFF00] animate-pulse text-xs font-mono">
                THINKING...
              </div>
            )}
          </div>

          <div className="p-2 border-t-4 border-[#333] bg-[#0a0a0a] flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="QUERY..."
              className="flex-1 bg-[#111] border-2 border-[#333] text-white p-2 text-sm focus:border-[#00F0FF] outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="bg-[#00F0FF] text-black font-black px-3 border-2 border-white hover:bg-white"
            >
              {'>'}
            </button>
          </div>
        </div>
      )}

      <BrutalistButton 
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-16 h-16 flex items-center justify-center p-0 text-3xl"
        style={{ borderRadius: '999px' }} // Override brutalisbutton generic style
      >
        {isOpen ? 'X' : '💬'}
      </BrutalistButton>
    </div>
  );
};