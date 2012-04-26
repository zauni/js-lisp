/**
 * Kleiner LISP Interpreter
 */


/**
 * Liest die Eingabedaten und verwandelt sie in LISP Objekte
 */
var LispReader = function(frm) {
    _.bindAll(this, "read");
    
    $(frm).on("submit", this.read);
    
    this.inputField = $("#inputstream");
    
    LispEvaluator.defineBuiltInFunctions();
    
    this.activateAutocomplete();
};

_.extend(LispReader.prototype, {
    symbolRegex: /^[^\(\)\.\s]/,
    integerRegex: /^\d/,
    listRegex: /^\(/,
    seperators: /\s/,
    
    reservedWords: /(nil|true|false)/,
    reservedObjects: {
        "nil": "LispNil",
        "true": "LispTrue",
        "false": "LispFalse"
    },
    
    input: null,
    
    knownSymbols: {},
    
    read: function(evt) {
        evt && evt.preventDefault();
        
        var inputText = this.inputField.val();
        
        this.input = new StringParser(inputText);
        
        this.print(LispEvaluator.eval(this.readObject()), inputText);
        
        this.inputField.val("");
        
        this.updateAutocompleteData();
    },
    
    activateAutocomplete: function() {
        var self = this;
        
        $("#inputstream").autocomplete({
            autoFill: true,
            delay: 0,
            minChars: 1,
            data: this.getBindingsData(),
            onFinish: function() {
                var field = self.inputField,
                    value = field.val(),
                    autoCompleter = field.data("autocompleter");

                field.val(value + ")");
                autoCompleter.setCaret(value.length);
            }
        });
    },
    
    getBindingsData: function() {
        var data = [],
            currentIndex = 0;
        _(LispEvaluator.env.localBindings).each(function(binding) {
            if(binding.value.isLispBuiltInFunction || binding.value.isUserDefinedFunction) {
                data[currentIndex] = ["(" + binding.key.characters, currentIndex+1];
                currentIndex++;
            }
        });
        return data;
    },
    
    updateAutocompleteData: function() {
        var autoCompleter = this.inputField.data("autocompleter");
        
        autoCompleter.options.data = this.getBindingsData();
    },
    
    /**
     * Parsed die Eingabedaten
     * @return {mixed} LISP Objekt
     */
    readObject: function() {
        var ret;
            
        this.input.skip(this.seperators);
        
        // Integer
        if(this.integerRegex.test(this.input.peek())) {
            ret = this.readInteger();
        }
        // Symbol
        else if(this.symbolRegex.test(this.input.peek())) {
            ret = this.readSymbol();
        }
        // List
        else if(this.listRegex.test(this.input.peek())) {
            ret = this.readList();
        }
        else {
            ret = new LispNil();
        }
        return ret;
    },
    
    /**
     * Liest Integerzahlen
     * @return {LispInteger}
     */
    readInteger: function() {
        var integer = new LispInteger(),
            character = "";
            
        while(!this.input.atEnd() && this.integerRegex.test(this.input.peek())) {
            character += this.input.next();
        }
        integer.value = parseInt(character, 10);
        
        return integer;
    },
    
    /**
     * Liest Symbole
     * Falls reservierte Worte wie true/false/nil vorkommen, wird die entsprechende Instanz zurückgegeben
     * @return {Mixed}
     */
    readSymbol: function() {
        var symbol = new LispSymbol(),
            character = "",
            reservedWord;
            
        while(!this.input.atEnd() && this.symbolRegex.test(this.input.peek())) {
            character += this.input.next();
        }
        
        if(reservedWord = character.match(this.reservedWords)) {
            return new window[ this.reservedObjects[reservedWord[0]] ]();
        }
        
        symbol.characters = character;
        return symbol;
    },
    
    /**
     * Liest Listen
     * @return {LispList}
     */
    readList: function() {
        var element,
            list;
        
        this.input.next();
        
        this.input.skip(this.seperators);
        
        if(this.input.peek() == ")") {
            return new LispNil();
        }
        
        element = this.readObject();
        
        this.input.skip(this.seperators);
        
        list = new LispList();
        list.first = element;
        list.rest = this.readListRest();
        
        return list;
    },
    
    /**
     * Liest den Rest einer Liste
     * @return {LispList}
     */
    readListRest: function() {
        var element,
            list;
        
        this.input.skip(this.seperators);
        
        if(this.input.peek() == ")") {
            this.input.next();
            return new LispNil();
        }
        
        element = this.readObject();
        
        this.input.skip(this.seperators);
        
        list = new LispList();
        list.first = element;
        list.rest = this.readListRest();
        
        return list;
    },
    
    /**
     * Gibt das Ergebnis in einer Liste aus
     * @param {LispObject} lispObject
     * @param {String} inputText
     */
    print: function(lispObject, inputText) {
        $("#output").append(
            "<li> &gt;&gt; " + inputText + "</li>" +
            "<li>" + lispObject.toString() + "</li>"
        );
    }
});


/**
 * Environment für LISP
 */
var LispEnvironment = function(parentEnv) {
    this.localBindings = [];
    this.parentEnv = parentEnv || null;
};

_.extend(LispEnvironment.prototype, {
    /**
     * Gibt das LispObject an der Stelle des Symbols zurück
     * @param {LispSymbol} symbol "Key" in der Environment HashTable
     * @return {Mixed}
     */
    getBindingFor: function(symbol) {
        var ret = _(this.localBindings).find(function(binding) {
            return binding.key.equals(symbol);
        });
        if(!ret && this.parentEnv) {
            return this.parentEnv.getBindingFor(symbol);
        }
        return ret && ret.value ? ret.value : new LispNil();
    },
    
    /**
     * Fügt ein Binding ins Environment hinzu
     * @param {LispSymbol} symbol "Key" in der Environment HashTable
     * @param {LispObject} lispObject "Value" in der Environment HashTable
     */
    addBindingFor: function(symbol, lispObject) {
        this.localBindings.push({
            key: symbol,
            value: lispObject
        });
    }
});


/**
 * LispEvaluator um Lisp Objekte zu evaluieren
 */
LispEvaluator = {
    env: new LispEnvironment(),
    
    /**
     * Evaluiert ein gegebenes LispObject
     * @param {LispObject} lispObj Das zu evaluierende Object
     * @param {LispEnvironment} env Das Environment, in dem evaluiert wird
     * @return {Mixed}
     */
    eval: function(lispObj, env) {
        env = env || this.env;
        
        if(lispObj.isLispAtom) {
            if(lispObj.isLispSymbol) {
                return env.getBindingFor(lispObj);
            }
            return lispObj;
        }
        
        var unevaluatedFunc = lispObj.first,
            evaluatedFunc = this.eval(unevaluatedFunc, env),
            unevaluatedArgs = lispObj.rest;

        if(evaluatedFunc.isLispBuiltInFunction) {
            return evaluatedFunc.action(unevaluatedArgs, env);
        }
        else if(evaluatedFunc.isUserDefinedFunction) {
            return this.evalUserDefinedFunction(evaluatedFunc, unevaluatedArgs, env);
        }
        
        return new LispNil();
    },
    
    evalUserDefinedFunction: function(func, unevaluatedArgs, env) {
        var formalArgs = func.args,
            newEnv = new LispEnvironment(func.env),
            nameOfFormalArg, unevaluatedArg, evaluatedArg;
        
        unevaluatedArgs = unevaluatedArgs || new LispList();
        
        while(formalArgs && !formalArgs.isLispNil) {
            nameOfFormalArg = formalArgs.first;
            unevaluatedArg = unevaluatedArgs.first;

            evaluatedArg = LispEvaluator.eval(unevaluatedArg, env);
            newEnv.addBindingFor(nameOfFormalArg, evaluatedArg);

            formalArgs = formalArgs.rest;
            unevaluatedArgs = unevaluatedArgs.rest;
        }
        
        return LispEvaluator.eval(func.body, newEnv);
    },
    
    /**
     * Definiert alle im System vorhandenen "Built-In" Funktionen
     */
    defineBuiltInFunctions: function() {
        var plusSymbol = new LispSymbol();
        plusSymbol.characters = "+";
        this.env.addBindingFor(plusSymbol, new LispBuiltInPlusFunction());
        
        var defineSymbol = new LispSymbol();
        defineSymbol.characters = "define";
        this.env.addBindingFor(defineSymbol, new LispBuiltInDefineFunction());
        
        var lambdaSymbol = new LispSymbol();
        lambdaSymbol.characters = "lambda";
        this.env.addBindingFor(lambdaSymbol, new LispBuiltInLambdaFunction());
    }
};
