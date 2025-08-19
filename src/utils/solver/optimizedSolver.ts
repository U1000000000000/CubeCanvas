// src/utils/solver/optimizedSolver.ts

// Lazy-load worker
let worker: Worker | null = null;

export function solveScannedCubeAsync(
  cubeState: any,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (!worker) {
    worker = new Worker(
      new URL("./solverWorker.ts", import.meta.url),
      { type: "module" }
    );
  }

  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      const { solution, error } = event.data;
      if (solution) {
        worker?.removeEventListener("message", handleMessage);
        resolve(solution);
      } else if (error) {
        worker?.removeEventListener("message", handleMessage);
        reject(new Error(error));
      }
    };

    worker.addEventListener("message", handleMessage);

    // Send cube state to worker
    worker.postMessage({ cubeState });
  });
}
