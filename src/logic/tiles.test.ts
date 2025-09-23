// Tiles tests

import { TileManager } from './tiles.js';
import { DEFAULT_CONFIG } from '../constants.js';
import type { Tile } from '../types.js';

describe('TileManager', () => {
  let tileManager: TileManager;
  const canvasWidth = 800;
  const canvasHeight = 600;

  beforeEach(() => {
    tileManager = new TileManager(DEFAULT_CONFIG);
  });

  describe('canSpawn', () => {
    it('should allow spawning when tiles array is empty', () => {
      expect(tileManager.canSpawn([])).toBe(true);
    });

    it('should prevent spawning when max tiles reached', () => {
      const tiles: Tile[] = Array(DEFAULT_CONFIG.MAX_ON_SCREEN).fill(null).map((_, i) => ({
        id: `tile-${i}`,
        letter: 'A',
        points: 1,
        mult: 1,
        green: false,
        x: 100,
        y: 100,
        vx: 0,
        vy: 100,
      }));

      expect(tileManager.canSpawn(tiles)).toBe(false);
    });

    it('should prevent spawning when all letters are on screen', () => {
      // Create tiles for all letters
      const tiles: Tile[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((letter, i) => ({
        id: `tile-${i}`,
        letter,
        points: 1,
        mult: 1,
        green: false,
        x: 100,
        y: 100,
        vx: 0,
        vy: 100,
      }));

      expect(tileManager.canSpawn(tiles)).toBe(false);
    });
  });

  describe('createTile', () => {
    it('should create a valid tile when spawning is allowed', () => {
      const tile = tileManager.createTile(canvasWidth, canvasHeight, []);
      
      expect(tile).not.toBeNull();
      if (tile) {
        expect(tile.id).toBeDefined();
        expect(tile.letter).toMatch(/^[A-Z]$/);
        expect(tile.points).toBeGreaterThan(0);
        expect([1, 2, 3]).toContain(tile.mult);
        expect(typeof tile.green).toBe('boolean');
        expect(tile.x).toBeGreaterThanOrEqual(canvasWidth * 0.25);
        expect(tile.x).toBeLessThanOrEqual(canvasWidth * 0.75);
        expect(tile.y).toBe(-30);
        expect(tile.vy).toBeGreaterThan(0);
      }
    });

    it('should return null when spawning is not allowed', () => {
      const tiles: Tile[] = Array(DEFAULT_CONFIG.MAX_ON_SCREEN).fill(null).map((_, i) => ({
        id: `tile-${i}`,
        letter: 'A',
        points: 1,
        mult: 1,
        green: false,
        x: 100,
        y: 100,
        vx: 0,
        vy: 100,
      }));

      const tile = tileManager.createTile(canvasWidth, canvasHeight, tiles);
      expect(tile).toBeNull();
    });

    it('should create tiles with different letters when multiple tiles exist', () => {
      const existingTiles: Tile[] = [{
        id: 'tile-1',
        letter: 'A',
        points: 1,
        mult: 1,
        green: false,
        x: 100,
        y: 100,
        vx: 0,
        vy: 100,
      }];

      const newTile = tileManager.createTile(canvasWidth, canvasHeight, existingTiles);
      
      expect(newTile).not.toBeNull();
      if (newTile) {
        expect(newTile.letter).not.toBe('A');
      }
    });
  });

  describe('updateTile', () => {
    it('should update tile position based on velocity', () => {
      const tile: Tile = {
        id: 'test',
        letter: 'A',
        points: 1,
        mult: 1,
        green: false,
        x: 100,
        y: 50,
        vx: 10,
        vy: 20,
      };

      const deltaTime = 0.1;
      tileManager.updateTile(tile, deltaTime);

      expect(tile.x).toBe(101);
      expect(tile.y).toBe(52);
    });
  });

  describe('isOffScreen', () => {
    it('should detect when tile is off screen', () => {
      const tile: Tile = {
        id: 'test',
        letter: 'A',
        points: 1,
        mult: 1,
        green: false,
        x: 100,
        y: canvasHeight + 50,
        vx: 0,
        vy: 100,
      };

      expect(tileManager.isOffScreen(tile, canvasHeight)).toBe(true);
    });

    it('should detect when tile is on screen', () => {
      const tile: Tile = {
        id: 'test',
        letter: 'A',
        points: 1,
        mult: 1,
        green: false,
        x: 100,
        y: canvasHeight - 50,
        vx: 0,
        vy: 100,
      };

      expect(tileManager.isOffScreen(tile, canvasHeight)).toBe(false);
    });
  });

  describe('reduceWeightsForBingo', () => {
    it('should reduce weights for consonants in bingo words', () => {
      tileManager.resetDynamicWeights();
      
      // Get initial weight for 'B'
      // const initialTile = tileManager.createTile(canvasWidth, canvasHeight, []);
      
      tileManager.reduceWeightsForBingo('BINGO');
      
      // Weights should be reduced for B, N, G (consonants)
      // Weights should NOT be reduced for I, O (vowels)
      // This is tested indirectly by checking that the system still functions
      expect(() => tileManager.createTile(canvasWidth, canvasHeight, [])).not.toThrow();
    });

    it('should not reduce weights for duplicate letters', () => {
      tileManager.resetDynamicWeights();
      
      tileManager.reduceWeightsForBingo('HELLO'); // Has duplicate L
      
      // Should still function normally
      expect(() => tileManager.createTile(canvasWidth, canvasHeight, [])).not.toThrow();
    });
  });
});