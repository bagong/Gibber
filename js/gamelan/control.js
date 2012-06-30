// MIXER #######################################################################
/* doesn't work since note-even-reform
muteAll = function() { for (var i in synths) { synths[i].amp = 0; } };
muteInstr = function(instrument) { for (var i in iNames) { if(iNames[i]===instrument) { synths[i].amp = 0; }}};
muteExcept = function(instrument) { for (var i in iNames) { if(iNames[i]!==instrument) { synths[i].amp = 0; }}};
unmuteAll = volReset = function() { for (var i in synths) { synths[i].amp = amps[i]; }};
unmuteInstr = function(instrument) { for (var i in iNames) { if(iNames[i]===instrument) { synths[i].amp = amps[i];}}};
unmuteExcept = function(instrument) { for (var i in iNames) { if(iNames[i]!==instrument) { synths[i].amp = amps[i];}}};
volUp = function() { for (var i in synths) { synths[i].amp *= 1.1; } };
volUpInstr = function(instrument) { for (var i in iNames) { if(iNames[i]===instrument) { synths[i].amp *= 1.1; }}};
volUpExcept = function(instrument) { for (var i in iNames) { if(iNames[i]!==instrument) { synths[i].amp *= 1.1; }}};
volDown = function() { for (var i in synths) { synths[i].amp *= 0.909091; } };
volDownInstr =function(instrument) { for (var i in iNames) { if(iNames[i]===instrument) { synths[i].amp *= 0.909091; }}};
volDownExcept = function(instrument) { for (var i in iNames) { if(iNames[i]!==instrument) { synths[i].amp *= 0.909091; }}};
*/
// EFFECTS #####################################################################
effectBusses = {
  g : Bus( "gongs", Reverb(1,0) ),
  s : Bus( "single", Reverb(0.1,0) ),
  ms : Bus( "pendhopo", Reverb(0.5,0) )
}

