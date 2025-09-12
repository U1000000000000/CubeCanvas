// src/components/manual/TimelineManualCubie.jsx - Solid cube with only visible stickers
import React, { useRef, useEffect, useMemo } from 'react';
import { Mesh, Group } from 'three';
import { useManualCubeStore } from '../../store/manualCubeStore';
import * as THREE from 'three';

const COLOR_MAP = {
  white: '#FFFFFF',
  yellow: '#FFD700',
  red: '#C41E3A',
  orange: '#FF8C00',
  green: '#228B22',
  blue: '#0057B8',
  black: '#000',
  gray: '#444444',
};

const BASE_FACE_POS = [
  [0.5, 0, 0],    // +X (right)
  [-0.5, 0, 0],   // -X (left)  
  [0, 0.5, 0],    // +Y (top)
  [0, -0.5, 0],   // -Y (bottom)
  [0, 0, 0.5],    // +Z (front)
  [0, 0, -0.5],   // -Z (back)
];

const BASE_FACE_ROT = [
  [0, -Math.PI / 2, 0],  // +X
  [0, Math.PI / 2, 0],   // -X
  [-Math.PI / 2, 0, 0],  // +Y
  [Math.PI / 2, 0, 0],   // -Y
  [0, 0, 0],             // +Z
  [0, Math.PI, 0],       // -Z
];

// helper to check if a face is visible on outer surface
function isFaceVisible(faceIndex, x, y, z) {
  if (faceIndex === 0 && x === 1) return true;   // +X face
  if (faceIndex === 1 && x === -1) return true;  // -X face
  if (faceIndex === 2 && y === 1) return true;   // +Y face
  if (faceIndex === 3 && y === -1) return true;  // -Y face
  if (faceIndex === 4 && z === 1) return true;   // +Z face
  if (faceIndex === 5 && z === -1) return true;  // -Z face
  return false;
}

export function TimelineManualCubie({
  cubie,
  animationGroup,
  mainGroup,
  onStickerClick,
  isTimelineRotating = false,
}) {
  const bodyRef = useRef(null);
  const groupRef = useRef(null);
  const wasAnimatingRef = useRef(false);
  const lastPositionRef = useRef('');
  const { animatingCubies } = useManualCubeStore();

  const validatedCubie = useMemo(() => {
    if (!cubie || !cubie.position || !cubie.materials) return null;
    if (cubie.materials.length !== 6) return null;
    return cubie;
  }, [cubie]);

  if (!validatedCubie) return null;

  const { position, materials } = validatedCubie;

  const shouldAnimate = useMemo(() => {
    if (isTimelineRotating) return true;
    return animatingCubies.includes(validatedCubie.id);
  }, [isTimelineRotating, animatingCubies, validatedCubie.id]);

  // Group parenting logic
  useEffect(() => {
    const group = groupRef.current;
    const animation = animationGroup.current;
    const main = mainGroup.current;
    if (!group || !animation || !main) return;

    const isCurrentlyInAnimation = group.parent === animation;
    const isCurrentlyInMain = group.parent === main;

    if (shouldAnimate && !isCurrentlyInAnimation) {
      if (isCurrentlyInMain) main.remove(group);
      animation.add(group);
      wasAnimatingRef.current = true;
    } else if (!shouldAnimate && !isCurrentlyInMain) {
      if (isCurrentlyInAnimation) animation.remove(group);
      main.add(group);
      wasAnimatingRef.current = false;
    }
  }, [shouldAnimate, animationGroup, mainGroup, validatedCubie.id, isTimelineRotating]);

  // Ensure correct initial placement
  useEffect(() => {
    const group = groupRef.current;
    const main = mainGroup.current;
    if (!group || !main) return;
    if (!group.parent && !shouldAnimate) {
      main.add(group);
    }
  }, [mainGroup, shouldAnimate, validatedCubie.id]);

  // Update cubie position (no gaps between cubies)
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const positionKey = `${position.x},${position.y},${position.z}`;
    if (positionKey !== lastPositionRef.current) {
      group.position.set(position.x, position.y, position.z);
      lastPositionRef.current = positionKey;
    }
  }, [position, validatedCubie.id, shouldAnimate]);

  // Sticker meshes (only for visible faces)
  const stickerMeshes = useMemo(() => {
    const meshes = [];
    const STICKER_OFFSET = 0.52;
    const { x, y, z } = position;

    for (let i = 0; i < 6; i++) {
      if (!isFaceVisible(i, x, y, z)) continue; // skip hidden faces

      const color = materials[i];
      const hex = COLOR_MAP[color] ?? COLOR_MAP.gray;
      const basePos = BASE_FACE_POS[i];
      const baseRot = BASE_FACE_ROT[i];

      const pos = [
        basePos[0] === 0 ? 0 : (basePos[0] > 0 ? STICKER_OFFSET : -STICKER_OFFSET),
        basePos[1] === 0 ? 0 : (basePos[1] > 0 ? STICKER_OFFSET : -STICKER_OFFSET),
        basePos[2] === 0 ? 0 : (basePos[2] > 0 ? STICKER_OFFSET : -STICKER_OFFSET),
      ];
      const rot = baseRot;

      meshes.push(
        <mesh
          key={`${validatedCubie.id}-sticker-${i}`}
          position={pos}
          rotation={rot}
          onClick={(e) => {
            e.stopPropagation();
            onStickerClick(validatedCubie.id, i);
          }}
        >
          <planeGeometry args={[0.9, 0.9]} />
          <meshBasicMaterial
            color={hex}
            side={THREE.DoubleSide}
            transparent={color === 'gray'}
            opacity={color === 'gray' ? 0.3 : 1.0}
            toneMapped={false}
          />
        </mesh>
      );
    }

    return meshes;
  }, [materials, validatedCubie.id, onStickerClick, position]);

  return (
    <group ref={groupRef} key={validatedCubie.id}>
      {/* Main cubie body */}
      <mesh ref={bodyRef} castShadow receiveShadow raycast={() => null}>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color={COLOR_MAP.black} />
      </mesh>

      {/* Visible sticker faces */}
      {stickerMeshes}

      {/* Debug indicator when animating */}
      {shouldAnimate && (
        <mesh position={[0, 0, 0]} raycast={() => null}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="yellow" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}