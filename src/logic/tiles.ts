// Tile generation and management system

import type { Tile, GameConfig } from '../types.js';
import { LETTERS, POINTS, BASE_FREQ, VOWELS } from '../constants.js';
import { generateId, rand } from '../utils.js';

export class TileManager {
  private letterWeights: Record<string, number> = {};
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
    this.resetDynamicWeights();
  }

  resetDynamicWeights(): void {
    this.letterWeights = Object.fromEntries(LETTERS.map(l => [l.L, 1]));
  }

  private getLettersOnScreen(tiles: Tile[]): Set<string> {
    return new Set(tiles.map(t => t.letter));
  }

  private getAvailableLettersForSpawn(tiles: Tile[]): string[] {
    const present = this.getLettersOnScreen(tiles);
    return LETTERS.map(x => x.L).filter(L => !present.has(L));
  }

  canSpawn(tiles: Tile[]): boolean {
    return tiles.length < this.config.MAX_ON_SCREEN && 
           this.getAvailableLettersForSpawn(tiles).length > 0;
  }

  private selectLetterUnique(tiles: Tile[]): string | null {
    const options = this.getAvailableLettersForSpawn(tiles);
    if (options.length === 0) return null;

    let total = 0;
    const weights = options.map(L => {
      const weight = (BASE_FREQ[L] || 1) * (this.letterWeights[L] || 1);
      total += weight;
      return weight;
    });

    if (total <= 0) {
      return options[Math.floor(Math.random() * options.length)];
    }

    let r = Math.random() * total;
    for (let i = 0; i < options.length; i++) {
      r -= weights[i];
      if (r <= 0) return options[i];
    }
    
    return options[options.length - 1];
  }

  createTile(canvasWidth: number, canvasHeight: number, tiles: Tile[]): Tile | null {
    if (!this.canSpawn(tiles)) return null;

    const letter = this.selectLetterUnique(tiles);
    if (!letter) return null;

    // Determine multiplier
    const randVal = Math.random();
    let mult = 1;
    if (randVal < this.config.MULTIPLIER_PROB.tpl) {
      mult = 3;
    } else if (randVal < this.config.MULTIPLIER_PROB.tpl + this.config.MULTIPLIER_PROB.dbl) {
      mult = 2;
    }

    const isGreen = Math.random() < this.config.GREEN_PROB;

    let speed = rand(this.config.SPEED_MIN, this.config.SPEED_MAX) * (canvasHeight / 600);
    speed *= this.config.MULT_SPEED[mult] || 1;

    const x = rand(canvasWidth * 0.25, canvasWidth * 0.75);

    return {
      id: generateId(),
      letter,
      points: POINTS[letter] || 1,
      mult,
      green: isGreen,
      x,
      y: -30,
      vx: rand(-20, 20),
      vy: speed,
    };
  }

  updateTile(tile: Tile, deltaTime: number): void {
    tile.x += tile.vx * deltaTime;
    tile.y += tile.vy * deltaTime;
  }

  isOffScreen(tile: Tile, canvasHeight: number): boolean {
    return tile.y > canvasHeight + 40;
  }

  reduceWeightsForBingo(word: string): void {
    const seen = new Set<string>();
    for (const ch of word) {
      if (VOWELS.has(ch) || seen.has(ch)) continue;
      seen.add(ch);
      
      const current = this.letterWeights[ch] || 1;
      this.letterWeights[ch] = Math.max(0.01, current * 0.97);
    }
  }
}