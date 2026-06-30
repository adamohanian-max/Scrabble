# COMP 4610 GUI Programming I, HW5: Scrabble with Drag-and-Drop
https://adamohanian-max.github.io/Scrabble/ 
**Author:** Adam Ohanian
**Contact:** adam_ohanian@student.uml.edu

A browser implementation of Scrabble using jQuery / jQuery UI drag-and-drop.
The player drags letter tiles from a rack onto board squares (including bonus
squares), and the score is calculated in real time taking letter values and
premium-square multipliers into account.

## What's in here

- `index.html` is the page itself, the single-line board (one row of 15 squares, with all four kinds of premium square).
- `js/scrabble.js` is where the actual game lives. `js/scrabble-tiles.js` holds the letter values and counts and hands out tiles from the bag.
- `js/dictionary.js` and `data/words.txt` are the word-validation extra credit (the word list comes from `/usr/share/dict/words`).
- `css/scrabble.css` styles everything (board, squares, rack, tiles, scoreboard).
- The tile and rack graphics are under `images/`.


## How to play

1. Seven random tiles are dealt to the rack.
2. Drag a tile onto a board square. The first tile may go anywhere; every later
   tile must be placed **directly adjacent** to one already on the board.
3. The current word and its score update live (letter and word multipliers from
   the premium squares are applied automatically).
4. Click **Submit Word** to bank the score. The rack refills back to seven tiles
   so the next word can be played.
5. **Reset Round** returns the current tiles to the rack; **New Game** refills
   the 100-tile bag and resets the total score.
6. A tile dropped anywhere off the board (or on an illegal square) snaps back to
   the rack. Once placed, a tile is locked until submit or reset.

## Premium squares

| Color | Square | Effect |
|-------|--------|--------|
| Light blue | Double Letter | ×2 that letter's value |
| Dark blue | Triple Letter | ×3 that letter's value |
| Pink | Double Word | ×2 the whole word |
| Red | Triple Word | ×3 the whole word |
| ★ center | Double Word | ×2 the whole word |

## What works

Everything the assignment asks for. The game deals a rack of seven tiles with the
right letter values and the right counts (100 tiles total). Tiles drag onto the
board, and the game tracks which tile landed on which square. The current word and its
score update in real time, with the letter and word multipliers from the bonus
squares figured in. Words can be played until the bag and rack run out; each word
banks its score and the rack refills. Bad drops (off the board, on an occupied
square, or not next to an existing tile) bounce back to the rack, and once a tile
is placed it stays put until submit or reset.

For extra credit there's also dictionary validation: submitted words are checked
against `data/words.txt` and junk gets rejected.

A couple of things I didn't do: the blank tile is in the bag (value 0) but the
game doesn't prompt for a letter to assign it, and tiles can't be dragged around
to reorder them inside the rack.

## Citations / reused material

- Tile distribution data adapted from Prof. Jesse M. Heines'
  `Scrabble_Pieces_AssociativeArray_Jesse.js` (UMass Lowell), with the JSON
  equivalent by students Ramon Meza and Jason Downing. See header comment in
  `js/scrabble-tiles.js`.
- Tile and board images provided with the assignment (`graphics_data.zip`).
- jQuery and jQuery UI loaded from their official CDNs.
