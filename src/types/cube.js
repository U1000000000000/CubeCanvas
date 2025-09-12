// Type definitions converted to JSDoc comments for better IDE support

/**
 * @typedef {'U' | 'D' | 'L' | 'R' | 'F' | 'B'} Face
 */

/**
 * @typedef {'white' | 'yellow' | 'red' | 'orange' | 'green' | 'blue' | 'black' | 'gray'} CubeColor
 */

/**
 * @typedef {Object} CubiePosition
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef {Object} CubieState
 * @property {CubiePosition} position
 * @property {CubeColor[]} materials - Array of 6 materials for BoxGeometry faces: [+X, -X, +Y, -Y, +Z, -Z]
 * @property {string} id
 * @property {'corner' | 'edge' | 'center' | 'core'} type
 */

/**
 * @typedef {Object} CubeState
 * @property {CubieState[]} cubies
 * @property {boolean} isAnimating
 * @property {Face | null} animatingFace
 * @property {number} moveCount
 * @property {number | null} startTime
 * @property {number} currentTime
 */

/**
 * @typedef {Object} Move
 * @property {Face} face
 * @property {boolean} clockwise
 */

// Export empty object to make this a module
export {};