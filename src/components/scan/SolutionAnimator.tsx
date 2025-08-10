import React, { useState, useEffect } from 'react';
import { RubiksCube } from '../cube/RubiksCube';
import { useCubeStore } from '../../store/cubeStore';
import { solveScannedCube, parseMoves } from '../../utils/solver';
import { Play, Pause, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SolutionAnimator({ scannedState }) {
  const [solution, setSolution] = useState('');
  const [moves, setMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState('');
  
  const { rotateFace, reset, isAnimating: cubeIsAnimating } = useCubeStore();

  // Initialize cube with scanned state
  useEffect(() => {
    // Reset to solved state first
    reset();
    
    // TODO: Initialize cube with scanned colors
    // This would require modifying the cube store to accept initial state
    // For now, we'll work with the solved cube and show the solution
  }, [reset]);

  // Generate solution
  useEffect(() => {
    try {
      const solutionMoves = solveScannedCube(scannedState);
      setSolution(solutionMoves);
      setMoves(parseMoves(solutionMoves));
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Solution error:', err);
    }
  }, [scannedState]);

  const executeMove = async (move) => {
    const { face, clockwise, double } = move;
    
    // Execute the move
    rotateFace(face, clockwise);
    
    if (double) {
      // Wait for first rotation to complete, then do second
      setTimeout(() => {
        rotateFace(face, clockwise);
      }, 400);
    }
  };

  const startAnimation = () => {
    if (moves.length === 0) return;
    
    setIsAnimating(true);
    setIsPaused(false);
    animateNextMove();
  };

  const animateNextMove = () => {
    if (currentMoveIndex >= moves.length) {
      setIsAnimating(false);
      return;
    }

    if (isPaused) return;

    const move = moves[currentMoveIndex];
    executeMove(move);
    
    setCurrentMoveIndex(prev => prev + 1);
    
    // Wait for animation to complete before next move
    setTimeout(() => {
      if (!isPaused) {
        animateNextMove();
      }
    }, 800); // Slightly longer than cube animation (600ms)
  };

  const pauseAnimation = () => {
    setIsPaused(true);
  };

  const resumeAnimation = () => {
    setIsPaused(false);
    if (isAnimating && currentMoveIndex < moves.length) {
      animateNextMove();
    }
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setIsPaused(false);
    setCurrentMoveIndex(0);
    reset();
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <h3 className="font-semibold">Solving Error</h3>
          <p>{error}</p>
        </div>
        <div className="text-center">
          <Link
            to="/scan"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Scan Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Cube Solution</h1>
          <p className="text-white/80">Follow along with the animated solution</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cube Display */}
        <div className="lg:col-span-2">
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Virtual Cube</h2>
            <div className="h-96 rounded-xl overflow-hidden">
              <RubiksCube />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Solution Info */}
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Solution</h3>
            <div className="text-white/80 text-sm mb-4">
              <p><strong>Moves:</strong> {moves.length}</p>
              <p><strong>Progress:</strong> {currentMoveIndex} / {moves.length}</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3 text-white font-mono text-sm">
              {solution || 'Generating solution...'}
            </div>
          </div>

          {/* Animation Controls */}
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Controls</h3>
            <div className="space-y-3">
              {!isAnimating ? (
                <button
                  onClick={startAnimation}
                  disabled={moves.length === 0 || cubeIsAnimating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Start Solution
                </button>
              ) : (
                <button
                  onClick={isPaused ? resumeAnimation : pauseAnimation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-colors"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              )}
              
              <button
                onClick={resetAnimation}
                disabled={cubeIsAnimating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>
          </div>

          {/* Current Move */}
          {isAnimating && currentMoveIndex < moves.length && (
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Current Move</h3>
              <div className="text-2xl font-mono text-center py-4 bg-black/30 rounded-lg text-white">
                {solution.split(' ')[currentMoveIndex] || ''}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}