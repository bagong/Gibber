// For now all parts are generated under the (rarely but sometimes faulty)
// assumption that the gong-tone at the end and the beginning of a gongan are
// the same. This is also assumed for kendhangan.
garap = {
  bonangPan : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var balungan = (conf.soMode) ? kar.balMODenorm(segment) : kar.protoBal(now.balObj[segment]) ;
    var cnt = balungan.length;
    var bonType = kar.bonanganType(segment); // bongan-type can change within a gongan. This means the function refered to must eventually evaluate gongan-phase to work well and kendhanganType (which in turn can change during a gongan).
    var period = kar.gongan("gong");
    var bonangan = [];
    var nut = [];
    var degrees = [];
    var durs = [];
    var amps = [1];
    var snapper = true; // snaps to original density if speed multiplies - garap-instruments are snappers. Peking in Solo is a snapper, in Yogya not.
    var spb = (snapper) ? 4*kar.irFactor(irama) : 4; // strokes per beat at irama I (compare now.ppb) - this is the "speed-level" of the instrument and allows the notation-parser to decide how many pulses to insert (kepatihan-notation of parts is usually relative to their speed-level and not to balungan-speed)
    var pPadding = now.ppb/spb;
    var lagMin = 100;
    var lagMax = 150;
    var lag = kar.lag(lagMin,lagMax,irama);
    if (bonType === "mbuka") {
        var padding = bukaPadding();
        degrees = padding[0];
        durs = padding[1];
        amps = padding[2];
    } else if (bonType === "mipil") {
      var nutRoot = notation.bonangan[flags.pathet][irama][bonType]["bp"]; // to be extended by pattern-name and additional variable characteristics, for piplan e.g. balType.
      var nutRootGen = notation.bonangan.generic[irama][bonType]["bp"]; // to be extended by pattern-name and additional variable characteristics, for piplan e.g. balType.
      bonangan = tafsiran.bonang.mipil(balungan,cnt,nutRoot,nutRootGen,segment);
      // once the part for the segment is assembled we need to convert gamelan-notation
      // to system notation. In (conf.pulseMode 1/0) pulseNut(notation,spb,ppb) is our friend,
      // in dursMode dursNut(notation,spb,ppb)
      nut = (conf.pulseMode) ? pulseNut(bonangan,spb) : dursNut(bonangan,spb);
      degrees = nut[0];
      durs = nut[1];
    } else {
      alert("bonangan not defined yet (check garap.bonangPan)")
    }
    if (segment !== "buka") {
      var shifted = shiftGong(degrees,durs,amps,pPadding);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  bonangBar : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var balungan = (conf.soMode) ? kar.balMODenorm(segment) : kar.protoBal(now.balObj[segment]) ;
    var cnt = balungan.length;
    var bonType = kar.bonanganType(segment);
    var period = kar.gongan("gong");
    var bonangan = [];
    var nut = [];
    var degrees = [];
    var durs = [];
    var amps = [1];
    var snapper = true;
    var spb = (bonType==="mbuka") ? 1 : (snapper) ? 2*kar.irFactor(irama) : 2; // buka-mode is not subdivisional
    var pPadding = now.ppb/spb;
    var lagMin = 100;
    var lagMax = 300;
    var lag = kar.lag(lagMin,lagMax,irama);
    if (bonType === "mbuka" && flags.bukaInstr === "bonangBar") {
      bonangan = tafsiran.bonang.mbuka(balungan,cnt);
      nut = (conf.pulseMode) ? pulseNut(bonangan,spb) : dursNut(bonangan,spb);
      degrees = nut[0];
      durs = nut[1];
      popGong(degrees,durs,amps,pPadding);
    } else if (bonType === "mbuka") {
      var padding = bukaPadding();
      degrees = padding[0];
      durs = padding[1];
      amps = padding[2];
    } else if (bonType === "mipil") {
      var nutRoot = notation.bonangan[flags.pathet][irama][bonType]["bb"];
      var nutRootGen = notation.bonangan.generic[irama][bonType]["bb"];
      bonangan = tafsiran.bonang.mipil(balungan,cnt,nutRoot,nutRootGen,segment);
      nut = (conf.pulseMode) ? pulseNut(bonangan,spb) : dursNut(bonangan,spb);
      degrees = nut[0];
      durs = nut[1];
      var shifted = shiftGong(degrees,durs,amps,pPadding);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    } else {
      alert("bonangan not yet implemented (check garap.bonangBar)");
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  peking : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var balungan = kar.balPekingan(segment); // wrapping doesn't work for slendro yet!
    var cnt = balungan.length;
    var period = kar.gongan("gong");
    var pekingan = [];
    var nut = [];
    var degrees = [];
    var durs = [];
    var amps = [1];
    var snapper = true;
    var spb = (snapper) ? 2*kar.irFactor(irama) : 2;
    var pPadding = now.ppb/spb;
    var lagMin = 100;
    var lagMax = 150;
    var lag = kar.lag(lagMin,lagMax,irama);
    if (segment === "buka") {
        var padding = bukaPadding();
        degrees = padding[0];
        durs = padding[1];
        amps = padding[2];
    } else {
      for (var j = 0; j < cnt; j=j+2) {
        var i = balungan[j];
        var o = balungan[j+1];
        i = (i===o) ? kar.randomNeighbor(i) : i;
        (irama==="irI") ? pekingan.push(i,i,o,o) : pekingan.push(i,i,o,o,i,i,o,o);
        (irama==="irI") ? amps.push(1,1,1,1) : amps.push(1,1,1,1,1,1,1,1);
      }
      nut = (conf.pulseMode) ? pulseNut(pekingan,spb) : dursNut([pekingan,amps],spb);
      degrees = nut[0];
      durs = nut[1];
      var shifted = shiftGong(degrees,durs,amps,pPadding,2);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  saronA : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var balungan = kar.balSaronan(segment);
    var cnt = balungan.length;
    var period = kar.gongan("gong");
    var saronan = [];
    var nut = [];
    var degrees = [];
    var durs = [];
    var amps = [];
    var snapper = false;
    var spb = (snapper) ? 1*kar.irFactor(irama) : 1;
    var pPadding = now.ppb/spb;
    var lagMin = 100;
    var lagMax = 400;
    var lag = kar.lag(lagMin,lagMax,irama);
    if (segment === "buka") {
        var padding = bukaPadding();
        degrees = padding[0];
        durs = padding[1];
        amps = padding[2];
    } else {
      for (var i = 0; i < cnt; i++) {
        var ini = balungan[i];
        var next = balungan[i+1];
        if (ini && ini === next) {
          saronan.push(ini,"_",ini,"_");
          amps.push(1,"_",0,"_");
        } else {
          (ini) ? saronan.push(ini) : saronan.push(undefined);
          amps.push(1);
        }
      }
      nut = (conf.pulseMode) ? pulseNut([saronan,amps],spb) : dursNut([saronan,amps],spb);
      degrees = nut[0];
      amps = nut[1];
      durs = nut[2];
      var shifted = shiftGong(degrees,durs,amps,pPadding);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  saronB : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var balungan = kar.balSaronan(segment);
    var cnt = balungan.length;
    var period = kar.gongan("gong");
    var nut = [];
    var saronan = [];
    var degrees = [];
    var durs = [];
    var amps = [];
    var snapper = false;
    var spb = (snapper) ? 1*kar.irFactor(irama) : 1;
    var pPadding = now.ppb/spb;
    var lagMin = 120;
    var lagMax = 280;
    var lag = kar.lag(lagMin,lagMax,irama);
    if (segment === "buka") {
        var padding = bukaPadding();
        degrees = padding[0];
        durs = padding[1];
        amps = padding[2];
    } else {
      for (var i = 0; i < cnt; i++) {
        var ini = balungan[i];
        var next = balungan[i+1];
        if (ini && ini === next) {
          saronan.push(ini,"_",ini,"_");
          amps.push(1,"_",0,"_");
        } else {
          (ini) ? saronan.push(ini) : saronan.push(undefined);
          amps.push(1);
        }
      }
      nut = (conf.pulseMode) ? pulseNut([saronan,amps],spb) : dursNut([saronan,amps],spb);
      degrees = nut[0];
      amps = nut[1];
      durs = nut[2];
      var shifted = shiftGong(degrees,durs,amps,pPadding);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  demung : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var balungan = kar.balSaronan(segment);
    var cnt = balungan.length;
    var period = kar.gongan("gong");
    var nut = [];
    var saronan = [];
    var degrees = [];
    var durs = [];
    var amps = [];
    var snapper = false;
    var spb = (snapper) ? 1*kar.irFactor(irama) : 1;
    var pPadding = now.ppb/spb;
    var lagMin = 150;
    var lagMax = 400;
    var lag = kar.lag(lagMin,lagMax,irama);
    if (segment === "buka") {
        var padding = bukaPadding();
        degrees = padding[0];
        durs = padding[1];
        amps = padding[2];
    } else {
      for (var i = 0; i < cnt; i++) {
        var ini = balungan[i];
        var next = balungan[i+1];
        if (ini && ini === next) {
          saronan.push(ini,"_",ini,"_");
          amps.push(1,"_",0,"_");
        } else {
          (ini) ? saronan.push(ini) : saronan.push(undefined);
          amps.push(1);
        }
      }
      nut = (conf.pulseMode) ? pulseNut([saronan,amps],spb) : dursNut([saronan,amps],spb);
      degrees = nut[0];
      amps = nut[1];
      durs = nut[2];
      var shifted = shiftGong(degrees,durs,amps,pPadding);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  slenthem : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var balungan = kar.balSaronan(segment);
    var cnt = balungan.length;
    var period = kar.gongan("gong");
    var nut = [];
    var saronan = [];
    var degrees = [];
    var durs = [];
    var amps = [];
    var snapper = false;
    var spb = (snapper) ? 1*kar.irFactor(irama) : 1;
    var pPadding = now.ppb/spb;
    var lagMin = 150;
    var lagMax = 400;
    var lag = kar.lag(lagMin,lagMax,irama);
    if (segment === "buka") {
        var padding = bukaPadding();
        degrees = padding[0];
        durs = padding[1];
        amps = padding[2];
    } else {
      for (var i = 0; i < cnt; i++) {
        var ini = balungan[i];
        var next = balungan[i+1];
        if (ini && ini === next) {
          saronan.push(ini,"_",ini,"_");
          amps.push(1,"_",0,"_");
        } else {
          (ini) ? saronan.push(ini) : saronan.push(undefined);
          amps.push(1);
        }
      }
      nut = (conf.pulseMode) ? pulseNut([saronan,amps],spb) : dursNut([saronan,amps],spb);
      degrees = nut[0];
      amps = nut[1];
      durs = nut[2];
      var shifted = shiftGong(degrees,durs,amps,pPadding);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  kempyang : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var period = kar.gongan("gong");
    var pyang = (now.laras==="pelog") ? 6 : degree("1'");
    var first = kar.gongan("kempyang")[0];
    var interval = kar.gongan("kempyang")[1];
    var kempyangan = [];
    var degrees = [];
    var durs = [];
    var amps = [1];
    var snapper = false;
    var spb = 2/interval; // this is relative to notation which contains undefineds
    var pPadding = now.ppb/spb;
    var lagMin = 70;
    var lagMax = 200;
    var lag = kar.lag(lagMin,lagMax,irama);
    if (segment === "buka") {
        var padding = bukaPadding();
        degrees = padding[0];
        durs = padding[1];
        amps = padding[2];
    } else {
      for (var i=first; i<period; i+=interval) {
        kempyangan.push(pyang,undefined);
      }
      nut = (conf.pulseMode) ? pulseNut(kempyangan,spb) : dursNut(kempyangan,spb);
      degrees = nut[0];
      durs = nut[1];
      var shifted = shiftGong(degrees,durs,amps,pPadding);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  kethuk : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var period = kar.gongan("gong");
    var thuk = (now.laras==="pelog") ? 6 : 2;
    var first = kar.gongan("kethuk")[0];
    var interval = kar.gongan("kethuk")[1];
    var kethukan = [];
    var degrees = [];
    var durs = [];
    var amps = [1];
    var snapper = false;
    var spb = 2/interval; // can change with form (kerepan/kerep/arang);
    var pPadding = now.ppb/spb;
    var lagMin = 200;
    var lagMax = 500;
    var lag = kar.lag(lagMin,lagMax,irama);
    if (segment === "buka") {
        var padding = bukaPadding();
        degrees = padding[0];
        durs = padding[1];
        amps = padding[2];
    } else {
      for (var i=first; i<period; i+=interval) {
        kethukan.push(thuk,undefined);
      }
      nut = (conf.pulseMode) ? pulseNut(kethukan,spb) : dursNut(kethukan,spb);
      degrees = nut[0];
      durs = nut[1];
      var shifted = shiftGong(degrees,durs,amps,pPadding);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  kempul : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var balungan = (conf.soMode) ? kar.balMODenorm(segment) : kar.protoBal(now.balObj[segment]) ;
    var period = kar.gongan("gong");
    var first = kar.gongan("kempul")[0]-1;
    var interval = kar.gongan("kempul")[1];
    var kempulan = [undefined,undefined];
    var degrees = [];
    var amps = [1];
    var snapper = false;
    var spb = 2/interval;
    var pPadding = now.ppb/spb;
    var lagMin = 300;
    var lagMax = 1500;
    var lag = kar.lag(lagMin,lagMax,irama);
    if (segment === "buka") {
        var padding = bukaPadding();
        degrees = padding[0];
        durs = padding[1];
        amps = padding[2];
    } else {
      for (var i = first; i < period; i += interval) {
        kempulan.push(kar.kempulTone(balungan[i]),undefined);
      }
      nut = (conf.pulseMode) ? pulseNut(kempulan,spb) : dursNut(kempulan,spb);
      degrees = nut[0];
      durs = nut[1];
      var shifted = shiftGong(degrees,durs,amps,pPadding);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  kenong : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var balungan = (conf.soMode) ? kar.balMODenorm(segment) : kar.protoBal(now.balObj[segment]) ;
    var period = kar.gongan("gong");
    var kenongan=[];
    var degrees = [];
    var durs = [];
    var amps = [1];
    var first = kar.gongan("kenong")[0]-1;
    var interval = kar.gongan("kenong")[1];
    var snapper = false;
    var spb = 1/interval;
    var pPadding = now.ppb/spb;
    var lagMin = 500;
    var lagMax = 2000;
    var lag = kar.lag(lagMin,lagMax,irama); // unsolved must wait for Gong
    if (segment === "buka") {
        var padding = bukaPadding();
        degrees = padding[0];
        durs = padding[1];
        amps = padding[2];
    } else {
      for (var i = first; i < period; i+=interval) {
        var nong = balungan[i];
        var plesA = (i>period-3) ? balungan[0] : balungan[i+1]; // circular because context can't look beyond gong yet
        var plesB = (i>period-3) ? balungan[1] : balungan[i+2];
        if (plesA===plesB) {
          kenongan.push(kar.kenongTone(plesA));
        } else {
          kenongan.push(kar.kenongTone(nong));
        }
      }
      nut = (conf.pulseMode) ? pulseNut(kenongan,spb) : dursNut(kenongan,spb);
      degrees = nut[0];
      durs = nut[1];
      var shifted = shiftGong(degrees,durs,amps,pPadding);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  gong : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var balungan = (conf.soMode) ? kar.balMODenorm(segment) : kar.protoBal(now.balObj[segment]) ;
    var period = kar.gongan("gong");
    var gong = (now.laras==="pelog") ? 5 : 3;
    var gongan = [gong];
    var snapper = false;
    var spb = 1/period;
    var lagMin = 800;
    var lagMax = 3000;
    var lag = kar.lag(lagMin,lagMax,irama,1);
    var degrees = [];
    var durs = [];
    var amps = [1];
    if (segment === "buka") {
        var padding = bukaPadding();
        degrees = padding[0];
        durs = padding[1];
        amps = padding[2];
    } else {
      nut = (conf.pulseMode) ? pulseNut(gongan,spb) : dursNut(gongan,spb);
      degrees = nut[0];
      durs = nut[1];
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  },
  kendhang : function(segment,irama) {
    segment = segment || flags.segment;
    irama = irama || flags.irama;
    var kendhangan = cleanKendhangan(now.kdhObj[irama][segment]);
    var period = kar.gongan("gong");
    var snapper = true;
    var spb = (snapper) ? 2*kar.irFactor(irama) : 2;
    var pPadding = now.ppb/spb;
    var lagMin = 300;
    var lagMax = 600;
    var lag = kar.lag(lagMin,lagMax,irama);
    var degrees = [];
    var durs = [];
    var amps = [1];
    var kendhanganCnt = kendhangan.length;
    var lastNote = kendhangan[kendhanganCnt-1]; // fails if the last tone in notation is not *on* the gong (could be thereafter)
    var nut = (conf.pulseMode) ? pulseNut(kendhangan,spb) : dursNut(kendhangan,spb);
    if (segment === "buka" && irama === "irI" ) { // lancaran not covered (ir0)
      var bukaCnt = now.bukaLength;
      var offset = bukaCnt-(kendhanganCnt/spb);
      var padding = bukaPadding(offset);
      degrees = padding[0].concat(nut[0]);
      durs = (conf.pulseMode) ? nut[1] : padding[1].concat(nut[1]);
    };
    if (segment !== "buka") { // move gongTone to beginning (and pray and cry... :))
      degrees = nut[0];
      durs = nut[1];
      var shifted = shiftGong(degrees,durs,amps,pPadding);
      degrees = shifted[0];
      durs = shifted[1];
      amps = shifted[2];
    } else {
      popGong(degrees,durs,amps,1,pPadding); // lastNote is passed into popGong, because kendhang-notation doesn't use ciphers like balungan
    }
    return { sequence : degrees, durations : durs, amp : amps, attack : [1], decay : [1], offset : lag };
  }
}
