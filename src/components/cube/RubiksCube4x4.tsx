import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Group, Euler, Raycaster, Vector2, Vector3, Mesh, Camera, Object3D } from 'three';
import { useCubeStore4x4 } from '../../store/cubeStore4x4';
import { AnimatedCubie } from './AnimatedCubie';
import { getFaceRotationAxis, getFaceRotationDirection } from '../../utils/rotationUtils';
import { Face } from '../../types/cube';

// 4x4 positions
const POSITIONS_4 = [-1.5, -0.5, 0.5, 1.5];

// 4x4 specific gesture matrix (simplified version - only outer layer gestures)
const GESTURE_MATRIX_4x4 = {
  F: [
    {"position": [-1.5, 1.5], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": {face: "U", clockwise: false}, 
      "right": {face: "U", clockwise: true}
    }},
    {"position": [-0.5, 1.5], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "U", clockwise: false}, 
      "right": {face: "U", clockwise: true}
    }},
    {"position": [0.5, 1.5], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "U", clockwise: false}, 
      "right": {face: "U", clockwise: true}
    }},
    {"position": [1.5, 1.5], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": {face: "U", clockwise: false}, 
      "right": {face: "U", clockwise: true}
    }},
    {"position": [-1.5, 0.5], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": null, 
      "right": null
    }},
    {"position": [-0.5, 0.5], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": null, 
      "right": null
    }},
    {"position": [0.5, 0.5], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": null, 
      "right": null
    }},
    {"position": [1.5, 0.5], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": null, 
      "right": null
    }},
    {"position": [-1.5, -0.5], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": null, 
      "right": null
    }},
    {"position": [-0.5, -0.5], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": null, 
      "right": null
    }},
    {"position": [0.5, -0.5], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": null, 
      "right": null
    }},
    {"position": [1.5, -0.5], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": null, 
      "right": null
    }},
    {"position": [-1.5, -1.5], "drag_actions": {
      "up": {face: "L", clockwise: true}, 
      "down": {face: "L", clockwise: false}, 
      "left": {face: "D", clockwise: true}, 
      "right": {face: "D", clockwise: false}
    }},
    {"position": [-0.5, -1.5], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "D", clockwise: true}, 
      "right": {face: "D", clockwise: false}
    }},
    {"position": [0.5, -1.5], "drag_actions": {
      "up": null, 
      "down": null, 
      "left": {face: "D", clockwise: true}, 
      "right": {face: "D", clockwise: false}
    }},
    {"position": [1.5, -1.5], "drag_actions": {
      "up": {face: "R", clockwise: false}, 
      "down": {face: "R", clockwise: true}, 
      "left": {face: "D", clockwise: true}, 
      "right": {face: "D", clockwise: false}
    }}
  ]
  // For simplicity, only implementing F face gestures for 4x4
  // Other faces would follow similar pattern
} as const;

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

// Convert 3D cubie position to 2D face matrix position for 4x4
function getCubieMatrixPosition4x4(cubiePos: Vector3, face: Face): [number, number] | null {
  let x: number, y: number;
  
  switch (face) {
    case 'F': // Front face (z = 1.5)
      if (Math.abs(cubiePos.z - 1.5) > 1e-6) return null;
      x = cubiePos.x;
      y = cubiePos.y;
      break;
    case 'B': // Back face (z = -1.5)
      if (Math.abs(cubiePos.z + 1.5) > 1e-6) return null;
      x = -cubiePos.x; // Mirror x-axis to maintain consistent orientation
      y = cubiePos.y;
      break;
    case 'L': // Left face (x = -1.5)
      if (Math.abs(cubiePos.x + 1.5) > 1e-6) return null;
      x = cubiePos.z;
      y = cubiePos.y;
      break;
    case 'R': // Right face (x = 1.5)
      if (Math.abs(cubiePos.x - 1.5) > 1e-6) return null;
      x = -cubiePos.z; // Mirror z to maintain consistent orientation
      y = cubiePos.y;
      break;
    case 'U': // Top face (y = 1.5)
      if (Math.abs(cubiePos.y - 1.5) > 1e-6) return null;
      x = cubiePos.x;
      y = -cubiePos.z;
      break;
    case 'D': // Bottom face (y = -1.5)
      if (Math.abs(cubiePos.y + 1.5) > 1e-6) return null;
      x = cubiePos.x;
      y = cubiePos.z;
      break;
    default:
      return null;
  }
  
  return [x, y];
}

// Get rotation action based on cubie position and drag direction for 4x4
function getRotationFromGesture4x4(
  frontFace: Face,
  cubiePos: Vector3,
  dragDirection: 'up' | 'down' | 'left' | 'right'
): {face: Face; clockwise: boolean} | null {
  // For 4x4, only implement F face for now
  if (frontFace !== 'F') return null;
  
  const matrixPos = getCubieMatrixPosition4x4(cubiePos, frontFace);
  if (!matrixPos) return null;
  
  const [x, y] = matrixPos;
  const faceMatrix = GESTURE_MATRIX_4x4[frontFace];
  
  // Find the cubie in the matrix
  const cubieData = faceMatrix.find(item => 
    Math.abs(item.position[0] - x) < 1e-6 && Math.abs(item.position[1] - y) < 1e-6
  );
  
  if (!cubieData) return null;
  
  return cubieData.drag_actions[dragDirection];
}

