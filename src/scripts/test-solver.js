import { randomScrambleForEvent } from "cubing/scramble";
import { solve3x3x3 } from "cubing/search";

// generate a scramble
const scramble = await randomScrambleForEvent("333");
console.log("Scramble:", scramble.toString());

// solve it
const solution = await solve3x3x3(scramble);
console.log("Solution:", solution.toString());
