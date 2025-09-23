// Rack UI management

import type { RackTile, GameConfig } from '../types.js';

export interface RackUICallbacks {
  onTileClick?: (tile: RackTile) => void;
  onAlphabetize?: () => void;
  onShuffle?: () => void;
}

export class RackUI {
  private rackElement: HTMLElement;
  private controlsElement: HTMLElement;
  private callbacks: RackUICallbacks;
  private maxSize: number;

  constructor(
    rackElement: HTMLElement,
    controlsElement: HTMLElement,
    config: GameConfig,
    callbacks: RackUICallbacks = {}
  ) {
    this.rackElement = rackElement;
    this.controlsElement = controlsElement;
    this.callbacks = callbacks;
    this.maxSize = config.RACK_MAX;
    
    this.setupControls();
  }

  private setupControls(): void {
    const alphabetizeBtn = this.controlsElement.querySelector('#btnAlpha') as HTMLButtonElement;
    const shuffleBtn = this.controlsElement.querySelector('#btnShuffle') as HTMLButtonElement;
    
    if (alphabetizeBtn) {
      alphabetizeBtn.addEventListener('click', () => {
        this.callbacks.onAlphabetize?.();
      });
    }
    
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        this.callbacks.onShuffle?.();
      });
    }
  }

  render(tiles: readonly RackTile[], isFull: boolean, isGameRunning: boolean): void {
    // Clear existing tiles
    this.rackElement.innerHTML = '';
    
    // Render tiles
    for (const tile of tiles) {
      const tileElement = this.createTileElement(tile);
      this.rackElement.appendChild(tileElement);
    }
    
    // Update controls state
    this.updateControls(isFull, isGameRunning);
  }

  private createTileElement(tile: RackTile): HTMLElement {
    const div = document.createElement('div');
    div.className = this.getTileClasses(tile);
    div.innerHTML = `
      <div class="letter">${tile.letter}</div>
      <div class="points">${tile.points * (tile.mult || 1)}</div>
    `;
    
    if (this.callbacks.onTileClick) {
      div.addEventListener('click', () => {
        this.callbacks.onTileClick?.(tile);
      });
      div.style.cursor = 'pointer';
    }
    
    return div;
  }

  private getTileClasses(tile: RackTile): string {
    const classes = ['tile'];
    
    if (tile.mult === 2) classes.push('dbl');
    if (tile.mult === 3) classes.push('tpl');
    if (tile.green) classes.push('green');
    
    return classes.join(' ');
  }

  private updateControls(isFull: boolean, isGameRunning: boolean): void {
    const alphabetizeBtn = this.controlsElement.querySelector('#btnAlpha') as HTMLButtonElement;
    const shuffleBtn = this.controlsElement.querySelector('#btnShuffle') as HTMLButtonElement;
    
    const enabled = isFull && isGameRunning;
    
    if (alphabetizeBtn) {
      alphabetizeBtn.disabled = !enabled;
      alphabetizeBtn.title = enabled 
        ? 'Alphabetize rack A→Z' 
        : 'Requires full rack (7)';
    }
    
    if (shuffleBtn) {
      shuffleBtn.disabled = !enabled;
      shuffleBtn.title = enabled 
        ? 'Shuffle rack randomly' 
        : 'Requires full rack (7)';
    }
  }

  updateBadge(size: number): void {
    const badge = document.getElementById('rackBadge');
    if (badge) {
      badge.textContent = `Rack: ${size}/${this.maxSize}`;
    }
  }
}