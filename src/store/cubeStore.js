import { create } from 'zustand';
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
};

function getCubieType(x, y, z) {
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  const absZ = Math.abs(z);

  if (absX === 0 && absY === 0 && absZ === 0) return 'core';
  if (absX === 1 && absY === 1 && absZ === 1) return 'corner';
  if ((absX === 1 && absY === 0 && absZ === 0) ||
      (absX === 0 && absY === 1 && absZ === 0) ||
      (absX === 0 && absY === 0 && absZ === 1)) return 'center';
  return 'edge';
}

function getCubieMaterials(x, y, z) {
  const materials = ['black', 'black', 'black', 'black', 'black', 'black'];

  if (x === 1) materials[0] = FACE_COLORS.RIGHT;
  if (x === -1) materials[1] = FACE_COLORS.LEFT;
  if (y === 1) materials[2] = FACE_COLORS.TOP;
  if (y === -1) materials[3] = FACE_COLORS.BOTTOM;
  if (z === 1) materials[4] = FACE_COLORS.FRONT;
  if (z === -1) materials[5] = FACE_COLORS.BACK;

  return materials;
}

function createSolvedCube() {
  const cubies = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubies.push({
          position: { x, y, z },
          materials: getCubieMaterials(x, y, z),
          id: `${x},${y},${z}`,
          type: getCubieType(x, y, z)
        });
      }
    }
  }
  return cubies;
}

// Helper to wait for current animation to finish
let get; // forward declare

async function waitForAnimationToComplete() {
  return new Promise((resolve) => {
    const check = () => {
      if (!get().isAnimating) resolve();
      else setTimeout(check, 10);
    };
    check();
  });
}

export const useCubeStore = create((_set, _get) => {
  get = _get; // capture zustand's get() for waitForAnimation helper
  const set = _set;

  return {
    cubies: createSolvedCube(),
    isAnimating: false,
    animatingFace: null,
    moveCount: 0,
    startTime: null,
    currentTime: 0,
    rotationDirection: null,
    animatingCubies: [],
    hasScrambled: false,

    setAnimatingFace: (face) => set({ animatingFace: face }),

    setRotationDirection: (clockwise) => {
      set({ rotationDirection: clockwise });
    },

    setAnimatingCubies: (cubieIds) => {
      set({ animatingCubies: cubieIds });
    },

    rotateFace: (face, clockwise = true) => {
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

      // Animation will be handled by useFrame in CubeGroup
      // The timeout approach is replaced by the frame-based animation system
    },

    updateCubiePositionsAndMaterials: (face, clockwise) => {
      const state = get();
      const axis = getFaceRotationAxis(face);
      const rotatingCubies = getCubiesOnFace(state.cubies, face);

      if (rotatingCubies.length !== 9) {
        console.error(`Invalid cubie count for face ${face}: ${rotatingCubies.length}`);
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
      if (uniquePositions.size !== 27) {
        console.error(`Duplicate positions detected after rotation`);
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

      const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
      const moves = [];

      for (let i = 0; i < 25; i++) {
        const face = faces[Math.floor(Math.random() * faces.length)];
        const clockwise = Math.random() > 0.5;
        moves.push({ face, clockwise });
      }

      set({ startTime: Date.now(), hasScrambled: true });

      for (const move of moves) {
        await waitForAnimationToComplete();
        get().rotateFace(move.face, move.clockwise);
      }
    },

    reset: () => {
      const freshCubies = createSolvedCube();

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
        animatingFace: null,
        rotationDirection: null,
        animatingCubies: [],
        hasScrambled: false
      });
    },

    setAnimating: (animating) => set({ isAnimating: animating }),
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