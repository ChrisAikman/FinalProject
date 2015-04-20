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

function genBirths( countries, years, gender )
{
	var retdata = {};
	retdata["data"] = {};
	
	// Gather the data.
	for( var country in countries ) {
		retdata["data"][countries[country]] = { "data":[], "err":[] };
		
		retdata["data"][countries[country]]["data"].push( [] );
		
		for( var year = years[0]; year <= years[1]; year++ )
			if( ""+year in births[countries[country]] )
				retdata["data"][countries[country]]["data"][0].push( [ year, births[countries[country]][year][gender] ] );
			else
				retdata["data"][countries[country]]["data"][0].push( [ year, 0 ] );
				
		while( retdata["data"][countries[country]]["data"][0][0][1] == 0 )
			retdata["data"][countries[country]]["data"][0].shift();
		while( retdata["data"][countries[country]]["data"][0][retdata["data"][countries[country]]["data"][0].length-1][1] == 0 )
			retdata["data"][countries[country]]["data"][0].pop();
	}
	
	return retdata;
}

function genPopDeath( countries, years, gender, dat )
{
	var retdata = {};
	retdata["data"] = {};
	
	for( var country in countries ) {
		retdata["data"][countries[country]] = { "data":[], "err":[] };
		
		retdata["data"][countries[country]]["data"].push( [] );
		
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
				
				retdata["data"][countries[country]]["data"][0].push( [ year, totalPop ] );
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

function areaCombineS( data1, data2, key, combine )
{
	var newData = [];

	for( var x in data1 )
		newData.push( [ data1[x][key], data1[x][combine], data2[x][combine] ] );
		
	return newData;
}

function areaCombine( data1, data2, key, combine )
{
	var newData = { "data":[], "err":[] };
	
	for( var d in data1["data"] )
		newData["data"].push( areaCombineS( data1["data"][d], data2["data"][d], key, combine ) );
		
	for( var e in data1["err"] )
		newData["err"].push( areaCombineS( data1["err"][e], data2["err"][e], key, combine ) );
		
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

function addData( data, graph, graph2 )
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

	for( var c in data["data"] )
		for( var nd in data["data"][c]["data"] ) {
			graph["svg"].append("path")
				.attr( "class", classn + " " + c + " " + c + data["name"] )
				.style( pathtype, Colors[c] )
				.attr( "d", graph[data["draw"]]( data["data"][c]["data"][nd], graph["x"] ) )
				.attr( "dataname", c )
				.attr( "datanum", nd )
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
				.attr( "d", graph2[data["draw"]]( data["data"][c]["data"][nd], graph2["x"] ) )
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