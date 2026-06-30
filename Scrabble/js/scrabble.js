/*
 * scrabble.js - Adam Ohanian (adam_ohanian@student.uml.edu), COMP 4610 HW5
 *
 * The whole game. index.html loads this and calls Scrabble.init() with a
 * BOARD_LAYOUT; the engine just renders whatever grid of bonus codes it's given.
 *
 * BOARD_LAYOUT is a 2-D array of bonus codes:
 *   ""  plain   "DL" x2 letter   "TL" x3 letter
 *   "DW" x2 word "TW" x3 word    "ST" center star (counts as double word)
 *
 * Needs jQuery + jQuery UI. dictionary.js is optional (extra-credit word check).
 */

var Scrabble = (function () {
  "use strict";

  var RACK_SIZE = 7;

  // Per-square multiplier metadata derived from the bonus code.
  var LETTER_MULT = { "DL": 2, "TL": 3 };
  var WORD_MULT   = { "DW": 2, "TW": 3, "ST": 2 };
  var LABELS = {
    "DL": "DOUBLE<br>LETTER",
    "TL": "TRIPLE<br>LETTER",
    "DW": "DOUBLE<br>WORD",
    "TW": "TRIPLE<br>WORD",
    "ST": "&#9733;"            // center star
  };

  // ---- Game state -------------------------------------------------
  var layout;                 // 2-D array of bonus codes
  var numRows, numCols;
  var placed;                 // map "r,c" -> { letter, value, bonus, $tile }
  var cumulativeScore;
  var useDictionary;          // true if a word list loaded (extra credit)
  var tileSeq = 0;            // unique id source for tiles

  // ---- DOM helpers ------------------------------------------------
  function tileImage(letter) {
    var name = (letter === "_") ? "Blank" : letter;
    return "images/tiles/Scrabble_Tile_" + name + ".jpg";
  }

  function key(r, c) { return r + "," + c; }


  function buildBoard() {
    var $board = $("#board").empty();
    for (var r = 0; r < numRows; r++) {
      var $row = $('<div class="board-row"></div>');
      for (var c = 0; c < numCols; c++) {
        var bonus = layout[r][c] || "";
        var $sq = $('<div class="square"></div>')
          .addClass(bonus)
          .attr("data-row", r)
          .attr("data-col", c)
          .attr("data-bonus", bonus);
        if (LABELS[bonus]) {
          $sq.html('<span class="bonus-label">' + LABELS[bonus] + '</span>');
        }
        $row.append($sq);
      }
      $board.append($row);
    }
    makeSquaresDroppable();
  }

  // --- rack + dealing tiles ---
  function buildRack() {
    var $rack = $("#rack").empty();
    for (var i = 0; i < RACK_SIZE; i++) {
      $rack.append('<div class="rack-slot"></div>');
    }
  }

  // Number of tiles currently sitting in the rack.
  function tilesInRack() { return $("#rack .tile").length; }

  // Fill any empty rack slots from the bag (used at start and after a word).
  function refillRack() {
    var emptySlots = $("#rack .rack-slot").filter(function () {
      return $(this).children(".tile").length === 0;
    });
    var needed = emptySlots.length;
    var newTiles = drawTiles(needed);            // from scrabble-tiles.js
    emptySlots.each(function (i) {
      if (i < newTiles.length) {
        $(this).append(makeTile(newTiles[i].letter, newTiles[i].value));
      }
    });
    updateStatus();
  }

  // Create one draggable tile element.
  function makeTile(letter, value) {
    var id = "tile-" + (tileSeq++);
    var $tile = $('<img class="tile">')
      .attr("id", id)
      .attr("src", tileImage(letter))
      .attr("alt", letter + " (" + value + " points)")
      .attr("title", letter + " = " + value + " pts")
      .attr("data-letter", letter)
      .attr("data-value", value);
    makeDraggable($tile);
    return $tile;
  }

  function makeDraggable($tile) {
    $tile.draggable({
      revert: "invalid",       // snap back if dropped somewhere illegal
      revertDuration: 200,
      stack: ".tile",
      containment: "document",
      start: function () { $(this).css("opacity", 0.85); },
      stop:  function () { $(this).css("opacity", 1); }
    });
  }

  // --- drop targets + placement rules ---
  function makeSquaresDroppable() {
    $(".square").droppable({
      hoverClass: "drop-hover",
      // accept() returning false = "invalid" drop, so the tile reverts. That's
      // what enforces the rules below.
      accept: function (draggable) {
        if (!draggable.hasClass("tile")) { return false; }
        var r = +$(this).attr("data-row");
        var c = +$(this).attr("data-col");
        if (placed[key(r, c)]) { return false; }   // square already occupied
        return isLegalPlacement(r, c);
      },
      drop: function (event, ui) {
        placeTile($(this), ui.draggable);
      }
    });
  }

  // legal if it's the first tile, or it touches one already down (no diagonals)
  function isLegalPlacement(r, c) {
    if (isBoardEmpty()) { return true; }
    var neighbors = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
    for (var i = 0; i < neighbors.length; i++) {
      if (placed[key(neighbors[i][0], neighbors[i][1])]) { return true; }
    }
    return false;
  }

  function isBoardEmpty() {
    for (var k in placed) { if (placed.hasOwnProperty(k)) { return false; } }
    return true;
  }

  // Lock a tile onto a square.
  function placeTile($square, $tile) {
    var r = +$square.attr("data-row");
    var c = +$square.attr("data-col");

    $tile.draggable("disable");
    $tile.removeClass("ui-draggable-disabled");   // disabled class dims it, don't want that
    $tile.addClass("locked")
         .css({ top: 0, left: 0, position: "static" })
         .appendTo($square);
    $square.addClass("occupied");

    placed[key(r, c)] = {
      letter: $tile.attr("data-letter"),
      value: +$tile.attr("data-value"),
      bonus: $square.attr("data-bonus") || "",
      $tile: $tile
    };

    clearMessage();
    updateStatus();
  }

  // Return every currently-placed tile to the rack (Reset this round).
  function returnTilesToRack() {
    for (var k in placed) {
      if (!placed.hasOwnProperty(k)) { continue; }
      var $tile = placed[k].$tile;
      $tile.removeClass("locked")
           .css({ top: 0, left: 0, position: "static" })
           .draggable("enable");
      // drop into the first empty rack slot
      var $slot = $("#rack .rack-slot").filter(function () {
        return $(this).children(".tile").length === 0;
      }).first();
      if ($slot.length) { $tile.appendTo($slot); }
    }
    $(".square").removeClass("occupied");
    placed = {};
    updateStatus();
  }

  // --- reading the word + scoring ---

  // Look at the placed tiles, make sure they form one straight contiguous line,
  // and return { ok, word, cells, reason } with cells in reading order.
  function readWord() {
    var cells = [];
    for (var k in placed) {
      if (!placed.hasOwnProperty(k)) { continue; }
      var rc = k.split(",");
      cells.push({ r: +rc[0], c: +rc[1], data: placed[k] });
    }
    if (cells.length === 0) {
      return { ok: false, reason: "No tiles have been placed yet." };
    }

    var rows = cells.map(function (x) { return x.r; });
    var cols = cells.map(function (x) { return x.c; });
    var sameRow = rows.every(function (v) { return v === rows[0]; });
    var sameCol = cols.every(function (v) { return v === cols[0]; });

    var ordered;
    if (sameRow) {
      ordered = cells.slice().sort(function (a, b) { return a.c - b.c; });
      // no gaps allowed between columns
      for (var i = 1; i < ordered.length; i++) {
        if (ordered[i].c !== ordered[i-1].c + 1) {
          return { ok: false, reason: "Tiles must be contiguous (no gaps)." };
        }
      }
    } else if (sameCol) {
      ordered = cells.slice().sort(function (a, b) { return a.r - b.r; });
      for (var j = 1; j < ordered.length; j++) {
        if (ordered[j].r !== ordered[j-1].r + 1) {
          return { ok: false, reason: "Tiles must be contiguous (no gaps)." };
        }
      }
    } else {
      return { ok: false, reason: "Tiles must form a single row or column." };
    }

    var word = ordered.map(function (x) { return x.data.letter; }).join("");
    return { ok: true, word: word, cells: ordered };
  }

  // score = sum(letter * letterMult) * wordMult
  function scoreCells(cells) {
    var letterTotal = 0;
    var wordMultiplier = 1;
    cells.forEach(function (x) {
      var lm = LETTER_MULT[x.data.bonus] || 1;
      letterTotal += x.data.value * lm;
      if (WORD_MULT[x.data.bonus]) { wordMultiplier *= WORD_MULT[x.data.bonus]; }
    });
    return letterTotal * wordMultiplier;
  }

  // keep the scoreboard in sync with whatever's on the board right now
  function updateStatus() {
    var res = readWord();
    if (res.ok) {
      $("#current-word").text(res.word);
      $("#current-score").text(scoreCells(res.cells));
    } else {
      var anyPlaced = !isBoardEmpty();
      $("#current-word").text(anyPlaced ? "(invalid layout)" : "(none)");
      $("#current-score").text(anyPlaced ? "?" : "0");
    }
    $("#total-score").text(cumulativeScore);
    $("#tiles-left").text(tilesRemaining());
  }

  // --- the three buttons ---
  function submitWord() {
    var res = readWord();
    if (!res.ok) { return setMessage(res.reason, "err"); }
    if (res.word.length < 2) {
      return setMessage("A word must be at least 2 letters.", "err");
    }

    // Extra-credit dictionary validation.
    if (useDictionary && typeof isValidWord === "function") {
      if (!isValidWord(res.word)) {
        return setMessage('"' + res.word + '" is not in the dictionary. ' +
                          "Reset and try another word.", "err");
      }
    }

    var gained = scoreCells(res.cells);
    cumulativeScore += gained;

    // word's been played - clear the tiles off so the next one starts clean
    res.cells.forEach(function (x) { x.data.$tile.off(); });
    clearPlacedFromBoard();

    refillRack();
    var msg = '"' + res.word + '" scored ' + gained + " points!";
    if (useDictionary) { msg += " (valid word)"; }
    setMessage(msg, "ok");

    if (tilesRemaining() === 0 && tilesInRack() === 0) {
      setMessage("Bag empty and rack empty. Game over! Final score: " +
                 cumulativeScore + ". Click New Game to play again.", "info");
    }
    updateStatus();
  }

  // wipe the played tiles off the board (called after a successful submit)
  function clearPlacedFromBoard() {
    for (var k in placed) {
      if (placed.hasOwnProperty(k)) { placed[k].$tile.remove(); }
    }
    $(".square").removeClass("occupied");
    placed = {};
  }

  function resetRound() {
    returnTilesToRack();
    clearMessage();
  }

  function newGame() {
    resetBag();                       // refill the 100-tile bag
    cumulativeScore = 0;
    clearPlacedFromBoard();           // pull any tiles still sitting on the board
    buildRack();
    refillRack();
    setMessage("New game started. Good luck!", "info");
    updateStatus();
  }

  function setMessage(text, kind) {
    $("#message").removeClass("ok err info").addClass(kind || "info").html(text);
  }
  function clearMessage() { $("#message").removeClass("ok err info").text(""); }

  // --- init ---
  function init(options) {
    options = options || {};
    layout = options.layout || (window.BOARD_LAYOUT || [[]]);
    numRows = layout.length;
    numCols = layout[0].length;
    placed = {};
    cumulativeScore = 0;
    useDictionary = false;

    buildBoard();
    buildRack();
    refillRack();
    updateStatus();

    $("#btn-submit").on("click", submitWord);
    $("#btn-reset").on("click", resetRound);
    $("#btn-newgame").on("click", newGame);

    // Optional extra-credit dictionary load (js/dictionary.js).
    if (options.dictionaryUrl && typeof loadDictionary === "function") {
      loadDictionary(options.dictionaryUrl, function (ok, count) {
        if (ok) {
          useDictionary = true;
          setMessage("Dictionary loaded (" + count +
                     " words). Word validation is ON.", "info");
        } else {
          setMessage("Dictionary could not be loaded; word validation is OFF.",
                     "info");
        }
      });
    }
  }

  return { init: init };
})();
