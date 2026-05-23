import React from 'react';

interface BrutalistCardProps {
  children: React.ReactNode;
  className?: string;
  color?: 'white' | 'yellow' | 'magenta' | 'cyan';
  title?: string;
}

const colors = {
  white: 'bg-[#111111] text-gray-100 border-[#333] shadow-[8px_8px_0px_0px_#00F0FF]',
  yellow: 'bg-[#FAFF00] text-black border-white shadow-[8px_8px_0px_0px_#FF003C]',
  magenta: 'bg-[#FF003C] text-white border-white shadow-[8px_8px_0px_0px_#00F0FF]',
  cyan: 'bg-[#00F0FF] text-black border-white shadow-[8px_8px_0px_0px_#FAFF00]',
};

export const BrutalistCard: React.FC<BrutalistCardProps> = ({ 
  children, 
  className = '', 
  color = 'white',
  title 
}) => {
  return (
    <div className={`border-4 ${colors[color]} p-6 mb-8 ${className}`}>
      {title && (
        <h3 className="text-2xl font-black border-b-4 border-current pb-2 mb-4 uppercase tracking-tighter">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};