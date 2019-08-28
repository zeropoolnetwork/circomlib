const bn128 = require("snarkjs").bn128;
const bigInt = require("snarkjs").bigInt;

exports.isSquare = isSquare;
exports.ToneliShanks = ToneliShanks;

function Legendre(a) {
  const p = bn128.r;
  return a.modPow(p.sub(bigInt.one).div(bigInt(2)), p);
}

function isSquare(x) {
  const p = bn128.r;
  x = bigInt(x);
  return Legendre(x).sub(bigInt.one).isZero(p);
}


function ToneliShanks(n) {
  const p = bn128.r;
  if (!isSquare(n)) throw("not a square (mod p)");
  let q = p.sub(bigInt.one);
  let s = bigInt.zero;
  while ((q & bigInt.one).isZero()) {
      q = q.shr(bigInt.one);
      s = s.add(bigInt.one);
  }
  if (s.equals(bigInt.one)) return n.modPow(p.add(bigInt.one).shr(bigInt("2")), p);
  let z = bigInt("2");
  for (; z < p; z=z.add(bigInt.one)) 
      if (p.sub(bigInt.one).equals(Legendre(z))) {
          z = z.add(bigInt.one);
          break;
      }
  z = z.sub(bigInt.one);

  let c = z.modPow(q, p);
  let r = n.modPow(q.add(bigInt.one).shr(bigInt.one), p)
  let t = n.modPow(q, p);
  let m = s;
  let t2 = bigInt.zero;
  while (!t.sub(bigInt.one).isZero(p)) {
      t2 = t.mul(t, p);
      let i = bigInt.one;
      for (; i < m; i = i.add(bigInt.one)){
          if (t2.sub(bigInt.one).isZero(p)) {
              i = i.add(bigInt.one);
              break;
          }
          t2 = t2.mul(t2, p);
      }
      i = i.sub(bigInt.one);
      const b = c.modPow(bigInt.one.shl(m.sub(i).sub(bigInt.one)), p);
      r = r.mul(b, p)
      c = b.mul(b, p)
      t = t.mul(c, p)
      m = i
  }
  return r
}
