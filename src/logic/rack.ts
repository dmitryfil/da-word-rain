// Rack management system

import type { RackTile, Tile, GameConfig } from '../types.js';

export class Rack {
  private tiles: RackTile[] = [];
  private readonly maxSize: number;

  constructor(config: GameConfig) {
    this.maxSize = config.RACK_MAX;
  }

  get size(): number {
    return this.tiles.length;
  }

  get isFull(): boolean {
    return this.tiles.length >= this.maxSize;
  }

  get isEmpty(): boolean {
    return this.tiles.length === 0;
  }

  getTiles(): readonly RackTile[] {
    return [...this.tiles];
  }

  addTile(tile: Tile): void {
    if (this.isFull) {
      throw new Error('Cannot add tile: rack is full');
    }

    const rackTile: RackTile = {
      id: tile.id,
      letter: tile.letter,
      points: tile.points,
      mult: tile.mult,
      green: tile.green,
    };

    this.tiles.push(rackTile);
  }

  removeTiles(tileIds: string[]): RackTile[] {
    const removed: RackTile[] = [];
    const idsToRemove = new Set(tileIds);

    this.tiles = this.tiles.filter(tile => {
      if (idsToRemove.has(tile.id)) {
        removed.push(tile);
        return false;
      }
      return true;
    });

    return removed;
  }

  clear(): void {
    this.tiles = [];
  }

  alphabetize(): void {
    this.tiles.sort((a, b) => a.letter.localeCompare(b.letter));
  }

  shuffle(): void {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  getLetterCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const tile of this.tiles) {
      counts[tile.letter] = (counts[tile.letter] || 0) + 1;
    }
    return counts;
  }

  canFormWord(word: string): boolean {
    const counts = this.getLetterCounts();
    const wordCounts: Record<string, number> = {};

    for (const letter of word.toUpperCase()) {
      wordCounts[letter] = (wordCounts[letter] || 0) + 1;
    }

    for (const [letter, needed] of Object.entries(wordCounts)) {
      if ((counts[letter] || 0) < needed) {
        return false;
      }
    }

    return true;
  }

  selectTilesForWord(word: string): RackTile[] {
    if (!this.canFormWord(word)) return [];

    const normalizedWord = word.toUpperCase();
    const counts = this.getLetterCounts();
    const used: RackTile[] = [];
    const taken = new Set<string>();

    // Priority function: prefer high multipliers and green tiles
    const getPriority = (tile: RackTile): number => {
      if (tile.mult === 3) return 3;
      if (tile.mult === 2) return 2;
      if (tile.green) return 1;
      return 0;
    };

    for (const letter of normalizedWord) {
      if ((counts[letter] || 0) <= 0) continue;

      const candidates = this.tiles.filter(
        tile => tile.letter === letter && !taken.has(tile.id)
      );

      if (candidates.length === 0) continue;

      // Sort by priority (high to low), then by points (high to low), then by ID for consistency
      candidates.sort((a, b) => 
        (getPriority(b) - getPriority(a)) ||
        ((b.points * (b.mult || 1)) - (a.points * (a.mult || 1))) ||
        a.id.localeCompare(b.id)
      );

      const chosen = candidates[0];
      used.push(chosen);
      taken.add(chosen.id);
      counts[letter]--;
    }

    return used;
  }
}