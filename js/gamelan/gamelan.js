// gamelanScript ###############################################################
// by Rainer Schuetz (2012) for 
// GIBBER
// by Charlie Roberts
// 2011,2012
// MIT License
// #############################################################################
// Global Variables - prevent restrict vis to function
var parts = [], synths = [], scales = [], iNames = [], pNames = [], now = {},
instrCnt = 0, gPulse, parts, _32;
conf = { // these settings can change (that are the plans ;)), but they are more low-level than flags.
  irLevels : 2, // pow of 2 for pulses. Speed-levels for now just irI and II irLevels & sdLevels overlap by one.
  sdLevels : 2, // pow of 2. Subdivision-levels relative to irama. ppb is Math.pow(2,(conf.irLevels+conf.sdLevels-1)) - notation-parsers don't support sdLevels:3 yet
  timeKeeper : "peking",
  synthPref : "light", // currently standard or light - standard will use FM-synthesis if available, but it is too heavy for most computers in 2012
  soMode : true, // if false, balungan-notation will be used with minimal processing (just cleaning) (mind beginning of ngelik!)
  pulseMode : true, // pulseMode creates durations from a mini-Pulse while propMode or dursMode uses individual durations for each note (the later doesn't work well yet, problems with offset, but is probably more consistent on the long run)
  audioHost : "http://localhost",
  audioPath : "gamelan/audiofiles",
  useSamples : true
};
par = {
  tooFast : 2500,
  thresholdTanggung : 5500,
  bufferTanggung : 500,
  thresholdDadi : 7500,
  bufferDadi : 500,
  tooSlow : 14000, // in the future a keteg-based value might be cleverer
  speedDiffMul : 1.05,
  suwukDiffMul : 1.3,
  suwukThresholdIrI : 6000,
  suwukThresholdIrII : 9000,
  lagMinMul : 1,
  lagMaxMul : 1,
  lagMinAdd : 0,
  lagMaxAdd : 0,
  transpose : 1,
  stretch : 1,
  get ppb() { return Math.pow(2,(conf.irLevels+conf.sdLevels-1)) },
  get lagGongSuwuk() { return _4 }, // will eventually become something more fancy
  get lagPastGongSuwuk() { return rndi(1000,4500) },
  get lagGongBuka() { return _64+rndi(1000,3000) }
};

toggle = { // onOff
  lag : false,
  lagBuka : false,
  lagGongBuka : false,
  lagGongSuwuk : false,
  watchDogs : true, // watchdogs do things like trigger irama-switch or set a ngelik-flag and try to keep the piece stable
  autoPilot : true,
  logGongan : true,
  logAutoPilot : true,
  logBranching : true,
  logWatchDogs : true,
  logUserInput : true,
};
now = { // contextual/temporal information - depend on above values and performance state
  get ppb() { return Math.pow(2,(conf.irLevels+conf.sdLevels-1)) },
  get beatUnit() { return 4*pulseUnit },
  get bpm() { return (this.beatUnit() === _4) ? init.bpm : (this.beatUnit() === _2) ? init.bpm*2 : (this.beatUnit() === _1) ? init.bpm*4 : alert(msg.alert.beatWarning); }, // This is not used yet. because min-Pulse is _64 beatUnit must adapt if too many irLevels and/or sdLevels are introduced. bpm must adjust accordingly (not tested).
  get laras() { return (flags.pathet.indexOf("p") === 0) ? "pelog" : "slendro"; },
  get balObj() { return notation.balungan[flags.gendhing][flags.form][flags.pathet]; },
  get kdhObj() { return notation.kendhangan[kar.kendhanganType()][flags.form]; },
  get balungan() { return this.balObj[flags.segment]; },
  get kendhangan() { return this.kdhObj[flags.irama][flags.segment]; },
  get bukaLength() { return kar.protoBal(this.balObj.buka).length },
  get gongTone() { return degreesOnlyNut(now.balObj[flags.segment]).pop(); },
  get firstTone() { return degreesOnlyNut(now.balObj[flags.segment])[0]; }, // first tone-symbol (note/cipher) as opposed to undefined
  get gamelan() { return gamelan[flags.gamelanName][this.laras]; },
  get tuning() { return this.gamelan["tuning"]; },
  get instruments() { return this.gamelan["instruments"]; },
  pp : {
    get keteg() { return now.ppb/(2*kar.irFactor(flags.irama)) },
    get sabet() { return now.ppb },
    get tiba() { return now.ppb*2 },
    get gatra() { return now.ppb*4 },
    get kempyangan() { return kar.gongan("kempyang")[1]*now.ppb }, //
    get kethukan() { return kar.gongan("kethuk")[1]*now.ppb }, //
    get kempulan() { return kar.gongan("kempul")[1]*now.ppb }, // wela not taken into account
    get kenongan() { return kar.gongan("kenong")[1]*now.ppb },
    get gongan() { return kar.gongan("gong")*now.ppb; },
    get buka() { return now.bukaLength*now.ppb; },
  },
  p2nth : {
    keteg : function(n) { return n*now.pp.keteg },
    sabet : function(n) { return n*now.pp.sabet },
    kethuk : function(n) { var first = kar.gongan("kethuk")[0], period = kar.gongan("kethuk")[1]; return (first+(period*(n-1)))*now.ppb; },
    gatra : function(n) { return n*now.pp.gatra },
    kempul : function(n) { var first = kar.gongan("kethuk")[0], period = kar.gongan("kethuk")[1]; return (first+(period*(n-1)))*now.ppb; },
    kenong : function(n) { return n*now.pp.kenongan }
  },
  pm : {
    get sabet() { return ((G.sampleRate*60)/(pulseUnit*now.ppb)).toFixed(2) },
    get keteg() { return ((G.sampleRate*120*kar.irFactor(flags.irama))/(pulseUnit*now.ppb)).toFixed(2) }
  }
};
// flags for state monitoring (no user-interference expected)
flags = {
  gendhing : "wilujeng",
  pathet : "p7",
  form : "ladrang",
  garap : "gerongan-salisir",
  bukaInstr : "bonangBar",
  gamelanName : "generic",
  segment : "buka", // select segment to start with
  irama : (this.form === "lancaran") ? "ir0": "irI", // select irama to start with - adjust speed (G.setBPM(60)) if you want to start in irII
  bpm : 120,
  firstGongan : false,
  goToNgelik : false,
  seseg : false,
  rem : false,
  ngampat : false,
  habisNgampat : false,
  fastForward : false,
  doSuwuk : false,
  isGonganSuwuk : false
};
pulseUnit = (now.ppb === 8) ? _32 : (now.ppb === 16) ? _64 : (now.ppb === 32) ? _64 : (now.ppb === 64) ? _64 : undefined;

// MESSAGES ####################################################################

