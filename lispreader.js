/**
 * Kleiner LISP Interpreter
 */


/**
 * Liest die Eingabedaten und verwandelt sie in LISP Objekte
 */
var LispReader = function(frm) {
    _.bindAll(this, "read", "parse");
    
    $(frm).submit(this.read);
};

_.extend(LispReader.prototype, {
    symbolRegex: /^\s*([^\s\(\)\.]+)/,
    integerRegex: /^\s*([\d]+)\b/,
    listRegex: /^\s*\(\s*(.*)\s*\)/,
    
    reservedWords: /(nil|true|false)/,
    reservedObjects: {
        "nil": "LispNil",
        "true": "LispTrue",
        "false": "LispFalse"
    },
    
    knownSymbols: {},
    
    read: function(evt) {
        evt && evt.preventDefault();
        
        var res = this.parse( $(evt.target).find("input").val() );
        
        this.print(res);
        //console.log("ergebnis: ", res.toString());
    },
    
    /**
     * Parsed die Eingabedaten
     * @param {String} str Eingabewert
     * @return {mixed} LISP Objekt
     */
    parse: function(str) {
        var ret,
            match,
            innerMatch,
            listValues = [];
        
        // Integer
        if(match = str.match(this.integerRegex)) {
            ret = new LispInteger();
            ret.value = parseInt(match[1], 10);
        }
        // Symbol
        else if(match = str.match(this.symbolRegex)) {
            var chars = "" + $.trim(match[1]);
            if(innerMatch = chars.match(this.reservedWords)) {
                ret = new window[ this.reservedObjects[innerMatch[0]] ]();
            }
            else {
                if(this.knownSymbols[chars]) {
                    ret = this.knownSymbols[chars];
                }
                else {
                    ret = new LispSymbol();
                    ret.characters = chars;
                }
                
                this.knownSymbols[chars] = ret;
            }
        }
        // List
        else if(match = str.match(this.listRegex)) {
            ret = new LispList();
             
            if(
               (innerMatch = match[1].match(this.integerRegex)) ||
               (innerMatch = match[1].match(this.symbolRegex))
            ) {
                listValues[0] = innerMatch[1]; // match gibt ein Array zurück
                listValues[1] = $.trim(match[1].replace(listValues[0], ""));
            }
            else if(innerMatch = match[1].match(this.listRegex)) {
                listValues[0] = innerMatch[0];
                listValues[1] = $.trim(match[1].replace(listValues[0], ""));
            }
            else {
                ret = new LispNil();
                return ret;
            }
             
            console.info(listValues, match);
             
            ret.first = this.parse(listValues[0]);
            if(listValues.length > 1 && listValues[1].length) {
                ret.rest = this.parse("(" + listValues[1] + ")");
                /*ret.rest = new LispList();
                ret.rest.first = this.parse(listValues[1]);
                ret.rest.rest = new LispNil();*/
            }
            else {
                ret.rest = new LispNil();
            }
        }
        else {
            ret = new LispNil();
        }
        return ret;
    },
    
    print: function(lispObject) {
        $("#output").append("<li>" + lispObject.toString() + "</li>");
    }
});



/**
 * Elternklasse für alle LISP Objekte
 */
var LispObject = function() {};

LispObject.extend = extend;


/**
 * Atome
 */
var LispAtom = LispObject.extend({
    isLispAtom: function() {
        return true;
    }
});


/**
 * Nummern
 */
var LispInteger = LispAtom.extend({
    value: 0,
    isLispInteger: function() {
        return true;
    },
    toString: function() {
        return this.value;
    }
});

/**
 * Symbole
 */
var LispSymbol = LispObject.extend({
    characters: "",
    isLispSymbol: function() {
        return true;
    },
    toString: function() {
        return this.characters;
    }
});

/**
 * Listen
 */
var LispList = LispObject.extend({
    first: null,
    rest: null,
    isLispList: function() {
        return true;
    },
    toString: function() {
        return "(" +
               this.first.toString() + " " +
               this.rest.toString() +
               ")";
    }
});

/**
 * nil
 */
var LispNil = LispAtom.extend({
    value: null,
    isLispNil: function() {
        return true;
    },
    toString: function() {
        return "nil";
    }
});

/**
 * Boolean true
 */
var LispTrue = LispAtom.extend({
    value: true,
    isLispTrue: function() {
        return true;
    },
    toString: function() {
        return "true";
    }
});

/**
 * Boolean false
 */
var LispFalse = LispAtom.extend({
    value: false,
    isLispFalse: function() {
        return true;
    },
    toString: function() {
        return "false";
    }
});