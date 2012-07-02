// GibberGamelan _Sampler is derived from Drums(). It isused to provide a
// samplesSequencer for all instruments in the Gamelan. It is called when
// synths parts etc. are generated (see startingTheEngines()).
// Loading an instrument will only work, if all required samples are available
// at the correct path.
// Main additions to Drums:
// - derives instrument-list and sounds from Object gamelan (now.instruments)
// - can process both string- and array-sequences as _sequence parameter
// - processes a masterAmp for the instrument and separate amp for each sample (to adjust poorly leveled samples)
// - processes a masterPitch for the instrument and a separate pitch for each samples (allow for a "detune" from instrData)
// The handling/use of frequency is not clear yet to me, but looks interesting.
// Not sure how to handle the samples. Currently they are (360MB). This could
// probably be brought down some 50% by editing. But even 180 is a looot
// if loaded through the net...
// Probably users should have the opportunity to download the samples in advance...
// This is not robust yet, but it has a nice potential

function _SampleSeq (instrName, _sequence, _timeValue, _amp, _freq) {

  this.amp = isNaN(_amp) ?  1 : _amp;
  this.instrAmp = now.instruments[instrName].ampSamp;
  this.pitch = 1;
  this.instrPitch = now.instruments[instrName].detuneSamp;

  this.larasSamples = (instrName==="kdhKalih" || instrName==="kdhCiblon" || instrName==="kdhGendhing" || instrName==="kdhKetipung" || instrName==="gong") ? "neutral" : now.laras ;
  this.audioRoot = conf.audioHost+"/"+conf.audioPath+"/"+flags.gamelanName+"/"+this.larasSamples+"/"+instrName+"/";
  this.notes = now.instruments[instrName]["notes"];
  this.octaves =  now.instruments[instrName]["octave"];
  this.notesCnt = this.notes.length;

  this.sounds = {};

  for (var i=0;i<this.notesCnt;i++) {
    var noteName = (typeof this.notes[i]==="number") ? jirolu(this.notes[i]) : taktak(this.notes[i]);
    var fileName = (typeof this.notes[i]==="number") ? this.octaves[i].toString()+dg2so(this.notes[i]) : noteName;
    this.sounds[noteName] = {};
    this.sounds[noteName].sampler = Gibberish.Sampler(this.audioRoot+fileName+".wav");
    this.sounds[noteName].pitch = this.instrPitch[0]*this.instrPitch[1][i];
    this.sounds[noteName].amp = this.instrAmp[0]*this.instrAmp[1][i];
  }

  this.bus = Gibberish.Bus();

  for (var j=0;j<this.notesCnt;j++) {
    var noteName = (typeof this.notes[j]==="number") ? jirolu(this.notes[j]) : taktak(this.notes[j]);
    this.sounds[noteName].sampler.send(this.bus,this.amp*this.sounds[noteName].amp);
  }

  this.bus.connect(Master);

  this.frequency = isNaN(_freq) ? 440 : _freq;

  this.active = true;
  this.masters = [];

  this.sequenceInit =false;
  this.initialized = false;
  this.seq = null;

  var that = this; // closure so that d.shuffle can be sequenced
  this.shuffle = function() { that.seq.shuffle(); };
  this.reset = function() { that.seq.reset(); };

  if(typeof arguments[1] === "object" && !Array.isArray(arguments[1])) {
    var obj = arguments[1];

    for(key in obj) {
      this[key] = obj[key];
    }
    this.seq = Seq({
      doNotAdvance : true,
      note : (typeof this.sequence==="string") ? this.sequence.split("") : this.sequence,
      speed : this.speed,
      slaves : [this],
    });
  } else if (typeof _sequence != "undefined") {
    if(typeof _timeValue !== "undefined") {
      if($.isArray(_timeValue)) {
        this.seq = Seq({
          doNotAdvance : true,
          note : (typeof _sequence==="string") ? _sequence.split("") : _sequence,
          durations : _timeValue,
          slaves:[this],
        });
      }else{
        this.seq = Seq({
          doNotAdvance : true,
          note : (typeof _sequence==="string") ? _sequence.split("") : _sequence,
          speed : _timeValue,
          slaves:[this],
        });
      }
    } else {
      _timeValue = window["_"+_sequence.length];
      this.seq = Seq({
        doNotAdvance : true,
        note : (typeof _sequence==="string") ? _sequence.split("") : _sequence,
        speed : _timeValue,
        slaves:[this],
      });
    }
  }

  //this.seq = {};
  (function(obj) {
    var that = obj;
    Object.defineProperties(that, {
      "speed" : {
        get: function() {
            return that.seq.speed;
        },
        set: function(value) {
          if(that.seq != null) {
            that.seq.speed = value;
          }
        }
      },
      "amp" : {
        get: function() {
            return amp;
        },
        set: function(value) {
          var amp = value;
          for(var sound in this.sounds) {
            console.log("DISCONNECTING", sound);
            this.sounds[sound].sampler.disconnect();
            this.sounds[sound].sampler.send(this.bus, amp*this.sounds[sound].amp);
          }
        }
      } // pitch is constantly recalculated anyways on each advance of the Seq, it seems (see function note below)
    });
  })(this);

  if(this.seq !== null) {
    this.seq.doNotAdvance = false;
    this.seq.advance();
  }
}

_SampleSeq.prototype = {
  sampleRate : 44100, //Gibber.sampleRate,
  type  : "complex",
  name  : "Sampler",

  replace : function(replacement) {
    if(typeof this.seq != "undefined") {
      this.seq.kill();
    }
    for( var i = 0; i < this.masters.length; i++) {
      replacement.masters.push(this.masters[i]);
    }
    for( var j = 0; j < this.fx.length; j++) {
      replacement.fx.push(this.fx[j]);
    }
    for( var k = 0; k < this.mods.length; k++) {
      replacement.mods.push(this.mods[k]);
    }
    this.kill();
  },

  kill : function() {
    Gibber.genRemove(this);
    this.masters.length = 0;
    this.mods.length = 0;
    this.fx.length = 0;
  },

  getMix : function() { return this.value * this.amp; },

  once : function() {
    this.seq.once();
    return this;
  },

  retain : function(num) {
    if(isNaN(num)) {
      this.seq.retain();
    }else{
      this.seq.retain(num);
    }
  },

  set : function(newSequence, _timeValue) {
    var arraySequence = (typeof newSequence==="string") ? newSequence.split("") : newSequence;
    if (typeof this.seq === "undefined" || this.seq === null) {
      this.seq = Seq(arraySequence, _timeValue).slave(this);
    } else {
      this.seq.sequences.note = arraySequence; // set(newSequence) - is this line correct? Does seq still use sequences?;
    }
  },

  note : function(symbol) { return (!isNaN(symbol)) ? this.sounds[jirolu(symbol)].sampler.note(this.pitch * this.sounds[jirolu(symbol)].pitch) : (symbol==="." || symbol===undefined) ? undefined : this.sounds[taktak(symbol)].sampler.note(this.pitch * this.sounds[taktak(symbol)].pitch)  }
};