msg = {
  console : {
    afterBuka : "Nice buka, we just entered the the first gongan.\nHaven't you always wanted to be here?\n***\nDid you notice the speed-change?\nYou can speed up by typing su() and slow down with sd().\nReturn to steady state with ss().\n\n",
    afterFirstGongan : {
      irI : "Repeating first gongan before going to ngelik.\nYou should consider going to irII - it's interesting. Type sd() to do so.\n\n",
      irII : "Repeating first gongan before going to ngelik.\nWow, you made a quick move to Ir II - you seem to know your way. A true Gamelan-aficionado doesn't care much about irama tanggung (except Pak Ribta) ;)\n\n"
    },
    defaultBranch : "Returning to umpak - not sure why... (check branching and flags.segment etc.\nSomething seems wrong... - this rule should never fire, it is a warning.)\n\n",
    findGoToNgelik : {
      irI : "You chose to enter ngelik - cool! Even cooler had you chosen to go to irII. As it is there won't be poetry. Some groups wouldn't actually go to the ngelik in 'pending' irama.\n\n",
      irII : "You chose to enter ngelik - cool! You are in irII - there should be poetry sung by male vocalists (gerongan). But this is only for the bright and remote future ;)\n\n"
    },
    notFindGoToNgelik : {
      irI : "You (probably) chose to enter umpak - or: you (unknowingly) chose not to enter ngelik.\nYou should consider going to irII - it's fun.\nRemember: to enter ngelik type goToNgelik() at a prompt.\To speed down, type sd()\nThere is also su()\n\n",
      irII : "You (probably) chose to enter umpak - or: you (unknowkingly) chose not to enter ngelik.\nIn irII most groups would go to ngelik as often as possible. After all this is about poetry...\nRemeber: to enter ngelik type goToNgelik() at a prompt. That will bring you to the ngelik after the gong. If you've had enough try end()\n\n"
    },
    onWatchDogTriggerNgelikSign : "Watchdog triggered ngelik-signal",
    onWatchDogToSteadySpeed : function() { return "Watchdog switched to steady speed at a gPulse-duration of "+pulseUnit },
    onAutoSteadySpeed : function() { return "Autopilot switched to steady speed at a gPulse-duration of "+pulseUnit },
    onWatchDogToIrI : function() { return "Watchdog switched to IrI at a gPulse-duration of "+pulseUnit },
    onWatchDogToIrII : function() { return "Watchdog switched to IrII at a gPulse-duration of "+pulseUnit },
    onSlowingDown : function() { return "Starting to slow down at a gPulse-duration of "+pulseUnit },
    onAutoSlowDown : function() { return "Autopilot started to slow down at a gPulse-duration of "+pulseUnit },
    onSpeedingUp : function() { return "Starting to speed up at a gPulse-duration of "+pulseUnit },
    onAutoSpeedUp : function() { return "Autopilot started to speed up at a gPulse-duration of "+pulseUnit },
    onStartPlaying :
      "\nWelcome again!\n"+
      "Glad you found the way in!\n"+
      "Have fun!\n\n",
    onSetNgelikFlag : "Message to switch to ngelik in next gongan announced (flags.goToNgelik set)",
    onAutoSetSuwukFlag : "Suwuk intention announced by autopilot (set flags.doSuwuk)",
    onSetSuwukFlag : "Going into suwuk-mode (set flags.doSuwuk)",
    onWatchDogReinforceSuwukMode : "Watchdog found suwuk flag, announced final gongan, switched to kendhangan suwuk and started speeding up a bit",
    onWatchDogToFinalSlowdown : "Starting slow down to end on gong",
    onGongSuwuk : "This is the End. Not a nice suwuk yet, but hey, it stopped on the gong!\nIf you have ideas how to make this better, please tell us or send patches...\nThere will be more, stay tuned.\n",
    onEnteringNgelik : {
      irI : "Entering ngelik. You are still in irI - there won't be poetry.\nSome groups wouldn't actually go to the ngelik in 'pending' irama.\nType sd() or speedDown() to go to the slow speed-level\n\n",
      irII : "Entering ngelik You are in irII - there should be poetry sung by male vocalists (gerongan).\nBut this is only for the bright and remote future ;).\nAt some point you might want to stop organically.\nTry typing end() or nyuwuk()\n\n"
    },
    onEnteringUmpak : {
      irI : "Leaving ngelik and returning to umpak You are still in irI!\nYou should really consider slowing down to irII - otherwise you'll miss the nicer part.\nOr are you one of those heavy metall guys like Pak Ripta? In that case you should turn up the volume!\nJust try sd() - you can speed up again with su()\n\n",
      irII : "Leaving ngelik and returning to umpak.\nIf there had been gerongan it would stop now.\n\n"
    },
    onGong : function() {
        return "GONG "+nthGong+"!   "+
        this.onSabet(+soNut(dia(now.gongTone)).join())+"\n"+
        "***"
      },
    onKenong : function() {
        var checkBuka;
        if (flags.segment !== "buka") { checkBuka = "Kenong "+nthNong+"! " } else { checkBuka = "          " };
        return checkBuka+
        this.onSabet()
      },
    onKempul : function() {
        var checkBuka;
        if (flags.segment !== "buka") { checkBuka = "Pul       " } else { checkBuka = "          " };
        return checkBuka+
        this.onSabet()
      },
    onWela : function() {
        var checkBuka;
        if (flags.segment !== "buka") { checkBuka = "Empty     " } else { checkBuka = "          " };
        return checkBuka+
        this.onSabet()
      },
    onGatra : function() {
        var checkBuka;
        if (flags.segment !== "buka") { checkBuka = "Gatra-end " } else { checkBuka = "          " };
        return checkBuka+
        this.onSabet()
      },
    onKethuk : function() {
        var checkBuka;
        if (flags.segment !== "buka") { checkBuka = "Thuk      " } else { checkBuka = "          " };
        return checkBuka+
        this.onSabet()
      },
    onKempyang : function() {
        var checkBuka;
        if (flags.segment !== "buka") { checkBuka = "Pyang     " } else { checkBuka = "          " };
        return checkBuka+
        this.onSabet()
      },
    onSabet : function(cipher) {
        var toneCipher = cipher || gdhNotation[nthSabet-1] || "-"
        return "Tonecipher: "+toneCipher+" ("+
        "Ticker:"+ticker+" "+
        "(gPulse:"+gPulse+")"+" "+
        "Sabet:"+nthSabet+" "+
        "Gatra:"+nthGatra+" "+
        "Keteg:"+(keteg-1)+") "+
        "Irama:"+flags.irama+" "+
        "Speed: ["+
          "sabet-pm:"+now.pm.sabet+" | "+
          "keteg-pm:"+now.pm.keteg+"]"
      }
  },
  gibber : {
    onLoad : ""
  },
  alert : {
    missingGonganInfo : "Missing gongan information or request for part-data that does not exist. Check kar.gongan",
    missingIramaFactor : "Irama not yet defined (kar.irFactor missing or out of range)",
    missingKendhanganInfo : "Kendhagan-type not yet defined (check kar.kendhanganType)",
    beatWarning : "Unhandled ratio of pulses per beat - system can't cope. Problably conf.irLevels and/or conf.sdLevels are too high or wrong. 4 irLevels and 3 sdLevels are the theoretical maximum in pulseMode. System is only tested to work for 2-2."
  },
  prompt : {
    selectGendhing : "",
    selectPathet : ""
  },
  returnInfo : {
    allPlay : function() { return "Started playing at counter "+tk.counter; },
    allOnce : function() { return "Playing sequence once. Started at counter "+tk.counter; },
    allStop : function() { return "Stopped playing. Reset counter to "+tk.counter; },
    allPause : function() { return "Paused playing at counter "+tk.counter; },
    allKill : function() { return "Killed all playing sequences. ("+tk.counter+")"; }
  }
};

// HELP ########################################################################

help = {
  sdLevels : "Subdivision-level account for rhythmical depth in the pulse-based notation. The higher the number, the more rhythmic variablility - but also higher ressource consumption. To describe speed and rhyhtm in Javanese Gamelan-Music we need to distinguish two types of beats - a fully elastic one - which can slow-down and speed up roughly 4 subdivision-levels (sabet). And the less elastic beat, that snaps back (keteg). In a pulse-based notation we need to account for potential subdivision from the beginning, or use offsets and add subdivision levels, when slowdowns occure (tricky, but less expensive).",
  bonangan : "Contextual factors that contribute to pattern-distribution could be represented by tags (semantic), melodic adjacent patterns and monitoring of metric position. Not sure which data structure is best, JSON maybe too hierarchical? Bonangan is so generative in nature, that a more ambitious approach would try to implement algorithms that generate bonangan, rather than pick static (but randomly alternating) data from a dictionary, as is done here for a quick start. Another challenge is to write patterns with most adequate genericity: some patterns, for example the basic mipil-pattern, can be applied to almost any balungan (without looking at pathet or metrics), while others require very specific contexts. Controling pattern selection by contextual factors still requires significant adjustments in the garap module. There evaluation of context is currently very limited."
}


// CONTROL #####################################################################

