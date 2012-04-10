/**
 * Kleiner LISP Interpreter
 */


var StringParser = function(text) {
    if(typeof text != "string") {
        throw "StringParser expected String but got " + (typeof text);
    }
    if(text.length == 0) {
        throw "StringParser expected a non-empty String";
    }
    this.text = text;
    this.currentIndex = 0;
};

_.extend(StringParser.prototype, {
    peek: function() {
        return this.text.charAt(this.currentIndex);
    },
    next: function() {
        var character = this.text.charAt(this.currentIndex);
        if( !this.atEnd() ) {
            this.currentIndex++;
        }
        return character;
    },
    atEnd: function() {
        return this.currentIndex == this.text.length;
    },
    skip: function(regex) {
        var character = this.peek();
        while(regex.test(character)) {
            this.next();
            character = this.peek();
        }
    }
});


/**
 * Liest die Eingabedaten und verwandelt sie in LISP Objekte
 */
var LispReader = function(frm) {
    _.bindAll(this, "read");
    
    $(frm).submit(this.read);
};

_.extend(LispReader.prototype, {
    symbolRegex: /^[^\(\)\.]/,
    integerRegex: /^\d/,
    listRegex: /^\(/,
    seperators: /\s/,
    
    reservedWords: /(nil|true|false)/,
    reservedObjects: {
        "nil": "LispNil",
        "true": "LispTrue",
        "false": "LispFalse"
    },
    
    input: null,
    
    knownSymbols: {},
    
    read: function(evt) {
        evt && evt.preventDefault();
        
        this.input = new StringParser($(evt.target).find("input").val());
        
        var res = this.readObject();
        
        this.print(res);
        //console.log("ergebnis: ", res.toString());
    },
    
    /**
     * Parsed die Eingabedaten
     * @return {mixed} LISP Objekt
     */
    readObject: function() {
        var ret;
            
        this.input.skip(this.seperators);
        
        // Integer
        if(this.integerRegex.test(this.input.peek())) {
            ret = this.readInteger();
        }
        // Symbol
        else if(this.symbolRegex.test(this.input.peek())) {
            ret = this.readSymbol();
        }
        // List
        else if(this.listRegex.test(this.input.peek())) {
            ret = this.readList();
        }
        else {
            ret = new LispNil();
        }
        return ret;
    },
    
    readInteger: function() {
        var integer = new LispInteger(),
            character = "";
            
        while(!this.input.atEnd() && this.integerRegex.test(this.input.peek())) {
            character += this.input.next();
        }
        integer.value = parseInt(character, 10);
        
        return integer;
    },
    readSymbol: function() {
        var symbol = new LispSymbol(),
            character = "",
            reservedWord;
            
        while(!this.input.atEnd() && this.symbolRegex.test(this.input.peek())) {
            character += this.input.next();
        }
        
        if(reservedWord = character.match(this.reservedWords)) {
            return new window[ this.reservedObjects[reservedWord[0]] ]();
        }
        
        symbol.characters = character;
        return symbol;
    },
    readList: function() {
        var element,
            list;
        
        this.input.next();
        
        this.input.skip(this.seperators);
        
        if(this.input.peek() == ")") {
            return new LispNil();
        }
        
        element = this.readObject();
        
        this.input.skip(this.seperators);
        
        list = new LispList();
        list.first = element;
        list.rest = this.readListRest();
        
        return list;
    },
    readListRest: function() {
        var element,
            list;
        
        this.input.skip(this.seperators);
        
        if(this.input.peek() == ")") {
            this.input.next();
            return new LispNil();
        }
        
        element = this.readObject();
        
        this.input.skip(this.seperators);
        
        list = new LispList();
        list.first = element;
        list.rest = this.readListRest();
        
        return list;
    },
    
    print: function(lispObject) {
        $("#output").append("<li>" + lispObject.toString() + "</li>");
    }
});


LispEvaluator = {
    eval: function(lispObj) {
        if(lispObj.isLispAtom) {
            return lispObj.toString();
        }
        else if(lispObj.isLispSymbol) {
            
            // env@expr
            //
        }
    },
    defineBuiltInFunctionIn: function(env) {
        /*evn.addBindingFor(LispSymbol, value: LispBuiltInFunction(action: function(evaluator, env, args) {
            
        }))*/
        //oder LispBuiltInFunction Subclass schreiben
    }
};


/**
 * Environment für LISP
 */
var LispEnvironment = function() {
    this.localBindings = [];
};

_.extend(LispEnvironment.prototype, {
    getBindingFor: function(symbol) {
        return _(this.localBindings).find(function(binding) {
            return binding.key.equals(symbol);
        });
    },
    addBindingfor: function(symbol, listObject) {
        this.localBindings.push({
            key: symbol,
            value: listObject
        });
    }
});


/**
 * Elternklasse für alle LISP Objekte
 */
var LispObject = function() {};

_.extend(LispObject.prototype, {
    isLispAtom: false,
    isLispInteger: false,
    isLispSymbol: false,
    isLispList: false,
    isLispNil: false,
    isLispTrue: false,
    isLispFalse: false
});

LispObject.extend = extend;


/**
 * Atome
 */
var LispAtom = LispObject.extend({
    isLispAtom: true
});


/**
 * Nummern
 */
var LispInteger = LispAtom.extend({
    value: 0,
    isLispInteger: true,
    toString: function() {
        return this.value;
    }
});

/**
 * Symbole
 */
var LispSymbol = LispObject.extend({
    characters: "",
    isLispSymbol: true,
    equals: function(otherSymbol) {
        return this.characters == otherSymbol.characters;
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
    isLispList: true,
    second: function() {
        return this.rest.first;
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
    isLispNil: true,
    toString: function() {
        return "nil";
    }
});

/**
 * Boolean true
 */
var LispTrue = LispAtom.extend({
    value: true,
    isLispTrue: true,
    toString: function() {
        return "true";
    }
});

/**
 * Boolean false
 */
var LispFalse = LispAtom.extend({
    value: false,
    isLispFalse: true,
    toString: function() {
        return "false";
    }
});