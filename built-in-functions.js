(function() {
  var LispAtom, LispBuiltInFunction, LispByteCodeAssembler, LispEnvironment, LispEvaluator, LispFalse, LispInteger, LispList, LispNil, LispObject, LispString, LispSymbol, LispTrue, LispUserDefinedFunction, action, builtIns, className, isNode, root, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  isNode = false;

  if (typeof exports !== "undefined" && exports !== null) {
    _ref = require("./lisp-objects.js"), LispObject = _ref.LispObject, LispAtom = _ref.LispAtom, LispInteger = _ref.LispInteger, LispString = _ref.LispString, LispSymbol = _ref.LispSymbol, LispList = _ref.LispList, LispNil = _ref.LispNil, LispTrue = _ref.LispTrue, LispFalse = _ref.LispFalse, LispUserDefinedFunction = _ref.LispUserDefinedFunction, LispByteCodeAssembler = _ref.LispByteCodeAssembler;
    isNode = true;
  } else {
    LispObject = root.LispObject, LispAtom = root.LispAtom, LispInteger = root.LispInteger, LispString = root.LispString, LispSymbol = root.LispSymbol, LispList = root.LispList, LispNil = root.LispNil, LispTrue = root.LispTrue, LispFalse = root.LispFalse, LispUserDefinedFunction = root.LispUserDefinedFunction, LispByteCodeAssembler = root.LispByteCodeAssembler;
  }

  LispEvaluator = null;

  LispEnvironment = (function() {

    function LispEnvironment(parentEnv) {
      this.localBindings = [];
      this.parentEnv = parentEnv || null;
    }

    LispEnvironment.prototype.getBindingFor = function(symbol) {
      var binding, ret, _i, _len, _ref1;
      _ref1 = this.localBindings;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        if (binding.key.equals(symbol)) {
          ret = binding;
        }
      }
      if (!ret && this.parentEnv) {
        return this.parentEnv.getBindingFor(symbol);
      }
      if (ret && ret.value) {
        return ret.value;
      } else {
        return new LispNil();
      }
    };

    LispEnvironment.prototype.addBindingFor = function(symbol, lispObject) {
      return this.localBindings.push({
        key: symbol,
        value: lispObject
      });
    };

    LispEnvironment.prototype.changeBindingFor = function(symbol, lispObject) {
      var binding, _i, _len, _ref1;
      _ref1 = this.localBindings;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        if (binding.key.equals(symbol)) {
          binding.value = lispObject;
          return;
        }
      }
    };

    return LispEnvironment;

  })();

  root.LispEnvironment = LispEnvironment;

  LispBuiltInFunction = (function(_super) {

    __extends(LispBuiltInFunction, _super);

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

  builtIns = {
    "Plus": function(args, env) {
      var arg;
      arg = LispEvaluator["eval"](args.first, env);
      if (arg && !args.rest.isLispNil) {
        return new LispInteger(arg.value + (this.action(args.rest, env)).value);
      } else if (arg) {
        return new LispInteger(arg.value);
      } else {
        return new LispInteger(0);
      }
    },
    "Minus": function(args, env) {
      var arg;
      arg = LispEvaluator["eval"](args.first, env);
      if (arg && !args.rest.isLispNil) {
        return new LispInteger(arg.value - (this.action(args.rest, env)).value);
      } else if (arg) {
        return new LispInteger(arg.value);
      } else {
        return new LispInteger(0);
      }
    },
    "Multiply": function(args, env) {
      var arg;
      arg = LispEvaluator["eval"](args.first, env);
      if (arg && !args.rest.isLispNil) {
        return new LispInteger(arg.value * (this.action(args.rest, env)).value);
      } else if (arg) {
        return new LispInteger(arg.value);
      } else {
        return new LispInteger(0);
      }
    },
    "Divide": function(args, env) {
      var arg;
      arg = LispEvaluator["eval"](args.first, env);
      if (arg && !args.rest.isLispNil) {
        return new LispInteger(arg.value / (this.action(args.rest, env)).value);
      } else if (arg) {
        return new LispInteger(arg.value);
      } else {
        return new LispInteger(0);
      }
    },
    "Define": function(args, env) {
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
    },
    "Set": function(args, env) {
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
    },
    "Let": function(args, env) {
      var bodies, currentPair, evaluate, key, keyValueList, tempEnv, value;
      keyValueList = args.first;
      currentPair = keyValueList.first;
      bodies = args.rest;
      tempEnv = new LispEnvironment(env);
      while (!keyValueList.isLispNil) {
        key = currentPair.first;
        value = currentPair.second();
        evaluate = new LispList(new LispSymbol("define"), new LispList(key, new LispList(value, new LispNil())));
        LispEvaluator["eval"](evaluate, tempEnv);
        keyValueList = keyValueList.rest;
        currentPair = keyValueList.first;
      }
      evaluate = new LispList(new LispSymbol("begin"), bodies);
      return LispEvaluator["eval"](evaluate, tempEnv);
    },
    "Lambda": function(args, env) {
      var bodyList, unevaluatedArgs;
      unevaluatedArgs = args.first;
      bodyList = args.rest;
      return new LispUserDefinedFunction(unevaluatedArgs, bodyList, env);
    },
    "Begin": function(args, env) {
      var restList, result;
      result = new LispNil();
      restList = args;
      while (!restList.isLispNil) {
        result = LispEvaluator["eval"](restList.first, env);
        restList = restList.rest;
      }
      return result;
    },
    "If": function(args, env) {
      var cond, unevaluatedCond, unevaluatedElseBody, unevaluatedIfBody;
      unevaluatedCond = args.first;
      unevaluatedIfBody = args.second();
      unevaluatedElseBody = args.third();
      cond = LispEvaluator["eval"](unevaluatedCond, env);
      if (cond != null ? cond.isLispTrue : void 0) {
        return LispEvaluator["eval"](unevaluatedIfBody, env);
      } else {
        return LispEvaluator["eval"](unevaluatedElseBody, env);
      }
    },
    "Eq": function(args, env) {
      var A, B, comp, unevaluatedA, unevaluatedB;
      unevaluatedA = args.first;
      unevaluatedB = args.second();
      A = LispEvaluator["eval"](unevaluatedA, env);
      B = LispEvaluator["eval"](unevaluatedB, env);
      comp = function(a, b) {
        if ((a.isLispSymbol && b.isLispSymbol) || (a.isLispString && b.isLispString)) {
          return a.characters === b.characters;
        } else if (a.isLispAtom && b.isLispAtom) {
          return a.value === b.value;
        } else if (a.isLispList && b.isLispList) {
          return comp(a.first, b.first) && comp(a.rest, b.rest);
        } else {
          return a === b;
        }
      };
      return (comp(A, B) ? new LispTrue() : new LispFalse());
    },
    "And": function(args, env) {
      var condA, condB, unevaluatedCondA, unevaluatedCondB;
      unevaluatedCondA = args.first;
      unevaluatedCondB = args.second();
      condA = LispEvaluator["eval"](unevaluatedCondA, env);
      condB = LispEvaluator["eval"](unevaluatedCondB, env);
      if ((condA != null ? condA.isLispTrue : void 0) && (condB != null ? condB.isLispTrue : void 0)) {
        return new LispTrue();
      }
      return new LispFalse();
    },
    "Or": function(args, env) {
      var condA, condB, unevaluatedCondA, unevaluatedCondB;
      unevaluatedCondA = args.first;
      unevaluatedCondB = args.second();
      condA = LispEvaluator["eval"](unevaluatedCondA, env);
      condB = LispEvaluator["eval"](unevaluatedCondB, env);
      if ((condA != null ? condA.isLispTrue : void 0) || (condB != null ? condB.isLispTrue : void 0)) {
        return new LispTrue();
      }
      return new LispFalse();
    },
    "Not": function(args, env) {
      var cond, unevaluatedCond;
      unevaluatedCond = args.first;
      cond = LispEvaluator["eval"](unevaluatedCond, env);
      if (cond != null ? cond.isLispTrue : void 0) {
        return new LispFalse();
      }
      return new LispTrue();
    },
    "Cons": function(args, env) {
      var unevaluatedFirst, unevaluatedSecond;
      unevaluatedFirst = args.first;
      unevaluatedSecond = args.second();
      return new LispList(LispEvaluator["eval"](unevaluatedFirst, env), LispEvaluator["eval"](unevaluatedSecond, env));
    },
    "First": function(args, env) {
      var list;
      list = LispEvaluator["eval"](args.first, env);
      return list.first;
    },
    "Rest": function(args, env) {
      var list;
      list = LispEvaluator["eval"](args.first, env);
      return list.rest;
    },
    "Quote": function(args, env) {
      return args.first;
    },
    "Error": function(args, env) {
      var msg;
      msg = LispEvaluator["eval"](args.first, env);
      throw "" + msg.characters;
    }
  };

  for (className in builtIns) {
    action = builtIns[className];
    root["LispBuiltIn" + className + "Function"] = (function(_super) {

      __extends(_Class, _super);

      function _Class() {
        return _Class.__super__.constructor.apply(this, arguments);
      }

      _Class.prototype.action = (function(className, action) {
        return function() {
          if (!LispEvaluator) {
            if (isNode) {
              LispEvaluator = require("./lispevaluator.js").LispEvaluator;
            }
            if (!isNode) {
              LispEvaluator = root.LispEvaluator;
            }
          }
          return action.apply(this, arguments);
        };
      })(className, action);

      return _Class;

    })(LispBuiltInFunction);
  }

}).call(this);
