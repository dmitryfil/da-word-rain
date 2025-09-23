# da-word-rain

## Game Details

### Objective

Score as many points as possible before the 150-second timer runs out.

### Setup

* Timer: Starts at 150 seconds.
* Rack: Holds up to 7 letters.
* Tiles: Letters fall from the top of the screen; tap or type to collect them.
* Dictionary: Must be loaded (TWL or custom word list) to validate words.

### Gameplay Rules

1.⁠ ⁠Collecting Tiles

* Tap falling tiles or press their letter on the keyboard.
* The rack can hold a maximum of 7 tiles.
* Once full, you may begin composing a word.

2.⁠ ⁠Composing Words

* Only allowed when the rack has 7 letters.
* Type directly in the compose box (only letters present in your rack).
* Minimum word length = 2 letters.
* Click Submit or press Enter to play a word.

3.⁠ ⁠Tile Types

* Standard tiles: Normal Scrabble letters and points.
* Blue tiles (Double): Letter scores ×2.
* Red tiles (Triple): Letter scores ×3.
* Green tiles (Time bonus/penalty):
* ✅ If the word is valid: +5 seconds per green tile used.
* ❌ If invalid: −5 seconds per green tile used.

4.⁠ ⁠Word Validation

* Valid words must exist in the loaded dictionary.
* Invalid submissions reduce your score.

### Scoring

* Letter Points: Same as Scrabble (e.g., E=1, Z=10).
* Multipliers:
  * Blue tile: ×2 letter score.
  * Red tile: ×3 letter score.
* Word Score: Sum of all letter points (with multipliers applied).
* Bingo Bonus: +50 points for using all 7 letters.
* Invalid Word: Lose points equal to the word’s would-be score.
* Time Penalty: Lose 1 point every 5 seconds of game time.


#### End of Game

Game ends when the timer reaches 0.

Final score = Total accumulated points.

Log shows your word history and outcomes.

“Last Word” badge highlights the score change from your most recent play.


## Project Tech

* We want to use TypeScript, and Jest for testing, game would be using Canvas for rendering without complex UX frameworks.
* For CSS styling, we want to default to Tailwind.

## Project Structure

```
da-word-rain/
├── package.json
├── tsconfig.json
├── jest.config.js
├── src/
│   ├── logic/
│   │   ├── tiles.ts
│   │   ├── tiles.test.ts
│   │   ├── rack.ts
│   │   ├── rack.test.ts
│   │   ├── scoring.ts
│   │   ├── scoring.test.ts
│   │   ├── dictionary.ts
│   │   └── dictionary.test.ts
│   │
│   ├── ui/
│   │   ├── canvasRenderer.ts
│   │   ├── rackUI.ts
│   │   ├── scoreUI.ts
│   │   └── effects.ts
│   │
│   └── main.ts
│
└── public/
    ├── index.html
    ├── style.css
    └── assets/
```

## PoC Versions

* https://dmitryfil.github.io/da-word-rain/poc/words-latest.html
* https://dmitryfil.github.io/da-word-rain/poc/words-001.html
* https://dmitryfil.github.io/da-word-rain/poc/words-002.html
* https://dmitryfil.github.io/da-word-rain/poc/words-v3.html
* https://dmitryfil.github.io/da-word-rain/poc/words-v4.html
