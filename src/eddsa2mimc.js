const {multiHash} = require("./mimc7.js");
const babyJub = require("./babyjub.js");
const createBlakeHash = require("blake-hash");
const {bigInt} = require("snarkjs");

exports.eddsa2mimc_sign = eddsa2mimc_sign;
exports.eddsa2mimc_verify = eddsa2mimc_verify;

function r(x,m) {
  return bigInt.leBuff2int(createBlakeHash("blake512").
    update(Buffer.concat([bigInt.leInt2Buff(x, 32), bigInt.leInt2Buff(m, 32)])).
    digest().slice(0,32)).affine(babyJub.subOrder);
}

function eddsa2mimc_sign(x, m) {
  x=bigInt(x);
  m=bigInt(m);
  const _r = r(x,m);
  const R = babyJub.mulPointEscalar(babyJub.Base8, _r)[0];
  const Q = babyJub.mulPointEscalar(babyJub.Base8, x)[0];
  const h = multiHash([R, Q, m]);
  const S = _r.add(h.mul(x)).affine(babyJub.subOrder);
  return [R, S];
}

function eddsa2mimc_verify(R, S, Q, m) {
  const Rp = babyJub.subgroupDecompress(R);
  const Qp = babyJub.subgroupDecompress(Q);
  const h = multiHash([R, Q, m]);

  const SR8 = babyJub.mulPointEscalar(babyJub.Base8, S);
  const RHQ = babyJub.addPoint(Rp, babyJub.mulPointEscalar(Qp, h));
  return SR8[0]==RHQ[0];
}