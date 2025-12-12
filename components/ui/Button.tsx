import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative font-display font-bold uppercase tracking-wider py-3 px-6 transition-all duration-300 transform clip-path-polygon disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cyber-cyan text-cyber-black hover:bg-white hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]",
    secondary: "bg-transparent border border-cyber-purple text-cyber-purple hover:bg-cyber-purple hover:text-white hover:shadow-[0_0_20px_rgba(188,19,254,0.6)]",
    danger: "bg-cyber-red text-white hover:shadow-[0_0_20px_rgba(255,0,60,0.6)]",
    ghost: "bg-transparent text-gray-400 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
           <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
           </svg>
           PROCESSING
        </span>
      ) : children}
    </button>
  );
};