// SEQUENCES ###################################################################
// instrument-frequencies
instrFrequencies = function (iName) {
  if (typeof(iName)==="object") {
    var instr = iName;
  } else {
    var instr = now.instruments[iName];
  }
  var tuning = now.tuning;
  var trans = instr.transpose;
  var parTrans = par.transpose;
  var oct = instr.octave;
  var str = instr.stretch;
  var parStr = par.stretch;
  var det = instr.detune;
  var iScale = instr.toneCiphers;
  var cnt = iScale.length;
  var nScale = (now.laras==="pelog") ? [1,2,3,4,5,6,7] : [1,2,3,5,6];
  var scale = [];
  for (var i = 0; i < cnt; i++ ) {
    var note = iScale[i];
    var wrap = (note>7) ? note-7 : (note<1) ? note+7 : note; // this allows for 3 octaves (only)
    scale.push( tuning[nScale.indexOf(wrap)] * parTrans * oct[i] * str * parStr * det[i]); 
  } 
  return scale;
};
// generate (from scratch) or set (replace) a part/parts. For now per Segment
countersReset = function(value) {
  value = value || 0;
  for (var i=0;i<instrCnt;i++) {
    parts[i].counter = value;
  };
};
partsGen = function(segment,irama,counter,play) {
  segment = segment || flags.segment;
  irama = irama || flags.irama;
  counter = (counter===0) ? 0 : counter || pulse%now.pp.gongan;
  play = play || false;
  parts = [];
  for (var i=0;i<instrCnt;i++) {
    parts.push(part("generate",i,segment,irama,play));
  };
  return "All parts generated";
};
partGen = function(i,segment,irama,counter,play) {
  segment = segment || flags.segment;
  irama = irama || flags.irama;
  counter = (counter===0) ? 0 : counter || pulse%now.pp.gongan;
  play = play || false;
  parts[i] = part("generate",i,segment,irama,counter,play)
};
partsSet = function(segment,irama,counter,play) {
  segment = segment || flags.segment;
  irama = irama || flags.irama;
  counter = (counter===0) ? 0 : counter || pulse%now.pp.gongan;
  play = play || true;
  for (var i=0;i<instrCnt;i++) {
    partSet(i,segment,irama,counter,play);
  };
  return "All parts changed to "+segment;
};
partSet = function(i,segment,irama,counter,play) {
  segment = segment || flags.segment;
  irama = irama || flags.irama;
  counter = (counter===0) ? 0 : counter || pulse%now.pp.gongan;
  play = play || true;
  var seqs = part("regen",i,segment,irama,counter,play); // careful! Counter is not well thought out yet. What happens if a part is not regenerated at gong (pulse != 0))
  parts[i].counter = counter;
  parts[i].active = play;
  parts[i].note = seqs.frequencies;
  parts[i].durations = seqs.durations;
  parts[i].amp = seqs.amp;
  parts[i].attack = seqs.attack;
  parts[i].decay = seqs.decay;
  parts[i].waveShape = seqs.waveShape;
  parts[i].offset = seqs.offset;
  parts[i].slaves = seqs.slaves;
  return "Part regenerated";
};
// combines Information from garap (partgeneration), gamelan (instrumentdefinition) and nyaga (persons)
part = function(target,iIx,segment,irama,counter,play) {
  (iIx===0) ? 0 : iIx || ixBukaInstr;
  segment = segment || flags.segment;
  irama = irama || flags.irama;
  counter = (counter===0) ? 0 : counter || pulse%now.pp.gongan;
  play = play || false;
  var iName = iNames[iIx];
  var instr = now.instruments[iName];
  var toneCiphers = instr.toneCiphers;
  var scale = scales[iIx];
  var pName = pNames[iIx];
  var person = nyaga[pName];
  var waveShape = instr.waveShape;
  var part = garap[iName](segment,irama);
  var degrees = part.sequence;
  var durations = part.durations;
  var ampInstr = instr.amp;
  var ampPart = part.amp;
  var ampPerson = person.amp;
  var attackInstr = instr.attack;
  var attackPart = part.attack;
  var attackPerson = person.attack;
  var decayInstr = instr.decay;
  var decayPart = part.decay;
  var decayPerson = person.decay;
  var offsetPart = part.offset;
  var offsetPerson = person.lag;
  var synth = synths[iIx];
  var cntScale = scale.length;
  var cntDegrees = degrees.length;
  var cntDurs = durations.length;
  var cntAmps = ampPart.length;
  var cntAttack = attackPart.length;
  var cntDecay = decayPart.length;
  var cntWaveShape = waveShape.length;
  var freqs = [];
  var durs = [];
  var amps = [];
  var attacks = [];
  var decays = [];
  var waveShapes = [];
  var lag = offsetPart * offsetPerson; // lag and offset should not be mixed - offset is technical, lag musical
 
  for (var i=0;i<cntDegrees;i++) {
    normIx = toneCiphers.indexOf(degrees[i]);
    switch (iName) {
      case "kendhang" : freqs.push(degrees[i]); break;
      default : (degrees[i] || degrees[i] === 0) ? freqs.push(scale[normIx]) : freqs.push(undefined);
    }
    (conf.pulseMode) ? durs = [pulseUnit] : (cntDurs === 1) ? durs.push(durations[0]) : durs.push(durations[i]);
    (cntAmps === 1) ? amps.push((ampPart[0]*ampInstr[normIx]*ampPerson) || undefined) : amps.push((ampPart[i]*ampInstr[normIx]*ampPerson) ||  undefined);
    (cntAttack === 1) ? attacks.push((attackPart[0]*attackInstr[normIx]*attackPerson) || undefined) : attacks.push((attackPart[i]*attackInstr[normIx]*attackPerson) || undefined);
    (cntDecay === 1) ? decays.push((decayPart[0]*decayInstr[normIx]*decayPerson) || undefined) : decays.push((decayPart[i]*decayInstr[normIx]*decayPerson) || undefined);
    (cntWaveShape === 1) ? waveShapes.push(waveShape[0]) : waveShapes.push(waveShape[normIx]);
  }
  if (target === "generate") {
    return Seq({ active : play, note : freqs, durations : durs, amp : amps, attack : attacks, decay : decays, waveShape : waveShapes, counter : counter, offset : lag, slaves : synth });
  } else {
    return { frequencies : freqs, durations : durs, amp : amps, attack : attacks, decay : decays, waveShape : waveShapes, counter : counter, offset : lag, slaves : synth }
  }
};
speedReset = sr = parts.all( function(obj) { obj.durations = _4/now.ppb; } );
// UTILS #######################################################################
interlace = function(array, element) {
  element === element || undefined; 
  for (var i=1;i<array.length;i=i+2) {
    array.splice(i,0,element)
  };
  array.push(element); 
  };
