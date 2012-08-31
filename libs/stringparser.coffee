##
# StringParser
# 
# @property {String} text Text der geparsed wird
# @property {Number} currentIndex Aktueller Index innerhalb des Texts
##
class StringParser

    ##
    # @constructor
    # @param {String} text Text der geparsed werden soll
    ##
    constructor: (text) ->
        throw "StringParser expected String but got #{typeof text}" unless typeof text is "string"
        throw "StringParser expected a non-empty String" if text.length is 0
        @text = text.replace /\r\n/g, "\n"   # normalisiere die Newline Character
        @currentIndex = 0
  
    ##
    # Gibt das Zeichen beim aktuellen Index aus, ohne den Index zu erhöhen
    # @return {String} ein Zeichen
    ##
    peek: ->
        @text.charAt @currentIndex
  
    ##
    # Gibt das Zeichen beim aktuellen Index aus und erhöht den Index
    # @return {String} ein Zeichen
    ##
    next: ->
        character = @text.charAt(@currentIndex)
        @currentIndex++ unless @atEnd()
        character

    ##
    # Ist der Parser am Ende des Strings angelangt?
    # @return {Boolean}
    ##
    atEnd: ->
        @currentIndex is @text.length

  
    ##
    # Überspringe alle Zeichen, die auf einen regulären Ausdruck passen
    # @param {RegularExpression} regex
    ##
    skip: (regex) ->
        character = @peek()
        while regex.test(character)
            @next()
            character = @peek()

(exports ? this).StringParser = StringParser