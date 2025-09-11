import React, { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Github } from "lucide-react";
import { useLocation } from "react-router-dom";
import { BackgroundParticles } from "../components/manual/BackgroundParticles";

const VIBRANT_COLORS = [
  "#FF6B35",
  "#F7931E",
  "#FFD23F",
  "#06FFA5",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
];

// Hook to get screen size
function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenSize;
}

// Cubie component with responsive sizing
function Cubie({ position, targetPosition, delay, index, cubeScale, skipAnimation }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [phase, setPhase] = useState(skipAnimation ? "assembled" : "scattered");
  const [hasClicked, setHasClicked] = useState(skipAnimation);
  const [hovered, setHovered] = useState(false);

  // Random "black" color for orbiting phase
  const orbitColor = useMemo(() => {
    const randIndex = Math.floor(Math.random() * VIBRANT_COLORS.length);
    return VIBRANT_COLORS[randIndex];
  }, []);

  // Stickers logic with responsive sizing
  const stickers = useMemo(() => {
    const stickerMeshes = [];
    const STICKER_OFFSET = 0.52 * cubeScale;
    const [x, y, z] = targetPosition;
    const faceColors = [
      "#C41E3A", // +X
      "#FF8C00", // -X
      "#FFFFFF", // +Y
      "#FFD700", // -Y
      "#228B22", // +Z
      "#0057B8", // -Z
    ];
    const BASE_FACE_POS = [
      [0.5, 0, 0],
      [-0.5, 0, 0],
      [0, 0.5, 0],
      [0, -0.5, 0],
      [0, 0, 0.5],
      [0, 0, -0.5],
    ];
    const BASE_FACE_ROT = [
      [0, -Math.PI / 2, 0],
      [0, Math.PI / 2, 0],
      [-Math.PI / 2, 0, 0],
      [Math.PI / 2, 0, 0],
      [0, 0, 0],
      [0, Math.PI, 0],
    ];

    const isFaceVisible = (faceIndex, x, y, z) => {
      const threshold = 0.4 * cubeScale;
      if (faceIndex === 0 && x > threshold) return true;
      if (faceIndex === 1 && x < -threshold) return true;
      if (faceIndex === 2 && y > threshold) return true;
      if (faceIndex === 3 && y < -threshold) return true;
      if (faceIndex === 4 && z > threshold) return true;
      if (faceIndex === 5 && z < -threshold) return true;
      return false;
    };

    for (let i = 0; i < 6; i++) {
      if (!isFaceVisible(i, x, y, z)) continue;

      const basePos = BASE_FACE_POS[i];
      const baseRot = BASE_FACE_ROT[i];

      const pos = [
        basePos[0] === 0
          ? 0
          : basePos[0] > 0
          ? STICKER_OFFSET
          : -STICKER_OFFSET,
        basePos[1] === 0
          ? 0
          : basePos[1] > 0
          ? STICKER_OFFSET
          : -STICKER_OFFSET,
        basePos[2] === 0
          ? 0
          : basePos[2] > 0
          ? STICKER_OFFSET
          : -STICKER_OFFSET,
      ];

      stickerMeshes.push({
        position: pos,
        rotation: baseRot,
        color: faceColors[i],
        size: 0.9 * cubeScale,
      });
    }

    return stickerMeshes;
  }, [targetPosition, cubeScale]);

  const scatterPos = useMemo(() => {
    if (skipAnimation) return targetPosition;
    
    const angle = Math.random() * Math.PI * 2;
    const radius = (12 + Math.random() * 8) * cubeScale;
    return [
      Math.cos(angle) * radius + (Math.random() - 0.5) * 5 * cubeScale,
      (Math.random() - 0.5) * 15 * cubeScale,
      Math.sin(angle) * radius + (Math.random() - 0.5) * 5 * cubeScale,
    ];
  }, [cubeScale, skipAnimation, targetPosition]);

  const orbitParams = useMemo(
    () => ({
      rx: (8 + Math.random() * 6) * cubeScale,
      rz: (8 + Math.random() * 6) * cubeScale,
      speed: 0.3 + Math.random() * 0.4,
      angleOffset: Math.random() * Math.PI * 2,
      yOffset: (Math.random() - 0.5) * 6 * cubeScale,
    }),
    [index, cubeScale]
  );

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;
    
    if (skipAnimation) {
      // Skip animation and just handle hover effects
      const time = state.clock.elapsedTime;
      
      // Wiggle effect when hovered in assembled phase
      if (hovered) {
        const wiggleAmplitude = 0.1 * cubeScale;
        meshRef.current.position.x =
          targetPosition[0] + Math.sin(time * 10 + index) * wiggleAmplitude;
        meshRef.current.position.y =
          targetPosition[1] + Math.cos(time * 12 + index) * wiggleAmplitude;
      } else {
        meshRef.current.position.set(...targetPosition);
      }
      
      // Set to black when assembled
      meshRef.current.material.color.set("#000");
      return;
    }
    
    const time = state.clock.elapsedTime;
    const animTime = time - delay;

    if (animTime < 0) {
      meshRef.current.position.set(...scatterPos);
      return;
    }

    if (animTime < 5) {
      if (phase !== "orbiting") setPhase("orbiting");
      const t = animTime / 5;
      const easeT = 1 - Math.pow(1 - t, 3);
      const growthFactor = Math.sin(Math.PI * easeT);

      const currentRx =
        scatterPos[0] * (1 - growthFactor) +
        orbitParams.rx * growthFactor * 0.6;
      const currentRz =
        scatterPos[2] * (1 - growthFactor) +
        orbitParams.rz * growthFactor * 0.6;
      const currentY =
        scatterPos[1] * (1 - growthFactor) + orbitParams.yOffset * growthFactor;

      const angle = orbitParams.angleOffset + animTime * orbitParams.speed;

      meshRef.current.position.x = Math.cos(angle) * currentRx;
      meshRef.current.position.z = Math.sin(angle) * currentRz;
      meshRef.current.position.y = currentY;

      meshRef.current.rotation.x = animTime * 2;
      meshRef.current.rotation.y = animTime * 3;
      meshRef.current.rotation.z = animTime * 1.5;

      // Set vibrant color while orbiting
      meshRef.current.material.color.set(orbitColor);
    } else if (animTime >= 5 && animTime < 7) {
      if (phase !== "assembling") setPhase("assembling");
      const t = (animTime - 5) / 2;
      const easeT = 1 - Math.pow(2, -10 * t);
      meshRef.current.position.lerp(
        new THREE.Vector3(...targetPosition),
        easeT
      );
      meshRef.current.rotation.x *= 1 - easeT;
      meshRef.current.rotation.y *= 1 - easeT;
      meshRef.current.rotation.z *= 1 - easeT;
    } else {
      if (phase !== "assembled") {
        setPhase("assembled");
        setHasClicked(true);
        meshRef.current.position.set(...targetPosition);
        meshRef.current.rotation.set(0, 0, 0);
        meshRef.current.scale.setScalar(1);
      }

      // Wiggle effect when hovered in assembled phase
      if (hovered) {
        const wiggleAmplitude = 0.1 * cubeScale;
        meshRef.current.position.x =
          targetPosition[0] + Math.sin(time * 10 + index) * wiggleAmplitude;
        meshRef.current.position.y =
          targetPosition[1] + Math.cos(time * 12 + index) * wiggleAmplitude;
      } else {
        meshRef.current.position.set(...targetPosition);
      }

      // Revert to black when assembled
      meshRef.current.material.color.set("#000");

      if (hasClicked && animTime < 7.2) {
        const clickT = (animTime - 7) / 0.2;
        const clickScale = 1 + Math.sin(clickT * Math.PI) * 0.03;
        meshRef.current.scale.setScalar(clickScale);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const cubeSize = 0.98 * cubeScale;

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={skipAnimation ? targetPosition : scatterPos}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshLambertMaterial color={skipAnimation ? "#000" : orbitColor} />
        {stickers.map((sticker, idx) => (
          <mesh
            key={idx}
            position={sticker.position}
            rotation={sticker.rotation}
          >
            <planeGeometry args={[sticker.size, sticker.size]} />
            <meshBasicMaterial
              color={sticker.color}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        ))}
      </mesh>
    </group>
  );
}

// Camera controller with responsive positioning
function CameraController({ screenSize, skipAnimation }) {
  const { camera } = useThree();

  const getCameraSettings = () => {
    const isMobile = screenSize.width < 768;
    const isTablet = screenSize.width >= 768 && screenSize.width < 1024;

    if (isMobile) {
      return {
        finalZ: 16,
        finalX: 4,
        finalY: 4,
        initialZ: 25,
      };
    } else if (isTablet) {
      return {
        finalZ: 13,
        finalX: 3.5,
        finalY: 3.8,
        initialZ: 22,
      };
    } else {
      return {
        finalZ: 10,
        finalX: 3,
        finalY: 3.5,
        initialZ: 20,
      };
    }
  };

  useFrame((state) => {
    if (skipAnimation) {
      const settings = getCameraSettings();
      camera.position.set(settings.finalX, settings.finalY, settings.finalZ);
      camera.lookAt(0, 0, 0);
      return;
    }
    
    const time = state.clock.elapsedTime;
    const settings = getCameraSettings();

    if (time < 7) {
      const t = Math.min(time / 7, 1);
      const easeT = 1 - Math.pow(1 - t, 3);
      camera.position.z =
        settings.initialZ - easeT * (settings.initialZ - settings.finalZ);
      camera.position.x =
        (1 - easeT) * Math.sin(time * 0.15) * 4 + easeT * settings.finalX;
      camera.position.y = 5 - easeT * (5 - settings.finalY);
    } else {
      camera.position.x = settings.finalX;
      camera.position.y = settings.finalY;
      camera.position.z = settings.finalZ;
    }
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// Cube Assembly with responsive scaling
function CubeAssembly({ cubeScale, skipAnimation }) {
  const groupRef = useRef();
  const cubies = useMemo(() => {
    const cubieList = [];
    let index = 0;
    const spacing = 1.0 * cubeScale;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          cubieList.push({
            id: index,
            position: [x * spacing, y * spacing, z * spacing],
            delay: index * 0.03,
            index: index++,
          });
        }
      }
    }
    return cubieList;
  }, [cubeScale]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.set(Math.PI / 15, -Math.PI / 6, 0);
      groupRef.current.position.y = 0.2 * cubeScale;
    }
  }, [cubeScale]);

  return (
    <group ref={groupRef}>
      {cubies.map((cubie) => (
        <Cubie
          key={cubie.id}
          position={cubie.position}
          targetPosition={cubie.position}
          delay={cubie.delay}
          index={cubie.index}
          cubeScale={cubeScale}
          skipAnimation={skipAnimation}
        />
      ))}
    </group>
  );
}