interlaceCnt = function(spb,irama,snapper) {
  if (snapper) {
    var cnt = (now.ppb / (spb *kar.irFactor(irama)));
  } else {
    var cnt = now.ppb / spb;
  }
  return (Math.log(cnt)/Math.log(2));
};
clump = function(array,clumpSize) {
  clumpSize = clumpSize || 1;
  var cnt = array.length;
  var clumpedArray = [];
  if (clumpSize === 1) {
    for (var i in array) { var j=(array[i])?[array[i]]:undefined; clumpedArray.push(j)};
  } else if (clumpSize > 1 && clumpSize < cnt) {
    var iterations = Math.floor(cnt/clumpSize);
    for (var i=0;i<cnt;i=i+clumpSize) {
      clumpedArray.push(array.slice(i,i+clumpSize));
    }
  } else {
      alert("The clump-size must be 1 or larger and smaller than the amount of elements in the array")
  };
  return clumpedArray;
};
capFirst = function(word) { return word.charAt(0).toUpperCase()+word.slice(1) };
nUndefined = function(amount) {
  var udf = [];
  for (var i=0;i<amount;i++) { udf.push(undefined); }
  return udf;
};
any = function(arrays) {
  return arrays[rndi(0,(arrays.length-1))];
}
// NOTATION-Parser #############################################################
// creates a bal-array whithout unused elements
degree = dg = function(string) {
  var dia = ["1.","2.","3.","4.","5.","6.","7.","1","2","3","4","5","6","7","1'","2'","3'","4'","5'","6'","7'"];
  var degrees = [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
  return degrees[dia.indexOf(string)];
}
dia = function(number) {
  var degrees = [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
  var dia = ["1.","2.","3.","4.","5.","6.","7.","1","2","3","4","5","6","7","1'","2'","3'","4'","5'","6'","7'"];
  return dia[degrees.indexOf(number)];
}
cleanNut = function(notation) {
  var cnt = notation.length;
  var strip = "^)@ \n\t\r";
  var clean = "";
  for (var i=0;i<cnt;i++) {
    if (strip.indexOf(notation[i]) === -1) { clean = clean.concat(notation[i]) }
  }
  return clean;
}
cleanKendhangan = function(notation) {
  var cnt = notation.length;
  var strip = "'^)@ \n\t\r";
  var clean = [];
  for (var i=0;i<cnt;i++) {
    var ini = notation[i];
    if (strip.indexOf(ini) === -1) { (ini===".") ? clean.push(undefined) : clean.push(ini); }
  }
  return clean;
}
ciphersOnlyNut = function(notation) { // returns string (with minus) - simple, needs testing, use degreesOnlyNut for something more relyable (multiOctave)
  var cnt = notation.length;
  var strip = "undefined^)@ .,-_='\n\t\r";
  var clean = "";
  for (var i=0;i<cnt;i++) {
    if (strip.indexOf(notation[i]) === -1) { clean = clean.concat(notation[i]) }
  }
  return clean;
}
diaNut = function(notation) {
  var cnt = notation.length;
  var strip = "^)@ \n\t\r";
  var dia = [];
  for (var i=0;i<cnt;i++) {
    if (strip.indexOf(notation[i]) === -1) { dia.push((notation[i]==="-") ? undefined : (!isNaN(notation[i])) ? +notation[i] : notation[i]) }
  }
  return dia;
};
degreesNut = function (notation) {
  var dia = diaNut(notation);
  var cnt = dia.length;
  var degrees = [];
  for (var i=0;i<cnt;i++) {
    var ini = dia[i];
    var next = dia[i+1];
    ini = (".".indexOf(next) === 0 ) ? ini-7 : ("'".indexOf(next) === 0 ) ? ini+7 : ini;
    degrees.push(ini);
    i = (".'".indexOf(next) > -1) ? i+1 : i;
  }
  return degrees;
};
degreesOnlyNut = function(notation) { // strips rhythm diacritics and undefined
  var degrees = degreesNut(notation);
  var cnt = degrees.length;
  var strip = "_=";
  var clean = [];
  for (var i=0;i<cnt;i++) {
    if ((degrees[i] || degrees[i] === 0) && strip.indexOf(degrees[i]) === -1) { clean.push(degrees[i]) }
  }
  return clean;
};
soNut = function(notation) { // can handle moDegrees, but only if passed in as array (can't regognize 2-digit numbers in strings)
  var dia = diaNut(notation);
  var cnt = dia.length;
  var strip = ".'";
  var deDia = [];
  var sOct = [];
  for (var i=0;i<cnt;i++) {
    if (strip.indexOf(dia[i]) === -1) { deDia.push(dia[i]); }
  }
  cnt = deDia.length;
  for (var i=0;i<cnt;i++) {
    var ini = deDia[i];
    isNaN(ini) ? sOct.push(ini) : (ini > 7) ? sOct.push(ini-7) : (ini < 1) ? sOct.push(ini+7) : sOct.push(ini);
  }
  return sOct;
};

pulseNut = function(notation,spb,ppb) {
  spb = spb || 1; // strokes per beat - for "snappers" this changes with irama (accounted for in "garap")
  ppb = ppb || now.ppb;
  var amps = [];
  if (typeof notation[0] === "object" ) {
    degrees = degreesNut(notation[0]);
    amps = notation[1];
  } else {
    degrees = degreesNut(notation);
    amps = [1];
  }
  var result = [];
  var pFactor = ppb/spb;
  var cnt = degrees.length;
  var pulseDegrees = [];
  var pulseAmps = [];
  for (var i=0;i<cnt;i++) {
    var ini=degrees[i];
    var next=degrees[i+1];
    var iniAmp = amps[i]; // this is messy, because the amps-array only contains 1 member for many instruments
    var pCnt = (next==="=") ? (pFactor/4)-1 : (next==="_") ? (pFactor/2)-1 : pFactor-1; // this will fail if subdivisional depth is not big enough for notation used
    pulseDegrees.push(ini);
    pulseAmps.push(iniAmp);
    for (var j=0;j<pCnt;j++) { pulseDegrees.push(undefined); pulseAmps.push(undefined); };
    i = ("_=".indexOf(next) > -1) ? i+1 : i;
  }
  result = (typeof notation[0] === "object") ? [pulseDegrees,pulseAmps,[pulseUnit]] : [pulseDegrees, [pulseUnit]];
  return result;
};

dursNut = function(notation,spb,ppb) {
  spb = spb || 1; // strokes per beat (*not* samples per pulse)
  ppb = ppb || now.ppb;
  var pFactor = ppb/spb;
  var pulseNotation = pulseNut(notation,spb);
  var pulses = pulseNotation[0];
  var pUnit = pulseNotation[1];
  var placeHolder = pulses[0] || 69; // prevents irritations if segment starts with undefined (69 must be replaced by something decent at the end)
  var degrees = [placeHolder];
  var durCnts = []
  var durs = [];
  var cnt = pulses.length;
  var durCnt = 1;
  for (var i=1;i<cnt;i++) {
    var ini = pulses[i];
    if (ini || ini === 0) { durCnts.push(durCnt); degrees.push(ini); durCnt = 1; } else {  durCnt++; };
    if (i===cnt-1) { durCnts.push(durCnt) };
  }
  var dCnt = durCnts.length;
  for (var i=0;i<dCnt;i++) {
    var ini = durCnts[i];
    var proportion = pUnit*ini;
    durs.push(proportion);
  }
  if (degrees[0] === 69) { degrees[0] = undefined; }
  return [degrees,durs];
};
bukaPadding = function(size,ppb,pulseMode) {
  size = size || now.bukaLength;
  ppb = ppb || now.ppb;
  pulseMode = (pulseMode===0) ? false : conf.pulseMode;
  var degrees = [];
  var durs = [];
  var amps = [0];
  var pulses = size*ppb;
  degrees = pulseMode ? degrees.concat(nUndefined(pulses)) : degrees.concat([undefined]);
  durs = pulseMode ? durs.concat([pulseUnit]) : durs.concat([beatUnit*size]);
  return [degrees,durs,amps];
};
// shiftGong = function(degrees,durs,amps,n) {
shiftGong = function(degrees,durs,amps,cnt,n) {
  cnt = cnt || 0; // prevent shifting if no cnt-par is passed in - cnt is calculated form instrument- and settings-data (could easily contain hickups)
  n = n || 1; // this is mainly for peking that has 2 gong-tones ( peking stutters, nobody said that more beautifully than superCollider)
  var end = degrees.length-1;
  var ix = end;
  for (var i=0;i<(n*cnt);i++) {
    var e = degrees.pop();
    if (durs.length>1) { var u = durs.pop(); }
    if (amps.length>1) { var a = amps.pop(); }
    degrees.unshift(e);
    if (durs.length>1) { durs.unshift(u); }
    if (amps.length>1) { amps.unshift(a); }
  }
  return [degrees,durs,amps];
};
popGong = function(degrees,durs,amps,cnt,n) {
  cnt = cnt || 0;
  n = n || 1;
  var end = degrees.length-1;
  var ix = end;
  for (var i=0;i<(n*cnt);i++) {
      degrees.pop();
      degrees.unshift(undefined);
      if (durs.length>1) { durs.pop(); durs.unshift(undefined); }
      if (amps.length>1) { amps.pop(); amps.unshift(undefined); }
  }
  return [degrees,durs,amps]
};
// SNOOPING/TESTS ##############################################################
tests = {
  partsLength : function() {
    console.log(flags.form+" "+flags.gendhing+" "+flags.pathet+" "+flags.segment+" "+flags.irama)
    console.log("values should not be 0 and the same for all properties off a part, except for offset and slaves (which should be 1)")
    cnt = parts.length;
    for (var i=0;i<cnt;i++) {
      var address = (nyaga[pNames[i]].sex ==="female") ? "mBak" : "Mas";
      var pName = capFirst(pNames[i]);
      console.log("\n"+iNames[i]+" featuring "+address+" "+pName);
      console.log("frequencies: "+parts[i].note.length);
      console.log("durations:   "+parts[i].durations.length);
      console.log("amp:         "+parts[i].amp.length);
      console.log("attack:      "+parts[i].attack.length);
      console.log("decay:       "+parts[i].decay.length);
      console.log("waveShape:   "+parts[i].waveShape.length);
      console.log((parts[i].offset===0) ? "offset:      1" : "offset:      "+parts[i].offset.length);
      console.log("slaves:      "+parts[i].slaves.length);
    }
    return "done"
  }
};
