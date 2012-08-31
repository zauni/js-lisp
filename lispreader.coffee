root = (exports ? this)
self = this
isNode = false

if exports?
    repl = require "repl"
    {StringParser} = require "./libs/stringparser.js"
    {LispEnvironment, LispObject, LispAtom, LispInteger, LispString, LispSymbol, LispList, LispNil, LispTrue, LispFalse, LispUserDefinedFunction, LispByteCodeAssembler} = require "./lisp-objects.js"
    {LispEvaluator} = require "./lispevaluator.js"
    isNode = true
else
    {StringParser} = root
    {LispEnvironment, LispObject, LispAtom, LispInteger, LispString, LispSymbol, LispList, LispNil, LispTrue, LispFalse, LispUserDefinedFunction, LispByteCodeAssembler} = root
    {LispEvaluator} = root

class LispReader
    constructor: (editor) ->
        #console?.log? "are we in node environment?", isNode
        
        LispEvaluator.defineBuiltInFunctions()
        
        # starte REPL in Node.JS
        if isNode
            repl = require "repl"
            repl.start "LISP JS> ", null, @readFromRepl
        else
            @inputField = 
                getValue: -> editor.getValue(),
                setValue: (val) -> editor.setValue val
        
    commentRegex: /^;/
    symbolRegex: /^[^\(\)\.\s'"]/
    integerRegex: /^\d/
    listRegex: /^\(/
    quoteRegex: /^'/
    stringRegex: /^"/
    seperators: /\s|\\n/
    reservedWords: /(nil|true|false)/
    reservedObjects:
        "nil": "LispNil"
        "true": "LispTrue"
        "false": "LispFalse"

    input: null
    knownSymbols: {}
    
    ##
    # Eventhandler der die Eingabe liest und auswertet
    # @param {Event} evt
    ##
    read: (evt) =>
        evt?.preventDefault?()
        inputText = @inputField.getValue()
        #console?.log? "cmd: ", inputText
        @input = new StringParser("(begin #{inputText})")
        
        try
            erg = LispEvaluator.eval(@readObject())
        catch error
            console?.error? error
            LispReader.print error, inputText, true
            @inputField.setValue ""
        
        LispReader.print erg, inputText
        @inputField.setValue ""

    ##
    # Liest die Eingaben aus der Node.JS ReadEvalPrintLoop
    # @param {String} cmd
    # @param {Function} callback
    ##
    readFromRepl: (cmd) =>
        callback = arguments[arguments.length-1]; # callback ist immer letztes argument
        cmd = cmd.trim().replace(/^\(/, "").replace(/\)$/, "") # Node fügt komischerweise manchmal Klammern () um das Kommando ein...
        #console?.log? "cmd: ", cmd
        @input = new StringParser(cmd)
        
        try
            erg = LispEvaluator.eval(@readObject())
            callback(null, erg.toString())
        catch error
            erg = "Error: #{error}"
            callback(erg)

    ##
    # Holt die aktuellen Built-in und User-Defined Functions
    # @return {Array}
    ##
    getBindingsData: ->
        data = []
        currentIndex = 0
        for binding in LispEvaluator.env.localBindings
            if binding.value.isLispBuiltInFunction or binding.value.isUserDefinedFunction
                data[currentIndex] = [ "(" + binding.key.characters, currentIndex + 1 ]
                currentIndex++

        data

    ##
    # List ein Lisp Objekt
    # @return {Mixed}
    ##
    readObject: ->
        @input.skip @seperators
        if @commentRegex.test @input.peek()
            # überspringe zeichen bis wir am ende oder an einem zeilenumbruch angelangt sind
            current = @input.peek()
            while not @input.atEnd() and not /\n/.test(current)
                @input.next()
                current = @input.peek()
            @input.skip(@seperators)
            
            @readObject()
        else if @integerRegex.test @input.peek()
            @readInteger()
        else if @stringRegex.test @input.peek()
            @readString()
        else if @symbolRegex.test @input.peek()
            @readSymbol()
        else if @quoteRegex.test @input.peek()
            @readQuote()
        else if @listRegex.test @input.peek()
            @readList()
        else
            new LispNil()
    
    ##
    # Liest Integerzahlen
    # @return {LispInteger}
    ##
    readInteger: ->
        character = ""
        character += @input.next() while not @input.atEnd() and @integerRegex.test(@input.peek())
        new LispInteger(parseInt(character, 10))

    ##
    # Liest Strings
    # @return {LispString}
    ##
    readString: ->
        @input.next() # skip "
        character = ""
        character += @input.next() until @input.atEnd() or @stringRegex.test(@input.peek())
        @input.next() # skip "
        new LispString(character)

    ##
    # Liest Symbole
    # Falls reservierte Worte wie true/false/nil vorkommen, wird die entsprechende Instanz zurückgegeben
    # @return {Mixed}
    ##
    readSymbol: ->
        character = ""
        while not @input.atEnd() and @symbolRegex.test(@input.peek())
            character += @input.next()
        if reservedWord = character.match(@reservedWords)
            return new window[ @reservedObjects[reservedWord[0]] ]()
        new LispSymbol(character)

    ##
    # Liest Quotes
    # @return {LispList}
    ##
    readQuote: ->
        @input.next() # skip '
        expr = @readObject()
        restList = new LispList(expr, new LispNil())
        new LispList(new LispSymbol("quote"), restList)

    ##
    # Liest Listen
    # @return {LispList}
    ##
    readList: ->
        @input.next() # skip (
        @input.skip @seperators
        
        if @input.peek() is ")"
            @input.next() # skip )
            return new LispNil()
        
        element = @readObject()
        
        @input.skip @seperators
        new LispList(element, @readListRest())

    ##
    # Liest den Rest einer Liste
    # @return {LispList}
    ##
    readListRest: ->
        @input.skip @seperators
        if @input.peek() is ")"
            @input.next()
            return new LispNil()
            
        element = @readObject()
        @input.skip @seperators
        new LispList(element, @readListRest())
        
    ##
    # Gibt das Ergebnis in einer Liste aus
    # @param {LispObject} lispObject
    # @param {String} inputText
    ##
    @print: (lispObject, inputText, isError=false) ->
        if inputText
            $("#output").append "<li#{(if isError then " class='error'" else "")}> &gt;&gt; #{inputText}</li>"
            
        $("#output").append "<li#{(if isError then " class='error'" else "")}>#{lispObject.toString()}</li>"

root.LispReader = LispReader