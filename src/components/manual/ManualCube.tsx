import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Group, Euler } from 'three';
import { useManualCubeStore } from '../../store/manualCubeStore';   // ⬅️ changed
import { ManualCubie } from './ManualCubie';
import { getFaceRotationAxis, getFaceRotationDirection } from '../../utils/rotationUtils';
import { Face, CubeColor } from '../../types/cube';

interface ManualCubeProps {
  onStickerClick: (cubieId: string, faceIndex: number) => void;
  stickerColors: Record<string, CubeColor[]>;
}

function CubeGroup({ onStickerClick, stickerColors }: ManualCubeProps) {
  const groupRef = useRef<Group>(null);
  const animationGroupRef = useRef<Group>(null);

  const {
    cubies,
    isAnimating,
    animatingFace,
    updateCubiePositionsAndMaterials,
    rotationDirection,
    setAnimatingCubies,
  } = useManualCubeStore();   // ⬅️ changed

  const animationStartRef = useRef(0);
  const currentRotationRef = useRef<{ face: Face; clockwise: boolean }>({ face: 'F', clockwise: true });

  const validCubies = React.useMemo(
    () => cubies.filter((c) => c && c.position && c.id),
    [cubies]
  );

  const getCubiesForFace = (face: Face): string[] => {
    const ids: string[] = [];
    for (const c of validCubies) {
      const { x, y, z } = c.position;
      if (
        (face === 'F' && z === 1) ||
        (face === 'B' && z === -1) ||
        (face === 'L' && x === -1) ||
        (face === 'R' && x === 1) ||
        (face === 'U' && y === 1) ||
        (face === 'D' && y === -1)
      ) {
        ids.push(c.id);
      }
    }
    return ids;
  };

  useEffect(() => {
    if (!isAnimating || !animatingFace || !animationGroupRef.current) return;

    let raf = 0;
    const axis = getFaceRotationAxis(animatingFace);
    const clockwise = rotationDirection ?? true;
    currentRotationRef.current = { face: animatingFace, clockwise };

    const faceCubies = getCubiesForFace(animatingFace);
    setAnimatingCubies(faceCubies);
    animationStartRef.current = performance.now();

    const tick = () => {
      const t = Math.min((performance.now() - animationStartRef.current) / 300, 1);
      const dir = getFaceRotationDirection(animatingFace, clockwise);
      const angle = (Math.PI / 2) * dir * t;

      const rot = new Euler();
      if (axis === 'x') rot.x = angle;
      else if (axis === 'y') rot.y = angle;
      else if (axis === 'z') rot.z = angle;

      animationGroupRef.current!.rotation.copy(rot);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        animationGroupRef.current!.rotation.set(0, 0, 0);
        setAnimatingCubies([]);
        updateCubiePositionsAndMaterials(currentRotationRef.current.face, currentRotationRef.current.clockwise);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isAnimating, animatingFace, rotationDirection]);

  return (
    <group ref={groupRef}>
      <group ref={animationGroupRef} />
      {validCubies.map((cubie) => (
        <ManualCubie
          key={cubie.id}
          cubie={cubie}
          animationGroup={animationGroupRef}
          mainGroup={groupRef}
          onStickerClick={onStickerClick}
          stickerColors={stickerColors[cubie.id] ?? ["gray","gray","gray","gray","gray","gray"]}
        />
      ))}
    </group>
  );
}

function Scene({ onStickerClick, stickerColors }: ManualCubeProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} castShadow />
      <directionalLight position={[-8, 8, 8]} intensity={0.8} />
      <directionalLight position={[0, 0, 10]} intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={0.4} />
      <pointLight position={[-5, -5, 5]} intensity={0.4} />

      <CubeGroup onStickerClick={onStickerClick} stickerColors={stickerColors} />

      <OrbitControls enablePan={false} enableZoom enableRotate minDistance={4} maxDistance={20} enableDamping dampingFactor={0.05}/>
    </>
  );
}

export function ManualCube({ onStickerClick, stickerColors }: ManualCubeProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        shadows
        className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 w-full h-full z-0"
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        <Scene onStickerClick={onStickerClick} stickerColors={stickerColors} />
      </Canvas>
    </div>
  );
}
