// Effects tests

import { EffectsManager } from './effects.js';
import type { Tile } from '../types.js';

describe('EffectsManager', () => {
  let effects: EffectsManager;
  const canvasWidth = 800;
  const canvasHeight = 600;

  beforeEach(() => {
    effects = new EffectsManager(canvasWidth, canvasHeight);
  });

  const createTile = (letter: string, mult = 1, green = false): Tile => ({
    id: `tile-${letter}`,
    letter,
    points: 1,
    mult,
    green,
    x: 100,
    y: 200,
    vx: 0,
    vy: 100,
  });

  describe('spawnBingoRain', () => {
    it('should create bingo effect in center', () => {
      effects.spawnBingoRain();
      
      const bingoEffects = effects.getBingoEffects();
      expect(bingoEffects).toHaveLength(1);
      
      const effect = bingoEffects[0];
      expect(effect.text).toBe('BINGO');
      expect(effect.x).toBe(canvasWidth / 2);
      expect(effect.y).toBe(-40);
      expect(effect.life).toBeGreaterThan(0);
    });
  });

  describe('spawnWordRain', () => {
    it('should create word effect with given text', () => {
      effects.spawnWordRain('HELLO +10');
      
      const wordEffects = effects.getWordEffects();
      expect(wordEffects).toHaveLength(1);
      
      const effect = wordEffects[0];
      expect(effect.text).toBe('HELLO +10');
      expect(effect.x).toBeGreaterThanOrEqual(canvasWidth * 0.25);
      expect(effect.x).toBeLessThanOrEqual(canvasWidth * 0.75);
      expect(effect.y).toBe(-40);
      expect(effect.life).toBeGreaterThan(0);
    });
  });

  describe('spawnCatchPop', () => {
    it('should create catch pop for normal tile', () => {
      const tile = createTile('A');
      effects.spawnCatchPop(tile);
      
      const catchPops = effects.getCatchPops();
      expect(catchPops).toHaveLength(1);
      
      const pop = catchPops[0];
      expect(pop.letter).toBe('A');
      expect(pop.x).toBe(100);
      expect(pop.y).toBe(200);
      expect(pop.color).toBe('#22c55e');
    });

    it('should use correct colors for multiplier tiles', () => {
      const doubleTile = createTile('A', 2);
      const tripleTile = createTile('B', 3);
      const greenTile = createTile('C', 1, true);
      
      effects.spawnCatchPop(doubleTile);
      effects.spawnCatchPop(tripleTile);
      effects.spawnCatchPop(greenTile);
      
      const pops = effects.getCatchPops();
      expect(pops).toHaveLength(3);
      
      expect(pops[0].color).toBe('#00e5ff'); // Blue for double
      expect(pops[1].color).toBe('#ff3b30'); // Red for triple
      expect(pops[2].color).toBe('#22c55e'); // Green for time bonus
    });
  });

  describe('update', () => {
    it('should move effects downward', () => {
      effects.spawnBingoRain();
      effects.spawnWordRain('TEST');
      
      const initialBingo = effects.getBingoEffects()[0];
      const initialWord = effects.getWordEffects()[0];
      
      const initialBingoY = initialBingo.y;
      const initialWordY = initialWord.y;
      
      effects.update(0.1);
      
      const updatedBingo = effects.getBingoEffects()[0];
      const updatedWord = effects.getWordEffects()[0];
      
      expect(updatedBingo.y).toBeGreaterThan(initialBingoY);
      expect(updatedWord.y).toBeGreaterThan(initialWordY);
    });

    it('should decrease life of effects', () => {
      effects.spawnBingoRain();
      
      const initialEffect = effects.getBingoEffects()[0];
      const initialLife = initialEffect.life;
      
      effects.update(0.1);
      
      const updatedEffect = effects.getBingoEffects()[0];
      expect(updatedEffect.life).toBeLessThan(initialLife);
    });

    it('should remove expired effects', () => {
      effects.spawnBingoRain();
      
      // Update for a very long time to expire the effect
      effects.update(100);
      
      expect(effects.getBingoEffects()).toHaveLength(0);
    });

    it('should move catch pops upward', () => {
      const tile = createTile('A');
      effects.spawnCatchPop(tile);
      
      const initialPop = effects.getCatchPops()[0];
      const initialY = initialPop.y;
      
      effects.update(0.1);
      
      const updatedPop = effects.getCatchPops()[0];
      expect(updatedPop.y).toBeLessThan(initialY);
    });
  });

  describe('updateCanvasSize', () => {
    it('should update canvas dimensions', () => {
      const newWidth = 1000;
      const newHeight = 800;
      
      effects.updateCanvasSize(newWidth, newHeight);
      
      // Test indirectly by checking bingo effect spawn position
      effects.spawnBingoRain();
      const effect = effects.getBingoEffects()[0];
      expect(effect.x).toBe(newWidth / 2);
    });
  });

  describe('clear', () => {
    it('should remove all effects', () => {
      effects.spawnBingoRain();
      effects.spawnWordRain('TEST');
      effects.spawnCatchPop(createTile('A'));
      
      expect(effects.getBingoEffects()).toHaveLength(1);
      expect(effects.getWordEffects()).toHaveLength(1);
      expect(effects.getCatchPops()).toHaveLength(1);
      
      effects.clear();
      
      expect(effects.getBingoEffects()).toHaveLength(0);
      expect(effects.getWordEffects()).toHaveLength(0);
      expect(effects.getCatchPops()).toHaveLength(0);
    });
  });
});