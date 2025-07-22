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
    
    // Validate we have exactly 9 cubies for rotation
    if (rotatingCubies.length !== 9) {
      console.error(`Invalid cubie count for face ${face}: ${rotatingCubies.length}, expected 9`);
      set({ isAnimating: false, animatingFace: null });
      return;
    }
    
    const updatedCubies = state.cubies.map(cubie => {
      // Validate cubie has required properties
      if (!cubie || !cubie.position || !cubie.materials || cubie.materials.length !== 6) {
        console.error(`Invalid cubie detected:`, cubie);
        return cubie; // Return original cubie to prevent corruption
      }
      
      const isRotating = rotatingCubies.some(rc => rc.id === cubie.id);
      if (!isRotating) return cubie;
      
      // Update position
      const newPosition = rotatePosition(cubie.position, axis, clockwise);
      
      // Validate new position
      if (!newPosition || typeof newPosition.x !== 'number' || 
          typeof newPosition.y !== 'number' || typeof newPosition.z !== 'number') {
        console.error(`Invalid position generated for cubie ${cubie.id}:`, newPosition);
        return cubie; // Return original cubie
      }
      
      // Update materials
      const newMaterials = rotateMaterialsClockwise(axis, cubie.materials, clockwise);
      
      // Validate new materials
      if (!newMaterials || newMaterials.length !== 6) {
        console.error(`Invalid materials generated for cubie ${cubie.id}:`, newMaterials);
        return cubie; // Return original cubie
      }
      
      // Validate all materials are valid colors
      const validColors = ['white', 'yellow', 'red', 'orange', 'green', 'blue', 'black'];
      const hasInvalidColor = newMaterials.some(color => !validColors.includes(color));
      if (hasInvalidColor) {
        console.error(`Invalid color in materials for cubie ${cubie.id}:`, newMaterials);
        return cubie; // Return original cubie
      }
      
      return {
        ...cubie,
        position: newPosition,
        materials: newMaterials,
        id: `${newPosition.x},${newPosition.y},${newPosition.z}`
      };
    });
    
    // Validate final state
    if (updatedCubies.length !== 27) {
      console.error(`Invalid cubie count after update: ${updatedCubies.length}, expected 27`);
      set({ isAnimating: false, animatingFace: null });
      return;
    }
    
    // Validate no duplicate positions
    const positions = updatedCubies.map(c => `${c.position.x},${c.position.y},${c.position.z}`);
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== 27) {
      console.error(`Duplicate positions detected after rotation`);
      set({ isAnimating: false, animatingFace: null });
      return;
    }
    
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

    const faces: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];
    const moves: Move[] = [];
    
    // Generate 25 random moves
    for (let i = 0; i < 25; i++) {
      const face = faces[Math.floor(Math.random() * faces.length)];
      const clockwise = Math.random() > 0.5;
      moves.push({ face, clockwise });
    }

    // Execute moves with animation
    let moveIndex = 0;
    const executeMoves = () => {
      if (moveIndex >= moves.length) {
        // Scrambling complete
        return;
      }
      
      const move = moves[moveIndex];
      moveIndex++;
      
      // Execute the move with animation
      get().rotateFace(move.face, move.clockwise);
      
      // Schedule next move after current animation completes
      setTimeout(executeMoves, 350); // 300ms animation + 50ms buffer
    };
    
    // Start timer and execute first move
    set({ startTime: Date.now() });
    executeMoves();
  },

  reset: () => {
    const state = get();
    if (state.isAnimating) return;
    
    // Create fresh solved cube to prevent any state corruption
    const freshCubies = createSolvedCube();
    
    // Validate the fresh cube
    if (freshCubies.length !== 27) {
      console.error('Failed to create valid solved cube');
      return;
    }
    
    set({
      cubies: freshCubies,
      moveCount: 0,
      startTime: null,
      currentTime: 0,
      isAnimating: false,
      animatingFace: null
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