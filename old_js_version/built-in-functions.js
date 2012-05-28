

/**
 * Built-In Funktionen
 */
var LispBuiltInFunction = LispAtom.extend({
    isLispBuiltInFunction: true,
    action: function() {},
    toString: function() {
        return "((Builtin Function))";
    }
});

/**
 * +
 */
var LispBuiltInPlusFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "+" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var arg = LispEvaluator.eval(args.first, env),
            erg = new LispInteger();
        
        if(arg && !args.rest.isLispNil) {
            erg.value = arg + (this.action(args.rest, env)).value;
            return erg;
        } else if(arg) {
            erg.value = arg;
            return erg;
        } else {
            erg.value = 0;
            return erg;
        }
    }
});

/**
 * -
 */
var LispBuiltInMinusFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "-" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var arg = LispEvaluator.eval(args.first, env),
            erg = new LispInteger();
        
        /* TODO: Rekursion als Schleife auflösen, sonst ist die Operatorreihenfolge falsch! */
        
        if(arg && !args.rest.isLispNil) {
            erg.value = arg - (this.action(args.rest, env)).value;
            return erg;
        } else if(arg) {
            erg.value = arg;
            return erg;
        } else {
            erg.value = 0;
            return erg;
        }
    }
});

/**
 * *
 */
var LispBuiltInMultiplyFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "*" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var arg = LispEvaluator.eval(args.first, env),
            erg = new LispInteger();
        
        if(arg && !args.rest.isLispNil) {
            erg.value = arg * (this.action(args.rest, env)).value;
            return erg;
        } else if(arg) {
            erg.value = arg;
            return erg;
        } else {
            erg.value = 0;
            return erg;
        }
    }
});

/**
 * /
 */
var LispBuiltInDivideFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "/" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var arg = LispEvaluator.eval(args.first, env),
            erg = new LispInteger();
        
        if(arg && !args.rest.isLispNil) {
            erg.value = arg / (this.action(args.rest, env)).value;
            return erg;
        } else if(arg) {
            erg.value = arg;
            return erg;
        } else {
            erg.value = 0;
            return erg;
        }
    }
});

/**
 * define
 */
var LispBuiltInDefineFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "define" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var varNameOrFunc = args.first;
            
        if(varNameOrFunc.isLispSymbol) {
            var value = LispEvaluator.eval(args.rest.first, env);
            env.addBindingFor(varNameOrFunc, value);
            return value;
        }
        // Syntactic Sugar für einfachere lambdas
        else if(varNameOrFunc.isLispList) {
            var funcName = varNameOrFunc.first,
                unevaluatedArgs = varNameOrFunc.rest,
                body = args.second(),
                func = new LispUserDefinedFunction();
        
            func.args = unevaluatedArgs;
            func.body = body;
            func.env = env;
            
            env.addBindingFor(funcName, func);

            return func;
        }
        return new LispNil();
    }
});

/**
 * lambda
 */
var LispBuiltInLambdaFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "lambda" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var unevaluatedArgs = args.first,
            body = args.rest.first,
            func = new LispUserDefinedFunction();
        
        func.args = unevaluatedArgs;
        func.body = body;
        func.env = env;
        
        return func;
    }
});


/**
 * if
 */
var LispBuiltInIfFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "if" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var unevaluatedCond = args.first,
            unevaluatedIfBody = args.second(),
            unevaluatedElseBody = args.third(),
            cond = LispEvaluator.eval(unevaluatedCond, env);
        
        return cond && cond.isLispTrue
               ? LispEvaluator.eval(unevaluatedIfBody, env)
               : LispEvaluator.eval(unevaluatedElseBody, env);
    }
});


/**
 * eq?
 */
var LispBuiltInEqFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "eq?" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var unevaluatedA = args.first,
            unevaluatedB = args.second(),
            A = LispEvaluator.eval(unevaluatedA, env),
            B = LispEvaluator.eval(unevaluatedB, env),
            comp;
            
        comp = function(a, b) {
            if(a.isLispSymbol && b.isLispSymbol) {
                return a.characters === b.characters;
            }
            else if(a.isLispAtom && b.isLispAtom) {
                return a.value === b.value;
            }
            else if(a.isLispList && b.isLispList) {
                return comp(a.first, b.first) && comp(a.rest, b.rest);
            }
            else {
                return a == b;
            }
        }
        
        return comp(A, B);
    }
});


/**
 * cons
 */
var LispBuiltInConsFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "cons" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var unevaluatedFirst = args.first,
            unevaluatedSecond = args.second(),
            newList = new LispList();
            
        newList.first = LispEvaluator.eval(unevaluatedFirst, env);
        newList.rest  = LispEvaluator.eval(unevaluatedSecond, env);
        
        return newList;
    }
});


/**
 * first
 */
var LispBuiltInFirstFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "first" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var list = LispEvaluator.eval(args.first, env);
        return list.first;
    }
});


/**
 * rest
 */
var LispBuiltInRestFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "rest" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        var list = LispEvaluator.eval(args.first, env);
        return list.rest;
    }
});


/**
 * quote
 * Evaluiert die Parameter nicht, sondern gibt sie einfach zurück
 */
var LispBuiltInQuoteFunction = LispBuiltInFunction.extend({
    /**
     * Aktion bei einem "quote" LispSymbol
     * @param {LispObject} args Argumente der Aktion
     * @param {LispEnvironment} env Environment, in dem die Argumente evaluiert werden
     */
    action: function(args, env) {
        return args.first;
    }
});