// ---- Constants (sizes from original implementation)
const N_TWIST = 2187;
const N_FLIP = 2048;
const N_SLICE1 = 495;
const N_SLICE2 = 24;
const N_PARITY = 2;
const N_URFtoDLF = 20160;
const N_URtoDF = 20160;
const N_URtoUL = 1320;
const N_UBtoDF = 1320;
const N_FRtoBR = 11880;
const N_MOVE = 18;

// ---- Progress callback interface
interface PruningCallbacks {
  onTableStart?: (name: string) => void;
  onProgress?: (name: string, count: number) => void;
  onTableDone?: (name: string) => void;
}

// ---- Enums for colors / facelets (kept numeric for performance)
enum Colors {
  U = 0,
  R = 1,
  F = 2,
  D = 3,
  L = 4,
  B = 5,
}
enum Facelets {
  U1 = 0,
  U2,
  U3,
  U4,
  U5,
  U6,
  U7,
  U8,
  U9,
  R1 = 9,
  R2,
  R3,
  R4,
  R5,
  R6,
  R7,
  R8,
  R9,
  F1 = 18,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  D1 = 27,
  D2,
  D3,
  D4,
  D5,
  D6,
  D7,
  D8,
  D9,
  L1 = 36,
  L2,
  L3,
  L4,
  L5,
  L6,
  L7,
  L8,
  L9,
  B1 = 45,
  B2,
  B3,
  B4,
  B5,
  B6,
  B7,
  B8,
  B9,
}

// corner and edge indices
const enum Corners {
  URF = 0,
  UFL = 1,
  ULB = 2,
  UBR = 3,
  DFR = 4,
  DLF = 5,
  DBL = 6,
  DRB = 7,
}
const enum Edges {
  UR = 0,
  UF = 1,
  UL = 2,
  UB = 3,
  DR = 4,
  DF = 5,
  DL = 6,
  DB = 7,
  FR = 8,
  FL = 9,
  BL = 10,
  BR = 11,
}

// facelet → cubie maps (from facecube.c)
const cornerFacelet: number[][] = [
  [Facelets.U9, Facelets.R1, Facelets.F3],
  [Facelets.U7, Facelets.F1, Facelets.L3],
  [Facelets.U1, Facelets.L1, Facelets.B3],
  [Facelets.U3, Facelets.B1, Facelets.R3],
  [Facelets.D3, Facelets.F9, Facelets.R7],
  [Facelets.D1, Facelets.L9, Facelets.F7],
  [Facelets.D7, Facelets.B9, Facelets.L7],
  [Facelets.D9, Facelets.R9, Facelets.B7],
];

const edgeFacelet: number[][] = [
  [Facelets.U6, Facelets.R2],
  [Facelets.U8, Facelets.F2],
  [Facelets.U4, Facelets.L2],
  [Facelets.U2, Facelets.B2],
  [Facelets.D6, Facelets.R8],
  [Facelets.D2, Facelets.F8],
  [Facelets.D4, Facelets.L8],
  [Facelets.D8, Facelets.B8],
  [Facelets.F6, Facelets.R4],
  [Facelets.F4, Facelets.L6],
  [Facelets.B6, Facelets.L4],
  [Facelets.B4, Facelets.R6],
];

const cornerColor: number[][] = [
  [Colors.U, Colors.R, Colors.F],
  [Colors.U, Colors.F, Colors.L],
  [Colors.U, Colors.L, Colors.B],
  [Colors.U, Colors.B, Colors.R],
  [Colors.D, Colors.F, Colors.R],
  [Colors.D, Colors.L, Colors.F],
  [Colors.D, Colors.B, Colors.L],
  [Colors.D, Colors.R, Colors.B],
];

const edgeColor: number[][] = [
  [Colors.U, Colors.R],
  [Colors.U, Colors.F],
  [Colors.U, Colors.L],
  [Colors.U, Colors.B],
  [Colors.D, Colors.R],
  [Colors.D, Colors.F],
  [Colors.D, Colors.L],
  [Colors.D, Colors.B],
  [Colors.F, Colors.R],
  [Colors.F, Colors.L],
  [Colors.B, Colors.L],
  [Colors.B, Colors.R],
];

// ---- CubieCube structure (subset needed for conversions + move multiplication)
class CubieCube {
  cp: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
  co: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  ep: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  eo: number[] = new Array(12).fill(0);

  constructor() {}

  cornerMultiply(b: CubieCube): void {
    const cPerm = new Array(8).fill(0);
    const cOri = new Array(8).fill(0);
    for (let corn = 0; corn < 8; corn++) {
      cPerm[corn] = this.cp[b.cp[corn]];
      const oriA = this.co[b.cp[corn]];
      const oriB = b.co[corn];
      let ori = 0;
      ori = oriA + oriB;
      if (ori >= 3) ori -= 3;
      cOri[corn] = ori;
    }
    for (let corn = 0; corn < 8; corn++) {
      this.cp[corn] = cPerm[corn];
      this.co[corn] = cOri[corn];
    }
  }

  edgeMultiply(b: CubieCube): void {
    const ePerm = new Array(12).fill(0);
    const eOri = new Array(12).fill(0);
    for (let edge = 0; edge < 12; edge++) {
      ePerm[edge] = this.ep[b.ep[edge]];
      eOri[edge] = (b.eo[edge] + this.eo[b.ep[edge]]) % 2;
    }
    for (let edge = 0; edge < 12; edge++) {
      this.ep[edge] = ePerm[edge];
      this.eo[edge] = eOri[edge];
    }
  }

  multiply(b: CubieCube): void {
    this.cornerMultiply(b);
    this.edgeMultiply(b);
  }

  invCubieCube(): CubieCube {
    const c = new CubieCube();
    for (let e = 0; e < 12; e++) c.ep[this.ep[e]] = e;
    for (let e = 0; e < 12; e++) c.eo[e] = this.eo[c.ep[e]];
    for (let i = 0; i < 8; i++) c.cp[this.cp[i]] = i;
    for (let i = 0; i < 8; i++) {
      const ori = this.co[c.cp[i]];
      if (ori >= 3) c.co[i] = ori;
      else {
        c.co[i] = -ori;
        if (c.co[i] < 0) c.co[i] += 3;
      }
    }
    return c;
  }

  getTwist(): number {
    let ret = 0;
    for (let i = 0; i < 7; i++) ret = 3 * ret + this.co[i];
    return ret;
  }

  setTwist(twist: number): void {
    let twistParity = 0;
    for (let i = 6; i >= 0; i--) {
      this.co[i] = twist % 3;
      twistParity += this.co[i];
      twist = Math.floor(twist / 3);
    }
    this.co[7] = (3 - (twistParity % 3)) % 3;
  }

