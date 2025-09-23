# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Let'er rain is a word-based tile collection game similar to Scrabble, where players collect falling letter tiles and compose words within a time limit. The project has been successfully converted from a proof-of-concept HTML file to a modern TypeScript architecture.

## Architecture

The project uses a modular TypeScript architecture with clear separation of concerns:

- **Reference Implementation**: A single HTML file (`_reference/game.html`) containing the original proof-of-concept
- **Current Architecture**: TypeScript-based modular structure with Canvas rendering

### Game Logic Components (from PoC)

The current implementation includes these core systems:

- **Tile System**: Letter generation, falling physics, multiplier effects (2x, 3x), and green time bonus tiles
- **Rack Management**: 7-tile capacity with validation and tile selection logic
- **Word Validation**: Dictionary-based word checking with support for TWL or custom word lists
- **Scoring System**: Scrabble-like point values with multipliers, bingo bonuses (+50 for 7-letter words), and time penalties
- **Timer System**: 150-second countdown with green tile time modifications (+5s for valid words, -5s for invalid)

### Current Structure

```
src/
├── logic/
│   ├── tiles.ts + tiles.test.ts - Tile generation and physics
│   ├── rack.ts + rack.test.ts - Rack management and validation  
│   ├── scoring.ts + scoring.test.ts - Point calculation and bonuses
│   └── dictionary.ts + dictionary.test.ts - Word validation system
├── ui/
│   ├── canvasRenderer.ts - Canvas-based rendering
│   ├── rackUI.ts - Rack interface components
│   ├── scoreUI.ts - Score and timer display
│   └── effects.ts + effects.test.ts - Visual effects and animations
├── types.ts - TypeScript type definitions
├── constants.ts - Game constants and configuration
├── utils.ts - Utility functions
├── game.ts - Main game coordinator class
└── main.ts - Entry point and DOM setup
```

## Development Commands

- **Development**: `npm run dev` - Start Vite development server
- **Build**: `npm run build` - Build for production
- **Testing**: `npm test` - Run Jest test suite
- **Type Check**: `npm run lint` - TypeScript compilation check
- **Test Coverage**: `npm run test:coverage` - Run tests with coverage report

## Technology Stack

- **Language**: TypeScript with ES modules
- **Testing**: Jest with ts-jest and jsdom
- **Build Tool**: Vite for development and production builds  
- **Rendering**: HTML5 Canvas with custom renderer
- **Styling**: Custom CSS (no framework dependencies)
- **Architecture**: Modular class-based design with dependency injection

## Game Rules Summary

- **Objective**: Score points by collecting tiles and forming words within 150 seconds
- **Tile Collection**: Tap falling tiles or press keyboard letters to collect (max 7 in rack)
- **Word Formation**: Only possible with full rack (7 tiles), minimum 2-letter words
- **Scoring**: Scrabble point values + multipliers + bingo bonus (50 points for 7-letter words)
- **Time Mechanics**: Lose 1 point every 5 seconds; green tiles modify time when used in words

## Key Features

- **Comprehensive Test Suite**: 62 passing tests covering all game logic
- **Type-Safe Architecture**: Full TypeScript coverage with strict type checking
- **Modular Design**: Clear separation between game logic, rendering, and UI components
- **Canvas Rendering**: Custom high-performance 2D canvas renderer with effects
- **Dictionary Support**: Flexible dictionary loading from text files or JSON arrays
- **Progressive Difficulty**: Letter weighting system that adapts based on player performance

## Testing Strategy

- **Unit Tests**: Comprehensive coverage of all logic components
- **Mocked Dependencies**: Canvas context and File API mocked for testing
- **Integration Focus**: Tests verify game mechanics match original PoC behavior
- **Type Safety**: TypeScript compilation ensures type correctness across modules

## Performance Considerations

- **Efficient Rendering**: Canvas operations optimized with proper batching and clearing
- **Memory Management**: Proper cleanup of game loops and event listeners
- **Responsive Design**: CSS custom properties for mobile viewport handling