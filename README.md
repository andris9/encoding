[![build status](https://secure.travis-ci.org/andris9/encoding.png)](http://travis-ci.org/andris9/encoding)
# Encoding

**encoding** is a simple wrapper around [node-iconv](https://github.com/bnoordhuis/node-iconv) and [iconv-lite](https://github.com/ashtuchkin/iconv-lite/) to convert strings from one encoding to another. If node-iconv is not available for some reason,
iconv-lite will be used instead of it as a fallback.

## Install

Install through npm

    npm install encoding

## Usage

Require the module

    var encoding = require("encoding");

Convert with encoding.convert()

    var resultBuffer = encoding.convert(text, toCharset, fromCharset);

Where

  * **text** is either a Buffer or a String to be converted
  * **toCharset** is the characterset to convert the string
  * **fromCharset** (*optional*, defaults to UTF-8) is the source charset

Output of the conversion is always a Buffer object.

Example

    var result = encoding.convert("ÕÄÖÜ", "Latin_1");
    console.log(result); //<Buffer d5 c4 d6 dc>
  
## License

**MIT**