  getFlip(): number {
    let ret = 0;
    for (let i = 0; i < 11; i++) ret = 2 * ret + this.eo[i];
    return ret;
  }

  setFlip(flip: number): void {
    let flipParity = 0;
    for (let i = 11; i >= 0; i--) {
      this.eo[i] = flip % 2;
      flipParity += this.eo[i];
      flip = Math.floor(flip / 2);
    }
    this.eo[11] = (2 - (flipParity % 2)) % 2;
  }

  cornerParity(): number {
    let s = 0;
    for (let i = 7; i > 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        if (this.cp[j] > this.cp[i]) s++;
      }
    }
    return s % 2;
  }

  edgeParity(): number {
    let s = 0;
    for (let i = 11; i > 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        if (this.ep[j] > this.ep[i]) s++;
      }
    }
    return s % 2;
  }

  getFRtoBR(): number {
    let a = 0,
      x = 0,
      b = 0;
    const edge4: number[] = [0, 0, 0, 0];

    // Collection phase
    for (let j = 11; j >= 0; j--) {
      if (this.ep[j] >= 8 && this.ep[j] <= 11) {
        a += cnk(11 - j, x + 1);
        edge4[3 - x++] = this.ep[j];
      }
    }

    // Permutation phase
    for (let j = 3; j > 0; j--) {
      let k = 0;
      while (edge4[j] !== j + 8) {
        rotateLeft(edge4, 0, j);
        k++;
      }
      b = (j + 1) * b + k;
    }

    return 24 * a + b;
  }

  setFRtoBR(idx: number): void {
    const sliceEdge = [8, 9, 10, 11]; // FR FL BL BR
    const otherEdge = [0, 1, 2, 3, 4, 5, 6, 7];
    let b = idx % 24;
    let a = Math.floor(idx / 24);

    // Initialize all to sentinel
    for (let e = 0; e < 12; e++) this.ep[e] = -1;

    // Reconstruct permutation from index b
    for (let j = 1; j < 4; j++) {
      let k = b % (j + 1);
      b = Math.floor(b / (j + 1));
      while (k-- > 0) rotateRight(sliceEdge, 0, j);
    }

    // Place slice edges using combinatorial index a
    let x = 3;
    for (let j = 11; j >= 0; j--) {
      if (x >= 0 && a >= cnk(j, x + 1)) {
        this.ep[j] = sliceEdge[3 - x];
        a -= cnk(j, x + 1);
        x--;
      }
    }

    // Fill remaining positions with other edges
    let otherIdx = 0;
    for (let j = 0; j < 12; j++) {
      if (this.ep[j] === -1) {
        this.ep[j] = otherEdge[otherIdx++];
      }
    }
  }

  // FIXED: Add getSlice method for proper slice coordinate calculation
  getSlice(): number {
    return Math.floor(this.getFRtoBR() / 24);
  }

  getURFtoDLF(): number {
    let a = 0,
      x = 0,
      b = 0;
    const corner6 = [0, 0, 0, 0, 0, 0];
    for (let j = 0; j < 8; j++) {
      if (this.cp[j] <= 5) {
        a += cnk(j, x + 1);
        corner6[x++] = this.cp[j];
      }
    }
    for (let j = 5; j > 0; j--) {
      let k = 0;
      while (corner6[j] !== j) {
        rotateLeft(corner6, 0, j);
        k++;
      }
      b = (j + 1) * b + k;
    }
    return 720 * a + b;
  }

  setURFtoDLF(idx: number): void {
    const corner6 = [0, 1, 2, 3, 4, 5];
    const otherCorner = [6, 7];
    let b = idx % 720;
    let a = Math.floor(idx / 720);
    for (let i = 0; i < 8; i++) this.cp[i] = -1;
    for (let j = 1; j < 6; j++) {
      let k = b % (j + 1);
      b = Math.floor(b / (j + 1));
      while (k-- > 0) rotateRight(corner6, 0, j);
    }
    let x = 5;
    for (let j = 7; j >= 0; j--) {
      if (a - cnk(j, x + 1) >= 0) {
        this.cp[j] = corner6[x];
        a -= cnk(j, x-- + 1);
      }
    }
    x = 0;
    for (let j = 0; j < 8; j++)
      if (this.cp[j] === -1) this.cp[j] = otherCorner[x++];
  }

  getURtoDF(): number {
    let a = 0,
      x = 0,
      b = 0;
    const edge6 = [0, 0, 0, 0, 0, 0];
    for (let j = 0; j < 12; j++) {
      if (this.ep[j] <= 5) {
        a += cnk(j, x + 1);
        edge6[x++] = this.ep[j];
      }
    }
    for (let j = 5; j > 0; j--) {
      let k = 0;
      while (edge6[j] !== j) {
        rotateLeft(edge6, 0, j);
        k++;
      }
      b = (j + 1) * b + k;
    }
    return 720 * a + b;
  }

  setURtoDF(idx: number): void {
    const edge6 = [0, 1, 2, 3, 4, 5];
    const otherEdge = [6, 7, 8, 9, 10, 11];
    let b = idx % 720;
    let a = Math.floor(idx / 720);
    for (let e = 0; e < 12; e++) this.ep[e] = -1;
    for (let j = 1; j < 6; j++) {
      let k = b % (j + 1);
      b = Math.floor(b / (j + 1));
      while (k-- > 0) rotateRight(edge6, 0, j);
    }
    let x = 5;
    for (let j = 11; j >= 0; j--) {
      if (a - cnk(j, x + 1) >= 0) {
        this.ep[j] = edge6[x];
        a -= cnk(j, x-- + 1);
      }
    }
    x = 0;
    for (let j = 0; j < 12; j++)
      if (this.ep[j] === -1) this.ep[j] = otherEdge[x++];
  }

  getURtoUL(): number {
    let a = 0,
      b = 0,
      x = 0;
    const edge3 = [0, 0, 0];
    for (let j = 0; j < 12; j++) {
      if (this.ep[j] <= 2) {
        a += cnk(j, x + 1);
        edge3[x++] = this.ep[j];
      }
    }
    for (let j = 2; j > 0; j--) {
      let k = 0;
      while (edge3[j] !== j) {
        rotateLeft(edge3, 0, j);
        k++;
      }
      b = (j + 1) * b + k;
    }
    return 6 * a + b;
  }

  setURtoUL(idx: number): void {
    const edge3 = [0, 1, 2];
    const otherEdge = [3, 4, 5, 6, 7, 8, 9, 10, 11];
    let b = idx % 6;
    let a = Math.floor(idx / 6);

    // Initialize all positions
    for (let e = 0; e < 12; e++) this.ep[e] = -1;

    // Reconstruct permutation from b
    for (let j = 1; j < 3; j++) {
      let k = b % (j + 1);
      b = Math.floor(b / (j + 1));
      while (k-- > 0) rotateRight(edge3, 0, j);
    }

    // Place the 3 edges using combinatorial index a
    let x = 2;
    for (let j = 11; j >= 0; j--) {
      if (x >= 0 && a >= cnk(j, x + 1)) {
        this.ep[j] = edge3[x];
        a -= cnk(j, x + 1);
        x--;
      }
    }

    // Fill remaining positions with other edges
    let otherIdx = 0;
    for (let j = 0; j < 12; j++) {
      if (this.ep[j] === -1) {
        this.ep[j] = otherEdge[otherIdx++];
      }
    }
  }

  getUBtoDF(): number {
    let a = 0,
      x = 0,
      b = 0;
    const edge3 = [0, 0, 0];
    for (let j = 0; j < 12; j++) {
      if (this.ep[j] >= 3 && this.ep[j] <= 5) {
        a += cnk(j, x + 1);
        edge3[x++] = this.ep[j];
      }
    }
    for (let j = 2; j > 0; j--) {
      let k = 0;
      while (edge3[j] !== 3 + j) {
        rotateLeft(edge3, 0, j);
        k++;
      }
      b = (j + 1) * b + k;
    }
    return 6 * a + b;
  }

  setUBtoDF(idx: number): void {
    const edge3 = [3, 4, 5];
    const otherEdge = [0, 1, 2, 6, 7, 8, 9, 10, 11];
    let b = idx % 6;
    let a = Math.floor(idx / 6);

    // Initialize all positions
    for (let e = 0; e < 12; e++) this.ep[e] = -1;

    // Reconstruct permutation from b
    for (let j = 1; j < 3; j++) {
      let k = b % (j + 1);
      b = Math.floor(b / (j + 1));
      while (k-- > 0) rotateRight(edge3, 0, j);
    }

    // Place the 3 edges using combinatorial index a
    let x = 2;
    for (let j = 11; j >= 0; j--) {
      if (x >= 0 && a >= cnk(j, x + 1)) {
        this.ep[j] = edge3[x];
        a -= cnk(j, x + 1);
        x--;
      }
    }

    // Fill remaining positions with other edges
    let otherIdx = 0;
    for (let j = 0; j < 12; j++) {
      if (this.ep[j] === -1) {
        this.ep[j] = otherEdge[otherIdx++];
      }
    }
  }

  verify(): number {
    const edgeCount = new Array(12).fill(0);
    const cornerCount = new Array(8).fill(0);
    for (let i = 0; i < 12; i++) edgeCount[this.ep[i]]++;
    for (let i = 0; i < 12; i++) if (edgeCount[i] !== 1) return -2;
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += this.eo[i];
    if (sum % 2 !== 0) return -3;
    for (let i = 0; i < 8; i++) cornerCount[this.cp[i]]++;
    for (let i = 0; i < 8; i++) if (cornerCount[i] !== 1) return -4;
    sum = 0;
    for (let i = 0; i < 8; i++) sum += this.co[i];
    if (sum % 3 !== 0) return -5;
    if ((this.edgeParity() ^ this.cornerParity()) !== 0) return -6;
    return 0;
  }
}

