import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash for 2.5 seconds total
    const timer = setTimeout(() => {
      setIsVisible(false); // Trigger fade out
      setTimeout(onComplete, 700); // Wait for transition to finish before unmounting
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Animated NeuroScan Icon */}
      <div className="relative w-40 h-40 mb-8">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <defs>
                <linearGradient id="neuroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2dd4bf" /> {/* teal-400 */}
                    <stop offset="100%" stopColor="#6366f1" /> {/* indigo-500 */}
                </linearGradient>
                <mask id="brainMask">
                    <path d="M50 15 C 25 15, 10 35, 10 60 C 10 85, 30 95, 50 95 C 70 95, 90 85, 90 60 C 90 35, 75 15, 50 15 Z" fill="white" />
                </mask>
                <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
            
            {/* Brain Outline Halo */}
            <path 
                d="M50 15 C 25 15, 10 35, 10 60 C 10 85, 30 95, 50 95 C 70 95, 90 85, 90 60 C 90 35, 75 15, 50 15 Z" 
                fill="none" 
                stroke="url(#neuroGradient)" 
                strokeWidth="2"
                className="animate-[pulse_3s_ease-in-out_infinite]"
            />

            {/* Internal Neural Network Nodes */}
            <g mask="url(#brainMask)">
                {/* Connecting Lines */}
                <path d="M30 40 L50 30 L70 40 L80 60 L50 80 L20 60 Z" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
                <path d="M50 30 L50 80 M30 40 L70 40 M20 60 L80 60" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" fill="none" />
                
                {/* Nodes */}
                <circle cx="50" cy="30" r="2" fill="#2dd4bf" className="animate-pulse" />
                <circle cx="30" cy="40" r="2" fill="#6366f1" className="animate-pulse delay-75" />
                <circle cx="70" cy="40" r="2" fill="#2dd4bf" className="animate-pulse delay-150" />
                <circle cx="20" cy="60" r="2" fill="#6366f1" className="animate-pulse delay-200" />
                <circle cx="80" cy="60" r="2" fill="#2dd4bf" className="animate-pulse delay-300" />
                <circle cx="50" cy="80" r="2" fill="#6366f1" className="animate-pulse delay-500" />
                
                {/* Central Core */}
                <circle cx="50" cy="55" r="10" stroke="url(#neuroGradient)" strokeWidth="1" fill="none" opacity="0.6">
                     <animate attributeName="r" values="8;12;8" dur="3s" repeatCount="indefinite" />
                     <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
                </circle>
            </g>

            {/* Scanning Beam Effect */}
            <rect x="0" y="0" width="100" height="100" fill="url(#scanGradient)" mask="url(#brainMask)" opacity="0.3">
                <animate attributeName="y" values="-100;100" dur="2s" repeatCount="indefinite" />
            </rect>
        </svg>
      </div>

      <div className="text-center overflow-hidden">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-indigo-400 to-purple-500 mb-3 font-sans tracking-tight animate-slideIn">
          NeuroScan
        </h1>
        <div className="flex items-center justify-center gap-2 opacity-0 animate-[fadeIn_0.5s_ease-out_0.3s_forwards]">
            <div className="h-[1px] w-8 bg-slate-600"></div>
            <p className="text-slate-400 text-sm tracking-[0.2em] uppercase font-medium">Adaptive Care Platform</p>
            <div className="h-[1px] w-8 bg-slate-600"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;