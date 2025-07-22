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
  
  // Validate cubie data
  if (!cubie || !cubie.position || !cubie.materials || cubie.materials.length !== 6) {
    console.error('Invalid cubie data:', cubie);
    return null; // Don't render invalid cubies
  }
  
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
      // Store current world position before adding to group
      const worldPosition = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPosition);
      meshRef.current.userData.worldPosition = worldPosition;
      
      // Set position relative to animation group
      meshRef.current.position.set(
        position.x * 1.05,
        position.y * 1.05,
        position.z * 1.05
      );
      animationGroup.current.add(meshRef.current);
    } else {
      // Remove from animation group and restore proper positioning
      if (meshRef.current.parent === animationGroup.current) {
        animationGroup.current.remove(meshRef.current);
        
        // Reset position to match current cube state
        meshRef.current.position.set(
          position.x * 1.05,
          position.y * 1.05,
          position.z * 1.05
        );
        meshRef.current.rotation.set(0, 0, 0);
      }
    }
  }, [isAnimating, isPartOfRotatingFace, position, animationGroup]);

  // Update position when not animating
  useEffect(() => {
    if (!meshRef.current || isAnimating) return;
    
    // Update position to match current state
    if (meshRef.current.parent !== animationGroup.current) {
      meshRef.current.position.set(
        position.x * 1.05,
        position.y * 1.05,
        position.z * 1.05
      );
    }
  }, [position, isAnimating, animationGroup]);

  // Force re-render when materials change
  const materialKey = React.useMemo(() => {
    return `${cubie.id}-${materials.join('-')}`;
  }, [materials]);

  // Create materials for each face with proper error handling
  const faceMaterials = React.useMemo(() => {
    // Validate materials array
    if (!materials || materials.length !== 6) {
      console.error('Invalid materials for cubie:', cubie.id, materials);
      return Array(6).fill(null).map(() => 
        new THREE.MeshLambertMaterial({ color: COLOR_MAP.black })
      );
    }
    
    return materials.map((color, index) => {
      const colorValue = COLOR_MAP[color as keyof typeof COLOR_MAP] || COLOR_MAP.black;
      
      // Validate color value
      if (!colorValue) {
        console.error(`Invalid color for cubie ${cubie.id} face ${index}:`, color);
      }
      
      return new THREE.MeshLambertMaterial({ 
        color: colorValue || COLOR_MAP.black,
        transparent: false,
        opacity: 1,
        side: THREE.FrontSide,
        needsUpdate: true,
        visible: true
      });
    });
  }, [materials, cubie.id, materialKey]);

  // Update materials when they change
  React.useEffect(() => {
    if (meshRef.current && faceMaterials && faceMaterials.length === 6) {
      meshRef.current.material = faceMaterials;
      // Force geometry update
      if (meshRef.current.geometry) {
        meshRef.current.geometry.computeBoundingBox();
        meshRef.current.geometry.computeBoundingSphere();
      }
      // Force render update
      meshRef.current.visible = true;
      meshRef.current.frustumCulled = false;
    }
  }, [faceMaterials]);

  // Ensure cubie is always visible
  React.useEffect(() => {
    if (meshRef.current) {
      meshRef.current.visible = true;
      meshRef.current.frustumCulled = false; // Prevent culling issues
      meshRef.current.matrixAutoUpdate = true;
      meshRef.current.updateMatrix();
    }
  }, [cubie.id, position]);
  
  // Force re-render when cubie changes
  React.useEffect(() => {
    if (meshRef.current) {
      meshRef.current.updateMatrixWorld(true);
    }
  }, [cubie]);

  return (
    <mesh
      ref={meshRef}
      position={[position.x * 1.05, position.y * 1.05, position.z * 1.05]}
      castShadow
      receiveShadow
      material={faceMaterials}
      visible={true}
      frustumCulled={false}
      matrixAutoUpdate={true}
    >
      <boxGeometry args={[0.98, 0.98, 0.98]} />
    </mesh>
  );
}