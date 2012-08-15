var Iconv, iconvLite;

try{
    Iconv  = require("iconv").Iconv;
}catch(E){
    iconvLite = require("iconv-lite");
}

// Expose to the world
module.exports.convert = convert;

function convert(str, to, from){
    from = checkEncoding(from || "UTF-8");
    to = checkEncoding(to || "UTF-8");
    str = str || "";

    var result, iconv;

    if(from != "UTF-8" && typeof str == "string"){
        str = new Buffer(str, "binary");
    }

    if(from == to){
        result = str;
    }else{
        if(Iconv){
            console.log(1);
            result = convertIconv(str, to, from);
        }else{
            console.log(2);
            result = convertIconvLite(str, to, from);
        }
    }

    if(typeof result == "string"){
        result = new Buffer(result, "utf-8");
    }

    return result;
}

function convertIconv(str, to, from){
    var response;
    iconv = new Iconv(from, to + "//TRANSLIT//IGNORE");
    response = iconv.convert(str);
    return response.slice(0, response.length);
}

function convertIconvLite(str, to, from){
    if(to == "UTF-8"){
        return iconvLite.decode(str, from);
    }else if(from == "UTF-8"){
        return iconvLite.encode(str, to);
    }else{
        return iconvLite.encode(iconvLite.decode(str, from), to);
    }
}

function checkEncoding(name){
    name = (name || "").toString().trim().
        replace(/^latin[\-_]?(\d+)$/i, "ISO-8859-$1").
        replace(/^win(?:dows)?[\-_]?(\d+)$/i, "WINDOWS-$1").
        replace(/^utf[\-_]?(\d+)$/i, "UTF-$1").
        replace(/^ks_c_5601\-1987$/i, "CP949").
        replace(/^us[\-_]?ascii$/i, "ASCII").
        toUpperCase();
    return name;
}