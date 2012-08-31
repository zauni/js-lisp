root = exports ? this
isNode = false

if exports?
    {LispObject, LispAtom, LispInteger, LispString, LispSymbol, LispList, LispNil, LispTrue, LispFalse, LispUserDefinedFunction, LispByteCodeAssembler} = require "./lisp-objects.js"
    isNode = true
else
    {LispObject, LispAtom, LispInteger, LispString, LispSymbol, LispList, LispNil, LispTrue, LispFalse, LispUserDefinedFunction, LispByteCodeAssembler} = root
    
LispEvaluator = null # LispEvaluator wird erst später geholt, da eine kreisförmige Abhängigkeit besteht zwischen den Built-In Funktionen und dem Evaluator


##
# LispEnvironment wird hier definiert, um eine kreisförmige Abhängigkeit zu vermeiden
# (Environment braucht Functions, Functions brauchen Environment)
##
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
        ret = binding for binding in @localBindings when binding.key.equals symbol
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
# Built-In Funktionen
##
class LispBuiltInFunction extends LispAtom
    isLispBuiltInFunction: true
    action: ->

    toString: ->
        "((Builtin Function))"
        
root.LispBuiltInFunction = LispBuiltInFunction

root.builtIns =
    ##
    # +
    ##
    "Plus":
        symbol: "+"
        action: (args, env) ->
            arg = LispEvaluator.eval(args.first, env)
            if arg and not args.rest.isLispNil
                new LispInteger(arg.value + (@action(args.rest, env)).value)
            else if arg
                new LispInteger(arg.value)
            else
                new LispInteger(0)
    
    ##
    # -
    ##
    "Minus":
        symbol: "-"
        action: (args, env) ->
            arg = LispEvaluator.eval(args.first, env)
            if arg and not args.rest.isLispNil
                new LispInteger(arg.value - (@action(args.rest, env)).value)
            else if arg
                new LispInteger(arg.value)
            else
                new LispInteger(0)
    
    ##
    # *
    ##
    "Multiply":
        symbol: "*"
        action: (args, env) ->
            arg = LispEvaluator.eval(args.first, env)
            if arg and not args.rest.isLispNil
                new LispInteger(arg.value * (@action(args.rest, env)).value)
            else if arg
                new LispInteger(arg.value)
            else
                new LispInteger(0)
    
    ##
    # /
    ##
    "Divide":
        symbol: "/"
        action: (args, env) ->
            arg = LispEvaluator.eval(args.first, env)
            if arg and not args.rest.isLispNil
                new LispInteger(arg.value / (@action(args.rest, env)).value)
            else if arg
                new LispInteger(arg.value)
            else
                new LispInteger(0)
    
    ##
    # define
    ##
    "Define":
        symbol: "define"
        action: (args, env) ->
            varNameOrFunc = args.first

            if varNameOrFunc.isLispSymbol
                # Bindings, die es schon gibt, werden nicht überschrieben!
                definedBinding = env.getBindingFor varNameOrFunc
                return definedBinding if not definedBinding.isLispNil

                value = LispEvaluator.eval(args.rest.first, env)
                env.addBindingFor varNameOrFunc, value
                return value

            # Syntactic Sugar für einfachere lambdas
            else if varNameOrFunc.isLispList
                funcName = varNameOrFunc.first
                unevaluatedArgs = varNameOrFunc.rest
                bodyList = args.rest
                func = new LispUserDefinedFunction(unevaluatedArgs, bodyList, env)
                env.addBindingFor funcName, func
                return func
            new LispNil()
    
    ##
    # set!
    ##
    "Set":
        symbol: "set!"
        action: (args, env) ->
            varName = args.first
            value = LispEvaluator.eval(args.rest.first, env)

            if varName.isLispSymbol
                definedBinding = env.getBindingFor varName
                throw "#{varName} is not defined and cannot be set to #{value}" if definedBinding.isLispNil

                env.changeBindingFor varName, value
                return value

            new LispNil()
    
    ##
    # let
    ##
    "Let":
        symbol: "let"
        action: (args, env) ->
            keyValueList = args.first
            currentPair = keyValueList.first
            bodies = args.rest
            tempEnv = new LispEnvironment(env);

            until keyValueList.isLispNil
                key = currentPair.first
                value = currentPair.second()
                evaluate = new LispList(new LispSymbol("define"), new LispList(key, new LispList(value, new LispNil())))
                # lass die "define" Funktion ihren Job machen
                LispEvaluator.eval(evaluate, tempEnv)
                keyValueList = keyValueList.rest
                currentPair = keyValueList.first

            evaluate = new LispList(new LispSymbol("begin"), bodies);
            LispEvaluator.eval(evaluate, tempEnv)
    
    ##
    # lambda
    ##
    "Lambda":
        symbol: "lambda"
        action: (args, env) ->
            unevaluatedArgs = args.first
            bodyList = args.rest
            new LispUserDefinedFunction(unevaluatedArgs, bodyList, env)
    
    ##
    # begin
    ##
    "Begin":
        symbol: "begin"
        action: (args, env) ->
            result = new LispNil()
            restList = args
            until restList.isLispNil
                result = LispEvaluator.eval restList.first, env
                restList = restList.rest
            result
    
    ##
    # if
    ##
    "If":
        symbol: "if"
        action: (args, env) ->
            unevaluatedCond = args.first
            unevaluatedIfBody = args.second()
            unevaluatedElseBody = args.third()
            cond = LispEvaluator.eval(unevaluatedCond, env)
            if cond?.isLispTrue
                LispEvaluator.eval(unevaluatedIfBody, env)
            else 
                LispEvaluator.eval(unevaluatedElseBody, env)
    
    ##
    # eq?
    ##
    "Eq":
        symbol: "eq?"
        action: (args, env) ->
            unevaluatedA = args.first
            unevaluatedB = args.second()
            A = LispEvaluator.eval(unevaluatedA, env)
            B = LispEvaluator.eval(unevaluatedB, env)

            comp = (a, b) ->
                if (a.isLispSymbol and b.isLispSymbol) or (a.isLispString and b.isLispString)
                    a.characters is b.characters
                else if a.isLispAtom and b.isLispAtom
                    a.value is b.value
                else if a.isLispList and b.isLispList
                    comp(a.first, b.first) and comp(a.rest, b.rest)
                else
                    a is b

            return (if comp A, B then new LispTrue() else new LispFalse())
    
    ##
    # and
    ##
    "And":
        symbol: "and"
        action: (args, env) ->
            unevaluatedCondA = args.first
            unevaluatedCondB = args.second()

            condA = LispEvaluator.eval(unevaluatedCondA, env)
            condB = LispEvaluator.eval(unevaluatedCondB, env)

            if condA?.isLispTrue and condB?.isLispTrue
                return new LispTrue()
            new LispFalse()
    
    ##
    # or
    ##
    "Or":
        symbol: "or"
        action: (args, env) ->
            unevaluatedCondA = args.first
            unevaluatedCondB = args.second()

            condA = LispEvaluator.eval(unevaluatedCondA, env)
            condB = LispEvaluator.eval(unevaluatedCondB, env)

            if condA?.isLispTrue or condB?.isLispTrue
                return new LispTrue()
            new LispFalse()
    
    ##
    # not
    ##
    "Not":
        symbol: "not"
        action: (args, env) ->
            unevaluatedCond = args.first

            cond = LispEvaluator.eval(unevaluatedCond, env)

            if cond?.isLispTrue
                return new LispFalse()
            new LispTrue()
    
    ##
    # cons
    ##
    "Cons":
        symbol: "cons"
        action: (args, env) ->
            unevaluatedFirst = args.first
            unevaluatedSecond = args.second()
            new LispList(LispEvaluator.eval(unevaluatedFirst, env), LispEvaluator.eval(unevaluatedSecond, env))
    
    ##
    # first
    ##
    "First":
        symbol: "first"
        action: (args, env) ->
            list = LispEvaluator.eval(args.first, env)
            list.first
    
    ##
    # rest
    ##
    "Rest":
        symbol: "rest"
        action: (args, env) ->
            list = LispEvaluator.eval(args.first, env)
            list.rest
    
    ##
    # quote
    # Evaluiert die Parameter nicht, sondern gibt sie einfach zurück
    ##
    "Quote":
        symbol: "quote"
        action: (args, env) ->
            args.first
    
    ##
    # error
    # Gibt eine Fehlermeldung aus
    ##
    "Error":
        symbol: "error"
        action: (args, env) ->
            msg = LispEvaluator.eval(args.first, env)
            throw "#{msg.characters}"
    
    ##
    # print
    # Gibt einen String aus
    ##
    "Print":
        symbol: "print"
        action: (args, env) ->
            msg = LispEvaluator.eval(args.first, env)
            output = if isNode then console.log else root.LispReader.print
            output "#{msg.characters}"
            msg

# erzeuge die Klassen
for className, params of builtIns
    action = params.action
    class root["LispBuiltIn#{className}Function"] extends LispBuiltInFunction
        action: ((className, action)->
                    return ->
                        if !LispEvaluator
                            {LispEvaluator} = require "./lispevaluator.js" if isNode
                            {LispEvaluator} = root if !isNode
                        
                        action.apply this, arguments
                )(className, action)
