(function() {
  var LispBuiltInBeginFunction, LispBuiltInConsFunction, LispBuiltInDefineFunction, LispBuiltInDivideFunction, LispBuiltInEqFunction, LispBuiltInFirstFunction, LispBuiltInFunction, LispBuiltInIfFunction, LispBuiltInLambdaFunction, LispBuiltInMinusFunction, LispBuiltInMultiplyFunction, LispBuiltInPlusFunction, LispBuiltInQuoteFunction, LispBuiltInRestFunction, LispBuiltInSetFunction, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  LispBuiltInFunction = (function(_super) {

    __extends(LispBuiltInFunction, _super);

    LispBuiltInFunction.name = 'LispBuiltInFunction';

    function LispBuiltInFunction() {
      return LispBuiltInFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInFunction.prototype.isLispBuiltInFunction = true;

    LispBuiltInFunction.prototype.action = function() {};

    LispBuiltInFunction.prototype.toString = function() {
      return "((Builtin Function))";
    };

    return LispBuiltInFunction;

  })(LispAtom);

  root.LispBuiltInFunction = LispBuiltInFunction;

  LispBuiltInPlusFunction = (function(_super) {

    __extends(LispBuiltInPlusFunction, _super);

    LispBuiltInPlusFunction.name = 'LispBuiltInPlusFunction';

    function LispBuiltInPlusFunction() {
      return LispBuiltInPlusFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInPlusFunction.prototype.action = function(args, env) {
      var arg;
      arg = LispEvaluator["eval"](args.first, env);
      if (arg && !args.rest.isLispNil) {
        return new LispInteger(arg + (this.action(args.rest, env)).value);
      } else if (arg) {
        return new LispInteger(arg);
      } else {
        return new LispInteger(0);
      }
    };

    return LispBuiltInPlusFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInPlusFunction = LispBuiltInPlusFunction;

  LispBuiltInMinusFunction = (function(_super) {

    __extends(LispBuiltInMinusFunction, _super);

    LispBuiltInMinusFunction.name = 'LispBuiltInMinusFunction';

    function LispBuiltInMinusFunction() {
      return LispBuiltInMinusFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInMinusFunction.prototype.action = function(args, env) {
      var arg;
      arg = LispEvaluator["eval"](args.first, env);
      if (arg && !args.rest.isLispNil) {
        return new LispInteger(arg - (this.action(args.rest, env)).value);
      } else if (arg) {
        return new LispInteger(arg);
      } else {
        return new LispInteger(0);
      }
    };

    return LispBuiltInMinusFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInMinusFunction = LispBuiltInMinusFunction;

  LispBuiltInMultiplyFunction = (function(_super) {

    __extends(LispBuiltInMultiplyFunction, _super);

    LispBuiltInMultiplyFunction.name = 'LispBuiltInMultiplyFunction';

    function LispBuiltInMultiplyFunction() {
      return LispBuiltInMultiplyFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInMultiplyFunction.prototype.action = function(args, env) {
      var arg;
      arg = LispEvaluator["eval"](args.first, env);
      if (arg && !args.rest.isLispNil) {
        return new LispInteger(arg * (this.action(args.rest, env)).value);
      } else if (arg) {
        return new LispInteger(arg);
      } else {
        return new LispInteger(0);
      }
    };

    return LispBuiltInMultiplyFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInMultiplyFunction = LispBuiltInMultiplyFunction;

  LispBuiltInDivideFunction = (function(_super) {

    __extends(LispBuiltInDivideFunction, _super);

    LispBuiltInDivideFunction.name = 'LispBuiltInDivideFunction';

    function LispBuiltInDivideFunction() {
      return LispBuiltInDivideFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInDivideFunction.prototype.action = function(args, env) {
      var arg;
      arg = LispEvaluator["eval"](args.first, env);
      if (arg && !args.rest.isLispNil) {
        return new LispInteger(arg / (this.action(args.rest, env)).value);
      } else if (arg) {
        return new LispInteger(arg);
      } else {
        return new LispInteger(0);
      }
    };

    return LispBuiltInDivideFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInDivideFunction = LispBuiltInDivideFunction;

  LispBuiltInDefineFunction = (function(_super) {

    __extends(LispBuiltInDefineFunction, _super);

    LispBuiltInDefineFunction.name = 'LispBuiltInDefineFunction';

    function LispBuiltInDefineFunction() {
      return LispBuiltInDefineFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInDefineFunction.prototype.action = function(args, env) {
      var bodyList, definedBinding, func, funcName, unevaluatedArgs, value, varNameOrFunc;
      varNameOrFunc = args.first;
      if (varNameOrFunc.isLispSymbol) {
        definedBinding = env.getBindingFor(varNameOrFunc);
        if (!definedBinding.isLispNil) {
          return definedBinding;
        }
        value = LispEvaluator["eval"](args.rest.first, env);
        env.addBindingFor(varNameOrFunc, value);
        return value;
      } else if (varNameOrFunc.isLispList) {
        funcName = varNameOrFunc.first;
        unevaluatedArgs = varNameOrFunc.rest;
        bodyList = args.rest;
        func = new LispUserDefinedFunction(unevaluatedArgs, bodyList, env);
        env.addBindingFor(funcName, func);
        return func;
      }
      return new LispNil();
    };

    return LispBuiltInDefineFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInDefineFunction = LispBuiltInDefineFunction;

  LispBuiltInSetFunction = (function(_super) {

    __extends(LispBuiltInSetFunction, _super);

    LispBuiltInSetFunction.name = 'LispBuiltInSetFunction';

    function LispBuiltInSetFunction() {
      return LispBuiltInSetFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInSetFunction.prototype.action = function(args, env) {
      var definedBinding, value, varName;
      varName = args.first;
      value = LispEvaluator["eval"](args.rest.first, env);
      if (varName.isLispSymbol) {
        definedBinding = env.getBindingFor(varName);
        if (definedBinding.isLispNil) {
          throw "" + varName + " is not defined and cannot be set to " + value;
        }
        env.changeBindingFor(varName, value);
        return value;
      }
      return new LispNil();
    };

    return LispBuiltInSetFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInSetFunction = LispBuiltInSetFunction;

  LispBuiltInLambdaFunction = (function(_super) {

    __extends(LispBuiltInLambdaFunction, _super);

    LispBuiltInLambdaFunction.name = 'LispBuiltInLambdaFunction';

    function LispBuiltInLambdaFunction() {
      return LispBuiltInLambdaFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInLambdaFunction.prototype.action = function(args, env) {
      var body, unevaluatedArgs;
      unevaluatedArgs = args.first;
      body = args.rest.first;
      return new LispUserDefinedFunction(unevaluatedArgs, body, env);
    };

    return LispBuiltInLambdaFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInLambdaFunction = LispBuiltInLambdaFunction;

  LispBuiltInBeginFunction = (function(_super) {

    __extends(LispBuiltInBeginFunction, _super);

    LispBuiltInBeginFunction.name = 'LispBuiltInBeginFunction';

    function LispBuiltInBeginFunction() {
      return LispBuiltInBeginFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInBeginFunction.prototype.action = function(args, env) {
      var restList, result;
      restList = args;
      while (!restList.isLispNil) {
        result = LispEvaluator["eval"](restList.first, env);
        restList = restList.rest;
      }
      return result;
    };

    return LispBuiltInBeginFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInBeginFunction = LispBuiltInBeginFunction;

  LispBuiltInIfFunction = (function(_super) {

    __extends(LispBuiltInIfFunction, _super);

    LispBuiltInIfFunction.name = 'LispBuiltInIfFunction';

    function LispBuiltInIfFunction() {
      return LispBuiltInIfFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInIfFunction.prototype.action = function(args, env) {
      var cond, unevaluatedCond, unevaluatedElseBody, unevaluatedIfBody;
      unevaluatedCond = args.first;
      unevaluatedIfBody = args.second();
      unevaluatedElseBody = args.third();
      cond = LispEvaluator["eval"](unevaluatedCond, env);
      if (cond && cond.isLispTrue) {
        return LispEvaluator["eval"](unevaluatedIfBody, env);
      } else {
        return LispEvaluator["eval"](unevaluatedElseBody, env);
      }
    };

    return LispBuiltInIfFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInIfFunction = LispBuiltInIfFunction;

  LispBuiltInEqFunction = (function(_super) {

    __extends(LispBuiltInEqFunction, _super);

    LispBuiltInEqFunction.name = 'LispBuiltInEqFunction';

    function LispBuiltInEqFunction() {
      return LispBuiltInEqFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInEqFunction.prototype.action = function(args, env) {
      var A, B, comp, unevaluatedA, unevaluatedB;
      unevaluatedA = args.first;
      unevaluatedB = args.second();
      A = LispEvaluator["eval"](unevaluatedA, env);
      B = LispEvaluator["eval"](unevaluatedB, env);
      comp = function(a, b) {
        if (a.isLispSymbol && b.isLispSymbol) {
          return a.characters === b.characters;
        } else if (a.isLispAtom && b.isLispAtom) {
          return a.value === b.value;
        } else if (a.isLispList && b.isLispList) {
          return comp(a.first, b.first) && comp(a.rest, b.rest);
        } else {
          return a === b;
        }
      };
      return comp(A, B);
    };

    return LispBuiltInEqFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInEqFunction = LispBuiltInEqFunction;

  LispBuiltInConsFunction = (function(_super) {

    __extends(LispBuiltInConsFunction, _super);

    LispBuiltInConsFunction.name = 'LispBuiltInConsFunction';

    function LispBuiltInConsFunction() {
      return LispBuiltInConsFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInConsFunction.prototype.action = function(args, env) {
      var unevaluatedFirst, unevaluatedSecond;
      unevaluatedFirst = args.first;
      unevaluatedSecond = args.second();
      return new LispList(LispEvaluator["eval"](unevaluatedFirst, env), LispEvaluator["eval"](unevaluatedSecond, env));
    };

    return LispBuiltInConsFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInConsFunction = LispBuiltInConsFunction;

  LispBuiltInFirstFunction = (function(_super) {

    __extends(LispBuiltInFirstFunction, _super);

    LispBuiltInFirstFunction.name = 'LispBuiltInFirstFunction';

    function LispBuiltInFirstFunction() {
      return LispBuiltInFirstFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInFirstFunction.prototype.action = function(args, env) {
      var list;
      list = LispEvaluator["eval"](args.first, env);
      return list.first;
    };

    return LispBuiltInFirstFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInFirstFunction = LispBuiltInFirstFunction;

  LispBuiltInRestFunction = (function(_super) {

    __extends(LispBuiltInRestFunction, _super);

    LispBuiltInRestFunction.name = 'LispBuiltInRestFunction';

    function LispBuiltInRestFunction() {
      return LispBuiltInRestFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInRestFunction.prototype.action = function(args, env) {
      var list;
      list = LispEvaluator["eval"](args.first, env);
      return list.rest;
    };

    return LispBuiltInRestFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInRestFunction = LispBuiltInRestFunction;

  LispBuiltInQuoteFunction = (function(_super) {

    __extends(LispBuiltInQuoteFunction, _super);

    LispBuiltInQuoteFunction.name = 'LispBuiltInQuoteFunction';

    function LispBuiltInQuoteFunction() {
      return LispBuiltInQuoteFunction.__super__.constructor.apply(this, arguments);
    }

    LispBuiltInQuoteFunction.prototype.action = function(args, env) {
      return args.first;
    };

    return LispBuiltInQuoteFunction;

  })(LispBuiltInFunction);

  root.LispBuiltInQuoteFunction = LispBuiltInQuoteFunction;

}).call(this);
