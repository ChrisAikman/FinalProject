var datafade		= .1;
var datanormal		= .5;

var GENDER_MALE		= 1;
var GENDER_FEMALE	= 0;
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

var Colors = {
	"USA": "blue",
	"JPN": "red",
	"DEUTNP": "green",
	"ESP": "yellow",
	"GBR_NP": "orange",
	"RUS": "purple",
	"FRATNP": "black"
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

var VIEW_BIRTHS		= 0;
var VIEW_DEATHS		= 1;
var VIEW_POPULATION	= 2;
var VIEW_BANDD		= 3;

var views = [
	[ "Births", "" ],
	[ "Deaths", "" ],
	[ "Population", "" ],
	[ "Births and Deaths", "checked" ]
];

// Bisector for hover queries
bisectData = d3.bisector( function(d) { return d[0]; } ).left;

d3.selection.prototype.moveToFront = function() {
  return this.each( function(){
    this.parentNode.appendChild( this );
  });
};

// Updates the hover query when something is moused over
function updateHoverQuery( sel, da, graph )
{
	var left = d3.mouse( sel )[0] + leftOffset + $( "#vis" ).position().left - $( "#hoverquery" ).width() / 2;
	var top = d3.mouse( sel )[1] + topOffset + $( "#vis" ).position().top - $( "#hoverquery" ).height() - 13;
	$( "#hoverquery" ).css( "left", ""+left );
	$( "#hoverquery" ).css( "top", ""+top );
	$( "#countryname" ).html( countries[ d3.select( sel ).attr( "dataname" ) ] );
	var type = d3.select( sel ).attr( "datatype" );
	$( "#hqimg" ).attr( "src", "css/images/flag_" + d3.select( sel ).attr( "dataname" ) + ".png" );
	
	var dat = da["data"][d3.select( sel ).attr( "dataname" )];
	var x0 = graph["x"].invert( d3.mouse(sel)[0] );
	var i = bisectData( dat, x0 );
	var d0 = dat[i - 1];
	var d1 = dat[i];
	var d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;
	
	$( "#year" ).html( d[0] );
	if( type[1] == "M" )
		$( "#data" ).html( "Male " + dataName[type[0]] + ": " + addCommas( Math.round( d[1] ) ) );
	else if( type[1] == "F" )
		$( "#data" ).html( "Female " + dataName[type[0]] + ": " + addCommas( Math.round( d[1] ) ) );
	else if( type[1] == "B" )
		$( "#data" ).html( "Male " + dataName[type[0]] + ": " + addCommas( Math.round( d[1] ) ) + "<BR>" + "Female " + dataName[type[0]] + ": " + addCommas( Math.round( d[2] ) ) );
}

function addCommas( val ){
	while( /(\d+)(\d{3})/.test( val.toString() ) )
		val = val.toString().replace( /(\d+)(\d{3})/, '$1'+','+'$2' );
	return val;
  }

// Generates a data array of the following format: { "Country1": [ [year,count] ], "Country2": [ [year,count] ] }
function genBirths( countries, years, gender )
{
	var retdata = {};
	retdata["data"] = {};
	
	// Gather the data.
	for( var country in countries ) {
		retdata["data"][countries[country]] = [];
		
		for( var year = years[0]; year <= years[1]; year++ )
			if( ""+year in births[countries[country]] )
				retdata["data"][countries[country]].push( [ year, births[countries[country]][year][gender] ] );
	}
	
	return retdata;
}

function genPopDeath( countries, years, gender, dat )
{
	var retdata = {};
	retdata["data"] = {};
	
	for( var country in countries ) {
		retdata["data"][countries[country]] = [];
		
		for( var year = years[0]; year <= years[1]; year++ ) {
			if( ""+year in dat[countries[country]] ) {
				var totalPop = 0;
				for( var age = 0; age < 111; age++ ) {
					if( gender == GENDER_MALE )
						totalPop += ( dat[countries[country]][year][age][GENDER_MALE] );
					if( gender == GENDER_FEMALE )
						totalPop += ( dat[countries[country]][year][age][GENDER_FEMALE] );
					if( gender == GENDER_BOTH )
						totalPop += ( dat[countries[country]][year][age][0] + dat[countries[country]][year][age][1] );
				}
				
				retdata["data"][countries[country]].push( [ year, totalPop ] );
			}
		}
	}
	
	return retdata;
}

function genLTData( countries, years, gender, ages, val, dat )
{
	var retdata = {};
	retdata["data"] = {};
	
	for( var country in countries ) {
		retdata["data"][countries[country]] = [];
		
		for( var year = years[0]; year <= years[1]; year++ ) {
			if( ""+year in dat[countries[country]] ) {
				var totalVal = 0;
				for( var age = 0; age < ages.length; age++ )
					totalVal += ( dat[countries[country]][year][ages[age]][val] );
				
				totalVal /= ages.length
				retdata["data"][countries[country]].push( [ year, totalVal ] );
			}
		}
	}
	
	return retdata;
}

function genDRData( countries, years, gender, ages, dat )
{
	var retdata = {};
	retdata["data"] = {};
	
	for( var country in countries ) {
		retdata["data"][countries[country]] = [];
		
		for( var year = years[0]; year <= years[1]; year++ ) {
			if( ""+year in dat[countries[country]] ) {
				var totalVal = 0;
				for( var age = 0; age < ages.length; age++ )
					totalVal += ( dat[countries[country]][year][ages[age]][2] * 100 );
				
				totalVal /= ages.length
				retdata["data"][countries[country]].push( [ year, totalVal ] );
			}
		}
	}
	
	return retdata;
}

function areaCombine( data1, data2, key, combine )
{
	var newData = [];

	for( var x in data1 )
		newData.push( [ data1[x][key], data1[x][combine], data2[x][combine] ] );
		
	return newData;
}

function addWidths( data1, data2 )
{
	for( var key in data1["data"] )
		for( var elem in data1["data"][key] ) {
			var expand = data2["data"][key][elem][1] / 2 * 10;
			var orig = data1["data"][key][elem][1];
			data1["data"][key][elem][1] = orig - expand;
			data1["data"][key][elem].push( orig + expand );
		}
}

function addGraph( id, margin, width, height, xrange, yrange, xdomain, ydomain, xticks, yticks )
{
	var graph = {};

	// Set the domainds and ranges for each dimension
	graph["x"] = d3.scale.linear().range( xrange ).domain( xdomain );
	graph["y"] = d3.scale.linear().range( yrange ).domain( ydomain );

	// Define the axes
	if( xticks != 0 )
		graph["xAxis"] = d3.svg.axis().scale( graph["x"] ).orient( "bottom" ).ticks( xticks ).tickFormat( d3.format( "d" ) );
	if( yticks != 0 )
		graph["yAxis"] = d3.svg.axis().scale( graph["y"] ).orient( "left" ).ticks( yticks ).tickSize( -width );
		
	// Adds the svg canvas
	graph["svg"] = d3.select( id )
		.append( "svg" )
			.attr( "width", width + margin.left + margin.right )
			.attr( "height", height + margin.top + margin.bottom )
		.append( "g" )
			.attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );
				  
	// Add the X Axis
	if( xticks != 0 )
		graph["svg"].append( "g" )
			.attr( "class", "x axis" )
			.attr( "transform", "translate(0," + height + ")" )
			.call( graph["xAxis"] );
	// Add the Y Axis
	if( yticks != 0 )
		graph["svg"].append( "g" )
			.attr( "class", "y axis" )
			.call( graph["yAxis"] );
		
	// Define how line data should be formed
	graph["valueline"] = d3.svg.line()
		.x(function(d) { return graph["x"](d[0]); })
		.y(function(d) { return graph["y"](d[1]); });
		
	// Define how area data should be formed
	graph["valuearea"] = d3.svg.area()
		.x(function(d) { return graph["x"](d[0]); })
		.y0(function(d) { return graph["y"](d[1]); })
		.y1(function(d) { return graph["y"](d[2]); });
		
	return graph;
}

