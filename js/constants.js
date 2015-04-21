// Data opacity constants.
var datafade		= .1;
var datanormal		= .5;

// Gender constants.
var GENDER_FEMALE	= 0;
var GENDER_MALE		= 1;
var GENDER_BOTH		= 2;

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
	"P": "Population"
	};

var genders = [
	[ "Males", "m", "" ],
	[ "Females", "f", "" ],
	[ "Total", "t", "" ],
	[ "Both", "b", "checked" ]
	];

// View types constants.
var VIEW_BIRTHS		= 0;
var VIEW_DEATHS		= 1;
var VIEW_POPULATION	= 2;
var VIEW_BANDD		= 3;

// View type names.
var views = [
	[ "Births", "" ],
	[ "Deaths", "" ],
	[ "Population", "" ],
	[ "Births and Deaths", "checked" ]
];