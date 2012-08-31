root = exports ? this
self = this
isNode = false

if exports?
    {LispObject, LispAtom, LispInteger, LispString, LispSymbol, LispList, LispNil, LispTrue, LispFalse, LispUserDefinedFunction, LispByteCodeAssembler} = require "./lisp-objects.js"
    {LispEnvironment, @LispBuiltInFunction, @LispBuiltInPlusFunction, @LispBuiltInMinusFunction, @LispBuiltInMultiplyFunction, @LispBuiltInDivideFunction, @LispBuiltInDefineFunction, @LispBuiltInSetFunction, @LispBuiltInLetFunction, @LispBuiltInLambdaFunction, @LispBuiltInBeginFunction, @LispBuiltInIfFunction, @LispBuiltInEqFunction, @LispBuiltInAndFunction, @LispBuiltInOrFunction, @LispBuiltInNotFunction, @LispBuiltInConsFunction, @LispBuiltInFirstFunction, @LispBuiltInRestFunction, @LispBuiltInQuoteFunction, @LispBuiltInErrorFunction} = require "./built-in-functions.js"
    isNode = true
else
    {LispObject, LispAtom, LispInteger, LispString, LispSymbol, LispList, LispNil, LispTrue, LispFalse, LispUserDefinedFunction, LispByteCodeAssembler} = root
    {LispEnvironment, @LispBuiltInFunction, @LispBuiltInPlusFunction, @LispBuiltInMinusFunction, @LispBuiltInMultiplyFunction, @LispBuiltInDivideFunction, @LispBuiltInDefineFunction, @LispBuiltInSetFunction, @LispBuiltInLetFunction, @LispBuiltInLambdaFunction, @LispBuiltInBeginFunction, @LispBuiltInIfFunction, @LispBuiltInEqFunction, @LispBuiltInAndFunction, @LispBuiltInOrFunction, @LispBuiltInNotFunction, @LispBuiltInConsFunction, @LispBuiltInFirstFunction, @LispBuiltInRestFunction, @LispBuiltInQuoteFunction, @LispBuiltInErrorFunction} = root

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
        #console?.log? "eval ", lispObj
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
        builtIns =
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
            "print": "Print"
            
        for symbol, className of builtIns
            klass = "LispBuiltIn#{className}Function"
            key = new LispSymbol(symbol)
            @env.addBindingFor key, new self[klass]()

root.LispEvaluator = LispEvaluator