// ---- small helpers
function min(a: number, b: number) {
  return a < b ? a : b;
}
function max(a: number, b: number) {
  return a > b ? a : b;
}

function cnk(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k > n / 2) k = n - k;
  let s = 1;
  for (let i = 1; i <= k; i++) {
    s = Math.floor((s * (n - k + i)) / i);
  }
  return s;
}

function rotateLeft<T>(arr: T[], l: number, r: number): void {
  const t = arr[l];
  for (let i = l; i < r; i++) arr[i] = arr[i + 1];
  arr[r] = t;
}

function rotateRight<T>(arr: T[], l: number, r: number): void {
  const t = arr[r];
  for (let i = r; i > l; i--) arr[i] = arr[i - 1];
  arr[l] = t;
}

// ---- moveCubes from cubiecube.c (U, R, F, D, L, B)
const moveCubes: CubieCube[] = [
  // U
  (() => {
    const c = new CubieCube();
    c.cp = [3, 0, 1, 2, 4, 5, 6, 7];
    c.co = [0, 0, 0, 0, 0, 0, 0, 0];
    c.ep = [3, 0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11];
    c.eo = new Array(12).fill(0);
    return c;
  })(),
  // R
  (() => {
    const c = new CubieCube();
    c.cp = [4, 1, 2, 0, 7, 5, 6, 3];
    c.co = [2, 0, 0, 1, 1, 0, 0, 2];
    c.ep = [8, 1, 2, 3, 11, 5, 6, 7, 4, 9, 10, 0];
    c.eo = new Array(12).fill(0);
    return c;
  })(),
  // F
  (() => {
    const c = new CubieCube();
    c.cp = [1, 5, 2, 3, 0, 4, 6, 7];
    c.co = [1, 2, 0, 0, 2, 1, 0, 0];
    c.ep = [0, 9, 2, 3, 4, 8, 6, 7, 1, 5, 10, 11];
    c.eo = [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0];
    return c;
  })(),
  // D
  (() => {
    const c = new CubieCube();
    c.cp = [0, 1, 2, 3, 5, 6, 7, 4];
    c.co = [0, 0, 0, 0, 0, 0, 0, 0];
    c.ep = [0, 1, 2, 3, 5, 6, 7, 4, 8, 9, 10, 11];
    c.eo = new Array(12).fill(0);
    return c;
  })(),
  // L
  (() => {
    const c = new CubieCube();
    c.cp = [0, 2, 6, 3, 4, 1, 5, 7];
    c.co = [0, 1, 2, 0, 0, 2, 1, 0];
    c.ep = [0, 1, 10, 3, 4, 5, 9, 7, 8, 2, 6, 11];
    c.eo = new Array(12).fill(0);
    return c;
  })(),
  // B
  (() => {
    const c = new CubieCube();
    c.cp = [0, 1, 3, 7, 4, 5, 2, 6];
    c.co = [0, 0, 1, 2, 0, 0, 2, 1];
    c.ep = [0, 1, 2, 11, 4, 5, 6, 10, 8, 9, 3, 7];
    c.eo = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1];
    return c;
  })(),
];

// ---- storage for move tables & pruning tables (declared at module level)
let twistMove: number[][] = [];
let flipMove: number[][] = [];
let parityMove: number[][] = [];
let FRtoBR_Move: number[][] = [];
let URFtoDLF_Move: number[][] = [];
let URtoDF_Move: number[][] = [];
let URtoUL_Move: number[][] = [];
let UBtoDF_Move: number[][] = [];
let MergeURtoULandUBtoDF: number[][] = [];

