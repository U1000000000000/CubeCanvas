import React from 'react';
import { RotateCw, RotateCcw, Shuffle, RotateCcw as Reset } from 'lucide-react';
import { useCubeStore } from '../../store/cubeStore';
import { Face } from '../../types/cube';

interface FaceButtonProps {
  face: Face;
  label: string;
  color: string;
}

function FaceButton({ face, label, color }: FaceButtonProps) {
  const { rotateFace, isAnimating } = useCubeStore();

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`w-4 h-4 rounded-sm border border-white/20`}
        style={{ backgroundColor: color }}
      />
      <div className="flex gap-1">
        <button
          onClick={() => rotateFace(face, true)}
          disabled={isAnimating}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg backdrop-blur-sm border border-white/10 transition-all duration-200 text-white font-medium min-w-[40px] text-sm"
          title={`Rotate ${label} clockwise`}
        >
          {label}
        </button>
        <button
          onClick={() => rotateFace(face, false)}
          disabled={isAnimating}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg backdrop-blur-sm border border-white/10 transition-all duration-200 text-white font-medium min-w-[40px] text-sm"
          title={`Rotate ${label} counter-clockwise`}
        >
          {label}'
        </button>
      </div>
    </div>
  );
}

export function Controls() {
  const { scramble, reset, isAnimating, rotateFace } = useCubeStore();

  const faces: Array<{ face: Face; label: string; color: string }> = [
    { face: 'U', label: 'U', color: '#ffffff' },
    { face: 'D', label: 'D', color: '#ffed4a' },
    { face: 'L', label: 'L', color: '#fd7f28' },
    { face: 'R', label: 'R', color: '#e53e3e' },
    { face: 'F', label: 'F', color: '#38a169' },
    { face: 'B', label: 'B', color: '#3182ce' },
  ];

  return (
    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <RotateCw className="w-5 h-5" />
        Face Controls
      </h2>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {faces.map((face) => (
          <FaceButton
            key={face.face}
            face={face.face}
            label={face.label}
            color={face.color}
          />
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={() => rotateFace('F', true)}
            disabled={isAnimating}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all duration-200"
          >
            Rotate Front
          </button>
          <button
            onClick={() => rotateFace('R', true)}
            disabled={isAnimating}
            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all duration-200"
          >
            Rotate Right
          </button>
          <button
            onClick={() => rotateFace('U', true)}
            disabled={isAnimating}
            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-gray-800 font-medium transition-all duration-200"
          >
            Rotate Top
          </button>
        </div>
        
        <div className="flex gap-3">
        <button
          onClick={scramble}
          disabled={isAnimating}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Shuffle className="w-4 h-4" />
          Scramble
        </button>
        
        <button
          onClick={reset}
          disabled={isAnimating}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Reset className="w-4 h-4" />
          Reset
        </button>
      </div>
      </div>
    </div>
  );
}