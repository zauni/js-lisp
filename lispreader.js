(function() {
  var LispEnvironment, LispEvaluator, LispReader, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  LispReader = (function() {

    LispReader.name = 'LispReader';

    function LispReader(frm) {
      _.bindAll(this, "read");
      LispEvaluator.defineBuiltInFunctions();
      $(frm).on("submit", this.read);
      this.inputField = $("#inputstream");
      this.activateAutocomplete();
    }

    LispReader.prototype.symbolRegex = /^[^\(\)\.\s'"]/;

    LispReader.prototype.integerRegex = /^\d/;

    LispReader.prototype.listRegex = /^\(/;

    LispReader.prototype.quoteRegex = /^'/;

    LispReader.prototype.stringRegex = /^"/;

    LispReader.prototype.seperators = /\s/;

    LispReader.prototype.reservedWords = /(nil|true|false)/;

    LispReader.prototype.reservedObjects = {
      nil: "LispNil",
      "true": "LispTrue",
      "false": "LispFalse"
    };

    LispReader.prototype.input = null;

    LispReader.prototype.knownSymbols = {};

    LispReader.prototype.read = function(evt) {
      var erg, inputText;
      if (evt != null) {
        evt.preventDefault();
      }
      inputText = this.inputField.val();
      this.input = new StringParser(inputText);
      try {
        erg = LispEvaluator["eval"](this.readObject());
      } catch (error) {
        this.print(error, inputText);
        this.inputField.val("");
        return;
      }
      this.print(erg, inputText);
      this.inputField.val("");
      return this.updateAutocompleteData();
    };

    LispReader.prototype.activateAutocomplete = function() {
      var self;
      self = this;
      return $("#inputstream").autocomplete({
        autoFill: true,
        delay: 0,
        minChars: 1,
        data: this.getBindingsData(),
        onFinish: function() {
          var autoCompleter, field, value;
          field = self.inputField;
          value = field.val();
          autoCompleter = field.data("autocompleter");
          field.val(value + ")");
          return autoCompleter.setCaret(value.length);
        }
      });
    };

    LispReader.prototype.getBindingsData = function() {
      var binding, currentIndex, data, _i, _len, _ref;
      data = [];
      currentIndex = 0;
      _ref = LispEvaluator.env.localBindings;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        if (binding.value.isLispBuiltInFunction || binding.value.isUserDefinedFunction) {
          data[currentIndex] = ["(" + binding.key.characters, currentIndex + 1];
          currentIndex++;
        }
      }
      return data;
    };

    LispReader.prototype.updateAutocompleteData = function() {
      var autoCompleter;
      autoCompleter = this.inputField.data("autocompleter");
      return autoCompleter.options.data = this.getBindingsData();
    };

    LispReader.prototype.readObject = function() {
      this.input.skip(this.seperators);
      if (this.integerRegex.test(this.input.peek())) {
        return this.readInteger();
      } else if (this.stringRegex.test(this.input.peek())) {
        return this.readString();
      } else if (this.symbolRegex.test(this.input.peek())) {
        return this.readSymbol();
      } else if (this.quoteRegex.test(this.input.peek())) {
        return this.readQuote();
      } else if (this.listRegex.test(this.input.peek())) {
        return this.readList();
      } else {
        return new LispNil();
      }
    };

    LispReader.prototype.readInteger = function() {
      var character;
      character = "";
      while (!this.input.atEnd() && this.integerRegex.test(this.input.peek())) {
        character += this.input.next();
      }
      return new LispInteger(parseInt(character, 10));
    };

    LispReader.prototype.readString = function() {
      var character;
      this.input.next();
      character = "";
      while (!(this.input.atEnd() || this.stringRegex.test(this.input.peek()))) {
        character += this.input.next();
      }
      return new LispString(character);
    };

    LispReader.prototype.readSymbol = function() {
      var character, reservedWord;
      character = "";
      while (!this.input.atEnd() && this.symbolRegex.test(this.input.peek())) {
        character += this.input.next();
      }
      if (reservedWord = character.match(this.reservedWords)) {
        return new window[this.reservedObjects[reservedWord[0]]]();
      }
      return new LispSymbol(character);
    };

    LispReader.prototype.readQuote = function() {
      var expr, restList;
      this.input.next();
      expr = this.readObject();
      restList = new LispList(expr, new LispNil());
      return new LispList(new LispSymbol("quote"), restList);
    };

    LispReader.prototype.readList = function() {
      var element;
      this.input.next();
      this.input.skip(this.seperators);
      if (this.input.peek() === ")") {
        return new LispNil();
      }
      element = this.readObject();
      this.input.skip(this.seperators);
      return new LispList(element, this.readListRest());
    };

    LispReader.prototype.readListRest = function() {
      var element;
      this.input.skip(this.seperators);
      if (this.input.peek() === ")") {
        this.input.next();
        return new LispNil();
      }
      element = this.readObject();
      this.input.skip(this.seperators);
      return new LispList(element, this.readListRest());
    };

    LispReader.prototype.print = function(lispObject, inputText) {
      return $("#output").append("<li> &gt;&gt; " + inputText + "</li><li>" + (lispObject.toString()) + "</li>");
    };

    return LispReader;

  })();

  root.LispReader = LispReader;

  LispEnvironment = (function() {

    LispEnvironment.name = 'LispEnvironment';

    function LispEnvironment(parentEnv) {
      this.localBindings = [];
      this.parentEnv = parentEnv || null;
    }

    LispEnvironment.prototype.getBindingFor = function(symbol) {
      var ret;
      ret = _(this.localBindings).find(function(binding) {
        return binding.key.equals(symbol);
      });
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
      var binding, _i, _len, _ref;
      _ref = this.localBindings;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        if (binding.key.equals(symbol)) {
          binding.value = lispObject;
          return;
        }
      }
    };

    return LispEnvironment;

  })();

  root.LispEnvironment = LispEnvironment;

  LispEvaluator = {
    env: new LispEnvironment(),
    "eval": function(lispObj, env) {
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
      if (evaluatedFunc.isLispBuiltInFunction) {
        return evaluatedFunc.action(unevaluatedArgs, env);
      } else {
        if (evaluatedFunc.isUserDefinedFunction) {
          return this.evalUserDefinedFunction(evaluatedFunc, unevaluatedArgs, env);
        }
      }
      return new LispNil();
    },
    evalUserDefinedFunction: function(func, unevaluatedArgs, env) {
      var evaluatedArg, formalArgs, nameOfFormalArg, newEnv, unevaluatedArg;
      formalArgs = func.args;
      newEnv = new LispEnvironment(func.env);
      unevaluatedArgs = unevaluatedArgs || new LispList();
      while (formalArgs && !formalArgs.isLispNil) {
        nameOfFormalArg = formalArgs.first;
        unevaluatedArg = unevaluatedArgs.first;
        evaluatedArg = LispEvaluator["eval"](unevaluatedArg, env);
        newEnv.addBindingFor(nameOfFormalArg, evaluatedArg);
        formalArgs = formalArgs.rest;
        unevaluatedArgs = unevaluatedArgs.rest;
      }
      return LispEvaluator["eval"](func.bodyList, newEnv);
    },
    defineBuiltInFunctions: function() {
      var _this = this;
      return _.each({
        "+": "Plus",
        "-": "Minus",
        "*": "Multiply",
        "/": "Divide",
        "define": "Define",
        "set!": "Set",
        "lambda": "Lambda",
        "begin": "Begin",
        "if": "If",
        "eq?": "Eq",
        "cons": "Cons",
        "first": "First",
        "rest": "Rest",
        "quote": "Quote"
      }, function(className, symbol) {
        var key, klass;
        klass = "LispBuiltIn" + className + "Function";
        key = new LispSymbol(symbol);
        return _this.env.addBindingFor(key, new window[klass]());
      });
    }
  };

  root.LispEvaluator = LispEvaluator;

}).call(this);
