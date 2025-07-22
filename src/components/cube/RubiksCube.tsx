import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Group, Euler } from 'three';
import { useCubeStore } from '../../store/cubeStore';
import { AnimatedCubie } from './AnimatedCubie';
import { getFaceRotationAxis, getFaceRotationDirection, getCubiesOnFace } from '../../utils/rotationUtils';
import { useFrame } from '@react-three/fiber';

function CubeGroup() {
  const groupRef = useRef<Group>(null);
  const animationGroupRef = useRef<Group>(null);
  const { cubies, isAnimating, animatingFace, updateCubiePositionsAndMaterials } = useCubeStore();
  const animationProgressRef = useRef(0);
  const animationStartTimeRef = useRef(0);
  const currentRotationRef = useRef({ face: '', clockwise: true });

  // Track current rotation parameters
  useEffect(() => {
    if (isAnimating && animatingFace) {
      currentRotationRef.current = { face: animatingFace, clockwise: true };
      animationStartTimeRef.current = 0;
      animationProgressRef.current = 0;
    }
  }, [isAnimating, animatingFace]);

  // Clean up animation group when component unmounts
  useEffect(() => {
    return () => {
      if (animationGroupRef.current) {
        // Remove all children from animation group
        while (animationGroupRef.current.children.length > 0) {
          animationGroupRef.current.remove(animationGroupRef.current.children[0]);
        }
      }
    };
  }, []);
  // Animation logic
  useFrame((state) => {
    if (!isAnimating || !animatingFace || !animationGroupRef.current) return;

    const currentTime = state.clock.elapsedTime * 1000; // Convert to milliseconds
    if (animationStartTimeRef.current === 0) {
      animationStartTimeRef.current = currentTime;
    }

    const elapsed = currentTime - animationStartTimeRef.current;
    const duration = 300; // 300ms animation
    const progress = Math.min(elapsed / duration, 1);
    animationProgressRef.current = progress;

    // Calculate rotation
    const axis = getFaceRotationAxis(animatingFace);
    const direction = getFaceRotationDirection(animatingFace, currentRotationRef.current.clockwise);
    const targetRotation = (Math.PI / 2) * direction; // 90 degrees
    const currentRotation = targetRotation * progress;

    // Apply rotation to animation group
    const rotation = new Euler(0, 0, 0);
    if (axis === 'x') rotation.x = currentRotation;
    else if (axis === 'y') rotation.y = currentRotation;
    else if (axis === 'z') rotation.z = currentRotation;
    
    animationGroupRef.current.rotation.copy(rotation);

    // Reset animation when complete
    if (progress >= 1) {
      // Ensure all children are removed from animation group
      const children = [...animationGroupRef.current.children];
      children.forEach(child => {
        animationGroupRef.current!.remove(child);
      });
      
      animationStartTimeRef.current = 0;
      animationProgressRef.current = 0;
      animationGroupRef.current.rotation.set(0, 0, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={animationGroupRef} visible={true} />
      {cubies.map((cubie) => (
        <AnimatedCubie 
          key={cubie.id} 
          cubie={cubie} 
          animationGroup={animationGroupRef}
        />
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
      />
      <directionalLight
        position={[-8, 8, 8]}
        intensity={0.6}
      />
      <directionalLight
        position={[0, 0, 10]}
        intensity={0.4}
      />
      <pointLight position={[5, 5, 5]} intensity={0.3} />
      <pointLight position={[-5, -5, 5]} intensity={0.3} />
      
      {/* Environment */}
      <Environment preset="studio" />
      
      {/* Cube */}
      <CubeGroup />
      
      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={20}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        autoRotate={false}
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
      >
        <Scene />
      </Canvas>
    </div>
  );
}