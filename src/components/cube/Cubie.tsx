import React, { useRef } from 'react';
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
  black: '#2a2a2a'
};

export function Cubie({ cubie }: CubieProps) {
  const meshRef = useRef<Mesh>(null);
  const { position, materials } = cubie;

  // Create initial materials
  const materialRefs = useRef<THREE.MeshLambertMaterial[]>(
    materials.map((color) => new THREE.MeshLambertMaterial({ color: COLOR_MAP[color] }))
  );

  // Update face colors when materials change
  React.useEffect(() => {
    materials.forEach((color, i) => {
      const mat = materialRefs.current[i];
      if (mat) mat.color.set(COLOR_MAP[color]);
    });
  }, [materials]);

  return (
    <mesh
      ref={meshRef}
      position={[position.x * 1.05, position.y * 1.05, position.z * 1.05]}
      castShadow
      receiveShadow
      material={materialRefs.current}
    >
      <boxGeometry args={[0.98, 0.98, 0.98]} />
    </mesh>
  );
}
