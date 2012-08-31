(define cdr rest)
(define car first)
(define integer? number?)

(define next-sequence-number 0)

(define (gen-label)
  (set! next-sequence-number (+ 1 next-sequence-number))
  next-sequence-number)

(define (member? el list)
  (if (eq? list nil)
      false
  (if (eq? (first list) el)
      true
  ; else
      (member? el (rest list)))))
	  
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

(define (indexInList el list)
  (if (eq? list nil)
      (error "not in list")
  (if (eq? (first list) el)
      1
  ; else
      (+ 1 (indexInList el (rest list))))))

(define (make-generator)
  (let ((list nil)
        (literals nil))
    
    (define (add-code code)
      (set! list (cons code list)))

    (define (add-literal literal)
      ; returns index of defined literal
      (set! literals (cons literal literals))
      (length literals))

    (define (get-collected-code)
      (reverse list))

    (define (get-collected-literals)
      (reverse literals))

    (define (dispatch op)
      (if (eq? op 'add-code)
          add-code
      (if (eq? op 'add-literal)
          add-literal
      (if (eq? op 'get-collected-code)
          get-collected-code
      (if (eq? op 'get-collected-literals)
          get-collected-literals
          nil)))))
    dispatch))

(define my-gen (make-generator))

(define (add-code gen code)
  ( (gen 'add-code ) code))

(define (add-literal gen lit)
  ( (gen 'add-literal) lit))

(define (add-code2 gen c1 c2)
  (begin
    (add-code gen c1)
    (add-code gen c2)))

(define (get-collected-code gen)
  ( (gen 'get-collected-code )))

(define (get-collected-literals gen)
  ( (gen 'get-collected-literals )))

(define (compile-userdefined-function f)
  (let ((body (get-body f))
        (argList (get-argList f))
        (gen (make-generator))
        )
    (compile-body gen body argList)
    (add-code gen '(retTop))
	
    (set-bytecode! f (get-collected-code gen))
    (set-literals! f (get-collected-literals gen))
    (cons
     (get-collected-code gen)
     (get-collected-literals gen)
    )))

(define forValue 1)
(define forEffect 0)

(define (compile-body gen bodyList argList)
   (if (eq? bodyList nil)
       (add-code gen '(pushNil))
   ; else
       (compile-sequence gen bodyList argList)))

(define (compile-sequence gen bodyList argList)
   (if (eq? (cdr bodyList) nil)
       (compile-expression gen (first bodyList) argList forValue)
   ; else
       (begin
         (compile-expression gen (first bodyList) argList forEffect)
         (compile-sequence gen (rest bodyList) argList))))

(define (compile-expression gen expr argList forWhat)
  (if (cons? expr)
      (compile-function-call gen expr argList forWhat)
  ; else
      (if (symbol? expr)
          (if (eq? expr 'true)
               (compile-constant gen expr argList forWhat)
          (if (eq? expr 'false)
               (compile-constant gen expr argList forWhat)
           ; else
               (compile-variable gen expr argList forWhat)))
      ; else
          (compile-constant gen expr argList forWhat))))

(define (compile-function-call gen expr argList forWhat)
  (let ((func (first expr)))
     (if (eq? func '+)
         (compile-builtIn-plus gen (rest expr) argList forWhat)
     (if (eq? func '-)
         (compile-builtIn-minus gen (rest expr) argList forWhat)
     (if (eq? func '*)
         (compile-builtIn-multiply gen (rest expr) argList forWhat)
     (if (eq? func 'quote)
         (compile-builtIn-quote gen (rest expr) argList forWhat)
     (if (eq? func 'eq?)
         (compile-builtIn-eq? gen (rest expr) argList forWhat)
     (if (eq? func 'if)
         (compile-builtIn-if gen (rest expr) argList forWhat)
     (if (eq? func 'first)
         (compile-builtIn-first gen (rest expr) argList forWhat)
     (if (eq? func 'rest)
         (compile-builtIn-rest gen (rest expr) argList forWhat)
     ; else
         (compile-general-function-call gen (first expr) (rest expr) argList forWhat)))))))))
     (if (eq? forWhat forEffect)
         (add-code gen '(drop))
     ; else 
         nil)))

;
; plus
;
(define (compile-builtIn-plus gen expr argList forWhat)
  (if (and
       (number? (first expr))
       (number? (second expr)))
      (compile-builtIn-plus gen
            (cons
             (+ (first expr) (second expr))
             (rest (rest expr)))
            argList forWhat)
      ; else - not constant
      (begin                
        (compile-expression gen (first expr) argList forValue)
        (compile-builtIn-plus-rest gen (rest expr) argList forWhat))))

(define (compile-builtIn-plus-rest gen expr argList forWhat)
  (compile-expression gen (first expr) argList forValue)
  (add-code gen '(plus))
  (if (eq? (rest expr) nil)
     nil
     (compile-builtIn-plus-rest gen (rest expr) argList forWhat)))

;
; minus
;
(define (compile-builtIn-minus gen expr argList forWhat)
    (compile-expression gen (first expr) argList forValue)
    (compile-builtIn-minus-rest gen (rest expr) argList forWhat))

(define (compile-builtIn-minus-rest gen expr argList forWhat)
  (compile-expression gen (first expr) argList forValue)
  (add-code gen '(minus))
  (if (eq? (rest expr) nil)
     nil
     (compile-builtIn-minus-rest gen (rest expr) argList forWhat)))

;
; times
;
(define (compile-builtIn-multiply gen expr argList forWhat)
   (compile-expression gen (first expr) argList forValue)
   (compile-builtIn-multiply-rest gen (rest expr) argList forWhat))

(define (compile-builtIn-multiply-rest gen expr argList forWhat)
  (compile-expression gen (first expr) argList forValue)
  (add-code gen '(times))
  (if (eq? (rest expr) nil)
     nil
     (compile-builtIn-multiply-rest gen (rest expr) argList forWhat)))

(define (compile-builtIn-eq? gen expr argList forWhat)
  (compile-expression gen (first expr) argList forValue)
  (compile-expression gen (second expr) argList forValue)
  (add-code gen '(equal)))

(define (compile-builtIn-quote gen expr argList forWhat)
  (compile-constant gen (first expr) argList forWhat))

(define (compile-builtIn-if gen expr argList forWhat)
  (let ((label1 (gen-label))
        (label2 (gen-label)))
        
  (compile-expression gen (first expr) argList forValue)
  (add-code gen (cons 'false_jmp label1))
  (compile-expression gen (second expr) argList forValue)
  (add-code gen (cons 'jump label2))
  (add-code gen (cons 'label label1))
  (compile-expression gen (third expr) argList forValue)
  (add-code gen (cons 'label label2))))

(define (compile-builtIn-first gen expr argList forWhat)
  (error "oops"))
(define (compile-builtIn-rest gen expr argList forWhat)
  (error "oops"))

(define (compile-variable gen expr argList forWhat)
  (if (member? expr argList)
      (add-code gen (cons 'pushArg (indexInList expr argList)))
   ; else 
      (add-code gen (cons 'pushGlobal (add-literal gen expr)))))

(define (compile-constant gen expr argList forWhat)
  (if (eq? forWhat forEffect)
      nil ; do nothing
  ; else 
      (if (eq? expr nil)
          (add-code gen '(pushNil) )
      (if (eq? expr 'true)
          (add-code gen '(pushTrue) )
      (if (eq? expr 'false)
          (add-code gen '(pushFalse) )
      (if (integer? expr)
          (add-code gen (cons 'pushNumber expr))
      ; else
          (add-code gen (cons 'pushLiteral (add-literal gen expr)))
      ))))))
 
(define (compile-general-function-call gen functionExpr argExprsOfCall argListOfFunctionWeCompileFor forWhat)
  (compile-expression gen functionExpr argListOfFunctionWeCompileFor forValue)
  (compile-call-arguments gen argExprsOfCall argListOfFunctionWeCompileFor) 
  (add-code gen (cons 'call (length argExprsOfCall))))

(define (compile-call-arguments gen argExprsOfCall argListOfFunctionWeCompileFor)
  (if (eq? argExprsOfCall nil)
      nil ; nothing to do
  ; else
      (begin
        (compile-expression gen (first argExprsOfCall) argListOfFunctionWeCompileFor forValue)
        (compile-call-arguments gen (rest argExprsOfCall) argListOfFunctionWeCompileFor))))


(define (testfunc n)
	(if (eq? n 1)
		1
		; else
		1000))

(compile-userdefined-function testfunc)