function CubeGroup4x4() {
  const groupRef = useRef<Group>(null);
  const animationGroupRef = useRef<Group>(null);
  const { 
    cubies, 
    isAnimating, 
    animatingFace, 
    updateCubiePositionsAndMaterials,
    rotationDirection,
    setAnimatingCubies 
  } = useCubeStore4x4();
  const animationProgressRef = useRef(0);
  const animationStartTimeRef = useRef(0);
  const currentRotationRef = useRef<{ face: Face; clockwise: boolean }>({ face: 'F', clockwise: true });
  
  const validCubies = React.useMemo(() => 
    cubies.filter(c => c && c.position && c.materials?.length === 6), [cubies]);

  // Function to determine which cubies belong to a face for 4x4
  const getCubiesForFace4x4 = (face: Face): string[] => {
    const cubieIds: string[] = [];
    
    validCubies.forEach(cubie => {
      const { x, y, z } = cubie.position;
      let belongsToFace = false;
      
      switch (face) {
        case 'F': belongsToFace = Math.abs(z - 1.5) < 1e-6; break;
        case 'B': belongsToFace = Math.abs(z + 1.5) < 1e-6; break;
        case 'L': belongsToFace = Math.abs(x + 1.5) < 1e-6; break;
        case 'R': belongsToFace = Math.abs(x - 1.5) < 1e-6; break;
        case 'U': belongsToFace = Math.abs(y - 1.5) < 1e-6; break;
        case 'D': belongsToFace = Math.abs(y + 1.5) < 1e-6; break;
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
      const faceCubies = getCubiesForFace4x4(animatingFace);
      
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

function FaceDetector4x4({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const { camera, scene, gl } = useThree();
  const raycaster = useRef(new Raycaster()).current;
  const pointer = useRef(new Vector2()).current;
  
  const dragInfo = useRef<{ startPos: Vector2; cubieData: any } | null>(null);
  const isDragging = useRef(false);
  const isInteracting = useRef(false);

  const getCubieFaces4x4 = (position: Vector3): Face[] => {
    const faces: Face[] = [];
    const threshold = 0.1;
    
    if (Math.abs(position.x - 1.5) < threshold) faces.push('R');
    if (Math.abs(position.x + 1.5) < threshold) faces.push('L');
    if (Math.abs(position.y - 1.5) < threshold) faces.push('U');
    if (Math.abs(position.y + 1.5) < threshold) faces.push('D');
    if (Math.abs(position.z - 1.5) < threshold) faces.push('F');
    if (Math.abs(position.z + 1.5) < threshold) faces.push('B');
    
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
    if (useCubeStore4x4.getState().isAnimating) return;

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

    // Round to nearest 4x4 position
    const roundToNearest = (val: number) => {
      const positions = [-1.5, -0.5, 0.5, 1.5];
      return positions.reduce((prev, curr) => 
        Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
      );
    };

    const cubiePos = new Vector3(
      roundToNearest(cubieWorldPos.x),
      roundToNearest(cubieWorldPos.y),
      roundToNearest(cubieWorldPos.z)
    );

    const frontFace = getFrontFacingFace(camera);
    const cubieData = {
      position: cubiePos,
      faces: getCubieFaces4x4(cubiePos),
      clickedFace: getFaceFromNormal(hit.face!.normal.clone().transformDirection(hit.object.matrixWorld)),
      frontFace: frontFace,
      matrixPosition: getCubieMatrixPosition4x4(cubiePos, frontFace)
    };
    
    // Store the drag start info
    dragInfo.current = {
      startPos: new Vector2(event.clientX, event.clientY),
      cubieData
    };
    isDragging.current = false;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragInfo.current || useCubeStore4x4.getState().isAnimating) return;

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

  const handlePointerUp = (event: PointerEvent) => {
    if (dragInfo.current && isDragging.current && !useCubeStore4x4.getState().isAnimating) {
      const dx = event.clientX - dragInfo.current.startPos.x;
      const dy = event.clientY - dragInfo.current.startPos.y;
      let dragDirection: 'up' | 'down' | 'left' | 'right';

      if (Math.abs(dx) > Math.abs(dy)) {
        dragDirection = dx > 0 ? 'right' : 'left';
      } else {
        dragDirection = dy > 0 ? 'down' : 'up';
      }

      const { frontFace, position: cubiePos } = dragInfo.current.cubieData;
      const rotationAction = getRotationFromGesture4x4(frontFace, cubiePos, dragDirection);
      
      if (rotationAction) {
        const { face: targetFace, clockwise } = rotationAction;
        console.log(`4x4: Rotating face ${targetFace} ${clockwise ? 'clockwise' : 'counter-clockwise'}`);
        
        useCubeStore4x4.getState().setRotationDirection(clockwise);
        useCubeStore4x4.getState().rotateFace(targetFace, clockwise);
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

function Scene4x4() {
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
      
      <CubeGroup4x4 />
      <FaceDetector4x4 controlsRef={controlsRef} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        enableZoom={true}
        enableRotate={true}
        minDistance={5} 
        maxDistance={25}
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

export function RubiksCube4x4() {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [6, 6, 6], fov: 60 }} 
        shadows 
        className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Scene4x4 />
      </Canvas>
    </div>
  );
}