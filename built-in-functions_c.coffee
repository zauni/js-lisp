
root = exports ? this

##
# Built-In Funktionen
##
class LispBuiltInFunction extends LispAtom
    isLispBuiltInFunction: true
    action: ->

    toString: ->
        "((Builtin Function))"
        
root.LispBuiltInFunction = LispBuiltInFunction

##
# +
##
class LispBuiltInPlusFunction extends LispBuiltInFunction

    ##
    # Aktion bei einem "+" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
    action: (args, env) ->
        arg = LispEvaluator.eval(args.first, env)
        if arg and not args.rest.isLispNil
            new LispInteger(arg + (@action(args.rest, env)).value)
        else if arg
            new LispInteger(arg)
        else
            new LispInteger(0)
        
root.LispBuiltInPlusFunction = LispBuiltInPlusFunction

##
# -
##
class LispBuiltInMinusFunction extends LispBuiltInFunction

    ##
    # Aktion bei einem "-" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
    action: (args, env) ->
        arg = LispEvaluator.eval(args.first, env)
        if arg and not args.rest.isLispNil
            new LispInteger(arg - (@action(args.rest, env)).value)
        else if arg
            new LispInteger(arg)
        else
            new LispInteger(0)
        
root.LispBuiltInMinusFunction = LispBuiltInMinusFunction

##
# *
##
class LispBuiltInMultiplyFunction extends LispBuiltInFunction

    ##
    # Aktion bei einem "*" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
    action: (args, env) ->
        arg = LispEvaluator.eval(args.first, env)
        if arg and not args.rest.isLispNil
            new LispInteger(arg * (@action(args.rest, env)).value)
        else if arg
            new LispInteger(arg)
        else
            new LispInteger(0)
        
root.LispBuiltInMultiplyFunction = LispBuiltInMultiplyFunction

##
# /
##
class LispBuiltInDivideFunction extends LispBuiltInFunction

    ##
    # Aktion bei einem "/" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
    action: (args, env) ->
        arg = LispEvaluator.eval(args.first, env)
        if arg and not args.rest.isLispNil
            new LispInteger(arg / (@action(args.rest, env)).value)
        else if arg
            new LispInteger(arg)
        else
            new LispInteger(0)
        
root.LispBuiltInDivideFunction = LispBuiltInDivideFunction

##
# define
##
class LispBuiltInDefineFunction extends LispBuiltInFunction

    ##
    # Aktion bei einem "define" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
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
            body = args.second()
            func = new LispUserDefinedFunction(unevaluatedArgs, body, env)
            env.addBindingFor funcName, func
            return func
        new LispNil()
        
root.LispBuiltInDefineFunction = LispBuiltInDefineFunction

##
# lambda
##
class LispBuiltInLambdaFunction extends LispBuiltInFunction
    
    ##
    # Aktion bei einem "lambda" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
    action: (args, env) ->
        unevaluatedArgs = args.first
        body = args.rest.first
        new LispUserDefinedFunction(unevaluatedArgs, body, env)
        
root.LispBuiltInLambdaFunction = LispBuiltInLambdaFunction

##
# if
##
class LispBuiltInIfFunction extends LispBuiltInFunction

    ##
    # Aktion bei einem "if" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
    action: (args, env) ->
        unevaluatedCond = args.first
        unevaluatedIfBody = args.second()
        unevaluatedElseBody = args.third()
        cond = LispEvaluator.eval(unevaluatedCond, env)
        if cond and cond.isLispTrue
            LispEvaluator.eval(unevaluatedIfBody, env)
        else 
            LispEvaluator.eval(unevaluatedElseBody, env)
        
root.LispBuiltInIfFunction = LispBuiltInIfFunction

##
# eq?
##
class LispBuiltInEqFunction extends LispBuiltInFunction

    ##
    # Aktion bei einem "eq?" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
    action: (args, env) ->
        unevaluatedA = args.first
        unevaluatedB = args.second()
        A = LispEvaluator.eval(unevaluatedA, env)
        B = LispEvaluator.eval(unevaluatedB, env)
        
        comp = (a, b) ->
            if a.isLispSymbol and b.isLispSymbol
                a.characters is b.characters
            else if a.isLispAtom and b.isLispAtom
                a.value is b.value
            else if a.isLispList and b.isLispList
                comp(a.first, b.first) and comp(a.rest, b.rest)
            else
                a is b

        return comp A, B
        
root.LispBuiltInEqFunction = LispBuiltInEqFunction

##
# cons
##
class LispBuiltInConsFunction extends LispBuiltInFunction

    ##
    # Aktion bei einem "cons" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
    action: (args, env) ->
        unevaluatedFirst = args.first
        unevaluatedSecond = args.second()
        new LispList(LispEvaluator.eval(unevaluatedFirst, env), LispEvaluator.eval(unevaluatedSecond, env))
        
root.LispBuiltInConsFunction = LispBuiltInConsFunction

##
# first
##
class LispBuiltInFirstFunction extends LispBuiltInFunction

    ##
    # Aktion bei einem "first" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
    action: (args, env) ->
        list = LispEvaluator.eval(args.first, env)
        list.first
        
root.LispBuiltInFirstFunction = LispBuiltInFirstFunction

##
# rest
##
class LispBuiltInRestFunction extends LispBuiltInFunction

    ##
    # Aktion bei einem "rest" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
    action: (args, env) ->
        list = LispEvaluator.eval(args.first, env)
        list.rest
        
root.LispBuiltInRestFunction = LispBuiltInRestFunction

##
# quote
# Evaluiert die Parameter nicht, sondern gibt sie einfach zurück
##
class LispBuiltInQuoteFunction extends LispBuiltInFunction

    ##
    # Aktion bei einem "quote" LispSymbol
    # @param {LispObject} args Argumente der Aktion
    # @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
    ##
    action: (args, env) ->
        args.first
        
root.LispBuiltInQuoteFunction = LispBuiltInQuoteFunction