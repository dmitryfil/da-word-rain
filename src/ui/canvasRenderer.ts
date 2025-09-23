// Canvas rendering system

import type { Tile, FallingEffect, CatchPop } from '../types.js';

export interface CanvasRendererConfig {
  tileSize: number;
  colors: {
    background: string;
    tile: string;
    tileEdge: string;
    tileShadow: string;
    text: string;
    double: string;
    triple: string;
    green: string;
  };
}

export class CanvasRenderer {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: CanvasRendererConfig;
  private dpr: number;

  constructor(canvas: HTMLCanvasElement, config: CanvasRendererConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = config;
    this.dpr = window.devicePixelRatio || 1;
    
    this.setupCanvas();
  }

  private setupCanvas(): void {
    const cssWidth = this.canvas.clientWidth;
    const cssHeight = this.canvas.clientHeight;
    
    this.canvas.width = Math.floor(cssWidth * this.dpr);
    this.canvas.height = Math.floor(cssHeight * this.dpr);
    
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  resize(): void {
    this.setupCanvas();
  }

  get width(): number {
    return this.canvas.clientWidth;
  }

  get height(): number {
    return this.canvas.clientHeight;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    const radius = Math.min(r, w / 2, h / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, radius);
    this.ctx.arcTo(x + w, y + h, x, y + h, radius);
    this.ctx.arcTo(x, y + h, x, y, radius);
    this.ctx.arcTo(x, y, x + w, y, radius);
  }

  renderTile(tile: Tile): void {
    const size = this.config.tileSize;
    const r = 10;
    
    this.ctx.save();
    this.ctx.translate(tile.x, tile.y);
    
    // Shadow
    this.ctx.fillStyle = this.config.colors.tileShadow;
    this.roundRect(-size / 2 + 2, -size / 2 + 6, size, size, r);
    this.ctx.fill();
    
    // Base tile
    this.ctx.fillStyle = this.config.colors.tile;
    this.ctx.strokeStyle = this.config.colors.tileEdge;
    this.ctx.lineWidth = 2;
    this.roundRect(-size / 2, -size / 2, size, size, r);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Multiplier effects
    if (tile.mult === 2) {
      this.ctx.strokeStyle = this.config.colors.double;
      this.ctx.lineWidth = 7;
      this.ctx.shadowColor = this.ctx.strokeStyle;
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    } else if (tile.mult === 3) {
      this.ctx.strokeStyle = this.config.colors.triple;
      this.ctx.lineWidth = 7;
      this.ctx.shadowColor = this.ctx.strokeStyle;
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }
    
    // Green tile effect
    if (tile.green) {
      this.ctx.strokeStyle = this.config.colors.green;
      this.ctx.lineWidth = 7;
      this.ctx.shadowColor = this.ctx.strokeStyle;
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }
    
    // Letter
    this.ctx.fillStyle = this.config.colors.text;
    this.ctx.font = '900 22px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(tile.letter, 0, -2);
    
    // Points
    this.ctx.font = '800 12px ui-sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'alphabetic';
    const points = tile.points * (tile.mult || 1);
    this.ctx.fillText(String(points), size / 2 - 6, size / 2 - 6);
    
    this.ctx.restore();
  }

  renderCatchPop(pop: CatchPop): void {
    const progress = 1 - (pop.life / pop.maxLife);
    const radius = 10 + progress * 24;
    const alpha = Math.max(0, pop.life / pop.maxLife);
    
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    
    // Ring effect
    this.ctx.strokeStyle = pop.color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(pop.x, pop.y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Letter
    this.ctx.fillStyle = pop.color;
    this.ctx.font = '900 18px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(pop.letter, pop.x, pop.y);
    
    this.ctx.restore();
  }

  renderFallingEffect(effect: FallingEffect, color: string): void {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.font = '900 28px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(effect.text, effect.x, effect.y);
    this.ctx.restore();
  }

  renderScene(
    tiles: Tile[],
    catchPops: CatchPop[],
    fallingEffects: FallingEffect[]
  ): void {
    this.clear();
    
    // Render tiles
    for (const tile of tiles) {
      this.renderTile(tile);
    }
    
    // Render catch pops
    for (const pop of catchPops) {
      this.renderCatchPop(pop);
    }
    
    // Render falling effects
    for (const effect of fallingEffects) {
      this.renderFallingEffect(effect, '#f59e0b');
    }
  }

  getTileAtPoint(x: number, y: number, tiles: Tile[]): Tile | null {
    let bestTile: Tile | null = null;
    let bestDistance = Infinity;
    const radius = this.config.tileSize * 0.6;
    
    for (const tile of tiles) {
      const dx = tile.x - x;
      const dy = tile.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < radius && distance < bestDistance) {
        bestTile = tile;
        bestDistance = distance;
      }
    }
    
    return bestTile;
  }
}

export const DEFAULT_RENDERER_CONFIG: CanvasRendererConfig = {
  tileSize: 72,
  colors: {
    background: 'linear-gradient(180deg,#0b1220,#0a0f1b)',
    tile: '#f8f5e3',
    tileEdge: '#e2d9b1',
    tileShadow: 'rgba(0,0,0,.35)',
    text: '#111827',
    double: '#00e5ff',
    triple: '#ff3b30',
    green: '#22c55e',
  },
};