(function() {
  var LispAtom, LispByteCodeAssembler, LispEnvironment, LispEvaluator, LispFalse, LispInteger, LispList, LispNil, LispObject, LispReader, LispString, LispSymbol, LispTrue, LispUserDefinedFunction, StringParser, isNode, repl, root, self, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  self = this;

  isNode = false;

  if (typeof exports !== "undefined" && exports !== null) {
    repl = require("repl");
    StringParser = require("./libs/stringparser.js").StringParser;
    _ref = require("./lisp-objects.js"), LispEnvironment = _ref.LispEnvironment, LispObject = _ref.LispObject, LispAtom = _ref.LispAtom, LispInteger = _ref.LispInteger, LispString = _ref.LispString, LispSymbol = _ref.LispSymbol, LispList = _ref.LispList, LispNil = _ref.LispNil, LispTrue = _ref.LispTrue, LispFalse = _ref.LispFalse, LispUserDefinedFunction = _ref.LispUserDefinedFunction, LispByteCodeAssembler = _ref.LispByteCodeAssembler;
    LispEvaluator = require("./lispevaluator.js").LispEvaluator;
    isNode = true;
  } else {
    StringParser = root.StringParser;
    LispEnvironment = root.LispEnvironment, LispObject = root.LispObject, LispAtom = root.LispAtom, LispInteger = root.LispInteger, LispString = root.LispString, LispSymbol = root.LispSymbol, LispList = root.LispList, LispNil = root.LispNil, LispTrue = root.LispTrue, LispFalse = root.LispFalse, LispUserDefinedFunction = root.LispUserDefinedFunction, LispByteCodeAssembler = root.LispByteCodeAssembler;
    LispEvaluator = root.LispEvaluator;
  }

  LispReader = (function() {

    function LispReader(editor) {
      this.readFromRepl = __bind(this.readFromRepl, this);

      this.read = __bind(this.read, this);
      LispEvaluator.defineBuiltInFunctions();
      if (isNode) {
        repl = require("repl");
        repl.start("LISP JS> ", null, this.readFromRepl);
      } else {
        this.inputField = {
          getValue: function() {
            return editor.getValue();
          },
          setValue: function(val) {
            return editor.setValue(val);
          }
        };
      }
    }

    LispReader.prototype.commentRegex = /^;/;

    LispReader.prototype.symbolRegex = /^[^\(\)\.\s'"]/;

    LispReader.prototype.integerRegex = /^\d/;

    LispReader.prototype.listRegex = /^\(/;

    LispReader.prototype.quoteRegex = /^'/;

    LispReader.prototype.stringRegex = /^"/;

    LispReader.prototype.seperators = /\s|\\n/;

    LispReader.prototype.reservedWords = /(nil|true|false)/;

    LispReader.prototype.reservedObjects = {
      "nil": "LispNil",
      "true": "LispTrue",
      "false": "LispFalse"
    };

    LispReader.prototype.input = null;

    LispReader.prototype.knownSymbols = {};

    LispReader.prototype.read = function(evt) {
      var erg, inputText;
      if (evt != null) {
        if (typeof evt.preventDefault === "function") {
          evt.preventDefault();
        }
      }
      inputText = this.inputField.getValue();
      this.input = new StringParser(inputText);
      try {
        erg = LispEvaluator["eval"](this.readObject());
      } catch (error) {
        if (typeof console !== "undefined" && console !== null) {
          if (typeof console.error === "function") {
            console.error(error);
          }
        }
        LispReader.print(error, inputText, true);
        this.inputField.setValue("");
      }
      LispReader.print(erg, inputText);
      return this.inputField.setValue("");
    };

    LispReader.prototype.readFromRepl = function(cmd) {
      var callback, erg;
      callback = arguments[arguments.length - 1];
      cmd = cmd.trim().replace(/^\(/, "").replace(/\)$/, "");
      this.input = new StringParser(cmd);
      try {
        erg = LispEvaluator["eval"](this.readObject());
        return callback(null, erg.toString());
      } catch (error) {
        erg = "Error: " + error;
        return callback(erg);
      }
    };

    LispReader.prototype.getBindingsData = function() {
      var binding, currentIndex, data, _i, _len, _ref1;
      data = [];
      currentIndex = 0;
      _ref1 = LispEvaluator.env.localBindings;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        binding = _ref1[_i];
        if (binding.value.isLispBuiltInFunction || binding.value.isUserDefinedFunction) {
          data[currentIndex] = ["(" + binding.key.characters, currentIndex + 1];
          currentIndex++;
        }
      }
      return data;
    };

    LispReader.prototype.readObject = function() {
      var current;
      this.input.skip(this.seperators);
      if (this.commentRegex.test(this.input.peek())) {
        current = this.input.peek();
        while (!this.input.atEnd() && !/\n/.test(current)) {
          this.input.next();
          current = this.input.peek();
        }
        this.input.skip(this.seperators);
        return this.readObject();
      } else if (this.integerRegex.test(this.input.peek())) {
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
      this.input.next();
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
        this.input.next();
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

    LispReader.print = function(lispObject, inputText, isError) {
      if (isError == null) {
        isError = false;
      }
      if (inputText) {
        $("#output").append("<li" + (isError ? " class='error'" : "") + "> &gt;&gt; " + inputText + "</li>");
      }
      return $("#output").append("<li" + (isError ? " class='error'" : "") + ">" + (lispObject.toString()) + "</li>");
    };

    return LispReader;

  })();

  root.LispReader = LispReader;

}).call(this);
