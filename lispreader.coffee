root = (exports ? this)

class LispReader
    constructor: (frm) ->
        _.bindAll this, "read"
        LispEvaluator.defineBuiltInFunctions()
        $(frm).on "submit", @read
        @inputField = $("#inputstream")
        #@activateAutocomplete()
        
    commentRegex: /^;/
    symbolRegex: /^[^\(\)\.\s'"]/
    integerRegex: /^\d/
    listRegex: /^\(/
    quoteRegex: /^'/
    stringRegex: /^"/
    seperators: /\s/
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
    read: (evt) ->
        evt.preventDefault() if evt?
        inputText = @inputField.val()
        @input = new StringParser(inputText)
        
        try
            erg = LispEvaluator.eval(@readObject())
        catch error
            console.error error if console and console.error
            @print error, inputText, true
            @inputField.val ""
            return
        
        @print erg, inputText
        @inputField.val ""
        #@updateAutocompleteData()

    ##
    # Aktiviert das Autocomplete Verhalten beim input Feld
    ##
    activateAutocomplete: ->
        self = this
        $("#inputstream").autocomplete
            autoFill: true
            delay: 0
            minChars: 1
            data: @getBindingsData()
            onFinish: ->
                field = self.inputField
                value = field.val()
                autoCompleter = field.data("autocompleter")
                field.val value + ")"
                autoCompleter.setCaret value.length

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
    # Aktualisiert den Autocompleter
    ##
    updateAutocompleteData: ->
        autoCompleter = @inputField.data("autocompleter")
        autoCompleter.options.data = @getBindingsData()

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
            #@input.next() until @input.atEnd() or /\n/.test(@input.peek())
            @input.skip(@seperators)
            
        if @integerRegex.test @input.peek()
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
    print: (lispObject, inputText, isError=false) ->
        $("#output").append "<li#{(if isError then " class='error'" else "")}> &gt;&gt; #{inputText}</li>
                             <li#{(if isError then " class='error'" else "")}>#{lispObject.toString()}</li>"

root.LispReader = LispReader

class LispEnvironment
    constructor: (parentEnv) ->
        @localBindings = []
        @parentEnv = parentEnv or null
    
    ##
    # Gibt das LispObject an der Stelle des Symbols zurück
    # @param {LispSymbol} symbol "Key" in der Environment HashTable
    # @return {Mixed}
    ##
    getBindingFor: (symbol) ->
        ret = _(@localBindings).find((binding) ->
            binding.key.equals symbol
        )
        return @parentEnv.getBindingFor(symbol)  if not ret and @parentEnv
        (if ret and ret.value then ret.value else new LispNil())

    ##
    # Fügt ein Binding ins Environment hinzu
    # @param {LispSymbol} symbol "Key" in der Environment HashTable
    # @param {LispObject} lispObject "Value" in der Environment HashTable
    ##
    addBindingFor: (symbol, lispObject) ->
        @localBindings.push
            key: symbol
            value: lispObject

    ##
    # Ändert ein Binding im Environment
    # @param {LispSymbol} symbol "Key" in der Environment HashTable
    # @param {LispObject} lispObject "Value" in der Environment HashTable
    ##
    changeBindingFor: (symbol, lispObject) ->
        for binding in @localBindings
            if binding.key.equals symbol
                binding.value = lispObject
                return

root.LispEnvironment = LispEnvironment

##
# LispEvaluator um Lisp Objekte zu evaluieren
##
class LispEvaluator
    @env: new LispEnvironment()
    
    ##
    # Evaluiert ein gegebenes LispObject
    # @param {LispObject} lispObj Das zu evaluierende Object
    # @param {LispEnvironment} env Das Environment, in dem evaluiert wird
    # @return {Mixed}
    ##
    @eval: (lispObj, env) ->
        env = env or @env
        if lispObj.isLispAtom
            return env.getBindingFor(lispObj)  if lispObj.isLispSymbol
            return lispObj
        
        unevaluatedFunc = lispObj.first
        evaluatedFunc = @eval(unevaluatedFunc, env)
        unevaluatedArgs = lispObj.rest
        
        if evaluatedFunc.isLispBuiltInFunction
            return evaluatedFunc.action(unevaluatedArgs, env)
        else if evaluatedFunc.isUserDefinedFunction
            return @evalUserDefinedFunction(evaluatedFunc, unevaluatedArgs, env)
        new LispNil()
        
    ##
    # Evaluiert eine Funktion, die vom Benutzer mittels lambda erzeugt wurde
    # @param {LispUserDefinedFunction} func Die Funktion
    # @param {LispList} unevaluatedArgs Die Argumente an die Funktion
    # @param {LispEnvironment} env
    # @return {Mixed}
    ##
    @evalUserDefinedFunction: (func, unevaluatedArgs, env) ->
        formalArgs = func.args
        newEnv = new LispEnvironment(func.env)
        unevaluatedArgs = unevaluatedArgs or new LispList()
       
        until formalArgs.isLispNil
            nameOfFormalArg = formalArgs.first
            unevaluatedArg = unevaluatedArgs.first
            evaluatedArg = @eval unevaluatedArg, env
            newEnv.addBindingFor nameOfFormalArg, evaluatedArg
            
            formalArgs = formalArgs.rest
            unevaluatedArgs = unevaluatedArgs.rest

        bodyList = func.bodyList
        lastResult = new LispNil()

        until bodyList.isLispNil
            lastResult = @eval bodyList.first, newEnv
            bodyList = bodyList.rest

        lastResult

    ##
    # Definiert alle im System vorhandenen "Built-In" Funktionen
    ##
    @defineBuiltInFunctions: ->
        _.each
            "+": "Plus"
            "-": "Minus"
            "*": "Multiply"
            "/": "Divide"
            "define": "Define"
            "set!": "Set"
            "let": "Let"
            "lambda": "Lambda"
            "begin": "Begin"
            "if": "If"
            "eq?": "Eq"
            "and": "And"
            "or": "Or"
            "not": "Not"
            "cons": "Cons"
            "first": "First"
            "rest": "Rest"
            "quote": "Quote"
            "error": "Error"
        , (className, symbol) =>
            klass = "LispBuiltIn#{className}Function"
            key = new LispSymbol(symbol)
            @env.addBindingFor key, new window[klass]()

root.LispEvaluator = LispEvaluator