instrFrequencies = function (iName) {
  if (typeof(iName)==="object") {
    var instr = iName;
  } else {
    var instr = now.instruments[iName];
  }
  var tuning = now.tuning;
  var detune = instr.detuneSynth;
  var globalTrans = par.transpose;
  var globalStretch = par.stretch;
  var octaveReg = instr.octave;
  var instrStretch = instr.stretch;
  var instrDetune = detune[0]
  var tonesDetune = detune[1]
  var iScale = instr.notes;
  var cnt = iScale.length;
  var nScale = (now.laras==="pelog") ? [1,2,3,4,5,6,7] : [1,2,3,5,6];
  var scale = [];
  for (var i = 0; i < cnt; i++ ) {
    var note = iScale[i];
    var wrap = (note>7) ? note-7 : (note<1) ? note+7 : note; // this allows for 3 octaves (only)
    scale.push( tuning[nScale.indexOf(wrap)] * globalTrans * instrDetune * tonesDetune[i] * (Math.pow(2,octaveReg[i]-1))/8 * instrStretch * globalStretch); 
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
  counter = (counter===0) ? 0 : counter || gPulse%now.pp.gongan;
  play = play || false;
  parts = [];
  for (var i=0;i<instrCnt;i++) {
    parts.push(Seq(part("generate",i,segment,irama,play)));
  };
  return "All parts generated";
};
partGen = function(i,segment,irama,counter,play) {
  segment = segment || flags.segment;
  irama = irama || flags.irama;
  counter = (counter===0) ? 0 : counter || gPulse%now.pp.gongan;
  play = play || false;
  parts[i] = part("generate",i,segment,irama,counter,play)
};
partsSet = function(segment,irama,counter,play) {
  segment = segment || flags.segment;
  irama = irama || flags.irama;
  counter = (counter===0) ? 0 : counter || gPulse%now.pp.gongan;
  play = play || true;
  for (var i=0;i<instrCnt;i++) {
    partSet(i,segment,irama,counter,play);
  };
  return "All parts changed to "+segment;
};
partSet = function(i,segment,irama,counter,play) {
  segment = segment || flags.segment;
  irama = irama || flags.irama;
  counter = (counter===0) ? 0 : counter || gPulse%now.pp.gongan;
  play = play || true;
  var seqs = part("regen",i,segment,irama,counter,play); // careful! Counter is not well thought out yet. What happens if a part is not regenerated at gong (gPulse != 0))
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
  counter = (counter===0) ? 0 : counter || gPulse%now.pp.gongan;
  play = play || false;
  var iName = iNames[iIx];
  var instr = now.instruments[iName];
  var notes = instr.notes;
  var scale = scales[iIx];
  var pName = pNames[iIx];
  var person = nyaga[pName];
  var waveShape = instr.waveShape;
  var part = garap[iName](segment,irama);
  var degrees = part.sequence;
  var durations = part.durations;
  var ampInstr = (!conf.useSamples && !instr.samplesOnly) ? instr.ampSynth : instr.ampSamp;
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
    normIx = notes.indexOf(degrees[i]);
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
    return { active : play, note : freqs, durations : durs, amp : amps, attack : attacks, decay : decays, waveShape : waveShapes, counter : counter, offset : lag, slaves : synth };
  } else {
    return { frequencies : freqs, durations : durs, amp : amps, attack : attacks, decay : decays, waveShape : waveShapes, counter : counter, offset : lag, slaves : synth };
  }
};
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
degree = dg = function(dia) {
  var dias = ["5..","6..","7..","1.","2.","3.","4.","5.","6.","7.","1","2","3","4","5","6","7","1'","2'","3'","4'","5'","6'","7'"];
  var degrees = [-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
  return degrees[dias.indexOf(dia)];
}
degree2so = dg2so = function(degree) {
  return (degree-7>0) ? degree-7 : (degree+7<1) ? degree+14 : (degree+7<8) ? degree+7 : degree;
}
dia = function(degree) {
  var degrees = [-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
  var dia = ["5..","6..","7..","1.","2.","3.","4.","5.","6.","7.","1","2","3","4","5","6","7","1'","2'","3'","4'","5'","6'","7'"];
  return dia[degrees.indexOf(degree)];
}
jirolu = function(degree) {
  var degrees = [-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
  var jirolu = ["__ma","__nem","__pi","_ji","_ro","_lu","_pat","_ma","_nem","_pi","ji","ro","lu","pat","ma","nem","pi","ji_","ro_","lu_","pat_","ma_","nem_","pi_"];
  return jirolu[degrees.indexOf(+degree)];
}
taktak = function(symbol) {
  var taktak = ["bem","dhah","thung","tak","ket","kret","thong","tap"];
  var symbols = ["B","b","p","t","k","r","o","a"];
  return taktak[symbols.indexOf(symbol)]
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
  spb = spb || 1; // strokes per beat (*not* samples per gPulse)
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

// NOTATION ####################################################################

notation = {};
notation.balungan = {
  wilujeng: {
    ladrang: {
      p7: {
        buka: "7.32 6.7.23 7.7.32 -7.5.6.@",
        umpak: "27.23 27.5.6.) 33--^ 6532) 5653^ 27.5.6.) 27.23^ 27.5.6.@",
        ngelik: "--6- 7576) 3567^ 6532) 66--^ 7576) 7732^ -7.5.6.@"
      },
      p5: {
        buka: "6.21 5.6.12 6.6.21 -6.4.5.@",
        umpak: "16.12 16.4.5.) 22--^ 5421) 4542^ 16.4.5.) 16.12^ 16.4.5.@",
        ngelik: "--5- 6465) 2456^ 5421) 55--^ 6465) 6621^ -6.4.5.@"
      },
      sm: {
        buka: "132 6.123 1132 -126.@",
        umpak: "2123 2126.) 33--^ 6532) 5653^ 2126.) 2123^ 2126.@",
        ngelik: "--6- 1'51'6) 3561'^ 6532) 66--^ 1'51'6) 1'1'32^ -126.@"
      }
    }
  }
};
notation.bonangan = {
  "s6" : {},
  "s9" : {},
  "sm" : {},
  "p5" : {},
  "p6" : {},
  "p7" : {
    "irI" : {
      "mipil" : {
        "bp" : {
          "mlaku" : {
            "seleh" : {
              "6." : [
                ["27.2- 27.2- 5.7.5.- 6.6.5.6."],
                ["27.5.- 5.7.5.- 5.7.5.- 6.6.7.6."]
              ]
            },
            "gantF" : {
              "6" : [
                ["27.6.6. 6-6.6 -6.6- 6.6--"],
                ["27.6.6. 6--6 --6- -6--"]
              ],
              "3" : []
            },
            "gantH" : {
              "6" : [
                ["27.6.6. 6-6.6"],
                ["27.6.6. 6--6"]
              ],
              "7" : []
            }
          },
          "nibani" : {}
        },
        "bb" : {
          "mlaku" : {
            "seleh" : {
              "6." : [
                ["27.5.- 6.6.7.6."],
                ["27.5.6. 6.7.-6."],
                ["27.5.- 6.7.-6."],
                ["27.5.- 6.7.--"]
              ]
            },
            "gantF" : {
              "6" : [
                ["27.6.6. 6-6.6"],
                ["27.6.6. 6--6"]
              ],
              "3" : []
            },
            "gantH" : {
              "6" : [],
              "7" : []
            }
          },
          "nibani" : {}
        }
      },
      "cegatan" : { bp : {}, bb : {} },
      "imbalan" : { bp : {}, bb : {} }
    },
    "irII" : {
      "mipil" : {
        "bp" : {
          "mlaku" : {
            "seleh" : {
              "6." : [
                ["27.2- 27.2- 5.7.5.- 5.7.5.- 5.7.5.- 5.7.5.- 5.7.5.- 6.6.7.6."],
                ["275.- 5.7.5.- 5.7.5.- 5.7.5.- 5.7.5.- 5.7.5.- 5.6.5.- 6.7.-6."]
              ]
            },
            "gantF" : {
              "6" : [
                ["27.6.6. 6-6.6 -6.6- 6.6-6. 6-6.6 -6.6- 6.6-6. 6-6.6"],
                ["27.6.6. 6--6 --6- -6-- 6--6 --6- -6-- 6--6"]
                ],
              "3" : []
            },
            "gantH" : {
              "6" : [
                ["27.6.6. 6--6 --6- -6--"],
                ["27.6.6. 6-6.6 -6.6- 6.6--"]
              ],
              "7" : []
            }
          },
          "nibani" : {}
        },
        "bb" : {
          "mlaku" : {
            "seleh" : {
              "6." : [
                ["27.5.5. 5.7.-- 5.7.5.- 6.6.7.6."],
                ["27.5.5. 5.7.-- 5.7.5.6. 6.7.-6."]
              ],
            },
            "gantF" : {
              "3" : [],
              "6" : [
                ["27.6.6. 6-6.6 -6.6- 6.6--"],
                ["27.6.6. 6--6 --6- -6--"]
              ],
            },
            "gantH" : {
              "6" : [
                ["27.6.6.6-6.6"],
                ["27.6.6.6--6"]
              ],
              "7" : [],
            }
          },
          "nibani" : {}
        }
      },
      "cegatan" : { bp : {}, bb : {} },
      "imbalan" : { bp : {}, bb : {} }
    }
  },
  "generic" : {
    "irI" : {
      "mipil" : {
        "bp" : {
          "mlaku" : {
            "gantF" : function(z) { return [
              [z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,undefined]
            ] },
            "gantH" : function(z) { return [
              [z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined]
            ] },
            "pipF" : function(w,x,y,z) { return [
              [w,x,w,undefined,w,x,w,x,y,z,y,undefined,y,z,y,z],
              [w,x,w,undefined,undefined,x,w,undefined,y,z,y,undefined,undefined,z,y,undefined]
            ] },
            "pipH" : function (y,z) { return [
              [y,z,y,undefined,y,z,y,z],
              [y,z,y,undefined,undefined,z,y,undefined]
            ] }
          },
          "nibani" : {}
        },
        "bb" : {
          "mlaku" : {
            "gantF" : function(z) { return [
              [z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined]
            ] },
            "gantH" : function(z) { return [
              [z,z,z,undefined],
              [z,undefined,undefined,z]
            ] },
            "pipF" : function(w,x,y,z) { return [
              [w,x,w,x,y,z,y,z]
            ] },
            "pipH" : function(y,z) { return [
              [y,z,y,z]
            ] }
          },
          "nibani" : {}
        }
      },
      "cegatan" : { bp : {}, bb : {} },
      "imbalan" : { bp : {}, bb : {} }
    },
    "irII" : {
      "mipil" : {
        "bp" : {
          "mlaku" : {
            "gantF" : function (z) { return [
              [z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined]
            ] },
            "gantH" : function (z) { return [
              [z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z],
              [z,z,z,undefined,z,z,undefined,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined]
            ] },
            "pipF" : function (w,x,y,z) { return [
              [w,x,w,undefined,w,x,w,undefined,w,x,w,undefined,w,x,w,x,y,z,y,undefined,y,z,y,undefined,y,z,y,undefined,y,z,y,z],
              [w,x,w,undefined,w,x,w,undefined,w,x,w,undefined,undefined,x,w,undefined,y,z,y,undefined,y,z,y,undefined,y,z,y,undefined,undefined,z,y,undefined]
            ] },
            "pipH" : function (y,z) { return [
              [y,z,y,undefined,y,z,y,undefined,y,z,y,undefined,y,z,y,z],
              [y,z,y,undefined,y,z,y,undefined,y,z,y,undefined,undefined,z,y,undefined]
            ] }
          },
          "nibani" : {}
        },
        "bb" : {
          "mlaku" : {
            "gantF" : function (z) { return [
              [z,z,z,undefined,z,z,undefined,undefined,z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,z,undefined,undefined,undefined]
            ] },
            "gantH" : function (z) { return [
              [z,z,z,undefined,z,z,undefined,undefined],
              [z,z,z,undefined,undefined,z,undefined,undefined],
              [z,undefined,undefined,z,undefined,undefined,z,undefined]
            ] },
            "pipF" : function (w,x,y,z) { return [
              [w,x,w,undefined,w,x,w,x,y,z,y,undefined,y,z,y,z],
              [w,x,w,undefined,undefined,x,w,undefined,y,z,y,undefined,undefined,z,y,undefined]
            ] },
            "pipH" : function (y,z) { return [
              [y,z,y,undefined,y,z,y,z],
              [y,z,y,undefined,undefined,z,y,undefined]
            ] }
          },
          "nibani" : {}
        }
      },
      "cegatan" : { bp : {}, bb : {} },
      "imbalan" : { bp : {}, bb : {} }
    }
  }
};
notation.kendhangan = {
  kdhGendhing : {},
  ketipung : {},
  kendhangKal : {
    lancaran : {
      ir0 : {
        buka : "ttpbpppp",
        adjust : ".p.p.p.p.p.p.p.p",
        regular : "pppppbpppbpppbpp",
        salahan : "bppbppbppbpppbpp",
        suwuk : "p.p.pbp.bp.b.p.."
      },
      irI : {
        buka : "ktktkpabaappapap",
        regular : "p.bp.bp.b.pb.p.ppbp.b.pbp.pb.p.b",
        suwuk : ".p...p...p.b.p...b.p...b...p...."
      },
      irII : {
        regular : "p.bp.bp.b.pb.p.pp.bp.bp.b.pb.p.pp.bp.bp.b.pb.p.ppbp.b.pbp.pb.p.b"
      }
    },
    ketawang : {},
    ladrang : {
      irI: {
        buka : "kktktkpoboobpoobp",
        umpak : "kobpkobpkobpkobpkobpkobpkobpkobpkobpkobpkobpkobppbpobopbkobpkobp",
        ngelik : "kobpkobpkobpkobpkobpkobpkobpkobpkobpkobpkobpkobppbpobopbkobpkobp",
        suwuk : "kobpkobpkobpkobpkobpkobpkbkpkokbapaktbapktbapaktbapaktabkokpkok."
      },
      irII: {
        umpak : ".kokokokokokokopapaabpab.kokokokoobpoobpoopbpabp.kokokopab.ktpabapab.kopaapb.kotppapapabapaapbapoopbopbopbpobopb.kokokoppapbapab",
        ngelik : "kpbpabapoopbopbopbpobopb.kokobapoopbopboppopobop.kokokopabaktpabapab.kopoopb.kotppopopobopoopbop.kpbapbapbpabapb.kokokoppapbapab",
        suwuk : "kpbpabapoopbopbopbpobopb.kokobapoopbopboppopobopapabakopoboktpobapobkokpkopbkoktppapapabapaktbapaktbapaktbapapabakkokkkokkk....."
      },
      irIII : {}
    }
  },
  ciblon : {},
  kosekWayang : {},
  kosekHalus : {}
};

// KARAWITAN ###################################################################

kar = {};
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
  var cnt = protoBal.length-1;
  var normalized = kar.balNormalize(protoBal);
  var optimized = [];
  optimized.push(normalized[0])
  for (var i=0;i<cnt;i++) {
    var a = optimized[i];
    var b = normalized[i+1];
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
  partsSet(flags.segment,irama,gPulse,true);
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

// TAFSIRAN ####################################################################

tafsiran = {
  bonang : {
    mbuka : function(balungan,cnt) {
      var buka = [];
      for (var i = 0; i < cnt; i = i+4) {
        var gatra = balungan.slice(i,i+4);
        var w = gatra[0];
        var x = gatra[1];
        var y = gatra[2];
        var z = gatra[3];
        switch (true) {
          case i === cnt-4 && z === degree("6.") :
            var ligatur = degreesNut("7._5._6._7._6.");
            buka.push(w);
            buka = buka.concat(ligatur);
            break;
          default :
            buka.push(w,x,y,z);
        }
      }
      return buka;
    },
    mipil : function(balungan,cnt,nutRoot,nutRootGen,segment) {
      segment = segment || flags.segment;
      var pipilan = [];
      var period = kar.gongan("gong");
      for (var i = 0; i < cnt; i = i+4) {
        var cengkok = []; var firstHalf = []; var secondHalf = []; var winner = []; var firstWinner = []; var secondWinner = [];
        var gatra = balungan.slice(i,i+4); // for now the match window is 1 gatra (4 tones of regularized balungan (protoBalungan)
        var prefix = (i===0) ? balungan.slice(cnt-1) : balungan.slice(i-1,i); // assumes pre- and postgong are the same
        var w = gatra[0];
        var x = gatra[1];
        var y = gatra[2];
        var z = gatra[3];
        var suffix = (i===(cnt-4)) ? balungan.slice(0,2) : balungan.slice(i+4,i+6); // circular again - cannot cross segment border yet - just two tones (protoBal) for now
        var balType = kar.balunganType(prefix,w,x,y,z,suffix[0]);
        switch (true) {
          case (w===x && y===z) : // full gantungan (easiest to identify)
            cengkok = cengkok.concat(nutRoot[balType].gantF[dia(z)]);
            cengkok = cengkok.concat(nutRootGen[balType].gantF(z));
            winner = any(cengkok); // this returns one of the arrays considered to fit the given context equally well
            winner = (winner.length === 1) ? degreesNut(winner[0]) : degreesNut(winner);
            pipilan = pipilan.concat(winner);
            break;
          case (w===x) : // halph gantungan at gatra-start continued by pipilan (full gantungan would have matched above)
            firstHalf = firstHalf.concat(nutRoot[balType].gantH[dia(x)]);
            firstHalf = firstHalf.concat(nutRootGen[balType].gantH(x));
            firstWinner = any(firstHalf);
            firstWinner = (firstWinner.length === 1) ? degreesNut(firstWinner[0]) : degreesNut(firstWinner);
            secondHalf = secondHalf.concat(nutRootGen[balType].pipH(y,z));
            secondWinner = any(secondHalf);
            secondWinner = (secondWinner.length === 1) ? degreesNut(secondWinner[0]) : degreesNut(secondWinner);
            pipilan = pipilan.concat(firstWinner).concat(secondWinner);
            break;
          case (y===z) : // halph gantungan at gatra-end preceded by pipilan (full gantungan would have matched above)
            firstHalf = firstHalf.concat(nutRootGen[balType].pipH(w,x));
            firstWinner = any(firstHalf);
            firstWinner = (firstWinner.length === 1) ? degreesNut(firstWinner[0]) : degreesNut(firstWinner);
            secondHalf = secondHalf.concat(nutRoot[balType].gantH[dia(z)]);
            secondHalf = secondHalf.concat(nutRootGen[balType].gantH(z));
            secondWinner = any(secondHalf);
            secondWinner = (secondWinner.length === 1) ? degreesNut(secondWinner[0]) : degreesNut(secondWinner);
            pipilan = pipilan.concat(firstWinner).concat(secondWinner);
            break;
          case (z===degree("5.")) && flags.goToNgelik && (i>period-8) && !flags.isGonganSuwuk :
          case (z===degree("6.")) && flags.goToNgelik && (i>period-8) && !flags.isGonganSuwuk :
            cengkok = cengkok.concat(nutRoot[balType].gantF[dia(z+7)]); // ngelik - 7 is standardized octave for pelog and also slendro!
            cengkok = cengkok.concat(nutRootGen[balType].gantF(z+7));
            winner = any(cengkok);
            winner = (winner.length === 1) ? degreesNut(winner[0]) : degreesNut(winner);
            pipilan = pipilan.concat(winner);
            break;
          case (z===degree("6.")) :
            cengkok = cengkok.concat(nutRoot[balType].seleh[dia(z)]);
            winner = any(cengkok); // this returns one of the arrays considered to fit the given context equally well
            winner = (winner.length === 1) ? degreesNut(winner[0]) : degreesNut(winner);
            pipilan = pipilan.concat(winner);
            break;
          default :
            cengkok = cengkok.concat(nutRootGen[balType].pipF(w,x,y,z));
            winner = any(cengkok); // this returns one of the arrays considered to fit the given context equally well
            winner = (winner.length === 1) ? degreesNut(winner[0]) : degreesNut(winner);
            pipilan = pipilan.concat(winner);
        }
      }
      return pipilan;
    }
  }
};

// GARAP #######################################################################
// For now all parts are generated under the (rarely-but-sometimes wrong)
// assumption that the gong-tone at the end and the beginning of a gongan are
// the same. This is also assumed for kendhangan (drumming).
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

// GAMELAN #####################################################################

// GAMELAN here refers to the instruments themself #############################
gamelan = {
  generic : {
    slendro : {
      tuning : [280,320,365,420,480],
      instruments : {
        bonangPan : {
          use : true,
          samplesOnly : false,
          type : "gong chimes",
          resonator : "body",
          notes : [-6,-5,-4,-2,-1,1,2,3,5,6,8,9],
          octave : [5,5,5,5,5,6,6,6,6,6,7,7],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.005,1.004,1.005,1.008,1.006,1.005,1.006,1.007,1.005,1.007,1.008,1.007]],
          detuneSamp : [1,[1,1,1,1,1,1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1,1,1,1,1,1]],
          ampSynth : [0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04],
          attack : [1,1,1,1,1,1,1,1,1,1,1,1],
          decay : [300,300,300,300,300,300,300,300,300,300,300,300],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1,1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        bonangBar : {
          use : true,
          samplesOnly : false,
          type : "gong chimes",
          resonator : "body",
          notes : [-6,-5,-4,-2,-1,1,2,3,5,6,8,9],
          octave : [4,4,4,4,4,5,5,5,5,5,6,6],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.004,1.006,1.005,1.007,1.005,1.003,1.004,1.004,1.006,1.005,1.007,1.005]],
          detuneSamp : [1,[1,1,1,1,1,1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1,1,1,1,1,1]],
          ampSynth : [0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12],
          attack : [1,1,1,1,1,1,1,1,1,1,1,1],
          decay : [800,800,800,800,800,800,800,800,800,800,800,800],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1,1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        peking : {
          use : true,
          samplesOnly : false,
          type : "metallophone",
          resonator : "tub",
          notes : [-1,1,2,3,5,6,8],
          octave : [5,6,6,6,6,6,7],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.007,1.008,1.009,1.005,1.007,1.006,1.008]],
          detuneSamp : [1,[1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1]],
          ampSynth : [0.08,0.08,0.08,0.08,0.08,0.08,0.08],
          attack : [1,1,1,1,1,1,1],
          decay : [600,600,600,600,600,600,600],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [2,2,2,2,2,2,2],
          index : [1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        saronA : {
          use : true,
          samplesOnly : false,
          type : "metallophone",
          resonator : "tub",
          notes : [-1,1,2,3,5,6,8],
          octave : [4,5,5,5,5,5,6],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.005,1.003,1.004,1.004,1.006,1.005,1.007]],
          detuneSamp : [1,[1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1]],
          ampSynth : [0.08,0.08,0.08,0.08,0.08,0.08,0.08],
          attack : [1,1,1,1,1,1,1],
          decay : [1300,1300,1300,1300,1300,1300,1300],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        saronB : {
          use : true,
          samplesOnly : false,
          type : "metallophone",
          resonator : "tub",
          notes : [-1,1,2,3,5,6,8],
          octave : [4,5,5,5,5,5,6],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.003,1.005,1.008,1.003,1.005,1.002,1.006]],
          detuneSamp : [1,[1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1]],
          ampSynth : [0.09,0.09,0.09,0.09,0.09,0.09,0.09],
          attack : [1,1,1,1,1,1,1],
          decay : [1500,1500,1500,1500,1500,1500,1500],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        demung : {
          use : true,
          samplesOnly : false,
          type : "metallophone",
          resonator : "tub",
          notes : [-1,1,2,3,5,6,8],
          octave : [3,4,4,4,4,4,5],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.006,1.004,1.007,1.003,1.005,1.004,1.005]],
          detuneSamp : [1,[1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1]],
          ampSynth : [0.1,0.1,0.1,0.1,0.1,0.1,0.1],
          attack : [1,1,1,1,1,1,1],
          decay : [2500,2500,2500,2500,2500,2500,2500],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        slenthem : {
          use : true,
          samplesOnly : false,
          type : "metallophone",
          resonator : "tub",
          notes : [-1,1,2,3,5,6,8],
          octave : [2,3,3,3,3,3,4],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.002,1.003,1.004,1.005,1.004,1.006,1.004]],
          detuneSamp : [1,[1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1]],
          ampSynth : [0.15,0.15,0.15,0.15,0.15,0.15,0.15],
          attack : [1,1,1,1,1,1,1],
          decay : [5000,5000,5000,5000,5000,5000,5000],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [1,1,1,1,1,1,1],
          index : [1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        kempyang : {
          use : true,
          samplesOnly : false,
          type : "gong",
          resonator : "body",
          notes : [8],
          octave : [6],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.01]],
          detuneSamp : [1,[1]],
          ampSamp : [1,[1]],
          ampSynth : [0.1],
          attack : [1],
          decay : [800],
          waveShape : ["sine"],
          cmRatio : [1.4],
          index : [0.95],
          effectBus : ["gongs",0.5]
        },
        kethuk : {
          use : true,
          samplesOnly : false,
          type : "gong",
          resonator : "body",
          notes : [2],
          octave : [4],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.05]],
          detuneSamp : [1,[1]],
          ampSamp : [1,[1]],
          ampSynth : [0.15],
          attack : [100],
          decay : [300],
          waveShape : ["pulse"],
          cmRatio : [1 + Math.sqrt(2)],
          index : [2],
          effectBus : ["gongs",0.5]
        },
        kempul : {
          use : true,
          samplesOnly : false,
          type : "gong",
          resonator : "body",
          notes : [3,5,6,8,9],
          octave : [2,2,2,3,3], // [sic!] this reorders the gongs
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.002,1.003,1.004,1.005,1.004]],
          detuneSamp : [1,[1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1]],
          ampSynth : [0.15,0.15,0.15,0.15,0.15],
          attack : [80,80,80,80,80],
          decay : [4000,4000,4000,4000,4000],
          waveShape : ["sine","sine","sine","sine","sine"],
          cmRatio : [1 + Math.sqrt(2),1 + Math.sqrt(2),1 + Math.sqrt(2),1 + Math.sqrt(2),1 + Math.sqrt(2)],
          index : [2,2,2,2,2],
          effectBus : ["gongs",0.5]
        },
        kenong : {
          use : true,
          samplesOnly : false,
          type : "gong",
          resonator : "body",
          notes : [2,3,5,6,8],
          octave : [4,4,4,4,5],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.002,1.003,1.004,1.005,1.004]],
          detuneSamp : [1,[1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1]],
          ampSynth : [0.15,0.15,0.15,0.15,0.15],
          attack : [2,2,2,2,2],
          decay : [3000,3000,3000,3000,3000],
          waveShape : ["sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1],
          effectBus : ["gongs",0.5]
        },
        gongSuw : {
          use : false,
          samplesOnly : false,
          type : "gong",
          resonator : "body",
          notes : [1,2],
          octave : [2,2],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[0.99,0.99]],
          detuneSamp : [1,[1,1]],
          ampSamp : [1,[1,1]],
          ampSynth : [0.1,0.1],
          attack : [80,80],
          decay : [5000,5000],
          waveShape : ["pulse","pulse"],
          cmRatio : [2.01,2.01],
          index : [1,1],
          effectBus : ["gongs",0.5]
        }
      }
    },
    pelog : {
      tuning : [295,330,355,400,450,480,535],
      instruments : {
        bonangPan : {
          use : true,
          samplesOnly : false,
          type : "gong chimes",
          resonator : "body",
          notes : [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7],
          octave : [5,5,5,5,5,5,5,6,6,6,6,6,6,6],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.005,1.004,1.005,1.008,1.006,1.005,1.006,1.007,1.005,1.007,1.008,1.007,1.006,1.007]],
          detuneSamp : [1,[1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
          ampSynth : [0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04,0.04],
          attack : [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          decay : [300,300,300,300,300,300,300,300,300,300,300,300,300,300],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        bonangBar : {
          use : true,
          samplesOnly : false,
          type : "gong chimes",
          resonator : "body",
          notes : [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7],
          octave : [4,4,4,4,4,4,4,5,5,5,5,5,5,5],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.004,1.006,1.005,1.007,1.005,1.003,1.004,1.004,1.006,1.005,1.007,1.005,1.003,1.004]],
          detuneSamp : [1,[1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
          ampSynth : [0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12,0.12],
          attack : [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          decay : [800,800,800,800,800,800,800,800,800,800,800,800,800,800],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        peking : {
          use : true,
          samplesOnly : false,
          type : "metallophone",
          resonator : "tub",
          notes : [1,2,3,4,5,6,7],
          octave : [6,6,6,6,6,6,6],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.007,1.008,1.009,1.005,1.007,1.006,1.008]],
          detuneSamp : [1,[1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1]],
          ampSynth : [0.08,0.08,0.08,0.08,0.08,0.08,0.08],
          attack : [1,1,1,1,1,1,1],
          decay : [600,600,600,600,600,600,600],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [2,2,2,2,2,2,2],
          index : [1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        saronA : {
          use : true,
          samplesOnly : false,
          type : "metallophone",
          resonator : "tub",
          notes : [1,2,3,4,5,6,7],
          octave : [5,5,5,5,5,5,5],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.005,1.003,1.004,1.004,1.006,1.005,1.007]],
          detuneSamp : [1,[1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1]],
          ampSynth : [0.08,0.08,0.08,0.08,0.08,0.08,0.08],
          attack : [1,1,1,1,1,1,1],
          decay : [1300,1300,1300,1300,1300,1300,1300],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        saronB : {
          use : true,
          samplesOnly : false,
          type : "metallophone",
          resonator : "tub",
          notes : [1,2,3,4,5,6,7],
          octave : [5,5,5,5,5,5,5],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.003,1.005,1.008,1.003,1.005,1.002,1.006]],
          detuneSamp : [1,[1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1]],
          ampSynth : [0.09,0.09,0.09,0.09,0.09,0.09,0.09],
          attack : [1,1,1,1,1,1,1],
          decay : [1500,1500,1500,1500,1500,1500,1500],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        demung : {
          use : true,
          samplesOnly : false,
          type : "metallophone",
          resonator : "tub",
          notes : [1,2,3,4,5,6,7],
          octave : [4,4,4,4,4,4,4],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.006,1.004,1.007,1.003,1.005,1.004,1.005]],
          detuneSamp : [1,[1,1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1,1]],
          ampSynth : [0.1,0.1,0.1,0.1,0.1,0.1,0.1],
          attack : [1,1,1,1,1,1,1],
          decay : [2500,2500,2500,2500,2500,2500,2500],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        slenthem : {
          use : true,
          samplesOnly : false,
          type : "metallophone",
          resonator : "tub",
          notes : [1,2,3,4,5,6,7],
          octave : [3,3,3,3,3,,3,3],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.002,1.003,1.004,1.005,1.004,1.006,1.004]],
          detuneSamp : [1,[1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1]],
          ampSynth : [0.15,0.15,0.15,0.15,0.15,0.15,0.15],
          attack : [1,1,1,1,1,1,1],
          decay : [5000,5000,5000,5000,5000,5000,5000],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [1,1,1,1,1,1,1],
          index : [1,1,1,1,1,1,1],
          effectBus : ["single",0.5]
        },
        kempyang : {
          use : true,
          samplesOnly : false,
          type : "gong",
          resonator : "body",
          notes : [6],
          octave : [5],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.01]],
          detuneSamp : [1,[1]],
          ampSamp : [1,[1]],
          ampSynth : [0.15],
          attack : [1],
          decay : [800],
          waveShape : ["sine"],
          cmRatio : [1.4],
          index : [0.95],
          effectBus : ["gongs",0.5]
        },
        kethuk : {
          use : true,
          samplesOnly : false,
          type : "gong",
          resonator : "body",
          notes : [6],
          octave : [3],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.01]],
          detuneSamp : [1,[1]],
          ampSamp : [1,[1]],
          ampSynth : [0.1],
          attack : [100],
          decay : [300],
          waveShape : ["pulse"],
          cmRatio : [1 + Math.sqrt(2)],
          index : [2],
          effectBus : ["gongs",0.5]
        },
        kempul : {
          use : true,
          samplesOnly : false,
          type : "gong",
          resonator : "body",
          notes : [3,5,6,7,8,9],
          octave : [3,3,3,3,4,4], // [sic!] this reorders the gongs
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.002,1.003,1.004,1.005,1.004,1.006]],
          detuneSamp : [1,[1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1]],
          ampSynth : [0.15,0.15,0.15,0.15,0.15,0.15],
          attack : [80,80,80,80,80,80],
          decay : [4000,4000,4000,4000,4000,4000],
          waveShape : ["sine","sine","sine","sine","sine","sine"],
          cmRatio : [1 + Math.sqrt(2),1 + Math.sqrt(2),1 + Math.sqrt(2),1 + Math.sqrt(2),1 + Math.sqrt(2),1 + Math.sqrt(2)],
          index : [2,2,2,2,2,2],
          effectBus : ["gongs",0.5]
        },
        kenong : {
          use : true,
          samplesOnly : false,
          type : "gong",
          resonator : "body",
          notes : [2,3,5,6,7,8,9],
          octave : [4,4,4,4,4,5,5],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[1.002,1.003,1.004,1.005,1.004,1.006,1.004]],
          detuneSamp : [1,[1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1]],
          ampSynth : [0.15,0.15,0.15,0.15,0.15,0.15,0.15],
          attack : [2,2,2,2,2,2,2],
          decay : [3000,3000,3000,3000,3000,3000,3000],
          waveShape : ["sine","sine","sine","sine","sine","sine","sine"],
          cmRatio : [3.507,3.507,3.507,3.507,3.507,3.507,3.507],
          index : [1,1,1,1,1,1,1],
          effectBus : ["gongs",0.5]
        },
        gongSuw : {
          use : false,
          samplesOnly : false,
          type : "gong",
          resonator : "body",
          notes : [1,2],
          octave : [2,2],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[0.99,0.99]],
          detuneSamp : [1,[1,1]],
          ampSamp : [1,[1,1]],
          ampSynth : [0.1,0.1],
          attack : [80,80],
          decay : [5000,5000],
          waveShape : ["sine","sine"],
          cmRatio : [2.01,2.01],
          index : [1,1],
          effectBus : ["gongs",0.5]
        }
      }
    },
    neutral : {
      instruments : {
        gong : { 
          use : true,
          samplesOnly : false,
          type : "gong",
          resonator : "body",
          notes : [3,5,6],
          octave : [1,1,1],
          stretch : 1,
          transpose : 1,
          detuneSynth : [1,[0.95,0.95,0.95]],
          detuneSamp : [1,[1,1,1]],
          ampSamp : [1,[1,1,1]],
          ampSynth : [0.35,0.35,0.35],
          attack : [100,100,100],
          decay : [7000,7000,7000],
          waveShape : ["triangle"],
          fmPriority : 1,
          fm : [[2.01,1],[2.01,1],[2.01,1]], // [cmRatio,index]
          beat : [[1.2,0.02],[1.2,0.02],[1.2,0.02]], // [frequency,subtractor]
          residuum : [1,50,"pulse",0.15], // added synth-properties
          effectBus : ["gongs",0.5]
        },
        kdhKalih : {
          use : true,
          samplesOnly : true,
          type : "drums",
          notes : ["b","p","t","k","o","a","r"],
          toneNames : ["dhah","thung","tak","ket","thong","tap","kret"],
          transpose : 1,
          frequency : [120,360,500,500,420,500,500], // why fantasy?
          detuneSynth : [1,[1,1,1,1,1,1,1]], // why fantasy?
          detuneSamp : [1,[1,1,1,1,1,1,1]],
          ampSamp : [1,[1,1,1,1,1,1,1]],
          ampSynth : [0.2,0.2,0.2,0.2,0.1,0.2,0.2],
          attack : [20,5,1,1,2,1,1],
          decay : [2000,1000,100,50,1000,20,50],
          waveShape : ["sine","sine","square","sawtooth","pulse","sawtooth","pulse"],
          cmRatio : [1 + Math.sqrt(2),1 + Math.sqrt(2),5,2,2,2,2],
          index : [1,1,1,1,1,1,1],
          effectBus : ["gongs",0.5]
        }
      }
    }
  },
  sekarRasaTentrem : {},
  kyahiKanyut : {}
}
// reassigning for simplicity
// gamelan.generic
gamelan.generic.pelog.instruments.gong = gamelan.generic.neutral.instruments.gong;
gamelan.generic.slendro.instruments.gong = gamelan.generic.neutral.instruments.gong;
gamelan.generic.pelog.instruments.kdhKalih = gamelan.generic.neutral.instruments.kdhKalih;
gamelan.generic.slendro.instruments.kdhKalih = gamelan.generic.neutral.instruments.kdhKalih;

