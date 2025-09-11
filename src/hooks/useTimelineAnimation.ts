import { useEffect, useRef, useCallback, useState } from "react";
import { useManualCubeStore } from "../store/manualCubeStore";
import { parseMoves } from "../utils/simpleSolver";
import { Move, CubieState, Face, CubeColor } from "../types/cube";
import { Vector3, Spherical } from "three";

// --- ENHANCED ANIMATION SETTINGS FOR SMOOTH 60FPS ---
const ENHANCED_ANIMATION_CONFIG = {
  framesPerMove: 60,
  cameraTransitionFrames: 30,
  useEasing: true,
  rotationDuration: 1000,
  cameraTransitionDuration: 500,
};

// Professional easing functions for smooth animations
const EASING_FUNCTIONS = {
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  easeOutQuart: (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  },
  easeInOutQuint: (t: number): number => {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
  },
};

// Animation quality presets
const QUALITY_PRESETS = {
  low: { framesPerMove: 12, cameraTransitionFrames: 12 },
  medium: { framesPerMove: 30, cameraTransitionFrames: 20 },
  high: { framesPerMove: 60, cameraTransitionFrames: 30 },
  ultra: { framesPerMove: 90, cameraTransitionFrames: 45 },
};

// Cube rotation presets for each face
const CUBE_ROTATIONS: Record<Face, { x: number; y: number; z: number }> = {
  F: { x: 0, y: 0, z: 0 },
  B: { x: 0, y: Math.PI, z: 0 },
  R: { x: 0, y: Math.PI / 2, z: 0 },
  L: { x: 0, y: -Math.PI / 2, z: 0 },
  U: { x: Math.PI / 2, y: 0, z: 0 },
  D: { x: -Math.PI / 2, y: 0, z: 0 },
};

// --- Types ---
interface CameraFrame {
  position: Vector3;
  lookAt: Vector3;
  progress: number;
}

interface CubeRotationFrame {
  progress: number;
  targetRotation: { x: number; y: number; z: number };
  currentRotation: { x: number; y: number; z: number };
}

interface TimelineFrame {
  timestamp: number;
  moveIndex: number;
  logicalMoveIndex: number;
  frameType: "camera_transition" | "rotation" | "idle";
  rotationState: {
    face: Face | null;
    axis: "x" | "y" | "z" | null;
    angle: number;
    progress: number;
    cubieIds: string[];
    easedProgress?: number;
  };
  cameraFrame?: CameraFrame;
  cubeRotation?: CubeRotationFrame;
  cubeState: CubieState[];
}

interface UseTimelineAnimationOptions {
  solution: string;
  onComplete?: () => void;
  onStart?: () => void;
  enabled?: boolean;
  animationQuality?: "low" | "medium" | "high" | "ultra";
  customFramesPerMove?: number;
  customCameraFrames?: number;
  enableEasing?: boolean;
}

interface TimelineAnimationState {
  isActive: boolean;
  currentFrame: TimelineFrame | null;
  totalFrames: number;
  progress: number;
  currentMoveIndex: number;
  totalMoves: number;
  isAtStart: boolean;
  isAtEnd: boolean;
  currentLogicalMoveIndex: number;
}

// --- Constants ---
const CAMERA_DISTANCE = 10;
const FACE_CAMERA_POSITIONS: Record<Face, Vector3> = {
  F: new Vector3(2, 2, CAMERA_DISTANCE),
  B: new Vector3(-2, 2, -CAMERA_DISTANCE),
  R: new Vector3(CAMERA_DISTANCE, 2, 2),
  L: new Vector3(-CAMERA_DISTANCE, 2, -2),
  U: new Vector3(3, CAMERA_DISTANCE, 3),
  D: new Vector3(-3, -CAMERA_DISTANCE, 3),
};
const INITIAL_CAMERA_POSITION = new Vector3(5, 5, 5);
const EPS = 1e-2;

// --- Helpers ---
function getFaceRotationAxis(face: Face): "x" | "y" | "z" {
  switch (face) {
    case "U":
    case "D":
      return "y";
    case "L":
    case "R":
      return "x";
    case "F":
    case "B":
      return "z";
  }
}

