export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';
export type CubeColor = 'white' | 'yellow' | 'red' | 'orange' | 'green' | 'blue' | 'black' | 'gray';

export interface CubiePosition {
  x: number;
  y: number;
  z: number;
}

export interface CubieState {
  position: CubiePosition;
  materials: CubeColor[]; // Array of 6 materials for BoxGeometry faces: [+X, -X, +Y, -Y, +Z, -Z]
  id: string;
  type: 'corner' | 'edge' | 'center' | 'core';
}

export interface CubeState {
  cubies: CubieState[];
  isAnimating: boolean;
  animatingFace: Face | null;
  moveCount: number;
  startTime: number | null;
  currentTime: number;
}

export interface Move {
  face: Face;
  clockwise: boolean;
}