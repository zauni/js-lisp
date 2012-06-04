root = (exports ? this)

##
# Elternklasse für alle LISP Objekte
##
class LispObject
    isLispAtom: false
    isLispInteger: false
    isLispString: false
    isLispSymbol: false
    isLispList: false
    isLispNil: false
    isLispTrue: false
    isLispFalse: false
    isLispBuiltInFunction: false
    isUserDefinedFunction: false

root.LispObject = LispObject

##
# Atome
##
class LispAtom extends LispObject
    isLispAtom: true

root.LispAtom = LispAtom

##
# Nummern
##
class LispInteger extends LispAtom
    constructor: (@value) ->
        
    value: 0
    isLispInteger: true
    toString: ->
        @value

root.LispInteger = LispInteger

##
# Strings
##
class LispString extends LispAtom
    constructor: (@characters) ->
        
    characters: ""
    isLispString: true
    toString: ->
        "\"#{@characters}\""

root.LispString = LispString

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

root.LispSymbol = LispSymbol

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
        if @first.isLispNil and @rest.isLispNil
            "()" 
        else
            "(#{@first.toString()} #{@rest.toString()})"

root.LispList = LispList

##
# nil
##
class LispNil extends LispAtom
    value: null
    isLispNil: true
    toString: ->
        "nil"

root.LispNil = LispNil

##
# Boolean true
##
class LispTrue extends LispAtom
    value: true
    isLispTrue: true
    toString: ->
        "true"

root.LispTrue = LispTrue

##
# Boolean false
##
class LispFalse extends LispAtom
    value: false
    isLispFalse: true
    toString: ->
        "false"

root.LispFalse = LispFalse

##
# User Defined Function (lambda)
##
class LispUserDefinedFunction extends LispAtom
    constructor: (@args, bodyList, @env) ->
        # bodyList soll mit der Begin Funktion ausgewertet werden
        @bodyList = new LispList(new LispSymbol("begin"), bodyList)
        
    isUserDefinedFunction: true
    args: null
    bodyList: null
    env: null
    toString: ->
        "((User Defined Function))"
        
    byteCode: null
    literals: null
        
root.LispUserDefinedFunction = LispUserDefinedFunction

class LispByteCodeAssembler
    assemble: ->
    