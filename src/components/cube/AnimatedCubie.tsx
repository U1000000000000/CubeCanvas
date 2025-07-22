import React, { useRef, useEffect } from 'react';
import { Mesh, Group } from 'three';
import { CubieState, Face } from '../../types/cube';
import { useCubeStore } from '../../store/cubeStore';
import { getCubiesOnFace } from '../../utils/rotationUtils';
import * as THREE from 'three';

interface AnimatedCubieProps {
  cubie: CubieState;
  animationGroup: React.RefObject<Group>;
}

const COLOR_MAP = {
  white: '#ffffff',
  yellow: '#ffed4a',
  red: '#e53e3e',
  orange: '#fd7f28',
  green: '#38a169',
  blue: '#3182ce',
  black: '#2a2a2a'
} as const;

export function AnimatedCubie({ cubie, animationGroup }: AnimatedCubieProps) {
  const meshRef = useRef<Mesh>(null);
  const { isAnimating, animatingFace } = useCubeStore();
  const { position, materials } = cubie;

  // Check if this cubie is part of the rotating face
  const isPartOfRotatingFace = React.useMemo(() => {
    if (!animatingFace) return false;
    return getCubiesOnFace([cubie], animatingFace).length > 0;
  }, [animatingFace, cubie]);

  // Add/remove cubie from animation group with proper cleanup
  useEffect(() => {
    if (!meshRef.current || !animationGroup.current) return;

    if (isAnimating && isPartOfRotatingFace) {
      // Add to animation group and store original position
      meshRef.current.userData.originalPosition = {
        x: position.x * 1.05,
        y: position.y * 1.05,
        z: position.z * 1.05
      };
      meshRef.current.userData.originalRotation = {
        x: meshRef.current.rotation.x,
        y: meshRef.current.rotation.y,
        z: meshRef.current.rotation.z
      };
      animationGroup.current.add(meshRef.current);
    } else {
      // Always ensure cubie is removed from animation group when not animating
      if (meshRef.current.parent === animationGroup.current) {
        animationGroup.current.remove(meshRef.current);
      }
      
      // Reset position and rotation to match current cube state
      meshRef.current.position.set(
        position.x * 1.05,
        position.y * 1.05,
        position.z * 1.05
      );
      meshRef.current.rotation.set(0, 0, 0);
      
      // Clear userData
      delete meshRef.current.userData.originalPosition;
      delete meshRef.current.userData.originalRotation;
      
      // Ensure cubie is visible
      meshRef.current.visible = true;
    }
  }, [isAnimating, isPartOfRotatingFace, position, animationGroup]);

  // Ensure cubie is always visible and properly positioned
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Make sure the cubie is visible
    meshRef.current.visible = true;
    
    // If not animating, ensure proper position
    if (!isAnimating) {
      meshRef.current.position.set(
        position.x * 1.05,
        position.y * 1.05,
        position.z * 1.05
      );
      meshRef.current.rotation.set(0, 0, 0);
    }
  }, [position, isAnimating]);

  // Force re-render when materials change
  const materialKey = React.useMemo(() => {
    return materials.join('-');
  }, [materials]);

  // Create materials for each face with proper error handling
  const faceMaterials = React.useMemo(() => {
    return materials.map((color, index) => {
      const colorValue = COLOR_MAP[color as keyof typeof COLOR_MAP] || COLOR_MAP.black;
      return new THREE.MeshLambertMaterial({ 
        color: colorValue,
        transparent: false,
        opacity: 1,
        side: THREE.FrontSide
      });
    });
  }, [materialKey]);

  // Force re-render when cubie data changes
  React.useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material = faceMaterials;
      meshRef.current.visible = true;
    }
  }, [faceMaterials]);
  return (
    <mesh
      ref={meshRef}
      position={[position.x * 1.05, position.y * 1.05, position.z * 1.05]}
      castShadow
      receiveShadow
      material={faceMaterials}
      visible={true}
      key={`${cubie.id}-${materialKey}`}
    >
      <boxGeometry args={[0.98, 0.98, 0.98]} />
    </mesh>
  );
}