// NYAGA (MUSICIANS) ###########################################################

nyaga = {
  marta : {
      ricikan : "bonangPan",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "male"
  },
  panca : {
      ricikan : "peking",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "male"
  },
  dana : {
      ricikan : "saronA",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "male"
  },
  harja : {
      ricikan : "gong",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "male"
  },
  tana : {
      ricikan : "gérongan",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "male"
  },
  yana : {
      ricikan : "demung",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "male"
  },
  wanda : {
      ricikan : "kempyang",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "male"
  },
  rana : {
      ricikan : "gérongan",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "male"
  },
  sabda : {
      ricikan : "kenong",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "male"
  },
  darti : {
      ricikan : "kendhang",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "female"
  },
  parsih : {
      ricikan : "gendèr",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "female"
  },
  lastri : {
      ricikan : "bonangBar",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "female"
  },
  ratri : {
      ricikan : "slenthem",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "female"
  },
  warsi : {
      ricikan : "kethuk",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "female"
  },
  narti : {
      ricikan : "saronB",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "female"
  },
  rani : {
      ricikan : "sindhénan",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "female"
  },
  tatik : {
      ricikan : "kempul",
      amp : 1,
      ampVar: 1,
      timingVar : 1,
      attack : 1,
      decay : 1,
      lag : 1,
      empathy : 1,
      confidence : 1,
      fanciness : 1,
      sex : "female"
  }
};
startingTheEngines = function() {
  scales = []; iNames = []; pNames = [];
  var ensemble = now.instruments;
  var ix = 0;
  for (var iName in ensemble) {
    var instr = ensemble[iName];
    if (instr.use) {
      var cap = iName.charAt(0).toUpperCase()+iName.slice(1)
      window["ix"+cap] = ix;
      iNames.push(iName);
      if (iName===flags.bukaInstr) { window["ixBukaInstr"] = ix; }
      if (iName===conf.timeKeeper) { window["ixTimeKeeper"] = ix; }
      scales.push((instr.frequency) ? instr.frequency : instrFrequencies(instr));
      for (var pName in nyaga) {
        if (nyaga[pName].ricikan === iName) { pNames.push(pName); break; }
      }
      // prepare Samplers (to be callable by instrumentName)
      window[cap] = Function("_sequence", "_timeValue", "_amp", "_freq", "return new _SampleSeq('"+iName+"', _sequence, _timeValue, _amp, _freq)");
      ix++;
    }
  }
  instrCnt = ix;
  parts = []; synths = [];
  for (var i=0;i<instrCnt;i++) {
  // create Synth-Dummies
    synths.push(Synth()); // synths.push(Synth({ active : false }).out())
  //  if (instr.effectBus) { synths[ix].send(instr.effectBus[0],instr.effectBus[1]); }
  }
  // push part-definitions to array "parts" ####################################
  partsGen();

  // generate SHORTHANDS for found parts #######################################
  for (var i=0;i<instrCnt;i++) {
    var iName = iNames[i];
    window["p"+i] = parts[i];
    window["s"+i] = synths[i];
    switch (iName) {
      case "bonangPan" : bp = parts[i]; sbp = synths[i]; break;
      case "bonangBar" : bb = parts[i]; sbb = synths[i]; break;
      case "peking" : pk = parts[i]; spk = synths[i]; break;
      case "saronA" : sa = parts[i]; ssa = synths[i]; break;
      case "saronB" : sb = parts[i]; ssb = synths[i]; break;
      case "demung" : dm = parts[i]; sdm = synths[i]; break;
      case "slenthem" : sl = parts[i]; ssl = synths[i]; break;
      case "kempyang" : py = parts[i]; spy = synths[i]; break;
      case "kethuk" : kt = parts[i]; skt = synths[i]; break;
      case "kempul" : kp = parts[i]; skp = synths[i]; break;
      case "kenong" : kn = parts[i]; skn = synths[i]; break;
      case "gongSuw" : gs = parts[i]; sga = synths[i]; break;
      case "gong" : ga = parts[i]; sga = synths[i]; break;
      case "kendhang" : kd = parts[i]; skd = synths[i];
    };
    if (iName===flags.bukaInstr) { bi = parts[i]; sbi = synths[i]; };
    if (iName===conf.timeKeeper) { tk = parts[i]; stk = synths[i]; };
  }
  // PLAYER Convenience ##########################################################
  doForAll = function(action,counter) {
    counter = counter || tk.counter || 1;
    var partsCnt = parts.length;
    for (var i=0;i<partsCnt;i++) {
      if (action === "play") {
        parts[i].counter = counter;
        parts[i].play();
      } else if (action === "once") {
        parts[i].counter = counter;
        parts[i].once();
      } else if (action === "pause") {
        parts[i].pause();
      } else if (action === "stop") {
        parts[i].stop();
      } else if (action === "kill") { // kill does not make much sense as you can\'t restart yet
        parts[i].kill();
      }
    }
    var result = "Action \'"+action+"\' executed for all parts";
    return result;
  }
  gendhing = {
    play : function(counter) { doForAll("play",counter); if ( toggle.logBranching && flags.segment === "buka") { console.log(msg.console.onStartPlaying); } return msg.returnInfo.allPlay(); },
    once : function(counter) { doForAll("once",counter); return msg.returnInfo.allOnce() },
    pause : function(counter) { doForAll("pause",counter); return msg.returnInfo.allPause() },
    stop : function(counter) { doForAll("stop",counter); return msg.returnInfo.allStop() },
    kill : function(counter) { doForAll("kill",counter); return msg.returnInfo.allKill() }
  }
  return "scales, synths, samplers, parts, iNames (instruments), pNames (persons) and busses prepared..." // To play bonang barung type bb.play(). To play everyting type gendhing.play()";
};

