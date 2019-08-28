const chai = require("chai");
const path = require("path");
const snarkjs = require("snarkjs");

const compiler = require("circom");
const babyJub = require("../src/babyjub.js");

const assert = chai.assert;

describe("Shallue-Woestijne-Ulas point picker test", () => {
    it("Should select a point on the curve", async () => {

        const cirDef = await compiler(path.join(__dirname, "circuits", "swuselect_test.circom"));
        const circuit = new snarkjs.Circuit(cirDef);
        const witness = circuit.calculateWitness({ "in": "8" });
        assert(babyJub.inCurve(witness.slice(1,3)));

    });
});
