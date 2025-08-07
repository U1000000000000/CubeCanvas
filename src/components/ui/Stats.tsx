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
    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-bold text-white mb-4">Statistics</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80">
            <Timer className="w-4 h-4" />
            <span>Time</span>
          </div>
          <div className="text-xl font-mono font-bold text-white">
            {formatTime(currentTime)}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80">
            <Hash className="w-4 h-4" />
            <span>Moves</span>
          </div>
          <div className="text-xl font-mono font-bold text-white">
            {moveCount}
          </div>
        </div>
      </div>
    </div>
  );
}