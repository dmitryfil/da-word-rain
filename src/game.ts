// Main game coordinator

import type { GameState, GameConfig, Tile, RackTile, WordSubmissionResult } from './types.js';
import { DEFAULT_CONFIG } from './constants.js';
import { TileManager } from './logic/tiles.js';
import { Rack } from './logic/rack.js';
import { ScoringSystem } from './logic/scoring.js';
import { dictionary } from './logic/dictionary.js';
import { CanvasRenderer, DEFAULT_RENDERER_CONFIG } from './ui/canvasRenderer.js';
import { RackUI } from './ui/rackUI.js';
import { ScoreUI } from './ui/scoreUI.js';
import { EffectsManager } from './ui/effects.js';
import { clamp } from './utils.js';

export class Game {
  private config: GameConfig;
  private state: GameState;
  
  // Systems
  private tileManager: TileManager;
  private rack: Rack;
  private scoringSystem: ScoringSystem;
  private renderer: CanvasRenderer;
  private rackUI!: RackUI;
  private scoreUI!: ScoreUI;
  private effects: EffectsManager;
  
  // Timing
  private lastTimestamp = 0;
  private spawnAccumulator = 0;
  private lastSecondShown = -1;
  private animationId: number | null = null;
  
  // Input handling
  private inputElement!: HTMLInputElement;
  private submitButton!: HTMLButtonElement;
  private isComposing = false;

  constructor(canvas: HTMLCanvasElement, config: GameConfig = DEFAULT_CONFIG) {
    this.config = config;
    
    // Initialize state
    this.state = {
      running: false,
      elapsed: 0,
      gameStart: null,
      score: config.START_SCORE,
      rack: [],
      tiles: [],
      dictionary: new Set(),
      gameReady: false,
    };
    
    // Initialize systems
    this.tileManager = new TileManager(config);
    this.rack = new Rack(config);
    this.scoringSystem = new ScoringSystem(dictionary);
    this.renderer = new CanvasRenderer(canvas, DEFAULT_RENDERER_CONFIG);
    this.effects = new EffectsManager(this.renderer.width, this.renderer.height);
    
    // Initialize UI
    this.initializeUI();
    
    // Setup input handling
    this.setupInputHandling();
    
    // Setup canvas interaction
    this.setupCanvasInteraction();
    
    // Start game loop
    this.startGameLoop();
  }

  private initializeUI(): void {
    const rackElement = document.getElementById('rack')!;
    const rackControlsElement = document.getElementById('rackControlsRow')!;
    
    this.rackUI = new RackUI(rackElement, rackControlsElement, this.config, {
      onAlphabetize: () => this.rack.alphabetize(),
      onShuffle: () => this.rack.shuffle(),
    });
    
    this.scoreUI = new ScoreUI();
    
    // Setup reset button
    const resetButton = document.getElementById('resetBtn') as HTMLButtonElement;
    resetButton?.addEventListener('click', () => this.reset());
    
    // Setup dictionary loading
    this.setupDictionaryLoading();
  }