// Main Scene with responsive scaling
function Scene({ screenSize, skipAnimation }) {
  const getCubeScale = () => {
    if (screenSize.width < 480) return 1.0; // Small mobile
    if (screenSize.width < 768) return 1.0; // Mobile
    if (screenSize.width < 1024) return 1.0; // Tablet
    return 1.0; // Desktop
  };

  const cubeScale = getCubeScale();

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#4a9eff" />
      <pointLight position={[5, -3, 5]} intensity={0.3} color="#ff6b35" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.4}
        penumbra={0.5}
        intensity={0.6}
        color="#ffffff"
        target-position={[0, 0, 0]}
      />

      <CubeAssembly cubeScale={cubeScale} skipAnimation={skipAnimation} />
      <CameraController screenSize={screenSize} skipAnimation={skipAnimation} />
    </>
  );
}

// Main Component
export default function CubeCanvasLanding() {
  const [showText, setShowText] = useState(false);
  const [isAssembling, setIsAssembling] = useState(false);
  const [cubePosition, setCubePosition] = useState({ x: 0, y: 0 });
  const screenSize = useScreenSize();
  const location = useLocation();

  // Check if we're loading directly at section2
  const skipAnimation = location.hash === "#section2";

  useEffect(() => {
    if (skipAnimation) {
      // Skip directly to the final state
      setShowText(true);
      setIsAssembling(true);
    } else {
      const timer = setTimeout(() => setIsAssembling(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [skipAnimation]);

  useEffect(() => {
    if (!skipAnimation) {
      const timer = setTimeout(() => setShowText(true), 7200);
      return () => clearTimeout(timer);
    }
  }, [skipAnimation]);

  useEffect(() => {
    // Update position on mount and resize
    updateCubePosition();
    window.addEventListener("resize", updateCubePosition);
    return () => window.removeEventListener("resize", updateCubePosition);
  }, [screenSize]);

  // Function to update cube position
  const updateCubePosition = () => {
    const cubeContainer = document.querySelector(".cube-container");
    if (cubeContainer) {
      const rect = cubeContainer.getBoundingClientRect();
      setCubePosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2 - (screenSize.width < 768 ? 80 : 100),
      });
    }
  };

  // Get responsive text sizing
  const getTextSize = () => {
    if (screenSize.width < 480) return "text-5xl sm:text-5xl"; // Very small mobile
    if (screenSize.width < 768) return "text-6xl sm:text-6xl"; // Mobile
    if (screenSize.width < 1024) return "text-6xl sm:text-7xl"; // Tablet
    return "text-8xl"; // Desktop
  };

  const getDifference = () => {
    if (screenSize.width < 480) return "translate(-50%, -130%)"; // Very small mobile
    if (screenSize.width < 768) return "translate(-50%, -150%)"; // Mobile
    if (screenSize.width < 1024) return "translate(-50%, -120%)"; // Tablet
    return "translate(-50%, -170%)"; // Desktop
  };

  const getStrokeWidth = () => {
    if (screenSize.width < 768) return "3px";
    return "6px";
  };

  return (
    <div className="w-full min-h-screen bg-[#EF7722] relative">
      {/* First Container: Cube Canvas */}
      <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center cube-container">
        <BackgroundParticles
          isActive={true}
          particleCount={screenSize.width < 768 ? 75 : 150}
          minDistance={screenSize.width < 768 ? 20 : 30}
          scrollDirection="paused"
          alwaysAnimate={true}
          animateMovement={true}
        />

        {/* Cube Canvas */}
        <div className="w-full flex-1 relative">
          <Canvas
            shadows
            gl={{ alpha: true }}
            style={{ background: "transparent", zIndex: 20 }}
            camera={{ position: [0, 5, 20], fov: 45 }}
            className="absolute inset-0"
          >
            <Scene screenSize={screenSize} skipAnimation={skipAnimation} />
          </Canvas>
        </div>
        {/* Label positioned below canvas in DOM but visually above cube */}
        {showText && (
          <div
            className="absolute pointer-events-none text-center px-4"
            style={{
              zIndex: 10,
              left: `${cubePosition.x}px`,
              top: `${cubePosition.y}px`,
              transform: getDifference(),
            }}
          >
            <h1
              className={`font-extrabold tracking-wide text-white ${getTextSize()}`}
              style={{
                WebkitTextStroke: `${getStrokeWidth()} orange`,
                textShadow: "0 0 20px rgba(0,0,0,0.5)",
              }}
            >
              CubeCanvas
            </h1>
          </div>
        )}

        {/* ✅ Catchy Tagline at Bottom Center */}
        <div className="absolute bottom-[calc(3rem+env(safe-area-inset-bottom))] w-full flex justify-center px-4 z-30">
          <div className="bg-white/20 backdrop-blur-md text-white text-sm sm:text-base md:text-lg font-light px-6 sm:px-8 py-2 sm:py-3 rounded-full shadow-lg border border-white/30">
            Where Math Meets Play 
          </div>
        </div>
      </div>

      {/* Second Container: Main Content Section */}
      <div className="w-full relative overflow-hidden bg-white" id="section2">
        <div
          className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-32"
          style={{ zIndex: 10 }}
        >
          {/* Hero Text Section */}
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-orange-500 mb-4 tracking-tight px-4">
              Choose Your Experience
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-lg mx-auto px-4">
              Two ways to explore the cube. Simple, powerful, beautiful.
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto px-4">
            {/* Interactive Cube Card */}
            <div className="group relative">
              <div className="relative bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] hover:bg-white/50 transition-all duration-500">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-md sm:rounded-lg opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em]">
                    01
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-3">
                  Interactive
                </h3>
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm leading-relaxed">
                  Play with a 3D cube. Scramble, rotate, solve.
                </p>

                <button
                  onClick={() => (window.location.href = "/cube")}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-orange-600 hover:to-red-600 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span>Enter</span>
                    <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
                  </span>
                </button>
              </div>
            </div>

            {/* Timeline Solver Card */}
            <div className="group relative">
              <div className="relative bg-white/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] hover:bg-white/50 transition-all duration-500">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:scale-110 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                      />
                    </svg>
                  </div>
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-[0.2em]">
                    02
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-3">
                  AI Solver
                </h3>
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm leading-relaxed">
                  Paint your cube, watch AI solve it frame by frame.
                </p>

                <button
                  onClick={() =>
                    (window.location.href = "/scan")
                  }
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-blue-600 hover:to-purple-600 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span>Enter</span>
                    <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="text-center mt-16 sm:mt-20">
            <p className="text-sm font-mono text-gray-400 uppercase tracking-[0.3em]">
              Designed for Joy
            </p>
          </div>

          {/* GitHub Card */}
          <div className="mt-8 sm:mt-12 flex justify-center px-4">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20 shadow-lg text-center">
              <h3 className="text-lg sm:text-xl font-light mb-3 tracking-tight text-gray-900">
                Explore the Source
              </h3>
              <p className="text-gray-500 mb-6 text-sm font-light">
                Dive into the code that powers these experiences.
              </p>
              <a
                href="https://github.com/U1000000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-900 transition-all duration-300"
              >
                <Github className="w-5 h-5" />
                <span className="text-sm font-medium">View on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="w-full relative overflow-hidden bg-white/40 backdrop-blur-md border-t border-white/20"
        style={{ zIndex: 20 }}
      >
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
              {/* Brand Section */}
              <div className="sm:col-span-2 md:col-span-1">
                <h3 className="text-xl sm:text-2xl font-light text-gray-900 mb-3 tracking-tight">
                  CubeCanvas
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  Mathematical beauty meets interactive design. Explore the art
                  of cube solving.
                </p>
              </div>

              {/* Navigation Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-[0.15em]">
                  Explore
                </h4>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => (window.location.href = "/cube")}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light hover:translate-x-1 transform transition-transform"
                    >
                      Interactive Cube
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => (window.location.href = "/scan")}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-light hover:translate-x-1 transform transition-transform"
                    >
                      AI Timeline Solver
                    </button>
                  </li>
                </ul>
              </div>

              {/* Info Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-[0.15em]">
                  About
                </h4>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    Built with passion for mathematical visualization and
                    interactive learning.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
                    <span className="text-xs text-gray-500 font-mono">
                      Online & Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 sm:pt-8 border-t border-white/30">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-gray-500 font-mono tracking-wide">
                  © 2024 CubeCanvas • Crafted with precision
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="font-mono">Made for</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                  <span className="font-mono">Cube Enthusiasts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}