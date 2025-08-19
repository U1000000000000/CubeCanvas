import { create } from 'zustand';
import { CubeState, CubieState, Face, Move, CubeColor } from '../types/cube';
import {
  rotateMaterialsClockwise,
  getFaceRotationAxis,
  getFaceRotationDirection,
  rotatePosition
} from '../utils/rotationUtils';

// 2x2 Cube positions
const POSITIONS_2 = [-0.5, 0.5];

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
  // In 2x2, all visible cubies are corners
  return 'corner';
}

function getCubieMaterials2x2(x: number, y: number, z: number): CubeColor[] {
  const materials: CubeColor[] = ['black', 'black', 'black', 'black', 'black', 'black'];

  if (x === 0.5) materials[0] = FACE_COLORS.RIGHT as CubeColor;
  if (x === -0.5) materials[1] = FACE_COLORS.LEFT as CubeColor;
  if (y === 0.5) materials[2] = FACE_COLORS.TOP as CubeColor;
  if (y === -0.5) materials[3] = FACE_COLORS.BOTTOM as CubeColor;
  if (z === 0.5) materials[4] = FACE_COLORS.FRONT as CubeColor;
  if (z === -0.5) materials[5] = FACE_COLORS.BACK as CubeColor;

  return materials;
}

function createSolved2x2Cube(): CubieState[] {
  const cubies: CubieState[] = [];
  for (let x of POSITIONS_2) {
    for (let y of POSITIONS_2) {
      for (let z of POSITIONS_2) {
        cubies.push({
          position: { x, y, z },
          materials: getCubieMaterials2x2(x, y, z),
          id: `${x},${y},${z}`,
          type: getCubieType(x, y, z)
        });
      }
    }
  }
  return cubies;
}

// 2x2-specific function to get cubies on a face
function getCubiesOnFace2x2(cubies: CubieState[], face: Face): CubieState[] {
  return cubies.filter(cubie => {
    const { x, y, z } = cubie.position;
    switch (face) {
      case 'F': return z === 0.5;   // Front face
      case 'B': return z === -0.5;  // Back face
      case 'R': return x === 0.5;   // Right face
      case 'L': return x === -0.5;  // Left face
      case 'U': return y === 0.5;   // Up face
      case 'D': return y === -0.5;  // Down face
      default: return false;
    }
  });
}

// Helper to wait for current animation to finish
let get: () => CubeStore2x2; // forward declare

async function waitForAnimationToComplete(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (!get().isAnimating) resolve();
      else setTimeout(check, 10);
    };
    check();
  });
}

interface CubeStore2x2 extends CubeState {
  // New properties for improved animation system
  rotationDirection: boolean | null;
  animatingCubies: string[];
  
  // Existing methods
  rotateFace: (face: Face, clockwise?: boolean) => void;
  setAnimatingFace: (face: Face | null) => void;
  updateCubiePositionsAndMaterials: (face: Face, clockwise: boolean) => void;
  scramble: () => void;
  reset: () => void;
  setAnimating: (animating: boolean) => void;
  startTimer: () => void;
  updateTimer: () => void;
  stopTimer: () => void;
  
  // New methods for improved system
  setRotationDirection: (clockwise: boolean) => void;
  setAnimatingCubies: (cubieIds: string[]) => void;
}

export const useCubeStore2x2 = create<CubeStore2x2>((_set, _get) => {
  get = _get; // capture zustand's get() for waitForAnimation helper
  const set = _set;

  return {
    cubies: createSolved2x2Cube(),
    isAnimating: false,
    animatingFace: null,
    moveCount: 0,
    startTime: null,
    currentTime: 0,
    rotationDirection: null,
    animatingCubies: [],

    setAnimatingFace: (face: Face | null) => set({ animatingFace: face }),

    setRotationDirection: (clockwise: boolean) => {
      set({ rotationDirection: clockwise });
    },

    setAnimatingCubies: (cubieIds: string[]) => {
      set({ animatingCubies: cubieIds });
    },

    rotateFace: (face: Face, clockwise = true) => {
      const state = get();
      if (state.isAnimating) return;

      if (state.moveCount === 0 && state.startTime === null) {
        get().startTimer();
      }

      set({ 
        isAnimating: true, 
        animatingFace: face,
        rotationDirection: clockwise
      });
    },

    updateCubiePositionsAndMaterials: (face: Face, clockwise: boolean) => {
      const state = get();
      const axis = getFaceRotationAxis(face);
      const rotatingCubies = getCubiesOnFace2x2(state.cubies, face);

      if (rotatingCubies.length !== 4) {
        console.error(`Invalid cubie count for 2x2 face ${face}: ${rotatingCubies.length}`);
        set({ 
          isAnimating: false, 
          animatingFace: null,
          rotationDirection: null,
          animatingCubies: []
        });
        return;
      }

      const updatedCubies = state.cubies.map(cubie => {
        if (!cubie || !cubie.position || !cubie.materials || cubie.materials.length !== 6) {
          console.error(`Invalid cubie detected:`, cubie);
          return cubie;
        }

        const isRotating = rotatingCubies.some(rc => rc.id === cubie.id);
        if (!isRotating) return cubie;

        const newPosition = rotatePosition(cubie.position, axis, clockwise);
        const newMaterials = rotateMaterialsClockwise(axis, cubie.materials, clockwise);

        const validColors = ['white', 'yellow', 'red', 'orange', 'green', 'blue', 'black'];
        const hasInvalidColor = newMaterials.some(color => !validColors.includes(color));
        if (hasInvalidColor) {
          console.error(`Invalid color in materials for cubie ${cubie.id}:`, newMaterials);
          return cubie;
        }

        return {
          ...cubie,
          position: newPosition,
          materials: newMaterials,
          id: `${newPosition.x},${newPosition.y},${newPosition.z}`
        };
      });

      const positions = updatedCubies.map(c => `${c.position.x},${c.position.y},${c.position.z}`);
      const uniquePositions = new Set(positions);
      if (uniquePositions.size !== 8) {
        console.error(`Duplicate positions detected after 2x2 rotation`);
        set({ 
          isAnimating: false, 
          animatingFace: null,
          rotationDirection: null,
          animatingCubies: []
        });
        return;
      }

      set({
        cubies: updatedCubies,
        isAnimating: false,
        animatingFace: null,
        moveCount: state.moveCount + 1,
        rotationDirection: null,
        animatingCubies: []
      });
    },

    scramble: async () => {
      const state = get();
      if (state.isAnimating) return;

      const faces: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];
      const moves: Move[] = [];

      for (let i = 0; i < 15; i++) {
        const face = faces[Math.floor(Math.random() * faces.length)];
        const clockwise = Math.random() > 0.5;
        moves.push({ face, clockwise });
      }

      set({ startTime: Date.now() });

      for (const move of moves) {
        await waitForAnimationToComplete();
        get().rotateFace(move.face, move.clockwise);
      }
    },

    reset: () => {
      const freshCubies = createSolved2x2Cube();

      if (freshCubies.length !== 8) {
        console.error('Failed to create valid solved 2x2 cube');
        return;
      }

      set({
        cubies: freshCubies,
        moveCount: 0,
        startTime: null,
        currentTime: 0,
        isAnimating: false,
        animatingFace: null,
        rotationDirection: null,
        animatingCubies: []
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
  };
});