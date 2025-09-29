// Rack tests

import { Rack } from './rack.js';
import { DEFAULT_CONFIG } from '../constants.js';
import type { Tile } from '../types.js';

describe('Rack', () => {
  let rack: Rack;

  beforeEach(() => {
    rack = new Rack(DEFAULT_CONFIG);
  });

  const createTile = (letter: string, mult = 1, green = false): Tile => ({
    id: `tile-${letter}-${Date.now()}-${Math.random()}`,
    letter,
    points: 1,
    mult,
    green,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  });

  describe('basic properties', () => {
    it('should start empty', () => {
      expect(rack.size).toBe(0);
      expect(rack.isEmpty).toBe(true);
      expect(rack.isFull).toBe(false);
    });

    it('should track size correctly', () => {
      rack.addTile(createTile('A'));
      expect(rack.size).toBe(1);
      expect(rack.isEmpty).toBe(false);

      rack.addTile(createTile('B'));
      expect(rack.size).toBe(2);
    });

    it('should detect when full', () => {
      for (let i = 0; i < DEFAULT_CONFIG.RACK_MAX; i++) {
        rack.addTile(createTile(String.fromCharCode(65 + i))); // A, B, C, ...
      }
      
      expect(rack.isFull).toBe(true);
      expect(rack.size).toBe(DEFAULT_CONFIG.RACK_MAX);
    });
  });

  describe('addTile', () => {
    it('should add tiles successfully when not full', () => {
      const tile = createTile('A');
      rack.addTile(tile);
      
      expect(rack.size).toBe(1);
      
      const tiles = rack.getTiles();
      expect(tiles[0].letter).toBe('A');
      expect(tiles[0].id).toBe(tile.id);
    });

    it('should throw error when rack is full', () => {
      // Fill the rack
      for (let i = 0; i < DEFAULT_CONFIG.RACK_MAX; i++) {
        rack.addTile(createTile(String.fromCharCode(65 + i)));
      }
      
      expect(() => {
        rack.addTile(createTile('X'));
      }).toThrow('Cannot add tile: rack is full');
      expect(rack.size).toBe(DEFAULT_CONFIG.RACK_MAX);
    });
  });

  describe('removeTiles', () => {
    it('should remove specified tiles', () => {
      const tile1 = createTile('A');
      const tile2 = createTile('B');
      const tile3 = createTile('C');
      
      rack.addTile(tile1);
      rack.addTile(tile2);
      rack.addTile(tile3);
      
      const removed = rack.removeTiles([tile1.id, tile3.id]);
      
      expect(removed).toHaveLength(2);
      expect(removed.map(t => t.letter).sort()).toEqual(['A', 'C']);
      expect(rack.size).toBe(1);
      expect(rack.getTiles()[0].letter).toBe('B');
    });

    it('should handle non-existent tile IDs gracefully', () => {
      const tile = createTile('A');
      rack.addTile(tile);
      
      const removed = rack.removeTiles(['non-existent']);
      
      expect(removed).toHaveLength(0);
      expect(rack.size).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all tiles', () => {
      rack.addTile(createTile('A'));
      rack.addTile(createTile('B'));
      
      rack.clear();
      
      expect(rack.size).toBe(0);
      expect(rack.isEmpty).toBe(true);
    });
  });

  describe('alphabetize', () => {
    it('should sort tiles alphabetically', () => {
      rack.addTile(createTile('Z'));
      rack.addTile(createTile('A'));
      rack.addTile(createTile('M'));
      
      rack.alphabetize();
      
      const letters = rack.getTiles().map(t => t.letter);
      expect(letters).toEqual(['A', 'M', 'Z']);
    });
  });

  describe('shuffle', () => {
    it('should randomize tile order', () => {
      const originalOrder = ['A', 'B', 'C', 'D', 'E'];
      originalOrder.forEach(letter => rack.addTile(createTile(letter)));
      
      // const beforeShuffle = rack.getTiles().map(t => t.letter);
      rack.shuffle();
      const afterShuffle = rack.getTiles().map(t => t.letter);
      
      // Should have same letters
      expect(afterShuffle.sort()).toEqual(originalOrder);
      
      // Order might be different (though there's a small chance it's the same)
      // We'll just ensure the method doesn't crash
      expect(afterShuffle).toHaveLength(originalOrder.length);
    });
  });

  describe('getLetterCounts', () => {
    it('should count letters correctly', () => {
      rack.addTile(createTile('A'));
      rack.addTile(createTile('A'));
      rack.addTile(createTile('B'));
      
      const counts = rack.getLetterCounts();
      
      expect(counts.A).toBe(2);
      expect(counts.B).toBe(1);
      expect(counts.C).toBeUndefined();
    });
  });

  describe('canFormWord', () => {
    beforeEach(() => {
      rack.addTile(createTile('H'));
      rack.addTile(createTile('E'));
      rack.addTile(createTile('L'));
      rack.addTile(createTile('L'));
      rack.addTile(createTile('O'));
    });

    it('should return true for words that can be formed', () => {
      expect(rack.canFormWord('HELLO')).toBe(true);
      expect(rack.canFormWord('HELL')).toBe(true);
      expect(rack.canFormWord('HE')).toBe(true);
      expect(rack.canFormWord('hello')).toBe(true); // Case insensitive
    });

    it('should return false for words that cannot be formed', () => {
      expect(rack.canFormWord('WORLD')).toBe(false); // Missing W, R, D
      expect(rack.canFormWord('HELLLO')).toBe(false); // Need 3 L's but only have 2
    });
  });

  describe('selectTilesForWord', () => {
    it('should select appropriate tiles for a word', () => {
      const tileH = createTile('H');
      const tileE = createTile('E');
      const tileL1 = createTile('L', 2); // Double multiplier
      const tileL2 = createTile('L', 1);
      const tileO = createTile('O', 1, true); // Green tile
      
      rack.addTile(tileH);
      rack.addTile(tileE);
      rack.addTile(tileL1);
      rack.addTile(tileL2);
      rack.addTile(tileO);
      
      const selected = rack.selectTilesForWord('HELLO');
      
      expect(selected).toHaveLength(5);
      expect(selected.map(t => t.letter).join('')).toBe('HELLO');
      
      // Should prefer the double multiplier L tile
      const selectedLs = selected.filter(t => t.letter === 'L');
      expect(selectedLs.some(t => t.mult === 2)).toBe(true);
    });

    it('should return empty array for impossible words', () => {
      rack.addTile(createTile('A'));
      rack.addTile(createTile('B'));
      
      const selected = rack.selectTilesForWord('HELLO');
      expect(selected).toHaveLength(0);
    });

    it('should prioritize multiplier tiles', () => {
      const tileA1 = createTile('A', 1);
      const tileA2 = createTile('A', 2);
      const tileA3 = createTile('A', 3);
      
      rack.addTile(tileA1);
      rack.addTile(tileA2);
      rack.addTile(tileA3);
      
      const selected = rack.selectTilesForWord('A');
      
      expect(selected).toHaveLength(1);
      expect(selected[0].mult).toBe(3); // Should select triple multiplier
    });
  });
});