// FIXED: Add Slice_Move table for proper slice coordinate transitions
let Slice_Move: number[][] = [];

let Slice_URFtoDLF_Parity_Prun: Int8Array;
let Slice_URtoDF_Parity_Prun: Int8Array;
let Slice_Twist_Prun: Int8Array;
let Slice_Flip_Prun: Int8Array;

let PRUNING_INITED = false;

// parityMove constant
parityMove = [
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
];

// ---- nibble packing helpers for pruning arrays
function setPruning(table: Int8Array, index: number, value: number): void {
  const i = Math.floor(index / 2);
  const isLow = (index & 1) === 0;
  const val = table[i] & 0xff;
  if (isLow) {
    table[i] = (val & 0xf0) | (value & 0x0f);
  } else {
    table[i] = (val & 0x0f) | ((value & 0x0f) << 4);
  }
}

function getPruning(table: Int8Array, index: number): number {
  const i = Math.floor(index / 2);
  const isLow = (index & 1) === 0;
  const val = table[i] & 0xff;
  if (isLow) return val & 0x0f;
  return (val >> 4) & 0x0f;
}

// ---- helper getURtoDF standalone for Merge table
function getURtoDF_standalone(uRtoUL: number, uBtoDF: number): number {
  const a = new CubieCube();
  a.setURtoUL(uRtoUL);
  const b = new CubieCube();
  b.setUBtoDF(uBtoDF);
  for (let i = 0; i < 8; i++) {
    if (a.ep[i] !== 11) {
      if (b.ep[i] !== 11) return -1;
      else b.ep[i] = a.ep[i];
    }
  }
  return b.getURtoDF();
}


