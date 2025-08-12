import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Palette, Zap, RotateCcw } from 'lucide-react';
import { ManualCube } from '../components/manual/ManualCube';
import { ColorPalette } from '../components/manual/ColorPalette';
import { useCubeStore } from '../store/cubeStore';
import { CubeColor } from '../types/cube';
import { solveScannedCube, parseMoves } from '../utils/solver';

// Standard center colors for a solved cube
const CENTER_COLORS: Record<string, CubeColor> = {
  '0,1,0': 'white',   // Top center (U)
  '0,-1,0': 'yellow', // Bottom center (D)
  '1,0,0': 'red',     // Right center (R)
  '-1,0,0': 'orange', // Left center (L)
  '0,0,1': 'green',   // Front center (F)
  '0,0,-1': 'blue',   // Back center (B)
};

export function ManualSolvePage() {
  const [selectedColor, setSelectedColor] = useState<CubeColor | null>(null);
  const [stickerColors, setStickerColors] = useState<Record<string, CubeColor[]>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [solutionMoves, setSolutionMoves] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const { cubies, rotateFace, reset, isAnimating } = useCubeStore();

  // Initialize sticker colors
  useEffect(() => {
    const initialColors: Record<string, CubeColor[]> = {};
    
    cubies.forEach(cubie => {
      const colors: CubeColor[] = ['gray', 'gray', 'gray', 'gray', 'gray', 'gray'];
      
      // Set center stickers to their standard colors
      if (CENTER_COLORS[cubie.id]) {
        const { x, y, z } = cubie.position;
        
        // Materials order: [+X, -X, +Y, -Y, +Z, -Z]
        if (x === 1) colors[0] = 'red';     // Right face
        if (x === -1) colors[1] = 'orange'; // Left face
        if (y === 1) colors[2] = 'white';   // Top face
        if (y === -1) colors[3] = 'yellow'; // Bottom face
        if (z === 1) colors[4] = 'green';   // Front face
        if (z === -1) colors[5] = 'blue';   // Back face
      }
      
      initialColors[cubie.id] = colors;
    });
    
    setStickerColors(initialColors);
  }, [cubies]);

  // Check if cube is complete (no gray stickers)
  useEffect(() => {
    const allColors = Object.values(stickerColors).flat();
    const hasGrayStickers = allColors.includes('gray');
    setIsComplete(!hasGrayStickers && allColors.length > 0);
  }, [stickerColors]);

  const handleStickerClick = (cubieId: string, faceIndex: number) => {
    if (!selectedColor || isAnimating || isSolving) return;

    setStickerColors(prev => ({
      ...prev,
      [cubieId]: prev[cubieId]?.map((color, index) => 
        index === faceIndex ? selectedColor : color
      ) || []
    }));
  };

  const resetCube = () => {
    setIsSolving(false);
    setSolutionMoves('');
    setError('');
    reset();
    
    // Reset to initial state with centers colored
    const initialColors: Record<string, CubeColor[]> = {};
    
    cubies.forEach(cubie => {
      const colors: CubeColor[] = ['gray', 'gray', 'gray', 'gray', 'gray', 'gray'];
      
      if (CENTER_COLORS[cubie.id]) {
        const { x, y, z } = cubie.position;
        
        if (x === 1) colors[0] = 'red';
        if (x === -1) colors[1] = 'orange';
        if (y === 1) colors[2] = 'white';
        if (y === -1) colors[3] = 'yellow';
        if (z === 1) colors[4] = 'green';
        if (z === -1) colors[5] = 'blue';
      }
      
      initialColors[cubie.id] = colors;
    });
    
    setStickerColors(initialColors);
  };

  const solveCube = async () => {
    if (!isComplete || isSolving) return;
    
    setIsSolving(true);
    setError('');
    
    try {
      // Convert sticker colors to cube state format
      const cubeState = {
        U: [] as CubeColor[],
        D: [] as CubeColor[],
        L: [] as CubeColor[],
        R: [] as CubeColor[],
        F: [] as CubeColor[],
        B: [] as CubeColor[]
      };

      // Map stickers to faces (this is a simplified mapping)
      // In a real implementation, you'd need to properly map each sticker position
      // to the correct position in the face arrays
      Object.entries(stickerColors).forEach(([cubieId, colors]) => {
        const [x, y, z] = cubieId.split(',').map(Number);
        
        // Map each face of each cubie to the appropriate face array
        if (y === 1) cubeState.U.push(colors[2]); // Top face
        if (y === -1) cubeState.D.push(colors[3]); // Bottom face
        if (x === -1) cubeState.L.push(colors[1]); // Left face
        if (x === 1) cubeState.R.push(colors[0]); // Right face
        if (z === 1) cubeState.F.push(colors[4]); // Front face
        if (z === -1) cubeState.B.push(colors[5]); // Back face
      });

      // Generate solution
      const solution = solveScannedCube(cubeState);
      setSolutionMoves(solution);
      
      // Parse and execute moves
      const moves = parseMoves(solution);
      
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        
        // Wait for previous animation to complete
        await new Promise(resolve => setTimeout(resolve, i === 0 ? 0 : 800));
        
        // Execute the move
        rotateFace(move.face, move.clockwise);
        
        // If it's a double move, execute again
        if (move.double) {
          await new Promise(resolve => setTimeout(resolve, 400));
          rotateFace(move.face, move.clockwise);
        }
      }
      
    } catch (err) {
      console.error('Solving error:', err);
      setError('Unable to solve cube. Please check that all stickers are filled correctly.');
    } finally {
      setIsSolving(false);
    }
  };

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
          <Palette className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Manual Cube Solver</h1>
          <span className="text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
            Click to Paint
          </span>
        </div>
        
        <div className="w-32" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Left Panel */}
        <div className="w-80 space-y-6">
          <ColorPalette 
            onColorSelect={setSelectedColor}
            selectedColor={selectedColor}
          />
          
          {/* Status */}
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Completion:</span>
                <span className={`font-semibold ${isComplete ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isComplete ? 'Ready to Solve' : 'In Progress'}
                </span>
              </div>
              
              {solutionMoves && (
                <div className="mt-4">
                  <p className="text-white/80 text-sm mb-2">Solution:</p>
                  <div className="bg-black/30 rounded-lg p-3 text-white font-mono text-sm">
                    {solutionMoves}
                  </div>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Controls</h3>
            <div className="space-y-3">
              <button
                onClick={solveCube}
                disabled={!isComplete || isSolving || isAnimating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
              >
                <Zap className="w-5 h-5" />
                {isSolving ? 'Solving...' : 'Solve Cube'}
              </button>
              
              <button
                onClick={resetCube}
                disabled={isAnimating || isSolving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Reset Cube
              </button>
            </div>
          </div>
        </div>

        {/* Cube Display */}
        <div className="flex-1 min-h-[600px] rounded-2xl overflow-hidden border border-white/10">
          <ManualCube 
            onStickerClick={handleStickerClick}
            stickerColors={stickerColors}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-white/50 text-sm">
        Manual Cube Solver • Click colors then click stickers to paint • Centers are pre-filled with standard colors
      </footer>
    </div>
  );
}