  private setupDictionaryLoading(): void {
    const loadButton = document.getElementById('loadDict') as HTMLButtonElement;
    const fileInput = document.getElementById('dictFile') as HTMLInputElement;
    
    loadButton?.addEventListener('click', () => fileInput?.click());
    
    fileInput?.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await this.loadDictionary(file);
      }
    });
    
    // Try to auto-load TWL dictionary
    this.tryAutoLoadTWL();
  }

  private async tryAutoLoadTWL(): Promise<void> {
    try {
      await dictionary.loadFromUrl('twl.txt');
      this.onDictionaryReady();
      this.scoreUI.addLogEntry('📚 Loaded TWL dictionary with ' + dictionary.size.toLocaleString() + ' words.');
    } catch (error) {
      this.scoreUI.addLogEntry('⚠️ TWL auto-load failed. Waiting for manual dictionary load.');
      this.updateFooterMessage('Dictionary required. Tap "Load Dictionary" and select a word list (txt/json).');
    }
  }

  private async loadDictionary(file: File): Promise<void> {
    try {
      await dictionary.loadFromFile(file);
      this.onDictionaryReady();
      this.scoreUI.addLogEntry('📚 Loaded dictionary with ' + dictionary.size.toLocaleString() + ' words.');
    } catch (error) {
      this.scoreUI.addLogEntry('⚠️ Failed to load dictionary: ' + String(error));
    }
  }

  private onDictionaryReady(): void {
    this.state.gameReady = true;
    this.start();
    this.updateFooterMessage('Timer: 150 seconds · Lose 1 point every 5 seconds • Tap tiles to collect • Compose when rack is full');
  }

  private setupInputHandling(): void {
    this.inputElement = document.getElementById('composeInput') as HTMLInputElement;
    this.submitButton = document.getElementById('submitWord') as HTMLButtonElement;
    
    // Handle word composition input
    this.inputElement.addEventListener('input', (e) => this.handleComposeInput(e));
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.submitWord();
      }
    });
    
    // Handle submit button
    this.submitButton.addEventListener('click', () => this.submitWord());
    
    // Handle keyboard tile collection
    window.addEventListener('keydown', (e) => {
      if (!this.state.running || !this.state.gameReady) return;
      
      const key = e.key.toUpperCase();
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        this.collectTileByLetter(key);
      }
    });
  }

  private handleComposeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    // Validate against rack contents
    const rackCounts = this.rack.getLetterCounts();
    const usedCounts: Record<string, number> = {};
    let validValue = '';
    
    for (const char of value) {
      const used = usedCounts[char] || 0;
      const available = rackCounts[char] || 0;
      
      if (used < available) {
        validValue += char;
        usedCounts[char] = used + 1;
      }
    }
    
    if (validValue !== input.value) {
      input.value = validValue;
    }
    
    // Update projected score
    this.updateProjectedScore(validValue);
    
    // Update chosen tiles display
    this.updateChosenTilesDisplay(validValue);
  }

  private updateProjectedScore(word: string): void {
    const projectedElement = document.getElementById('projectedScore');
    if (!projectedElement) return;
    
    if (word.length < 2) {
      projectedElement.textContent = 'Projected: —';
      return;
    }
    
    const tiles = this.rack.selectTilesForWord(word);
    const points = this.scoringSystem.calculateTilePoints(tiles);
    projectedElement.textContent = `Projected: ${points}`;
  }

  private updateChosenTilesDisplay(word: string): void {
    const chosenRackElement = document.getElementById('chosenRack');
    if (!chosenRackElement) return;
    
    chosenRackElement.innerHTML = '';
    
    if (word.length === 0) return;
    
    const tiles = this.rack.selectTilesForWord(word);
    
    for (const tile of tiles) {
      const div = document.createElement('div');
      div.className = this.getTileClasses(tile) + ' compact';
      div.innerHTML = `<div class="letter">${tile.letter}</div>`;
      div.style.cursor = 'pointer';
      div.title = 'Click to remove';
      
      div.addEventListener('click', () => {
        const currentValue = this.inputElement.value;
        const index = currentValue.lastIndexOf(tile.letter);
        if (index !== -1) {
          this.inputElement.value = currentValue.slice(0, index) + currentValue.slice(index + 1);
          this.handleComposeInput({ target: this.inputElement } as any);
        }
      });
      
      chosenRackElement.appendChild(div);
    }
  }

  private getTileClasses(tile: RackTile): string {
    const classes = ['tile'];
    if (tile.mult === 2) classes.push('dbl');
    if (tile.mult === 3) classes.push('tpl');
    if (tile.green) classes.push('green');
    return classes.join(' ');
  }

  private setupCanvasInteraction(): void {
    this.renderer.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      if (!this.state.running || !this.state.gameReady) return;
      
      const rect = this.renderer.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.collectTileAtPoint(x, y);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.renderer.resize();
      this.effects.updateCanvasSize(this.renderer.width, this.renderer.height);
    });
  }

  private startGameLoop(): void {
    const gameLoop = (timestamp: number) => {
      this.update(timestamp);
      this.render();
      this.animationId = requestAnimationFrame(gameLoop);
    };
    
    this.animationId = requestAnimationFrame(gameLoop);
  }

  private update(timestamp: number): void {
    if (!this.state.gameReady) return;
    
    const deltaTime = Math.min(0.05, (timestamp - this.lastTimestamp) / 1000);
    this.lastTimestamp = timestamp;
    
    if (this.state.running) {
      this.updateGameTime(timestamp);
      this.updateTileSpawning(deltaTime);
      this.updateTiles(deltaTime);
      this.updateUI();
      
      if (this.state.elapsed >= this.config.MAX_TIME) {
        this.gameOver();
      }
    }
    
    this.effects.update(deltaTime);
  }

  private updateGameTime(timestamp: number): void {
    if (!this.state.gameStart) return;
    
    this.state.elapsed = Math.min(this.config.MAX_TIME, (timestamp - this.state.gameStart) / 1000);
    
    const currentSecond = Math.floor(this.state.elapsed);
    if (currentSecond > this.lastSecondShown) {
      // Apply time penalty every 5 seconds
      if (currentSecond % 5 === 0 && currentSecond !== 0) {
        this.state.score -= 1;
      }
      this.lastSecondShown = currentSecond;
    }
  }

  private updateTileSpawning(deltaTime: number): void {
    this.spawnAccumulator += deltaTime * 1000;
    
    if (this.spawnAccumulator > this.config.SPAWN_EVERY) {
      this.spawnAccumulator = 0;
      
      const newTile = this.tileManager.createTile(
        this.renderer.width,
        this.renderer.height,
        this.state.tiles
      );
      
      if (newTile) {
        this.state.tiles.push(newTile);
      }
    }
  }

  private updateTiles(deltaTime: number): void {
    // Update tile positions
    for (const tile of this.state.tiles) {
      this.tileManager.updateTile(tile, deltaTime);
    }
    
    // Remove off-screen tiles
    this.state.tiles = this.state.tiles.filter(
      tile => !this.tileManager.isOffScreen(tile, this.renderer.height)
    );
  }

  private updateUI(): void {
    this.rackUI.render(this.rack.getTiles(), this.rack.isFull, this.state.running);
    this.rackUI.updateBadge(this.rack.size);
    this.scoreUI.updateScore(this.state.score);
    
    const remainingTime = Math.max(0, Math.floor(this.config.MAX_TIME - this.state.elapsed));
    this.scoreUI.updateTime(remainingTime);
    
    this.updateComposeState();
  }

  private updateComposeState(): void {
    const canCompose = this.rack.isFull && this.state.running;
    const hintElement = document.getElementById('composeHint');
    
    this.inputElement.disabled = !canCompose;
    this.submitButton.disabled = !canCompose;
    
    if (hintElement) {
      if (canCompose) {
        hintElement.textContent = this.state.running 
          ? 'Type your word (min 2 letters).' 
          : 'Game over.';
      } else {
        hintElement.textContent = 'Need 7 letters in rack to compose.';
      }
    }
    
    // Auto-focus when rack becomes full
    if (canCompose && !this.isComposing) {
      this.focusCompose();
    } else if (!canCompose && this.isComposing) {
      this.blurCompose();
    }
    
    this.isComposing = canCompose;
  }

  private focusCompose(): void {
    setTimeout(() => {
      this.inputElement.focus();
      const rackPanel = document.getElementById('rackCompose');
      rackPanel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  private blurCompose(): void {
    if (document.activeElement === this.inputElement) {
      this.inputElement.blur();
    }
  }

  private render(): void {
    const allEffects = [
      ...this.effects.getBingoEffects(),
      ...this.effects.getWordEffects(),
    ];
    
    this.renderer.renderScene(
      this.state.tiles,
      [...this.effects.getCatchPops()],
      allEffects
    );
  }

  private collectTileAtPoint(x: number, y: number): void {
    const tile = this.renderer.getTileAtPoint(x, y, this.state.tiles);
    if (tile) {
      this.collectTile(tile);
    }
  }

  private collectTileByLetter(letter: string): void {
    // Find the lowest (most advanced) tile with this letter
    let bestTile: Tile | null = null;
    let bestY = -1;
    
    for (const tile of this.state.tiles) {
      if (tile.letter === letter && tile.y > bestY) {
        bestTile = tile;
        bestY = tile.y;
      }
    }
    
    if (bestTile) {
      this.collectTile(bestTile);
    }
  }

  private collectTile(tile: Tile): void {
    const index = this.state.tiles.indexOf(tile);
    if (index === -1) return;
    
    // Remove tile from screen
    this.state.tiles.splice(index, 1);
    
    // Add to rack if there's space
    if (this.rack.addTile(tile)) {
      this.effects.spawnCatchPop(tile);
    } else {
      this.scoreUI.addLogEntry('Rack full (7).');
    }
  }

  private submitWord(): void {
    const word = this.inputElement.value.trim();
    if (word.length < 2) {
      this.scoreUI.addLogEntry('Use only letters from your rack (min 2 letters).');
      return;
    }
    
    if (!this.state.running) {
      this.scoreUI.addLogEntry('⏹️ Game over — submissions disabled.');
      return;
    }
    
    const tiles = this.rack.selectTilesForWord(word);
    if (tiles.length !== word.length) {
      this.scoreUI.addLogEntry('Use only letters from your rack (min 2 letters).');
      return;
    }
    
    const result = this.scoringSystem.evaluateWord(word, tiles);
    this.processWordSubmission(result);
  }

  private processWordSubmission(result: WordSubmissionResult): void {
    // Apply score changes
    this.state.score += result.pointsScored + result.bonusPoints;
    
    // Apply time changes for green tiles
    if (result.timeDelta !== 0 && this.state.gameStart) {
      const newElapsed = clamp(
        this.state.elapsed - result.timeDelta,
        0,
        this.config.MAX_TIME
      );
      this.state.gameStart = performance.now() - newElapsed * 1000;
      this.scoreUI.showFlashMessage(
        `${result.timeDelta > 0 ? '+' : ''}${result.timeDelta}s`,
        result.timeDelta > 0
      );
    }
    
    // Handle bingo effects
    if (result.bonusPoints > 0) {
      this.effects.spawnBingoRain();
      this.tileManager.reduceWeightsForBingo(result.word);
    }
    
    // Spawn word rain effect
    const rainText = this.buildRainText(result);
    this.effects.spawnWordRain(rainText);
    
    // Remove used tiles from rack
    const usedIds = result.usedTiles.map(t => t.id);
    this.rack.removeTiles(usedIds);
    
    // Update UI
    this.scoreUI.addLogEntry(this.scoringSystem.formatScoreChange(result));
    this.scoreUI.updateLastWord(result);
    
    // Clear input
    this.inputElement.value = '';
    this.updateProjectedScore('');
    this.updateChosenTilesDisplay('');
    
    // Scroll to top
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  private buildRainText(result: WordSubmissionResult): string {
    const { word, pointsScored, bonusPoints, timeDelta } = result;
    let text = `${word} ${pointsScored >= 0 ? '+' : ''}${pointsScored}`;
    
    if (bonusPoints > 0) {
      text += ` (+${bonusPoints})`;
    }
    
    if (timeDelta !== 0) {
      text += ` ${timeDelta > 0 ? '+' : ''}${timeDelta}s`;
    }
    
    return text;
  }

  private gameOver(): void {
    this.state.running = false;
    this.scoreUI.addLogEntry('⏱️ Time! Final score: ' + Math.round(this.state.score) + '. No further points can be scored.');
  }

  private updateFooterMessage(message: string): void {
    const footer = document.getElementById('footerMsg');
    if (footer) {
      footer.textContent = message;
    }
  }

  // Public methods
  start(): void {
    this.state.running = true;
    this.state.gameStart = performance.now();
    this.lastTimestamp = performance.now();
    this.lastSecondShown = -1;
  }

  reset(): void {
    // Reset state
    this.state.running = true;
    this.state.gameStart = performance.now();
    this.state.elapsed = 0;
    this.state.score = this.config.START_SCORE;
    this.state.tiles = [];
    
    // Reset systems
    this.rack.clear();
    this.tileManager.resetDynamicWeights();
    this.effects.clear();
    
    // Reset timing
    this.lastTimestamp = performance.now();
    this.lastSecondShown = -1;
    this.spawnAccumulator = 0;
    
    // Reset UI
    this.scoreUI.clearLog();
    this.scoreUI.resetLastWord();
    this.inputElement.value = '';
    this.updateProjectedScore('');
    this.updateChosenTilesDisplay('');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}