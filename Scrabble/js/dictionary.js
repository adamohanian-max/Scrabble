/* dictionary.js - extra credit word check (Adam Ohanian, adam_ohanian@student.uml.edu, HW5).
 * Loads data/words.txt into a Set and exposes isValidWord().
 * Has to be served over http:// since fetch() won't read file:// URLs. */

var ScrabbleDictionary = (function () {
  "use strict";

  var words = null;        // Set of lowercase words, or null until loaded
  var ready = false;

  /*  loadDictionary( url, callback )
   *  Fetches the word list and builds the lookup Set.
   *  callback( success, count ) is invoked when done. */
  function loadDictionary(url, callback) {
    fetch(url)
      .then(function (resp) {
        if (!resp.ok) { throw new Error("HTTP " + resp.status); }
        return resp.text();
      })
      .then(function (text) {
        words = new Set();
        text.split(/\r?\n/).forEach(function (w) {
          w = w.trim().toLowerCase();
          if (w) { words.add(w); }
        });
        ready = true;
        if (callback) { callback(true, words.size); }
      })
      .catch(function (err) {
        console.warn("Dictionary load failed:", err);
        if (callback) { callback(false, 0); }
      });
  }

  /*  isValidWord( word ) -> boolean
   *  Returns true if the dictionary is loaded and contains the word. */
  function isValidWord(word) {
    if (!ready || !words) { return false; }
    return words.has(String(word).trim().toLowerCase());
  }

  function isReady() { return ready; }

  return {
    loadDictionary: loadDictionary,
    isValidWord: isValidWord,
    isReady: isReady
  };
})();

/*  Convenience globals so scrabble.js can call these directly. */
function loadDictionary(url, callback) {
  return ScrabbleDictionary.loadDictionary(url, callback);
}
function isValidWord(word) {
  return ScrabbleDictionary.isValidWord(word);
}
