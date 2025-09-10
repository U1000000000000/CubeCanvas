import { CubeColor } from '../types/cube';

// Rotate materials array for a cubie based on rotation axis and direction
export function rotateMaterialsClockwise(
  axis: 'x' | 'y' | 'z',
  materials: CubeColor[],
  clockwise: boolean = true
): CubeColor[] {
  // Validate input
  if (!materials || materials.length !== 6) {
    console.error('Invalid materials array for rotation:', materials);
    return materials || ['black', 'black', 'black', 'black', 'black', 'black'];
  }
  
  // Validate all materials are valid colors
  const validColors = ['white', 'yellow', 'red', 'orange', 'green', 'blue', 'black', 'gray'];
  const hasInvalidColor = materials.some(color => !validColors.includes(color));
  if (hasInvalidColor) {
    console.error('Invalid color in materials:', materials);
    return materials; // Return original to prevent corruption
  }
  
  // Create a deep copy to prevent mutation
  const newMaterials: CubeColor[] = [...materials];
  
  if (axis === 'x') {
    // Rotating around X-axis affects Y and Z faces
    // Materials order: [+X, -X, +Y, -Y, +Z, -Z]
    if (clockwise) {
      // Clockwise rotation around X: +Y -> +Z -> -Y -> -Z -> +Y
      const temp = newMaterials[2]; // +Y
      newMaterials[2] = newMaterials[5]; // -Z -> +Y
      newMaterials[5] = newMaterials[3]; // -Y -> -Z
      newMaterials[3] = newMaterials[4]; // +Z -> -Y
      newMaterials[4] = temp; // +Y -> +Z
    } else {
      // Counter-clockwise rotation around X: +Y -> -Z -> -Y -> +Z -> +Y
      const temp = newMaterials[2]; // +Y
      newMaterials[2] = newMaterials[4]; // +Z -> +Y
      newMaterials[4] = newMaterials[3]; // -Y -> +Z
      newMaterials[3] = newMaterials[5]; // -Z -> -Y
      newMaterials[5] = temp; // +Y -> -Z
    }
  } else if (axis === 'y') {
    // Rotating around Y-axis affects X and Z faces
    if (clockwise) {
      // Clockwise rotation around Y: +X -> +Z -> -X -> -Z -> +X
      const temp = newMaterials[0]; // +X
      newMaterials[0] = newMaterials[4]; // +Z -> +X
      newMaterials[4] = newMaterials[1]; // -X -> +Z
      newMaterials[1] = newMaterials[5]; // -Z -> -X
      newMaterials[5] = temp; // +X -> -Z
    } else {
      // Counter-clockwise rotation around Y: +X -> -Z -> -X -> +Z -> +X
      const temp = newMaterials[0]; // +X
      newMaterials[0] = newMaterials[5]; // -Z -> +X
      newMaterials[5] = newMaterials[1]; // -X -> -Z
      newMaterials[1] = newMaterials[4]; // +Z -> -X
      newMaterials[4] = temp; // +X -> +Z
    }
  } else if (axis === 'z') {
    // Rotating around Z-axis affects X and Y faces
    if (clockwise) {
      // Clockwise rotation around Z: +X -> +Y -> -X -> -Y -> +X
      const temp = newMaterials[0]; // +X
      newMaterials[0] = newMaterials[3]; // -Y -> +X
      newMaterials[3] = newMaterials[1]; // -X -> -Y
      newMaterials[1] = newMaterials[2]; // +Y -> -X
      newMaterials[2] = temp; // +X -> +Y
    } else {
      // Counter-clockwise rotation around Z: +X -> -Y -> -X -> +Y -> +X
      const temp = newMaterials[0]; // +X
      newMaterials[0] = newMaterials[2]; // +Y -> +X
      newMaterials[2] = newMaterials[1]; // -X -> +Y
      newMaterials[1] = newMaterials[3]; // -Y -> -X
      newMaterials[3] = temp; // +X -> -Y
    }
  }
  
  return newMaterials;
}

// Get rotation axis for each face
export function getFaceRotationAxis(face: string): 'x' | 'y' | 'z' {
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

// 🔥 CRITICAL FIX: Corrected rotation direction logic
export function getFaceRotationDirection(face: string, clockwise: boolean): number {
  const baseDirection = clockwise ? 1 : -1;
  
  // FIXED: Only L face needs direction inversion for proper visual rotation
  switch (face) {
    case 'L': // Left face - invert direction (this was correct)
      return -baseDirection;
    case 'U': // Up face - keep original direction
    case 'D': // Down face - keep original direction  
    case 'R': // Right face - keep original direction
    case 'F': // Front face - keep original direction
    case 'B': // Back face - keep original direction
    default:
      return baseDirection;
  }
}

// Rotate a 3D position around an axis
export function rotatePosition(
  position: { x: number; y: number; z: number },
  axis: 'x' | 'y' | 'z',
  clockwise: boolean
): { x: number; y: number; z: number } {
  // Validate input position
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

// Get cubies that belong to a specific face
export function getCubiesOnFace(
  cubies: any[],
  face: string
): any[] {
  const faceConditions: Record<string, (cubie: any) => boolean> = {
    U: (cubie) => cubie.position.y === 1,
    D: (cubie) => cubie.position.y === -1,
    L: (cubie) => cubie.position.x === -1,
    R: (cubie) => cubie.position.x === 1,
    F: (cubie) => cubie.position.z === 1,
    B: (cubie) => cubie.position.z === -1,
  };
  
  return cubies.filter(faceConditions[face] || (() => false));
}