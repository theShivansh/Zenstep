import React from 'react';

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const BrutalistButton: React.FC<BrutalistButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  disabled,
  ...props 
}) => {
  const baseStyle = "border-4 font-black uppercase tracking-widest px-8 py-4 text-xl transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#00F0FF] border-white text-black shadow-[6px_6px_0px_0px_#FF003C] hover:bg-[#00D0DF]",
    secondary: "bg-transparent border-[#FAFF00] text-[#FAFF00] shadow-[6px_6px_0px_0px_rgba(250,255,0,0.5)] hover:bg-[#111]",
    danger: "bg-[#FF003C] border-white text-white shadow-[6px_6px_0px_0px_#00F0FF] hover:bg-[#D40044]",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};