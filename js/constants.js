// Data opacity constants.
var datafade		= .1;
var datanormal		= .5;

// Title constants.
var titlefont = "Century Gothic, sans-serif"

// Hover query constants.
var cursoroffset	= 13;

// Offsets for the vis.
var offsets = { "top": 10, "left": 50, "bottom": 30, "right": 30 };

// Gender constants.
var GENDER_FEMALE	= 0;
var GENDER_MALE		= 1;
var GENDER_TOTAL	= 2;
var GENDER_BOTH		= 3;

// Datasets
var datasets = [
	[ "datasets/births.json", "BIRTHS" ],
	[ "datasets/populations.json", "POPULATIONS" ],
	[ "datasets/deaths.json", "DEATHS" ],
	[ "datasets/deathrates.json", "DEATH RATES" ],
	[ "datasets/ltboth.json", "LIFETIME EXPECTANCIES" ],
	[ "datasets/ltfemale.json", "MALE LIFETIME EXPECTANCIES" ],
	[ "datasets/ltmale.json", "FEMALE LIFETIME EXPECTANCIES" ],
	[ "datasets/events.json", "EVENTS" ]
	];

var colors = {
	"USA": "blue",
	"JPN": "red",
	"DEUTNP": "green",
	"ESP": "yellow",
	"GBR_NP": "orange",
	"RUS": "purple",
	"FRATNP": "black",
	"Event": "gray"
	};

var countries = {
	"USA": "United States",
	"JPN": "Japan",
	"DEUTNP": "Germany",
	"ESP": "Spain",
	"GBR_NP": "United Kingdom",
	"RUS": "Russia",
	"FRATNP": "France"
	};

var dataName = {
	"D": "Deaths",
	"B": "Births",
	"P": "Population",
	"R": "% Death Rate",
	"L": "Life Expectancy"
	};
	
var genderDisplay = {
	"#hoverquery": {
		"F": "Female",
		"M": "Male",
		"T": "Total"
	},
	"#hoverquery2": {
		"F": "",
		"M": "",
		"T": ""
	}
}

var genders = [
	[ "Females", "F", "" ],
	[ "Males", "M", "" ],
	[ "Total", "T", "" ],
	[ "Both", "B", "checked" ]
	];

// Data types constants.
var DATA_BIRTHS				= 0;
var DATA_DEATHS				= 1;
var DATA_POPULATION			= 2;
var DATA_DEATHREATES		= 3;
var DATA_LIFEEXPECTANCY		= 4;
	
// View types constants.
var VIEW_BIRTHS				= 0;
var VIEW_DEATHS				= 1;
var VIEW_POPULATION			= 2;
var VIEW_DEATHRATES			= 99;
var VIEW_LIFEEXPECTANCY		= 3;
var VIEW_BANDD				= 4;

// View type names.
var views = [
	[ "Births", "" ],
	[ "Deaths", "" ],
	[ "Population", "" ],
	//[ "Death Rates", "" ],
	[ "Life Expectancy", "" ],
	[ "Births and Deaths", "checked" ]
];