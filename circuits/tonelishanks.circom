include "comparators.circom";

function Legendre(x) {
  return x ** 10944121435919637611123202872628637544274182200208017171849102093287904247808;
}

function FToneliShanks(n) {
    if (Legendre(n)!=1) {
      return 0;
    }
    var q = 81540058820840996586704275553141814055101440848469862132140264610111;
    var s = 28;
    var z = 5;

    var c = z**q;
    var r = n**((q+1)>>1);
    var t = n**q;
    var m = s;
    var t2 = 0;
    var i = 0;
    var f_break = 0;
    var b = 0;
    while (t!=1) {
      t2 = t*t;
      i = 1;
      f_break = 0;
      while ((i<m) && (f_break==0)) {
        if (t2==1) {
          f_break = 1;
        } else {
          t2 = t2*t2;
        }
        i=i+1;
      }
      i=i-1;
      b = c ** (1 << (m-i-1))
      r = r*b;
      c = b*b;
      t = t*c;
      m = i
    }
    return r
}


template ToneliShanks() {
  signal input in;
  signal output out;
  out <-- FToneliShanks(in);
  out*out === in;
}

template isSquare() {
  signal input in;
  signal output out;

  signal p1;
  p1 <-- FToneliShanks(in);

  signal p2;
  p2 <-- FToneliShanks(5*in);

  signal r1;
  r1 <== p1*p1 - in;

  signal r2;
  r2 <== p2*p2 - 5*in;

  r1 * r2 === 0;
  component r1zero = IsZero();
  r1zero.in <== r1;
  out <== r1zero.out;
}

