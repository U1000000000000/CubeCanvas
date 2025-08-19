import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Group, Euler, Raycaster, Vector2, Vector3, Mesh, Camera, Object3D } from 'three';
import { useCubeStore } from '../../store/cubeStore';
import { AnimatedCubie } from './AnimatedCubie';
import { getFaceRotationAxis, getFaceRotationDirection } from '../../utils/rotationUtils';
import { Face } from '../../types/cube';

// Helper functions for direction mapping
const rotateDirection = (dir: string, steps: number): string => {
  const directions = ['up', 'right', 'down', 'left'];
  const index = directions.indexOf(dir);
  const newIndex = (index + steps + 4) % 4;
  return directions[newIndex];
};

// IMPROVED: Camera-aware rotation direction calculation
function getRotationDirectionFromDrag(
  face: Face,
  dragDirection: 'up' | 'down' | 'left' | 'right',
  camera: Camera
): boolean {
  // Get the face normal in world space
  const faceNormals: Record<Face, Vector3> = {
    F: new Vector3(0, 0, 1),
    B: new Vector3(0, 0, -1),
    L: new Vector3(-1, 0, 0),
    R: new Vector3(1, 0, 0),
    U: new Vector3(0, 1, 0),
    D: new Vector3(0, -1, 0)
  };

  // Get the face's local coordinate system
  const faceAxes: Record<Face, { up: Vector3, right: Vector3 }> = {
    F: { up: new Vector3(0, 1, 0), right: new Vector3(1, 0, 0) },
    B: { up: new Vector3(0, 1, 0), right: new Vector3(-1, 0, 0) },
    U: { up: new Vector3(0, 0, -1), right: new Vector3(1, 0, 0) },
    D: { up: new Vector3(0, 0, 1), right: new Vector3(1, 0, 0) },
    L: { up: new Vector3(0, 1, 0), right: new Vector3(0, 0, -1) },
    R: { up: new Vector3(0, 1, 0), right: new Vector3(0, 0, 1) }
  };

  const faceNormal = faceNormals[face];
  const { up: faceUp, right: faceRight } = faceAxes[face];
  
  // Project the face's up and right vectors to screen space
  const projectToScreen = (worldVector: Vector3): Vector2 => {
    const vector = worldVector.clone();
    vector.project(camera);
    return new Vector2(vector.x, vector.y);
  };

  const screenUp = projectToScreen(faceUp);
  const screenRight = projectToScreen(faceRight);

  // Convert drag direction to screen space vector
  const dragVector = new Vector2();
  switch (dragDirection) {
    case 'up': dragVector.set(0, 1); break;
    case 'down': dragVector.set(0, -1); break;
    case 'left': dragVector.set(-1, 0); break;
    case 'right': dragVector.set(1, 0); break;
  }

  // Determine which face axis the drag is most aligned with
  const upDot = dragVector.dot(screenUp);
  const rightDot = dragVector.dot(screenRight);

  // Create a rotation vector in face space based on the drag
  let faceSpaceRotation: Vector3;
  
  if (Math.abs(upDot) > Math.abs(rightDot)) {
    // Dragging along the face's vertical axis
    faceSpaceRotation = faceRight.clone().multiplyScalar(upDot > 0 ? 1 : -1);
  } else {
    // Dragging along the face's horizontal axis  
    faceSpaceRotation = faceUp.clone().multiplyScalar(rightDot > 0 ? -1 : 1);
  }

  // Check if we're looking at the face from the front or back
  const cameraDirection = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const lookingAtFront = cameraDirection.dot(faceNormal) < 0;

  // Calculate the rotation direction using cross product
  const rotationAxis = getFaceRotationAxisVector(face);
  const crossProduct = faceSpaceRotation.cross(rotationAxis);
  let rotationDirection = crossProduct.dot(faceNormal);

  // If we're looking at the back of the face, flip the direction
  if (!lookingAtFront) {
    rotationDirection = -rotationDirection;
  }

  // Return true for clockwise, false for counter-clockwise
  return rotationDirection > 0;
}

// Helper function to get the rotation axis as a Vector3
function getFaceRotationAxisVector(face: Face): Vector3 {
  switch (face) {
    case 'F':
    case 'B':
      return new Vector3(0, 0, 1);
    case 'L':
    case 'R':
      return new Vector3(1, 0, 0);
    case 'U':
    case 'D':
      return new Vector3(0, 1, 0);
    default:
      return new Vector3(0, 0, 1);
  }
}

