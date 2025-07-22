import { create } from 'zustand';
import { CubeState, CubieState, Face, Move, CubeColor, CubiePosition } from '../types/cube';
import { 
  rotateMaterialsClockwise, 
  getFaceRotationAxis, 
  getFaceRotationDirection,
  rotatePosition,
  getCubiesOnFace 
} from '../utils/rotationUtils';

// Standard Rubik's Cube colors mapped to Three.js coordinate system
const FACE_COLORS = {
  RIGHT: 'red',     // +X
  LEFT: 'orange',   // -X
  TOP: 'white',     // +Y
  BOTTOM: 'yellow', // -Y
  FRONT: 'green',   // +Z
  BACK: 'blue'      // -Z
} as const;

function getCubieType(x: number, y: number, z: number): 'corner' | 'edge' | 'center' | 'core' {
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  const absZ = Math.abs(z);
  
  // Core piece (center of cube)
  if (absX === 0 && absY === 0 && absZ === 0) return 'core';
  
  // Corner pieces (3 non-zero coordinates)
  if (absX === 1 && absY === 1 && absZ === 1) return 'corner';
  
  // Center pieces (1 non-zero coordinate)
  if ((absX === 1 && absY === 0 && absZ === 0) ||
      (absX === 0 && absY === 1 && absZ === 0) ||
      (absX === 0 && absY === 0 && absZ === 1)) return 'center';
  
  // Edge pieces (2 non-zero coordinates)
  return 'edge';
}

// Generate materials for a cubie at position (x, y, z)
// Returns array of 6 materials in Three.js BoxGeometry order: [+X, -X, +Y, -Y, +Z, -Z]
function getCubieMaterials(x: number, y: number, z: number): CubeColor[] {
  const materials: CubeColor[] = ['black', 'black', 'black', 'black', 'black', 'black'];
  
  // +X face (right) - show red sticker if on right edge
  if (x === 1) materials[0] = FACE_COLORS.RIGHT as CubeColor;
  
  // -X face (left) - show orange sticker if on left edge
  if (x === -1) materials[1] = FACE_COLORS.LEFT as CubeColor;
  
  // +Y face (top) - show white sticker if on top edge
  if (y === 1) materials[2] = FACE_COLORS.TOP as CubeColor;
  
  // -Y face (bottom) - show yellow sticker if on bottom edge
  if (y === -1) materials[3] = FACE_COLORS.BOTTOM as CubeColor;
  
  // +Z face (front) - show green sticker if on front edge
  if (z === 1) materials[4] = FACE_COLORS.FRONT as CubeColor;
  
  // -Z face (back) - show blue sticker if on back edge
  if (z === -1) materials[5] = FACE_COLORS.BACK as CubeColor;
  
  return materials;
}

function createSolvedCube(): CubieState[] {
  const cubies: CubieState[] = [];
  
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const type = getCubieType(x, y, z);
        const materials = getCubieMaterials(x, y, z);
        
        cubies.push({
          position: { x, y, z },
          materials,
          id: `${x},${y},${z}`,
          type
        });
      }
    }
  }
  
  return cubies;
}

interface CubeStore extends CubeState {
  rotateFace: (face: Face, clockwise?: boolean) => void;
  setAnimatingFace: (face: Face | null) => void;
  updateCubiePositionsAndMaterials: (face: Face, clockwise: boolean) => void;
  scramble: () => void;
  reset: () => void;
  setAnimating: (animating: boolean) => void;
  startTimer: () => void;
  updateTimer: () => void;
  stopTimer: () => void;
}

export const useCubeStore = create<CubeStore>((set, get) => ({
  cubies: createSolvedCube(),
  isAnimating: false,
  animatingFace: null,
  moveCount: 0,
  startTime: null,
  currentTime: 0,

  setAnimatingFace: (face: Face | null) => set({ animatingFace: face }),

  rotateFace: (face: Face, clockwise = true) => {
    const state = get();
    if (state.isAnimating) return;

    // Start timer on first move
    if (state.moveCount === 0 && state.startTime === null) {
      get().startTimer();
    }

    set({ isAnimating: true, animatingFace: face });

    // Animation will be handled by the component
    // After 300ms, update the cube state
    setTimeout(() => {
      get().updateCubiePositionsAndMaterials(face, clockwise);
    }, 300);
  },

  updateCubiePositionsAndMaterials: (face: Face, clockwise: boolean) => {
    const state = get();
    const axis = getFaceRotationAxis(face);
    const rotatingCubies = getCubiesOnFace(state.cubies, face);
    
    const updatedCubies = state.cubies.map(cubie => {
      const isRotating = rotatingCubies.some(rc => rc.id === cubie.id);
      if (!isRotating) return cubie;
      
      // Update position
      const newPosition = rotatePosition(cubie.position, axis, clockwise);
      
      // Update materials
      const newMaterials = rotateMaterialsClockwise(axis, [...cubie.materials], clockwise);
      
      return {
        ...cubie,
        position: newPosition,
        materials: newMaterials,
        id: `${newPosition.x},${newPosition.y},${newPosition.z}`
      };
    });
    
    // Ensure we have exactly 27 cubies
    console.log(`Updated cubies count: ${updatedCubies.length}`);
    
    set({
      cubies: updatedCubies,
      isAnimating: false,
      animatingFace: null,
      moveCount: state.moveCount + 1
    });
  },

  scramble: () => {
    const state = get();
    if (state.isAnimating) return;

    // Reset cube to ensure clean state before scrambling
    set({
      cubies: createSolvedCube(),
      moveCount: 0,
      startTime: null,
      currentTime: 0,
      isAnimating: false,
      animatingFace: null
    });
    const faces: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];
    const moves: Move[] = [];
    
    // Generate 25 random moves
    for (let i = 0; i < 25; i++) {
      const face = faces[Math.floor(Math.random() * faces.length)];
      const clockwise = Math.random() > 0.5;
      moves.push({ face, clockwise });
    }

    // Execute moves instantly without animation for scrambling
    let currentCubies = get().cubies;
    
    moves.forEach((move) => {
      const axis = getFaceRotationAxis(move.face);
      const rotatingCubies = getCubiesOnFace(currentCubies, move.face);
      
      currentCubies = currentCubies.map(cubie => {
        const isRotating = rotatingCubies.some(rc => rc.id === cubie.id);
        if (!isRotating) return cubie;
        
        // Update position
        const newPosition = rotatePosition(cubie.position, axis, move.clockwise);
        
        // Update materials
        const newMaterials = rotateMaterialsClockwise(axis, [...cubie.materials], move.clockwise);
        
        return {
          ...cubie,
          position: newPosition,
          materials: newMaterials,
          id: `${newPosition.x},${newPosition.y},${newPosition.z}`
        };
      });
    });
    
    // Update state with scrambled cube
    set({
      cubies: currentCubies,
      moveCount: moves.length,
      startTime: Date.now()
    });
  },

  reset: () => {
    const state = get();
    if (state.isAnimating) return;
    
    set({
      cubies: createSolvedCube(),
      moveCount: 0,
      startTime: null,
      currentTime: 0
    });
  },

  setAnimating: (animating: boolean) => set({ isAnimating: animating }),

  startTimer: () => set({ startTime: Date.now() }),

  updateTimer: () => {
    const state = get();
    if (state.startTime) {
      set({ currentTime: Date.now() - state.startTime });
    }
  },

  stopTimer: () => set({ startTime: null })
}));