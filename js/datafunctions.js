// Bisector for hover queries
bisectData = d3.bisector( function(d) { return d[0]; } ).left;

d3.selection.prototype.moveToFront = function() {
  return this.each( function(){
    this.parentNode.appendChild( this );
  });
};

// Gathers data for the selected gender types.
function genderFilteredData( dat, gender, maleloc, femaleloc )
{
	if( gender == GENDER_MALE )
		return ( dat[maleloc] );
	if( gender == GENDER_FEMALE )
		return ( dat[femaleloc] );
	
	return ( dat[maleloc] + dat[femaleloc] );
}

// Gathers data for the selected gender types over a range of ages.
function genderFilteredAgeData( dat, gender, maleloc, femaleloc, ages )
{
	var total = 0;
	for( var age = ages[0]; age <= ages[1]; age++ )
		total += genderFilteredData( dat[age], gender, maleloc, femaleloc )
	
	return total;
}

// Gathers data for the selected gender types over a range of ages.
function avgFilteredData( dat, val, maleloc, femaleloc, ages )
{
	var total = 0;
	for( var age = ages[0]; age <= ages[1]; age++ )
		total += genderFilteredData( dat[age], gender, maleloc, femaleloc )
		
	total /= ( ages[1] + 1 - ages[0] );
	total *= 100;
	
	return total;
}

// Gathers data for the selected gender types over a range of ages.
function valFilteredData( dat, val )
{
	/*var total = 0;
	for( var age = 0; age < 111; age++ )
		total += dat[age][val];
		
	total /= 111;*/
	
	return dat[0][val]
	
	return total;
}

function genBirths( countries, years, gender, ages )
{
	var retdata = {};
	retdata["data"] = {};
	
	// Gather the data.
	for( var country in countries ) {
		var partOn = 0;
		var errOn = 0;
		var lastData = 0;
		retdata["data"][countries[country]] = { "data":[], "err":[] };
		retdata["data"][countries[country]]["data"].push( [] );
		
		for( var year = years[0]; year <= years[1]; year++ )
			if( ""+year in births[countries[country]] ) {
				lastData = [ year, genderFilteredData( births[countries[country]][year], gender, GENDER_MALE, GENDER_FEMALE, ages ) ];
				retdata["data"][countries[country]]["data"][partOn].push( lastData );
			}
			else {
				// Missing data! Loop until we find the next valid entry.
				while( !( ""+year in births[countries[country]] ) && year < years[1] )
					year++;
					
				// Skip the border cases.
				if( lastData == 0 || year == years[1] )
					continue;
					
				// Move to the next part of the data. Add this as an error part.
				retdata["data"][countries[country]]["err"].push( [] );
				retdata["data"][countries[country]]["err"][errOn].push( lastData );
				lastData = [ year, genderFilteredData( births[countries[country]][year], gender, GENDER_MALE, GENDER_FEMALE, ages ) ];
				retdata["data"][countries[country]]["err"][errOn].push( lastData );
				
				// Go back a year if this is not the last requested year.
				retdata["data"][countries[country]]["data"].push( [] );
				errOn++;
				partOn++;
				if( year < years[1] )
					year--;
			}
	}
	
	return retdata;
}

function genPopDeath( countries, years, gender, dat, ages )
{
	var retdata = {};
	retdata["data"] = {};
	
	// Gather the data.
	for( var country in countries ) {
		var partOn = 0;
		var errOn = 0;
		var lastData = 0;
		retdata["data"][countries[country]] = { "data":[], "err":[] };
		retdata["data"][countries[country]]["data"].push( [] );
		
		for( var year = years[0]; year <= years[1]; year++ )
			if( ""+year in dat[countries[country]] ) {
				lastData = [ year, genderFilteredAgeData( dat[countries[country]][year], gender, GENDER_MALE, GENDER_FEMALE, ages ) ];
				retdata["data"][countries[country]]["data"][partOn].push( lastData );
			}
			else {
				// Missing data! Loop until we find the next valid entry.
				while( !( ""+year in dat[countries[country]] ) && year < years[1] )
					year++;
					
				// Skip the border cases.
				if( lastData == 0 || year == years[1] )
					continue;
					
				// Move to the next part of the data. Add this as an error part.
				retdata["data"][countries[country]]["err"].push( [] );
				retdata["data"][countries[country]]["err"][errOn].push( lastData );
				lastData = [ year, genderFilteredAgeData( dat[countries[country]][year], gender, GENDER_MALE, GENDER_FEMALE, ages ) ];
				retdata["data"][countries[country]]["err"][errOn].push( lastData );
				
				// Go back a year if this is not the last requested year.
				retdata["data"][countries[country]]["data"].push( [] );
				errOn++;
				partOn++;
				if( year < years[1] )
					year--;
			}
	}
	
	return retdata;
}

