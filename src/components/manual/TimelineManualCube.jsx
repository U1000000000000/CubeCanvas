// src/components/manual/TimelineManualCube.jsx - FIXED with proper cubie identification and rotation prevention
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Group, Euler, Vector3 } from 'three';
import { useManualCubeStore } from '../../store/manualCubeStore';
import { TimelineManualCubie } from './TimelineManualCubie';
import { getFaceRotationAxis, getFaceRotationDirection } from '../../utils/rotationUtils';

function CameraController({
  currentFrame,
  videoControlEnabled = false,
  orbitControlsRef,
}) {
  const { camera } = useThree();
  const lastFrameTimestampRef = useRef(-1);
  const targetPositionRef = useRef(new Vector3());
  const targetLookAtRef = useRef(new Vector3(0, 0, 0));

  useFrame(() => {
    if (!videoControlEnabled || !currentFrame?.cameraFrame) {
      return;
    }

    const { position, lookAt, progress } = currentFrame.cameraFrame;
    const frameChanged = currentFrame.timestamp !== lastFrameTimestampRef.current;

    if (frameChanged) {
      targetPositionRef.current.copy(position);
      targetLookAtRef.current.copy(lookAt);
      lastFrameTimestampRef.current = currentFrame.timestamp;
    }

    let lerpSpeed = 0.1;
    if (currentFrame.frameType === 'camera_transition') {
      lerpSpeed = 0.25;
    } else if (currentFrame.frameType === 'rotation') {
      lerpSpeed = 0.05;
    }

    camera.position.lerp(targetPositionRef.current, lerpSpeed);

    const currentLookAt = new Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(-1).add(camera.position);
    currentLookAt.lerp(targetLookAtRef.current, lerpSpeed);

    camera.lookAt(currentLookAt);

    if (orbitControlsRef.current) {
      orbitControlsRef.current.target.copy(targetLookAtRef.current);
      if (!orbitControlsRef.current.enabled) {
        orbitControlsRef.current.update();
      }
    }
  });

  return null;
}

