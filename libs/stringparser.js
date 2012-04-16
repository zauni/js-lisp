/**
 * StringParser
 */

/**
 * @constructor
 * @param {String} text Text der geparsed werden soll
 * 
 * @property {String} text Text der geparsed wird
 * @property {Number} currentIndex Aktueller Index innerhalb des Texts
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
    /**
     * Gibt das Zeichen beim aktuellen Index aus, ohne den Index zu erhöhen
     * @return {String} ein Zeichen
     */
    peek: function() {
        return this.text.charAt(this.currentIndex);
    },
    
    /**
     * Gibt das Zeichen beim aktuellen Index aus und erhöht den Index
     * @return {String} ein Zeichen
     */
    next: function() {
        var character = this.text.charAt(this.currentIndex);
        if( !this.atEnd() ) {
            this.currentIndex++;
        }
        return character;
    },
    
    /**
     * Ist der Parser am Ende des Strings angelangt?
     * @return {Boolean}
     */
    atEnd: function() {
        return this.currentIndex == this.text.length;
    },
    
    /**
     * Überspringe alle Zeichen, die auf einen regulären Ausdruck passen
     * @param {RegularExpression} regex
     */
    skip: function(regex) {
        var character = this.peek();
        while(regex.test(character)) {
            this.next();
            character = this.peek();
        }
    }
});