function genLTData( countries, years, dat, val, ages )
{
	var retdata = {};
	retdata["data"] = {};
	
	// Gather the data.
	for( var country in countries ) {
		var partOn = 0;
		var errOn = 0;
		var lastData = 0;
		retdata["data"][countries[country]] = { "data":[], "err":[] };
		retdata["data"][countries[country]]["data"].push( [] );
		
		for( var year = years[0]; year <= years[1]; year++ )
			if( ""+year in dat[countries[country]] ) {
				lastData = [ year, valFilteredData( dat[countries[country]][year], val, ages ) ];
				retdata["data"][countries[country]]["data"][partOn].push( lastData );
			}
			else {
				// Missing data! Loop until we find the next valid entry.
				while( !( ""+year in dat[countries[country]] ) && year < years[1] )
					year++;
					
				// Skip the border cases.
				if( lastData == 0 || year == years[1] )
					continue;
					
				// Move to the next part of the data. Add this as an error part.
				retdata["data"][countries[country]]["err"].push( [] );
				retdata["data"][countries[country]]["err"][errOn].push( lastData );
				lastData = [ year, valFilteredData( dat[countries[country]][year], val, ages ) ];
				retdata["data"][countries[country]]["err"][errOn].push( lastData );
				
				// Go back a year if this is not the last requested year.
				retdata["data"][countries[country]]["data"].push( [] );
				errOn++;
				partOn++;
				if( year < years[1] )
					year--;
			}
	}
	
	return retdata;
}

