// Score and game status UI management

import type { WordSubmissionResult } from '../types.js';

export class ScoreUI {
  private scoreBadge: HTMLElement;
  private timeBadge: HTMLElement;
  private lastWordBadge: HTMLElement;
  private logElement: HTMLElement;

  constructor() {
    this.scoreBadge = document.getElementById('scoreBadge')!;
    this.timeBadge = document.getElementById('timeBadge')!;
    this.lastWordBadge = document.getElementById('lastWordBadge')!;
    this.logElement = document.getElementById('log')!;
  }

  updateScore(score: number): void {
    this.scoreBadge.textContent = `Score: ${Math.round(score)}`;
  }

  updateTime(remainingSeconds: number): void {
    this.timeBadge.textContent = `Time: ${remainingSeconds}s`;
  }

  updateLastWord(result: WordSubmissionResult): void {
    const { word, pointsScored, bonusPoints } = result;
    const sign = pointsScored >= 0 ? '+' : '−';
    const points = Math.abs(Math.round(pointsScored));
    const bonus = bonusPoints > 0 ? ` (+${bonusPoints} BINGO)` : '';
    
    this.lastWordBadge.textContent = `Last: ${word} ${sign}${points}${bonus}`;
    
    // Update styling based on result
    this.lastWordBadge.classList.remove('good', 'bad');
    if (pointsScored > 0) {
      this.lastWordBadge.classList.add('good');
    } else if (pointsScored < 0) {
      this.lastWordBadge.classList.add('bad');
    }
    
    // Add flash animation
    this.lastWordBadge.classList.remove('flash-badge');
    void this.lastWordBadge.offsetWidth; // Force reflow
    this.lastWordBadge.classList.add('flash-badge');
    
    setTimeout(() => {
      this.lastWordBadge.classList.remove('flash-badge');
    }, 600);
  }

  resetLastWord(): void {
    this.lastWordBadge.textContent = 'Last: —';
    this.lastWordBadge.classList.remove('good', 'bad');
  }

  addLogEntry(message: string): void {
    const wasAtBottom = Math.abs(
      this.logElement.scrollTop + this.logElement.clientHeight - this.logElement.scrollHeight
    ) < 4;
    
    if (this.logElement.textContent) {
      this.logElement.textContent += '\n';
    }
    this.logElement.textContent += message;
    
    if (wasAtBottom) {
      this.logElement.scrollTop = this.logElement.scrollHeight;
    }
  }

  clearLog(): void {
    this.logElement.textContent = '';
  }

  showFlashMessage(text: string, isGood = true): void {
    const flashMsg = document.getElementById('flashMsg');
    if (!flashMsg) return;
    
    flashMsg.textContent = text;
    flashMsg.classList.remove('show');
    void flashMsg.offsetWidth; // Force reflow
    
    flashMsg.style.borderColor = isGood ? '#22c55e' : '#ef4444';
    flashMsg.classList.add('show');
    
    setTimeout(() => {
      flashMsg.classList.remove('show');
    }, 1200);
  }
}