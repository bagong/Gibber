// Gibber - 08-samplers.js
// ========================

(function myPlugin(){

function initPlugin(audioLib){
(function(audioLib){    
    
// ###Kendhang
// Three different samplers linked to a combined sequencer for convenience  
//
// param **sequence**: String. Uses b for bem, p for thung, t for tak, o for thong, a for tap, k for ket and r for kret
// param **timeValue**: Int. A duration in samples for each drum hit. Commonly uses Gibber time values such as _4, _8 etc.  
// param **mix**: Float. Default = .175. Volume for Kendhang  
// param **freq**: Int. The audioLib.js samplers use 440 as a fundamental frequency. You can raise or lower the pitch of samples by changing this value.  
//
// example usage:    
// d = Kendhang("ttpb", _8, .2, 880)
//
// note that most Drum methods mirror that of Seq. 

function Kendhang(_sequence, _timeValue, _amp, _freq){
  this.bem = new audioLib.Sampler(Gibber.sampleRate);
  this.ket = new audioLib.Sampler(Gibber.sampleRate);
  this.kret = new audioLib.Sampler(Gibber.sampleRate);
  this.tak = new audioLib.Sampler(Gibber.sampleRate);
  this.tap = new audioLib.Sampler(Gibber.sampleRate);
  this.thong = new audioLib.Sampler(Gibber.sampleRate);
  this.thung = new audioLib.Sampler(Gibber.sampleRate);
  this.amp = isNaN(_amp) ? .4 : _amp;
  this.frequency = isNaN(_freq) ? 440 : _freq;

  this.value = 0;
  this.active = true;
  this.mods = [];
  this.fx = [];
  this.sends = [];
  this.masters = [];
  this.pitch = 1; // pitch is a mod to frequency; only used when the value is set
  
  this.sequenceInit =false;
  this.initialized = false;
  this.seq = null;
  
  Gibber.addModsAndFX.call(this);
  Gibber.generators.push(this);  
  
  var that = this; // closure so that d.shuffle can be sequenced
  this.shuffle = function() { that.seq.shuffle(); };
  this.reset = function() { that.seq.reset(); };
  
  this.load();
  
  if(typeof arguments[0] === "object") {
    var obj = arguments[0];
    
    for(key in obj) {
      this[key] = obj[key];
    }
    
    this.seq = Seq({
      sequence :   this.sequence,
      speed :   this.speed,
      slaves :  [this],
    });
  } else if (typeof _sequence != "undefined") {
    if(typeof _timeValue !== "undefined") {
      if($.isArray(_timeValue)) {
        this.seq = Seq({
          sequence :_sequence,
          durations : _timeValue,
          slaves:[this],
        });
      } else {
        this.seq = Seq({
          sequence :_sequence,
          speed : _timeValue,
          slaves:[this],
        });
      }
    } else {
      _timeValue = window["_"+_sequence.length];
      this.seq = Seq({
        sequence :_sequence,
        speed : _timeValue,
        slaves:[this],
      });
    }
  }
  
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
  
  if(this.pitch != 1) this.pitch = arguments[0].pitch;

  this.reset = function(num)  { 
    if(isNaN(num)) {
      that.seq.reset();
    }else{
      that.seq.reset(num); 
    }
  };
}

Kendhang.prototype = {
  sampleRate : Gibber.sampleRate,
  type  : "complex",
  name  : "Kendhang",

  load : function (){
    // SAMPLES ARE PRELOADED IN GIBBER CLASS... but it still doesn't stop the hitch when loading these...
    this.bem.loadWav(Gibber.samples.bem);
    this.ket.loadWav(Gibber.samples.ket);
    this.kret.loadWav(Gibber.samples.kret);
    this.tak.loadWav(Gibber.samples.tak);
    this.tap.loadWav(Gibber.samples.tap);
    this.thong.loadWav(Gibber.samples.thong);
    this.thung.loadWav(Gibber.samples.thung);

    this.initialized = true;
  },
  
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

  generate : function() {
    this.value = 0;
    if(!this.initialized) {
      return;
    }

    this.bem.generate();
    this.value += this.bem.getMix();

    this.ket.generate();
    this.value += this.ket.getMix();

    this.kret.generate();
    this.value += this.kret.getMix();

    this.tak.generate();
    this.value += this.tak.getMix();

    this.tap.generate();
    this.value += this.tap.getMix();

    this.thong.generate();
    this.value += this.thong.getMix();

    this.thung.generate();
    this.value += this.thung.getMix();
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
      this.seq.set(newSequence); 
    }
  },
  
  note : function(nt) {
    switch(nt) {
      case "b":
        this.bem.noteOn(this.frequency);
        break;
      case "k":
        this.ket.noteOn(this.frequency);
        break;
      case "r":
        this.kret.noteOn(this.frequency);
        break;
      case "t":
        this.tak.noteOn(this.frequency);
        break;
      case "a":
        this.tap.noteOn(this.frequency);
        break;
      case "o":
        this.thong.noteOn(this.frequency);
        break;
      case "p":
        this.thung.noteOn(this.frequency);
        break;
      default: break;
    }
  },
};

Kendhang.prototype.__proto__ = new audioLib.GeneratorClass();

audioLib.generators('Kendhang', Kendhang);

audioLib.Kendhang = audioLib.generators.Kendhang;
 
}(audioLib));
audioLib.plugins('Kendhang', myPlugin);
}

if (typeof audioLib === 'undefined' && typeof exports !== 'undefined'){
  exports.init = initPlugin;
} else {
  initPlugin(audioLib);
}

}());

function Kendhang (_sequence, _timeValue, _mix, _freq) {
  var d = new audioLib.Kendhang(_sequence, _timeValue, _mix, _freq);
  
  return d;
}

