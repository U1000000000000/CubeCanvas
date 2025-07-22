import React from 'react';
import { RubiksCube } from './components/cube/RubiksCube';
import { Controls } from './components/ui/Controls';
import { Stats } from './components/ui/Stats';
import { Instructions } from './components/ui/Instructions';
import { Cuboid as Cube } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Cube className="w-8 h-8 text-white" />
          <h1 className="text-4xl font-bold text-white">Rubik's Cube Simulator</h1>
        </div>
        <p className="text-white/70 text-lg">Master the classic 3×3×3 puzzle in 3D</p>
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
        Use mouse to rotate view • Click face buttons to turn layers • Enjoy solving!
      </footer>
    </div>
  );
}

export default App;