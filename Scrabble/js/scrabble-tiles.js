/* scrabble-tiles.js - Adam Ohanian (adam_ohanian@student.uml.edu), COMP 4610 HW5
 *
 * Letter values/counts plus the "bag" that deals tiles to the rack.
 *
 * The ScrabbleTiles table below comes from Prof. Jesse M. Heines' file
 * Scrabble_Pieces_AssociativeArray_Jesse.js (UMass Lowell, 2015); the JSON
 * version handed out with the assignment was by Ramon Meza and Jason Downing.
 * Using it here with credit.
 *
 *   value                 = points for the letter
 *   original-distribution = how many in a full 100-tile set
 *   number-remaining      = how many are still in the bag (goes down on each draw)
 */

var ScrabbleTiles = [] ;
ScrabbleTiles["A"] = { "value" : 1,  "original-distribution" : 9,  "number-remaining" : 9  } ;
ScrabbleTiles["B"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["C"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["D"] = { "value" : 2,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["E"] = { "value" : 1,  "original-distribution" : 12, "number-remaining" : 12 } ;
ScrabbleTiles["F"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["G"] = { "value" : 2,  "original-distribution" : 3,  "number-remaining" : 3  } ;
ScrabbleTiles["H"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["I"] = { "value" : 1,  "original-distribution" : 9,  "number-remaining" : 9  } ;
ScrabbleTiles["J"] = { "value" : 8,  "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["K"] = { "value" : 5,  "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["L"] = { "value" : 1,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["M"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["N"] = { "value" : 1,  "original-distribution" : 6,  "number-remaining" : 6  } ;
ScrabbleTiles["O"] = { "value" : 1,  "original-distribution" : 8,  "number-remaining" : 8  } ;
ScrabbleTiles["P"] = { "value" : 3,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["Q"] = { "value" : 10, "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["R"] = { "value" : 1,  "original-distribution" : 6,  "number-remaining" : 6  } ;
ScrabbleTiles["S"] = { "value" : 1,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["T"] = { "value" : 1,  "original-distribution" : 6,  "number-remaining" : 6  } ;
ScrabbleTiles["U"] = { "value" : 1,  "original-distribution" : 4,  "number-remaining" : 4  } ;
ScrabbleTiles["V"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["W"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["X"] = { "value" : 8,  "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["Y"] = { "value" : 4,  "original-distribution" : 2,  "number-remaining" : 2  } ;
ScrabbleTiles["Z"] = { "value" : 10, "original-distribution" : 1,  "number-remaining" : 1  } ;
ScrabbleTiles["_"] = { "value" : 0,  "original-distribution" : 2,  "number-remaining" : 2  } ;

/* Tile-bag helpers (mine). */

// total tiles still left in the bag
function tilesRemaining() {
  var total = 0 ;
  for ( var letter in ScrabbleTiles ) {
    total += ScrabbleTiles[letter]["number-remaining"] ;
  }
  return total ;
}

// put all 100 tiles back (new game)
function resetBag() {
  for ( var letter in ScrabbleTiles ) {
    ScrabbleTiles[letter]["number-remaining"] =
      ScrabbleTiles[letter]["original-distribution"] ;
  }
}

// Draw up to n tiles at random, weighted by what's left in the bag. Returns
// objects like { letter: "A", value: 1 }. Gives back fewer than n if the bag
// empties out first.
function drawTiles( n ) {
  var drawn = [] ;

  for ( var i = 0 ; i < n ; i++ ) {
    // Build a weighted pool of the letters that still have tiles left.
    var pool = [] ;
    for ( var letter in ScrabbleTiles ) {
      for ( var c = 0 ; c < ScrabbleTiles[letter]["number-remaining"] ; c++ ) {
        pool.push( letter ) ;
      }
    }
    if ( pool.length === 0 ) {
      break ;   // bag is empty
    }

    var pick = pool[ Math.floor( Math.random() * pool.length ) ] ;
    ScrabbleTiles[pick]["number-remaining"]-- ;
    drawn.push( { "letter" : pick, "value" : ScrabbleTiles[pick]["value"] } ) ;
  }

  return drawn ;
}
