// BackgroundParticles.tsx
import React, { useEffect, useState, useRef } from "react";
// 1. Import only the required components and a custom list of icons.
import { CustomIcon, VIBRANT_COLORS } from "./IconSphere";

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

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  icon: string;
  rotationSpeed: number;
  rotation: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
  centerX: number;
  centerY: number;
}

interface BackgroundParticlesProps {
  isActive: boolean;
  particleCount?: number;
  scrollDirection?: "forward" | "reverse" | "paused";
  minDistance?: number;
}

// Helper function to calculate distance between two particles
const getDistance = (p1: Particle, p2: Particle): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Helper function to check if a position is valid (not too close to existing particles)
const isValidPosition = (
  x: number,
  y: number,
  size: number,
  existingParticles: Particle[],
  minDistance: number
): boolean => {
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
const findValidPosition = (
  existingParticles: Particle[],
  size: number,
  minDistance: number,
  maxRetries = 50
): { x: number; y: number; centerX: number; centerY: number } | null => {
  const screenCenterX = window.innerWidth / 2;
  const screenCenterY = window.innerHeight / 2;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const distributionPattern = Math.floor(Math.random() * 3);
    let centerX, centerY;

    if (distributionPattern === 0) {
      centerX = screenCenterX + (Math.random() - 0.5) * window.innerWidth * 0.6;
      centerY =
        screenCenterY + (Math.random() - 0.5) * window.innerHeight * 0.6;
    } else if (distributionPattern === 1) {
      const quadrant = Math.floor(Math.random() * 4);
      const offsetX = window.innerWidth * (0.2 + Math.random() * 0.3);
      const offsetY = window.innerHeight * (0.2 + Math.random() * 0.3);

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
    } else {
      centerX = size + Math.random() * (window.innerWidth - size * 2);
      centerY = size + Math.random() * (window.innerHeight - size * 2);
    }

    const orbitAngle = Math.random() * Math.PI * 2;
    const orbitRadius = Math.random() * 100 + 30;
    const x = centerX + Math.cos(orbitAngle) * orbitRadius;
    const y = centerY + Math.sin(orbitAngle) * orbitRadius;

    if (isValidPosition(x, y, size, existingParticles, minDistance)) {
      return { x, y, centerX, centerY };
    }
  }

  console.warn("Could not find valid position for particle, using fallback");
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    centerX: Math.random() * window.innerWidth,
    centerY: Math.random() * window.innerHeight,
  };
};

// Helper function to apply repulsion forces between particles
const applyRepulsionForces = (
  particles: Particle[],
  minDistance: number
): Particle[] => {
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

export const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({
  isActive,
  particleCount = 15,
  scrollDirection = "paused",
  minDistance = 80,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animationPhase, setAnimationPhase] = useState(0);
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
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
      const newParticles: Particle[] = [];

      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 40 + 30; // Slightly larger for better detail visibility

        const position = findValidPosition(newParticles, size, minDistance);
        if (!position) continue;

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

    // Only animate when scrolling (not when paused)
    if (scrollDirection === "paused" && isAnimationEnabled) {
      console.log("🎨 Animation paused - no scroll detected");
      return;
    }

    console.log("🎨 Starting animation with direction:", scrollDirection);

    const animate = () => {
      const directionMultiplier = scrollDirection === "reverse" ? -1 : 1;
      const speedMultiplier = 3;

      setParticles((prevParticles) => {
        // First, update particle positions
        let updatedParticles = prevParticles.map((particle) => {
          // Orbital motion with direction control and increased speed
          const newOrbitAngle =
            particle.orbitAngle +
            particle.orbitSpeed * directionMultiplier * speedMultiplier;
          const newX =
            particle.centerX + Math.cos(newOrbitAngle) * particle.orbitRadius;
          const newY =
            particle.centerY + Math.sin(newOrbitAngle) * particle.orbitRadius;

          // Wrap around screen edges
          let wrappedX = newX;
          let wrappedY = newY;
          let newCenterX = particle.centerX;
          let newCenterY = particle.centerY;

          if (newX < -particle.size) {
            wrappedX = window.innerWidth + particle.size;
            newCenterX = window.innerWidth + particle.size;
          } else if (newX > window.innerWidth + particle.size) {
            wrappedX = -particle.size;
            newCenterX = -particle.size;
          }

          if (newY < -particle.size) {
            wrappedY = window.innerHeight + particle.size;
            newCenterY = window.innerHeight + particle.size;
          } else if (newY > window.innerHeight + particle.size) {
            wrappedY = -particle.size;
            newCenterY = -particle.size;
          }

          return {
            ...particle,
            x: wrappedX,
            y: wrappedY,
            centerX: newCenterX,
            centerY: newCenterY,
            orbitAngle: newOrbitAngle,
            rotation:
              particle.rotation +
              particle.rotationSpeed * directionMultiplier * speedMultiplier,
          };
        });

        // Then apply repulsion forces to maintain spacing
        updatedParticles = applyRepulsionForces(updatedParticles, minDistance);

        return updatedParticles;
      });

      // 🔥 CRITICAL: Continue animation only if still scrolling and active
      if (isActive && scrollDirection !== "paused") {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        console.log(
          "🎨 Animation loop ended - isActive:",
          isActive,
          "scrollDirection:",
          scrollDirection
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
  }, [isActive, scrollDirection, particles.length, minDistance, isAnimationEnabled]);

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
            animate={isAnimationEnabled && scrollDirection !== "paused"}
          />
        </div>
      ))}
    </div>
  );
};