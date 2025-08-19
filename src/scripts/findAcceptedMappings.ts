// scripts/findAcceptedMappings.ts
// Run with: node scripts/findAcceptedMappings.ts

// @ts-ignore
import solve from 'rubiks-cube-solver';

const colors = ['white', 'yellow', 'red', 'orange', 'green', 'blue'];
const faces = ['U', 'R', 'F', 'D', 'L', 'B'];

// Generate permutations
function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(remaining)) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

const allMappings = permutations(colors);
const accepted: { mapping: Record<string, string>, notation: string }[] = [];

let tested = 0;
for (const perm of allMappings) {
  tested++;

  // Build colorToFace mapping for this permutation
  const colorToFace: Record<string, string> = {};
  for (let i = 0; i < colors.length; i++) {
    colorToFace[perm[i]] = faces[i];
  }

  // Build solved cube notation in U,R,F,D,L,B order
  let notation = '';
  for (const face of faces) {
    notation += face.repeat(9);
  }

  // Replace with colors mapped to faces
  // In solved cube each face has same color, so reverse map:
  const reverseMap: Record<string, string> = {};
  for (let color in colorToFace) {
    reverseMap[colorToFace[color]] = color;
  }

  let coloredNotation = '';
  for (const face of notation) {
    const color = reverseMap[face];
    const mappedFace = colorToFace[color];
    coloredNotation += mappedFace;
  }

  try {
    solve(coloredNotation); // Just to check if it's accepted
    accepted.push({ mapping: colorToFace, notation: coloredNotation });
    console.log(`✅ Accepted mapping #${accepted.length}:`, colorToFace);
  } catch (err) {
    // ignore
  }
}

console.log(`\nTested ${tested} mappings, accepted ${accepted.length}.`);
console.log("Paste this list into solver.ts:");
console.log(JSON.stringify(accepted, null, 2));
