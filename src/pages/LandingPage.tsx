import React from 'react';
import { Link } from 'react-router-dom';
import { Cuboid as Cube, Play, Star, Trophy, Camera, Palette } from 'lucide-react';

export function LandingPage() {
  const cubes = [
    { 
      size: 2, 
      label: '2×2×2 Cube', 
      description: 'Perfect for beginners',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      pieces: 8,
      difficulty: 'Beginner',
      icon: <Star className="w-6 h-6" />
    },
    { 
      size: 3, 
      label: '3×3×3 Cube', 
      description: 'The classic original',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      pieces: 27,
      difficulty: 'Intermediate',
      icon: <Trophy className="w-6 h-6" />
    },
    { 
      size: 4, 
      label: '4×4×4 Cube', 
      description: 'Advanced challenge',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      pieces: 56,
      difficulty: 'Advanced',
      icon: <Cube className="w-6 h-6" />
    },
  ];

  const scanFeature = {
    label: 'Scan & Solve My Cube',
    description: 'Use AI to solve your physical cube',
    color: 'from-purple-500 to-pink-500',
    hoverColor: 'hover:from-purple-600 hover:to-pink-600',
    route: '/scan',
    icon: <Camera className="w-6 h-6" />
  };

  const manualFeature = {
    label: 'Manual Cube Solver',
    description: 'Paint your cube and solve it',
    color: 'from-indigo-500 to-purple-500',
    hoverColor: 'hover:from-indigo-600 hover:to-purple-600',
    route: '/manual-solve',
    icon: <Palette className="w-6 h-6" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      {/* Header */}
      <header className="p-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="relative">
            <Cube className="w-12 h-12 text-white animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 text-white/30 animate-spin">
              <Cube className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white">
            Rubik's Cube Playground
          </h1>
        </div>
        <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          Master the world's most famous puzzle in stunning 3D. Choose your challenge level and start solving!
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full">
          {/* New Features - Featured prominently */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white text-center mb-6">✨ New Features</h2>
            <div className="max-w-2xl mx-auto">
              {/* Manual Solve Feature */}
              <Link
                to="/scan"
                className={`
                  block p-6 rounded-2xl shadow-2xl transition-all duration-300 transform
                  bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600
                  hover:scale-105 hover:shadow-3xl
                  border border-white/10 backdrop-blur-sm
                  animate-fade-in-up
                `}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Palette className="w-6 h-6" />
                    <span className="text-sm font-semibold text-white/90 bg-white/20 px-3 py-1 rounded-full">
                      Interactive
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">🎨</div>
                    <div className="text-xs text-white/70">paint</div>
                  </div>
                </div>

                {/* Manual Visual */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white/20 rounded-lg border-2 border-white/30 flex items-center justify-center">
                      <Palette className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
                      3D
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Manual Cube Solver
                  </h2>
                  <p className="text-white/80 mb-4">
                    Paint your cube and solve it
                  </p>
                  
                  {/* Play Button */}
                  <div className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-xl py-3 px-6 font-semibold text-white">
                    <Palette className="w-5 h-5" />
                    <span>Start Painting</span>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Link>
            </div>
          </div>

          {/* Virtual Cubes */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Virtual Cubes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {cubes.map((cube, index) => (
              <div
                key={cube.size}
                className="group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link
                  to={`/cube/${cube.size}`}
                  className={`
                    block p-8 rounded-2xl shadow-2xl transition-all duration-300 transform
                    bg-gradient-to-br ${cube.color} ${cube.hoverColor}
                    hover:scale-105 hover:shadow-3xl
                    border border-white/10 backdrop-blur-sm
                    animate-fade-in-up
                  `}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {cube.icon}
                      <span className="text-sm font-semibold text-white/90 bg-white/20 px-3 py-1 rounded-full">
                        {cube.difficulty}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{cube.pieces}</div>
                      <div className="text-xs text-white/70">pieces</div>
                    </div>
                  </div>

                  {/* Cube Visual */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-white/20 rounded-lg border-2 border-white/30 flex items-center justify-center">
                        <Cube className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
                        {cube.size}
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {cube.label}
                    </h2>
                    <p className="text-white/80 mb-6">
                      {cube.description}
                    </p>
                    
                    {/* Play Button */}
                    <div className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-xl py-3 px-6 font-semibold text-white">
                      <Play className="w-5 h-5" />
                      <span>Start Playing</span>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-8">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-white/80">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-6 h-6 text-indigo-400" />
                </div>
                <h4 className="font-semibold mb-2">Manual Painting</h4>
                <p className="text-sm">Click and paint each sticker to match your physical cube</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="font-semibold mb-2">Manual Painting</h4>
                <p className="text-sm">Click and paint each sticker to match your physical cube</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Cube className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="font-semibold mb-2">3D Interactive</h4>
                <p className="text-sm">Realistic 3D cube with smooth animations and intuitive controls</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="font-semibold mb-2">Multiple Sizes</h4>
                <p className="text-sm">From beginner 2×2 to challenging 4×4 cubes</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="font-semibold mb-2">Track Progress</h4>
                <p className="text-sm">Timer, move counter, and scramble functions</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-white/50 text-sm border-t border-white/10">
        <p>Built with React Three Fiber • AI-powered cube solving • Drag to rotate view • Click and drag faces to solve</p>
      </footer>
    </div>
  );
}