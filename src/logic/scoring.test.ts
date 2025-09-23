// Scoring tests

import { ScoringSystem } from './scoring.js';
import { Dictionary } from './dictionary.js';
import type { RackTile } from '../types.js';

describe('ScoringSystem', () => {
  let dictionary: Dictionary;
  let scoringSystem: ScoringSystem;

  beforeEach(() => {
    dictionary = new Dictionary();
    dictionary.add('HELLO');
    dictionary.add('WORLD');
    dictionary.add('TESTING');
    scoringSystem = new ScoringSystem(dictionary);
  });

  const createRackTile = (letter: string, points = 1, mult = 1, green = false): RackTile => ({
    id: `tile-${letter}`,
    letter,
    points,
    mult,
    green,
  });

  describe('calculateTilePoints', () => {
    it('should calculate basic points correctly', () => {
      const tiles = [
        createRackTile('H', 4),
        createRackTile('E', 1),
        createRackTile('L', 1),
        createRackTile('L', 1),
        createRackTile('O', 1),
      ];

      const points = scoringSystem.calculateTilePoints(tiles);
      expect(points).toBe(8); // 4 + 1 + 1 + 1 + 1
    });

    it('should apply multipliers correctly', () => {
      const tiles = [
        createRackTile('H', 4, 2), // Double letter: 4 * 2 = 8
        createRackTile('E', 1, 3), // Triple letter: 1 * 3 = 3
        createRackTile('L', 1, 1), // Normal: 1 * 1 = 1
      ];

      const points = scoringSystem.calculateTilePoints(tiles);
      expect(points).toBe(12); // 8 + 3 + 1
    });

    it('should handle empty tiles array', () => {
      const points = scoringSystem.calculateTilePoints([]);
      expect(points).toBe(0);
    });
  });

  describe('calculateBingoBonus', () => {
    it('should return 50 for 7-letter words', () => {
      expect(scoringSystem.calculateBingoBonus(7)).toBe(50);
    });

    it('should return 0 for non-7-letter words', () => {
      expect(scoringSystem.calculateBingoBonus(1)).toBe(0);
      expect(scoringSystem.calculateBingoBonus(5)).toBe(0);
      expect(scoringSystem.calculateBingoBonus(6)).toBe(0);
      expect(scoringSystem.calculateBingoBonus(8)).toBe(0);
    });
  });

  describe('calculateTimeBonus', () => {
    it('should return +5 per green tile for valid words', () => {
      const tiles = [
        createRackTile('H', 4, 1, true), // Green
        createRackTile('E', 1, 1, false), // Not green
        createRackTile('L', 1, 1, true), // Green
      ];

      const bonus = scoringSystem.calculateTimeBonus(tiles, true);
      expect(bonus).toBe(10); // 2 green tiles * 5 seconds each
    });

    it('should return -5 per green tile for invalid words', () => {
      const tiles = [
        createRackTile('H', 4, 1, true), // Green
        createRackTile('E', 1, 1, true), // Green
      ];

      const bonus = scoringSystem.calculateTimeBonus(tiles, false);
      expect(bonus).toBe(-10); // 2 green tiles * -5 seconds each
    });

    it('should return 0 when no green tiles', () => {
      const tiles = [
        createRackTile('H', 4),
        createRackTile('E', 1),
      ];

      expect(scoringSystem.calculateTimeBonus(tiles, true)).toBe(0);
      expect(scoringSystem.calculateTimeBonus(tiles, false)).toBe(0);
    });
  });

  describe('evaluateWord', () => {
    it('should evaluate valid words correctly', () => {
      const tiles = [
        createRackTile('H', 4),
        createRackTile('E', 1),
        createRackTile('L', 1),
        createRackTile('L', 1),
        createRackTile('O', 1),
      ];

      const result = scoringSystem.evaluateWord('HELLO', tiles);

      expect(result.word).toBe('HELLO');
      expect(result.isValid).toBe(true);
      expect(result.pointsScored).toBe(8);
      expect(result.bonusPoints).toBe(0);
      expect(result.timeDelta).toBe(0);
      expect(result.usedTiles).toEqual(tiles);
    });

    it('should evaluate invalid words correctly', () => {
      const tiles = [
        createRackTile('X', 8),
        createRackTile('Y', 4),
        createRackTile('Z', 10),
      ];

      const result = scoringSystem.evaluateWord('XYZ', tiles);

      expect(result.word).toBe('XYZ');
      expect(result.isValid).toBe(false);
      expect(result.pointsScored).toBe(-22); // Negative score for invalid word
      expect(result.bonusPoints).toBe(0);
      expect(result.timeDelta).toBe(0);
    });

    it('should handle 7-letter words with bingo bonus', () => {
      const tiles = Array.from('TESTING').map(letter => createRackTile(letter, 1));

      const result = scoringSystem.evaluateWord('TESTING', tiles);

      expect(result.word).toBe('TESTING');
      expect(result.isValid).toBe(true);
      expect(result.pointsScored).toBe(7);
      expect(result.bonusPoints).toBe(50);
      expect(result.timeDelta).toBe(0);
    });

    it('should handle words with green tiles and multipliers', () => {
      const tiles = [
        createRackTile('H', 4, 2, true), // Double multiplier, green: 8 points, +5 time
        createRackTile('E', 1, 1, false), // Normal: 1 point
      ];

      const result = scoringSystem.evaluateWord('HE', tiles);

      expect(result.word).toBe('HE');
      expect(result.isValid).toBe(false); // HE not in our test dictionary
      expect(result.pointsScored).toBe(-9); // -(8 + 1) negative for invalid
      expect(result.bonusPoints).toBe(0);
      expect(result.timeDelta).toBe(-5); // -5 for green tile in invalid word
    });

    it('should normalize word case', () => {
      const tiles = [
        createRackTile('H', 4),
        createRackTile('E', 1),
        createRackTile('L', 1),
        createRackTile('L', 1),
        createRackTile('O', 1),
      ];

      const result = scoringSystem.evaluateWord('hello', tiles);

      expect(result.word).toBe('HELLO');
      expect(result.isValid).toBe(true);
    });
  });

  describe('formatScoreChange', () => {
    it('should format valid word results correctly', () => {
      const result = {
        word: 'HELLO',
        isValid: true,
        pointsScored: 10,
        bonusPoints: 0,
        timeDelta: 0,
        usedTiles: [],
      };

      const formatted = scoringSystem.formatScoreChange(result);
      expect(formatted).toBe('✅ HELLO +10 points');
    });

    it('should format invalid word results correctly', () => {
      const result = {
        word: 'XYZ',
        isValid: false,
        pointsScored: -15,
        bonusPoints: 0,
        timeDelta: 0,
        usedTiles: [],
      };

      const formatted = scoringSystem.formatScoreChange(result);
      expect(formatted).toBe('❌ XYZ −15 points');
    });

    it('should format bingo results correctly', () => {
      const result = {
        word: 'TESTING',
        isValid: true,
        pointsScored: 20,
        bonusPoints: 50,
        timeDelta: 0,
        usedTiles: [],
      };

      const formatted = scoringSystem.formatScoreChange(result);
      expect(formatted).toBe('✅ TESTING +20 + BINGO! +50 points');
    });
  });
});