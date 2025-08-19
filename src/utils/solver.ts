// src/utils/solver/solver.ts
import { solution } from '/Users/ujjvalagarwal/Serious/Trillion Fold Worlds/Projects/webD/CubeCanvas /project 2/src/utils/solver/search.ts';

// Map colors to facelet letters (U, R, F, D, L, B)
const COLOR_TO_FACELET: Record<string, string> = {
  white: 'U',
  yellow: 'D',
  red: 'R',
  orange: 'L',
  green: 'F',
  blue: 'B',
};

/**
 * Convert cube state to a 54-character facelet string for the solver.
 * The order must be: U, R, F, D, L, B (each face in row-major order).
 */
function cubeStateToFacelets(cubeState: Record<string, string[]>): string {
  const faces = ['U', 'R', 'F', 'D', 'L', 'B'];
  let facelets = '';

  for (const face of faces) {
    if (!cubeState[face] || cubeState[face].length !== 9) {
      throw new Error(`Invalid cubeState: face ${face} is missing or does not have 9 stickers.`);
    }

    // Convert colors to facelet letters (e.g., "white" → "U")
    const faceStickers = cubeState[face].map((color) => {
      const facelet = COLOR_TO_FACELET[color.toLowerCase()];
      if (!facelet) {
        throw new Error(`Invalid color ${color} for face ${face}.`);
      }
      return facelet;
    });

    facelets += faceStickers.join('');
  }

  return facelets;
}

/**
 * Solve a scanned cube using Kociemba's two-phase algorithm.
 */
export function solveScannedCube(cubeState: Record<string, string[]>): string {
  const facelets = cubeStateToFacelets(cubeState);
  console.log('Generated facelets for solver:', facelets); // Debug output

  // Validate the facelet string (must be 54 chars, with 9 U, 9 R, etc.)
  const colorCounts: Record<string, number> = { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 };
  for (const ch of facelets) {
    if (!colorCounts.hasOwnProperty(ch)) {
      throw new Error(`Invalid facelet character: ${ch}`);
    }
    colorCounts[ch]++;
  }

  for (const face of ['U', 'R', 'F', 'D', 'L', 'B']) {
    if (colorCounts[face] !== 9) {
      throw new Error(`Invalid cube: face ${face} has ${colorCounts[face]} stickers (expected 9).`);
    }
  }

  // Call the solver
  const sol = solution(facelets, 21, 12, false);
  if (sol === null) {
    throw new Error('Solver timed out or cube is unsolvable.');
  }

  return sol;
}

/**
 * Parse a solution string into move objects.
 */
export function parseMoves(solution: string) {
  if (!solution) return [];
  return solution.trim().split(/\s+/).map((token) => {
    const face = token[0] as 'U' | 'D' | 'L' | 'R' | 'F' | 'B';
    const clockwise = !token.includes("'");
    const double = token.includes("2");
    return { face, clockwise, double };
  });
}