function genDRData( countries, years, gender, dat, ages )
{
	var retdata = {};
	retdata["data"] = {};
	
	// Gather the data.
	for( var country in countries ) {
		var partOn = 0;
		var errOn = 0;
		var lastData = 0;
		retdata["data"][countries[country]] = { "data":[], "err":[] };
		retdata["data"][countries[country]]["data"].push( [] );
		
		for( var year = years[0]; year <= years[1]; year++ )
			if( ""+year in dat[countries[country]] ) {
				lastData = [ year, genderFilteredAgeData( dat[countries[country]][year], gender, GENDER_MALE, GENDER_FEMALE, ages ) ];
				retdata["data"][countries[country]]["data"][partOn].push( lastData );
			}
			else {
				// Missing data! Loop until we find the next valid entry.
				while( !( ""+year in dat[countries[country]] ) && year < years[1] )
					year++;
					
				// Skip the border cases.
				if( lastData == 0 || year == years[1] )
					continue;
					
				// Move to the next part of the data. Add this as an error part.
				retdata["data"][countries[country]]["err"].push( [] );
				retdata["data"][countries[country]]["err"][errOn].push( lastData );
				lastData = [ year, genderFilteredAgeData( dat[countries[country]][year], gender, GENDER_MALE, GENDER_FEMALE, ages ) ];
				retdata["data"][countries[country]]["err"][errOn].push( lastData );
				
				// Go back a year if this is not the last requested year.
				retdata["data"][countries[country]]["data"].push( [] );
				errOn++;
				partOn++;
				if( year < years[1] )
					year--;
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
	var otherlines = $( '.area, .line' ).not( $( "." + currentC ) );
	d3.selectAll( otherlines ).transition().style( "opacity", datafade );
	
	// ADD HERE ALL OTHERS! MAYBE JUST ADD NEW CLASS TO ALL, NOT JUST AREA AND LINE, ETC?
}

function onMouseOver( obj, data, graph ) {
	var currentC = d3.select( obj ).attr( "dataname" );
	baseOnMouseOver( currentC );
	
	d3.select( obj ).moveToFront();
	
	$( hqbox ).css( "display", "" );
	updateHoverQuery( obj, data, graph );
}

function onMouseOut( obj ){
	$( hqbox ).css( "display", "none" );
	var otherlines = $( '.area, .line' ).not( obj );
	d3.selectAll( otherlines ).transition().style( "opacity", datanormal );
}

function addData( data, graph, graph2 )
{
	var classn = "";
	var pathtype = "";
	if( data["draw"] == "valueline" )
		classn = "line";
	if( data["draw"] == "valuearea" ) {
		classn = "area";
		pathtype = "fill"
	}

	for( var c in data["data"] ) {
		for( var nd in data["data"][c]["data"] ) {
			graph["svg"].append("path")
				.attr( "class", classn + " " + c + " " + c + data["name"] + nd )
				.style( pathtype, colors[c] )
				.style( "stroke", colors[c] )
				.attr( "d", graph[data["draw"]]( data["data"][c]["data"][nd], graph["x"] ) )
				.attr( "dataname", c )
				.attr( "datanum", nd )
				.attr( "datatype", data["type"] )
				.attr( "clip-path", "url(#clip)" )
				.on( "mouseover", function( d ){ onMouseOver( this, data, graph ); } )
				.on( "mouseout", function( d ){ onMouseOut( this ); } )
				.on( "mousemove", function( d ){ updateHoverQuery( this, data, graph ); } );
				
			graph2["svg"].append("path")
				.attr( "class", classn + " overview" + classn + " " + c )
				.style( pathtype, colors[c] )
				.style( "stroke", colors[c] )
				.attr( "d", graph2[data["draw"]]( data["data"][c]["data"][nd], graph2["x"] ) )
				.attr( "dataname", c );
		}
		
		// Draw the errors if the correct version is selected.
		if( $( "#versionlist input[type='radio']:checked" ).val() == "1" )
			for( var e in data["data"][c]["err"] )
				addError( data["data"][c]["err"][e], graph, graph2, c, data["draw"], data["type"], data["name"], e )
	}
		
	
}

function addEvent( data, graph, graph2 )
{
	graph["svg"].append("path")
		.attr( "class", "area " + " event " + "event" + data["num"] )
		.style( "fill", colors["Event"] )
		.attr( "d", graph["valuearea"]( data["data"], graph["x"] ) )
		//.attr( "eventname", c )
		.attr( "clip-path", "url(#clip)" )
		.on( "mouseover",
		function( d ){ ; } )
		.on( "mouseout",
		function( d ){ ; } )
		.on( "mousemove",
		function( d ){ ; } );
		
	graph2["svg"].append("path")
		.attr( "class", "area event" )
		.style( "fill", colors["Event"] )
		.attr( "d", graph2["valuearea"]( data["data"], graph2["x"] ) );
}

function addError( data, graph, graph2, c, drawtype, datatype, dataname, err )
{
	graph["svg"].append("path")
		.attr( "class", "line error " + c + " err" + c + dataname + err )
		.style( "stroke", colors[c] )
		.style( "fill", "white" )
		.attr( "d", graph[drawtype]( data, graph["x"] ) )
		.attr( "dataname", c )
		//.attr( "datanum", nd )
		.attr( "datatype", "E" )
		.attr( "clip-path", "url(#clip)" )
		.on( "mouseover", function( d ){ onMouseOver( this, data, graph ); } )
		.on( "mouseout", function( d ){ onMouseOut( this ); } )
		.on( "mousemove", function( d ){ updateHoverQuery( this, data, graph ); } );
		
	graph2["svg"].append("path")
		.attr( "class", "line overview error " + c )
		.style( "stroke", colors[c] )
		.style( "fill", "white" )
		.attr( "d", graph2[drawtype]( data, graph2["x"] ) )
		.attr( "dataname", c );
}

function addClip( graph, width, height )
{
	graph["svg"].append( "defs" ).append( "clipPath" )
	.attr( "id", "clip" )
	.append( "rect" )
	.attr( "width", width )
	.attr( "height", height );
}