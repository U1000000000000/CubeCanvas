// BackgroundParticles.jsx
import React, { useEffect, useState, useRef } from "react";
// 1. Import only the required components and a custom list of icons.
import { CustomIcon, VIBRANT_COLORS } from 'icon-sphere';

// 2. Define a local icon list with only the desired particles.
const SELECTED_PARTICLE_ICONS = [
  "car",
  "rocket",
  "airplane",
  "train",
  "bicycle",
  "scooter",
  "ship",
  "satellite",
  "skates",
  "ufo",
  "planet",
  "submarine",
  "football",
];

// Helper function to calculate distance between two particles
const getDistance = (p1, p2) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Helper function to check if a position is valid (not too close to existing particles)
const isValidPosition = (x, y, size, existingParticles, minDistance) => {
  for (const particle of existingParticles) {
    const dx = x - particle.x;
    const dy = y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const requiredDistance = minDistance + (size + particle.size) / 2;

    if (distance < requiredDistance) {
      return false;
    }
  }
  return true;
};

// Helper function to find a valid position with retries
const findValidPosition = (existingParticles, size, minDistance, maxRetries = 100) => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const screenCenterX = screenWidth / 2;
  const screenCenterY = screenHeight / 2;

  // Try different placement strategies
  const strategies = [
    // Strategy 1: Random position with orbital placement
    () => {
      const centerX = size + Math.random() * (screenWidth - size * 2);
      const centerY = size + Math.random() * (screenHeight - size * 2);
      const orbitAngle = Math.random() * Math.PI * 2;
      const orbitRadius = Math.random() * 100 + 30;
      return {
        x: centerX + Math.cos(orbitAngle) * orbitRadius,
        y: centerY + Math.sin(orbitAngle) * orbitRadius,
        centerX,
        centerY,
      };
    },
    // Strategy 2: Position near screen center
    () => {
      const centerX = screenCenterX + (Math.random() - 0.5) * screenWidth * 0.4;
      const centerY =
        screenCenterY + (Math.random() - 0.5) * screenHeight * 0.4;
      const orbitAngle = Math.random() * Math.PI * 2;
      const orbitRadius = Math.random() * 80 + 20;
      return {
        x: centerX + Math.cos(orbitAngle) * orbitRadius,
        y: centerY + Math.sin(orbitAngle) * orbitRadius,
        centerX,
        centerY,
      };
    },
    // Strategy 3: Position in one of the quadrants
    () => {
      const quadrant = Math.floor(Math.random() * 4);
      const offsetX = screenWidth * (0.2 + Math.random() * 0.3);
      const offsetY = screenHeight * (0.2 + Math.random() * 0.3);

      let centerX, centerY;
      switch (quadrant) {
        case 0:
          centerX = screenCenterX - offsetX;
          centerY = screenCenterY - offsetY;
          break;
        case 1:
          centerX = screenCenterX + offsetX;
          centerY = screenCenterY - offsetY;
          break;
        case 2:
          centerX = screenCenterX - offsetX;
          centerY = screenCenterY + offsetY;
          break;
        case 3:
          centerX = screenCenterX + offsetX;
          centerY = screenCenterY + offsetY;
          break;
        default:
          centerX = screenCenterX;
          centerY = screenCenterY;
      }

      const orbitAngle = Math.random() * Math.PI * 2;
      const orbitRadius = Math.random() * 100 + 30;
      return {
        x: centerX + Math.cos(orbitAngle) * orbitRadius,
        y: centerY + Math.sin(orbitAngle) * orbitRadius,
        centerX,
        centerY,
      };
    },
  ];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    const position = strategy();

    if (
      isValidPosition(
        position.x,
        position.y,
        size,
        existingParticles,
        minDistance
      )
    ) {
      return position;
    }
  }

  // Fallback: Use a completely random position without distance check
  return {
    x: Math.random() * screenWidth,
    y: Math.random() * screenHeight,
    centerX: Math.random() * screenWidth,
    centerY: Math.random() * screenHeight,
  };
};

// Helper function to apply repulsion forces between particles
const applyRepulsionForces = (particles, minDistance) => {
  return particles.map((particle, index) => {
    let repulsionX = 0;
    let repulsionY = 0;

    for (let i = 0; i < particles.length; i++) {
      if (i === index) continue;

      const other = particles[i];
      const distance = getDistance(particle, other);
      const requiredDistance = minDistance + (particle.size + other.size) / 2;

      if (distance < requiredDistance && distance > 0) {
        const force = (requiredDistance - distance) / requiredDistance;
        const dx = (particle.x - other.x) / distance;
        const dy = (particle.y - other.y) / distance;

        repulsionX += dx * force * 2;
        repulsionY += dy * force * 2;
      }
    }

    return {
      ...particle,
      centerX: particle.centerX + repulsionX,
      centerY: particle.centerY + repulsionY,
    };
  });
};

