(function() {
  var LispAtom, LispBytecodeAssembler, LispEnvironment, LispEvaluator, LispFalse, LispInteger, LispList, LispNil, LispObject, LispString, LispSymbol, LispTrue, LispUserDefinedFunction, isNode, root, self, _ref, _ref1;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  self = this;

  isNode = false;

  if (typeof exports !== "undefined" && exports !== null) {
    _ref = require("./lisp-objects.js"), LispObject = _ref.LispObject, LispAtom = _ref.LispAtom, LispInteger = _ref.LispInteger, LispString = _ref.LispString, LispSymbol = _ref.LispSymbol, LispList = _ref.LispList, LispNil = _ref.LispNil, LispTrue = _ref.LispTrue, LispFalse = _ref.LispFalse, LispUserDefinedFunction = _ref.LispUserDefinedFunction, LispBytecodeAssembler = _ref.LispBytecodeAssembler;
    _ref1 = require("./built-in-functions.js"), LispEnvironment = _ref1.LispEnvironment, this.LispBuiltInFunction = _ref1.LispBuiltInFunction, this.LispBuiltInPlusFunction = _ref1.LispBuiltInPlusFunction, this.LispBuiltInMinusFunction = _ref1.LispBuiltInMinusFunction, this.LispBuiltInMultiplyFunction = _ref1.LispBuiltInMultiplyFunction, this.LispBuiltInDivideFunction = _ref1.LispBuiltInDivideFunction, this.LispBuiltInDefineFunction = _ref1.LispBuiltInDefineFunction, this.LispBuiltInSetFunction = _ref1.LispBuiltInSetFunction, this.LispBuiltInLetFunction = _ref1.LispBuiltInLetFunction, this.LispBuiltInLambdaFunction = _ref1.LispBuiltInLambdaFunction, this.LispBuiltInBeginFunction = _ref1.LispBuiltInBeginFunction, this.LispBuiltInIfFunction = _ref1.LispBuiltInIfFunction, this.LispBuiltInEqFunction = _ref1.LispBuiltInEqFunction, this.LispBuiltInAndFunction = _ref1.LispBuiltInAndFunction, this.LispBuiltInOrFunction = _ref1.LispBuiltInOrFunction, this.LispBuiltInNotFunction = _ref1.LispBuiltInNotFunction, this.LispBuiltInConsFunction = _ref1.LispBuiltInConsFunction, this.LispBuiltInFirstFunction = _ref1.LispBuiltInFirstFunction, this.LispBuiltInRestFunction = _ref1.LispBuiltInRestFunction, this.LispBuiltInQuoteFunction = _ref1.LispBuiltInQuoteFunction, this.LispBuiltInErrorFunction = _ref1.LispBuiltInErrorFunction;
    isNode = true;
  } else {
    LispObject = root.LispObject, LispAtom = root.LispAtom, LispInteger = root.LispInteger, LispString = root.LispString, LispSymbol = root.LispSymbol, LispList = root.LispList, LispNil = root.LispNil, LispTrue = root.LispTrue, LispFalse = root.LispFalse, LispUserDefinedFunction = root.LispUserDefinedFunction, LispBytecodeAssembler = root.LispBytecodeAssembler;
    LispEnvironment = root.LispEnvironment, this.LispBuiltInFunction = root.LispBuiltInFunction, this.LispBuiltInPlusFunction = root.LispBuiltInPlusFunction, this.LispBuiltInMinusFunction = root.LispBuiltInMinusFunction, this.LispBuiltInMultiplyFunction = root.LispBuiltInMultiplyFunction, this.LispBuiltInDivideFunction = root.LispBuiltInDivideFunction, this.LispBuiltInDefineFunction = root.LispBuiltInDefineFunction, this.LispBuiltInSetFunction = root.LispBuiltInSetFunction, this.LispBuiltInLetFunction = root.LispBuiltInLetFunction, this.LispBuiltInLambdaFunction = root.LispBuiltInLambdaFunction, this.LispBuiltInBeginFunction = root.LispBuiltInBeginFunction, this.LispBuiltInIfFunction = root.LispBuiltInIfFunction, this.LispBuiltInEqFunction = root.LispBuiltInEqFunction, this.LispBuiltInAndFunction = root.LispBuiltInAndFunction, this.LispBuiltInOrFunction = root.LispBuiltInOrFunction, this.LispBuiltInNotFunction = root.LispBuiltInNotFunction, this.LispBuiltInConsFunction = root.LispBuiltInConsFunction, this.LispBuiltInFirstFunction = root.LispBuiltInFirstFunction, this.LispBuiltInRestFunction = root.LispBuiltInRestFunction, this.LispBuiltInQuoteFunction = root.LispBuiltInQuoteFunction, this.LispBuiltInErrorFunction = root.LispBuiltInErrorFunction;
  }

  LispEvaluator = (function() {

    function LispEvaluator() {}

    LispEvaluator.env = new LispEnvironment();

    LispEvaluator["eval"] = function(lispObj, env) {
      var evaluatedFunc, unevaluatedArgs, unevaluatedFunc;
      env = env || this.env;
      if (lispObj.isLispAtom) {
        if (lispObj.isLispSymbol) {
          return env.getBindingFor(lispObj);
        }
        return lispObj;
      }
      unevaluatedFunc = lispObj.first;
      evaluatedFunc = this["eval"](unevaluatedFunc, env);
      unevaluatedArgs = lispObj.rest;
      if (evaluatedFunc === null) {
        throw "Funktion '" + unevaluatedFunc.characters + "' ist nicht definiert!";
      }
      if (evaluatedFunc.isLispBuiltInFunction) {
        return evaluatedFunc.action(unevaluatedArgs, env);
      } else if (evaluatedFunc.isUserDefinedFunction) {
        return this.evalUserDefinedFunction(evaluatedFunc, unevaluatedArgs, env);
      }
      return new LispNil();
    };

    LispEvaluator.evalUserDefinedFunction = function(func, unevaluatedArgs, env) {
      var bodyList, evaluatedArg, formalArgs, lastResult, nameOfFormalArg, newEnv, unevaluatedArg;
      formalArgs = func.args;
      newEnv = new LispEnvironment(func.env);
      unevaluatedArgs = unevaluatedArgs || new LispList();
      while (!formalArgs.isLispNil) {
        nameOfFormalArg = formalArgs.first;
        unevaluatedArg = unevaluatedArgs.first;
        evaluatedArg = this["eval"](unevaluatedArg, env);
        newEnv.addBindingFor(nameOfFormalArg, evaluatedArg);
        formalArgs = formalArgs.rest;
        unevaluatedArgs = unevaluatedArgs.rest;
      }
      bodyList = func.bodyList;
      lastResult = new LispNil();
      while (!bodyList.isLispNil) {
        lastResult = this["eval"](bodyList.first, newEnv);
        bodyList = bodyList.rest;
      }
      return lastResult;
    };

    LispEvaluator.defineBuiltInFunctions = function() {
      var builtIns, className, key, klass, symbol, _results;
      builtIns = {
        "+": "Plus",
        "-": "Minus",
        "*": "Multiply",
        "/": "Divide",
        "define": "Define",
        "set!": "Set",
        "let": "Let",
        "lambda": "Lambda",
        "set-bytecode!": "SetBytecode",
        "set-literals!": "SetLiterals",
        "get-body": "GetBody",
        "get-argList": "GetArgList",
        "begin": "Begin",
        "if": "If",
        "eq?": "Eq",
        "cons?": "IsCons",
        "symbol?": "IsSymbol",
        "number?": "IsNumber",
        "and": "And",
        "or": "Or",
        "not": "Not",
        "cons": "Cons",
        "first": "First",
        "rest": "Rest",
        "second": "Second",
        "third": "Third",
        "reverse": "Reverse",
        "quote": "Quote",
        "error": "Error",
        "print": "Print"
      };
      _results = [];
      for (symbol in builtIns) {
        className = builtIns[symbol];
        klass = "LispBuiltIn" + className + "Function";
        key = new LispSymbol(symbol);
        _results.push(this.env.addBindingFor(key, new self[klass]()));
      }
      return _results;
    };

    return LispEvaluator;

  })();

  root.LispEvaluator = LispEvaluator;

}).call(this);
