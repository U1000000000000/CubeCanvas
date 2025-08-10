import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Camera, Zap } from 'lucide-react';
import { CubeScanner } from '../components/scan/CubeScanner';
import { SolutionAnimator } from '../components/scan/SolutionAnimator';

export function CubeScanPage() {
  const [scannedState, setScannedState] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  const handleScanComplete = (state) => {
    console.log('Scan completed:', state);
    setScannedState(state);
  };

  const startSolution = () => {
    setShowSolution(true);
  };

  const resetScan = () => {
    setScannedState(null);
    setShowSolution(false);
  };

  if (showSolution && scannedState) {
    return <SolutionAnimator scannedState={scannedState} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
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
          <Camera className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Scan & Solve</h1>
          <span className="text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
            AI Powered
          </span>
        </div>
        
        <div className="w-32" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {!scannedState ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Scan Your Physical Cube
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Use your camera to scan all 6 faces of your Rubik's cube. 
                We'll detect the colors and generate a step-by-step solution for you.
              </p>
            </div>

            <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
              <CubeScanner onScanComplete={handleScanComplete} />
            </div>

            {/* Instructions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-white/80">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">1. Position Your Cube</h3>
                <p className="text-sm">Align each face with the green grid overlay</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">2. Capture All Faces</h3>
                <p className="text-sm">Scan all 6 faces in the suggested order</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">3. Get Solution</h3>
                <p className="text-sm">Watch the animated step-by-step solution</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Cube Scanned Successfully!
              </h2>
              
              <p className="text-white/80 mb-8">
                All 6 faces have been captured. Ready to generate and animate the solution?
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetScan}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Scan Again
                </button>
                <button
                  onClick={startSolution}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Solve My Cube
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-white/50 text-sm">
        Scan & Solve • AI-powered cube solving • Point camera at each face to detect colors
      </footer>
    </div>
  );
}