'use strict';

var Iconv;

try {
    // this is to fool browserify so it doesn't try (in vain) to install iconv.
    Iconv = require('iconv').Iconv;
} catch (E) {
    // node-iconv not present
}

module.exports = Iconv;
