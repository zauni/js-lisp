(function() {
  var StringParser;

  StringParser = (function() {

    function StringParser(text) {
      if (typeof text !== "string") {
        throw "StringParser expected String but got " + (typeof text);
      }
      if (text.length === 0) {
        throw "StringParser expected a non-empty String";
      }
      this.text = text.replace(/\r\n/g, "\n");
      this.currentIndex = 0;
    }

    StringParser.prototype.peek = function() {
      return this.text.charAt(this.currentIndex);
    };

    StringParser.prototype.next = function() {
      var character;
      character = this.text.charAt(this.currentIndex);
      if (!this.atEnd()) {
        this.currentIndex++;
      }
      return character;
    };

    StringParser.prototype.atEnd = function() {
      return this.currentIndex === this.text.length;
    };

    StringParser.prototype.skip = function(regex) {
      var character, _results;
      character = this.peek();
      _results = [];
      while (regex.test(character)) {
        this.next();
        _results.push(character = this.peek());
      }
      return _results;
    };

    return StringParser;

  })();

  (typeof exports !== "undefined" && exports !== null ? exports : this).StringParser = StringParser;

}).call(this);
