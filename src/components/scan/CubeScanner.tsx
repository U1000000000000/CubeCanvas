import React, { useRef, useEffect, useState } from 'react';
import { useCameraFeed } from '../../hooks/useCameraFeed';
import { mapRGBToCubeColor, getAverageColor } from '../../utils/colorMapping';
import { Camera, Square, CheckCircle } from 'lucide-react';

const FACE_NAMES = {
  U: 'Top (White)',
  D: 'Bottom (Yellow)', 
  F: 'Front (Green)',
  B: 'Back (Blue)',
  L: 'Left (Orange)',
  R: 'Right (Red)'
};

const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'];

export function CubeScanner({ onScanComplete }) {
  const { videoRef, stream, error, isLoading, startCamera, stopCamera } = useCameraFeed();
  const canvasRef = useRef(null);
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);
  const [scannedFaces, setScannedFaces] = useState({});
  const [isCapturing, setIsCapturing] = useState(false);

  const currentFace = FACE_ORDER[currentFaceIndex];
  const isComplete = Object.keys(scannedFaces).length === 6;

  useEffect(() => {
    if (isComplete) {
      onScanComplete(scannedFaces);
    }
  }, [isComplete, scannedFaces, onScanComplete]);

  const drawGrid = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame
    ctx.drawImage(video, 0, 0);
    
    // Draw 3x3 grid overlay
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const gridSize = Math.min(canvas.width, canvas.height) * 0.6;
    const cellSize = gridSize / 3;
    const startX = centerX - gridSize / 2;
    const startY = centerY - gridSize / 2;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    // Draw grid lines
    for (let i = 0; i <= 3; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(startX + i * cellSize, startY);
      ctx.lineTo(startX + i * cellSize, startY + gridSize);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(startX, startY + i * cellSize);
      ctx.lineTo(startX + gridSize, startY + i * cellSize);
      ctx.stroke();
    }
    
    // Draw face label
    ctx.fillStyle = '#00ff00';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Scan ${FACE_NAMES[currentFace]}`,
      centerX,
      startY - 20
    );
  };

  const captureFace = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    setIsCapturing(true);
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const gridSize = Math.min(canvas.width, canvas.height) * 0.6;
    const cellSize = gridSize / 3;
    const startX = centerX - gridSize / 2;
    const startY = centerY - gridSize / 2;
    
    const colors = [];
    
    // Sample colors from each grid cell
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = startX + col * cellSize + cellSize * 0.3;
        const y = startY + row * cellSize + cellSize * 0.3;
        const width = cellSize * 0.4;
        const height = cellSize * 0.4;
        
        const avgColor = getAverageColor(canvas, x, y, width, height);
        const cubeColor = mapRGBToCubeColor(avgColor.r, avgColor.g, avgColor.b);
        colors.push(cubeColor);
      }
    }
    
    setScannedFaces(prev => ({
      ...prev,
      [currentFace]: colors
    }));
    
    if (currentFaceIndex < FACE_ORDER.length - 1) {
      setCurrentFaceIndex(prev => prev + 1);
    }
    
    setTimeout(() => setIsCapturing(false), 500);
  };

  const resetScan = () => {
    setScannedFaces({});
    setCurrentFaceIndex(0);
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      const interval = setInterval(drawGrid, 100);
      return () => clearInterval(interval);
    }
  }, [stream, currentFace]);

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={startCamera}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="text-center p-8">
        <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-4">Camera Access Required</h3>
        <p className="text-gray-600 mb-6">
          We need camera access to scan your cube faces
        </p>
        <button
          onClick={startCamera}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Starting Camera...' : 'Start Camera'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="relative mb-6">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-2xl mx-auto rounded-lg"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full max-w-2xl mx-auto"
          style={{ pointerEvents: 'none' }}
        />
      </div>

      {!isComplete && (
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">
            Step {currentFaceIndex + 1} of 6: {FACE_NAMES[currentFace]}
          </h3>
          <p className="text-gray-600 mb-4">
            Align the {FACE_NAMES[currentFace].toLowerCase()} face with the green grid
          </p>
          <button
            onClick={captureFace}
            disabled={isCapturing}
            className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <Square className="w-5 h-5" />
            {isCapturing ? 'Capturing...' : 'Capture Face'}
          </button>
        </div>
      )}

      {isComplete && (
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold mb-2">Scan Complete!</h3>
          <p className="text-gray-600 mb-4">
            All 6 faces have been captured successfully
          </p>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-6">
        {FACE_ORDER.map((face, index) => (
          <div
            key={face}
            className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-semibold ${
              scannedFaces[face]
                ? 'bg-green-500 text-white border-green-500'
                : index === currentFaceIndex
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-200 text-gray-500 border-gray-300'
            }`}
          >
            {face}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={resetScan}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Reset Scan
        </button>
        <button
          onClick={stopCamera}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Stop Camera
        </button>
      </div>
    </div>
  );
}