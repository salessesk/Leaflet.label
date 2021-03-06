exports.config = {
	"browser": true,
	"node": true,
	"predef": ["L", "poly2tri"],

	"debug": false,
	"devel": false,

	"es5": false,
	"strict": false,
	"globalstrict": false,

	"asi": false,
	"laxbreak": false,
	"bitwise": true,
	"boss": false,
	"curly": true,
	"eqnull": false,
	"evil": false,
	"expr": false,
	"forin": true,
	"immed": true,
	"latedef": true,
	"loopfunc": false,
	"noarg": true,
	"regexp": true,
	"regexdash": false,
	"scripturl": false,
	"shadow": false,
	"supernew": false,
	"undef": true,
	"funcscope": false,

	"newcap": true,
	"noempty": true,
	"nonew": true,
	"nomen": false,
	"onevar": false,
	"plusplus": false,
	"sub": false,
	"indent": 4,

	"eqeqeq": true,
	"trailing": true,
	"white": true,
	"smarttabs": true
};

exports.globals = {
	'L': false,
	'poly2tri': false
}