// 🔥 CRITICAL FIX: Match the exact rotation direction logic from rotationUtils.ts
function getFaceRotationDirection(face: Face, clockwise: boolean): number {
  const baseDirection = clockwise ? 1 : -1;

  switch (face) {
    case "L":
      return -baseDirection;

    case "B":
      return clockwise ? -1 : 1;

    case "D":
      return clockwise ? -1 : 1;

    case "U":
    case "R":
    case "F":
    default:
      return baseDirection;
  }
}

function getCubiesOnFace(cubies: CubieState[], face: Face): string[] {
  return cubies
    .filter(({ position: { x, y, z } }) => {
      const rx = Math.round(x);
      const ry = Math.round(y);
      const rz = Math.round(z);
      switch (face) {
        case "U":
          return ry === 1;
        case "D":
          return ry === -1;
        case "L":
          return rx === -1;
        case "R":
          return rx === 1;
        case "F":
          return rz === 1;
        case "B":
          return rz === -1;
        default:
          return false;
      }
    })
    .map((c) => c.id);
}

function expandMoves(moves: Move[]): Move[] {
  const out: Move[] = [];
  for (const m of moves) {
    if (m.double) {
      out.push({ face: m.face, clockwise: m.clockwise, double: false });
      out.push({ face: m.face, clockwise: m.clockwise, double: false });
    } else {
      out.push(m);
    }
  }
  return out;
}

function rotatePositionPure(
  pos: { x: number; y: number; z: number },
  axis: "x" | "y" | "z",
  clockwise: boolean
) {
  const { x, y, z } = pos;
  if (axis === "x") {
    return clockwise ? { x, y: -z, z: y } : { x, y: z, z: -y };
  } else if (axis === "y") {
    return clockwise ? { x: z, y, z: -x } : { x: -z, y, z: x };
  } else {
    return clockwise ? { x: -y, y: x, z } : { x: y, y: -x, z };
  }
}

function rotateMaterialsPure(
  axis: "x" | "y" | "z",
  materials: CubeColor[],
  clockwise = true
): CubeColor[] {
  if (!materials || materials.length !== 6) {
    return materials || ["gray", "gray", "gray", "gray", "gray", "gray"];
  }

  const m = [...materials];

  if (axis === "x") {
    if (clockwise) {
      const t = m[2];
      m[2] = m[5];
      m[5] = m[3];
      m[3] = m[4];
      m[4] = t;
    } else {
      const t = m[2];
      m[2] = m[4];
      m[4] = m[3];
      m[3] = m[5];
      m[5] = t;
    }
  } else if (axis === "y") {
    if (clockwise) {
      const t = m[0];
      m[0] = m[4];
      m[4] = m[1];
      m[1] = m[5];
      m[5] = t;
    } else {
      const t = m[0];
      m[0] = m[5];
      m[5] = m[1];
      m[1] = m[4];
      m[4] = t;
    }
  } else if (axis === "z") {
    if (clockwise) {
      const t = m[0];
      m[0] = m[3];
      m[3] = m[1];
      m[1] = m[2];
      m[2] = t;
    } else {
      const t = m[0];
      m[0] = m[2];
      m[2] = m[1];
      m[1] = m[3];
      m[3] = t;
    }
  }

  return m;
}

// 🔥 CRITICAL FIX: Use the same rotation direction calculation as manual store
function applyMovePure(cubies: CubieState[], move: Move): CubieState[] {
  const axis = getFaceRotationAxis(move.face);
  const rotationCount = move.double ? 2 : 1;

  let result = cubies.map((c) => ({
    ...c,
    materials: [...c.materials],
    position: { ...c.position },
  }));

  for (let i = 0; i < rotationCount; i++) {
    result = result.map((cubie) => {
      const { x, y, z } = cubie.position;
      const isRotating =
        (move.face === "U" && Math.round(y) === 1) ||
        (move.face === "D" && Math.round(y) === -1) ||
        (move.face === "L" && Math.round(x) === -1) ||
        (move.face === "R" && Math.round(x) === 1) ||
        (move.face === "F" && Math.round(z) === 1) ||
        (move.face === "B" && Math.round(z) === -1);

      if (!isRotating) return cubie;

      // 🔥 Use getFaceRotationDirection to decide
      const dir = getFaceRotationDirection(move.face, move.clockwise);
      const actualClockwise = dir === 1;

      const newPosition = rotatePositionPure(
        cubie.position,
        axis,
        actualClockwise
      );
      const newMaterials = rotateMaterialsPure(
        axis,
        cubie.materials,
        actualClockwise
      );

      return {
        ...cubie,
        position: {
          x: Math.round(newPosition.x),
          y: Math.round(newPosition.y),
          z: Math.round(newPosition.z),
        },
        materials: newMaterials,
      };
    });
  }

  return result;
}

