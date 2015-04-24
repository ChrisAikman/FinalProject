// Adds commas to a number.
function addCommas( val ){
	while( /(\d+)(\d{3})/.test( val.toString() ) )
		val = val.toString().replace( /(\d+)(\d{3})/, '$1'+','+'$2' );
	return val;
}

// Add unit suffix to the numbers.
function addSuffix( num ) {
	if( num < 1000 )
		return "" + addCommas( num );
	if( num < 1000000 )
		return addCommas( num /= 1000 ) + "K";
	if( num < 10000000 )
		return addCommas( ( num / 1000000 ).toFixed( 2 ) ) + "M";
	if( num < 100000000 )
		return addCommas( ( num / 1000000 ).toFixed( 1 ) ) + "M";
		
	return addCommas( num /= 1000000 ) + "M"
}

// Rounds a number up to the nearest tens.
function roundTens( num ) {
	var deci = 1;
	while( num > 1 ) {
		deci *= 10;
		num /= 10;
	}
	
	return Math.round( ( num * 100 ) + .5 ) * ( deci / 100 );
}

// This makes the introbox and displays it.
function introBox()
{
	$( "body" ).height( $( document ).height() );
	$( "#fadebox" ).width( $( document ).width() ).height( $( document ).height() );

	var hWidth = $( document ).width() * .5;
	var hHeight = $( document ).height() * .5;
	
	$( "#introbox" ).width( hWidth ).css( "left", hWidth - hWidth * .5 ).css( "top", hHeight - $( "#introbox" ).height() * .5 );
	
	loadScripts();
}

// Fades out the introbox when loading is complete.
function removeIntroBox()
{
	$( "#introbox" ).animate({
		opacity: 0.0,
		}, 500, function() {
			$( "#introbox" ).html( "" );
	});
	
	$( "#fadebox" ).animate({
		opacity: 0.0,
		}, 500, function() {
			$( "#fadebox" ).css( "display", "none" );
	});
}

// Dynamically load scripts and then let the user know loading is done.
function loadScripts()
{
	$.getScript( datasets[loadScriptOn][0], function( data, textStatus, jqxhr ) {
		$( "#introloading" ).html( "LOADING " + datasets[loadScriptOn][1] + "..." );
		loadScriptOn++;
		
		if( loadScriptOn < datasets.length )
			loadScripts();
		else {
			$( "#introloading" ).html( "<div class=\"loadingbutton\" onclick=\"removeIntroBox();\">LOADING COMPLETE CLICK TO CONTINUE</div>" );
			fillControls();
			generateVis();
			fillVis();
		}
	});
}

// Add all of the help buttons and their tooltips.
function addHelp()
{
	var helps = [
		[ "#countryHelp",		"Select the countries to display data for.",												"left center",		"right center" ],
		[ "#viewHelp",			"Select which view to show.",																"left center",		"right center" ],
		[ "#filterHelp",		"Select the specific filters to apply to the data.",										"left center",		"right center" ],
		[ "#eventHelp",			"Select the events to display data for.",													"left center",		"right center" ],
		[ "#versionHelp",		"Select the version of the vis to display. Please change these based on the survey.",		"left center",		"right center" ],
		[ "#helpIcon",			"Help will popup in these tooltips!",														"bottom center",	"top center" ]
	];
	
	for( var h in helps )
		$(helps[h][0]).qtip( { content: { text: helps[h][1] }, style: { classes: "qtip-dark" }, position: { my: helps[h][2], at: helps[h][3] }, show: { delay: 0 } } )
}

