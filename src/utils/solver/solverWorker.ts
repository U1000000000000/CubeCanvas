import { solveScannedCube } from "/Users/ujjvalagarwal/Serious/Trillion Fold Worlds/Projects/webD/CubeCanvas /project 2/src/utils/solver.ts";

self.onmessage = (event: MessageEvent) => {
  const { cubeState } = event.data;

  try {
    const solution = solveScannedCube(cubeState);
    self.postMessage({ solution });
  } catch (err: any) {
    self.postMessage({ error: err.message });
  }
};