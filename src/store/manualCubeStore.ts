// Fixed manualCubeStore.ts - Consistent rotation direction logic
import { create } from 'zustand';
import { CubeColor, Face, CubieState, Position } from '../types/cube';

// COPY the working rotation functions from your successful cubeStore:
function rotateMaterialsClockwise(
  axis: 'x' | 'y' | 'z',
  materials: CubeColor[],
  clockwise: boolean = true
): CubeColor[] {
  if (!materials || materials.length !== 6) {
    console.error('Invalid materials array for rotation:', materials);
    return materials || ['gray', 'gray', 'gray', 'gray', 'gray', 'gray'];
  }
  
  const validColors = ['white', 'yellow', 'red', 'orange', 'green', 'blue', 'black', 'gray'];
  const hasInvalidColor = materials.some(color => !validColors.includes(color));
  if (hasInvalidColor) {
    console.error('Invalid color in materials:', materials);
    return materials;
  }
  
  const newMaterials: CubeColor[] = [...materials];
  
  if (axis === 'x') {
    if (clockwise) {
      const temp = newMaterials[2]; // +Y
      newMaterials[2] = newMaterials[5]; // -Z -> +Y
      newMaterials[5] = newMaterials[3]; // -Y -> -Z
      newMaterials[3] = newMaterials[4]; // +Z -> -Y
      newMaterials[4] = temp; // +Y -> +Z
    } else {
      const temp = newMaterials[2]; // +Y
      newMaterials[2] = newMaterials[4]; // +Z -> +Y
      newMaterials[4] = newMaterials[3]; // -Y -> +Z
      newMaterials[3] = newMaterials[5]; // -Z -> -Y
      newMaterials[5] = temp; // +Y -> -Z
    }
  } else if (axis === 'y') {
    if (clockwise) {
      const temp = newMaterials[0]; // +X
      newMaterials[0] = newMaterials[4]; // +Z -> +X
      newMaterials[4] = newMaterials[1]; // -X -> +Z
      newMaterials[1] = newMaterials[5]; // -Z -> -X
      newMaterials[5] = temp; // +X -> -Z
    } else {
      const temp = newMaterials[0]; // +X
      newMaterials[0] = newMaterials[5]; // -Z -> +X
      newMaterials[5] = newMaterials[1]; // -X -> -Z
      newMaterials[1] = newMaterials[4]; // +Z -> -X
      newMaterials[4] = temp; // +X -> +Z
    }
  } else if (axis === 'z') {
    if (clockwise) {
      const temp = newMaterials[0]; // +X
      newMaterials[0] = newMaterials[3]; // -Y -> +X
      newMaterials[3] = newMaterials[1]; // -X -> -Y
      newMaterials[1] = newMaterials[2]; // +Y -> -X
      newMaterials[2] = temp; // +X -> +Y
    } else {
      const temp = newMaterials[0]; // +X
      newMaterials[0] = newMaterials[2]; // +Y -> +X
      newMaterials[2] = newMaterials[1]; // -X -> +Y
      newMaterials[1] = newMaterials[3]; // -Y -> -X
      newMaterials[3] = temp; // +X -> -Y
    }
  }
  
  return newMaterials;
}

function rotatePosition(
  position: Position,
  axis: 'x' | 'y' | 'z',
  clockwise: boolean
): Position {
  if (!position || typeof position.x !== 'number' || 
      typeof position.y !== 'number' || typeof position.z !== 'number') {
    console.error('Invalid position for rotation:', position);
    return position || { x: 0, y: 0, z: 0 };
  }
  
  const { x, y, z } = position;
  
  if (axis === 'x') {
    return clockwise 
      ? { x, y: -z, z: y }
      : { x, y: z, z: -y };
  } else if (axis === 'y') {
    return clockwise
      ? { x: z, y, z: -x }
      : { x: -z, y, z: x };
  } else if (axis === 'z') {
    return clockwise
      ? { x: -y, y: x, z }
      : { x: y, y: -x, z };
  }
  
  return position;
}

