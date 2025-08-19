declare module 'cubing' {
  export class Cube {
    constructor();
    fromString(notation: string): void;
    solve(): string;
  }
}