// ALTERNATIVE APPROACH: More intuitive direction mapping
function getIntuitiveRotationDirection(
  face: Face,
  dragDirection: 'up' | 'down' | 'left' | 'right',
  camera: Camera
): boolean {
  // Get camera's forward direction
  const cameraForward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  
  // Face normals pointing outward from cube center
  const faceNormals: Record<Face, Vector3> = {
    F: new Vector3(0, 0, 1),
    B: new Vector3(0, 0, -1),
    L: new Vector3(-1, 0, 0),
    R: new Vector3(1, 0, 0),
    U: new Vector3(0, 1, 0),
    D: new Vector3(0, -1, 0)
  };

  // Check if we're looking at the face directly (front side) or indirectly (back side)
  const faceNormal = faceNormals[face];
  const dot = cameraForward.dot(faceNormal);
  const viewingFromFront = dot < -0.5; // More than 60 degrees towards the face

  // Intuitive mapping: drag right = clockwise rotation when viewed from front
  // This creates a natural "turning a wheel" feeling
  const baseClockwise = (() => {
    switch (dragDirection) {
      case 'right': return true;
      case 'left': return false;
      case 'up': return face === 'L' || face === 'R' ? false : true;
      case 'down': return face === 'L' || face === 'R' ? true : false;
      default: return true;
    }
  })();

  // For faces that are primarily viewed from behind (when camera is on opposite side)
  // we need to flip the direction to maintain intuitive behavior
  const shouldFlip = (() => {
    switch (face) {
      case 'B': return cameraForward.z > 0; // Camera is behind the back face
      case 'L': return cameraForward.x < 0; // Camera is to the left of left face  
      case 'R': return cameraForward.x > 0; // Camera is to the right of right face
      case 'U': return cameraForward.y > 0; // Camera is above the top face
      case 'D': return cameraForward.y < 0; // Camera is below the bottom face
      case 'F': return cameraForward.z < 0; // Camera is in front of front face
      default: return false;
    }
  })();

  return shouldFlip ? !baseClockwise : baseClockwise;
}

const mapDirectionRelativeToFace = (
  dragDirection: 'up' | 'down' | 'left' | 'right',
  face: Face,
  camera: Camera
): 'up' | 'down' | 'left' | 'right' => {
  // Define the local up and right vectors for each face
  const faceAxes: Record<Face, { up: Vector3, right: Vector3 }> = {
    F: { up: new Vector3(0, 1, 0), right: new Vector3(1, 0, 0) },
    B: { up: new Vector3(0, 1, 0), right: new Vector3(-1, 0, 0) },
    U: { up: new Vector3(0, 0, -1), right: new Vector3(1, 0, 0) },
    D: { up: new Vector3(0, 0, 1), right: new Vector3(1, 0, 0) },
    L: { up: new Vector3(0, 1, 0), right: new Vector3(0, 0, -1) },
    R: { up: new Vector3(0, 1, 0), right: new Vector3(0, 0, 1) }
  };

  const { up, right } = faceAxes[face];

  // A helper function to project a 3D vector onto the camera's view plane
  const projectVector = (v: Vector3): Vector2 => {
    const vCopy = v.clone();
    const vProjected = vCopy.project(camera);
    return new Vector2(vProjected.x, vProjected.y).normalize();
  };

  // Project the face's up and right vectors onto the screen
  const projectedUp = projectVector(up);
  const projectedRight = projectVector(right);

  // Convert the drag direction string to a 2D vector
  let dragVector: Vector2;
  switch (dragDirection) {
    case 'up': dragVector = new Vector2(0, 1); break;
    case 'down': dragVector = new Vector2(0, -1); break;
    case 'left': dragVector = new Vector2(-1, 0); break;
    case 'right': dragVector = new Vector2(1, 0); break;
  }

  // Compare the drag vector to the projected axes using a dot product
  const dotUp = dragVector.dot(projectedUp);
  const dotRight = dragVector.dot(projectedRight);

  if (Math.abs(dotUp) > Math.abs(dotRight)) {
    return dotUp > 0 ? 'up' : 'down';
  } else {
    return dotRight > 0 ? 'right' : 'left';
  }
};

