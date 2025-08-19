import React from 'react';
import { MousePointer2, Keyboard, Info } from 'lucide-react';

export function Instructions() {
  return (
    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Info className="w-5 h-5" />
        How to Play
      </h2>
      
      <div className="space-y-4 text-white/80">
        <div className="flex items-start gap-3">
          <MousePointer2 className="w-4 h-4 mt-1 text-blue-400" />
          <div>
            <p className="font-medium text-white">Mouse Controls</p>
            <p className="text-sm">Drag to rotate the entire cube view</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Keyboard className="w-4 h-4 mt-1 text-green-400" />
          <div>
            <p className="font-medium text-white">Face Notation</p>
            <p className="text-sm">U/D = Up/Down, L/R = Left/Right, F/B = Front/Back</p>
            <p className="text-sm">Add ' for counter-clockwise (e.g., U')</p>
          </div>
        </div>
        
        <div className="pt-2 border-t border-white/10">
          <p className="text-xs text-white/60">
            Standard colors: White (top), Yellow (bottom), Red (right), Orange (left), Green (front), Blue (back)
          </p>
        </div>
      </div>
    </div>
  );
}