export const BackgroundParticles = ({
  isActive,
  particleCount = 15,
  scrollDirection = "paused",
  minDistance = 80,
  alwaysAnimate = false,
  animateMovement = true, // New prop to control movement
}) => {
  const [particles, setParticles] = useState([]);
  const [animationPhase, setAnimationPhase] = useState(0);
  const animationFrameRef = useRef();
  const containerRef = useRef(null);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);

  const toggleAnimation = () => {
    setIsAnimationEnabled(!isAnimationEnabled);
  };

  // Add animation phase updater
  useEffect(() => {
    if (!isActive) return;

    const phaseUpdater = setInterval(() => {
      setAnimationPhase((prev) => prev + 1);
    }, 100); // Update animation phase 10 times per second

    return () => clearInterval(phaseUpdater);
  }, [isActive]);

  useEffect(() => {
    console.log(
      "🎨 BackgroundParticles: scrollDirection changed to:",
      scrollDirection,
      "isActive:",
      isActive
    );
  }, [scrollDirection, isActive]);

  useEffect(() => {
    const initParticles = () => {
      const newParticles = [];
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Calculate maximum possible particles based on screen size and minDistance
      const areaPerParticle = Math.PI * Math.pow(minDistance, 2);
      const maxParticles = Math.floor(
        (screenWidth * screenHeight) / areaPerParticle
      );
      const actualParticleCount = Math.min(particleCount, maxParticles);

      for (let i = 0; i < actualParticleCount; i++) {
        const size = Math.random() * 40 + 30;
        const position = findValidPosition(newParticles, size, minDistance);

        const orbitAngle = Math.random() * Math.PI * 2;
        const orbitRadius = Math.random() * 100 + 30;

        newParticles.push({
          id: i,
          x: position.x,
          y: position.y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size,
          color:
            VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)],
          icon: SELECTED_PARTICLE_ICONS[
            Math.floor(Math.random() * SELECTED_PARTICLE_ICONS.length)
          ],
          rotationSpeed: (Math.random() - 0.5) * 4,
          rotation: Math.random() * 360,
          orbitRadius,
          orbitSpeed: (Math.random() - 0.5) * 0.02,
          orbitAngle,
          centerX: position.centerX,
          centerY: position.centerY,
        });
      }

      setParticles(newParticles);
      console.log("🎨 Initialized", newParticles.length, "detailed particles");
    };

    initParticles();

    const handleResize = () => {
      initParticles();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [particleCount, minDistance]);
  
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    // Don't animate if not active OR no particles
    if (!isActive || particles.length === 0) {
      console.log(
        "🎨 Animation stopped: isActive=",
        isActive,
        "particles=",
        particles.length
      );
      return;
    }

    // Only animate when scrolling (not when paused) unless alwaysAnimate is true
    if (scrollDirection === "paused" && !alwaysAnimate && isAnimationEnabled) {
      console.log("🎨 Animation paused - no scroll detected");
      return;
    }

    console.log("🎨 Starting animation with direction:", scrollDirection);

    const animate = () => {
      // Use always forward direction if alwaysAnimate is enabled
      const directionMultiplier = alwaysAnimate ? 1 : 
                                (scrollDirection === "reverse" ? -1 : 1);
      const speedMultiplier = 3;

      setParticles((prevParticles) => {
        // First, update particle positions
        let updatedParticles = prevParticles.map((particle) => {
          // Only update position if movement animation is enabled
          let newX = particle.x;
          let newY = particle.y;
          let newCenterX = particle.centerX;
          let newCenterY = particle.centerY;
          let newOrbitAngle = particle.orbitAngle;

          if (animateMovement) {
            // Orbital motion with direction control and increased speed
            newOrbitAngle =
              particle.orbitAngle +
              particle.orbitSpeed * directionMultiplier * speedMultiplier;
            newX =
              particle.centerX + Math.cos(newOrbitAngle) * particle.orbitRadius;
            newY =
              particle.centerY + Math.sin(newOrbitAngle) * particle.orbitRadius;

            // Wrap around screen edges
            if (newX < -particle.size) {
              newX = window.innerWidth + particle.size;
              newCenterX = window.innerWidth + particle.size;
            } else if (newX > window.innerWidth + particle.size) {
              newX = -particle.size;
              newCenterX = -particle.size;
            }

            if (newY < -particle.size) {
              newY = window.innerHeight + particle.size;
              newCenterY = window.innerHeight + particle.size;
            } else if (newY > window.innerHeight + particle.size) {
              newY = -particle.size;
              newCenterY = -particle.size;
            }
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            centerX: newCenterX,
            centerY: newCenterY,
            orbitAngle: newOrbitAngle,
            rotation:
              particle.rotation +
              particle.rotationSpeed * directionMultiplier * speedMultiplier,
          };
        });

        // Then apply repulsion forces to maintain spacing (only if movement is enabled)
        if (animateMovement) {
          updatedParticles = applyRepulsionForces(updatedParticles, minDistance);
        }

        return updatedParticles;
      });

      // Continue animation if still active and (always animating or actually scrolling)
      if (isActive && (alwaysAnimate || scrollDirection !== "paused")) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        console.log(
          "🎨 Animation loop ended - isActive:",
          isActive,
          "scrollDirection:",
          scrollDirection,
          "alwaysAnimate:",
          alwaysAnimate
        );
      }
    };

    if (isAnimationEnabled) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [
    isActive,
    scrollDirection,
    particles.length,
    minDistance,
    isAnimationEnabled,
    alwaysAnimate,
    animateMovement, // Add to dependencies
  ]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 5,
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute transition-opacity duration-1000"
          style={{
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            opacity: isActive ? 1 : 1,
            transform: isActive ? "none" : "scale(0.8)",
            transition: isActive ? "none" : "all 1s ease-in-out",
          }}
        >
          <CustomIcon
            type={particle.icon}
            size={particle.size}
            color={particle.color}
            rotation={particle.rotation}
            animationPhase={animationPhase} // Pass animation phase
            animate={isAnimationEnabled && (alwaysAnimate || scrollDirection !== "paused")}
          />
        </div>
      ))}
    </div>
  );
};