function CubeGroup({
  onStickerClick,
  timelineMode = false,
  currentRotationAngle = 0,
  rotatingAxis = null,
  rotatingCubieIds = [],
  currentFrame,
  videoControlEnabled = false,
  orbitControlsRef,
}) {
  const animationGroupRef = useRef(null);
  const cubeGroupRef = useRef(null);

  const { camera } = useThree();
  const {
    cubies,
    isAnimating,
    animatingFace,
    updateCubiePositionsAndMaterials,
    rotationDirection,
    setAnimatingCubies,
  } = useManualCubeStore();

  // Filter out invalid cubies
  const validCubies = React.useMemo(
    () =>
      cubies.filter(
        (c) =>
          c && c.position && c.id && c.materials && c.materials.length === 6
      ),
    [cubies]
  );

  // 🔥 CRITICAL FIX: Prevent manual rotation system from running during timeline mode
  const isTimelineActive = timelineMode && currentFrame?.frameType === 'rotation';

  // FIXED: Timeline rotation handling with exact cubie identification
  useEffect(() => {
    if (!animationGroupRef.current) return;

    if (!timelineMode || !currentFrame) {
      animationGroupRef.current.rotation.set(0, 0, 0);
      return;
    }

    if (currentFrame.frameType === 'rotation' && currentFrame.rotationState.face) {
      const { axis, angle } = currentFrame.rotationState;

      if (axis && animationGroupRef.current) {
        // Reset rotation first
        animationGroupRef.current.rotation.set(0, 0, 0);

        // Apply timeline rotation
        const rotation = new Euler();
        switch (axis) {
          case 'x':
            rotation.x = angle;
            break;
          case 'y':
            rotation.y = angle;
            break;
          case 'z':
            rotation.z = angle;
            break;
        }
        animationGroupRef.current.rotation.copy(rotation);

        // DEBUG: Log the applied rotation
        console.log(`Timeline applying rotation: ${axis} = ${angle} (${(angle * 180 / Math.PI).toFixed(1)}°)`);
      }
    } else {
      // Not a rotation frame, reset rotation
      animationGroupRef.current.rotation.set(0, 0, 0);
    }
  }, [timelineMode, currentFrame]);

  // 🔥 CRITICAL FIX: Manual face rotation animations - DISABLED during timeline mode
  useEffect(() => {
    // PREVENT manual rotation system from running during timeline mode
    if (timelineMode) {
      console.log('Manual rotation DISABLED - timeline mode active');
      return;
    }

    if (!isAnimating || !animatingFace || !animationGroupRef.current) {
      if (animationGroupRef.current) {
        animationGroupRef.current.rotation.set(0, 0, 0);
      }
      return;
    }

    console.log(`Manual rotation ENABLED - ${animatingFace} ${rotationDirection ? 'CW' : 'CCW'}`);

    const axis = getFaceRotationAxis(animatingFace);
    const clockwise = rotationDirection ?? true;

    // Get cubies for this face using the SAME logic as timeline
    const faceCubieIds = validCubies
      .filter(({ position: { x, y, z } }) => {
        switch (animatingFace) {
          case "U":
            return y === 1;
          case "D":
            return y === -1;
          case "L":
            return x === -1;
          case "R":
            return x === 1;
          case "F":
            return z === 1;
          case "B":
            return z === -1;
          default:
            return false;
        }
      })
      .map(c => c.id);

    setAnimatingCubies(faceCubieIds);
    const start = performance.now();

    const tick = () => {
      const t = Math.min((performance.now() - start) / 300, 1);
      const dir = getFaceRotationDirection(animatingFace, clockwise);
      const angle = (Math.PI / 2) * dir * t;
      const rot = new Euler();
      if (axis === 'x') rot.x = angle;
      else if (axis === 'y') rot.y = angle;
      else if (axis === 'z') rot.z = angle;
      animationGroupRef.current.rotation.copy(rot);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        animationGroupRef.current.rotation.set(0, 0, 0);
        setAnimatingCubies([]);

        // Delay state update to prevent flicker
        requestAnimationFrame(() => {
          updateCubiePositionsAndMaterials(animatingFace, clockwise);
        });
      }
    };
    requestAnimationFrame(tick);
  }, [
    timelineMode, // Add this as dependency
    isAnimating,
    animatingFace,
    rotationDirection,
    updateCubiePositionsAndMaterials,
    setAnimatingCubies,
    validCubies,
  ]);

  // DEBUG: Log timeline state changes
  useEffect(() => {
    if (currentFrame?.frameType === 'rotation' && currentFrame?.rotationState.face) {
      console.log('=== TIMELINE ROTATION DEBUG ===');
      console.log('Face:', currentFrame.rotationState.face);
      console.log('Angle:', currentFrame.rotationState.angle, `(${(currentFrame.rotationState.angle * 180 / Math.PI).toFixed(1)}°)`);
      console.log('Progress:', currentFrame.rotationState.progress);
      console.log('Cubie IDs from timeline:', currentFrame.rotationState.cubieIds?.length, 'cubies');
      console.log('Timeline active:', isTimelineActive);
      console.log('Manual rotation blocked:', timelineMode);
    }
  }, [currentFrame, isTimelineActive, timelineMode]);

  return (
    <group ref={cubeGroupRef}>
      <group ref={animationGroupRef} />
      {validCubies.map((cubie) => {
        // 🔥 CRITICAL FIX: Use EXACT matching from timeline cubie IDs
        const isTimelineRotating = Boolean(
          timelineMode &&
            currentFrame?.frameType === 'rotation' &&
            currentFrame?.rotationState.face &&
            currentFrame?.rotationState.cubieIds?.includes(cubie.id)
        );

        // 🔥 CRITICAL FIX: Use EXACT matching for manual rotation (when not in timeline mode)
        const isManualRotating = Boolean(
          !timelineMode &&
            isAnimating &&
            animatingFace &&
            (() => {
              const { x, y, z } = cubie.position;
              switch (animatingFace) {
                case "U":
                  return y === 1;
                case "D":
                  return y === -1;
                case "L":
                  return x === -1;
                case "R":
                  return x === 1;
                case "F":
                  return z === 1;
                case "B":
                  return z === -1;
                default:
                  return false;
              }
            })()
        );

        const shouldRotateWithGroup = isTimelineRotating || isManualRotating;

        // DEBUG: Log rotation assignments
        if (shouldRotateWithGroup) {
          console.log(`Cubie ${cubie.id} will rotate with group (${isTimelineRotating ? 'timeline' : 'manual'})`);
        }

        return (
          <TimelineManualCubie
            key={cubie.id}
            cubie={cubie}
            animationGroup={animationGroupRef}
            mainGroup={cubeGroupRef}
            onStickerClick={onStickerClick}
            isTimelineRotating={shouldRotateWithGroup}
          />
        );
      })}

      <CameraController
        currentFrame={currentFrame}
        videoControlEnabled={videoControlEnabled}
        orbitControlsRef={orbitControlsRef}
      />
    </group>
  );
}

function Scene({
  onStickerClick,
  timelineMode,
  currentRotationAngle,
  rotatingAxis,
  rotatingCubieIds,
  currentFrame,
  videoControlEnabled,
  orbitControlsRef,
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <directionalLight position={[-8, 8, 8]} intensity={0.8} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />

      <CubeGroup
        onStickerClick={onStickerClick}
        timelineMode={timelineMode}
        currentRotationAngle={currentRotationAngle}
        rotatingAxis={rotatingAxis}
        rotatingCubieIds={rotatingCubieIds}
        currentFrame={currentFrame}
        videoControlEnabled={videoControlEnabled}
        orbitControlsRef={orbitControlsRef}
      />

      <OrbitControls
        ref={orbitControlsRef}
        enabled={timelineMode ? !videoControlEnabled : true}
        enableDamping={true}
        dampingFactor={0.1}
        rotateSpeed={0.8}
        zoomSpeed={0}
        panSpeed={0.8}
        maxDistance={15}
        minDistance={8}
        enableZoom={false}
        enablePan={timelineMode ? !videoControlEnabled : true}
        enableRotate={timelineMode ? !videoControlEnabled : true}
      />
    </>
  );
}

export function TimelineManualCube({
  onStickerClick,
  timelineMode = false,
  currentRotationAngle = 0,
  rotatingAxis = null,
  rotatingCubieIds = [],
  currentFrame = null,
  videoControlEnabled = false,
}) {
  const orbitControlsRef = useRef(null);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [5, 5, 5],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        shadows
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Scene
          onStickerClick={onStickerClick}
          timelineMode={timelineMode}
          currentRotationAngle={currentRotationAngle}
          rotatingAxis={rotatingAxis}
          rotatingCubieIds={rotatingCubieIds}
          currentFrame={currentFrame}
          videoControlEnabled={videoControlEnabled}
          orbitControlsRef={orbitControlsRef}
        />
      </Canvas>
    </div>
  );
}