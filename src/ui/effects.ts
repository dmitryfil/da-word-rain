// Visual effects management

import type { FallingEffect, CatchPop, Tile } from '../types.js';
import { rand } from '../utils.js';

export class EffectsManager {
  private bingoEffects: FallingEffect[] = [];
  private wordEffects: FallingEffect[] = [];
  private catchPops: CatchPop[] = [];
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  updateCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  spawnBingoRain(): void {
    const x = this.canvasWidth / 2;
    const y = -40;
    const vy = rand(160, 220);
    const life = (this.canvasHeight + 120) / vy + 0.5;
    
    this.bingoEffects.push({
      x,
      y,
      vy,
      text: 'BINGO',
      life,
      maxLife: life,
    });
  }

  spawnWordRain(text: string): void {
    const x = rand(this.canvasWidth * 0.25, this.canvasWidth * 0.75);
    const y = -40;
    const vy = rand(150, 220);
    const life = (this.canvasHeight + 140) / vy + 0.5;
    
    this.wordEffects.push({
      x,
      y,
      vy,
      text,
      life,
      maxLife: life,
    });
  }

  spawnCatchPop(tile: Tile): void {
    let color = '#22c55e'; // Default green
    
    if (tile.mult === 3) {
      color = '#ff3b30'; // Red for triple
    } else if (tile.mult === 2) {
      color = '#00e5ff'; // Blue for double
    } else if (tile.green) {
      color = '#22c55e'; // Green for time bonus
    }
    
    this.catchPops.push({
      x: tile.x,
      y: tile.y,
      life: 0.5,
      maxLife: 0.5,
      letter: tile.letter,
      color,
    });
  }

  update(deltaTime: number): void {
    // Update bingo effects
    for (const effect of this.bingoEffects) {
      effect.y += effect.vy * deltaTime;
      effect.life -= deltaTime;
    }
    this.bingoEffects = this.bingoEffects.filter(
      effect => effect.life > 0 && effect.y < this.canvasHeight + 60
    );

    // Update word effects
    for (const effect of this.wordEffects) {
      effect.y += effect.vy * deltaTime;
      effect.life -= deltaTime;
    }
    this.wordEffects = this.wordEffects.filter(
      effect => effect.life > 0 && effect.y < this.canvasHeight + 60
    );

    // Update catch pops
    for (const pop of this.catchPops) {
      pop.life -= deltaTime;
      pop.y -= 20 * deltaTime; // Float upward
    }
    this.catchPops = this.catchPops.filter(pop => pop.life > 0);
  }

  getBingoEffects(): readonly FallingEffect[] {
    return this.bingoEffects;
  }

  getWordEffects(): readonly FallingEffect[] {
    return this.wordEffects;
  }

  getCatchPops(): readonly CatchPop[] {
    return this.catchPops;
  }

  clear(): void {
    this.bingoEffects = [];
    this.wordEffects = [];
    this.catchPops = [];
  }
}