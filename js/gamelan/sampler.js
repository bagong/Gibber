// _sampler is called when synths parts etc. are generated. It creates a sampler
// analogous to Drums() for each instrument in the current Gamelan.
// (see startinTheEngines ... window[cap])
// Loading and instrument will only work, if all required samples are available
// in the right path.
// Below changes to _drums add the dynamicity and distinguishes between sequences that come in
// as strings and numeric arrays to allow for more general notation as well.
// I haven't pushed the audio-files for now because they are way to large to be (360MB for now)
// This could probably be brought down some 50% by editing. But even 180 is a looot
// if loaded through the net... Not sure what to do yet...

function _sampler (instrName, _sequence, _timeValue, _amp, _freq) {

  this.larasSamples = (instrName==="kdhKalih" || instrName==="kdhCiblon" || instrName==="kdhGendhing" || instrName==="kdhKetipung" || instrName==="gong") ? "neutral" : now.laras ;
  this.audioRoot = conf.audioHost+"/"+conf.audioPath+"/"+flags.gamelanName+"/"+this.larasSamples+"/"+instrName+"/";
  this.notes = now.instruments[instrName]["notes"];
  this.octaves =  now.instruments[instrName]["octave"];
  this.notesCnt = this.notes.length;

  this.bus = Gibberish.Bus();

  for (var i=0;i<this.notesCnt;i++) {
    var noteName = (typeof this.notes[i]==="number") ? jirolu(this.notes[i]) : taktak(this.notes[i]);
    var fileName = (typeof this.notes[i]==="number") ? this.octaves[i].toString()+dg2so(this.notes[i]) : noteName;
    this[noteName] = Gibberish.Sampler(this.audioRoot+fileName+".wav");
    this[noteName].connect(this.bus);
  }
  this.bus.connect(Master);

  this.amp = isNaN(_amp) ? now.instruments[instrName].ampSamp[0] : _amp;
  this.frequency = isNaN(_freq) ? 440 : _freq;

  this.active = true;
  this.masters = [];
  this.pitch = 1; // pitch is a mod to frequency; only used when the value is set

  this.sequenceInit =false;
  this.initialized = false;
  this.seq = null;

  var that = this; // closure so that d.shuffle can be sequenced
  this.shuffle = function() { console.log("SHUFFLE"); that.seq.shuffle(); };
  this.reset = function() { that.seq.reset(); };

  if(typeof arguments[1] === "object" && !Array.isArray(arguments[1])) {
    alert("I am here!");
    var obj = arguments[1];
    for(key in obj) {
      this[key] = obj[key];
    }

    this.seq = Seq({
      doNotAdvance : true,
      note :  (typeof this.sequence==="string") ? this.sequence.split("") : this.sequence,
      speed :   this.speed,
      slaves :  [this],
    });
  } else if (typeof _sequence != "undefined") {
    if (typeof _timeValue !== "undefined") {
      if ($.isArray(_timeValue)) {
        this.seq = Seq({
          doNotAdvance : true,
          note : (typeof _sequence==="string") ? _sequence.split("") : _sequence,
          durations : _timeValue,
          slaves:[this],
        });
      } else {
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
    var _pitch = 1;

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
      // pitch is a multiplier for the fundamental frequency of the samplers (440). A pitch value of 2 means the samples will be played with a frequency of 880 hz.
      "pitch" : {
            get: function() {
                return _pitch;
            },
            set: function(value) {
          _pitch = value;
          that.frequency = 440 * value;
            }
      },
      });
  })(this);
  //if(this.pitch != 1) this.pitch = arguments[1].pitch;

  if(this.seq !== null) {
    this.seq.doNotAdvance = false;
    this.seq.advance();
  }
};
_sampler.prototype = {
  sampleRate : 44100, //Gibber.sampleRate,
  type  : "complex",
  name  : "gamelan",

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
    if(typeof this.seq === "undefined" || this.seq === null) {
      this.seq = Seq(newSequence, _timeValue).slave(this);
    }else{
      this.seq.sequences.note = (typeof newSequence==="string") ? newSequence.split("") : newSequence; //set(newSequence);
    }
  },
  note : function(symbol) { return (typeof symbol==="number") ? this[jirolu(symbol)].note(this.pitch) : (symbol==="." || symbol===undefined) ? undefined : this[taktak(symbol)].note(this.pitch); }
};


