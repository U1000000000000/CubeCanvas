// // src/pages/ManualSolvePage.tsx
// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { ArrowLeft, Home, Palette, Zap, RotateCcw } from "lucide-react";
// import { ManualCube } from "../components/manual/ManualCube";
// import { ColorPalette } from "../components/manual/ColorPalette";
// import { useCubeStore } from "../store/cubeStore";
// import { CubeColor } from "../types/cube";
// import { solveScannedCubeAsync } from "../utils/solver/optimizedSolver";
// import { parseMoves } from "../utils/solver";

// // Standard center colors for a solved cube
// const CENTER_COLORS: Record<string, CubeColor> = {
//   "0,1,0": "white", // Top center (U)
//   "0,-1,0": "yellow", // Bottom center (D)
//   "1,0,0": "red", // Right center (R)
//   "-1,0,0": "orange", // Left center (L)
//   "0,0,1": "green", // Front center (F)
//   "0,0,-1": "blue", // Back center (B)
// };

// export function ManualSolvePage() {
//   const [selectedColor, setSelectedColor] = useState<CubeColor | null>(null);
//   const [stickerColors, setStickerColors] = useState<
//     Record<string, CubeColor[]>
//   >({});
//   const [isComplete, setIsComplete] = useState(false);
//   const [isSolving, setIsSolving] = useState(false);
//   const [solutionMoves, setSolutionMoves] = useState<string>("");
//   const [error, setError] = useState<string>("");

//   const { cubies, rotateFace, reset, isAnimating } = useCubeStore();

//   // Initialize sticker colors
//   useEffect(() => {
//     const initialColors: Record<string, CubeColor[]> = {};
//     cubies.forEach((cubie) => {
//       const colors: CubeColor[] = [
//         "gray",
//         "gray",
//         "gray",
//         "gray",
//         "gray",
//         "gray",
//       ];
//       const idKey = `${cubie.position.x},${cubie.position.y},${cubie.position.z}`;
//       if (CENTER_COLORS[idKey]) {
//         const { x, y, z } = cubie.position;
//         if (x === 1) colors[0] = "red";
//         if (x === -1) colors[1] = "orange";
//         if (y === 1) colors[2] = "white";
//         if (y === -1) colors[3] = "yellow";
//         if (z === 1) colors[4] = "green";
//         if (z === -1) colors[5] = "blue";
//       }
//       initialColors[idKey] = colors;
//     });
//     setStickerColors(initialColors);
//   }, [cubies]);

//   // ✅ Check if cube is complete (ignore centers and hidden/internal faces)
//   useEffect(() => {
//     const incomplete = Object.entries(stickerColors).some(([id, colors]) => {
//       if (CENTER_COLORS[id]) return false; // skip center cubies entirely

//       const [x, y, z] = id.split(",").map(Number);
//       const visibleFaces: number[] = [];

//       // Determine which faces are visible for this cubie
//       if (x === 1) visibleFaces.push(0); // right
//       if (x === -1) visibleFaces.push(1); // left
//       if (y === 1) visibleFaces.push(2); // up
//       if (y === -1) visibleFaces.push(3); // down
//       if (z === 1) visibleFaces.push(4); // front
//       if (z === -1) visibleFaces.push(5); // back

//       // Only check visible stickers for 'gray'
//       return visibleFaces.some((faceIdx) => colors[faceIdx] === "gray");
//     });

//     setIsComplete(!incomplete);
//     console.log("Cube completion status:", !incomplete);
//   }, [stickerColors]);

//   const handleStickerClick = (cubieId: string, faceIndex: number) => {
//     if (!selectedColor || isAnimating || isSolving) return;
//     setStickerColors((prev) => ({
//       ...prev,
//       [cubieId]:
//         prev[cubieId]?.map((color, index) =>
//           index === faceIndex ? selectedColor : color
//         ) || [],
//     }));
//   };

//   const resetCube = () => {
//     setIsSolving(false);
//     setSolutionMoves("");
//     setError("");
//     reset();

//     const initialColors: Record<string, CubeColor[]> = {};
//     cubies.forEach((cubie) => {
//       const colors: CubeColor[] = [
//         "gray",
//         "gray",
//         "gray",
//         "gray",
//         "gray",
//         "gray",
//       ];
//       const idKey = `${cubie.position.x},${cubie.position.y},${cubie.position.z}`;
//       if (CENTER_COLORS[idKey]) {
//         const { x, y, z } = cubie.position;
//         if (x === 1) colors[0] = "red";
//         if (x === -1) colors[1] = "orange";
//         if (y === 1) colors[2] = "white";
//         if (y === -1) colors[3] = "yellow";
//         if (z === 1) colors[4] = "green";
//         if (z === -1) colors[5] = "blue";
//       }
//       initialColors[idKey] = colors;
//     });
//     setStickerColors(initialColors);
//   };

