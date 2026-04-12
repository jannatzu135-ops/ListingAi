import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Abstract "L" + Shopping Bag Shape */}
      <path 
        d="M7 4V17C7 18.6569 8.34315 20 10 20H18" 
        className="stroke-blue-600" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M7 8H17C18.6569 8 20 9.34315 20 11V17C20 18.6569 18.6569 20 17 20H10" 
        className="stroke-blue-600/30" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Sparkle/AI Element */}
      <path 
        d="M14 4L14.5 5.5L16 6L14.5 6.5L14 8L13.5 6.5L12 6L13.5 5.5L14 4Z" 
        className="fill-blue-500 animate-pulse" 
      />
      <circle cx="7" cy="4" r="1.5" className="fill-blue-600" />
    </svg>
  );
};
