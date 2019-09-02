const chai = require("chai");
const path = require("path");
const snarkjs = require("snarkjs");

const compiler = require("circom");
const babyJub = require("../src/babyjub.js");
const ecvrf = require("../src/ecvrfpedersen.js");

const assert = chai.assert;

// const pedersen = require("../src/pedersenHash.js");
// const bigInt = snarkjs.bigInt;

// function hash(x, size) {
//   return babyJub.unpackPoint(pedersen.hash(bigInt.leInt2Buff(x, Math.ceil(size/8)), size));
// }


describe("ECVRF test", () => {
    it("compute proof and verify it", () => {

      const alpha = snarkjs.bigInt("1934753913053");
      const x = snarkjs.bigInt("324583502347240341734");
      const Q = babyJub.mulPointEscalar(babyJub.Base8, x);

      const proof = ecvrf.proof(x, alpha);
      assert(ecvrf.verify(Q[0], alpha, ...proof));
    });

    it("test circuit for ecvrf", async () => {

      const alpha = snarkjs.bigInt("1934753913053");
      const x = snarkjs.bigInt("324583502347240341734");
      const Q = babyJub.mulPointEscalar(babyJub.Base8, x);

      const proof = ecvrf.proof(x, alpha);

      const cirDef = await compiler(path.join(__dirname, "circuits", "ecvrfpedersen_test.circom"));
      const circuit = new snarkjs.Circuit(cirDef);
      const enabled = snarkjs.bigInt("1");

      const input = {
        Q:Q[0], alpha, gamma:proof[0], c:proof[1], s:proof[2], enabled
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
