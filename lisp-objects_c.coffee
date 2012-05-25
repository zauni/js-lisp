##
# Elternklasse für alle LISP Objekte
##
class LispObject
    isLispAtom: false
    isLispInteger: false
    isLispSymbol: false
    isLispList: false
    isLispNil: false
    isLispTrue: false
    isLispFalse: false
    isLispBuiltInFunction: false
    isUserDefinedFunction: false
    
LispObject.extend = extend

(exports ? this).LispObject = LispObject

##
# Atome
##
class LispAtom extends LispObject
    isLispAtom: true

(exports ? this).LispAtom = LispAtom

##
# Nummern
##
class LispInteger extends LispAtom
    constructor: (@value) ->
        
    value: 0
    isLispInteger: true
    toString: ->
        @value

(exports ? this).LispInteger = LispInteger

##
# Symbole
##
class LispSymbol extends LispAtom
    constructor: (@characters) ->
        
    characters: ""
    isLispSymbol: true
    equals: (otherSymbol) ->
        @characters is otherSymbol.characters

    toString: ->
        @characters

(exports ? this).LispSymbol = LispSymbol

##
# Listen
##
class LispList extends LispObject
    constructor: (@first, @rest) ->
        
    first: null
    rest: null
    isLispList: true
    second: ->
        (if @rest and @rest.isLispList then @rest.first else new LispNil())

    third: ->
        (if @rest and @rest.rest and @rest.rest.isLispList then @rest.rest.first else new LispNil())

    toString: ->
        "(#{@first.toString()} #{@rest.toString()})"

(exports ? this).LispList = LispList

##
# nil
##
class LispNil extends LispAtom
    value: null
    isLispNil: true
    toString: ->
        "nil"

(exports ? this).LispNil = LispNil

##
# Boolean true
##
class LispTrue extends LispAtom
    value: true
    isLispTrue: true
    toString: ->
        "true"

(exports ? this).LispTrue = LispTrue

##
# Boolean false
##
class LispFalse extends LispAtom
    value: false
    isLispFalse: true
    toString: ->
        "false"

(exports ? this).LispFalse = LispFalse

##
# User Defined Function (lambda)
##
class LispUserDefinedFunction extends LispAtom
    constructor: (@args, @body, @env) ->
        
    isUserDefinedFunction: true
    args: null
    body: null
    env: null
    toString: ->
        "((User Defined Function))"
        
    byteCode: null
    literals: null
        
(exports ? this).LispUserDefinedFunction = LispUserDefinedFunction

class LispByteCodeAssembler
    assemble: ->
    