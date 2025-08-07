import React, { useRef, useEffect } from 'react';
import { Mesh, Group } from 'three';
import { CubieState } from '../../types/cube';
import { useCubeStore } from '../../store/cubeStore';
import * as THREE from 'three';

interface AnimatedCubieProps {
  cubie: CubieState;
  animationGroup: React.RefObject<Group>;
  mainGroup: React.RefObject<Group>;
}

const COLOR_MAP = {
  white: '#ffffff',
  yellow: '#ffed4a',
  red: '#e53e3e',
  orange: '#fd7f28',
  green: '#38a169',
  blue: '#3182ce',
  black: '#2a2a2a',
} as const;

export function AnimatedCubie({ cubie, animationGroup, mainGroup }: AnimatedCubieProps) {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const wasAnimatingRef = useRef(false);
  const { animatingCubies } = useCubeStore();

  // Validate cubie data
  if (!cubie || !cubie.position || !cubie.materials || cubie.materials.length !== 6) {
    console.error('Invalid cubie data:', cubie);
    return null;
  }

  const { position, materials } = cubie;

  // Check if this cubie should be animating
  const shouldAnimate = animatingCubies.includes(cubie.id);

  // Create face materials - memoized for performance
  const faceMaterials = React.useMemo(() => {
    return materials.map((color) => {
      const colorValue = COLOR_MAP[color as keyof typeof COLOR_MAP] || COLOR_MAP.black;
      return new THREE.MeshLambertMaterial({
        color: colorValue,
        transparent: false,
        opacity: 1,
        side: THREE.FrontSide,
      });
    });
  }, [materials]);

  // Manage cubie movement between groups
  useEffect(() => {
    const group = groupRef.current;
    const animation = animationGroup.current;
    const main = mainGroup.current;

    if (!group || !animation || !main) return;

    // Move to animation group when animation starts
    if (shouldAnimate && !wasAnimatingRef.current) {
      // Remove from main group
      if (group.parent === main) {
        main.remove(group);
      }
      
      // Add to animation group
      if (group.parent !== animation) {
        animation.add(group);
      }
      
      wasAnimatingRef.current = true;
      console.log(`Cubie ${cubie.id} moved to animation group`);
    }
    
    // Move back to main group when animation ends
    if (!shouldAnimate && wasAnimatingRef.current) {
      // Remove from animation group
      if (group.parent === animation) {
        animation.remove(group);
      }
      
      // Add back to main group
      if (group.parent !== main) {
        main.add(group);
      }
      
      wasAnimatingRef.current = false;
      console.log(`Cubie ${cubie.id} moved back to main group`);
    }
  }, [shouldAnimate, animationGroup, mainGroup, cubie.id]);

  // Ensure cubie is in the correct group initially
  useEffect(() => {
    const group = groupRef.current;
    const main = mainGroup.current;
    
    if (!group || !main) return;
    
    // Only add to main group if not currently animating and not already added
    if (!shouldAnimate && group.parent !== main) {
      main.add(group);
    }
  }, [mainGroup, shouldAnimate]);

  // Update mesh materials when they change
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !faceMaterials || faceMaterials.length !== 6) return;
    
    // Dispose old materials to prevent memory leaks
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(mat => mat.dispose());
    } else if (mesh.material) {
      mesh.material.dispose();
    }
    
    mesh.material = faceMaterials;
    mesh.visible = true;
    mesh.frustumCulled = false;
  }, [faceMaterials]);

  // Update position
  useEffect(() => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;
    
    // Set position (with slight spacing for visual clarity)
    group.position.set(position.x * 1.05, position.y * 1.05, position.z * 1.05);
    
    mesh.visible = true;
    mesh.frustumCulled = false;
    mesh.matrixAutoUpdate = true;
    mesh.updateMatrix();
  }, [position]);

  // Cleanup materials on unmount
  useEffect(() => {
    return () => {
      faceMaterials.forEach(material => material.dispose());
    };
  }, [faceMaterials]);

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        visible={true}
        frustumCulled={false}
        matrixAutoUpdate={true}
      >
        <boxGeometry args={[0.98, 0.98, 0.98]} />
      </mesh>
      
      {/* Black wireframe for cube edges */}
      <mesh>
        <boxGeometry args={[1.0, 1.0, 1.0]} />
        <meshBasicMaterial color="black" wireframe />
      </mesh>
    </group>
  );
}