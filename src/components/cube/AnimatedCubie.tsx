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

  // Add/remove cubie from animation group
  useEffect(() => {
    if (!meshRef.current || !animationGroup.current) return;

    if (isAnimating && isPartOfRotatingFace) {
      // Add to animation group
      animationGroup.current.add(meshRef.current);
    } else if (!isAnimating && meshRef.current.parent === animationGroup.current) {
      // Remove from animation group and reset position
      animationGroup.current.remove(meshRef.current);
      meshRef.current.position.set(
        position.x * 1.05,
        position.y * 1.05,
        position.z * 1.05
      );
      meshRef.current.rotation.set(0, 0, 0);
    }
  }, [isAnimating, isPartOfRotatingFace, position, animationGroup]);

  // Create materials for each face
  const faceMaterials = React.useMemo(() => {
    return materials.map((color) => 
      new THREE.MeshLambertMaterial({ color: COLOR_MAP[color] })
    );
  }, [materials]);

  return (
    <mesh
      ref={meshRef}
      position={[position.x * 1.05, position.y * 1.05, position.z * 1.05]}
      castShadow
      receiveShadow
      material={faceMaterials}
    >
      <boxGeometry args={[0.98, 0.98, 0.98]} />
    </mesh>
  );
}