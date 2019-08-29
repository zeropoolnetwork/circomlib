include "bitify.circom";
include "pedersen.circom";
include "escalarmulany.circom";
include "escalarmulfix.circom";
include "comparators.circom";
include "babyjub.circom";
include "pointbits.circom";




template ecvrfpedersen() {
  signal input Q;     //pubkey
  signal input gamma; //proof element
  signal input c;        //proof element
  signal input s;        //proof element
  signal input alpha;    //message

  var G8 = [
    5299619240641551281634865583518297030282874472190772894086521144482721001553,
    16950150798460657717958625567821834550301663161624707787222815936182638968203
  ];

  component Q_zero = IsZero();
  Q_zero.in <== Q;
  Q_zero.out === 0;

  component gamma_zero = IsZero();
  gamma_zero.in <== gamma;
  gamma_zero.out === 0;

  component QP = SubgroupDecompress_Strict();
  QP.x <== Q;
  
  component gammaP = SubgroupDecompress_Strict();
  gammaP.x <== gamma;


  component gamma_bits = Num2Bits_strict();
  gamma_bits.in <== gamma;


  component Q_bits = Num2Bits_strict();
  Q_bits.in <== Q;


  component c_bits = Num2Bits_strict();
  c_bits.in <== c;

  component s_bits = Num2Bits(251);
  s_bits.in <== s;

  component alpha_bits = Num2Bits_strict();
  alpha_bits.in <== alpha;

  component H = Pedersen(508);
  for(var i=0; i<254; i++) {
    H.in[i] <== Q_bits.out[i];
    H.in[i+254] <== alpha_bits.out[i];
  }

  component Hx_bits = Num2Bits_strict();
  Hx_bits.in <== H.out[0];

  component sG8 = EscalarMulFix(251, G8);
  
  component cQP = EscalarMulAny(254);
  cQP.p[0] <== -QP.x;
  cQP.p[1] <== QP.y;

  component sH = EscalarMulAny(251);
  sH.p[0] <== H.out[0];
  sH.p[1] <== H.out[1];
 
  component cgammaP = EscalarMulAny(254);
  cgammaP.p[0] <== -gammaP.x;
  cgammaP.p[1] <== gammaP.y;
  
  for(var i=0; i<251; i++) {
    sG8.e[i] <== s_bits.out[i];
    sH.e[i] <== s_bits.out[i];
  }

  for(var i=0; i<254; i++) {
    cQP.e[i] <== c_bits.out[i];
    cgammaP.e[i] <== c_bits.out[i];
  }


  component u = BabyAdd();
  u.x1 <== sG8.out[0];
  u.y1 <== sG8.out[1];
  u.x2 <== cQP.out[0];
  u.y2 <== cQP.out[1];
  
  component ux_bits = Num2Bits_strict();
  ux_bits.in <== u.xout;
  
  component v = BabyAdd();
  v.x1 <== sH.out[0];
  v.y1 <== sH.out[1];
  v.x2 <== cgammaP.out[0];
  v.y2 <== cgammaP.out[1];

  component vx_bits = Num2Bits_strict();
  vx_bits.in <== v.xout;
  
  component C = Pedersen(1016);
  for(var i=0; i<254; i++) {
    C.in[i] <== Hx_bits.out[i];
    C.in[254+i] <== gamma_bits.out[i];
    C.in[508+i] <== ux_bits.out[i];
    C.in[762+i] <== vx_bits.out[i];
  }

  
  C.out[0]===c;
}
