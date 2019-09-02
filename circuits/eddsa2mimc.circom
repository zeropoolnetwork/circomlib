include "compconstant.circom";
include "pointbits.circom";
include "mimc.circom";
include "bitify.circom";
include "escalarmulany.circom";
include "escalarmulfix.circom";

template eddsa2mimc() {
  signal input Q;
  signal input R;
  signal input S;
  signal input m;
  signal input enabled;

  component Qp = SubgroupDecompress_Strict();
  Qp.x <== Q;

  component Rp = SubgroupDecompress_Strict();
  Rp.x <== R;

  component H = MultiMiMC7(3, 91);
  H.k<==0;
  H.in[0]<==R;
  H.in[1]<==Q;
  H.in[2]<==m;

  var G8 = [
    5299619240641551281634865583518297030282874472190772894086521144482721001553,
    16950150798460657717958625567821834550301663161624707787222815936182638968203
  ];

  
  component S_bits = Num2Bits(251);
  S_bits.in <== S;

  component SG8 = EscalarMulFix(251, G8);
  for(var i=0; i<251;i++){
    SG8.e[i] <== S_bits.out[i];
  }

  component H_bits = Num2Bits_strict();
  H_bits.in <== H.out;

  component HQ = EscalarMulAny(254);
  HQ.p[0] <== Qp.x;
  HQ.p[1] <== Qp.y;

  for(var i=0; i<254;i++) {
    HQ.e[i] <== H_bits.out[i];
  }

  component RHQ = BabyAdd();
  RHQ.x1<==Rp.x;
  RHQ.y1<==Rp.y;
  RHQ.x2<==HQ.out[0];
  RHQ.y2<==HQ.out[1];
  
  (SG8.out[0] - RHQ.xout) * enabled === 0;
  // SG8.out[1] === RHQ.yout; //Subgroup point is determined by x coordinate

}