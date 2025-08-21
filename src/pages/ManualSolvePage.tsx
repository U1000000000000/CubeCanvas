import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Palette, Shuffle, Check, X, Info } from 'lucide-react';
import { ManualCube } from '../components/manual/ManualCube';
import { ColorPalette } from '../components/manual/ColorPalette';
import { useManualCubeStore } from '../store/manualCubeStore';

export function ManualSolvePage() {
  const { 
    stickerColors, 
    selectedColor, 
    setSelectedColor, 
    setStickerColor, 
    resetCube,
    isComplete 
  } = useManualCubeStore();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [solutionMoves, setSolutionMoves] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  const handleSolveCube = async () => {
    if (!isComplete()) {
      alert('Please fill in all stickers before solving!');
      return;
    }

    // Hardcoded solution for UI development
    const moves = ['R', 'U', "R'", "U'"];
    setSolutionMoves(moves);
    setCurrentMoveIndex(0);
    setIsAnimating(true);

    // Animate moves with delay
    for (let i = 0; i < moves.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentMoveIndex(i + 1);
    }

    setIsAnimating(false);
  };

  const handleReset = () => {
    resetCube();
    setSolutionMoves([]);
    setCurrentMoveIndex(0);
    setIsAnimating(false);
  };

  const completedStickers = Object.values(stickerColors).filter(color => color !== '#444').length;
  const totalStickers = 54;
  const progress = (completedStickers / totalStickers) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowLeft className="w-5 h-5" />
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Palette className="w-8 h-8 text-indigo-600" />
              Manual Cube Solver
            </h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {completedStickers}/{totalStickers} stickers
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cube Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">3D Cube</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isAnimating}
                >
                  <X className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
            
            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
              <ManualCube 
                stickerColors={stickerColors}
                selectedColor={selectedColor}
                onStickerClick={setStickerColor}
                isAnimating={isAnimating}
              />
            </div>

            {/* Solution Display */}
            {solutionMoves.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Solution Moves:</h3>
                <div className="flex flex-wrap gap-2">
                  {solutionMoves.map((move, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-mono ${
                        index < currentMoveIndex
                          ? 'bg-green-200 text-green-800'
                          : index === currentMoveIndex && isAnimating
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {move}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            {/* Color Palette */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Color Palette</h2>
              <ColorPalette 
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
              />
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Instructions
              </h2>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  Select a color from the palette
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  Click on cube stickers to paint them
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  Fill all gray stickers (centers are pre-filled)
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                  Click "Solve Cube" to see the solution
                </li>
              </ol>
            </div>

            {/* Solve Button */}
            <button
              onClick={handleSolveCube}
              disabled={!isComplete() || isAnimating}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                isComplete() && !isAnimating
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAnimating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Solving...
                </>
              ) : isComplete() ? (
                <>
                  <Shuffle className="w-5 h-5" />
                  Solve Cube
                </>
              ) : (
                <>
                  <X className="w-5 h-5" />
                  Fill All Stickers First
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}