takeOff = function() {
// #############################################################################
  var ppGongan = now.pp.gongan;
  var ppBuka = now.pp.buka;
  // additive orientation
  var ppKenongan = now.pp.kenongan;
  var ppKempulan = now.pp.kempulan;
  var ppKethukan = now.pp.kethukan;
  var ppKempyangan = now.pp.kempyangan;
  var ppGatra = now.pp.gatra;
  var ppTiba = now.pp.tiba;
  var ppSabet = now.pp.sabet;
  var fullPeriod = ppGongan;
  // subdivisional orientation
  var halph = fullPeriod/2;
  var quarter = fullPeriod/4;
  var _8th = fullPeriod/8;
  var _16th = fullPeriod/16;
  var _32nd = fullPeriod/32;
  var _64th = fullPeriod/64;

  nthGong = (flags.segment==="buka") ? 0 : (flags.segment==="umpak") ? 1 : (flags.segment==="ngelik") ? 3 : alert("Not sure how to initialize nthGong - you seem to use a unusual segment designation. Check variables flags.segment and nthGong") ;
  nthNong = 0; nthPul = 0; nthThuk = 0; nthPyang = 0;
  nthGatra = 1; nthSabet = 0; keteg = 1;
  ticker = (flags.segment==="buka") ? 1 : ppBuka ;
  gdhNotation = kar.protoBal(now.balungan); // called from a message-function - thus global

  onGong = function() {
    nthGong++;
    if (toggle.logGongan) { console.log(msg.console.onGong()); }
    nthNong = 1; nthPul = 0; nthThuk = 0; nthPyang = 0; // reset relative counters
    nthGatra = 1; nthSabet = 0; keteg = 1; // rethink exactly whether to reset gPulse to 0 manually or not
    kar.branching(); // trigger settings for gongan to come
    fullPeriod = now.pp.gongan; // reset orientational variables in case gongan changed
    halph = fullPeriod/2;
    quarter = fullPeriod/4;
    _8th = fullPeriod/8;
    _16th = fullPeriod/16;
    _32nd = fullPeriod/32;
    _64th = fullPeriod/64;
    gdhNotation = kar.protoBal(now.balungan);
  }
  parts.push(
    Seq({
      active : false,
      function : [ function() {
        gPulse = parts[ixTimeKeeper].counter; // reset to 0 on each stop()
        if (gPulse % now.pp.keteg===0) { keteg++ }; // keteg is useful but not used yet
        ticker++
      }],
      durations : [_32]
    })
  );
  orientation = parts[parts.length-1];
  parts.push(
    Seq({
      active : false,
      function : [
        function() {
          // sabet/pyang: ------------------------------------------------------
          if (gPulse % _32nd === 0) {
            nthSabet++
            if (gPulse % _16th !==0) {
              nthPyang++;
              if (toggle.logGongan) {console.log(msg.console.onKempyang());}
            }
            // tiba/thuk: ------------------------------------------------------
            if (gPulse % _16th === 0) {
              if (gPulse===ppBuka && flags.segment === "buka") { onGong(); }
              if (gPulse % _8th !== 0) {
                nthThuk++;
                if (toggle.logGongan) {console.log(msg.console.onKethuk());}
              }
              // gatra/pul: ----------------------------------------------------
              if (gPulse % _8th === 0) {
                if ((gPulse % quarter !== 0) && (gPulse !== ppGatra)) {
                  nthPul++;
                  if (toggle.logGongan) {console.log(msg.console.onKempul());}
                  if (toggle.logGongan) {console.log("\n");}
                } else if (gPulse === ppGatra) {
                  if (toggle.logGongan) {console.log(msg.console.onWela()); }
                  if (toggle.logGongan) {console.log("\n"); }
                }
                if (gPulse % quarter === 0) {
                  // Here go things on kenong-level
                  if ((gPulse % fullPeriod !== 0) && (ticker !== ppBuka)) {
                    if (toggle.logGongan) { console.log( msg.console.onKenong()); }
                    if (toggle.logGongan) { console.log("\n"); }
                    nthNong++;
                  }
                  if (gPulse % halph === 0) {
                    // Here go things on halph-gong-level
                    if (gPulse % fullPeriod === 0) {
                      onGong();
                    }
                  }
                }
                nthGatra++;
              }
            }
          }
        }
      ],
      durations : [_32]
    })
  )
  gongan = parts[parts.length-1]
  if (toggle.watchDogs) {
    var decideUponNgelikBranch = ppGongan-ppGatra;
    var favoredIramaSwitch = ppTiba;
    var favoredReturnToSteadyIrI = ppTiba;
    var favoredReturnToSteadyIrII = ppTiba;
    var favoredFinalSlowDown = ppGongan-(ppSabet*10);
    var startSuwukPossibleMin = ppGatra*3;
    var startSuwukPossibleMinEndNgampat = startSuwukPossibleMin+8;
    var startSuwukPossibleMax = ppGatra*5;
    var startSuwukPossibleMaxEndNgampat = startSuwukPossibleMax+8;
    parts.push(
      Seq({
        active : false,
        function : [function() {
        // speed-change
        if (flags.seseg || flags.rem) { kar.seseg(); }
        // invoke ngelik-signal
        if ( !toggle.autoPilot && flags.goToNgelik && gPulse === decideUponNgelikBranch) {
            partSet(ixBonangPan,flags.segment,flags.irama);
            partSet(ixBonangBar,flags.segment,flags.irama);
            console.log(msg.console.onWatchDogTriggerNgelikSignal)
        }
        // speed guard
        if (flags.fastForward === false && ( pulseUnit < par.tooFast || (pulseUnit > par.tooSlow && !flags.isGonganSuwuk)) ) {
          kar.jadi();
          if (toggle.logWatchDogs) { console.log(msg.console.onWatchDogToSteadySpeed()); }
        }
        // iramaSwitch up (slow->fast)
        if (flags.seseg && !flags.doSuwuk && flags.irama === "irII" && pulseUnit < par.thresholdTanggung && gPulse % favoredIramaSwitch === 0 ) {
          kar.irama("irI");
          if (toggle.logWatchDogs) { console.log(msg.console.onWatchDogToIrI()); }
        }
        if (flags.seseg && !flags.doSuwuk && flags.irama === "irI" && pulseUnit < (par.thresholdTanggung-par.bufferTanggung) && gPulse % favoredReturnToSteadyIrI === 0 ) {
          kar.jadi();
          if (toggle.logWatchDogs) { console.log(msg.console.onWatchDogToSteadySpeed()); }
        }
        // iramaSwitch down (fast->slow)
        if (flags.rem && !flags.doSuwuk && flags.irama === "irI" && pulseUnit > (par.thresholdDadi) && (gPulse % favoredIramaSwitch === 0) ) {
          kar.irama("irII");
          if (toggle.logWatchDogs) { console.log(msg.console.onWatchDogToIrII()); }
        }
        if (flags.rem && !flags.doSuwuk && flags.irama === "irII" && pulseUnit > (par.thresholdDadi+par.bufferDadi) && (gPulse % favoredReturnToSteadyIrII === 0) ) {
          kar.jadi();
          if (toggle.logWatchDogs) { console.log(msg.console.onWatchDogToSteadySpeed()); }
        }
        // suwuk (needs much work)
        if (flags.doSuwuk) {
          switch (true) {
            case gPulse === startSuwukPossibleMin || ((gPulse === startSuwukPossibleMax) && !flags.isGonganSuwuk) :
              partSet(ixKendhang,"suwuk"); // there will be more going on in a nice suwuk
              kar.nyeseg(10);
              flags.isGonganSuwuk = true; // for now suwuks that span one gongan
              flags.ngampat = true;
              if (toggle.logWatchDogs) { console.log(msg.console.onWatchDogReinforceSuwukMode); }
              break;
            case ((gPulse === startSuwukPossibleMinEndNgampat) && flags.ngampat) || ((gPulse === startSuwukPossibleMaxEndNgampat) && flags.ngampat && !flags.habisNgampat) :
              kar.jadi();
              flags.habisNgampat = true;
              if (toggle.logWatchDogs) { console.log(msg.console.onWatchDogToSteadySpeed()); }
              break;
            case gPulse === favoredFinalSlowDown :
              kar.nyuwuk();
              if (toggle.logWatchDogs) { console.log(msg.console.onWatchDogToFinalSlowdown); }
              break;
            case flags.isGonganSuwuk === true && gPulse === 1 &&
              ((flags.irama === "irI" && pulseUnit > par.suwukThresholdIrI) || (flags.irama === "irII" && pulseUnit > par.suwukThresholdIrII)) :
              kar.gongSuwuk();
              if (toggle.logWatchDogs) { console.log(msg.console.onGongSuwuk); }
            break;
          }
        }
      }],
      durations : [_32] })
    )
    watchDogs = wd = parts[parts.length-1];
  }
  if (toggle.autoPilot) {
    var startSlowDownDuringBuka = ppBuka-(2*ppGatra);
    var stopSlowDownAfterBuka = ppTiba;
    var iramaDownIn1stKenongan = ppSabet*2;
    var iramaUpIn3rdKenongan = ppKenongan*2;
    var iramaDownIn3rdKenongan = ppKenongan*2;
    var startSuwukMode = ppGatra*2;
    parts.push(
      Seq({
        active : false,
        function : [ function() {
        switch (true) {
          case nthGong === 0 && gPulse === startSlowDownDuringBuka : kar.ngerem(1.5); if (toggle.logAutoPilot) { console.log(msg.console.onAutoSlowDown()); } break;
          case nthGong === 1 && gPulse === stopSlowDownAfterBuka : kar.jadi(); if (toggle.logAutoPilot) { console.log(msg.console.onAutoSteadySpeed()); } break;
          case nthGong === 2 && gPulse === iramaDownIn1stKenongan : kar.ngerem(2.5); if (toggle.logAutoPilot) { console.log(msg.console.onAutoSlowDown()); } break;
          case nthGong === 4 && gPulse === iramaUpIn3rdKenongan : kar.nyeseg(); if (toggle.logAutoPilot) { console.log(msg.console.onAutoSpeedUp()); } break;
          case nthGong === 6 && gPulse === iramaDownIn3rdKenongan : kar.ngerem(); if (toggle.logAutoPilot) { console.log(msg.console.onAutoSlowDown()); } break;
          case nthGong === 7 && gPulse === startSuwukMode : flags.doSuwuk = true; if (toggle.logAutoPilot) { console.log(msg.console.onAutoSetSuwukFlag); } break;
        }
      }],
      durations : [_32] })
    )
    autoPilot = ap = parts[parts.length-1];
  }
  return "... welcome to gendhing. You are almost there. Type gendhing.play() or make your choices first. (not much for now, though ;))";
};
