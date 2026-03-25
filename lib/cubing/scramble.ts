import { CubeEvent } from "./events";

// Simple random-move scrambler for practice. Generates scrambles by
// picking random moves while avoiding consecutive moves on the same
// face (or same axis for big cubes). This is not a WCA-legal random
// state scrambler, but it's sufficient for casual practice.

type MoveSet = {
  faces: string[];
  modifiers: string[];
  length: number;
  // If true, avoid consecutive moves on the same axis (e.g., R then L).
  axisAware?: string[][];
};

const CUBE_MOVES: Record<string, MoveSet> = {
  // Standard NxN
  "222": {
    faces: ["R", "U", "F"],
    modifiers: ["", "'", "2"],
    length: 9,
  },
  "333": {
    faces: ["R", "L", "U", "D", "F", "B"],
    modifiers: ["", "'", "2"],
    length: 20,
    axisAware: [["R", "L"], ["U", "D"], ["F", "B"]],
  },
  "444": {
    faces: ["R", "L", "U", "D", "F", "B", "Rw", "Uw", "Fw"],
    modifiers: ["", "'", "2"],
    length: 40,
    axisAware: [["R", "L", "Rw"], ["U", "D", "Uw"], ["F", "B", "Fw"]],
  },
  "555": {
    faces: ["R", "L", "U", "D", "F", "B", "Rw", "Lw", "Uw", "Dw", "Fw", "Bw"],
    modifiers: ["", "'", "2"],
    length: 60,
    axisAware: [["R", "L", "Rw", "Lw"], ["U", "D", "Uw", "Dw"], ["F", "B", "Fw", "Bw"]],
  },
  "666": {
    faces: ["R", "L", "U", "D", "F", "B", "Rw", "Lw", "Uw", "Dw", "Fw", "Bw", "3Rw", "3Uw", "3Fw"],
    modifiers: ["", "'", "2"],
    length: 80,
    axisAware: [["R", "L", "Rw", "Lw", "3Rw"], ["U", "D", "Uw", "Dw", "3Uw"], ["F", "B", "Fw", "Bw", "3Fw"]],
  },
  "777": {
    faces: ["R", "L", "U", "D", "F", "B", "Rw", "Lw", "Uw", "Dw", "Fw", "Bw", "3Rw", "3Lw", "3Uw", "3Dw", "3Fw", "3Bw"],
    modifiers: ["", "'", "2"],
    length: 100,
    axisAware: [["R", "L", "Rw", "Lw", "3Rw", "3Lw"], ["U", "D", "Uw", "Dw", "3Uw", "3Dw"], ["F", "B", "Fw", "Bw", "3Fw", "3Bw"]],
  },
};

// BLD and OH use 3x3 scrambles
const ALIASES: Partial<Record<CubeEvent, string>> = {
  [CubeEvent.THREE_BLD]: "333",
  [CubeEvent.FOUR_BLD]: "444",
  [CubeEvent.FIVE_BLD]: "555",
  [CubeEvent.OH]: "333",
};

function getAxis(face: string, axes: string[][] | undefined): number {
  if (!axes) return -1;
  for (let i = 0; i < axes.length; i++) {
    if (axes[i].includes(face)) return i;
  }
  return -1;
}

function generateCubeScramble(moveSet: MoveSet): string {
  const moves: string[] = [];
  let lastFace = "";
  let lastAxis = -1;

  for (let i = 0; i < moveSet.length; i++) {
    let face: string;
    let axis: number;
    do {
      face = moveSet.faces[Math.floor(Math.random() * moveSet.faces.length)];
      axis = getAxis(face, moveSet.axisAware);
    } while (face === lastFace || (moveSet.axisAware && axis === lastAxis && axis !== -1));

    const modifier = moveSet.modifiers[Math.floor(Math.random() * moveSet.modifiers.length)];
    moves.push(face + modifier);
    lastFace = face;
    lastAxis = axis;
  }

  return moves.join(" ");
}

// Pyraminx: U, L, R, B with tips u, l, r, b
function generatePyraminxScramble(): string {
  const faces = ["U", "L", "R", "B"];
  const modifiers = ["", "'"];
  const tips = ["u", "l", "r", "b"];
  const moves: string[] = [];
  let lastFace = "";

  for (let i = 0; i < 8; i++) {
    let face: string;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace);
    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push(face + mod);
    lastFace = face;
  }

  // Add 0-4 random tips
  for (const tip of tips) {
    if (Math.random() > 0.5) {
      const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
      moves.push(tip + mod);
    }
  }

  return moves.join(" ");
}

// Megaminx: R, D with ++ and -- notation
function generateMegaminxScramble(): string {
  const lines: string[] = [];
  for (let line = 0; line < 7; line++) {
    const moves: string[] = [];
    for (let i = 0; i < 5; i++) {
      const r = Math.random() > 0.5 ? "R++" : "R--";
      const d = Math.random() > 0.5 ? "D++" : "D--";
      moves.push(r);
      moves.push(d);
    }
    const u = Math.random() > 0.5 ? "U" : "U'";
    moves.push(u);
    lines.push(moves.join(" "));
  }
  return lines.join("\n");
}

// Skewb: R, L, U, B
function generateSkewbScramble(): string {
  const faces = ["R", "L", "U", "B"];
  const modifiers = ["", "'"];
  const moves: string[] = [];
  let lastFace = "";

  for (let i = 0; i < 9; i++) {
    let face: string;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace);
    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
    moves.push(face + mod);
    lastFace = face;
  }
  return moves.join(" ");
}

// Square-1: (x,y) / notation
function generateSq1Scramble(): string {
  const moves: string[] = [];
  for (let i = 0; i < 12; i++) {
    const top = Math.floor(Math.random() * 12) - 5;
    const bottom = Math.floor(Math.random() * 12) - 5;
    moves.push(`(${top},${bottom})`);
  }
  return moves.join(" / ");
}

// Clock: simplified notation
function generateClockScramble(): string {
  const pins = ["UR", "DR", "DL", "UL", "U", "R", "D", "L", "ALL"];
  const moves: string[] = [];

  for (const pin of pins) {
    const amount = Math.floor(Math.random() * 12) - 5;
    const dir = amount >= 0 ? `${amount}+` : `${Math.abs(amount)}-`;
    moves.push(`${pin}${dir}`);
  }

  // Add y2 and pin states
  moves.push("y2");
  for (const pin of pins.slice(0, 4)) {
    const amount = Math.floor(Math.random() * 12) - 5;
    const dir = amount >= 0 ? `${amount}+` : `${Math.abs(amount)}-`;
    moves.push(`${pin}${dir}`);
  }

  return moves.join(" ");
}

export function generateScramble(event: CubeEvent): string {
  const key = ALIASES[event] ?? event;

  if (key in CUBE_MOVES) {
    return generateCubeScramble(CUBE_MOVES[key]);
  }

  switch (event) {
    case CubeEvent.PYRA:
      return generatePyraminxScramble();
    case CubeEvent.MEGA:
      return generateMegaminxScramble();
    case CubeEvent.SKEWB:
      return generateSkewbScramble();
    case CubeEvent.SQ1:
      return generateSq1Scramble();
    case CubeEvent.CLOCK:
      return generateClockScramble();
    default:
      return generateCubeScramble(CUBE_MOVES["333"]);
  }
}
