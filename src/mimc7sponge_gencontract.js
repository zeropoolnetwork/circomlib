const Web3Utils = require("web3-utils");
const Contract = require("circomlib/src/evmasm");
const Web3 = require("web3");

function createCode(seed, n) {
  seed = typeof seed === "undefined" ? "mimc" : seed;
  n = typeof n === "undefined" ? 91 : n;

  
  let web3 = new Web3();
  const C = new Contract();

  function mimc7_inline() {
    let ci = Web3Utils.keccak256(seed);
    // x k 
    C.swap(1); // k x
    C.push("0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001");  // q k x
    C.dup(0)            // q q k x
    C.dup(0)            // q q q k x
    C.swap(4)           // x q q k q
    C.dup(3);           // k x q q k q
    C.addmod();         // t=x+k q k q
    C.dup(1);           // q t q k q
    C.dup(0);           // q q t q k q
    C.dup(2);           // t q q t q k q
    C.dup(0);           // t t q q t q k q
    C.mulmod();         // a=t^2 q t q k q
    C.dup(1);           // q a q t q k q
    C.dup(1);           // a q a q t q k q
    C.dup(0);           // a a q a q t q k q
    C.mulmod();         // b=t^4 a q t q k q
    C.mulmod();         // c=t^6 t q k q
    C.mulmod();         // r=t^7 k q

    for (let i=0; i<n-1; i++) {
        ci = Web3Utils.keccak256(ci);
        C.dup(2);       // q r k q
        C.dup(0);       // q q r k q
        C.dup(0);       // q q q r k q
        C.swap(3);      // r q q q k q
        C.push(ci);     // c r q q k q
        C.addmod();     // s=c+r q q k q
        C.dup(3);       // k s q q k q
        C.addmod();     // t=s+k q k q
        C.dup(1);       // q t q k q
        C.dup(0);       // q q t q k q
        C.dup(2);       // t q q t q k q
        C.dup(0);       // t t q q t q k q
        C.mulmod();     // a=t^2 q t q k q
        C.dup(1);       // q a q t q k q
        C.dup(1);       // a q a q t q k q
        C.dup(0);       // a a q a q t q k q
        C.mulmod();     // b=t^4 a q t q k q
        C.mulmod();     // c=t^6 t q k q
        C.mulmod();     // r=t^7 k q
    }
    C.addmod();     // res=t^7+k
  }

  let funccaln=0;
  function funcall(name, argn) {
    C._pushLabel(`funccall${funccaln}`);
    for(let i = argn; i > 0; i--)
      C.swap(i);
    C.jmp(name);
    C.label(`funccall${funccaln}`);
    funccaln++;
  }

  function sponge() {
    // a b return
    C.label("sponge");
    C.push("0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001");   // q a b
    C.dup(0);  // q q a b
    C.dup(0);  // q q q a b
    C.swap(4); // b q q a q
    C.swap(3); // a q q b q
    C.push("0x00");   // 0 a q b q
    C.dup(1);  // a 0 a q q b q
    mimc7_inline(); // h a q q b q
    C.addmod();    // r q b q

    C.dup(0);   // r r q b q
    C.dup(3);   // b r r q b q
    mimc7_inline(); // h r q b q
    C.addmod(); // h+r b q
    C.addmod(); // h+r+b return
  
    C.swap(1);
    C.jmp();
  }

  //const signature = web3.eth.abi.encodeFunctionSignature(`merkleupdate(uint256[${nProof}],uint256,uint256[])`);  // function merkleupdate(uint256[nProof] rightbranch, uint256 i, uint256[] items)
  const sig = web3.eth.abi.encodeFunctionSignature(`sponge(uint256,uint256)`);

  C.push(0x44);
  C.push("0x00");
  C.push("0x00");
  C.calldatacopy();
  C.push("0x0100000000000000000000000000000000000000000000000000000000");
  C.push("0x00");
  C.mload();
  C.div();
  C.push(sig);
  C.eq();
  C.jmpi("start");

  C.invalid();
  C.label("start");

  C.push("0x24"); // b
  C.mload()
  C.push("0x04"); // a b
  C.mload()

  
  funcall("sponge", 2);

  C.push("0x00");
  C.mstore();     // Save it to pos 0;
  C.push("0x20");
  C.push("0x00");
  C.return();
  sponge();
  return C.createTxData();
}

const abi = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "a",
        "type": "uint256"
      },
      {
      "name": "b",
      "type": "uint256"
      }
    ],
    "name": "sponge",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "pure",
    "type": "function"
  }
];


module.exports = {createCode, abi}