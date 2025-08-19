// src/components/manual/ManualCubie.tsx
import React, { useRef, useEffect } from 'react';
import { Mesh, Group } from 'three';
import { CubieState, CubeColor } from '../../types/cube';
import { useManualCubeStore } from '../../store/manualCubeStore';  // ⬅️ changed
import * as THREE from 'three';

interface ManualCubieProps {
  cubie: CubieState;
  animationGroup: React.RefObject<Group>;
  mainGroup: React.RefObject<Group>;
  onStickerClick: (cubieId: string, faceIndex: number) => void;
  stickerColors: CubeColor[];
}

const COLOR_MAP: Record<CubeColor | 'black' | 'gray', string> = {
  white: '#ffffff',
  yellow: '#ffed4a',
  red: '#e53e3e',
  orange: '#fd7f28',
  green: '#38a169',
  blue: '#3182ce',
  black: '#2a2a2a',
  gray: '#444444',
};

const BASE_FACE_POS = [
  [ 0.5, 0,  0],
  [-0.5, 0,  0],
  [ 0,   0.5, 0],
  [ 0,  -0.5, 0],
  [ 0,   0,  0.5],
  [ 0,   0, -0.5],
];
const BASE_FACE_ROT = [
  [ 0, -Math.PI / 2, 0],
  [ 0,  Math.PI / 2, 0],
  [-Math.PI / 2, 0, 0],
  [ Math.PI / 2, 0, 0],
  [ 0, 0, 0],
  [ 0,  Math.PI, 0],
];

export function ManualCubie({ cubie, animationGroup, mainGroup, onStickerClick, stickerColors }: ManualCubieProps) {
  const bodyRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const wasAnimatingRef = useRef(false);
  const { animatingCubies } = useManualCubeStore();  // ⬅️ changed

  if (!cubie || !cubie.position || !stickerColors || stickerColors.length !== 6) {
    console.error('Invalid cubie data:', cubie);
    return null;
  }

  const { position } = cubie;
  const shouldAnimate = animatingCubies.includes(cubie.id);

  useEffect(() => {
    const group = groupRef.current;
    const animation = animationGroup.current;
    const main = mainGroup.current;
    if (!group || !animation || !main) return;

    if (shouldAnimate && !wasAnimatingRef.current) {
      if (group.parent === main) main.remove(group);
      animation.add(group);
      wasAnimatingRef.current = true;
    }
    if (!shouldAnimate && wasAnimatingRef.current) {
      if (group.parent === animation) animation.remove(group);
      if (group.parent !== main) main.add(group);
      wasAnimatingRef.current = false;
    }
  }, [shouldAnimate, animationGroup, mainGroup, cubie.id]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !mainGroup.current) return;
    if (!shouldAnimate && group.parent !== mainGroup.current) mainGroup.current.add(group);
  }, [mainGroup, shouldAnimate]);

  useEffect(() => {
    groupRef.current?.position.set(position.x * 1.05, position.y * 1.05, position.z * 1.05);
  }, [position]);

  const STICKER_OFFSET = 0.52;

  return (
    <group ref={groupRef}>
      <mesh ref={bodyRef} castShadow receiveShadow raycast={() => null as any}>
        <boxGeometry args={[0.98, 0.98, 0.98]} />
        <meshLambertMaterial color={COLOR_MAP.black} />
      </mesh>
      {stickerColors.map((color, i) => {
        const hex = COLOR_MAP[color] ?? COLOR_MAP.gray;
        const basePos = BASE_FACE_POS[i];
        const baseRot = BASE_FACE_ROT[i];
        const pos: [number, number, number] = [
          basePos[0] === 0 ? 0 : (basePos[0] > 0 ? STICKER_OFFSET : -STICKER_OFFSET),
          basePos[1] === 0 ? 0 : (basePos[1] > 0 ? STICKER_OFFSET : -STICKER_OFFSET),
          basePos[2] === 0 ? 0 : (basePos[2] > 0 ? STICKER_OFFSET : -STICKER_OFFSET),
        ];
        const rot = baseRot as [number, number, number];
        return (
          <mesh key={i} position={pos} rotation={rot} onClick={(e) => { e.stopPropagation(); onStickerClick(cubie.id, i); }}>
            <planeGeometry args={[0.9, 0.9]} />
            <meshBasicMaterial color={hex} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
      <mesh raycast={() => null as any}>
        <boxGeometry args={[1.0, 1.0, 1.0]} />
        <meshBasicMaterial color="black" wireframe />
      </mesh>
    </group>
  );
}
