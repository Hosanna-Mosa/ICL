import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`font-bold tracking-tight flex items-center gap-3 ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center">
        <img 
          src="/brelin_white.png" 
          alt="BRELIS Logo" 
          className="h-12 w-12 object-contain"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }}
        />
      </div>
      <div className="flex flex-col">
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-black">
          BRELIS
        </span>
        <span className="text-white text-sm font-medium">
          Streetwear
        </span>
      </div>
    </div>
  );
};