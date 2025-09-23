// Main entry point

import { Game } from './game.js';
import { DEFAULT_CONFIG } from './constants.js';

// Set up viewport height CSS variable for mobile
function setVH(): void {
  document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
}

setVH();
window.addEventListener('resize', setVH);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('play') as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  
  // Initialize game
  const game = new Game(canvas, DEFAULT_CONFIG);
  
  // Make game available for debugging
  (window as any).game = game;
  
  console.log('Game initialized');
});