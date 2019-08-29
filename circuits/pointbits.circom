/*
    Copyright 2018 0KIMS association.

    This file is part of circom (Zero Knowledge Circuit Compiler).

    circom is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    circom is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with circom. If not, see <https://www.gnu.org/licenses/>.
*/

include "bitify.circom";
include "aliascheck.circom";
include "compconstant.circom";
include "babyjub.circom";
include "comparators.circom";


function inSubgroup(P) {
    if (inCurve(P) == 0) return 0;
    var subOrder = 2736030358979909402780800718157159386076813972158567259200215660948447373041;
    var res = mulPointEscalar(P, subOrder);
    if ((res[0]==0)&&(res[1]==1)) {
        return 1;
    } else {
        return 0;
    }
}


function sqrt(n) {

    if (n == 0) {
        return 0;
    }

    // Test that have solution
    var res = n ** ((-1) >> 1);
//        if (res!=1) assert(false, "SQRT does not exists");
    if (res!=1) return 0;

    var m = 28;
    var c = 19103219067921713944291392827692070036145651957329286315305642004821462161904;
    var t = n ** 81540058820840996586704275553141814055101440848469862132140264610111;
    var r = n ** ((81540058820840996586704275553141814055101440848469862132140264610111+1)>>1);
    var sq;
    var i;
    var b;
    var j;

    while ((r != 0)&&(t != 1)) {
        sq = t*t;
        i = 1;
        while (sq!=1) {
            i++;
            sq = sq*sq;
        }

        // b = c ^ m-i-1
        b = c;
        for (j=0; j< m-i-1; j ++) b = b*b;

        m = i;
        c = b*b;
        t = t*c;
        r = r*b;
    }

    if (r > ((-1) >> 1)) {
        r = -r;
    }

    return r;
}



template Bits2Point() {
    signal input in[256];
    signal output out[2];
}

template Bits2Point_Strict() {
    signal input in[256];
    signal output out[2];

    var i;

    // Check aliasing
    component aliasCheckY = AliasCheck();
    for (i=0; i<254; i++) {
        aliasCheckY.in[i] <== in[i];
    }
    in[254] === 0;

    component b2nY = Bits2Num(254);
    for (i=0; i<254; i++) {
        b2nY.in[i] <== in[i];
    }

    out[1] <== b2nY.out;

    var a = 168700;
    var d = 168696;

    var y2 = out[1] * out[1];

    var x = sqrt(   (1-y2)/(a - d*y2)  );

    if (in[255] == 1) x = -x;

    out[0] <-- x;

    component babyCheck = BabyCheck();
    babyCheck.x <== out[0];
    babyCheck.y <== out[1];

    component n2bX = Num2Bits(254);
    n2bX.in <== out[0];
    component aliasCheckX = AliasCheck();
    for (i=0; i<254; i++) {
        aliasCheckX.in[i] <== n2bX.out[i];
    }

    component signCalc = CompConstant(10944121435919637611123202872628637544274182200208017171849102093287904247808);
    for (i=0; i<254; i++) {
        signCalc.in[i] <== n2bX.out[i];
    }

    signCalc.out === in[255];
}

// Decompress all points inside subgroup and zero point


template SubgroupDecompress_Strict() {
    signal input x;
    signal output y;
    

    var X;
    compute {
        X = x;
    }
    var P = [0, 1]; 
    var A = 168700;
    var D = 168696;

    var t = (A*X*X - 1)/(D*X*X-1);
    var Y = sqrt(t)

    var P1[2];
    var P2[2];

    compute {
        P1 = [X, Y];
        P2 = [X, -Y];
    }
   
    if(inSubgroup(P1)) {
        P = mulPointEscalar(P1, 2394026564107420727433200628387514462817212225638746351800188703329891451411);
    } else if(inCurve(P2)){
        P = mulPointEscalar(P2, 2394026564107420727433200628387514462817212225638746351800188703329891451411);
    }

    component p = InCurve();
    p.in[0] <-- P[0];
    p.in[1] <-- P[1];


    p.out === 1;

    component p8 = BabyMul8();
    p8.x <== p.in[0];
    p8.y <== p.in[1];

    x === p8.xout;
    y <== p8.yout;


}


template Point2Bits() {
    signal input in[2];
    signal output out[256];


}

template Point2Bits_Strict() {
    signal input in[2];
    signal output out[256];

    var i;

    component n2bX = Num2Bits(254);
    n2bX.in <== in[0];
    component n2bY = Num2Bits(254);
    n2bY.in <== in[1];

    component aliasCheckX = AliasCheck();
    component aliasCheckY = AliasCheck();
    for (i=0; i<254; i++) {
        aliasCheckX.in[i] <== n2bX.out[i];
        aliasCheckY.in[i] <== n2bY.out[i];
    }

    component signCalc = CompConstant(10944121435919637611123202872628637544274182200208017171849102093287904247808);
    for (i=0; i<254; i++) {
        signCalc.in[i] <== n2bX.out[i];
    }

    for (i=0; i<254; i++) {
        out[i] <== n2bY.out[i];
    }
    out[254] <== 0;
    out[255] <== signCalc.out;
}