//   // const solveCube = async () => {
//   //   if (!isComplete || isSolving) return;
//   //   setIsSolving(true);
//   //   setError("");

//   //   try {
//   //     // Helper: row-major order sort
//   //     const rowMajor = (
//   //       a: any,
//   //       b: any,
//   //       axis1: "x" | "y" | "z",
//   //       axis2: "x" | "y" | "z",
//   //       invert1 = false,
//   //       invert2 = false
//   //     ) => {
//   //       if (
//   //         (invert1 ? -a[axis1] : a[axis1]) !== (invert1 ? -b[axis1] : b[axis1])
//   //       ) {
//   //         return (
//   //           (invert1 ? -a[axis1] : a[axis1]) - (invert1 ? -b[axis1] : b[axis1])
//   //         );
//   //       }
//   //       return (
//   //         (invert2 ? -a[axis2] : a[axis2]) - (invert2 ? -b[axis2] : b[axis2])
//   //       );
//   //     };

//   //     // Build cubeState from stickerColors
//   //     const cubeState = { U: [], R: [], F: [], D: [], L: [], B: [] } as Record<
//   //       string,
//   //       CubeColor[]
//   //     >;

//   //     const entries = Object.entries(stickerColors).map(([id, colors]) => {
//   //       const [x, y, z] = id.split(",").map(Number);
//   //       return { x, y, z, colors };
//   //     });

//   //     // U (y = 1), order z desc → x asc
//   //     entries
//   //       .filter((c) => c.y === 1)
//   //       .sort((a, b) => rowMajor(a, b, "z", "x", true, false))
//   //       .forEach((c) => cubeState.U.push(c.colors[2]));

//   //     // R (x = 1), order y desc → z desc
//   //     entries
//   //       .filter((c) => c.x === 1)
//   //       .sort((a, b) => rowMajor(a, b, "y", "z", true, true))
//   //       .forEach((c) => cubeState.R.push(c.colors[0]));

//   //     // F (z = 1), order y desc → x asc
//   //     entries
//   //       .filter((c) => c.z === 1)
//   //       .sort((a, b) => rowMajor(a, b, "y", "x", true, false))
//   //       .forEach((c) => cubeState.F.push(c.colors[4]));

//   //     // D (y = -1), order z asc → x asc
//   //     entries
//   //       .filter((c) => c.y === -1)
//   //       .sort((a, b) => rowMajor(a, b, "z", "x", false, false))
//   //       .forEach((c) => cubeState.D.push(c.colors[3]));

//   //     // L (x = -1), order y desc → z asc
//   //     entries
//   //       .filter((c) => c.x === -1)
//   //       .sort((a, b) => rowMajor(a, b, "y", "z", true, false))
//   //       .forEach((c) => cubeState.L.push(c.colors[1]));

//   //     // B (z = -1), order y desc → x desc
//   //     entries
//   //       .filter((c) => c.z === -1)
//   //       .sort((a, b) => rowMajor(a, b, "y", "x", true, true))
//   //       .forEach((c) => cubeState.B.push(c.colors[5]));

//   //     // ✅ now cubeState exists
//   //     const solution = await solveScannedCubeAsync(cubeState);
//   //     setSolutionMoves(solution);

//   //     const moves = parseMoves(solution);
//   //     for (let i = 0; i < moves.length; i++) {
//   //       const move = moves[i];
//   //       await new Promise((res) => setTimeout(res, i === 0 ? 0 : 800));
//   //       rotateFace(move.face, move.clockwise);
//   //       if (move.double) {
//   //         await new Promise((res) => setTimeout(res, 400));
//   //         rotateFace(move.face, move.clockwise);
//   //       }
//   //     }
//   //   } catch (err: any) {
//   //     console.error("Solving error:", err);
//   //     setError("Cannot solve this cube: " + err.message);
//   //   } finally {
//   //     setIsSolving(false);
//   //   }
//   // };

//   const solveCube = async () => {
//     if (!isComplete || isSolving) return;
//     setIsSolving(true);
//     setError("");

//     try {
//       // 🔹 Hardcoded dummy solution
//       const solution = "R U R' U'";

//       setSolutionMoves(solution);

