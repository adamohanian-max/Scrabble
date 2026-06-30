# HW5 Write-Up: Scrabble with Drag-and-Drop

**Author:** Adam Ohanian (adamohanian@gmail.com)
**Course:** COMP 4610 GUI Programming I

## Overview

This assignment implements a playable slice of Scrabble in the browser using jQuery UI drag-and-drop. The page (`index.html`) shows the required single-line board (one row of 15 squares) and a rack of seven tiles. The game logic lives in `js/scrabble.js`, which renders the board from a `BOARD_LAYOUT` passed to `Scrabble.init()`. I also attempted the dictionary-validation extra credit.

## Design

- **Tile data (`js/scrabble-tiles.js`).** Uses Prof. Heines' `ScrabbleTiles` associative array (value / original-distribution / number-remaining) as the 100-tile bag. `drawTiles(n)` builds a weighted pool from the remaining counts and draws random tiles, decrementing the bag; `resetBag()` refills it for a new game.
- **Board.** `index.html` defines `BOARD_LAYOUT`, a 2-D array of bonus codes (`""`, `DL`, `TL`, `DW`, `TW`, `ST`). `scrabble.js` renders it as rows of `<div class="square">` drop targets, color-coded by bonus type.
- **Drag-and-drop.** Rack tiles are jQuery UI `draggable` with `revert:"invalid"`; board squares are `droppable`. The droppable `accept()` callback enforces the rules. A square is a legal target only if it is empty **and** the placement is legal (first tile anywhere, later tiles must be orthogonally adjacent to an existing tile). An illegal or off-board drop is therefore "invalid" and the tile reverts to the rack automatically.
- **Scoring.** When tiles are placed, the engine reads them left-to-right, verifies they form one contiguous line, then computes `sum(letterValue × letterMultiplier) × wordMultiplier`. The current word and score update live after every placement.
- **Round flow.** *Submit Word* validates the word (and, for extra credit, checks it against the dictionary), banks the score, clears the played tiles, and refills the rack to seven. *Reset Round* returns tiles to the rack. *New Game* refills the bag and zeroes the total.

## Extra credit

**Word validation (+2).** `js/dictionary.js` loads `data/words.txt` (about 230k words from `/usr/share/dict/words`) into a `Set` and exposes `isValidWord()`. On submit, an invalid word is rejected with a message.

## Testing

I played through the board in Chrome and Firefox. Dragged tiles around, made a few words, and checked the scores against what I worked out by hand. For example, a 3-point tile on a Double-Letter plus a 1-point tile gives 7, which matched. Also tried the things that should fail: dropping a tile off the board, dropping on a square that's already taken, and placing a tile that isn't next to anything. All of those snap back to the rack like they should.

The bag starts at 100 tiles and counts down as tiles are drawn; New Game puts them back. For the dictionary I ran it under `python3 -m http.server` and confirmed real words go through and made-up junk gets rejected.

## Known limitations

- The blank tile is dealt (value 0) but the player is not prompted to assign it a letter.
- Tiles cannot be reordered within the rack.
- Only the word being played is scored, which is all the single-line board needs.
