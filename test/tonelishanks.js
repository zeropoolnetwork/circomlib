const chai = require("chai");
const path = require("path");
const snarkjs = require("snarkjs");

const compiler = require("circom");

const assert = chai.assert;

describe("Square root test", () => {
    it("Should create a square root circuit", async () => {

        const cirDef = await compiler(path.join(__dirname, "circuits", "tonelishanks_test.circom"));

        assert.equal(cirDef.nVars, 3);

        const circuit = new snarkjs.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "in": "4" });

        assert(witness[0].equals(snarkjs.bigInt(1)));
        assert(witness[1].equals(snarkjs.bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495615")));
    });
});
