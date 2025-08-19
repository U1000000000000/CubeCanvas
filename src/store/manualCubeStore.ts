// src/store/manualCubeStore.ts
import { create } from "zustand";
import { CubeColor, CubieState, Face } from "../types/cube";

// Standard cube colors for centers
const FACE_COLORS = {
  RIGHT: "red",
  LEFT: "orange",
  TOP: "white",
  BOTTOM: "yellow",
  FRONT: "green",
  BACK: "blue",
} as const;

function getInitialMaterials(x: number, y: number, z: number): CubeColor[] {
  const materials: CubeColor[] = ["gray", "gray", "gray", "gray", "gray", "gray"];
  // Fixed the bug: z was referenced instead of y for the back face
  if (x === 1 && y === 0 && z === 0) materials[0] = FACE_COLORS.RIGHT;
  if (x === -1 && y === 0 && z === 0) materials[1] = FACE_COLORS.LEFT;
  if (y === 1 && x === 0 && z === 0) materials[2] = FACE_COLORS.TOP;
  if (y === -1 && x === 0 && z === 0) materials[3] = FACE_COLORS.BOTTOM;
  if (z === 1 && x === 0 && y === 0) materials[4] = FACE_COLORS.FRONT;
  if (z === -1 && x === 0 && y === 0) materials[5] = FACE_COLORS.BACK;  // Fixed: was z === 0
  return materials;
}

function getCubieType(
  x: number,
  y: number,
  z: number
): "corner" | "edge" | "center" | "core" {
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  const absZ = Math.abs(z);
  if (absX === 0 && absY === 0 && absZ === 0) return "core";
  if (absX === 1 && absY === 1 && absZ === 1) return "corner";
  if (
    (absX === 1 && absY === 0 && absZ === 0) ||
    (absX === 0 && absY === 1 && absZ === 0) ||
    (absX === 0 && absY === 0 && absZ === 1)
  )
    return "center";
  return "edge";
}

function createManualCube(): CubieState[] {
  const cubies: CubieState[] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubies.push({
          position: { x, y, z },
          id: `${x},${y},${z}`,
          type: getCubieType(x, y, z),
          materials: getInitialMaterials(x, y, z),
        });
      }
    }
  }
  return cubies;
}

// --- FACE CYCLE MAPS (positions of 8 cubies on each face) ---
// For U face: when viewed from above, clockwise order should be:
// back-left, back-right, front-right, front-left (corners)
// back-center, right-center, front-center, left-center (edges)
const FACE_CYCLE_MAP: Record<Face, string[]> = {
  U: ["-1,1,-1","1,1,-1","1,1,1","-1,1,1","0,1,-1","1,1,0","0,1,1","-1,1,0"],
  D: ["-1,-1,-1","-1,-1,1","1,-1,1","1,-1,-1","0,-1,-1","1,-1,0","0,-1,1","-1,-1,0"],
  L: ["-1,1,-1","-1,1,1","-1,-1,1","-1,-1,-1","-1,1,0","-1,0,1","-1,-1,0","-1,0,-1"],
  R: ["1,1,-1","1,-1,-1","1,-1,1","1,1,1","1,0,-1","1,-1,0","1,0,1","1,1,0"],  
  F: ["-1,1,1","1,1,1","1,-1,1","-1,-1,1","0,1,1","1,0,1","0,-1,1","-1,0,1"],
  B: ["-1,1,-1","-1,-1,-1","1,-1,-1","1,1,-1","-1,0,-1","0,-1,-1","1,0,-1","0,1,-1"],
};