function getFaceRotationAxis(face: Face): 'x' | 'y' | 'z' {
  switch (face) {
    case 'U':
    case 'D':
      return 'y';
    case 'L':
    case 'R':
      return 'x';
    case 'F':
    case 'B':
      return 'z';
    default:
      return 'y';
  }
}

// 🔥 CRITICAL FIX: Simplified rotation direction logic - only L face needs inversion
function getFaceRotationDirection(face: Face, clockwise: boolean): boolean {
  switch (face) {
    case 'L': // Left face rotates opposite (this needs inversion)
      return !clockwise;
    case 'U': // Up face - keep original direction
    case 'D': // Down face - keep original direction
    case 'R': // Right face - keep original direction
    case 'F': // Front face - keep original direction
    case 'B': // Back face - keep original direction
    default:
      return clockwise;
  }
}

function getCubiesOnFace(cubies: CubieState[], face: Face): CubieState[] {
  const faceConditions: Record<Face, (cubie: CubieState) => boolean> = {
    U: (cubie) => cubie.position.y === 1,
    D: (cubie) => cubie.position.y === -1,
    L: (cubie) => cubie.position.x === -1,
    R: (cubie) => cubie.position.x === 1,
    F: (cubie) => cubie.position.z === 1,
    B: (cubie) => cubie.position.z === -1,
  };
  
  return cubies.filter(faceConditions[face] || (() => false));
}

// Create initial cube with gray materials and center colors
function createInitialCube(): CubieState[] {
  const cubies: CubieState[] = [];
  
  // Standard center colors for a solved cube
  const centerColors: Record<string, CubeColor> = {
    "0,1,0": "white",   // Top center (U)
    "0,-1,0": "yellow", // Bottom center (D) 
    "1,0,0": "red",     // Right center (R)
    "-1,0,0": "orange", // Left center (L)
    "0,0,1": "green",   // Front center (F)
    "0,0,-1": "blue",   // Back center (B)
  };

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const position = { x, y, z };
        const id = `${x},${y},${z}`;
        const materials: CubeColor[] = ['gray', 'gray', 'gray', 'gray', 'gray', 'gray'];
        
        // Set center colors
        const centerColor = centerColors[id];
        if (centerColor) {
          if (x === 1) materials[0] = 'red';     // right face
          if (x === -1) materials[1] = 'orange'; // left face  
          if (y === 1) materials[2] = 'white';   // top face
          if (y === -1) materials[3] = 'yellow'; // bottom face
          if (z === 1) materials[4] = 'green';   // front face
          if (z === -1) materials[5] = 'blue';   // back face
        }
        
        const type = (() => {
          const absX = Math.abs(x);
          const absY = Math.abs(y); 
          const absZ = Math.abs(z);
          if (absX === 0 && absY === 0 && absZ === 0) return 'core';
          if (absX === 1 && absY === 1 && absZ === 1) return 'corner';
          if ((absX === 1 && absY === 0 && absZ === 0) ||
              (absX === 0 && absY === 1 && absZ === 0) ||
              (absX === 0 && absY === 0 && absZ === 1)) return 'center';
          return 'edge';
        })();
        
        cubies.push({
          id,
          position,
          materials,
          type: type as 'corner' | 'edge' | 'center' | 'core'
        });
      }
    }
  }
  
  return cubies;
}

interface ManualCubeStore {
  cubies: CubieState[];
  isAnimating: boolean;
  animatingFace: Face | null;
  animatingCubies: string[];
  rotationDirection: boolean | null;
  
  rotateFace: (face: Face, clockwise?: boolean) => void;
  updateCubiePositionsAndMaterials: (face: Face, clockwise: boolean) => void;
  setAnimatingCubies: (cubieIds: string[]) => void;
  reset: () => void;
}

