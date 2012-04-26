

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
        }
        else if(arg) {
            erg.value = arg;
            return erg;
        }
        else {
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
        var varName = args.first,
            value = LispEvaluator.eval(args.rest.first, env);
            
        if(varName && varName.isLispSymbol && value) {
            env.addBindingFor(varName, value);
            return value;
        }
    }
});

/**
 * define
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