function baseOnMouseOver( currentC )
{
	var otherlines = $( '.area' ).not( $( "." + currentC ) );
	d3.selectAll( otherlines ).transition().style( "opacity", datafade );
	
	// ADD HERE ALL OTHERS! MAYBE JUST ADD NEW CLASS TO ALL, NOT JUST AREA AND LINE, ETC?
}

function onMouseOver( obj, data, graph ) {
	var currentC = d3.select( obj ).attr( "dataname" );
	baseOnMouseOver( currentC );
	
	d3.select( obj ).moveToFront();
	
	$( "#hoverquery" ).css( "display", "" );
	updateHoverQuery( obj, data, graph );
}

function onMouseOut( obj ){
	$( "#hoverquery" ).css( "display", "none" );
	var otherlines = $( '.area' ).not( obj );
	d3.selectAll( otherlines ).transition().style( "opacity", datanormal );
}

function addData( data, graph, graph2, plottype )
{
	var classn = "";
	var pathtype = "";
	if( data["draw"] == "valueline" ) {
		classn = "line";
		pathtype = "stroke";
	}
	if( data["draw"] == "valuearea" ) {
		classn = "area";
		pathtype = "fill"
	}

	for( var c in data["data"] ) {
		graph["svg"].append("path")
			.attr( "class", classn + " " + c + " " + c + data["name"] )
			.style( pathtype, Colors[c] )
			.attr( "d", graph[data["draw"]]( data["data"][c], graph["x"] ) )
			.attr( "dataname", c )
			.attr( "datatype", data["type"] )
			.attr( "clip-path", "url(#clip)" )
			.on( "mouseover",
			function( d ){
				onMouseOver( this, data, graph );
			} )
			.on( "mouseout",
			function( d ){
				onMouseOut( this );
			} )
			.on( "mousemove",
			function( d ){
				updateHoverQuery( this, data, graph );
			} );
			
		graph2["svg"].append("path")
			.attr( "class", classn + " " + c )
			.style( pathtype, Colors[c] )
			.attr( "d", graph2[data["draw"]]( data["data"][c], graph2["x"] ) )
			.attr( "dataname", c );
	}
}

function addClip( graph, width, height )
{
	graph["svg"].append( "defs" ).append( "clipPath" )
	.attr( "id", "clip" )
	.append( "rect" )
	.attr( "width", width )
	.attr( "height", height );
}