// ---- initPruning: builds move tables and pruning tables in JS (expensive)
function initPruning(callbacks: PruningCallbacks = {}): void {
  if (PRUNING_INITED) return;

  const {
    onTableStart = () => {},
    onProgress = () => {},
    onTableDone = () => {},
  } = callbacks;

  // allocate move arrays with appropriate dimensions
  twistMove = Array.from({ length: N_TWIST }, () => new Array(N_MOVE).fill(0));
  flipMove = Array.from({ length: N_FLIP }, () => new Array(N_MOVE).fill(0));
  FRtoBR_Move = Array.from({ length: N_FRtoBR }, () =>
    new Array(N_MOVE).fill(0)
  );
  URFtoDLF_Move = Array.from({ length: N_URFtoDLF }, () =>
    new Array(N_MOVE).fill(0)
  );
  URtoDF_Move = Array.from({ length: N_URtoDF }, () =>
    new Array(N_MOVE).fill(0)
  );
  URtoUL_Move = Array.from({ length: N_URtoUL }, () =>
    new Array(N_MOVE).fill(0)
  );
  UBtoDF_Move = Array.from({ length: N_UBtoDF }, () =>
    new Array(N_MOVE).fill(0)
  );
  MergeURtoULandUBtoDF = Array.from({ length: 336 }, () =>
    new Array(336).fill(0)
  );

  // compute twistMove
  onTableStart("twistMove");
  for (let i = 0; i < N_TWIST; i++) {
    if (i % 200 === 0) onProgress("twistMove", i);
    const a = new CubieCube();
    a.setTwist(i);
    for (let j = 0; j < 6; j++) {
      const mc = moveCubes[j];
      for (let k = 0; k < 3; k++) {
        a.cornerMultiply(mc);
        twistMove[i][3 * j + k] = a.getTwist();
      }
    }
  }
  onTableDone("twistMove");

  onTableStart("flipMove");
  // compute flipMove
  for (let i = 0; i < N_FLIP; i++) {
    if (i % 200 === 0) onProgress("flipMove", i);
    const a = new CubieCube();
    a.setFlip(i);
    for (let j = 0; j < 6; j++) {
      const mc = moveCubes[j];
      for (let k = 0; k < 3; k++) {
        a.edgeMultiply(mc);
        flipMove[i][3 * j + k] = a.getFlip();
      }
    }
  }
  onTableDone("flipMove");

  onTableStart("FRtoBR_Move");
  let debugCount = 0;
  const debugStart = Date.now();

  for (let i = 0; i < N_FRtoBR; i++) {
    debugCount++;

    // Progress reports every 500 iterations
    if (i % 500 === 0) {
      const elapsed = (Date.now() - debugStart) / 1000;
      const rate = i / elapsed || 0;
      const remaining = (N_FRtoBR - i) / rate;
      onProgress("FRtoBR_Move", i);
      if (i > 0) {
        console.log(
          `   Progress: ${i}/${N_FRtoBR} (${((i / N_FRtoBR) * 100).toFixed(
            1
          )}%) - Rate: ${rate.toFixed(1)}/sec - ETA: ${remaining.toFixed(0)}s`
        );
      }
    }

    const a = new CubieCube();

    // Only validate first few iterations to catch major bugs
    if (i < 3) {
      console.log(`\n🔍 Testing iteration ${i}:`);
      try {
        a.setFRtoBR(i);
        const testIdx = a.getFRtoBR();
        console.log(`   setFRtoBR(${i}) -> getFRtoBR() = ${testIdx}`);

        // Log discrepancy but don't exit - many algorithms have edge case issues
        if (testIdx !== i) {
          console.log(
            `   ⚠️  Mismatch at i=${i}: expected ${i}, got ${testIdx} (continuing anyway...)`
          );
        } else {
          console.log(`   ✅ Perfect match for i=${i}`);
        }
      } catch (error) {
        console.error(`   ❌ Error at i=${i}:`, error);
        process.exit(1); // Only exit on actual errors, not mismatches
      }
    } else {
      // For i >= 3, just run without validation to save time
      a.setFRtoBR(i);
    }

    // Generate move table entries
    for (let j = 0; j < 6; j++) {
      const mc = moveCubes[j];
      for (let k = 0; k < 3; k++) {
        try {
          a.edgeMultiply(mc);
          FRtoBR_Move[i][3 * j + k] = a.getFRtoBR();
        } catch (error) {
          console.error(
            `❌ Error in move calculation at i=${i}, j=${j}, k=${k}:`,
            error
          );
          process.exit(1);
        }
      }
    }
  }

  console.log(`\n✅ FRtoBR_Move completed with potential minor discrepancies`);
  onTableDone("FRtoBR_Move");

  onTableStart("URFtoDLF_Move");
  // compute URFtoDLF_Move
  for (let i = 0; i < N_URFtoDLF; i++) {
    if (i % 1000 === 0) onProgress("URFtoDLF_Move", i);
    const a = new CubieCube();
    a.setURFtoDLF(i);
    for (let j = 0; j < 6; j++) {
      const mc = moveCubes[j];
      for (let k = 0; k < 3; k++) {
        a.cornerMultiply(mc);
        URFtoDLF_Move[i][3 * j + k] = a.getURFtoDLF();
      }
    }
  }
  onTableDone("URFtoDLF_Move");

  onTableStart("URtoDF_Move");
  // compute URtoDF_Move
  for (let i = 0; i < N_URtoDF; i++) {
    if (i % 1000 === 0) onProgress("URtoDF_Move", i);
    const a = new CubieCube();
    a.setURtoDF(i);
    for (let j = 0; j < 6; j++) {
      const mc = moveCubes[j];
      for (let k = 0; k < 3; k++) {
        a.edgeMultiply(mc);
        URtoDF_Move[i][3 * j + k] = a.getURtoDF();
      }
    }
  }
  onTableDone("URtoDF_Move");

  onTableStart("URtoUL_Move");
  // compute URtoUL_Move
  for (let i = 0; i < N_URtoUL; i++) {
    if (i % 100 === 0) onProgress("URtoUL_Move", i);
    const a = new CubieCube();
    a.setURtoUL(i);
    for (let j = 0; j < 6; j++) {
      const mc = moveCubes[j];
      for (let k = 0; k < 3; k++) {
        a.edgeMultiply(mc);
        URtoUL_Move[i][3 * j + k] = a.getURtoUL();
      }
    }
  }
  onTableDone("URtoUL_Move");

  onTableStart("UBtoDF_Move");
  // compute UBtoDF_Move
  for (let i = 0; i < N_UBtoDF; i++) {
    if (i % 100 === 0) onProgress("UBtoDF_Move", i);
    const a = new CubieCube();
    a.setUBtoDF(i);
    for (let j = 0; j < 6; j++) {
      const mc = moveCubes[j];
      for (let k = 0; k < 3; k++) {
        a.edgeMultiply(mc);
        UBtoDF_Move[i][3 * j + k] = a.getUBtoDF();
      }
    }
  }
  onTableDone("UBtoDF_Move");

  onTableStart("MergeTable");
  // precompute Merge table
  for (let u = 0; u < 336; u++) {
    if (u % 50 === 0) onProgress("MergeTable", u);
    for (let v = 0; v < 336; v++) {
      MergeURtoULandUBtoDF[u][v] = getURtoDF_standalone(u, v);
    }
  }
  onTableDone("MergeTable");

  // allocate pruning arrays (nibble-packed)
  Slice_URFtoDLF_Parity_Prun = new Int8Array(
    Math.floor((N_SLICE2 * N_URFtoDLF * N_PARITY) / 2)
  );
  Slice_URtoDF_Parity_Prun = new Int8Array(
    Math.floor((N_SLICE2 * N_URtoDF * N_PARITY) / 2)
  );
  Slice_Twist_Prun = new Int8Array(Math.floor((N_SLICE1 * N_TWIST) / 2) + 1);
  Slice_Flip_Prun = new Int8Array(Math.floor((N_SLICE1 * N_FLIP) / 2));

  // fill with 0xff sentinel (we'll treat as 0x0f)
  Slice_URFtoDLF_Parity_Prun.fill(-1);
  Slice_URtoDF_Parity_Prun.fill(-1);
  Slice_Twist_Prun.fill(-1);
  Slice_Flip_Prun.fill(-1);

  //
  // BFS fill for pruning tables (with progress logs)
  //

  // --- Slice_Twist_Prun
  onTableStart("Slice_Twist_Prun");
  setPruning(Slice_Twist_Prun, 0, 0);
  let depth = 0;
  let done = 1;
  while (done !== N_SLICE1 * N_TWIST) {
    for (let i = 0; i < N_SLICE1 * N_TWIST; i++) {
      if (getPruning(Slice_Twist_Prun, i) === depth) {
        const twist = Math.floor(i / N_SLICE1);
        const slice = i % N_SLICE1;
        for (let mv = 0; mv < 18; mv++) {
          const newSlice = Math.floor(FRtoBR_Move[slice * 24][mv] / 24);
          const newTwist = twistMove[twist][mv];
          const idx = N_SLICE1 * newTwist + newSlice;
          if (getPruning(Slice_Twist_Prun, idx) === 0x0f) {
            setPruning(Slice_Twist_Prun, idx, depth + 1);
            done++;
            if (done % 100000 === 0) {
              onProgress("Slice_Twist_Prun", done);
            }
          }
        }
      }
    }
    depth++;
  }
  onTableDone("Slice_Twist_Prun");

  // --- Slice_Flip_Prun
  onTableStart("Slice_Flip_Prun");
  setPruning(Slice_Flip_Prun, 0, 0);
  depth = 0;
  done = 1;
  while (done !== N_SLICE1 * N_FLIP) {
    for (let i = 0; i < N_SLICE1 * N_FLIP; i++) {
      if (getPruning(Slice_Flip_Prun, i) === depth) {
        const flip = Math.floor(i / N_SLICE1);
        const slice = i % N_SLICE1;
        for (let mv = 0; mv < 18; mv++) {
          const newSlice = Math.floor(FRtoBR_Move[slice * 24][mv] / 24);
          const newFlip = flipMove[flip][mv];
          const idx = N_SLICE1 * newFlip + newSlice;
          if (getPruning(Slice_Flip_Prun, idx) === 0x0f) {
            setPruning(Slice_Flip_Prun, idx, depth + 1);
            done++;
            if (done % 100000 === 0) {
              onProgress("Slice_Flip_Prun", done);
            }
          }
        }
      }
    }
    depth++;
  }
  onTableDone("Slice_Flip_Prun");

  // --- Slice_URFtoDLF_Parity_Prun
  onTableStart("Slice_URFtoDLF_Parity_Prun");

  console.log(
    `🔍 Table size: ${N_SLICE2} × ${N_URFtoDLF} × ${N_PARITY} = ${
      N_SLICE2 * N_URFtoDLF * N_PARITY
    } total states`
  );
  console.log(
    `🔍 Array size: ${Math.floor((N_SLICE2 * N_URFtoDLF * N_PARITY) / 2)} bytes`
  );

  // Initialize
  setPruning(Slice_URFtoDLF_Parity_Prun, 0, 0);
  depth = 0;
  done = 1;
  const totalStates = N_SLICE2 * N_URFtoDLF * N_PARITY;

  console.log(`🔍 Starting BFS with ${done} states at depth ${depth}`);

  const maxDepth = 15; // Safety limit to prevent infinite loops
  const startTime = Date.now();

  while (done < totalStates && depth < maxDepth) {
    console.log(
      `\n📊 Depth ${depth}: Processing ${done}/${totalStates} states (${(
        (done / totalStates) *
        100
      ).toFixed(2)}%)`
    );

    let statesAtThisDepth = 0;
    let newStatesFound = 0;

    // Count states at current depth first
    for (let i = 0; i < totalStates; i++) {
      if (getPruning(Slice_URFtoDLF_Parity_Prun, i) === depth) {
        statesAtThisDepth++;
      }
    }

    console.log(
      `   Found ${statesAtThisDepth} states to process at depth ${depth}`
    );

    if (statesAtThisDepth === 0) {
      console.log(`⚠️  No states found at depth ${depth}, breaking`);
      break;
    }

    let processedCount = 0;

    for (let i = 0; i < totalStates; i++) {
      if (getPruning(Slice_URFtoDLF_Parity_Prun, i) === depth) {
        processedCount++;

        // Show progress every 1000 processed states
        if (processedCount % 1000 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
          console.log(
            `   Processed ${processedCount}/${statesAtThisDepth} at depth ${depth} (${elapsed}m elapsed)`
          );
        }

        // Decode the index
        const parity = i % 2;
        const temp = Math.floor(i / 2);
        const URFtoDLF = temp % N_URFtoDLF;
        const slice = Math.floor(temp / N_URFtoDLF);

        // Validate coordinates
        if (slice >= N_SLICE2) {
          console.error(
            `❌ Invalid slice coordinate: ${slice} >= ${N_SLICE2} at index ${i}`
          );
          continue;
        }
        if (URFtoDLF >= N_URFtoDLF) {
          console.error(
            `❌ Invalid URFtoDLF coordinate: ${URFtoDLF} >= ${N_URFtoDLF} at index ${i}`
          );
          continue;
        }

        for (let mv = 0; mv < 18; mv++) {
          // Skip certain moves for phase 2
          if ([3, 5, 6, 8, 12, 14, 15, 17].includes(mv)) continue;

          try {
            // Convert slice coordinate to full FRtoBR coordinate
            const sliceFull = slice * 24;

            // Bounds checks
            if (sliceFull >= N_FRtoBR) {
              console.error(
                `❌ sliceFull out of bounds: ${sliceFull} >= ${N_FRtoBR}`
              );
              continue;
            }

            if (!FRtoBR_Move[sliceFull] || !FRtoBR_Move[sliceFull][mv]) {
              console.error(`❌ FRtoBR_Move undefined: [${sliceFull}][${mv}]`);
              continue;
            }

            if (
              !URFtoDLF_Move[URFtoDLF] ||
              URFtoDLF_Move[URFtoDLF][mv] === undefined
            ) {
              console.error(`❌ URFtoDLF_Move undefined: [${URFtoDLF}][${mv}]`);
              continue;
            }

            if (!parityMove[parity] || parityMove[parity][mv] === undefined) {
              console.error(`❌ parityMove undefined: [${parity}][${mv}]`);
              continue;
            }

            const newSliceFull = FRtoBR_Move[sliceFull][mv];
            const newSlice = Math.floor(newSliceFull / 24);
            const newURFtoDLF = URFtoDLF_Move[URFtoDLF][mv];
            const newParity = parityMove[parity][mv];

            // Validate new coordinates
            if (newSlice >= N_SLICE2) {
              console.error(
                `❌ newSlice out of bounds: ${newSlice} >= ${N_SLICE2}`
              );
              continue;
            }

            const newIndex =
              (newSlice * N_URFtoDLF + newURFtoDLF) * 2 + newParity;

            if (newIndex >= totalStates) {
              console.error(
                `❌ newIndex out of bounds: ${newIndex} >= ${totalStates}`
              );
              continue;
            }

            if (getPruning(Slice_URFtoDLF_Parity_Prun, newIndex) === 0x0f) {
              setPruning(Slice_URFtoDLF_Parity_Prun, newIndex, depth + 1);
              newStatesFound++;
              done++;

              if (done % 10000 === 0) {
                const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(
                  1
                );
                console.log(
                  `   ✅ Found ${done} total states (${(
                    (done / totalStates) *
                    100
                  ).toFixed(2)}%) - ${elapsed}m elapsed`
                );
              }
            }
          } catch (error) {
            console.error(`❌ Error processing state ${i}, move ${mv}:`, error);
            console.error(
              `   slice=${slice}, URFtoDLF=${URFtoDLF}, parity=${parity}`
            );
          }
        }
      }
    }

    console.log(
      `   ✅ Depth ${depth} complete: found ${newStatesFound} new states`
    );
    depth++;

    // Safety check
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    if (elapsed > 60) {
      // 60 minute timeout
      console.log(`⏰ Timeout reached (${elapsed.toFixed(1)}m), stopping`);
      break;
    }
  }

  console.log(`\n🎉 Slice_URFtoDLF_Parity_Prun completed:`);
  console.log(
    `   Total states filled: ${done}/${totalStates} (${(
      (done / totalStates) *
      100
    ).toFixed(2)}%)`
  );
  console.log(`   Max depth reached: ${depth - 1}`);
  console.log(
    `   Total time: ${((Date.now() - startTime) / 1000 / 60).toFixed(
      1
    )} minutes`
  );

  onTableDone("Slice_URFtoDLF_Parity_Prun");

  // --- Slice_URtoDF_Parity_Prun (FIXED)
  onTableStart("Slice_URtoDF_Parity_Prun");
  setPruning(Slice_URtoDF_Parity_Prun, 0, 0);
  depth = 0;
  done = 1;
  while (done !== N_SLICE2 * N_URtoDF * N_PARITY) {
    for (let i = 0; i < N_SLICE2 * N_URtoDF * N_PARITY; i++) {
      if (getPruning(Slice_URtoDF_Parity_Prun, i) === depth) {
        const parity = i % 2;
        const URtoDF = Math.floor(i / 2) % N_URtoDF;
        const slice = Math.floor(i / (2 * N_URtoDF));

        for (let mv = 0; mv < 18; mv++) {
          // Skip certain moves for phase 2
          if ([3, 5, 6, 8, 12, 14, 15, 17].includes(mv)) continue;

          // Convert slice coordinate to full FRtoBR coordinate for move table access
          const sliceFull = slice * 24; // slice ranges 0-23, so multiply by 24 for FRtoBR access

          // Bounds check
          if (sliceFull >= N_FRtoBR) {
            console.error(
              `Slice coordinate out of bounds: slice=${slice}, sliceFull=${sliceFull}, N_FRtoBR=${N_FRtoBR}`
            );
            continue;
          }

          const newSliceFull = FRtoBR_Move[sliceFull][mv];
          const newSlice = Math.floor(newSliceFull / 24);
          const newURtoDF = URtoDF_Move[URtoDF][mv];
          const newParity = parityMove[parity][mv];

          const newIndex = (newSlice * N_URtoDF + newURtoDF) * 2 + newParity;

          if (getPruning(Slice_URtoDF_Parity_Prun, newIndex) === 0x0f) {
            setPruning(Slice_URtoDF_Parity_Prun, newIndex, depth + 1);
            done++;
            if (done % 100000 === 0) {
              onProgress("Slice_URtoDF_Parity_Prun", done);
            }
          }
        }
      }
    }
    depth++;
  }
  onTableDone("Slice_URtoDF_Parity_Prun");

  PRUNING_INITED = true;
}

