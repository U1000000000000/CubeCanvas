import React, { useEffect } from 'react';
import { Timer, Hash } from 'lucide-react';
import { useCubeStore } from '../../store/cubeStore';

export function Stats() {
  const { moveCount, startTime, currentTime, updateTimer } = useCubeStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (startTime) {
      interval = setInterval(() => {
        updateTimer();
      }, 10);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, updateTimer]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMs = Math.floor((ms % 1000) / 10);
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}.${remainingMs.toString().padStart(2, '0')}`;
  };

  return (
    // Small screens: bottom center below buttons with full transparency
    // Large screens: bottom right with semi-transparency
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:bottom-12 sm:right-4 sm:left-auto sm:translate-x-0 sm:right-6 z-50">
      <div className="flex flex-row items-center gap-3 bg-transparent sm:bg-white/25 backdrop-blur-none sm:backdrop-blur-md rounded-full px-3 sm:px-4 py-2 shadow-none sm:shadow-lg text-black font-medium text-sm">
        
        {/* Timer Section */}
        <div className="flex items-center gap-1.5">
          <Timer className="w-4 h-4 opacity-80" />
          <span>{formatTime(currentTime)}</span>
        </div>
        
        {/* Separator */}
        <div className="w-px h-4 bg-white/30"></div>

        {/* Move Count Section */}
        <div className="flex items-center gap-1.5">
          <Hash className="w-4 h-4 opacity-80" />
          <span>{moveCount}</span>
        </div>

      </div>
    </div>
  );
}