function parseMoves(solution: string): Move[] {
  const moves: Move[] = [];
  const tokens = solution.trim().split(/\s+/);

  for (const token of tokens) {
    if (!token) continue;

    const face = token[0] as Face;
    const isPrime = token.includes("'");
    const isDouble = token.includes("2");

    if (!["U", "D", "L", "R", "F", "B"].includes(face)) {
      console.warn(`Invalid face in move: ${token}`);
      continue;
    }

    moves.push({
      face,
      clockwise: isPrime,
      double: isDouble,
    });
  }

  return moves;
}

// Spherical interpolation for smoother camera movement
const sphericalInterpolation = (
  start: Vector3,
  end: Vector3,
  progress: number
): Vector3 => {
  const startSpherical = new Spherical().setFromVector3(start);
  const endSpherical = new Spherical().setFromVector3(end);

  const interpolatedSpherical = new Spherical(
    startSpherical.radius +
      (endSpherical.radius - startSpherical.radius) * progress,
    startSpherical.phi + (endSpherical.phi - startSpherical.phi) * progress,
    startSpherical.theta +
      (endSpherical.theta - startSpherical.theta) * progress
  );

  return new Vector3().setFromSpherical(interpolatedSpherical);
};

// --- Enhanced Timeline Generation ---
function generateEnhancedTimelineFrames(
  moves: Move[],
  startState: CubieState[],
  logicalToAtomic: number[],
  options: {
    framesPerMove: number;
    cameraTransitionFrames: number;
    enableEasing: boolean;
  }
): TimelineFrame[] {
  const frames: TimelineFrame[] = [];
  let currentCameraPosition = INITIAL_CAMERA_POSITION.clone();
  let currentCubeRotation = { x: 0, y: 0, z: 0 };

  const cubeStates: CubieState[][] = [
    startState.map((c) => ({
      ...c,
      materials: [...c.materials],
      position: { ...c.position },
    })),
  ];

  let currentState = startState.map((c) => ({
    ...c,
    materials: [...c.materials],
    position: { ...c.position },
  }));

  for (const move of moves) {
    currentState = applyMovePure(currentState, { ...move, double: false });
    cubeStates.push(
      currentState.map((c) => ({
        ...c,
        materials: [...c.materials],
        position: { ...c.position },
      }))
    );
  }

  let totalFrameCount = 1;
  for (const _ of moves) {
    totalFrameCount += options.cameraTransitionFrames + options.framesPerMove;
  }

  console.log(
    `🎬 Enhanced Timeline: ${totalFrameCount} frames for ${moves.length} moves (${options.framesPerMove} frames per move)`
  );

  // Track logical move progress
  let logicalIndex = 0;
  let logicalProgress = 0;

  // Initial idle frame
  frames.push({
    timestamp: 0,
    moveIndex: 0,
    logicalMoveIndex: 0,
    frameType: "idle",
    rotationState: {
      face: null,
      axis: null,
      angle: 0,
      progress: 0,
      cubieIds: [],
      easedProgress: 0,
    },
    cameraFrame: {
      position: currentCameraPosition.clone(),
      lookAt: new Vector3(0, 0, 0),
      progress: 0,
    },
    cubeRotation: {
      progress: 0,
      targetRotation: { x: 0, y: 0, z: 0 },
      currentRotation: { x: 0, y: 0, z: 0 },
    },
    cubeState: cubeStates[0].map((c) => ({ ...c })),
  });

  let currentFrameIndex = 1;
  let lastFace: Face | null = null;

  for (let moveIndex = 0; moveIndex < moves.length; moveIndex++) {
    const move = moves[moveIndex];
    const axis = getFaceRotationAxis(move.face);
    const targetCameraPosition = FACE_CAMERA_POSITIONS[move.face];
    const targetCubeRotation = CUBE_ROTATIONS[move.face];

    const baseCubeState = cubeStates[moveIndex];
    const finalCubeState = cubeStates[moveIndex + 1];
    const faceCubieIds = getCubiesOnFace(baseCubeState, move.face);
    const shouldTransition = lastFace !== move.face || moveIndex === 0;

    if (shouldTransition) {
      for (let f = 1; f <= options.cameraTransitionFrames; f++) {
        const rawProgress = f / options.cameraTransitionFrames;
        const timestamp = currentFrameIndex / (totalFrameCount - 1);

        // Apply easing for smooth camera movement
        const easedProgress = options.enableEasing
          ? EASING_FUNCTIONS.easeOutQuart(rawProgress)
          : rawProgress;

        // Use spherical interpolation for smoother camera movement
        const interpolatedCamera = sphericalInterpolation(
          currentCameraPosition,
          targetCameraPosition,
          easedProgress
        );

        // Apply easing for cube rotation
        const cubeRotationProgress = options.enableEasing
          ? EASING_FUNCTIONS.easeInOutQuint(rawProgress)
          : rawProgress;

        const interpolatedCubeRotation = {
          x:
            currentCubeRotation.x +
            (targetCubeRotation.x - currentCubeRotation.x) *
              cubeRotationProgress,
          y:
            currentCubeRotation.y +
            (targetCubeRotation.y - currentCubeRotation.y) *
              cubeRotationProgress,
          z:
            currentCubeRotation.z +
            (targetCubeRotation.z - currentCubeRotation.z) *
              cubeRotationProgress,
        };

        frames.push({
          timestamp,
          moveIndex: moveIndex + 1,
          logicalMoveIndex: logicalIndex,
          frameType: "camera_transition",
          rotationState: {
            face: null,
            axis: null,
            angle: 0,
            progress: 0,
            cubieIds: [],
            easedProgress: 0,
          },
          cameraFrame: {
            position: interpolatedCamera,
            lookAt: new Vector3(0, 0, 0),
            progress: easedProgress,
          },
          cubeRotation: {
            progress: cubeRotationProgress,
            targetRotation: targetCubeRotation,
            currentRotation: interpolatedCubeRotation,
          },
          cubeState: baseCubeState.map((c) => ({ ...c })),
        });
        currentFrameIndex++;
      }
      currentCameraPosition = targetCameraPosition.clone();
      currentCubeRotation = { ...targetCubeRotation };
      lastFace = move.face;
    }

    // Enhanced rotation frames with smooth easing
    const totalAngle =
      (Math.PI / 2) * getFaceRotationDirection(move.face, move.clockwise);

    console.log(
      `🔥 Timeline ${move.face}${
        move.clockwise ? "" : "'"
      }: direction=${getFaceRotationDirection(
        move.face,
        move.clockwise
      )}, angle=${totalAngle}`
    );

    for (let f = 1; f <= options.framesPerMove; f++) {
      const rawProgress = f / options.framesPerMove;
      const timestamp = currentFrameIndex / (totalFrameCount - 1);

      // Apply easing for smooth rotation
      const easedProgress = options.enableEasing
        ? EASING_FUNCTIONS.easeInOutCubic(rawProgress)
        : rawProgress;

      const angle = totalAngle * easedProgress;
      const isLastFrame = f === options.framesPerMove;
      const frameState = isLastFrame ? finalCubeState : baseCubeState;
      const frameAngle = isLastFrame ? 0 : angle;

      frames.push({
        timestamp,
        moveIndex: moveIndex + 1,
        logicalMoveIndex: logicalIndex,
        frameType: "rotation",
        rotationState: {
          face: move.face,
          axis,
          angle: frameAngle,
          progress: rawProgress,
          cubieIds: faceCubieIds,
          easedProgress: easedProgress,
        },
        cameraFrame: {
          position: currentCameraPosition.clone(),
          lookAt: new Vector3(0, 0, 0),
          progress: 1,
        },
        cubeRotation: {
          progress: 1,
          targetRotation: targetCubeRotation,
          currentRotation: currentCubeRotation,
        },
        cubeState: frameState.map((c) => ({ ...c })),
      });
      currentFrameIndex++;
    }

    // Update logical move tracking
    logicalProgress++;
    if (logicalProgress >= logicalToAtomic[logicalIndex]) {
      logicalIndex++;
      logicalProgress = 0;
    }
  }

  console.log(`✅ Generated ${frames.length} smooth animation frames`);
  return frames;
}