export const useManualCubeStore = create<ManualCubeStore>((set, get) => ({
  cubies: createInitialCube(),
  isAnimating: false,
  animatingFace: null,
  animatingCubies: [],
  rotationDirection: null,

  rotateFace: (face: Face, clockwise = true) => {
    const state = get();
    if (state.isAnimating) return;

    console.log(`\n=== STARTING ROTATION: ${face} ${clockwise ? 'CW' : 'CCW'} ===`);

    set({ 
      isAnimating: true, 
      animatingFace: face,
      rotationDirection: clockwise,
    });
  },

  updateCubiePositionsAndMaterials: (face: Face, clockwise: boolean) => {
    const state = get();
    
    // 🔥 CRITICAL FIX: Use consistent rotation direction calculation
    console.log(`\n=== UPDATING MATERIALS: ${face} ${clockwise ? 'CW' : 'CCW'} ===`);
    
    // Calculate the actual rotation direction based on face
    const actualClockwise = getFaceRotationDirection(face, clockwise);
    const axis = getFaceRotationAxis(face);
    const rotatingCubies = getCubiesOnFace(state.cubies, face);

    // 🔥 DEBUG LOG for all faces
    console.log(`🔥 ${face} face: input=${clockwise ? 'CW' : 'CCW'}, actual=${actualClockwise ? 'CW' : 'CCW'}`);
    console.log(`🔥 Found ${rotatingCubies.length} cubies on face ${face}`);

    if (rotatingCubies.length !== 9) {
      console.error(`Invalid cubie count for face ${face}: ${rotatingCubies.length}`);
      set({ 
        isAnimating: false, 
        animatingFace: null,
        rotationDirection: null,
        animatingCubies: [],
      });
      return;
    }

    // Log BEFORE state
    console.log(`🔥 BEFORE rotation (${face}):`);
    rotatingCubies.slice(0, 3).forEach(cubie => {
      console.log(`  ${cubie.id}: materials=${JSON.stringify(cubie.materials)} pos=${JSON.stringify(cubie.position)}`);
    });

    const updatedCubies = state.cubies.map(cubie => {
      if (!cubie || !cubie.position || !cubie.materials || cubie.materials.length !== 6) {
        console.error(`Invalid cubie detected:`, cubie);
        return cubie;
      }

      const isRotating = rotatingCubies.some(rc => rc.id === cubie.id);
      if (!isRotating) return cubie;

      const newPosition = rotatePosition(cubie.position, axis, actualClockwise);
      const newMaterials = rotateMaterialsClockwise(axis, cubie.materials, actualClockwise);

      const validColors = ['white', 'yellow', 'red', 'orange', 'green', 'blue', 'black', 'gray'];
      const hasInvalidColor = newMaterials.some(color => !validColors.includes(color));
      if (hasInvalidColor) {
        console.error(`Invalid color in materials for cubie ${cubie.id}:`, newMaterials);
        return cubie;
      }

      // IMPORTANT: do NOT change cubie.id here. Keep the stable id assigned at initial creation.
      console.log(`🔥 ${cubie.id} -> pos=${newPosition.x},${newPosition.y},${newPosition.z}: materials=${JSON.stringify(newMaterials)}`);

      return {
        ...cubie,
        position: newPosition,
        materials: newMaterials,
        // id: keep same cubie.id (do not overwrite)
      };
    });

    // Verify no duplicate positions
    const positions = updatedCubies.map(c => `${c.position.x},${c.position.y},${c.position.z}`);
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== 27) {
      console.error(`Duplicate positions detected after rotation`);
      set({ 
        isAnimating: false, 
        animatingFace: null,
        rotationDirection: null,
        animatingCubies: [],
      });
      return;
    }

    console.log(`🔥 AFTER rotation (${face}): Update completed successfully`);

    set({
      cubies: updatedCubies,
      isAnimating: false,
      animatingFace: null,
      rotationDirection: null,
      animatingCubies: [],
    });
  },

  setAnimatingCubies: (cubieIds: string[]) => {
    set({ animatingCubies: cubieIds });
  },

  reset: () => {
    console.log('Resetting manual cube to initial state');
    set({
      cubies: createInitialCube(),
      isAnimating: false,
      animatingFace: null,
      animatingCubies: [],
      rotationDirection: null,
    });
  }
}));