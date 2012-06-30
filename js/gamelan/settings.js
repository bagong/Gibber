// gamelanscript ###############################################################
// by Rainer Schuetz (2012) for Gibber by Charlie Roberts.
init = {
  gendhing : "wilujeng",
  pathet : "p7",
  form : "ladrang",
  garap : "gerongan-salisir",
  bukaInstr : "bonangBar",
  gamelanName : "generic",
  segment : "buka", // select segment to start with
  irama : (this.form === "lancaran") ? "ir0": "irI", // select irama to start with - adjust speed (G.setBPM(60)) if you want to start in irII
  bpm : 120
};
conf = { // these settings can change (that are the plans ;)), but they are more low-level than flags.
  irLevels : 2, // pow of 2 for pulses. Speed-levels for now just irI and II irLevels & sdLevels overlap by one.
  sdLevels : 2, // pow of 2. Subdivision-levels relative to irama. ppb is Math.pow(2,(conf.irLevels+conf.sdLevels-1)) - notation-parsers don't support sdLevels:3 yet
  timeKeeper : "peking",
  synthPref : "light", // currently standard or light - standard will use FM-synthesis if available, but it is too heavy for most computers in 2012
  soMode : true, // if false, balungan-notation will be used with minimal processing (just cleaning) (mind beginning of ngelik!)
  pulseMode : true // pulseMode creates durations from a mini-Pulse while propMode or dursMode uses individual durations for each note (the later doesn't work well yet, problems with offset, but is probably more consistent on the long run)
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
  gendhing : init.gendhing,
  segment : init.segment,
  pathet : init.pathet,
  form : init.form,
  irama : init.irama,
  garap : init.garap,
  bukaInstr : init.bukaInstr,
  gamelanName : init.gamelanName,
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