//       const moves = parseMoves(solution);
//       for (let i = 0; i < moves.length; i++) {
//         const move = moves[i];
//         await new Promise((res) => setTimeout(res, i === 0 ? 0 : 800));
//         rotateFace(move.face, move.clockwise);
//         if (move.double) {
//           await new Promise((res) => setTimeout(res, 400));
//           rotateFace(move.face, move.clockwise);
//         }
//       }
//     } catch (err: any) {
//       console.error("Solving error:", err);
//       setError("Something went wrong while solving (stub mode).");
//     } finally {
//       setIsSolving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
//       <header className="p-4 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <Link
//             to="/"
//             className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
//           >
//             <ArrowLeft className="w-4 h-4" /> Back to Menu
//           </Link>
//           <Link
//             to="/"
//             className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
//           >
//             <Home className="w-4 h-4" /> Home
//           </Link>
//         </div>
//         <div className="flex items-center gap-3">
//           <Palette className="w-6 h-6 text-white" />
//           <h1 className="text-2xl font-bold text-white">Manual Cube Solver</h1>
//           <span className="text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
//             Click to Paint
//           </span>
//         </div>
//         <div className="w-32" />
//       </header>

//       <div className="flex-1 flex gap-6 p-6 max-w-7xl mx-auto w-full">
//         <div className="w-80 space-y-6">
//           <ColorPalette
//             onColorSelect={setSelectedColor}
//             selectedColor={selectedColor}
//           />
//           <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
//             <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <span className="text-white/80">Completion:</span>
//                 <span
//                   className={isComplete ? "text-green-400" : "text-yellow-400"}
//                 >
//                   {isComplete ? "Ready to Solve" : "In Progress"}
//                 </span>
//               </div>
//               {solutionMoves && (
//                 <div className="mt-4">
//                   <p className="text-white/80 text-sm mb-2">Solution:</p>
//                   <div className="bg-black/30 rounded-lg p-3 text-white font-mono text-sm">
//                     {solutionMoves}
//                   </div>
//                 </div>
//               )}
//               {error && (
//                 <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
//                   <p className="text-red-300 text-sm">{error}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
//             <h3 className="text-lg font-semibold text-white mb-4">Controls</h3>
//             <div className="space-y-3">
//               <button
//                 onClick={solveCube}
//                 disabled={!isComplete || isSolving || isAnimating}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-lg text-white font-semibold"
//               >
//                 <Zap className="w-5 h-5" />
//                 {isSolving ? "Solving..." : "Solve Cube"}
//               </button>
//               <button
//                 onClick={resetCube}
//                 disabled={isAnimating || isSolving}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-semibold"
//               >
//                 <RotateCcw className="w-5 h-5" /> Reset Cube
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="flex-1 min-h-[600px] rounded-2xl overflow-hidden border border-white/10">
//           <ManualCube
//             onStickerClick={handleStickerClick}
//             stickerColors={stickerColors}
//           />
//         </div>
//       </div>

//       <footer className="p-4 text-center text-white/50 text-sm">
//         Manual Cube Solver • Click colors then click stickers to paint • Centers
//         are pre-filled
//       </footer>
//     </div>
//   );
// }

















// src/pages/ManualSolvePage.tsx
import React, { useState, useEffect } from "react";
import { ManualCube } from "../components/manual/ManualCube";
import { useManualCubeStore } from "../store/manualCubeStore";   
import { CubeColor } from "../types/cube";
import { parseMoves } from "../utils/solver";

const COLORS: CubeColor[] = ["white", "yellow", "red", "orange", "green", "blue"];

