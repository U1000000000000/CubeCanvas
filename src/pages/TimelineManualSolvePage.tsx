import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TimelineManualCube } from "../components/manual/TimelineManualCube";
import { useManualCubeStore } from "../store/manualCubeStore";
import { CubeColor } from "../types/cube";
import { useTimelineAnimation } from "../hooks/useTimelineAnimation";
import { BackgroundParticles } from "../components/manual/BackgroundParticles";
import {
  RefreshCw,
  Play,
  Square,
  AlertTriangle,
  AlertCircle,
  Info,
  Eye,
  Camera,
  Move3D,
  Atom,
  ArrowUp,
  ArrowDown,
  Home,
} from "lucide-react";

const COLORS: CubeColor[] = [
  "white",
  "yellow",
  "red",
  "orange",
  "green",
  "blue",
];

const COLOR_HEX_MAP: Record<CubeColor, string> = {
  white: "#FFFFFF",
  yellow: "#FFD700",
  red: "#C41E3A",
  orange: "#FF8C00",
  green: "#228B22",
  blue: "#0057B8",
};

export function TimelineManualSolvePage() {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState<CubeColor>("white");
  const [isComplete, setIsComplete] = useState(false);
  const [solution, setSolution] = useState<string>("");
  const [videoControlEnabled, setVideoControlEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  const { cubies, isAnimating } = useManualCubeStore();

  const {
    state: timelineState,
    startTimeline,
    stopTimeline,
    resetTimeline,
    jumpToTimestamp,
  } = useTimelineAnimation({
    solution: solution,
    enabled: !!solution,
  });

  const [isSolving, setIsSolving] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [tempWarning, setTempWarning] = useState<string | null>(null);

  const [particlesVisible, setParticlesVisible] = useState(true);

  const [scrollDirection, setScrollDirection] = useState<
    "forward" | "reverse" | "paused"
  >("paused");
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const instructionTimeoutRef = useRef<NodeJS.Timeout>();

  // Show instructions when timeline starts
  useEffect(() => {
    if (timelineState.isActive && !showInstructions) {
      setShowInstructions(true);

      // Clear existing timeout
      if (instructionTimeoutRef.current) {
        clearTimeout(instructionTimeoutRef.current);
      }

      // Hide instructions after 5 seconds
      instructionTimeoutRef.current = setTimeout(() => {
        setShowInstructions(false);
      }, 5000);
    }

    // Cleanup when timeline stops
    if (!timelineState.isActive && showInstructions) {
      setShowInstructions(false);
      if (instructionTimeoutRef.current) {
        clearTimeout(instructionTimeoutRef.current);
      }
    }

    return () => {
      if (instructionTimeoutRef.current) {
        clearTimeout(instructionTimeoutRef.current);
      }
    };
  }, [timelineState.isActive]);

  // Hide instructions when user starts scrolling
  useEffect(() => {
    if (showInstructions && scrollDirection !== "paused") {
      setShowInstructions(false);
      if (instructionTimeoutRef.current) {
        clearTimeout(instructionTimeoutRef.current);
      }
    }
  }, [showInstructions, scrollDirection]);

  // Keyboard event listener for arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp" || e.code === "ArrowDown") {
        e.preventDefault();

        if (timelineState.isActive) {
          // Control timeline during solving - simulate scrolling behavior
          const direction = e.code === "ArrowDown" ? "forward" : "reverse";
          setScrollDirection(direction);

          // Clear existing timeout
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }

          // Stop scrolling after timeout (same as wheel scroll behavior)
          scrollTimeoutRef.current = setTimeout(() => {
            setScrollDirection("paused");
          }, 500);
        } else if (
          isComplete &&
          warnings.length === 0 &&
          !isSolving &&
          !tempWarning
        ) {
          // Start solving if cube is complete and ready
          if (e.code === "ArrowDown") {
            solveCube();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        (e.code === "ArrowUp" || e.code === "ArrowDown") &&
        timelineState.isActive
      ) {
        // Stop timeline movement on key release (similar to stopping scroll)
        setScrollDirection("paused");
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [
    timelineState.isActive,
    isComplete,
    warnings.length,
    isSolving,
    tempWarning,
  ]);

  // 🔥 FIXED: Improved scroll detection with longer timeout and better tracking
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (timelineState.isActive) {
        // Prevent default scrolling behavior
        e.preventDefault();
        e.stopPropagation();

        // Determine scroll direction based on deltaY
        const direction = e.deltaY > 0 ? "forward" : "reverse";
        setScrollDirection(direction);

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // 🔥 CRITICAL FIX: Longer timeout to keep animation running
        scrollTimeoutRef.current = setTimeout(() => {
          setScrollDirection("paused");
        }, 500); // Increased from 150ms to 500ms
      }
    };

    // Listen to wheel events with passive: false for preventDefault
    document.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener("wheel", handleWheel, { capture: true });
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [timelineState.isActive]);

  // 🔥 DEBUG: Log scroll direction changes
  useEffect(() => {
    if (timelineState.isActive) {
      console.log("🎬 Scroll Direction:", scrollDirection);
    }
  }, [scrollDirection, timelineState.isActive]);

  useEffect(() => {
    if (!cubies.length || isAnimating || timelineState.isActive) return;

    const newWarnings: string[] = [];

    const anyIncomplete = cubies.some((cubie) => {
      const faces = cubie.materials;
      if (!faces) return true;
      const { x, y, z } = cubie.position;
      const visibleFaces: number[] = [];
      if (x === 1) visibleFaces.push(0);
      if (x === -1) visibleFaces.push(1);
      if (y === 1) visibleFaces.push(2);
      if (y === -1) visibleFaces.push(3);
      if (z === 1) visibleFaces.push(4);
      if (z === -1) visibleFaces.push(5);
      return visibleFaces.some((faceIndex) => faces[faceIndex] === "gray");
    });

    if (anyIncomplete) {
      newWarnings.push("Color all faces before solving");
    }

    const colorCounts: Record<CubeColor, number> = {
      white: 0,
      yellow: 0,
      red: 0,
      orange: 0,
      green: 0,
      blue: 0,
      gray: 0,
      black: 0,
    };

    cubies.forEach((cubie) => {
      cubie.materials.forEach((color) => {
        if (colorCounts[color] !== undefined) {
          colorCounts[color]++;
        }
      });
    });

    (Object.keys(colorCounts) as CubeColor[]).forEach((color) => {
      if (color !== "gray" && color !== "black" && colorCounts[color] > 9) {
        newWarnings.push(
          `${color.toUpperCase()} appears ${colorCounts[color]} times (max 9)`
        );
      }
    });

    setWarnings(newWarnings);
    setIsComplete(!anyIncomplete && newWarnings.length === 0);
  }, [cubies, isAnimating, timelineState.isActive]);

  useEffect(() => {
    const handleWheelPrevention = (e: WheelEvent) => {
      if (timelineState.isActive) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };
    document.addEventListener("wheel", handleWheelPrevention, {
      passive: false,
      capture: true,
    });
    return () => {
      document.removeEventListener("wheel", handleWheelPrevention, {
        capture: true,
      });
    };
  }, [timelineState.isActive]);

  useEffect(() => {
    if (!cubies.length || isAnimating || timelineState.isActive) return;
    const anyIncomplete = cubies.some((cubie) => {
      const faces = cubie.materials;
      if (!faces) return true;
      const { x, y, z } = cubie.position;
      const visibleFaces: number[] = [];
      if (x === 1) visibleFaces.push(0);
      if (x === -1) visibleFaces.push(1);
      if (y === 1) visibleFaces.push(2);
      if (y === -1) visibleFaces.push(3);
      if (z === 1) visibleFaces.push(4);
      if (z === -1) visibleFaces.push(5);
      return visibleFaces.some((faceIndex) => faces[faceIndex] === "gray");
    });
    setIsComplete(!anyIncomplete);
  }, [cubies, isAnimating, timelineState.isActive]);

  const handleStickerClick = (cubieId: string, faceIndex: number) => {
    if (isAnimating || timelineState.isActive) return;
    const { cubies: currentCubies } = useManualCubeStore.getState();
    const clickedCubie = currentCubies.find((c) => c.id === cubieId);
    if (!clickedCubie) return;

    const { x, y, z } = clickedCubie.position;

    const isCenter =
      (Math.abs(x) === 1 && y === 0 && z === 0) ||
      (Math.abs(y) === 1 && x === 0 && z === 0) ||
      (Math.abs(z) === 1 && x === 0 && y === 0);

    if (isCenter) {
      setTempWarning("Center colors are locked");
      setTimeout(() => setTempWarning(null), 1000);
      return;
    }

    const updatedCubies = currentCubies.map((cubie) => {
      if (cubie.id === cubieId) {
        const newMaterials = [...cubie.materials];
        newMaterials[faceIndex] = selectedColor;
        return { ...cubie, materials: newMaterials };
      }
      return cubie;
    });
    useManualCubeStore.setState({ cubies: updatedCubies });
  };

  const solveCube = async () => {
    if (!isComplete) return;
    setIsSolving(true);

    try {
      const { cubies } = useManualCubeStore.getState();
      const cubeString = generateCubeString(cubies);

      const worker = new Worker("solver.js");

      worker.onmessage = (e) => {
        const { type, result, error } = e.data;

        if (type === "CoordCube") {
          worker.postMessage({
            type: "solve",
            cube: cubeString,
            maxDepth: 24,
            maxTime: 15,
          });
        }

        if (type === "solution") {
          if (
            result &&
            typeof result === "string" &&
            result.startsWith("Error")
          ) {
            const errorMatch = result.match(/Error (\d+)/);
            const errorCode = errorMatch ? parseInt(errorMatch[1]) : null;

            let errorMessage = "Solver encountered an issue";

            if (errorCode >= 1 && errorCode <= 6) {
              errorMessage = "Invalid cube";
            } else if (errorCode === 7) {
              errorMessage = "Solution complexity exceeded";
            } else if (errorCode === 8) {
              errorMessage = "Solver timeout";
            }

            setTempWarning(errorMessage);
            setTimeout(() => setTempWarning(null), 2000);
            setIsSolving(false);
            worker.terminate();
            return;
          }

          setSolution(result);
          setIsSolving(false);
          worker.terminate();
        }

        if (type === "error") {
          setTempWarning(`Solver error: ${error || "Unknown error"}`);
          setTimeout(() => setTempWarning(null), 2000);
          setIsSolving(false);
          worker.terminate();
        }
      };

      worker.onerror = (err) => {
        setTempWarning("Solver worker failed to load");
        setTimeout(() => setTempWarning(null), 2000);
        setIsSolving(false);
      };

      worker.postMessage({ type: "generateTables" });
    } catch (err) {
      setTempWarning("Failed to initialize solver");
      setTimeout(() => setTempWarning(null), 2000);
      setIsSolving(false);
    }
  };

  function generateCubeString(cubies: any[]): string {
    const colorToFaceMap: Record<CubeColor, string> = {
      white: "U",
      orange: "L",
      green: "F",
      red: "R",
      blue: "B",
      yellow: "D",
      gray: "?",
      black: "?",
    };

    const faces: Record<string, string[]> = {
      U: new Array(9).fill("?"),
      R: new Array(9).fill("?"),
      F: new Array(9).fill("?"),
      D: new Array(9).fill("?"),
      L: new Array(9).fill("?"),
      B: new Array(9).fill("?"),
    };

    const get1DIndex = (row: number, col: number): number => {
      return row * 3 + col;
    };

    cubies.forEach((cubie) => {
      const { position, materials } = cubie;
      const { x, y, z } = position;

      if (x === 1) {
        const row = 1 - y;
        const col = 1 - z;
        const index = get1DIndex(row, col);
        const color = materials[0];
        faces.R[index] = colorToFaceMap[color] || "?";
      }

      if (x === -1) {
        const row = 1 - y;
        const col = z + 1;
        const index = get1DIndex(row, col);
        const color = materials[1];
        faces.L[index] = colorToFaceMap[color] || "?";
      }

      if (y === 1) {
        const row = z + 1;
        const col = x + 1;
        const index = get1DIndex(row, col);
        const color = materials[2];
        faces.U[index] = colorToFaceMap[color] || "?";
      }

      if (y === -1) {
        const row = 1 - z;
        const col = x + 1;
        const index = get1DIndex(row, col);
        const color = materials[3];
        faces.D[index] = colorToFaceMap[color] || "?";
      }

      if (z === 1) {
        const row = 1 - y;
        const col = x + 1;
        const index = get1DIndex(row, col);
        const color = materials[4];
        faces.F[index] = colorToFaceMap[color] || "?";
      }

      if (z === -1) {
        const row = 1 - y;
        const col = 1 - x;
        const index = get1DIndex(row, col);
        const color = materials[5];
        faces.B[index] = colorToFaceMap[color] || "?";
      }
    });

    const result = [
      ...faces.U,
      ...faces.R,
      ...faces.F,
      ...faces.D,
      ...faces.L,
      ...faces.B,
    ].join("");

    return result;
  }

  useEffect(() => {
    if (solution && !timelineState.isActive) {
      setTimeout(() => {
        startTimeline();
      }, 100);
    }
  }, [solution, timelineState.isActive, startTimeline]);

  const handleStopSolving = () => {
    stopTimeline();
    setSolution("");
    setScrollDirection("paused");
  };

  const handleFullReset = () => {
    stopTimeline();
    resetTimeline();
    setSolution("");
    setScrollDirection("paused");
    useManualCubeStore.getState().reset();
  };

  const handleTimelineSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineState.isActive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTimestamp = clickX / rect.width;
    const clampedTimestamp = Math.max(0, Math.min(1, newTimestamp));
    jumpToTimestamp(clampedTimestamp);
  };

  const currentFrame = timelineState.currentFrame;
  const rotationState = currentFrame?.rotationState;

  return (
    <div
      className="w-screen h-screen relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#EF7722" }}
    >
      {particlesVisible && (
        <BackgroundParticles
          isActive={timelineState.isActive}
          particleCount={220}
          scrollDirection={scrollDirection}
          minDistance={30}
        />
      )}

      {/* Fixed Top Bar with Home Button and Color Palette/Reset */}
      {!timelineState.isActive && (
        <div
          className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center z-50"
          style={{ zIndex: 100 }}
        >
          {/* Home Button - Always on left */}
          <button
            onClick={() => navigate("/#section2")}
            className="group h-12 w-12 sm:h-14 sm:w-14 bg-white/25 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center hover:bg-white/35 hover:scale-105 active:scale-95 flex-shrink-0"
            title="Go Back Home"
          >
            <Home
              size={20}
              className="sm:w-6 sm:h-6 text-black transition-transform duration-300 group-hover:scale-110"
              strokeWidth={2.5}
            />
          </button>

          {/* Spacer to push controls to center */}
          <div className="flex-1"></div>

          {/* Color Palette and Reset Button - Centered */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex gap-1.5 sm:gap-3 bg-white/20 backdrop-blur-md rounded-full px-2.5 sm:px-4 py-2 shadow-lg">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full transition-all duration-200 hover:scale-105 flex-shrink-0 ${
                    selectedColor === color
                      ? "scale-110 shadow-md ring-2 ring-black/50"
                      : "hover:shadow-sm"
                  }`}
                  style={{ backgroundColor: COLOR_HEX_MAP[color] }}
                />
              ))}
            </div>

            <div className="group bg-white/20 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 ease-in-out hover:pr-3 sm:hover:pr-4 px-2.5 sm:px-3 py-2 flex items-center flex-shrink-0">
              <button
                onClick={handleFullReset}
                disabled={isAnimating}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/30 hover:bg-white/50 disabled:bg-white/10 backdrop-blur-sm transition-all duration-300 ease-in-out flex items-center justify-center flex-shrink-0"
                title="Reset Cube"
              >
                <RefreshCw
                  size={14}
                  className="sm:w-4 sm:h-4 text-black transition-transform duration-500 ease-in-out transform group-hover:rotate-180"
                  strokeWidth={2.5}
                />
              </button>

              <div className="hidden sm:block overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-in-out max-w-0 opacity-0 ml-0 group-hover:max-w-[4rem] group-hover:ml-2 group-hover:opacity-100">
                <span className="text-white font-medium whitespace-nowrap text-sm">
                  Reset
                </span>
              </div>
            </div>
          </div>

          {/* Spacer to balance the layout */}
          <div className="flex-1"></div>
        </div>
      )}

      {/* Timeline Mode - Only Home Button */}
      {timelineState.isActive && (
        <div
          className="absolute top-4 sm:top-6 left-4 sm:left-6 pointer-events-auto z-50"
          style={{ zIndex: 100 }}
        >
          <button
            onClick={() => navigate("/")}
            className="group h-12 w-12 sm:h-14 sm:w-14 bg-white/25 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center hover:bg-white/35 hover:scale-105 active:scale-95"
            title="Go Back Home"
          >
            <Home
              size={20}
              className="sm:w-6 sm:h-6 text-black transition-transform duration-300 group-hover:scale-110"
              strokeWidth={2.5}
            />
          </button>
        </div>
      )}

      {/* Instructions Overlay */}
      {showInstructions && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-fade-in"
          style={{ zIndex: 150 }}
        >
          <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 sm:px-8 py-4 sm:py-6 shadow-2xl border border-white/30 max-w-sm sm:max-w-md mx-4">
            <div className="flex flex-col items-center gap-3 sm:gap-4 text-center">
              <div className="flex items-center gap-2 text-white">
                <Move3D size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
                <h3 className="font-bold text-lg sm:text-xl">
                  Timeline Controls
                </h3>
              </div>

              <div className="space-y-2 text-white/90 text-sm sm:text-base">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1">
                    <ArrowUp
                      size={16}
                      className="text-white/80"
                      strokeWidth={2}
                    />
                    <span className="text-xs sm:text-sm">or scroll up</span>
                  </div>
                  <span className="text-white/60">•</span>
                  <span className="font-medium">Rewind</span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1">
                    <ArrowDown
                      size={16}
                      className="text-white/80"
                      strokeWidth={2}
                    />
                    <span className="text-xs sm:text-sm">or scroll down</span>
                  </div>
                  <span className="text-white/60">•</span>
                  <span className="font-medium">Forward</span>
                </div>
              </div>

              <div className="w-full h-px bg-white/20 my-1"></div>

              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Use scroll wheel or arrow keys to control the solving timeline
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Background Particles Toggle - Bottom Left */}
      <div
        className="absolute bottom-6 sm:bottom-8 left-4 sm:left-6 pointer-events-auto"
        style={{ zIndex: 100 }}
      >
        <button
          onClick={() => setParticlesVisible(!particlesVisible)}
          className={`
    h-12 w-12 sm:h-16 sm:w-16
    bg-white/25 backdrop-blur-md rounded-full shadow-lg 
    transition-all duration-300 ease-in-out 
    flex items-center justify-center 
    text-white font-medium
    hover:bg-white/35 hover:scale-105 
    active:scale-95
    ${particlesVisible ? "opacity-100" : "opacity-60"}
  `}
          title={particlesVisible ? "Hide Particles" : "Show Particles"}
        >
          <Atom
            size={20}
            className={`sm:w-6 sm:h-6 transition-all duration-300 ${
              particlesVisible ? "opacity-80" : "opacity-50"
            } text-black`}
            strokeWidth={2}
          />
        </button>
      </div>

      {timelineState.isActive && (
        <div
          className="absolute bottom-6 sm:bottom-12 right-4 sm:right-6 z-50"
          style={{ zIndex: 100 }}
        >
          <button
            onClick={() => setVideoControlEnabled(!videoControlEnabled)}
            className={`px-3 sm:px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2 text-sm backdrop-blur-md shadow-lg ${
              videoControlEnabled
                ? "bg-white/25 hover:bg-white/35 text-white"
                : "bg-black/25 hover:bg-black/35 text-white/80"
            }`}
            title={
              videoControlEnabled ? "Disable Auto Camera" : "Enable Auto Camera"
            }
          >
            <div
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                videoControlEnabled ? "bg-green-300" : "bg-red-300"
              }`}
            />
            {videoControlEnabled ? (
              <Camera size={14} className="sm:w-4 sm:h-4" strokeWidth={2} />
            ) : (
              <Eye size={14} className="sm:w-4 sm:h-4" strokeWidth={2} />
            )}
            <span className="hidden sm:inline">Auto Camera</span>
            <span className="sm:hidden">
              {videoControlEnabled ? "On" : "Off"}
            </span>
          </button>
        </div>
      )}

      <div
        className="w-full h-full flex items-center justify-center"
        style={{ zIndex: 20 }}
      >
        <TimelineManualCube
          onStickerClick={handleStickerClick}
          timelineMode={timelineState.isActive}
          currentRotationAngle={rotationState?.angle || 0}
          rotatingAxis={rotationState?.axis || null}
          rotatingCubieIds={rotationState?.cubieIds || []}
          currentFrame={currentFrame}
          videoControlEnabled={videoControlEnabled}
        />
      </div>

      {/* UNIFIED CONTAINER FOR BUTTON AND WARNING */}
      <div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-3 w-full px-4"
        style={{ zIndex: 100 }}
      >
        {/* Solve / Stop Buttons */}
        <div className="flex gap-3 sm:gap-6">
          {isComplete &&
            warnings.length === 0 &&
            !timelineState.isActive &&
            !tempWarning && (
              <button
                onClick={solveCube}
                disabled={isAnimating || isSolving}
                style={{
                  backgroundColor: isSolving
                    ? "rgba(34,139,34,0.4)"
                    : "rgba(34,139,34,0.9)",
                  cursor: isSolving ? "not-allowed" : "pointer",
                }}
                className={`px-4 sm:px-8 py-2 sm:py-3 text-white font-bold rounded-full shadow-lg backdrop-blur-md border border-white/20 transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-3 text-sm sm:text-base
   ${
     isSolving
       ? "opacity-60 scale-95 pointer-events-none"
       : "hover:ring-2 hover hover:ring-white hover:ring-opacity-60 hover:shadow-xl hover:scale-105"
   } disabled:hover:scale-100`}
                title={
                  isSolving ? "Generating Solution..." : "Solve Cube (↓ Arrow)"
                }
              >
                {isSolving ? (
                  <>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </>
                ) : (
                  <Play
                    size={16}
                    className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300"
                    strokeWidth={2.5}
                    fill="white"
                  />
                )}
                <span className="hidden sm:inline">
                  {isSolving ? "Generating..." : "Solve"}
                </span>
                <span className="sm:hidden">{isSolving ? "..." : "Solve"}</span>
              </button>
            )}
          {timelineState.isActive && (
            <button
              onClick={handleStopSolving}
              disabled={isAnimating}
              style={{ backgroundColor: "rgba(196,30,58,0.9)" }}
              className="px-4 sm:px-8 py-2 sm:py-3 text-white font-bold rounded-full shadow-lg backdrop-blur-md border border-white/20 transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-3 text-sm sm:text-base
             hover:ring-2 hover:ring-white hover:ring-opacity-60 hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
              title="Stop Timeline"
            >
              <Square
                size={16}
                className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300"
                strokeWidth={2.5}
                fill="white"
              />
              <span className="hidden sm:inline">Stop</span>
            </button>
          )}
        </div>

        {/* Warning Message */}
        {(warnings.length > 0 || tempWarning) && (
          <div className="bg-black/80 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-base font-medium shadow-lg backdrop-blur-md transition-all flex items-center justify-start w-auto max-w-full">
            {(() => {
              const overuseWarning = warnings.find((w) =>
                w.includes("appears")
              );
              const warningToShow =
                tempWarning || overuseWarning || warnings[0];

              const isColorOveruse = warningToShow?.includes("appears");
              const isInvalidCube = warningToShow
                ?.toLowerCase()
                .includes("invalid cube");
              const isSolverLimit =
                warningToShow?.toLowerCase().includes("complexity exceeded") ||
                warningToShow?.toLowerCase().includes("timeout");

              const WarningIcon = isColorOveruse
                ? AlertTriangle
                : isInvalidCube
                ? AlertCircle
                : isSolverLimit
                ? Info
                : AlertCircle;

              const colorClass = isInvalidCube
                ? "text-red-400"
                : isSolverLimit
                ? "text-blue-400"
                : isColorOveruse
                ? "text-red-400"
                : "text-yellow-400";

              return (
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <WarningIcon
                    size={14}
                    className={`sm:w-4 sm:h-4 animate-pulse ${colorClass} flex-shrink-0`}
                    strokeWidth={2}
                  />
                  <span className="leading-tight text-left truncate flex-1">
                    {warningToShow}
                  </span>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {solution && (
        <div
          className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-40"
          style={{ zIndex: 100 }}
        >
          <div className="flex gap-1 sm:gap-2 bg-white/20 backdrop-blur-md rounded-full px-2 sm:px-4 py-1 sm:py-2 shadow-lg max-w-[70vw] sm:max-w-md overflow-x-auto scrollbar-hide">
            {solution.split(" ").map((move, index) => {
              const currentLogicalMoveIndex =
                timelineState.currentLogicalMoveIndex;
              const isCurrent = currentLogicalMoveIndex === index;

              return (
                <div
                  key={index}
                  className={`relative px-2 sm:px-3 py-1 rounded-full font-mono text-xs sm:text-base text-white transition-all duration-300 flex-shrink-0 ${
                    isCurrent
                      ? "font-bold bg-white/30 scale-105"
                      : "opacity-70 hover:opacity-90"
                  }`}
                >
                  {move}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full ring-1 sm:ring-2 ring-white/60 animate-pulse pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="sm:hidden text-center mt-1">
            <div className="inline-flex items-center gap-1 text-white/60 text-xs">
              <Move3D size={12} />
              <span>Swipe to see all moves</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        @media (max-width: 640px) {
          button {
            min-height: 44px;
          }

          body {
            overflow-x: hidden;
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          .animate-bounce {
            animation: bounce 1s infinite;
          }
        }

        @media (hover: none) {
          .hover\\:scale-105:hover {
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}