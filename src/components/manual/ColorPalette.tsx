import React from 'react';
import { CubeColor } from '../../types/cube';

interface ColorPaletteProps {
  onColorSelect: (color: CubeColor) => void;
  selectedColor: CubeColor | null;
}

const COLORS: { color: CubeColor; name: string; hex: string }[] = [
  { color: 'white', name: 'White', hex: '#ffffff' },
  { color: 'yellow', name: 'Yellow', hex: '#ffed4a' },
  { color: 'red', name: 'Red', hex: '#e53e3e' },
  { color: 'orange', name: 'Orange', hex: '#fd7f28' },
  { color: 'green', name: 'Green', hex: '#38a169' },
  { color: 'blue', name: 'Blue', hex: '#3182ce' },
];

export function ColorPalette({ onColorSelect, selectedColor }: ColorPaletteProps) {
  return (
    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Color Palette</h3>
      <p className="text-white/80 text-sm mb-4">
        Click a color, then click any sticker on the cube to paint it.
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {COLORS.map(({ color, name, hex }) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className={`
              flex items-center gap-3 p-3 rounded-lg transition-all duration-200
              ${selectedColor === color 
                ? 'bg-white/20 border-2 border-white/50' 
                : 'bg-white/10 hover:bg-white/15 border-2 border-transparent'
              }
            `}
          >
            <div 
              className="w-6 h-6 rounded border-2 border-white/30"
              style={{ backgroundColor: hex }}
            />
            <span className="text-white font-medium">{name}</span>
          </button>
        ))}
      </div>
      
      {selectedColor && (
        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <p className="text-white/80 text-sm">
            Selected: <span className="font-semibold text-white">{selectedColor}</span>
          </p>
          <p className="text-white/60 text-xs mt-1">
            Click any cube sticker to apply this color
          </p>
        </div>
      )}
    </div>
  );
}