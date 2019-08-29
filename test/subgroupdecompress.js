const chai = require("chai");
const path = require("path");
const snarkjs = require("snarkjs");

const compiler = require("circom");
const babyJub = require("../src/babyjub.js");

const assert = chai.assert;

describe("Subgroup decompress test", () => {
    it("Should find y component for base8", async () => {

        const cirDef = await compiler(path.join(__dirname, "circuits", "subgroupdecompress_test.circom"));

        const circuit = new snarkjs.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "x": babyJub.Base8[0]});
        assert(witness[1].equals(babyJub.Base8[1]));

    });
});
