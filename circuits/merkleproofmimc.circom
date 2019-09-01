include "mimc.circom"

template merkleproofmimc(n) {
  signal input sibling[n];
  signal input path[n];
  signal input leaf;
  signal output root;

  component hash[n];

  var node = leaf;

  for(var i = 0; i<n; i++) {
    hash[i] = MultiMiMC7(2,91);
    hash[i].in[0] <== sibling[i] + (node - sibling[i]) * (1 - path[i]);
    hash[i].in[1] <== sibling[i] + node - hash[i].in[0];
    hash[i].k <== 0;
    node = hash[i].out;
  }

  root <== node;
}