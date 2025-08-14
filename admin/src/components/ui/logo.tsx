import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`font-bold tracking-tight flex items-center ${sizeClasses[size]} ${className}`}>
      <img 
        src="/Brelis-01.jpg" 
        alt="BRELIS Logo" 
        className="h-6 w-auto mr-2"
      />
      <span className="bg-gradient-primary bg-clip-text text-transparent">BRELIS</span>
      <span className="text-foreground ml-1">Streetwear</span>
    </div>
  );
};