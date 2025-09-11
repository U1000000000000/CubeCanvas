import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cuboid as Cube, Play, RefreshCw, Atom, Home } from "lucide-react";
import { RubiksCube } from "../components/cube/RubiksCube";
import { Stats } from "../components/ui/Stats";
import { BackgroundParticles } from "../components/manual/BackgroundParticles";
import { useCubeStore } from "../store/cubeStore";

export function CubePage() {
  const navigate = useNavigate();
  const { scramble, reset, isAnimating, rotateFace, moveCount, hasScrambled } =
    useCubeStore();

  const [particlesVisible, setParticlesVisible] = useState(true);

  // Show reset button if there are moves or cube has been scrambled
  const showReset = moveCount > 0 || hasScrambled;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ backgroundColor: "#EF7722" }}
    >
      {/* Background Particles - Middle layer */}
      {particlesVisible && (
        <BackgroundParticles
          isActive={true}
          particleCount={220}
          minDistance={30}
          scrollDirection="paused"
          alwaysAnimate={true}
          animateMovement={false}
        />
      )}

      {/* Back Button - Top Left */}
      <div
        className="absolute top-6 sm:top-8 left-4 sm:left-6 pointer-events-auto z-50"
        style={{ zIndex: 100 }}
      >
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
      </div>

      {/* Cube - Higher layer (matches TimelineManualCube z-index: 20) */}
      <div className="absolute inset-0" style={{ zIndex: 20 }}>
        <RubiksCube />
      </div>

      {/* Overlay UI - Highest layer */}
      <div
        className="relative flex flex-col min-h-screen pointer-events-none"
        style={{ zIndex: 30 }}
      >
        <Stats />
        {/* Background Particles Toggle - Bottom Left */}
        <div
          className="absolute bottom-12 sm:bottom-8 left-4 sm:left-6 pointer-events-auto"
          style={{ zIndex: 100 }}
        >
          <button
            onClick={() => setParticlesVisible(!particlesVisible)}
            className={`
      w-11 h-11 sm:w-14 sm:h-14
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
              size={16}
              className={`sm:w-5 sm:h-5 transition-all duration-300 ${
                particlesVisible ? "opacity-80" : "opacity-50"
              } text-black`}
              strokeWidth={2}
            />
          </button>
        </div>
        {/* Bottom Center Buttons Container */}
        <div
          className="absolute bottom-12 sm:bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto"
          style={{ zIndex: 100 }}
        >
          <div className="relative flex items-center justify-center">
            {/* Scramble Button - moves left when reset appears with responsive spacing */}
            <button
              onClick={scramble}
              disabled={isAnimating}
              style={{
                backgroundColor: "rgba(37, 99, 235, 0.9)",
              }}
              className={`
                w-11 h-11 sm:w-40 sm:px-6 sm:py-4 
                text-white font-bold rounded-full shadow-lg backdrop-blur-md border border-white/20 
                transition-all duration-500 ease-in-out 
                flex items-center justify-center 
                gap-0 sm:gap-3 
                text-base sm:text-lg 
                hover:ring-2 hover:ring-white hover:ring-opacity-60 hover:shadow-xl hover:scale-105 
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 z-20 
                ${
                  showReset
                    ? "transform -translate-x-7 sm:-translate-x-20 md:-translate-x-24"
                    : ""
                }
              `}
              title="Scramble Cube"
            >
              <Play
                size={18}
                className="sm:w-5 sm:h-5 transition-transform duration-300 flex-shrink-0"
                strokeWidth={2.5}
                fill="white"
              />
              <span className="hidden sm:inline text-sm sm:text-base truncate">
                Scramble
              </span>
            </button>

            {/* Reset Button - slides out from behind with responsive spacing */}
            <button
              onClick={reset}
              disabled={isAnimating}
              style={{
                backgroundColor: "rgba(168, 85, 247, 0.9)",
              }}
              className={`
                absolute 
                /* Mobile: Circle shape */
                w-11 h-11 rounded-full
                /* Desktop: Pill shape */
                sm:w-40 sm:rounded-full sm:px-6 sm:py-4
                text-white font-bold shadow-lg backdrop-blur-md border border-white/20 
                transition-all duration-500 ease-in-out flex items-center justify-center 
                gap-0 sm:gap-3 text-base sm:text-lg 
                hover:ring-2 hover:ring-white hover:ring-opacity-60 hover:shadow-xl hover:scale-105 
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 z-10 
                ${
                  showReset
                    ? "transform translate-x-7 sm:translate-x-20 md:translate-x-24 opacity-100 pointer-events-auto"
                    : "transform translate-x-0 opacity-0 pointer-events-none"
                }
              `}
              title="Reset Cube"
            >
              <RefreshCw
                size={18}
                className="sm:w-5 sm:h-5 transition-transform duration-300 flex-shrink-0"
                strokeWidth={2.5}
              />
              <span className="hidden sm:inline text-sm sm:text-base truncate">
                Reset
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
