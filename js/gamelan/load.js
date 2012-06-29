// GAMELANSCRIPT ###############################################################
// by Rainer Schuetz (2012) for 
// GIBBER
// by Charlie Roberts
// 2011,2012
// MIT License
// #############################################################################
// GLOBAL VARIABLES ############################################################
// variables requred by other files (should not conflict with Gibber, use instrumentspace?)
var autoPilot = Seq(), flags = {}, gamelan = {}, garap = {}, tafsiran = {},
gdhNotation, instrCnt, pulseUnit,
iNames = [], pNames = [],
kar = {}, parts = [], msg = {}, notation = {}, now = {},
nthGatra, nthGong, keteg, nthNong, nthPul, nthPyang, nthSabet, nthThuk,
par = {}, pulse = 0 /*mind potential conflict with waveShape pulse!*/, scales = [], sel = {}, synths = [],
ticker, gongan = Seq(), autopilot = Seq(), watchDogs = Seq(), orientation = Seq();
  

// load the dedicated gamelan-files (still looking for recursive way to make sure
// the files are loaded consecutively)
loadGamelan = lg = function(callback) {
  $.getScript("js/gamelan/settings.js", function(data, textStatus, jqxhr) {
    $.getScript("js/gamelan/messages.js", function(data, textStatus, jqxhr) {
      $.getScript("js/gamelan/samples.js", function(data, textStatus, jqxhr) {
        $.getScript("js/gamelan/samplers.js", function(data, textStatus, jqxhr) {
          $.getScript("js/gamelan/control.js", function(data, textStatus, jqxhr) {
            $.getScript("js/gamelan/notation.js", function(data, textStatus, jqxhr) {
              $.getScript("js/gamelan/karawitan.js", function(data, textStatus, jqxhr) {
              $.getScript("js/gamelan/tafsiran.js", function(data, textStatus, jqxhr) {
                $.getScript("js/gamelan/garap.js", function(data, textStatus, jqxhr) {
                  $.getScript("js/gamelan/gamelan.js", function(data, textStatus, jqxhr) {
                    $.getScript("js/gamelan/nyaga.js", function(data, textStatus, jqxhr) {
                      $.getScript("js/gamelan/gendhing.js", function(data, textStatus, jqxhr) {
                        console.log('Loaded: gendhing.js      '+textStatus+" ("+jqxhr.status+")");
                        console.log("\n***\nSuccessfully loaded all files.\n***\n");
                        G.log("Gamelan loaded. Type play() to hear. Open the JS-console (ctrl-shift-j) to see ;).")
                        if (callback) { callback(); }
                      }).fail( function() {
                        if (arguments[0].readyState==0) {
                          console.log("gendhing.js failed to load.");
                        } else {
                          console.log("gendhing.js: "+arguments[2].toString());
                        }
                      });
                      console.log('Loaded: nyaga.js         '+textStatus+" ("+jqxhr.status+")");
                      }).fail( function() {
                        if (arguments[0].readyState==0) {
                        console.log("nyaga.js failed to load.");
                        } else {
                        console.log("nyaga.js: "+arguments[2].toString());
                        }
                      });
                    console.log('Loaded: gamelan.js       '+textStatus+" ("+jqxhr.status+")");
                    }).fail( function() {
                      if (arguments[0].readyState==0) {
                      console.log("gamelan.js failed to load.");
                      } else {
                      console.log("gamelan.js: "+arguments[2].toString());
                      }
                    });
                    console.log('Loaded: garap.js         '+textStatus+" ("+jqxhr.status+")");
                  }).fail( function() {
                    if (arguments[0].readyState==0) {
                      console.log("garap.js failed to load.");
                    } else {
                      console.log("garap.js: "+arguments[2].toString());
                    }
                  });
                  console.log('Loaded: tafsiran.js      '+textStatus+" ("+jqxhr.status+")");
                }).fail( function() {
                    if (arguments[0].readyState==0) {
                      console.log("tafsiran.js failed to load.");
                    } else {
                      console.log("tafsiran.js: "+arguments[2].toString());
                    }
                });
                  console.log('Loaded: karawitan.js     '+textStatus+" ("+jqxhr.status+")");
                }).fail( function() {
                    if (arguments[0].readyState==0) {
                      console.log("karawitan.js failed to load.");
                    } else {
                      console.log("karawitan.js: "+arguments[2].toString());
                    }
                });
                console.log('Loaded: notation.js      '+textStatus+" ("+jqxhr.status+")");
              }).fail( function() {
                  if (arguments[0].readyState==0) {
                    console.log("notation.js failed to load.");
                  } else {
                    console.log("notation.js: "+arguments[2].toString());
                  }
              });
              console.log('Loaded: control.js       '+textStatus+" ("+jqxhr.status+")");
            }).fail( function() {
                if (arguments[0].readyState==0) {
                  console.log("control.js failed to load.");
                } else {
                  console.log("control.js: "+arguments[2].toString());
                }
            });
            console.log('Loaded: samplers.js      '+textStatus+" ("+jqxhr.status+")");
          }).fail( function() {
              if (arguments[0].readyState==0) {
                console.log("samplers.js failed to load.");
              } else {
                console.log("samplers.js: "+arguments[2].toString());
              }
          });
          console.log('Loaded: samples.js       '+textStatus+" ("+jqxhr.status+")");
        }).fail( function() {
          if (arguments[0].readyState==0) {
            console.log("samples.js failed to load.");
          } else {
            console.log("samples.js: "+arguments[2].toString());
          }
      });
      console.log('Loaded: messages.js      '+textStatus+" ("+jqxhr.status+")");
    }).fail( function() {
        if (arguments[0].readyState==0) {
          console.log("messages.js failed to load.");
        } else {
          console.log("messages.js: "+arguments[2].toString());
        }
    });
    console.log('Loaded: settings.js      '+textStatus+" ("+jqxhr.status+")");
  }).fail( function() {
      if (arguments[0].readyState==0) {
        console.log("settings.js failed to load.");
      } else {
        console.log("settings.js: "+arguments[2].toString());
      }
  });
  return "WELCOME to gamelanScript";
};
resetGamelan = rg = function() {
  G.clear();
  loadGamelan();
  return "WELCOME to gamelanScript. Resetting..."
};