// Updates the hover query when something is moused over
function updateHoverQuery( sel, da, graph )
{
	// Update position.
	var left = d3.mouse( sel )[0] + leftOffset + $( "#vis" ).position().left - $( hqbox ).width() / 2;
	var top = d3.mouse( sel )[1] + topOffset + $( "#vis" ).position().top - $( hqbox ).height();
	$( ".callout" ).css( "display", "none" );
	
	if( left > $( "body" ).width() - $( hqbox ).width() ) {
		$( ".calloutright" ).css( "display", "" );
		left -= $( hqbox ).width() / 2 + cursoroffset;
		top +=  $( hqbox ).height() / 2;
	}
	else if( top < $( hqbox ).height() ) {
		$( ".callouttop" ).css( "display", "" );
		top += $( hqbox ).height() + cursoroffset * 2;
	}
	else {
		$( ".calloutbottom" ).css( "display", "" );
		top -= cursoroffset;
	}
	
	$( hqbox ).css( "left", ""+left );
	$( hqbox ).css( "top", ""+top );
	
	// Update data.
	$( ".hqcountryname" ).html( countries[ d3.select( sel ).attr( "dataname" ) ] );
	var type = d3.select( sel ).attr( "datatype" );
	var dnum = d3.select( sel ).attr( "datanum" );
	$( ".hqimg" ).attr( "src", "css/images/flag_" + d3.select( sel ).attr( "dataname" ) + ".png" );
	
	if( type[0] != "E" ) {
		var dat = da["data"][d3.select( sel ).attr( "dataname" )]["data"][dnum];
		var x0 = graph["x"].invert( d3.mouse(sel)[0] );
		var i = bisectData( dat, x0 );
		var d0 = dat[i - 1];
		var d1 = dat[i];
		
		if( d0 == undefined )
			d0 = d1;
		if( d1 == undefined )
			d1 = d0;
		
		var d = x0 - d0[0] > d1[0] - x0 ? d1 : d0;
		
		$( ".hqyear" ).html( d[0] );
		if( type[1] == "M" )
			$( ".hqdata" ).html( "Male " + dataName[type[0]] + ": " + addCommas( Math.round( d[1] ) ) );
		else if( type[1] == "F" )
			$( ".hqdata" ).html( "Female " + dataName[type[0]] + ": " + addCommas( Math.round( d[1] ) ) );
		else if( type[1] == "T" )
			$( ".hqdata" ).html( "Total " + dataName[type[0]] + ": " + addCommas( Math.round( d[1] ) ) );
		else if( type[1] == "B" )
			$( ".hqdata" ).html( "Male " + dataName[type[0]] + ": " + addCommas( Math.round( d[1] ) ) + "<BR>" + "Female " + dataName[type[0]] + ": " + addCommas( Math.round( d[2] ) ) );
	}
	else {
		$( ".hqdata" ).html( "Missing data." );
		$( ".hqyear" ).html( Math.round( graph["x"].invert( d3.mouse(sel)[0] ) ) );
	}
}

// Fills the events panel with events that involve currently selected years and countries.
function fillEvents()
{
	// CHECK AGAINST YEARS AND COUNTRIES
	for( var e in events ) {
		$( "#eventlist" ).append( "<div id=\"eventselectdiv" + e + "\" class=\"controlpanelcountry\"></div>" );
		$( "#eventselectdiv" + e ).append( "<input type=\"checkbox\" id=\"eventselect_" + e + "\" name=\"eventselect\" value=\"" + e + "\"/>" );
		
		$( "#eventselectdiv" + e ).append( "<label id=\"countrylabel_" + e + "\" for=\"eventselect_" + e + "\">" + events[e][0] + "</label>" );
		$( "#eventselectdiv" + e ).append( "<div style=\"clear: both;\"></div>" );
		
		$( "#eventselectdiv" + e ).qtip( { content: { text: "THIS WILL CONTAIN INFO ON THE EVENT." }, style: { classes: "qtip-dark" }, position: { my: 'left center', at: 'right center' }, show: { delay: 0 } } )
	}
	
	// Add click events.
	$('#eventlist input:checkbox').change(
		function(){
			fillVis();
		} );
}

// Adds the selected events to the visualization.
function addSelectedEvents( curdata, maxy )
{
	var selectedEvents = $('#eventlist input:checkbox:checked').map(function() {
		return parseInt( this.value );
	}).get();
	
	for( e in selectedEvents ) {
		curdata["events"].push( { "num": selectedEvents[e],"data":[ [ events[selectedEvents[e]][1], 0, maxy ], [ events[selectedEvents[e]][2], 0, maxy ] ] } );
		addEvent( curdata["events"][curdata["events"].length-1], graph, overview );
	}
}

