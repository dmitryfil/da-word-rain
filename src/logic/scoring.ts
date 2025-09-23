// Scoring system

import type { RackTile, WordSubmissionResult } from '../types.js';
import { Dictionary } from './dictionary.js';

export class ScoringSystem {
  private dictionary: Dictionary;

  constructor(dictionary: Dictionary) {
    this.dictionary = dictionary;
  }

  calculateTilePoints(tiles: RackTile[]): number {
    return tiles.reduce((total, tile) => {
      return total + (tile.points * (tile.mult || 1));
    }, 0);
  }

  calculateBingoBonus(wordLength: number): number {
    return wordLength === 7 ? 50 : 0;
  }

  calculateTimeBonus(tiles: RackTile[], isValidWord: boolean): number {
    const greenTiles = tiles.filter(tile => tile.green);
    if (greenTiles.length === 0) return 0;
    
    return greenTiles.length * (isValidWord ? 5 : -5);
  }

  evaluateWord(word: string, tiles: RackTile[]): WordSubmissionResult {
    const normalizedWord = word.toUpperCase();
    const isValid = this.dictionary.has(normalizedWord);
    
    const pointsScored = this.calculateTilePoints(tiles);
    const bonusPoints = this.calculateBingoBonus(normalizedWord.length);
    const timeDelta = this.calculateTimeBonus(tiles, isValid);
    
    return {
      word: normalizedWord,
      isValid,
      pointsScored: isValid ? pointsScored : -pointsScored,
      bonusPoints: isValid ? bonusPoints : 0,
      timeDelta,
      usedTiles: [...tiles],
    };
  }

  formatScoreChange(result: WordSubmissionResult): string {
    const { word, isValid, pointsScored, bonusPoints } = result;
    const symbol = isValid ? '✅' : '❌';
    const sign = pointsScored >= 0 ? '+' : '−';
    const points = Math.abs(pointsScored);
    const bonus = bonusPoints > 0 ? ` + BINGO! +${bonusPoints}` : '';
    
    return `${symbol} ${word} ${sign}${points}${bonus} points`;
  }
}

export function createScoringSystem(dictionary: Dictionary): ScoringSystem {
  return new ScoringSystem(dictionary);
}