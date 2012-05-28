(function() {
  var LispAtom, LispByteCodeAssembler, LispFalse, LispInteger, LispList, LispNil, LispObject, LispString, LispSymbol, LispTrue, LispUserDefinedFunction, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  LispObject = (function() {

    LispObject.name = 'LispObject';

    function LispObject() {}

    LispObject.prototype.isLispAtom = false;

    LispObject.prototype.isLispInteger = false;

    LispObject.prototype.isLispString = false;

    LispObject.prototype.isLispSymbol = false;

    LispObject.prototype.isLispList = false;

    LispObject.prototype.isLispNil = false;

    LispObject.prototype.isLispTrue = false;

    LispObject.prototype.isLispFalse = false;

    LispObject.prototype.isLispBuiltInFunction = false;

    LispObject.prototype.isUserDefinedFunction = false;

    return LispObject;

  })();

  LispObject.extend = extend;

  root.LispObject = LispObject;

  LispAtom = (function(_super) {

    __extends(LispAtom, _super);

    LispAtom.name = 'LispAtom';

    function LispAtom() {
      return LispAtom.__super__.constructor.apply(this, arguments);
    }

    LispAtom.prototype.isLispAtom = true;

    return LispAtom;

  })(LispObject);

  root.LispAtom = LispAtom;

  LispInteger = (function(_super) {

    __extends(LispInteger, _super);

    LispInteger.name = 'LispInteger';

    function LispInteger(value) {
      this.value = value;
    }

    LispInteger.prototype.value = 0;

    LispInteger.prototype.isLispInteger = true;

    LispInteger.prototype.toString = function() {
      return this.value;
    };

    return LispInteger;

  })(LispAtom);

  root.LispInteger = LispInteger;

  LispString = (function(_super) {

    __extends(LispString, _super);

    LispString.name = 'LispString';

    function LispString(characters) {
      this.characters = characters;
    }

    LispString.prototype.characters = "";

    LispString.prototype.isLispString = true;

    LispString.prototype.toString = function() {
      return "\"" + this.characters + "\"";
    };

    return LispString;

  })(LispAtom);

  root.LispString = LispString;

  LispSymbol = (function(_super) {

    __extends(LispSymbol, _super);

    LispSymbol.name = 'LispSymbol';

    function LispSymbol(characters) {
      this.characters = characters;
    }

    LispSymbol.prototype.characters = "";

    LispSymbol.prototype.isLispSymbol = true;

    LispSymbol.prototype.equals = function(otherSymbol) {
      return this.characters === otherSymbol.characters;
    };

    LispSymbol.prototype.toString = function() {
      return this.characters;
    };

    return LispSymbol;

  })(LispAtom);

  root.LispSymbol = LispSymbol;

  LispList = (function(_super) {

    __extends(LispList, _super);

    LispList.name = 'LispList';

    function LispList(first, rest) {
      this.first = first;
      this.rest = rest;
    }

    LispList.prototype.first = null;

    LispList.prototype.rest = null;

    LispList.prototype.isLispList = true;

    LispList.prototype.second = function() {
      if (this.rest && this.rest.isLispList) {
        return this.rest.first;
      } else {
        return new LispNil();
      }
    };

    LispList.prototype.third = function() {
      if (this.rest && this.rest.rest && this.rest.rest.isLispList) {
        return this.rest.rest.first;
      } else {
        return new LispNil();
      }
    };

    LispList.prototype.toString = function() {
      return "(" + (this.first.toString()) + " " + (this.rest.toString()) + ")";
    };

    return LispList;

  })(LispObject);

  root.LispList = LispList;

  LispNil = (function(_super) {

    __extends(LispNil, _super);

    LispNil.name = 'LispNil';

    function LispNil() {
      return LispNil.__super__.constructor.apply(this, arguments);
    }

    LispNil.prototype.value = null;

    LispNil.prototype.isLispNil = true;

    LispNil.prototype.toString = function() {
      return "nil";
    };

    return LispNil;

  })(LispAtom);

  root.LispNil = LispNil;

  LispTrue = (function(_super) {

    __extends(LispTrue, _super);

    LispTrue.name = 'LispTrue';

    function LispTrue() {
      return LispTrue.__super__.constructor.apply(this, arguments);
    }

    LispTrue.prototype.value = true;

    LispTrue.prototype.isLispTrue = true;

    LispTrue.prototype.toString = function() {
      return "true";
    };

    return LispTrue;

  })(LispAtom);

  root.LispTrue = LispTrue;

  LispFalse = (function(_super) {

    __extends(LispFalse, _super);

    LispFalse.name = 'LispFalse';

    function LispFalse() {
      return LispFalse.__super__.constructor.apply(this, arguments);
    }

    LispFalse.prototype.value = false;

    LispFalse.prototype.isLispFalse = true;

    LispFalse.prototype.toString = function() {
      return "false";
    };

    return LispFalse;

  })(LispAtom);

  root.LispFalse = LispFalse;

  LispUserDefinedFunction = (function(_super) {

    __extends(LispUserDefinedFunction, _super);

    LispUserDefinedFunction.name = 'LispUserDefinedFunction';

    function LispUserDefinedFunction(args, bodyList, env) {
      this.args = args;
      this.env = env;
      this.bodyList = new LispList(new LispSymbol("begin"), bodyList);
    }

    LispUserDefinedFunction.prototype.isUserDefinedFunction = true;

    LispUserDefinedFunction.prototype.args = null;

    LispUserDefinedFunction.prototype.bodyList = null;

    LispUserDefinedFunction.prototype.env = null;

    LispUserDefinedFunction.prototype.toString = function() {
      return "((User Defined Function))";
    };

    LispUserDefinedFunction.prototype.byteCode = null;

    LispUserDefinedFunction.prototype.literals = null;

    return LispUserDefinedFunction;

  })(LispAtom);

  root.LispUserDefinedFunction = LispUserDefinedFunction;

  LispByteCodeAssembler = (function() {

    LispByteCodeAssembler.name = 'LispByteCodeAssembler';

    function LispByteCodeAssembler() {}

    LispByteCodeAssembler.prototype.assemble = function() {};

    return LispByteCodeAssembler;

  })();

}).call(this);