function getFrontFacingFace(camera: Camera): Face {
  const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
  const major = axes.reduce((a, b) => Math.abs(forward[a]) > Math.abs(forward[b]) ? a : b);
  const sign = Math.sign(forward[major]);
  const faceMap: Record<string, Face> = {
    'x+': 'L', 'x-': 'R',
    'y+': 'D', 'y-': 'U',
    'z+': 'B', 'z-': 'F'
  };
  return faceMap[`${major}${sign > 0 ? '+' : '-'}`];
}

// Enhanced gesture control matrix with rotation direction
// Each drag action now includes both face and rotation direction (true = clockwise, false = counter-clockwise)
const GESTURE_MATRIX = {
  F: [
    {"position": [-1, 1], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": {face: "U", clockwise: false}, 
      "right": {face: "U", clockwise: true}
    }},
    {"position": [0, 1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "U", clockwise: false}, 
      "right": {face: "U", clockwise: true}
    }},
    {"position": [1, 1], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": {face: "U", clockwise: false}, 
      "right": {face: "U", clockwise: true}
    }},
    {"position": [-1, 0], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": null, 
      "right": null
    }},
    {"position": [0, 0], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": null, 
      "right": null
    }},
    {"position": [1, 0], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": null, 
      "right": null
    }},
    {"position": [-1, -1], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": {face: "D", clockwise: true}, 
      "right": {face: "D", clockwise: false}
    }},
    {"position": [0, -1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "D", clockwise: true}, 
      "right": {face: "D", clockwise: false}
    }},
    {"position": [1, -1], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": {face: "D", clockwise: true}, 
      "right": {face: "D", clockwise: false}
    }}
  ],
  B: [
    {"position": [-1, 1], "drag_actions": {
      "up": {face: "R", clockwise: true}, 
      "down": {face: "R", clockwise: false}, 
      "left": {face: "U", clockwise: false}, 
      "right": {face: "U", clockwise: true}
    }},
    {"position": [0, 1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "U", clockwise: false}, 
      "right": {face: "U", clockwise: true}
    }},
    {"position": [1, 1], "drag_actions": {
      "up": {face: "L", clockwise: false}, 
      "down": {face: "L", clockwise: true}, 
      "left": {face: "U", clockwise: false}, 
      "right": {face: "U", clockwise: true}
    }},
    {"position": [-1, 0], "drag_actions": {
      "up": {face: "R", clockwise: true}, 
      "down": {face: "R", clockwise: false}, 
      "left": null, 
      "right": null
    }},
    {"position": [0, 0], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": null, 
      "right": null
    }},
    {"position": [1, 0], "drag_actions": {
      "up": {face: "L", clockwise: false}, 
      "down": {face: "L", clockwise: true}, 
      "left": null, 
      "right": null
    }},
    {"position": [-1, -1], "drag_actions": {
      "up": {face: "R", clockwise: true}, 
      "down": {face: "R", clockwise: false}, 
      "left": {face: "D", clockwise: true}, 
      "right": {face: "D", clockwise: false}
    }},
    {"position": [0, -1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "D", clockwise: true}, 
      "right": {face: "D", clockwise: false}
    }},
    {"position": [1, -1], "drag_actions": {
      "up": {face: "L", clockwise: false}, 
      "down": {face: "L", clockwise: true}, 
      "left": {face: "D", clockwise: true}, 
      "right": {face: "D", clockwise: false}
    }}
  ],
  L: [
    {"position": [-1, 1], "drag_actions": {
      "up": {face: "B", clockwise: true}, 
      "down": {face: "B", clockwise: false}, 
      "left": {face: "U", clockwise: true}, 
      "right": {face: "U", clockwise: false}
    }},
    {"position": [0, 1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "U", clockwise: true}, 
      "right": {face: "U", clockwise: false}
    }},
    {"position": [1, 1], "drag_actions": {
      "up": {face: "F", clockwise: false}, 
      "down": {face: "F", clockwise: true}, 
      "left": {face: "U", clockwise: true}, 
      "right": {face: "U", clockwise: false}
    }},
    {"position": [-1, 0], "drag_actions": {
      "up": {face: "B", clockwise: true}, 
      "down": {face: "B", clockwise: false}, 
      "left": null, 
      "right": null
    }},
    {"position": [0, 0], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": null, 
      "right": null
    }},
    {"position": [1, 0], "drag_actions": {
      "up": {face: "F", clockwise: false}, 
      "down": {face: "F", clockwise: true}, 
      "left": null, 
      "right": null
    }},
    {"position": [-1, -1], "drag_actions": {
      "up": {face: "B", clockwise: true}, 
      "down": {face: "B", clockwise: false}, 
      "left": {face: "D", clockwise: false}, 
      "right": {face: "D", clockwise: true}
    }},
    {"position": [0, -1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "D", clockwise: false}, 
      "right": {face: "D", clockwise: true}
    }},
    {"position": [1, -1], "drag_actions": {
      "up": {face: "F", clockwise: false}, 
      "down": {face: "F", clockwise: true}, 
      "left": {face: "D", clockwise: false}, 
      "right": {face: "D", clockwise: true}
    }}
  ],
  R: [
    {"position": [-1, 1], "drag_actions": {
      "up": {face: "F", clockwise: true}, 
      "down": {face: "F", clockwise: false}, 
      "left": {face: "U", clockwise: true}, 
      "right": {face: "U", clockwise: false}
    }},
    {"position": [0, 1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "U", clockwise: true}, 
      "right": {face: "U", clockwise: false}
    }},
    {"position": [1, 1], "drag_actions": {
      "up": {face: "B", clockwise: false}, 
      "down": {face: "B", clockwise: true}, 
      "left": {face: "U", clockwise: true}, 
      "right": {face: "U", clockwise: false}
    }},
    {"position": [-1, 0], "drag_actions": {
      "up": {face: "F", clockwise: true}, 
      "down": {face: "F", clockwise: false}, 
      "left": null, 
      "right": null
    }},
    {"position": [0, 0], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": null, 
      "right": null
    }},
    {"position": [1, 0], "drag_actions": {
      "up": {face: "B", clockwise: false}, 
      "down": {face: "B", clockwise: true}, 
      "left": null, 
      "right": null
    }},
    {"position": [-1, -1], "drag_actions": {
      "up": {face: "F", clockwise: true}, 
      "down": {face: "F", clockwise: false}, 
      "left": {face: "D", clockwise: false}, 
      "right": {face: "D", clockwise: true}
    }},
    {"position": [0, -1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "D", clockwise: false}, 
      "right": {face: "D", clockwise: true}
    }},
    {"position": [1, -1], "drag_actions": {
      "up": {face: "B", clockwise: false}, 
      "down": {face: "B", clockwise: true}, 
      "left": {face: "D", clockwise: false}, 
      "right": {face: "D", clockwise: true}
    }}
  ],
  U: [
    {"position": [-1, 1], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": {face: "B", clockwise: false}, 
      "right": {face: "B", clockwise: true}
    }},
    {"position": [0, 1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "B", clockwise: false}, 
      "right": {face: "B", clockwise: true}
    }},
    {"position": [1, 1], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": {face: "B", clockwise: false}, 
      "right": {face: "B", clockwise: true}
    }},
    {"position": [-1, 0], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": null, 
      "right": null
    }},
    {"position": [0, 0], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": null, 
      "right": null
    }},
    {"position": [1, 0], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": null, 
      "right": null
    }},
    {"position": [-1, -1], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": {face: "F", clockwise: true}, 
      "right": {face: "F", clockwise: false}
    }},
    {"position": [0, -1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "F", clockwise: true}, 
      "right": {face: "F", clockwise: false}
    }},
    {"position": [1, -1], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": {face: "F", clockwise: true}, 
      "right": {face: "F", clockwise: false}
    }}
  ],
  D: [
    {"position": [-1, 1], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": {face: "F", clockwise: false}, 
      "right": {face: "F", clockwise: true}
    }},
    {"position": [0, 1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "F", clockwise: false}, 
      "right": {face: "F", clockwise: true}
    }},
    {"position": [1, 1], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": {face: "F", clockwise: false}, 
      "right": {face: "F", clockwise: true}
    }},
    {"position": [-1, 0], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": null, 
      "right": null
    }},
    {"position": [0, 0], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": null, 
      "right": null
    }},
    {"position": [1, 0], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": null, 
      "right": null
    }},
    {"position": [-1, -1], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": {face: "B", clockwise: true}, 
      "right": {face: "B", clockwise: false}
    }},
    {"position": [0, -1], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "B", clockwise: true}, 
      "right": {face: "B", clockwise: false}
    }},
    {"position": [1, -1], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": {face: "B", clockwise: true}, 
      "right": {face: "B", clockwise: false}
    }}
  ]
} as const;

