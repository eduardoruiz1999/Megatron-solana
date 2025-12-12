import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`relative bg-cyber-gray/40 border border-cyber-cyan/20 backdrop-blur-md p-6 ${className}`}>
      {/* Decorative corner markers */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyber-cyan"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyber-cyan"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyber-cyan"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyber-cyan"></div>
      
      {title && (
        <h3 className="font-display text-xl text-cyber-cyan mb-4 tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-cyber-purple rounded-full animate-pulse"></span>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};