// Properly rotate materials when cubie rotates during face turns
function rotateCubieMaterials(cubie: CubieState, face: Face, clockwise: boolean): CubeColor[] {
  const m = [...cubie.materials];
  
  // For U face rotation, the key insight:
  // When a cubie moves from Right face → Back face position during U clockwise,
  // the sticker that was visible on the Right face should now be visible on the Back face
  
  // Face indices: [0:right(+x), 1:left(-x), 2:top(+y), 3:bottom(-y), 4:front(+z), 5:back(-z)]
  
  if (face === "U") {
    // During U rotation, cubies physically rotate 90° around Y axis
    // For a cubie moving from Right→Back position:
    // - What was on the right face (index 0) should now appear on the back face (index 5) 
    // - What was on the back face (index 5) should now appear on the left face (index 1)
    // - What was on the left face (index 1) should now appear on the front face (index 4)
    // - What was on the front face (index 4) should now appear on the right face (index 0)
    
    const newM = [...m];
    if (clockwise) {
      // Clockwise rotation around Y axis
      const tempRight = m[0];   // save right
      newM[0] = m[4];          // right ← front  
      newM[4] = m[1];          // front ← left
      newM[1] = m[5];          // left ← back
      newM[5] = tempRight;     // back ← right
      // Top and bottom faces don't change during Y rotation
      // newM[2] = m[2]; newM[3] = m[3]; (already copied)
    } else {
      // Counter-clockwise rotation around Y axis  
      const tempRight = m[0];   // save right
      newM[0] = m[5];          // right ← back
      newM[5] = m[1];          // back ← left  
      newM[1] = m[4];          // left ← front
      newM[4] = tempRight;     // front ← right
    }
    return newM;
  }
  
  // For now, just return original materials for other faces until we fix U
  return [...m];
}

function parsePosition(id: string): {x:number,y:number,z:number} {
  const [x,y,z] = id.split(",").map(Number);
  return {x,y,z};
}

// --- ROTATE FACE PERMUTATION ---
function rotateFacePermutation(cubies: CubieState[], face: Face, clockwise: boolean = true): CubieState[] {
  const ids = FACE_CYCLE_MAP[face];
  const tempCubies = ids.map(id => cubies.find(c=>c.id===id)!);
  const newCubies = [...cubies];

  for(let i=0;i<ids.length;i++){
    const fromCubie = clockwise ? tempCubies[(i+7)%8] : tempCubies[(i+1)%8];
    const targetIndex = cubies.findIndex(c=>c.id===ids[i]);
    const newPos = parsePosition(ids[i]);

    newCubies[targetIndex] = {
      ...fromCubie,
      position: newPos,
      id: ids[i],
      materials: rotateCubieMaterials(fromCubie, face, clockwise),
    };
  }

  return newCubies;
}

// --- STORE ---
interface ManualCubeStore {
  cubies: CubieState[];
  isAnimating: boolean;
  animatingFace: Face | null;
  rotationDirection: boolean | null;
  animatingCubies: string[];

  rotateFace: (face: Face, clockwise?: boolean) => void;
  updateCubiePositionsAndMaterials: (face: Face, clockwise: boolean) => void;
  setAnimatingCubies: (ids: string[]) => void;
  reset: () => void;
}

export const useManualCubeStore = create<ManualCubeStore>((set,get)=>({
  cubies: createManualCube(),
  isAnimating:false,
  animatingFace:null,
  rotationDirection:null,
  animatingCubies:[],

  setAnimatingCubies:(ids:string[])=>set({animatingCubies:ids}),

  rotateFace:(face,clockwise=true)=>{
    if(get().isAnimating) return;
    set({
      isAnimating:true,
      animatingFace:face,
      rotationDirection:clockwise,
      animatingCubies:FACE_CYCLE_MAP[face],
    });
  },

  updateCubiePositionsAndMaterials:(face,clockwise)=>{
    const cubies = get().cubies;
    const newCubies = rotateFacePermutation(cubies,face,clockwise);
    set({
      cubies:newCubies,
      isAnimating:false,
      animatingFace:null,
      rotationDirection:null,
      animatingCubies:[],
    });
  },

  reset:()=>set({
    cubies:createManualCube(),
    isAnimating:false,
    animatingFace:null,
    rotationDirection:null,
    animatingCubies:[],
  }),
}));