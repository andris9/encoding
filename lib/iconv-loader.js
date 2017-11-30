'use strict';

var Iconv = null;

// this is to fool browserify so it doesn't try (in vain) to install iconv.
try {
  Iconv = require('iconv-lite').Iconv;
} catch (LE) {
  try {
    Iconv = require('iconv').Iconv;
  } catch (E) {
    // node-iconv not present
  }
}

module.exports = Iconv;