// Convert 3D cubie position to 2D face matrix position
function getCubieMatrixPosition(cubiePos: Vector3, face: Face): [number, number] | null {
  let x: number, y: number;
  
  switch (face) {
    case 'F': // Front face (z = 1)
      if (cubiePos.z !== 1) return null;
      x = cubiePos.x;
      y = cubiePos.y;
      break;
    case 'B': // Back face (z = -1)
      if (cubiePos.z !== -1) return null;
      x = -cubiePos.x; // Mirror x-axis to maintain consistent orientation
      y = cubiePos.y;
      break;
    case 'L': // Left face (x = -1)
      if (cubiePos.x !== -1) return null;
      x = cubiePos.z;
      y = cubiePos.y;
      break;
    case 'R': // Right face (x = 1)
      if (cubiePos.x !== 1) return null;
      x = -cubiePos.z; // Mirror z to maintain consistent orientation
      y = cubiePos.y;
      break;
    case 'U': // Top face (y = 1)
      if (cubiePos.y !== 1) return null;
      x = cubiePos.x;
      y = -cubiePos.z;
      break;
    case 'D': // Bottom face (y = -1)
      if (cubiePos.y !== -1) return null;
      x = cubiePos.x;
      y = cubiePos.z;
      break;
    default:
      return null;
  }
  
  return [x, y];
}

