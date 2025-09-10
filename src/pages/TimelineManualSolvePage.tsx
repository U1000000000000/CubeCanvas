import React, { useState, useEffect, useRef } from "react";
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
  const [selectedColor, setSelectedColor] = useState<CubeColor>("white");
  const [isComplete, setIsComplete] = useState(false);
  const [solution, setSolution] = useState<string>("");
  const [videoControlEnabled, setVideoControlEnabled] = useState(true);

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

  const [scrollDirection, setScrollDirection] = useState<
    "forward" | "reverse" | "paused"
  >("paused");
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

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
    document.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    
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
      console.log('🎬 Scroll Direction:', scrollDirection);
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
      document.removeEventListener("wheel", handleWheelPrevention, { capture: true });
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

      const worker = new Worker("/src/services/solver.js");

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
      {/* 🔥 FIXED: Pass scrollDirection correctly */}
      <BackgroundParticles
        isActive={timelineState.isActive}
        particleCount={125}
        scrollDirection={scrollDirection}
        minDistance={1}
      />

      {!timelineState.isActive && (
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 z-50" style={{ zIndex: 100 }}>
          <div className="flex gap-2 sm:gap-3 bg-white/20 backdrop-blur-md rounded-full px-3 sm:px-4 py-2 shadow-lg">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-3 transition-all duration-200 hover:scale-105 ${
                  selectedColor === color
                    ? "border-black scale-110 shadow-md ring-1 ring-white ring-opacity-80"
                    : "border-gray-300 hover:border-gray-500"
                }`}
                style={{ backgroundColor: COLOR_HEX_MAP[color] }}
              />
            ))}
          </div>

          <div className="group bg-white/20 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 ease-in-out hover:pr-4 px-3 py-2 flex items-center">
            <button
              onClick={handleFullReset}
              disabled={isAnimating}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/30 hover:bg-white/50 disabled:bg-white/10 backdrop-blur-sm transition-all duration-300 ease-in-out flex items-center justify-center flex-shrink-0"
              title="Reset Cube"
            >
              <RefreshCw
                size={16}
                className="text-white transition-transform duration-500 ease-in-out transform group-hover:rotate-180"
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
      )}

      {timelineState.isActive && (
        <div className="absolute bottom-6 sm:bottom-12 right-4 sm:right-6 z-50" style={{ zIndex: 100 }}>
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

      <div className="w-full h-full flex items-center justify-center" style={{ zIndex: 20 }}>
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

      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-6" style={{ zIndex: 100 }}>
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
              className={`px-6 sm:px-12 py-3 sm:py-4 text-white font-bold rounded-full shadow-lg backdrop-blur-md border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-4 text-base sm:text-lg
     ${
       isSolving
         ? "opacity-60 scale-95 pointer-events-none"
         : "hover:ring-2 hover:ring-white hover:ring-opacity-60 hover:shadow-xl hover:scale-105"
     } disabled:hover:scale-100`}
              title={isSolving ? "Generating Solution..." : "Solve Cube"}
            >
              {isSolving ? (
                <>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </>
              ) : (
                <Play
                  size={20}
                  className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300"
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
            className="px-6 sm:px-12 py-3 sm:py-4 text-white font-bold rounded-full shadow-lg backdrop-blur-md border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-4 text-base sm:text-lg
               hover:ring-2 hover:ring-white hover:ring-opacity-60 hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
            title="Stop Timeline"
          >
            <Square
              size={20}
              className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300"
              strokeWidth={2.5}
              fill="white"
            />
            <span className="hidden sm:inline">Stop</span>
          </button>
        )}
      </div>

      {(warnings.length > 0 || tempWarning) && (
        <div className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium shadow-lg max-w-[90vw] sm:w-[322px] transition-all flex items-center justify-start backdrop-blur-md" style={{ zIndex: 100 }}>
          {(() => {
            const overuseWarning = warnings.find((w) => w.includes("appears"));
            const warningToShow = tempWarning || overuseWarning || warnings[0];

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
              <div className="flex items-center gap-2 sm:gap-3">
                <WarningIcon
                  size={14}
                  className={`sm:w-4 sm:h-4 animate-pulse ${colorClass}`}
                  strokeWidth={2}
                />
                <span className="leading-only text-left truncate">
                  {warningToShow}
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {solution && (
        <div className="absolute top-12 sm:top-6 left-1/2 -translate-x-1/2 z-40" style={{ zIndex: 100 }}>
          <div className="flex gap-1 sm:gap-2 bg-white/20 backdrop-blur-md rounded-full px-2 sm:px-4 py-1 sm:py-2 shadow-lg max-w-[90vw] overflow-x-auto scrollbar-hide">
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