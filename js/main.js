requirejs.config({
    baseUrl: 'js',
    paths: { }
});

requirejs([
  'codemirror/codemirror', 
  "codemirror/util/loadmode",
  "codemirror/util/overlay",
  'gibberish/lib/external/sink-light', 
  'gibberish/lib/gibberish', 
  'gibber/gibber',
  'gibber/environment',
  'gibber/default_scripts',
  'gibberish/lib/external/audiofile', 
  'gibberish/lib/utils', 
  'gibberish/lib/cycle',
  'gamelan/gamelan',
  'gamelan/sampler'
	],
	
	function   ( _a, _b, _c, _d, __gibberish, __gibber, __environment, e) {
		window.Gibberish = __gibberish;
		window.Gibber = window.G = __gibber;
		Gibber.Environment = __environment;
		Gibberish.init();
		
		Gibberish.callback = Gibberish.generateCallback();
		Gibber.init();
	}
);