// Get rotation action based on cubie position and drag direction
function getRotationFromGesture(
  frontFace: Face,
  cubiePos: Vector3,
  dragDirection: 'up' | 'down' | 'left' | 'right'
): {face: Face; clockwise: boolean} | null {
  const matrixPos = getCubieMatrixPosition(cubiePos, frontFace);
  if (!matrixPos) return null;
  
  const [x, y] = matrixPos;
  const faceMatrix = GESTURE_MATRIX[frontFace];
  
  // Find the cubie in the matrix
  const cubieData = faceMatrix.find(item => 
    item.position[0] === x && item.position[1] === y
  );
  
  if (!cubieData) return null;
  
  return cubieData.drag_actions[dragDirection];
}

function CubeGroup() {
  const groupRef = useRef<Group>(null);
  const animationGroupRef = useRef<Group>(null);
  const { 
    cubies, 
    isAnimating, 
    animatingFace, 
    updateCubiePositionsAndMaterials,
    rotationDirection,
    setAnimatingCubies 
  } = useCubeStore();
  const animationProgressRef = useRef(0);
  const animationStartTimeRef = useRef(0);
  const currentRotationRef = useRef<{ face: Face; clockwise: boolean }>({ face: 'F', clockwise: true });
  
  const validCubies = React.useMemo(() => 
    cubies.filter(c => c && c.position && c.materials?.length === 6), [cubies]);

  // Function to determine which cubies belong to a face
  const getCubiesForFace = (face: Face): string[] => {
    const cubieIds: string[] = [];
    
    validCubies.forEach(cubie => {
      const { x, y, z } = cubie.position;
      let belongsToFace = false;
      
      switch (face) {
        case 'F': belongsToFace = z === 1; break;
        case 'B': belongsToFace = z === -1; break;
        case 'L': belongsToFace = x === -1; break;
        case 'R': belongsToFace = x === 1; break;
        case 'U': belongsToFace = y === 1; break;
        case 'D': belongsToFace = y === -1; break;
      }
      
      if (belongsToFace) {
        cubieIds.push(cubie.id);
      }
    });
    
    return cubieIds;
  };

  useFrame((state) => {
    if (!isAnimating || !animatingFace || !animationGroupRef.current) {
      return;
    }

    const currentTime = state.clock.elapsedTime * 1000;
    if (animationStartTimeRef.current === 0) {
      animationStartTimeRef.current = currentTime;
      
      // Move appropriate cubies to animation group
      const faceCubies = getCubiesForFace(animatingFace);
      
      // Signal cubies to move to animation group
      setAnimatingCubies(faceCubies);
      
      // Set current rotation info
      currentRotationRef.current = {
        face: animatingFace,
        clockwise: rotationDirection ?? true
      };
    }

    const elapsed = currentTime - animationStartTimeRef.current;
    const progress = Math.min(elapsed / 300, 1);
    animationProgressRef.current = progress;

    const axis = getFaceRotationAxis(animatingFace);
    const direction = getFaceRotationDirection(animatingFace, currentRotationRef.current.clockwise);
    const currentRotation = (Math.PI / 2) * direction * progress;

    const rotation = new Euler();
    if (axis === 'x') rotation.x = currentRotation;
    else if (axis === 'y') rotation.y = currentRotation;
    else if (axis === 'z') rotation.z = currentRotation;

    animationGroupRef.current.rotation.copy(rotation);

    if (progress >= 1) {
      // Reset animation group rotation
      animationGroupRef.current.rotation.set(0, 0, 0);
      
      // Signal cubies to return to main group
      setAnimatingCubies([]);
      
      // Update positions and materials
      updateCubiePositionsAndMaterials(currentRotationRef.current.face, currentRotationRef.current.clockwise);
      
      // Reset animation state
      animationStartTimeRef.current = 0;
      animationProgressRef.current = 0;
    }
  });

  // Update current rotation when animation starts
  React.useEffect(() => {
    if (isAnimating && animatingFace && rotationDirection !== null) {
      currentRotationRef.current = {
        face: animatingFace,
        clockwise: rotationDirection
      };
    }
  }, [isAnimating, animatingFace, rotationDirection]);

  // Debug: Log cubie count
  React.useEffect(() => {
    console.log('Valid cubies count:', validCubies.length);
    console.log('Sample cubie:', validCubies[0]);
  }, [validCubies]);

  return (
    <group ref={groupRef}>
      <group ref={animationGroupRef} />
      {validCubies.map((cubie) => (
        <AnimatedCubie
          key={cubie.id}
          cubie={cubie}
          animationGroup={animationGroupRef}
          mainGroup={groupRef}
        />
      ))}
    </group>
  );
}