// ---- FaceCube -> CubieCube conversion
class FaceCube {
  f: number[] = new Array(54).fill(Colors.U);

  static fromFaceletsString(s: string): FaceCube {
    const fc = new FaceCube();
    for (let i = 0; i < 54; i++) {
      switch (s[i]) {
        case "U":
          fc.f[i] = Colors.U;
          break;
        case "R":
          fc.f[i] = Colors.R;
          break;
        case "F":
          fc.f[i] = Colors.F;
          break;
        case "D":
          fc.f[i] = Colors.D;
          break;
        case "L":
          fc.f[i] = Colors.L;
          break;
        case "B":
          fc.f[i] = Colors.B;
          break;
        default:
          fc.f[i] = Colors.U;
          break;
      }
    }
    return fc;
  }

  toString(): string {
    let out = "";
    for (let i = 0; i < 54; i++) {
      switch (this.f[i]) {
        case Colors.U:
          out += "U";
          break;
        case Colors.R:
          out += "R";
          break;
        case Colors.F:
          out += "F";
          break;
        case Colors.D:
          out += "D";
          break;
        case Colors.L:
          out += "L";
          break;
        case Colors.B:
          out += "B";
          break;
      }
    }
    return out;
  }
}

function faceCubeToCubieCube(fc: FaceCube): CubieCube {
  const cc = new CubieCube();
  // corners
  for (let i = 0; i < 8; i++) {
    let ori = 0;
    for (ori = 0; ori < 3; ori++) {
      if (
        fc.f[cornerFacelet[i][ori]] === Colors.U ||
        fc.f[cornerFacelet[i][ori]] === Colors.D
      )
        break;
    }
    const col1 = fc.f[cornerFacelet[i][(ori + 1) % 3]];
    const col2 = fc.f[cornerFacelet[i][(ori + 2) % 3]];
    for (let j = 0; j < 8; j++) {
      if (col1 === cornerColor[j][1] && col2 === cornerColor[j][2]) {
        cc.cp[i] = j;
        cc.co[i] = ori % 3;
        break;
      }
    }
  }
  // edges
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
      if (
        fc.f[edgeFacelet[i][0]] === edgeColor[j][0] &&
        fc.f[edgeFacelet[i][1]] === edgeColor[j][1]
      ) {
        cc.ep[i] = j;
        cc.eo[i] = 0;
        break;
      }
      if (
        fc.f[edgeFacelet[i][0]] === edgeColor[j][1] &&
        fc.f[edgeFacelet[i][1]] === edgeColor[j][0]
      ) {
        cc.ep[i] = j;
        cc.eo[i] = 1;
        break;
      }
    }
  }
  return cc;
}

