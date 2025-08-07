import React, { useRef, useMemo } from 'react';
import { Mesh } from 'three';
import { CubieState, CubeColor } from '../../types/cube';
import * as THREE from 'three';

interface CubieProps {
  cubie: CubieState;
}

const COLOR_MAP: Record<CubeColor, string> = {
  white: '#ffffff',
  yellow: '#ffed4a',
  red: '#e53e3e',
  orange: '#fd7f28',
  green: '#38a169',
  blue: '#3182ce',
  black: '#2a2a2a',
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
