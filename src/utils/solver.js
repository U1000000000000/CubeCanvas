// Cube solving utilities using cubejs
import Cube from 'cubejs';

// Map colors to cubejs face notation
const colorToFace = {
  white: 'U',
  yellow: 'D',
  red: 'F',
  orange: 'B',
  green: 'R',
  blue: 'L'
};

export function scannedStateToNotation(scannedState) {
  // Order: U, R, F, D, L, B (each face 9 stickers, left-to-right, top-to-bottom)
  let sequence = '';
  ['U', 'R', 'F', 'D', 'L', 'B'].forEach(face => {
    scannedState[face].forEach(color => {
      sequence += colorToFace[color];
    });
  });
  return sequence;
}

export function solveScannedCube(scannedState) {
  try {
    const notation = scannedStateToNotation(scannedState);
    console.log('Cube notation:', notation);
    
    const cube = new Cube();
    cube.fromString(notation);
    const solution = cube.solve();
    
    console.log('Solution moves:', solution);
    return solution;
  } catch (error) {
    console.error('Error solving cube:', error);
    throw new Error('Unable to solve cube. Please check the scanned colors.');
  }
}

// Parse move notation and convert to our rotation system
export function parseMoves(moveString) {
  if (!moveString) return [];
  
  const moves = moveString.split(' ').filter(move => move.trim());
  return moves.map(move => {
    const face = move[0];
    const clockwise = !move.includes("'");
    const double = move.includes('2');
    
    return { face, clockwise, double };
  });
}