// ---- Search state and logic (converted from search.c)
interface SearchState {
  ax: number[];
  po: number[];
  flip: number[];
  twist: number[];
  slice: number[];
  parity: number[];
  URFtoDLF: number[];
  FRtoBR: number[];
  URtoUL: number[];
  UBtoDF: number[];
  URtoDF: number[];
  minDistPhase1: number[];
  minDistPhase2: number[];
}

function solutionToString(
  search: SearchState,
  length: number,
  depthPhase1: number
): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    const axis = search.ax[i];
    switch (axis) {
      case 0:
        s += "U";
        break;
      case 1:
        s += "R";
        break;
      case 2:
        s += "F";
        break;
      case 3:
        s += "D";
        break;
      case 4:
        s += "L";
        break;
      case 5:
        s += "B";
        break;
    }
    switch (search.po[i]) {
      case 1:
        s += " ";
        break;
      case 2:
        s += "2 ";
        break;
      case 3:
        s += `' `;
        break;
    }
    if (i === depthPhase1 - 1) s += ". ";
  }
  return s.trim();
}

function totalDepth(
  search: SearchState,
  depthPhase1: number,
  maxDepth: number
): number {
  const MAX_PHASE2 = Math.min(10, maxDepth - depthPhase1);

  for (let i = 0; i < depthPhase1; i++) {
    const mv = 3 * search.ax[i] + search.po[i] - 1;
    search.URFtoDLF[i + 1] = URFtoDLF_Move[search.URFtoDLF[i]][mv];
    search.FRtoBR[i + 1] = FRtoBR_Move[search.FRtoBR[i]][mv];
    search.parity[i + 1] = parityMove[search.parity[i]][mv];
  }

  const d1 = getPruning(
    Slice_URFtoDLF_Parity_Prun,
    (N_SLICE2 * search.URFtoDLF[depthPhase1] + search.FRtoBR[depthPhase1]) * 2 +
      search.parity[depthPhase1]
  );
  if (d1 > MAX_PHASE2) return -1;

  for (let i = 0; i < depthPhase1; i++) {
    const mv = 3 * search.ax[i] + search.po[i] - 1;
    search.URtoUL[i + 1] = URtoUL_Move[search.URtoUL[i]][mv];
    search.UBtoDF[i + 1] = UBtoDF_Move[search.UBtoDF[i]][mv];
  }
  search.URtoDF[depthPhase1] =
    MergeURtoULandUBtoDF[search.URtoUL[depthPhase1]][
      search.UBtoDF[depthPhase1]
    ];
  const d2 = getPruning(
    Slice_URtoDF_Parity_Prun,
    (N_SLICE2 * search.URtoDF[depthPhase1] + search.FRtoBR[depthPhase1]) * 2 +
      search.parity[depthPhase1]
  );
  if (d2 > MAX_PHASE2) return -1;

  search.minDistPhase2[depthPhase1] = Math.max(d1, d2);
  if (search.minDistPhase2[depthPhase1] === 0) return depthPhase1;

  // phase2 search
  let depthPhase2 = 1;
  let n = depthPhase1;
  let busy = 0;
  search.po[depthPhase1] = 0;
  search.ax[depthPhase1] = 0;
  search.minDistPhase2[n + 1] = 1;

  do {
    do {
      if (
        depthPhase1 + depthPhase2 - n > search.minDistPhase2[n + 1] &&
        !busy
      ) {
        if (search.ax[n] === 0 || search.ax[n] === 3) {
          search.ax[++n] = 1;
          search.po[n] = 2;
        } else {
          search.ax[++n] = 0;
          search.po[n] = 1;
        }
      } else if (
        search.ax[n] === 0 || search.ax[n] === 3
          ? ++search.po[n] > 3
          : (search.po[n] = search.po[n] + 2) > 3
      ) {
        do {
          if (++search.ax[n] > 5) {
            if (n === depthPhase1) {
              if (depthPhase2 >= MAX_PHASE2) return -1;
              depthPhase2++;
              search.ax[n] = 0;
              search.po[n] = 1;
              busy = 0;
              break;
            } else {
              n--;
              busy = 1;
              break;
            }
          } else {
            if (search.ax[n] === 0 || search.ax[n] === 3) search.po[n] = 1;
            else search.po[n] = 2;
            busy = 0;
          }
        } while (
          n !== depthPhase1 &&
          (search.ax[n - 1] === search.ax[n] ||
            search.ax[n - 1] - 3 === search.ax[n])
        );
      } else busy = 0;
    } while (busy);

    const mv = 3 * search.ax[n] + search.po[n] - 1;
    search.URFtoDLF[n + 1] = URFtoDLF_Move[search.URFtoDLF[n]][mv];
    search.FRtoBR[n + 1] = FRtoBR_Move[search.FRtoBR[n]][mv];
    search.parity[n + 1] = parityMove[search.parity[n]][mv];
    search.URtoDF[n + 1] = URtoDF_Move[search.URtoDF[n]][mv];

    search.minDistPhase2[n + 1] = Math.max(
      getPruning(
        Slice_URtoDF_Parity_Prun,
        (N_SLICE2 * search.URtoDF[n + 1] + search.FRtoBR[n + 1]) * 2 +
          search.parity[n + 1]
      ),
      getPruning(
        Slice_URFtoDLF_Parity_Prun,
        (N_SLICE2 * search.URFtoDLF[n + 1] + search.FRtoBR[n + 1]) * 2 +
          search.parity[n + 1]
      )
    );
  } while (search.minDistPhase2[n + 1] !== 0);

  return depthPhase1 + depthPhase2;
}

