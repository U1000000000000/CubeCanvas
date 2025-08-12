import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Group, Euler, Raycaster, Vector2, Vector3, Mesh, Camera } from 'three';
import { useCubeStore } from '../../store/cubeStore';
import { ManualCubie } from './ManualCubie';
import { getFaceRotationAxis, getFaceRotationDirection } from '../../utils/rotationUtils';
import { Face, CubeColor } from '../../types/cube';

interface ManualCubeProps {
  onStickerClick: (cubieId: string, faceIndex: number) => void;
  stickerColors: Record<string, CubeColor[]>;
}

function CubeGroup({ onStickerClick, stickerColors }: ManualCubeProps) {
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

  return (
    <group ref={groupRef}>
      <group ref={animationGroupRef} />
      {validCubies.map((cubie) => (
        <ManualCubie
          key={cubie.id}
          cubie={cubie}
          animationGroup={animationGroupRef}
          mainGroup={groupRef}
          onStickerClick={onStickerClick}
          stickerColors={stickerColors[cubie.id] || cubie.materials}
        />
      ))}
    </group>
  );
}

function StickerClickDetector({ onStickerClick }: { onStickerClick: (cubieId: string, faceIndex: number) => void }) {
  const { camera, scene, gl } = useThree();
  const raycaster = useRef(new Raycaster()).current;
  const pointer = useRef(new Vector2()).current;

  const handleClick = (event: MouseEvent) => {
    if (useCubeStore.getState().isAnimating) return;

    const bounds = gl.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const hit = intersects.find(i => (i.object as Mesh).geometry?.type.includes('Box'));

    if (!hit || !hit.object || !hit.face) return;

    // Get the cubie position from the mesh world position
    const cubieWorldPos = new Vector3();
    hit.object.getWorldPosition(cubieWorldPos);

    const cubiePos = new Vector3(
      Math.round(cubieWorldPos.x),
      Math.round(cubieWorldPos.y),
      Math.round(cubieWorldPos.z)
    );

    const cubieId = `${cubiePos.x},${cubiePos.y},${cubiePos.z}`;

    // Determine which face was clicked based on the face normal
    const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    normal.normalize();

    let faceIndex = 0;
    const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
    const major = axes.reduce((a, b) => Math.abs(normal[a]) > Math.abs(normal[b]) ? a : b);
    const sign = Math.sign(normal[major]);

    // Map face normal to material index
    // Materials order: [+X, -X, +Y, -Y, +Z, -Z]
    if (major === 'x') {
      faceIndex = sign > 0 ? 0 : 1;
    } else if (major === 'y') {
      faceIndex = sign > 0 ? 2 : 3;
    } else if (major === 'z') {
      faceIndex = sign > 0 ? 4 : 5;
    }

    onStickerClick(cubieId, faceIndex);
  };

  useEffect(() => {
    const domElement = gl.domElement;
    domElement.addEventListener('click', handleClick);
    
    return () => {
      domElement.removeEventListener('click', handleClick);
    };
  }, [onStickerClick]);

  return null;
}

function Scene({ onStickerClick, stickerColors }: ManualCubeProps) {
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
      
      <CubeGroup onStickerClick={onStickerClick} stickerColors={stickerColors} />
      <StickerClickDetector onStickerClick={onStickerClick} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        enableZoom={true}
        enableRotate={true}
        minDistance={4} 
        maxDistance={20}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

export function ManualCube({ onStickerClick, stickerColors }: ManualCubeProps) {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [5, 5, 5], fov: 60 }} 
        shadows 
        className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Scene onStickerClick={onStickerClick} stickerColors={stickerColors} />
      </Canvas>
    </div>
  );
}