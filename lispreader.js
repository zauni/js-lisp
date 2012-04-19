/**
 * Kleiner LISP Interpreter
 */


/**
 * Liest die Eingabedaten und verwandelt sie in LISP Objekte
 */
var LispReader = function(frm) {
    _.bindAll(this, "read");
    
    $(frm).on("submit", this.read);
    
    LispEvaluator.defineBuiltInFunctions();
};

_.extend(LispReader.prototype, {
    symbolRegex: /^[^\(\)\.\s]/,
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
        
        this.print(LispEvaluator.eval(res));
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
    
    /**
     * Liest Integerzahlen
     * @return {LispInteger}
     */
    readInteger: function() {
        var integer = new LispInteger(),
            character = "";
            
        while(!this.input.atEnd() && this.integerRegex.test(this.input.peek())) {
            character += this.input.next();
        }
        integer.value = parseInt(character, 10);
        
        return integer;
    },
    
    /**
     * Liest Symbole
     * Falls reservierte Worte wie true/false/nil vorkommen, wird die entsprechende Instanz zurückgegeben
     * @return {Mixed}
     */
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
    
    /**
     * Liest Listen
     * @return {LispList}
     */
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
    
    /**
     * Liest den Rest einer Liste
     * @return {LispList}
     */
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
    
    /**
     * Gibt das Ergebnis in einer Liste aus
     * @param {LispObject} lispObject
     */
    print: function(lispObject) {
        $("#output").append("<li>" + lispObject.toString() + "</li>");
    }
});


/**
 * Environment für LISP
 */
var LispEnvironment = function() {
    this.localBindings = [];
};

_.extend(LispEnvironment.prototype, {
    /**
     * Gibt das LispObject an der Stelle des Symbols zurück
     * @param {LispSymbol} symbol "Key" in der Environment HashTable
     * @return {Mixed}
     */
    getBindingFor: function(symbol) {
        var ret = _(this.localBindings).find(function(binding) {
            return binding.key.equals(symbol);
        });
        return ret && ret.value ? ret.value : new LispNil();
    },
    
    /**
     * Fügt ein Binding ins Environment hinzu
     * @param {LispSymbol} symbol "Key" in der Environment HashTable
     * @param {LispObject} lispObject "Value" in der Environment HashTable
     */
    addBindingFor: function(symbol, lispObject) {
        this.localBindings.push({
            key: symbol,
            value: lispObject
        });
    }
});


/**
 * LispEvaluator um Lisp Objekte zu evaluieren
 */
LispEvaluator = {
    env: new LispEnvironment(),
    
    /**
     * Evaluiert ein gegebenes LispObject
     * @param {LispObject} lispObj Das zu evaluierende Object
     * @return {Mixed}
     */
    eval: function(lispObj) {
        if(lispObj.isLispAtom) {
            return lispObj.toString();
        }
        else if(lispObj.isLispSymbol) {
            // env@expr
            return this.env.getBindingFor(lispObj);
        }
        else if(lispObj.isLispList) {
            var func = lispObj.first,
                f = this.eval(func),
                args = lispObj.rest;
                
            if(f.isLispBuiltInFunction || f.isLispUserDefinedFunction) {
                return f.action(args, this.env);
            }
            else {
                return args;
            }
        }
    },
    
    /**
     * Definiert alle im System vorhandenen "Built-In" Funktionen
     */
    defineBuiltInFunctions: function() {
        var plusSymbol = new LispSymbol();
        plusSymbol.characters = "+";
        this.env.addBindingFor(plusSymbol, new LispBuiltInPlusFunction());
        
        var defineSymbol = new LispSymbol();
        defineSymbol.characters = "define";
        this.env.addBindingFor(defineSymbol, new LispBuiltInDefineFunction());
    }
};


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
    isLispFalse: false,
    isLispBuiltInFunction: false,
    isUserDefinedFunction: false
});

LispObject.extend = extend;


/**
 * Built-In Funktionen
 */
var LispBuiltInFunction = LispObject.extend({
    isLispBuiltInFunction: true,
    action: function() {},
    toString: function() {
        return "((Builtin Function))";
    }
});

/**
 * +
 */
var LispBuiltInPlusFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "+" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var arg = LispEvaluator.eval(args.first),
            erg = new LispInteger();
        
        if(arg && !args.rest.isLispNil) {
            erg.value = arg + (this.action(args.rest, env)).value;
            return erg;
        }
        else if(arg) {
            erg.value = arg;
            return erg;
        }
        else {
            erg.value = 0;
            return erg;
        }
    }
});

/**
 * define
 */
var LispBuiltInDefineFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "define" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var varName = args.first,
            value = LispEvaluator.eval(args.rest.first);
            
        if(varName && varName.isLispSymbol && value) {
            env.addBindingFor(varName, value);
            return value;
        }
    }
});


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