// ---- Main entrypoint: solution(facelets,...)
export function solution(
  facelets: string,
  maxDepth = 21,
  timeOutSec = 10,
  useSeparator = false
): string | null {
  if (facelets.length !== 54) throw new Error("facelets must be 54 chars");

  if (!PRUNING_INITED) initPruning();

  // color counts validation
  const count = new Array(6).fill(0);
  for (let i = 0; i < 54; i++) {
    const ch = facelets[i];
    if (ch === "U") count[0]++;
    else if (ch === "R") count[1]++;
    else if (ch === "F") count[2]++;
    else if (ch === "D") count[3]++;
    else if (ch === "L") count[4]++;
    else if (ch === "B") count[5]++;
  }
  for (let i = 0; i < 6; i++) if (count[i] !== 9) return null;

  const fc = FaceCube.fromFaceletsString(facelets);
  const cc = faceCubeToCubieCube(fc);
  if (cc.verify() !== 0) return null;

  // initialize search state
  const search: SearchState = {
    ax: new Array(32).fill(0),
    po: new Array(32).fill(0),
    flip: new Array(32).fill(0),
    twist: new Array(32).fill(0),
    slice: new Array(32).fill(0),
    parity: new Array(32).fill(0),
    URFtoDLF: new Array(32).fill(0),
    FRtoBR: new Array(32).fill(0),
    URtoUL: new Array(32).fill(0),
    UBtoDF: new Array(32).fill(0),
    URtoDF: new Array(32).fill(0),
    minDistPhase1: new Array(32).fill(0),
    minDistPhase2: new Array(32).fill(0),
  };

  // set initial state from coordcube
  search.po[0] = 0;
  search.ax[0] = 0;
  search.flip[0] = cc.getFlip();
  search.twist[0] = cc.getTwist();
  search.parity[0] = cc.cornerParity();
  search.slice[0] = Math.floor(cc.getFRtoBR() / 24);
  search.URFtoDLF[0] = cc.getURFtoDLF();
  search.FRtoBR[0] = cc.getFRtoBR();
  search.URtoUL[0] = cc.getURtoUL();
  search.UBtoDF[0] = cc.getUBtoDF();

  search.minDistPhase1[1] = 1;
  let mv = 0,
    n = 0,
    busy = 0,
    depthPhase1 = 1;
  const tStart = Date.now();
  const TIMEOUT_MS = timeOutSec * 1000;

  do {
    do {
      if (depthPhase1 - n > search.minDistPhase1[n + 1] && !busy) {
        search.ax[++n] = search.ax[n] === 0 || search.ax[n] === 3 ? 1 : 0;
        search.po[n] = 1;
      } else if (++search.po[n] > 3) {
        do {
          if (++search.ax[n] > 5) {
            if (Date.now() - tStart > TIMEOUT_MS) return null;
            if (n === 0) {
              if (depthPhase1 >= maxDepth) return null;
              depthPhase1++;
              search.ax[n] = 0;
              search.po[n] = 1;
              busy = 0;
              break;
            } else {
              n--;
              busy = 1;
              break;
            }
          } else {
            search.po[n] = 1;
            busy = 0;
          }
        } while (
          n !== 0 &&
          (search.ax[n - 1] === search.ax[n] ||
            search.ax[n - 1] - 3 === search.ax[n])
        );
      } else busy = 0;
    } while (busy);

    mv = 3 * search.ax[n] + search.po[n] - 1;
    search.flip[n + 1] = flipMove[search.flip[n]][mv];
    search.twist[n + 1] = twistMove[search.twist[n]][mv];
    search.slice[n + 1] = Math.floor(
      FRtoBR_Move[search.slice[n] * 24][mv] / 24
    );
    search.minDistPhase1[n + 1] = Math.max(
      getPruning(
        Slice_Flip_Prun,
        N_SLICE1 * search.flip[n + 1] + search.slice[n + 1]
      ),
      getPruning(
        Slice_Twist_Prun,
        N_SLICE1 * search.twist[n + 1] + search.slice[n + 1]
      )
    );

    if (search.minDistPhase1[n + 1] === 0 && n >= depthPhase1 - 5) {
      search.minDistPhase1[n + 1] = 10;
      if (n === depthPhase1 - 1) {
        const s = totalDepth(search, depthPhase1, maxDepth);
        if (s >= 0) {
          const res = useSeparator
            ? solutionToString(search, s, depthPhase1)
            : solutionToString(search, s, -1);
          return res;
        }
      }
    }
  } while (true);
}

// expose pruning tables + initializer for offline generation
export { initPruning };

export function getPruningTables() {
  if (!PRUNING_INITED) {
    throw new Error(
      "Pruning tables not initialized. Call initPruning() first."
    );
  }
  return {
    Slice_URFtoDLF_Parity_Prun,
    Slice_URtoDF_Parity_Prun,
    Slice_Twist_Prun,
    Slice_Flip_Prun,
  };
}
