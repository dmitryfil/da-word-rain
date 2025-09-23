// Core game types and interfaces

export interface LetterInfo {
  L: string;
  c: number; // count in distribution
  p: number; // points
}

export interface Tile {
  id: string;
  letter: string;
  points: number;
  mult: number; // 1, 2, or 3 for normal, double, triple
  green: boolean; // time bonus/penalty tile
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface RackTile {
  id: string;
  letter: string;
  points: number;
  mult: number;
  green: boolean;
}

export interface GameConfig {
  MAX_TIME: number;
  START_SCORE: number;
  RACK_MAX: number;
  MULTIPLIER_PROB: {
    dbl: number;
    tpl: number;
  };
  GREEN_PROB: number;
  SPAWN_EVERY: number;
  MAX_ON_SCREEN: number;
  SPEED_MIN: number;
  SPEED_MAX: number;
  MULT_SPEED: Record<number, number>;
  TILE_SIZE: number;
}

export interface GameState {
  running: boolean;
  elapsed: number;
  gameStart: number | null;
  score: number;
  rack: RackTile[];
  tiles: Tile[];
  dictionary: Set<string>;
  gameReady: boolean;
}

export interface WordSubmissionResult {
  word: string;
  isValid: boolean;
  pointsScored: number;
  bonusPoints: number;
  timeDelta: number;
  usedTiles: RackTile[];
}

export interface FallingEffect {
  x: number;
  y: number;
  vy: number;
  text: string;
  life: number;
  maxLife?: number;
}

export interface CatchPop {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  letter: string;
  color: string;
}