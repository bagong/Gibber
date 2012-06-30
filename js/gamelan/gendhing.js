// GENDHING ####################################################################
flags = {
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
startEngines = (function() {
  scales = []; iNames = []; pNames = [];
  var ensemble = now.instruments;
  var ix = 0;
  for (var iName in ensemble) {
    var instr = ensemble[iName];
    if (instr.use) {
      window["ix"+iName.charAt(0).toUpperCase()+iName.slice(1)] = ix;
      iNames.push(iName);
      if (iName===flags.bukaInstr) { window["ixBukaInstr"] = ix; }
      if (iName===conf.timeKeeper) { window["ixTimeKeeper"] = ix; }
      scales.push((instr.frequency) ? instr.frequency : instrFrequencies(instr));
      for (var pName in nyaga) {
        if (nyaga[pName].ricikan === iName) { pNames.push(pName); break; }
      }
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
  return "scales, synths, parts, iNames (instruments), pNames (persons) and busses prepared..." // To play bonang barung type bb.play(). To play everyting type gendhing.play()";
}());

sequencers = (function() {
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
}());