function FaceDetector({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const { camera, scene, gl } = useThree();
  const raycaster = useRef(new Raycaster()).current;
  const pointer = useRef(new Vector2()).current;
  
  const dragInfo = useRef<{ startPos: Vector2; cubieData: any } | null>(null);
  const isDragging = useRef(false);
  const isInteracting = useRef(false);

  const getCubieFaces = (position: Vector3): Face[] => {
    const faces: Face[] = [];
    const threshold = 0.1;
    
    if (Math.abs(position.x - 1) < threshold) faces.push('R');
    if (Math.abs(position.x + 1) < threshold) faces.push('L');
    if (Math.abs(position.y - 1) < threshold) faces.push('U');
    if (Math.abs(position.y + 1) < threshold) faces.push('D');
    if (Math.abs(position.z - 1) < threshold) faces.push('F');
    if (Math.abs(position.z + 1) < threshold) faces.push('B');
    
    return faces;
  };

  const getFaceFromNormal = (normal: Vector3): Face => {
    normal.normalize();
    const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
    const major = axes.reduce((a, b) => Math.abs(normal[a]) > Math.abs(normal[b]) ? a : b);
    const sign = Math.sign(normal[major]);
    
    const faceMap: Record<string, Face> = {
      'x+': 'R', 'x-': 'L',
      'y+': 'U', 'y-': 'D',
      'z+': 'F', 'z-': 'B'
    };
    
    return faceMap[`${major}${sign > 0 ? '+' : '-'}`];
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (useCubeStore.getState().isAnimating) return;

    const bounds = gl.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const hit = intersects.find(i => (i.object as Mesh).geometry?.type.includes('Box'));

    if (!hit || !hit.object) {
      isInteracting.current = false;
      dragInfo.current = null;
      isDragging.current = false;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    isInteracting.current = true;
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }

    const cubieWorldPos = new Vector3();
    hit.object.getWorldPosition(cubieWorldPos);

    const cubiePos = new Vector3(
      Math.round(cubieWorldPos.x),
      Math.round(cubieWorldPos.y),
      Math.round(cubieWorldPos.z)
    );

    const frontFace = getFrontFacingFace(camera);
    const cubieData = {
      position: cubiePos,
      faces: getCubieFaces(cubiePos),
      clickedFace: getFaceFromNormal(hit.face!.normal.clone().transformDirection(hit.object.matrixWorld)),
      frontFace: frontFace,
      matrixPosition: getCubieMatrixPosition(cubiePos, frontFace)
    };
    
    // Store the drag start info
    dragInfo.current = {
      startPos: new Vector2(event.clientX, event.clientY),
      cubieData
    };
    isDragging.current = false;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragInfo.current || useCubeStore.getState().isAnimating) return;

    const dx = event.clientX - dragInfo.current.startPos.x;
    const dy = event.clientY - dragInfo.current.startPos.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);

    if (dragDistance >= 30) {
      isDragging.current = true;
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    }

    if (isDragging.current) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  };

  // SIMPLIFIED: Updated handlePointerUp using gesture matrix direction
  const handlePointerUp = (event: PointerEvent) => {
    if (dragInfo.current && isDragging.current && !useCubeStore.getState().isAnimating) {
      const dx = event.clientX - dragInfo.current.startPos.x;
      const dy = event.clientY - dragInfo.current.startPos.y;
      let dragDirection: 'up' | 'down' | 'left' | 'right';

      if (Math.abs(dx) > Math.abs(dy)) {
        dragDirection = dx > 0 ? 'right' : 'left';
      } else {
        dragDirection = dy > 0 ? 'down' : 'up';
      }

      const { frontFace, position: cubiePos } = dragInfo.current.cubieData;
      const mappedDirection = mapDirectionRelativeToFace(dragDirection, frontFace, camera);
      const rotationAction = getRotationFromGesture(frontFace, cubiePos, mappedDirection);
      
      if (rotationAction) {
        const { face: targetFace, clockwise } = rotationAction;
        console.log(`Rotating face ${targetFace} ${clockwise ? 'clockwise' : 'counter-clockwise'} (drag: ${dragDirection}, mapped: ${mappedDirection})`);
        
        useCubeStore.getState().setRotationDirection(clockwise);
        useCubeStore.getState().rotateFace(targetFace, clockwise);
      } else {
        console.log('No rotation action defined for this gesture.');
      }
    }
    
    // Reset state and enable controls
    dragInfo.current = null;
    isDragging.current = false;
    setTimeout(() => {
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    }, 100);
  };
  
  useEffect(() => {
    const domElement = gl.domElement;
    
    domElement.addEventListener('pointerdown', handlePointerDown, { capture: true });
    domElement.addEventListener('pointermove', handlePointerMove, { capture: true });
    domElement.addEventListener('pointerup', handlePointerUp, { capture: true });
    domElement.addEventListener('pointercancel', handlePointerUp, { capture: true });
    domElement.addEventListener('pointerleave', handlePointerUp, { capture: true });
    
    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      domElement.removeEventListener('pointermove', handlePointerMove, { capture: true });
      domElement.removeEventListener('pointerup', handlePointerUp, { capture: true });
      domElement.removeEventListener('pointercancel', handlePointerUp, { capture: true });
      domElement.removeEventListener('pointerleave', handlePointerUp, { capture: true });
    };
  }, [controlsRef]);

  return null;
}

function Scene() {
  const controlsRef = useRef<any>(null);

  return (
    <>
      {/* Improved lighting setup */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 10]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-8, 8, 8]} intensity={0.8} />
      <directionalLight position={[0, 0, 10]} intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={0.4} />
      <pointLight position={[-5, -5, 5]} intensity={0.4} />
      
      <CubeGroup />
      <FaceDetector controlsRef={controlsRef} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        enableZoom={true}
        enableRotate={true}
        minDistance={4} 
        maxDistance={20}
        enableDamping
        dampingFactor={0.05}
        mouseButtons={{
          LEFT: 0,
          MIDDLE: 1,
          RIGHT: 2
        }}
        touches={{
          ONE: 0,
          TWO: 1
        }}
      />
    </>
  );
}

export function RubiksCube() {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [5, 5, 5], fov: 60 }} 
        shadows 
        className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}