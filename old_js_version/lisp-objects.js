

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
var LispSymbol = LispAtom.extend({
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
        return this.rest && this.rest.isLispList
               ? this.rest.first
               : new LispNil();
    },
    third: function() {
        return this.rest && this.rest.rest && this.rest.rest.isLispList
               ? this.rest.rest.first
               : new LispNil();
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

/**
 * User Defined Function (lambda)
 */
var LispUserDefinedFunction = LispAtom.extend({
    isUserDefinedFunction: true,
    args: null,
    body: null,
    env: null,
    toString: function() {
        return "((User Defined Function))";
    }
});