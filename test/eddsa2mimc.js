const chai = require("chai");
const path = require("path");
const snarkjs = require("snarkjs");

const compiler = require("circom");
const babyJub = require("../src/babyjub.js");
const eddsa = require("../src/eddsa2mimc.js");

const assert = chai.assert;

// const pedersen = require("../src/pedersenHash.js");
// const bigInt = snarkjs.bigInt;

// function hash(x, size) {
//   return babyJub.unpackPoint(pedersen.hash(bigInt.leInt2Buff(x, Math.ceil(size/8)), size));
// }


describe("eddsa test", () => {
    it("compute proof and verify it", () => {

      const m = snarkjs.bigInt("1934753913053");
      const x = snarkjs.bigInt("324583502347240341734");
      const Q = babyJub.mulPointEscalar(babyJub.Base8, x)[0];

      const [R,S] = eddsa.eddsa2mimc_sign(x, m);
      assert(eddsa.eddsa2mimc_verify(R, S, Q, m));
    });

    it("test circuit for eddsa2mimc", async () => {

      const m = snarkjs.bigInt("1934753913053");
      const x = snarkjs.bigInt("324583502347240341734");
      const Q = babyJub.mulPointEscalar(babyJub.Base8, x)[0];

      const [R,S] = eddsa.eddsa2mimc_sign(x, m);

      const cirDef = await compiler(path.join(__dirname, "circuits", "eddsa2mimc_test.circom"));
      const circuit = new snarkjs.Circuit(cirDef);

      const input = {
        Q, m, R, S
      };

      const witness = circuit.calculateWitness(input);
      
    }).timeout(6000000)

    // it("test circuit for pedersen", async () => {


    //   const cirDef = await compiler(path.join(__dirname, "circuits", "ecvrfpedersen_test.circom"));
    //   const circuit = new snarkjs.Circuit(cirDef);

    //   const input = {
    //     in: 8n,
    //     out: hash(8n, 10)[0]
    //   };

    //   const witness = circuit.calculateWitness(input);
      
    // }).timeout(6000000)
});
