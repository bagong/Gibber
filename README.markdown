## GibberGamelan alias gamelanScript ##

This fork serves the purpose to host a gamelan-extension to Charlie Roberts Gibber
(see below). You will find the gamelan-related files in the subfolder js/gamelan. Enjoy and
stay tuned, more is on the way...

Gamelan.js allows to emulate a subset of a Javanese Gamelan-Ensemble based on 
the notation of only a single basic part/tone-succession and thereby tries to 
model some of the competenceof Javanese musicians.

In order to get this running you need Google Chrome or Chromium (version 18
upwards are tested).
- You will need all files from Gibber and gamelan.js in place as in the
download from github (branch develop-gam, the default branch).
- Open index.html (in the root-folder of Gibber) in Chrome - you might have to 
reload the page a few times before Gibber loads properly. You will see that it
is ready to play when the red squares at the to left corner start moving.
- Find the menu "load" and click the entry "gamelan"
- On the opening page ignore the settings lines starting with flags. or conf.
Proceed right to prepareEngines() - hit ctrl-Return on that line
- Proceed to gendhing.play() - hit ctrl-Return again and the gamelan should start
playing.

From the settings only the synth-alternative (FM,additive and triangle) and the
logging choices allow changes for now.
You need to reload the page before you can change settings and you need
to make your settings before ctrl-Returning prepareEngines().

gamelanScript is designed to be generic and extensible, so expect more... It is
still in an early stage of development and plays one piece (gendhing) for now.
Most of the develpment-efforts went into the part generation and general
structure/framework, sounds are still very flat and timing is still stiff.
There is no documentation except the code itself and some logging you can see
in the javascript-console.

Contributions are welcome.

Rainer Schütz
rs(at)bagong.de
July 2012


## Gibber ##

Gibber is a live coding environment for the web browser, built on top of audiolib.js
and using the ACE code editor. I've only tested it in Chrome.

Below is a code sample. To test out Gibber, visit http://www.charlie-roberts.com/gibber

``` javascript
Gibber.setBPM(180);     // default = 120. You can also refer to Gibber as _g.

s = Sine(240, .25);      // Sine wave with freq 240, amp .5.

s.chain(                // create an fx chain for oscillator                   
    Dist(),             // Distortion
    Delay(_g.beat / 4)  // Delay with delay time set to 1/4 of a beat (1/16th note)
);

a = Arp(s, "Cm7", 2, _g.beat / 4, "updown"); // Arpeggiator: Cminor7 chord, 2nd octave, 16th notes, up then down

d = Drums("x*o*x*o*",8);
d.chain( Trunc(6) );
d.frequency = 660;     // 440 is base frequency

s.mod("freq", LFO(8, 4), "+");  // Vibrato - modulating frequency by +/- 4Hz 8 times per second
s.removeMod(1);                 // mod 0 is the arp, I know, confusing...

a.shuffle();        // randomize arpeggio
a.reset();          // reset arpeggio

Master.chain( Reverb() );     // Master FX are applied to summed signal of all generators
Master.removeFX(0);           // remove first effect in chain. don't pass a argument to remove all fx.
```
