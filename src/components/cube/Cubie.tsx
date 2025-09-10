import React, { useRef, useMemo } from 'react';
import { Mesh } from 'three';
import { CubieState, CubeColor } from '../../types/cube';
import * as THREE from 'three';

interface CubieProps {
  cubie: CubieState;
}

const COLOR_MAP: Record<CubeColor, string> = {
  white: '#FFFFFF',
  yellow: '#FFD700',
  red: '#C41E3A',
  orange: '#FF8C00',
  green: '#228B22',
  blue: '#0057B8',
  black: '#000',
  gray: '#444444',
};

export function Cubie({ cubie }: CubieProps) {
  const meshRef = useRef<Mesh>(null);
  const { position, materials } = cubie;

  // Create materials array with proper error handling
  const faceMaterials = useMemo(() => {
    return materials.map((color) => {
      const colorValue = COLOR_MAP[color] || COLOR_MAP.black;
      return new THREE.MeshLambertMaterial({ 
        color: colorValue,
        transparent: false,
        opacity: 1,
        side: THREE.FrontSide,
        needsUpdate: true
      });
    });
  }, [materials]);

  return (
    <mesh
      ref={meshRef}
      position={[position.x * 1.05, position.y * 1.05, position.z * 1.05]}
      castShadow
      receiveShadow
      material={faceMaterials}
      visible={true}
      frustumCulled={false}
    >
      <boxGeometry args={[0.98, 0.98, 0.98]} />
    </mesh>
  );
}