// --- Hook ---
export function useTimelineAnimation({
  solution,
  onComplete,
  onStart,
  enabled = false,
  animationQuality = "high",
  customFramesPerMove,
  customCameraFrames,
  enableEasing = true,
}: UseTimelineAnimationOptions) {
  const [isActive, setIsActive] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [frames, setFrames] = useState<TimelineFrame[]>([]);
  const [initialState, setInitialState] = useState<CubieState[]>([]);

  const timelineRef = useRef(0);
  const targetTimestampRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const movesRef = useRef<Move[]>([]);
  const logicalToAtomicRef = useRef<number[]>([]);

  const animationSettings = {
    framesPerMove:
      customFramesPerMove || QUALITY_PRESETS[animationQuality].framesPerMove,
    cameraTransitionFrames:
      customCameraFrames ||
      QUALITY_PRESETS[animationQuality].cameraTransitionFrames,
    enableEasing: enableEasing,
  };

  console.log(`🎬 Timeline Animation Settings:`, {
    quality: animationQuality,
    framesPerMove: animationSettings.framesPerMove,
    cameraFrames: animationSettings.cameraTransitionFrames,
    easing: animationSettings.enableEasing,
  });

  useEffect(() => {
    if (!solution || !solution.trim()) {
      setFrames([]);
      setInitialState([]);
      movesRef.current = [];
      logicalToAtomicRef.current = [];
      return;
    }

    const { cubies } = useManualCubeStore.getState();
    const startState = cubies.map((c) => ({
      ...c,
      materials: [...c.materials],
      position: { ...c.position },
    }));
    setInitialState(startState);

    try {
      const parsedMoves = parseMoves(solution);
      const atomicMoves = expandMoves(parsedMoves);
      movesRef.current = atomicMoves;

      // NEW: Keep logical-to-atomic mapping
      const logicalToAtomic: number[] = [];
      parsedMoves.forEach((move) => {
        if (move.double) {
          logicalToAtomic.push(2); // 2 atomic moves for U2
        } else {
          logicalToAtomic.push(1);
        }
      });
      logicalToAtomicRef.current = logicalToAtomic;

      const generatedFrames = generateEnhancedTimelineFrames(
        atomicMoves,
        startState,
        logicalToAtomic,
        animationSettings
      );

      setFrames(generatedFrames);
      setCurrentTimestamp(0);
      targetTimestampRef.current = 0;
      timelineRef.current = 0;

      const estimatedDuration = (generatedFrames.length / 60).toFixed(1);
      console.log(
        `🎬 Enhanced Timeline: ${generatedFrames.length} frames (~${estimatedDuration}s at 60fps)`
      );
    } catch (err) {
      console.error("Timeline init failed:", err);
      setFrames([]);
    }
  }, [
    solution,
    animationSettings.framesPerMove,
    animationSettings.cameraTransitionFrames,
    animationSettings.enableEasing,
  ]);

  const handleScroll = useCallback(
    (e: WheelEvent) => {
      if (!enabled || !isActive || !frames.length) return;
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY * 0.0005;
      const newT = Math.max(0, Math.min(1, targetTimestampRef.current + delta));
      targetTimestampRef.current = newT;

      if (newT >= 1 && onComplete) {
        setTimeout(onComplete, 100);
      }
    },
    [enabled, isActive, frames.length, onComplete]
  );

  useEffect(() => {
    if (!isActive) return;
    const animate = () => {
      const current = timelineRef.current;
      const target = targetTimestampRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.002) {
        timelineRef.current += diff * 0.08;
        setCurrentTimestamp(timelineRef.current);
      } else if (Math.abs(diff) > 0.0005) {
        timelineRef.current = target;
        setCurrentTimestamp(target);
      }

      if (isActive) animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isActive]);

  const getCurrentFrame = useCallback(
    (timestamp: number): TimelineFrame | null => {
      if (!frames.length) return null;
      const t = Math.max(0, Math.min(1, timestamp));

      // Find the frame closest to the current timestamp
      let closestFrame = frames[0];
      let minDiff = Math.abs(frames[0].timestamp - t);

      for (let i = 1; i < frames.length; i++) {
        const diff = Math.abs(frames[i].timestamp - t);
        if (diff < minDiff) {
          minDiff = diff;
          closestFrame = frames[i];
        }
      }

      return closestFrame;
    },
    [frames]
  );

  const applyCubeState = useCallback(
    (timestamp: number) => {
      const currentFrame = getCurrentFrame(timestamp);
      if (!currentFrame) return;

      const stateUpdate = {
        cubies: currentFrame.cubeState.map((c) => ({ ...c })),
        isAnimating:
          currentFrame.frameType === "rotation" &&
          currentFrame.rotationState.progress < 1,
        animatingFace: currentFrame.rotationState.face,
        animatingCubies: currentFrame.rotationState.cubieIds,
        rotationDirection:
          currentFrame.frameType === "rotation"
            ? movesRef.current[currentFrame.moveIndex - 1]?.clockwise
            : undefined,
        cubeRotation: currentFrame.cubeRotation?.currentRotation || {
          x: 0,
          y: 0,
          z: 0,
        },
      };

      useManualCubeStore.setState(stateUpdate);
    },
    [getCurrentFrame]
  );

  useEffect(() => {
    if (isActive) {
      applyCubeState(currentTimestamp);
    }
  }, [currentTimestamp, isActive, applyCubeState]);

  useEffect(() => {
    if (!enabled || !isActive) return;
    const handleWheel = (ev: WheelEvent) => handleScroll(ev);
    document.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });
    return () =>
      document.removeEventListener("wheel", handleWheel, { capture: true });
  }, [enabled, isActive, handleScroll]);

  const startTimeline = useCallback(() => {
    if (!frames.length) return;
    setCurrentTimestamp(0);
    timelineRef.current = 0;
    targetTimestampRef.current = 0;
    if (initialState.length > 0) {
      useManualCubeStore.setState({
        cubies: initialState.map((c) => ({ ...c })),
        isAnimating: false,
        animatingFace: null,
        animatingCubies: [],
        cubeRotation: { x: 0, y: 0, z: 0 },
      });
    }
    setIsActive(true);
    onStart?.();
  }, [frames.length, onStart, initialState]);

  const stopTimeline = useCallback(() => {
    setIsActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    applyCubeState(targetTimestampRef.current);
  }, [applyCubeState]);

  const resetTimeline = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    setCurrentTimestamp(0);
    timelineRef.current = 0;
    targetTimestampRef.current = 0;
    setIsActive(false);
    if (initialState.length > 0) {
      useManualCubeStore.setState({
        cubies: initialState.map((c) => ({ ...c })),
        isAnimating: false,
        animatingFace: null,
        animatingCubies: [],
        rotationDirection: undefined,
        cubeRotation: { x: 0, y: 0, z: 0 },
      });
    }
  }, [initialState]);

  const jumpToTimestamp = useCallback(
    (t: number) => {
      const clampedT = Math.max(0, Math.min(1, t));
      targetTimestampRef.current = clampedT;
      if (clampedT >= 1) {
        setTimeout(() => {
          if (isActive) setIsActive(false);
        }, 50);
      }
    },
    [isActive]
  );

  const SCRUB_SPEED = 0.01; // Controls how fast the timeline moves when scrolling. Adjust if needed.

  const scrubTimeline = useCallback(
    (direction: "forward" | "reverse") => {
      if (!isActive) return;

      const delta = direction === "forward" ? SCRUB_SPEED : -SCRUB_SPEED;
      const newTarget = targetTimestampRef.current + delta;

      // Clamp the new target between 0 and 1 to prevent going out of bounds
      targetTimestampRef.current = Math.max(0, Math.min(1, newTarget));
    },
    [isActive] // Dependency array ensures the function has the current `isActive` state
  );  

  const currentFrame = getCurrentFrame(currentTimestamp);
  const totalMoves = movesRef.current.length;
  const progress = currentTimestamp * 100;
  const currentMoveIndex = currentFrame?.moveIndex || 0;
  const currentLogicalMoveIndex = currentFrame?.logicalMoveIndex || 0;
  const isAtStart = currentTimestamp <= 0;
  const isAtEnd = currentTimestamp >= 1;

  const state: TimelineAnimationState = {
    isActive,
    currentFrame,
    totalFrames: frames.length,
    progress,
    currentMoveIndex,
    totalMoves,
    isAtStart,
    isAtEnd,
    currentLogicalMoveIndex,
  };

  return {
    state,
    startTimeline,
    stopTimeline,
    resetTimeline,
    jumpToTimestamp,
    scrubTimeline, 
    currentTimestamp,
    targetTimestamp: targetTimestampRef.current,
    frames,
  };
}