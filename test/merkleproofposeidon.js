const chai = require("chai");
const path = require("path");
const snarkjs = require("snarkjs");
const bigInt = snarkjs.bigInt;
const hash = require("../src/poseidon.js").createHash(6, 8, 57);
const babyJub = require("../src/babyjub.js");

const compiler = require("circom");

const assert = chai.assert;

const crypto = require("crypto");

const randrange = function(from, to) {
    if (from == to)
        return from;

    if (from > to) 
        [from, to] = [to, from];
    
    const interval = to - from;

    let t = 0;
    while (interval>bigInt.one.shl(t)) 
        t++;
    

    return from + bigInt.leBuff2int(crypto.randomBytes(t)) % interval;
}


describe("Merkle proof test", () => {
  
    it("Should create a merkle proof circuit", async () => {

        const n = 10;
        const leaf = randrange(0n, babyJub.p);
        const _path = Array(n).fill(0).map(x=>Math.random()<0.5?1n:0n);
        const sibling = Array(n);
        let root = leaf;
        for(let i=0; i<n; i++){
          sibling[i] = randrange(0n, babyJub.p);
          root = _path[i]==0n ? hash([root, sibling[i]]) : hash([sibling[i], root]);
        }
        
        const cirDef = await compiler(path.join(__dirname, "circuits", "merkleproofposeidon_test.circom"));

        const circuit = new snarkjs.Circuit(cirDef);
        const witness = circuit.calculateWitness( {sibling, path:_path, leaf});

        assert(witness[1].equals(root));

    }).timeout(200000);
});
