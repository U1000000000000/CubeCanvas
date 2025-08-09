import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Cuboid as Cube } from 'lucide-react';
import { RubiksCube } from '../components/cube/RubiksCube';
import { Controls } from '../components/ui/Controls';
import { Stats } from '../components/ui/Stats';
import { Instructions } from '../components/ui/Instructions';

export function Cube3Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Cube className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">3×3×3 Cube</h1>
          <span className="text-sm bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
            Classic • 27 pieces
          </span>
        </div>
        
        <div className="w-32" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Left Panel */}
        <div className="w-80 space-y-6">
          <Stats />
          <Controls />
          <Instructions />
        </div>

        {/* Cube Display */}
        <div className="flex-1 min-h-[600px] rounded-2xl overflow-hidden border border-white/10">
          <RubiksCube />
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-white/50 text-sm">
        3×3×3 Cube • The original classic • Use mouse to rotate view • Click face buttons to turn layers
      </footer>
    </div>
  );
}