// Fills out all of the controls.
function fillControls()
{
	for( var c in births ) {
		$( "#countrylist" ).append( "<div id=\"countryselectdiv_" + c + "\" class=\"controlpanelcountry\" onmouseover=\"baseOnMouseOver( '" + c + "' );\" onmouseout=\"onMouseOut( '" + c + "' );\"></div>" );
		$( "#countryselectdiv_" + c ).append( "<input type=\"checkbox\" id=\"countryselect_" + c + "\" name=\"countryselect\" value=\"" + c + "\" checked />" );
		
		var cw = $( "#countryselect_" + c ).width();
		
		$( "#countryselectdiv_" + c ).append( "<label id=\"countrylabel_" + c + "\" for=\"countryselect_" + c + "\"><img id=\"countryimage_" + c + "\" height=\"" + cw + "px\" src=\"css/images/flag_" + c + ".png\" />" + countries[c] + "</label>" );
		$( "#countryselectdiv_" + c ).append( "<div id=\"countrycolor_" + c + "\" class=\"countrycolor\" style=\"float: right; width:" + cw + "px; height:" + cw + "px; background-color: " + colors[c] + "; color: " + colors[c] + ";\"></div>" );
		$( "#countryselectdiv_" + c ).append( "<div style=\"clear: both;\"></div>" );
	}
		
	fillEvents();
	
	for( var v in views ) {
		$( "#viewlist" ).append( "<div id=\"viewselectdiv" + v + "\" class=\"controlpanelcountry\"></div>" );
		$( "#viewselectdiv" + v ).append( "<input type=\"radio\" id=\"viewselect_" + v + "\" name=\"viewselect\" value=\"" + v + "\" "+ views[v][1] +" />" );
		
		$( "#viewselectdiv" + v ).append( "<label id=\"viewlabel_" + v + "\" for=\"viewselect_" + v + "\">" + views[v][0] + "</label>" );
		$( "#viewselectdiv" + v ).append( "<div style=\"clear: both;\"></div>" );
	}
	
	$( "#yearsselected" ).html( "Years [1800-2020]:" );
	$( "#slider-year" ).slider({
      range: true,
      min: 1800,
      max: 2020,
      values: [ 1800, 2020 ],
      slide: function( event, ui ) {
		$( "#yearsselected" ).html( "Years [" + ui.values[0] + "-" + ui.values[1] + "]:" );
      }
    });
	
	$( "#agesselected" ).html( "Ages [0-110+]:" );
	$( "#slider-age" ).slider({
      range: true,
      min: 0,
      max: 110,
      values: [ 0, 110 ],
      slide: function( event, ui ) {
		$( "#agesselected" ).html( ( "Ages [" + ui.values[0] + "-" + ui.values[1] + "]:" ).replace( "110", "110+" ) );
		fillVis();
      }
    });
	
	$( "#filterlist" ).append( "<div id=\"genderselectdiv" + "\" class=\"controlpanelcountry\"></div>" );
	for( var g in genders ) {
		$( "#genderselectdiv" ).append( "<input type=\"radio\" id=\"genderselect_" + genders[g][1] + "\" name=\"genderselect\" value=\"" + g + "\" "+ genders[g][2] +" />" );
		
		$( "#genderselectdiv" ).append( "<label id=\"genderlabel_" + genders[g][1] + "\" for=\"genderselect_" + genders[g][1] + "\">" + genders[g][0] + "</label>" );
		$( "#genderselectdiv" ).append( "<div style=\"clear: both;\"></div>" );
	}
	
	// Add click events.
	$('#countrylist input:checkbox').change(
		function(){
			fillVis();
		} );
		
	$('#filterlist input:radio').change(
		function(){
			fillVis();
		} );
		
	$('#viewlist input:radio').change(
		function(){
			fillVis();
		} );
		
	$('#versionlist input:radio').change(
		function(){
			hqbox = ( "#hoverquery" + $( "#versionlist input[type='radio']:checked" ).val() ).replace( "1", "" );
			fillVis();
		} );
}

function addTitleText( graph, view, selectedCountries, ages )
{
	graph["svg"].append( "text" )
		.text( "" )
		.attr( "id", "vistitle" )
		.attr( "class", "titletext" )
		.attr( "x", 10 )
		.attr( "y", 30 )
		.attr( "fill", "black" )
		.attr( "opacity", .25 )
		.attr( "font-size", "30px" )
		.attr( "font-family", titlefont );
		
	$( "#vistitle" ).html( views[ view ][0] );
	
	for( c in selectedCountries )
		graph["svg"].append( "image" )
		   .attr( "x", 10 + c * 40 )
		   .attr( "y", 32 )
		   .attr( "width", 30 )
		   .attr( "height", 30 )
		   .attr( "opacity", .25 )
		   .attr( "xlink:href", "css/images/flag_" + selectedCountries[c] + ".png" );
		
	graph["svg"].append( "text" )
		.text( "" )
		.attr( "id", "titlefilter" )
		.attr( "class", "titletext" )
		.attr( "x", 10 )
		.attr( "y", 80 )
		.attr( "fill", "black" )
		.attr( "opacity", .25 )
		.attr( "font-size", "20px" )
		.attr( "font-weight", "500" )
		.attr( "font-family", titlefont );
		
	$( "#titlefilter" ).html( "For Ages " + ages[0] + " - " + ages[1] );
}