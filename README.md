# Eine LISP Implementation in JavaScript, bzw. CoffeeScript.

# Dokumentation der LISP Sprache
*JS-LISP - Projekt für die Vorlesung "Programmiersprachen"*  
Dieses Lisp unterstützt die meisten Features eines "richtigen" Lisp. Darunter zählen auch Closures und anonyme Funktionen.

Außerdem hat es einen komfortablen Editor, der die Klammern automatisch vervollständigt und Syntaxhighlighting bietet. Möchte man nicht im Browser arbeiten, kann man auch eine REPL in der Kommandozeile starten. Diese wird von Node bereitgestellt und hat Features, die in der offiziellen Dokumentation beschrieben werden: [Node REPL Dokumentation](http://nodejs.org/api/repl.html#repl_repl_features). Beispielsweise kann hier die aktuelle REPL Session in einer Datei gespeichert oder von einer Datei geladen werden.


### Inhaltsverzeichnis
1. Installation
2. Beispiele
3. Datentypen
4. Built-In Funktionen
5. Bekannte Probleme
6. Kompatibilität
7. Todo / Pläne

---

# Installation

## Nutzung im Browser
Um den Editor im Browser zu nutzen, muss nichts installiert werden. Dazu reicht, die index.html im root Verzeichnis aufzurufen.

## Nutzung in der Node REPL
Dazu muss zuerst Node in einer 0.8.x Version installiert werden. Diese kann von der [offiziellen Homepage](http://nodejs.org/ "Node installieren") heruntergeladen und installiert werden.  
Anschließend navigiert man in einer Kommandozeile zum Lisp Ordner und gibt folgendes Kommando ein: **`node main.js`**. Damit öffnet sich die REPL und man kann Lisp Code eintippen.


# Beispiele

## Länge einer Liste

```
(define (length list)
    (let ((erg 0))
        (if (cons? list)
            (begin
                (set! erg (+ erg 1))
                (+ erg (length (rest list)))
            )
            ; else
            erg
        )
    )
)

(length '( 1 2 3 )) ; -> 3
```


# Datentypen

* Strings: `"Hallo Welt"`
* Zahlen: `1` `289`
* `nil` (steht für keinen Wert), `true` (für "wahr") und `false` (für nicht "wahr")
* Symbole: `sym`
* Listen: `(1 2)` `("hallo" (1 2))`
* Funktionen

Außerdem gibt es noch Kommentare, die mit einem `;` beginnen und die restliche Zeile auskommentieren.

# Built-In Funktionen

## Mathematische Funktionen
Es können beliebig viele Argumente an die Funktionen übergeben werden (allerdings ist die Operatorreihenfolge noch falsch bei - und /).

__+__ num1 num*  
`(+ 5 10 3) ; -> 18`  
__-__ num1 num*  
`(- 20 2) ; -> 18`  
__\*__ num1 num\*  
`(* 20 2) ; -> 40`  
__/__ num1 num*  
`(/ 18 6) ; -> 3`  

## Variablen Funktionen
__define__  
Erzeugt eine Variable im Environment   
`(define a "hello") ; -> a == "hello"`  

__set!__  
Ändert eine Variable im Environment   
`(set! a "servus") ; -> a == "servus"`  

__let__  
Erzeugt ein temporäres Environment und speichert dort Variablen. Anschließend werden alle Funktionsbodies in diesem Environment ausgewertet.  
`(let ((a 2)) (+ a 5)) ; -> 7`  

## Funktionen für Funktionen
__lambda__  
Erzeugt eine anonyme User-Defined-Function.  
`( (lambda (x) (* x x)) 5 ) ; -> 25`

__set-bytecode!__  
Setzt den Bytecode für die Funktion.  
`(set-bytecode! func "bytecode")`

__set-literals!__  
Setzt die Literale für die Funktion.  
`(set-literals! func "literale")`

__get-body__  
Gibt die Liste der Bodies einer Funktion zurück.  
`(get-body func)`

__get-argList__  
Gibt die Liste der Argumente einer Funktion zurück.  
`(get-argList func)`

__begin__  
Evaluiert alle Ausdrücke, gibt aber nur den letzten zurück  
`(begin
	(+ 1 1) (* 2 2)) ; -> 4`

## Bool'sche Funktionen
__if__  
Normale if Abfrage.  
`(if true "okay!" "nicht ganz...") ; -> "okay"`

__eq?__  
Abfrage auf Gleichheit. Versucht intelligent Datentypen-Unterschiede auszugleichen.  
`(if (eq? "hello" "world") "okay!" "nicht ganz...") ; -> "nicht ganz..."`

__cons?__  
Abfrage ob das Objekt eine Liste ist.  
`(cons? '(1 2 3)) ; -> true`

__symbol?__  
Abfrage ob das Objekt ein Symbol ist.  
`(symbol? 'a) ; -> true`

__number?__  
Abfrage ob das Objekt eine Zahl ist.  
`(number? 25) ; -> true`

__and__  
UND Verknüpfung  
`(if (and true false) "okay!" "nicht ganz...") ; -> "nicht ganz..."`

__or__  
ODER Verknüpfung  
`(if (or true false) "okay!" "nicht ganz...") ; -> "okay"`

__not__  
Umkehrung  
`(if (not true) "okay!" "nicht ganz...") ; -> "nicht ganz..."`


## Listen
__cons__  
Damit kann eine Liste erstellt werden.  
`(cons 1 2) ; -> (1 2)`

__first__  
Gibt das erste Element einer Liste zurück.  
`(first (cons 1 2)) ; -> 1`

__rest__  
Gibt das zweite Element einer Liste zurück.  
`(rest (cons 1 (cons 2 nil))) ; -> (2 nil)`

__second__  
Gibt das zweite Element in einer Listenreihe zurück.  
`(second (cons 1 (cons 2 nil))) ; -> 2`

__third__  
Gibt das dritte Element in einer Listenreihe zurück.  
`(third (cons 1 (cons 2 (cons 3 nil)))) ; -> 3`

__reverse__  
Kehrt die Reihenfolge der Listenelemente um.  
`(reverse '(1 2 3 4)) ; -> (4 3 2 1)`


## Sonstige
__quote__  
Gibt das folgende Symbol unevaluiert zurück.  
`(quote someVar) ; -> someVar`  
Das hat den selben Effekt, wie wenn man nur ein einfaches Anführungszeichen vor das Symbol setzt:  
`'someVar ; -> someVar`

__error__  
Erzeugt einen Fehler, damit dieser ausgegeben werden kann.  
`(error "Falscher Variablenname!") ; -> "Falscher Variablenname"`

__print__  
Gibt einen String aus.  
`(print "Hello World") ; -> "Hello World"`



# Bekannte Probleme

Der Bytecode Compiler aus [der Vorlesung](https://redmine.mi.hdm-stuttgart.de/attachments/download/3942/2012-05-10_bytecode-compiler.lsp.rkt) kann leider noch nicht genutzt werden. Allerdings wird der Code ohne Fehler zu werfen ausgeführt (nach kleineren Modifikationen). Der Bytecode wird trotzdem nicht korrekt ausgegeben...

# Kompatibilität
Getestet wurde JS-LISP in folgender Umgebung:

Windows 7, Firefox 14, Node v0.8.7

Allerdings sollte es in den folgenden Umgebungen ausführbar sein:

* Linux
* MacOSX
* Internet Explorer v8+
* Firefox, Chrome, Safari
* Node ab Version 0.8.x

# Todo / Pläne für die Zukunft:

- Schöneres Design für den Editor
- Bessere Syntax-Error Erkennung
- LispWorker für den ACE Editor bauen (damit Syntax-Errors auch im Editor erscheinen)
- Unit Tests
- noch mehr Dokumentation
- Canvas API in der LISP Sprache zur Verfügung stellen
- Autovervollständigen im ACE Editor
- Built-In Funktionen könnten auch durch externe Dateien nachgeladen werden
- Funktionen sollten die Länge ihrer Argumentliste und die Argumente validieren