export function ManualSolvePage() {
  const [selectedColor, setSelectedColor] = useState<CubeColor>("white");
  const [isComplete, setIsComplete] = useState(false);

  const { cubies, rotateFace, isAnimating } = useManualCubeStore();

  // Log cubies for debugging
  useEffect(() => {
    console.log("Cubies updated:", cubies.map(c => ({
      id: c.id,
      position: c.position,
      materials: c.materials
    })));
  }, [cubies]);

  // Check completion status
  useEffect(() => {
    if (!cubies.length) return;
    const anyIncomplete = cubies.some((cubie) => {
      const faces = cubie.materials;
      if (!faces) return true;
      const { x, y, z } = cubie.position;
      const visible: number[] = [];
      if (x === 1) visible.push(0);
      if (x === -1) visible.push(1);
      if (y === 1) visible.push(2);
      if (y === -1) visible.push(3);
      if (z === 1) visible.push(4);
      if (z === -1) visible.push(5);
      return visible.some((i) => faces[i] === "gray");
    });
    setIsComplete(!anyIncomplete);
  }, [cubies]);

  const handleStickerClick = (cubieId: string, faceIndex: number) => {
    if (isAnimating) return;
    
    console.log(`Clicked cubie ${cubieId}, face ${faceIndex}, setting to ${selectedColor}`);
    
    // Update the store's cubie materials directly
    const { cubies: currentCubies } = useManualCubeStore.getState();
    const updatedCubies = currentCubies.map(cubie => {
      if (cubie.id === cubieId) {
        const newMaterials = [...cubie.materials];
        newMaterials[faceIndex] = selectedColor;
        console.log(`Updated cubie ${cubieId} materials:`, newMaterials);
        return { ...cubie, materials: newMaterials };
      }
      return cubie;
    });
    
    useManualCubeStore.setState({ cubies: updatedCubies });
  };

  const solveCube = async () => {
    console.log("=== BEFORE U MOVE ===");
    
    // Log the top 3 cubies of each face before the move
    const rightTopCubies = cubies.filter(c => c.position.x === 1 && c.position.y === 1);
    const backTopCubies = cubies.filter(c => c.position.z === -1 && c.position.y === 1);  
    const leftTopCubies = cubies.filter(c => c.position.x === -1 && c.position.y === 1);
    const frontTopCubies = cubies.filter(c => c.position.z === 1 && c.position.y === 1);
    
    console.log("Right face top 3:", rightTopCubies.map(c => ({
      id: c.id, 
      rightFaceColor: c.materials[0] // index 0 = right face
    })));
    console.log("Back face top 3:", backTopCubies.map(c => ({
      id: c.id,
      backFaceColor: c.materials[5] // index 5 = back face  
    })));
    console.log("Left face top 3:", leftTopCubies.map(c => ({
      id: c.id,
      leftFaceColor: c.materials[1] // index 1 = left face
    })));
    console.log("Front face top 3:", frontTopCubies.map(c => ({
      id: c.id, 
      frontFaceColor: c.materials[4] // index 4 = front face
    })));
    
    const solution = "U";
    const moves = parseMoves(solution);
    
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      console.log(`\n=== EXECUTING ${move.face} ${move.clockwise ? 'CLOCKWISE' : 'COUNTERCLOCKWISE'} ===`);
      
      await new Promise((res) => setTimeout(res, i === 0 ? 0 : 600));
      rotateFace(move.face, move.clockwise);
      
      if (move.double) {
        await new Promise((res) => setTimeout(res, 300));
        rotateFace(move.face, move.clockwise);
      }
      
      // Wait for animation and state update
      await new Promise((res) => setTimeout(res, 800));
      
      console.log("=== AFTER U MOVE ===");
      const newCubies = useManualCubeStore.getState().cubies;
      
      const newRightTopCubies = newCubies.filter(c => c.position.x === 1 && c.position.y === 1);
      const newBackTopCubies = newCubies.filter(c => c.position.z === -1 && c.position.y === 1);
      const newLeftTopCubies = newCubies.filter(c => c.position.x === -1 && c.position.y === 1); 
      const newFrontTopCubies = newCubies.filter(c => c.position.z === 1 && c.position.y === 1);
      
      console.log("NEW Right face top 3:", newRightTopCubies.map(c => ({
        id: c.id,
        rightFaceColor: c.materials[0]
      })));
      console.log("NEW Back face top 3:", newBackTopCubies.map(c => ({
        id: c.id,
        backFaceColor: c.materials[5]
      })));
      console.log("NEW Left face top 3:", newLeftTopCubies.map(c => ({
        id: c.id,
        leftFaceColor: c.materials[1] 
      })));
      console.log("NEW Front face top 3:", newFrontTopCubies.map(c => ({
        id: c.id,
        frontFaceColor: c.materials[4]
      })));
    }
  };

  // Create stickerColors from cubies materials
  const stickerColors = React.useMemo(() => {
    const colors: Record<string, CubeColor[]> = {};
    cubies.forEach(cubie => {
      colors[cubie.id] = cubie.materials;
    });
    return colors;
  }, [cubies]);

  return (
    <div className="w-screen h-screen bg-orange-500 relative flex items-center justify-center">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-3 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 shadow-lg z-50">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`w-10 h-10 rounded-full border-2 ${selectedColor===color ? "border-black scale-110":"border-gray-300"}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <ManualCube onStickerClick={handleStickerClick} stickerColors={stickerColors} />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          onClick={solveCube}
          className="px-6 py-3 bg-black text-white font-bold rounded-full shadow-lg"
        >
          Test U Move
        </button>
        <button
          onClick={() => useManualCubeStore.getState().reset()}
          className="px-6 py-3 bg-gray-600 text-white font-bold rounded-full shadow-lg"
        >
          Reset
        </button>
      </div>

      {/* Debug info */}
      <div className="absolute top-20 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
        <div>Selected: {selectedColor}</div>
        <div>Complete: {isComplete ? 'Yes' : 'No'}</div>
        <div>Animating: {isAnimating ? 'Yes' : 'No'}</div>
        <div>Centers:</div>
        {cubies.filter(c => c.type === 'center').map(c => (
          <div key={c.id}>
            {c.id}: [{c.materials.map((m,i) => m !== 'gray' ? `${i}:${m}` : '').filter(Boolean).join(', ')}]
          </div>
        ))}
      </div>
    </div>
  );
}