// Game constants and configuration

import type { LetterInfo, GameConfig } from './types.js';

export const LETTERS: LetterInfo[] = [
  { L: 'A', c: 9, p: 1 }, { L: 'B', c: 2, p: 3 }, { L: 'C', c: 2, p: 3 },
  { L: 'D', c: 4, p: 2 }, { L: 'E', c: 12, p: 1 }, { L: 'F', c: 2, p: 4 },
  { L: 'G', c: 3, p: 2 }, { L: 'H', c: 2, p: 4 }, { L: 'I', c: 9, p: 1 },
  { L: 'J', c: 1, p: 8 }, { L: 'K', c: 1, p: 5 }, { L: 'L', c: 4, p: 1 },
  { L: 'M', c: 2, p: 3 }, { L: 'N', c: 6, p: 1 }, { L: 'O', c: 8, p: 1 },
  { L: 'P', c: 2, p: 3 }, { L: 'Q', c: 1, p: 10 }, { L: 'R', c: 6, p: 1 },
  { L: 'S', c: 4, p: 1 }, { L: 'T', c: 6, p: 1 }, { L: 'U', c: 4, p: 1 },
  { L: 'V', c: 2, p: 4 }, { L: 'W', c: 2, p: 4 }, { L: 'X', c: 1, p: 8 },
  { L: 'Y', c: 2, p: 4 }, { L: 'Z', c: 1, p: 10 }
];

export const POINTS = Object.fromEntries(LETTERS.map(x => [x.L, x.p]));

export const DISTRIB_BAG = LETTERS.flatMap(x => Array.from({ length: x.c }, () => x.L));

export const BASE_FREQ = Object.fromEntries(LETTERS.map(x => [x.L, x.c]));

export const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export const DEFAULT_CONFIG: GameConfig = {
  MAX_TIME: 150,
  START_SCORE: 0,
  RACK_MAX: 7,
  MULTIPLIER_PROB: {
    dbl: 0.10,
    tpl: 0.04,
  },
  GREEN_PROB: 0.05,
  SPAWN_EVERY: 900,
  MAX_ON_SCREEN: 7,
  SPEED_MIN: 160,
  SPEED_MAX: 340,
  MULT_SPEED: {
    1: 1,
    2: 1.35,
    3: 1.6,
  },
  TILE_SIZE: 72,
};