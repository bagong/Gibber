kar.kendhanganType = function() {
  switch (true) {
    case (flags.form === "ketawang") : return "kendhangKal"; break;
    case (flags.form === "ladrang" && flags.garap === "gerongan-salisir") : return "kendhangKal"; break;
    case (flags.form.indexOf("gendhing") === 0) : return "kendhangGdh"; break;
    default : alert(missingKendhanganInfo);
  }
};
kar.bonanganType = function(segment) {
  segment = segment || flags.segment;
  switch (true) {
    case segment === "buka" :
      return "mbuka";
      break;
    case flags.form === "ladrang" && kar.kendhanganType !== "ciblonan" :
      return "mipil";
      break;
    default :
      return "unclassified bonangan";
  }
};
kar.balunganType = function(prefix,w,x,y,z,suffix) {
  return (prefix === w && x===y && z===suffix) ? "nibani" : "mlaku";
}
// the return-values contain "first occurence in gongan" and "period-length" (this accomodates
// the fact that several instruments are "removed" to the binary subdivision of
// the gongan (and the "missing" kempul). In fact - with the sole exception of kenong -
// all "interpunctuating" instruments are complementary rather than additive. They fill
// the "wholes" in each next subdivision-level.
kar.gongan = function(instrument,form) {
  form = form || flags.form;
  var pyang = [1,2], kerepan = [2,4], kerep = [4,8], arang = [8,16];
  switch (true) {
    case instrument === "gong" && form === "lancaran" : return 16; break;
    case instrument === "gong" && form === "ketawang" : return 16; break;
    case instrument === "gong" && form === "ladrang" : return 32; break;
    case instrument === "gong" && form === "ktwGdhK2K" : return 32; break;
    case instrument === "gong" && form === "ktwGdhK4K" : return 64; break;
    case instrument === "gong" && form === "inggah4" : return 64; break;
    case instrument === "gong" && form === "ktwInggah8" : return 64; break;
    case instrument === "gong" && form === "gdhK2K" : return 64; break;
    case instrument === "gong" && form === "ktwInggah16" : return 128; break;
    case instrument === "gong" && form === "inggah8" : return 128; break;
    case instrument === "gong" && form === "gdhK4K" : return 128; break;
    case instrument === "gong" && form === "ktwGdhK8K" : return 128; break;
    case instrument === "gong" && form === "gdhK2A" : return 128; break;
    case instrument === "gong" && form === "gdhK4A" : return 256; break;
    case instrument === "kenong" && form === "lancaran" : return [4,4]; break;
    case instrument === "kenong" && form === "ketawang" : return [8,8]; break;
    case instrument === "kenong" && form === "ladrang" : return [8,8]; break;
    case instrument === "kenong" && form === "ktwGdhK2K" : return [16,16]; break;
    case instrument === "kenong" && form === "gdhK2K" : return [16,16]; break;
    case instrument === "kenong" && form === "inggah4" : return [16,16]; break;
    case instrument === "kenong" && form === "ktwGdhK4K" : return [32,32]; break;
    case instrument === "kenong" && form === "gdhK4K" : return [32,32]; break;
    case instrument === "kenong" && form === "gdhK2A" : return [32,32]; break;
    case instrument === "kenong" && form === "ktwInggah8" : return [32,32]; break;
    case instrument === "kenong" && form === "inggah8" : return [32,32]; break;
    case instrument === "kenong" && form === "ktwGdhK8K" : return [64,64]; break;
    case instrument === "kenong" && form === "ktwInggah16" : return [64,64]; break;
    case instrument === "kenong" && form === "gdhK4A" : return [64,64]; break;
    case instrument === "kempul" && form === "lancaran" : return [6,4]; break;
    case instrument === "kempul" && form === "ladrang" : return [12,8]; break;
    case instrument === "kempul" && form === "ketawang" : return [12,8]; break;
    case instrument === "kethuk" && form === "lancaran" : return [1,2]; break;
    case instrument === "kethuk" && form === "ketawang" : return kerepan; break;
    case instrument === "kethuk" && form === "ladrang" : return kerepan; break;
    case instrument === "kethuk" && form === "inggah4" : return kerepan; break;
    case instrument === "kethuk" && form === "inggah8" : return kerepan; break;
    case instrument === "kethuk" && form === "ktwInggah8" : return kerepan; break;
    case instrument === "kethuk" && form === "ktwInggah16" : return kerepan; break;
    case instrument === "kethuk" && form === "gdhK2K" : return kerep; break;
    case instrument === "kethuk" && form === "gdhK4K" : return kerep; break;
    case instrument === "kethuk" && form === "ktwGdhK2K" : return kerep; break;
    case instrument === "kethuk" && form === "ktwGdhK4K" : return kerep; break;
    case instrument === "kethuk" && form === "ktwGdhK8K" : return kerep; break;
    case instrument === "kethuk" && form === "gdhK2A" : return arang; break;
    case instrument === "kethuk" && form === "gdhK4A" : return arang; break;
    case instrument === "kempyang" && form === "ketawang" : return pyang; break;
    case instrument === "kempyang" && form === "ladrang" : return pyang; break;
    case instrument === "kempyang" && form === "inggah4" : return pyang; break;
    case instrument === "kempyang" && form === "inggah8" : return pyang; break;
    case instrument === "kempyang" && form === "ktwInggah8" : return pyang; break;
    case instrument === "kempyang" && form === "ktwInggah16" : return pyang; break;
    default : alert(msg.alert.missingGonganInfo);
  }
};
kar.kempulTone = function(bal,pathet,gong) { // needs dedication - pelog and slendro not distinguished, rules not necessarily correct
  pathet = pathet || flags.pathet;
  gong = gong || ("p7s6sm".indexOf(pathet) > -1) ? 6 : 5; // does not reflect tonal polyvalence of s6 and p6 and knows nothing of modulation (use par gong to override with values 5 and 6)
  switch (true) {
    case bal === 10 : return 6; break; // high 3 (does it exist?)
    case bal === 9 && gong == 6 : return 9; break;
    case bal === 9 && gong == 5 : return 5; break; // high 2
    case bal === 8 && gong == 5 : return 5; break; // high 1
    case bal === 8 : return 8; break; // high 1
    case bal === 7 : return 7; break;
    case bal === 6 : return 6; break;
    case bal === 5 : return 5; break;
    case bal === 3 && gong == 6 : return 6; break;
    case bal === 3 && gong == 5 : return 5; break;
    case bal === 2 && gong == 6 : return 6; break;
    case bal === 2 && gong == 5 : return 5; break;
    case bal === 1 && gong == 6 : return 8; break;
    case bal === 1 && gong == 5 : return 5; break;
    case bal === 0 : return 7; break; // low 7
    case bal === -1 : return 6; break; // low 6
    case bal === -2 : return 5; break; // low 5
    case bal === -3 : return 6; break; // low 4
    case bal === -4 && gong == 6 : return 6; break; // low 3
    case bal === -4 && gong == 5 : return 5; break;
    case bal === -5 && gong == 6 : return 6; break; // low 2
    case bal === -5 && gong == 5 : return 5; break;
    case bal === -6 : return 5; break; // low 1 (p5 only)
    default : alert("This kempul-case is not covered by rules yet");
  }
};
kar.kenongTone = function(bal,gong,pathet) { // needs dedication - pelog and slendro not distinguished, rules not necessarily correct
  pathet = pathet || flags.pathet;
  gong = gong || ("p7s6sm".indexOf(pathet) > -1) ? 6 : 5; // does not reflect tonal polyvalence of s6 and p6 and knows nothing of modulation (use par gong to override with values 5 and 6)
  switch (true) {
    case bal === 10 : return 6; break; // high 3 (does it exist?)
    case bal === 9 && gong == 6 : return 9; break;
    case bal === 9 && gong == 5 : return 5; break; // high 2
    case bal === 8 && gong == 5 : return 5; break; // high 1
    case bal === 8 : return 8; break; // high 1
    case bal === 7 : return 7; break;
    case bal === 6 : return 6; break;
    case bal === 5 : return 5; break;
    case bal === 3 : return 3; break;
    case bal === 2 && gong == 6 : return 6; break;
    case bal === 2 && gong == 5 : return 5; break;
    case bal === 1 && gong == 6 : return 8; break;
    case bal === 1 && gong == 5 : return 5; break;
    case bal === 0 : return 7; break; // low 7
    case bal === -1 : return 6; break; // low 6
    case bal === -2 : return 5; break; // low 5
    case bal === -3 : return 6; break; // low 4
    case bal === -4 && gong == 3 : return 6; break; // low 3
    case bal === -5 : return 2; break; // low 2
    case bal === -6 : return 5; break; // low 1 (p5 only)
    default : alert("This kenong-case is not covered by rules yet");
  }
};
kar.irFactor = function(irama) {
  irama = irama || flags.irama;
  switch (irama) {
    case "ir0" : return 0.5; break;
    case "irI" : return 1; break;
    case "irII" : return 2; break;
    case "irIII" : return 4; break;
    case "irIIrk" : return 4; break;
    case "irIIIrk" : return 8; break;
    default : alert(msg.alert.missingIramaFactor);
  }
};
kar.randomNeighbor = function(step) { // so far only for plain p7
  var neighbor;
  switch (step) {
    case 7 : neighbor = [6,2]; break;
    case 6 : neighbor = [5,7]; break;
    case 5 : neighbor = [3,6]; break;
    case 3 : neighbor = [5,2]; break;
    case 2 : neighbor = [3,7]; break;
    default: neighbor = [6,6];
  }
  neighbor.pick = weight([.5,.5]);
  return neighbor.pick();
};
kar.closerNeighbor = function(a,b) {
  while (a-b < -2) { b = b - 5; };
  while (a-b > 2) { b = b + 5; };
  return b;
}
kar.protoBal = function(notation) {
  // Todo: handle balungan nibani and embellished balungan. This is just a tiny start that handles wilujeng and maybe not much more...
  // Like in other places assumes that preceding and ending gong are identical
  var bal = (conf.soMode) ? soNut(notation) : degreesNut(notation);
  var cnt = bal.length;
  var initGap = (cnt%4===0) ? 0 : 4-(cnt%4); // prepend undefined to fill gatra
  var gongTone = bal[cnt-1];
  var protoBal = [];
  // make sure, no _ and = remain
  for (var i=0;i<cnt;i++) {
    if ("_=".indexOf(bal[i]) > -1) { alert("The protobalungan-function cannot handle balungan with subdivision-rhythm yet"); }
  }
  // for now just fill the gaps (except at beginning of buka) - again this does not account for "irregular" balungan
  if (initGap===0) {
    protoBal[0] = (bal[0] === undefined && gongTone) || bal[0];
  } else {
    for (var i=0;i<initGap;i++) {
      protoBal.push(undefined);
    }
    protoBal.push(bal[0]);
  }
  for (var i=1;i<cnt;i++) {
    protoBal.push((bal[i] || bal[i]===0) ? bal[i] : protoBal[i-1+initGap] )
  }
  return protoBal;
};
kar.balNormalize = function(protoBal) {
  var steps = [1,2,3,4,5];
  var p7steps = [2,3,5,6,7];
  var cnt = protoBal.length;
  var normalized = [];
  for (var i=0;i<cnt;i++) {
    normalized.push(steps[p7steps.indexOf(protoBal[i])])
  }
  return normalized;
};
kar.balWrap = function(normBal) {
  var cnt = normBal.length;
  var wrapped = [];
  for (var i=0; i<cnt; i++) {
    var tone = normBal[i];
    if (tone > 5) {
      while (tone > 5) { tone = tone - 5; }
    } else if (tone < 1) {
      while (tone < 1) { tone = tone + 5; }
    }
    wrapped.push(tone);
  }
  return wrapped;
};
kar.balDenormWrapped = function(normBal) {
  var degrees = [1,2,3,4,5];
  var p7steps = [2,3,5,6,7];
  var normalized = kar.balWrap(normBal);
  var cnt = normBal.length;
  var bal = [];
  for (var i=0;i<cnt;i++) { bal.push(p7steps[degrees.indexOf(normalized[i])]); }
  return  bal;
}
kar.balDenorm = function(normBal) {
  var p7DegreesCentral = [,1,2,,3,4,5];
  var p7DegreesLow = [,-4,-3,,-2,-1,0];
  var p7DegreesHigh = [,6,7,,8,9,10];
  var pelogCentral = [1,2,3,4,5,6,7];
  var pelogLow = [-6,-5,-4,-3,-2,-1,0];
  var pelogHigh = [8,9,10,11,12,13,14];
  var p7Degrees = p7DegreesLow.concat(p7DegreesCentral).concat(p7DegreesHigh);
  var pelog = pelogLow.concat(pelogCentral).concat(pelogHigh);
  var normalized = normBal;
  var cnt = normBal.length;
  var bal = [];
  for (var i=0;i<cnt;i++) { bal.push(pelog[p7Degrees.indexOf(normalized[i])]); }
  return  bal;
}
kar.balProximity = function(protoBal) {
  var cnt = protoBal.length;
  var normalized = kar.balNormalize(protoBal);
  var optimized = [];
  optimized.push(normalized[0])
  for (var i=0;i<(cnt-1);i++) {
    a = optimized[i];
    b = normalized[i+1];
    optimized.push(kar.closerNeighbor(a,b));
  }
  return optimized;
}
kar.balUnfold = function(protoBal,segment) {
  segment = segment || flags.segment;
  var prox = kar.balProximity(protoBal);
  var cnt = prox.length;
  var gongTone = prox[cnt-1];
  var highFlag = false;
  var lowFlag = false;
  for (var i=0;i<cnt;i++) {
    if (highFlag) {
      for (var j=i;j<cnt;j++) {
        prox[j]=prox[j]+5;
      }
    } else if (lowFlag) {
      for (var k=i;k<cnt;k++) {
        prox[k]=prox[k]-5;
      }
    }
    highFlag = false;
    lowFlag = false;
    switch (true) {
      case gongTone > 1 :
        (!prox[0]) ? prox[0] = undefined : prox[i]=prox[i]-5; // workaround for pin at beginning of buka wilujeng (hack)
        gongTone = gongTone-5;
        lowFlag = true;
        break;
      case prox[i] > 6 :
        prox[i]=prox[i]-5;
        lowFlag = true;
        break;
      case prox[i] === prox[i+1] && prox[i] <= 1 && (i%2)===0 && segment !== "buka" :
        prox[i]=prox[i]+5;
        highFlag = true;
        break;
    }
  }
  return prox;
};
kar.balMODenorm = function(segment) {
  return kar.balDenorm(kar.balUnfold(kar.protoBal(now.balObj[segment]),segment))
};
kar.balPekingan = function(segment) { // extend for slendro 1' and 6. disambiguation
  return soNut(kar.protoBal(now.balObj[segment]))
}
kar.balSaronan = function(segment) { // extend for slendro 1' and 6. disambiguation
  return soNut(now.balObj[segment]);
}
// think about matching with normalized balungan/degrees
kar.so2MoBal = function(soBal) {
  return kar.mapBonang(kar.balDenorm(kar.balUnfold(soBal)));
}
kar.mapBonang = function(moCiphers,offset) {
  offset = offset || 6;
  var cnt = moCiphers.length;
  var bonangDegrees = [];
  for (var i=0;i<cnt;i++) {
    bonangDegrees.push(moCiphers[i]+offset);
  }
  return bonangDegrees;
}
kar.branching = function() {
  switch (true) {
    case flags.segment === "buka" :
      flags.segment = "umpak";
      flags.firstGongan = true;
      flags.goToNgelik = false;
      if (toggle.logBranching) { console.log(msg.console.afterBuka); }
      return partsSet(flags.segment,flags.irama,0,true);
      break;
    case toggle.autoPilot === false && flags.goToNgelik === true :
      flags.segment = "ngelik";
      flags.goToNgelik = false;
      if (toggle.logBranching) { (flags.irama === "irI") ? console.log(msg.console.findGoToNgelik.irI) : console.log(msg.console.findGoToNgelik.irII); }
      return partsSet();
      break;
    case toggle.autoPilot === false && flags.goToNgelik === false :
      flags.segment = "umpak";
      if (toggle.logBranching) { (flags.irama === "irI") ? console.log(msg.console.notFindGoToNgelik.irI) : console.log(msg.console.notFindGoToNgelik.irII); }
      return partsSet();
      break;
    case flags.segment === "umpak" && flags.firstGongan === true :
      flags.segment = "umpak";
      flags.firstGongan = false;
      flags.goToNgelik = true;
      if (toggle.logBranching) { (flags.irama === "irI") ? console.log(msg.console.afterFirstGongan.irI) : console.log(msg.console.afterFirstGongan.irII); }
      return partsSet();
      break;
    case flags.segment === "umpak":
      flags.segment = "ngelik";
      flags.goToNgelik = false;
      if (toggle.logBranching) { (flags.irama === "irI") ? console.log(msg.console.onEnteringNgelik.irI) : console.log(msg.console.onEnteringNgelik.irII); }
      return partsSet();
      break;
    case flags.segment === "ngelik":
      flags.segment = "umpak";
      flags.goToNgelik = true;
      if (toggle.logBranching) { (flags.irama === "irI") ? console.log(msg.console.onEnteringUmpak.irI) : console.log(msg.console.onEnteringUmpak.irII); }
      return partsSet();
      break;
    default :
      flags.segment = "umpak";
      if (toggle.logBranching) { console.log(msg.console.defaultBranch); }
      return partsSet();
  }
}
kar.lag = function(low,high,irama,delay) { // for now Lag is (only set at the gong )
  if (toggle.lag && (flags.segment !== "buka" || toggle.lagBuka)) {
    low = low*par.lagMinMul+par.lagMinAdd;
    high = high*par.lagMaxMul+par.lagMaxAdd;
    var delayAdd = (flags.isGonganSuwuk) ? par.lagPastGongSuwuk : 0;
    var delayAddOverride = delay || delayAdd; // this is to make sure that only other instruments and not the gong itself delay
    var lagBuka = (flags.firstGongan && toggle.lagGongBuka) ? par.lagGongBuka : 0;
    var lagSuwuk = (flags.isGonganSuwuk && toggle.lagGongSuwuk) ? par.lagGongSuwuk+delayAddOverride : 0;
    return rndi(low,high)*kar.irFactor(irama) + lagBuka + lagSuwuk; // think about irama-Faktor - could also be a time-variable
  } else {
    return 0;
  }
};
// sets parts for new irama and adjusts flags
switchIrama = kar.irama = function(irama) {
  switch (irama) {
    case "irI" : flags.irama = "irI"; break;
    case "irII" : flags.irama = "irII"; break;
    case "irIII" : flags.irama = "irIII"; break;
    case "rangkepII" : flags.irama = "rangkepII"; break;
    case "rangkepIII" : flags.irama = "rangkepIII"; break;
    default: console.log("Unknown Irama triggered. Check function kar.irama");
  }
  partsSet(flags.segment,irama,pulse,true);
};
kar.irTanggung = irI = i1 = function() { kar.irama("irI"); };
kar.irDadi = irDadi = irDados = irII = i2 = function() { kar.irama("irII"); };
kar.irWilet = irWilet = irIII = i3 = function() { kar.irama("irIII"); };
// SPEED-CHANGE ################################################################
kar.seseg = function() {
  var factor = (flags.isGonganSuwuk) ? par.suwukDiffMul : par.speedDiffMul;
  if (flags.rem) { factor = Math.abs(factor)*(+1); }
  if (flags.seseg) { factor = Math.abs(factor)*(-1); }
  var oldDur = parts[ixTimeKeeper].durations[0]
  var diff = Math.round((oldDur/(40*now.ppb))*factor);
  pulseUnit = oldDur + diff; // this is the only place, where pulseUnit is changed! (should be ;))
  for (var i=0;i<parts.length;i++) {
    parts[i].durations = [pulseUnit];
  }
  return "function seseg active";
};
kar.nyeseg = speedUp = su = function(factor) {
  par.speedDiffMul = factor || par.speedDiffMul;
  flags.rem = false;
  flags.seseg = true;
  return "Triggered speedUp (kar.nyeseg)";
};
kar.ngerem = slowDown = speedDown = sd = function(factor) {
  par.speedDiffMul = factor || par.speedDiffMul;
  flags.seseg = false;
  flags.rem = true;
  return "Triggered slowDown (kar.ngerem)";
};
kar.jadi = speedSteady = ss = function() { // think about speedDiffMul-reset
  flags.seseg = false;
  flags.rem = false;
  return "Triggered speedSteady (kar.speedSteady)";
};
kar.goToNgelik = goToNgelik = ng = function() {
  flags.goToNgelik = true;
  if(toggle.logUserInput) { console.log(msg.console.onSetNgelikFlag) }
  return "Set ngelik-flag";
}
kar.enterSuwukMode = end = doSuwuk = function(factor) {
  par.suwukDiffMul = factor || par.suwukDiffMul;
  flags.doSuwuk = true;
  if(toggle.logUserInput) { console.log(msg.console.onSetSuwukFlag) }
  return "Triggered suwuk-mode (kar.enterSuwukMode)";
};
kar.nyuwuk = phaseOut = function(factor) {
  par.suwukDiffMul = factor || par.suwukDiffMul;
  flags.seseg = false;
  flags.rem = true;
  return "Final slowdown initiated";
};
kar.gongSuwuk = function() {
  parts.all( function(obj) {
    obj.kill(); gongan.kill();
    autoPilot.kill();
    watchDogs.kill();
    return "Engines switched off";
  });
};
