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
    onWatchDogToSteadySpeed : function() { return "Watchdog switched to steady speed at a pulse-duration of "+pulseUnit },
    onAutoSteadySpeed : function() { return "Autopilot switched to steady speed at a pulse-duration of "+pulseUnit },
    onWatchDogToIrI : function() { return "Watchdog switched to IrI at a pulse-duration of "+pulseUnit },
    onWatchDogToIrII : function() { return "Watchdog switched to IrII at a pulse-duration of "+pulseUnit },
    onSlowingDown : function() { return "Starting to slow down at a pulse-duration of "+pulseUnit },
    onAutoSlowDown : function() { return "Autopilot started to slow down at a pulse-duration of "+pulseUnit },
    onSpeedingUp : function() { return "Starting to speed up at a pulse-duration of "+pulseUnit },
    onAutoSpeedUp : function() { return "Autopilot started to speed up at a pulse-duration of "+pulseUnit },
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
        "(Pulse:"+pulse+")"+" "+
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

