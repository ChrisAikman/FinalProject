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
			$( "#introbox" ).html( "" ).css( "display", "none" );
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
			$( "#interactivelink" ).click( function(){ removeIntroBox(); setupImplementationWalkthrough(); } );
			$( "#interactivelink2" ).click( function(){ removeIntroBox(); setupPerceptionWalkthrough(); } );
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
		[ "#eventHelp",			"Opens a window to select the events to display data for.",									"left center",		"right center" ],
		[ "#versionHelp",		"Select the version of the vis to display. Please change these based on the survey.",		"left center",		"right center" ],
		[ "#helpIcon",			"Help will popup in these tooltips!",														"bottom center",	"top center" ],
		[ "#helpIcon2",			"Help will popup in these tooltips!",														"bottom center",	"top center" ],
		[ "#axisHelp",			"Select which x-axis to use.",																"left center",		"right center" ],
		[ "#paletteHelp",		"Change the colore palette.",																"left center",		"right center" ]
	];
	
	for( var h in helps )
		$(helps[h][0]).qtip( { content: { text: helps[h][1] }, style: { classes: "qtip-dark" }, position: { my: helps[h][2], at: helps[h][3] }, show: { delay: 0 } } )
}

// Updates the hover query when something is moused over
function updateHoverQuery( sel, da, graph )
{
	// Update position.
	var left = d3.mouse( sel )[0] + offsets["left"] + $( "#vis" ).position().left - $( hqbox ).width() / 2;
	var top = d3.mouse( sel )[1] + offsets["top"] + $( "#vis" ).position().top - $( hqbox ).height();
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
	
	var type = d3.select( sel ).attr( "datatype" );
	var dnum = d3.select( sel ).attr( "datanum" );
	
	if( type[0] == "V" ) {
		$( ".hqimg" ).css( "display", "none" );
		$( ".hqcountryname" ).html( events[da["num"]][0] );
		$( ".hqdata" ).css( "display", "none" );
		$( ".hqyear" ).css( "display", "none" );
	}
	else {
		$( ".hqcountryname" ).html( countries[ d3.select( sel ).attr( "dataname" ) ] );
		$( ".hqimg" ).css( "display", "" ).attr( "src", "css/images/flag_" + d3.select( sel ).attr( "dataname" ) + ".png" );
	
		if( type[0] == "E" ) {
			$( ".hqdata" ).css( "display", "" ).html( "Missing data." );
			$( ".hqyear" ).css( "display", "" ).html( Math.round( graph["x"].invert( d3.mouse(sel)[0] ) ) );
		}
		else {
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
		
		// Not enough time :(
		//$( "#eventselectdiv" + e ).qtip( { content: { text: "THIS WILL CONTAIN INFO ON THE EVENT." }, style: { classes: "qtip-dark" }, position: { my: 'left center', at: 'right center' }, show: { delay: 0 } } )
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
		var start = events[selectedEvents[e]][1];
		var end = events[selectedEvents[e]][2];
		
		if( start == end ) {
			start -= .5;
			end += .5;
		}
		
		curdata["events"].push( { "num": selectedEvents[e],"data":[ [ start, 0, maxy ], [ end, 0, maxy ] ] } );
		addEvent( curdata["events"][curdata["events"].length-1], graph, overview );
	}
}

// Ensure sliders don't have the same value when they are the y-axis.
function fixSliders( slider ) {
	var values = $( "#"+slider ).slider( "option", "values" );
	if( values[0] == values[1] )
		$( "#"+slider ).slider( "values", [ values[0], values[1] + 1 ] );
		
	values = $( "#"+slider ).slider( "option", "values" );
	if( values[0] == values[1] )
		$( "#"+slider ).slider( "value", $(this).val() - 1 );
}

// Fills out all of the controls.
function fillControls()
{
	for( var c in births ) {
		$( "#countrylist" ).append( "<div id=\"countryselectdiv_" + c + "\" class=\"controlpanelcountry\" onmouseover=\"baseOnMouseOver( '" + c + "' );\" onmouseout=\"onMouseOut( '" + c + "' );\"></div>" );
		$( "#countryselectdiv_" + c ).append( "<input type=\"checkbox\" id=\"countryselect_" + c + "\" name=\"countryselect\" value=\"" + c + "\" checked />" );
		
		var cw = $( "#countryselect_" + c ).width();
		
		$( "#countryselectdiv_" + c ).append( "<label id=\"countrylabel_" + c + "\" for=\"countryselect_" + c + "\"><img id=\"countryimage_" + c + "\" height=\"" + cw + "px\" src=\"css/images/flag_" + c + ".png\" />" + countries[c] + "</label>" );
		$( "#countryselectdiv_" + c ).append( "<div id=\"countrycolor_" + c + "\" class=\"countrycolor\" style=\"float: right; width:" + cw + "px; height:" + cw + "px; background-color: " + colors[colorpalette][c] + "; color: " + colors[colorpalette][c] + ";\"></div>" );
		$( "#countryselectdiv_" + c ).append( "<div style=\"clear: both;\"></div>" );
	}
	
	// Add select all or none.
	$( "#countrylist" ).append( "<div class=\"controlpanelcountry\" style=\"padding-left: 3px; padding-right: 3px;\"><div style=\"float: left;\"><a href=\"#\" onclick=\"selectAllCountries();\">Select All</a></div><div style=\"float: right;\"><a href=\"#\" onclick=\"clearAllCountries();\">Select None</a></div><div style=\"clear: both;\"></div></div>" );
		
	fillEvents();
	
	for( var v in views ) {
		$( "#viewlist" ).append( "<div id=\"viewselectdiv" + v + "\" class=\"controlpanelcountry\"></div>" );
		$( "#viewselectdiv" + v ).append( "<input type=\"radio\" id=\"viewselect_" + v + "\" name=\"viewselect\" value=\"" + v + "\" "+ views[v][1] +" />" );
		
		$( "#viewselectdiv" + v ).append( "<label id=\"viewlabel_" + v + "\" for=\"viewselect_" + v + "\">" + views[v][0] + "</label>" );
		$( "#viewselectdiv" + v ).append( "<div style=\"clear: both;\"></div>" );
	}
	
	$( "#yearsselected" ).html( "Years ["+years[0]+"-"+years[1]+"]:" );
	$( "#slider-year" ).slider({
		range: true,
		min: years[0],
		max: years[1],
		values: years,
		slide: function( event, ui ) {
			if( $( "#axislist input[type='radio']:checked" ).val() == AXIS_YEAR )
				fixSliders( "slider-year" );

			$( "#yearsselected" ).html( "Years [" + ui.values[0] + "-" + ui.values[1] + "]:" );

			years = ui.values;
			fillVis();
		}
    });
	
	$( "#agesselected" ).html( "Ages [0-110+]:" );
	$( "#slider-age" ).slider({
      range: true,
      min: 0,
      max: 110,
      values: [ 0, 110 ],
      slide: function( event, ui ) {
		if( $( "#axislist input[type='radio']:checked" ).val() == AXIS_AGE )
			fixSliders( "slider-age" );
	  
		$( "#agesselected" ).html( ( "Ages [" + ui.values[0] + "-" + ui.values[1] + "]:" ).replace( "110", "110+" ) );
		ages = ui.values;
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
		
	$('#palettelist input:radio').change(
		function(){
			colorpalette = $( "#palettelist input[type='radio']:checked" ).val()
			
			if( colorpalette == "colorblind" )
				datanormal = .7;
			else
				datanormal = .5;
			
			fillVis();
		} );
		
	$('#axislist input:radio').change(
		function(){
			var axisval = $( "#axislist input[type='radio']:checked" ).val();
			if( axisval == AXIS_AGE ) {
				var viewval = $( "#viewlist input[type='radio']:checked" ).val();
				
				if( viewval == VIEW_BIRTHS || viewval == VIEW_BANDD )
					$( "#viewselect_" + VIEW_DEATHS ).prop( "checked", true );
			
				$( "#viewselectdiv" + VIEW_BIRTHS ).css( "display", "none" );
				$( "#viewselectdiv" + VIEW_BANDD ).css( "display", "none" );
			}
			else {
				$( "#viewselectdiv" + VIEW_BIRTHS ).css( "display", "" );
				$( "#viewselectdiv" + VIEW_BANDD ).css( "display", "" );
			}
				
			fillVis();
		} );
		
		$( "#eventlist" ).dialog( {autoOpen: false} );
}

function addTitleText( graph, view, selectedCountries, ages )
{
	var separationHeight = ( $( "#vis" ).height() - offsets["top"] - offsets["top"] - 16 ) / 20;
	graph["svg"].append( "text" )
		.text( "" )
		.attr( "id", "vistitle" )
		.attr( "class", "titletext" )
		.attr( "x", 10 )
		.attr( "y", separationHeight - 1 )
		.attr( "fill", "black" )
		.attr( "opacity", .25 )
		.attr( "font-size", separationHeight+"px" )
		.attr( "font-family", titlefont );
	
	for( c in selectedCountries )
		graph["svg"].append( "image" )
		   .attr( "x", 10 + c * ( separationHeight * .8 + 10 ) )
		   .attr( "y", separationHeight + separationHeight * .2 )
		   .attr( "width", separationHeight * .8 )
		   .attr( "height", separationHeight * .8 )
		   .attr( "opacity", .25 )
		   .attr( "xlink:href", "css/images/flag_" + selectedCountries[c] + ".png" );
		
	graph["svg"].append( "text" )
		.text( "" )
		.attr( "id", "titlefilter" )
		.attr( "class", "titletext" )
		.attr( "x", 10 )
		.attr( "y", separationHeight * 3 )
		.attr( "fill", "black" )
		.attr( "opacity", .25 )
		.attr( "font-size", separationHeight-1+"px" )
		.attr( "font-family", titlefont );
		
	// Not enough time! :(
	/*graph["svg"].append( "text" )
		.text( "__ is missing data for this year range" )
		.attr( "id", "titleerror" )
		.attr( "class", "titletext" )
		.attr( "x", 10 )
		.attr( "y", separationHeight * 4 )
		.attr( "fill", "red" )
		.attr( "opacity", .25 )
		.attr( "font-size", separationHeight-1+"px" )
		.attr( "font-family", titlefont );*/
		
	if( $( "#axislist input[type='radio']:checked" ).val() == AXIS_YEAR ) {
		$( "#vistitle" ).html( views[ view ][0] );
		$( "#titlefilter" ).html( ( "For Ages " + ages[0] + " - " + ages[1] ).replace( "110", "110+" ) );
	}
	else {
		$( "#vistitle" ).html( "Average " + views[ view ][0] );
		$( "#titlefilter" ).html( ( "For Years " + years[0] + " - " + years[1] ) );
	}
}

function selectAllCountries()
{
	$('#countrylist input:checkbox').prop( "checked", true );
	fillVis();
}

function clearAllCountries()
{
	$('#countrylist input:checkbox').prop( "checked", false );
	fillVis();
}

function showEventsList()
{
	$( "#eventlist" ).dialog( "open" );
}

//var highlightIsActive = false;
var $highlightedElement = $();

// HIGHLIGHT HELPERS
function activateHighlight( $element ) {
	$highlightedElement = $element;
	//highlightIsActive = true;
	$highlightedElement.addClass( "highlight" );
}

function deactivateHighlight() {
	$highlightedElement.removeClass( "highlight" );
	$highlightedElement = $();
	//highlightIsActive = false;
}

function closeWalkthrough()
{
	$( "#featurebox" ).css( "display", "none" );
	$( "#featurenext" ).css( "display", "none" );
}

function setupPerceptionWalkthrough()
{
	$( "#walkthroughnext" ).click( function(){ interactivePerceptionWalkthrough(); } );
	interactivePerceptionWalkthrough();
}

function setupImplementationWalkthrough()
{
	$( "#walkthroughnext" ).click( function(){ interactiveImplementationWalkthrough(); } );
	interactiveImplementationWalkthrough();
}

var walkon = 0;
function interactivePerceptionWalkthrough()
{
	$( "#featurebox" ).css( "display", "" );
	$( "#featurenext" ).css( "display", "" ).css( "left", $( document ).width() - $( "#featurenext" ).width() - 30 ).css( "top", $( document ).height() - $( "#featurenext" ).height() - 30 );
	deactivateHighlight();
	
	if( walkon == 0 ) {
		activateHighlight( $( "#countrypanel" ) );
		$( "#featurebox" ).html( "Color Theory" );
	}
	
	if( walkon == 1 ) {
		activateHighlight( $( "#vis" ) );
		$( "#featurebox" ).html( "Color Theory" );
	}
	
	if( walkon == 2 ) {
		activateHighlight( $( "#controlpanel" ) );
		$( "#featurebox" ).html( "Color Theory" );
	}
	
	if( walkon == 3 ) {
		//activateHighlight( $( "body" ) );
		$( "#featurebox" ).html( "Gestalt's Principles - Enclosure" );
	}
	
	if( walkon == 4 ) {
		activateHighlight( $( "#controlpanel" ) );
		$( "#featurebox" ).html( "Gestalt's Principles - Enclosure" );
	}
	
	if( walkon == 5 ) {
		activateHighlight( $( "#vis" ) );
		$( "#featurebox" ).html( "Gestalt's Principles - Enclosure" );
	}
	
	if( walkon == 6 ) {
		activateHighlight( $( "#overview" ) );
		$( "#featurebox" ).html( "Gestalt's Principles - Enclosure" );
	}
	
	if( walkon == 7 ) {
		//activateHighlight( $( "body" ) );
		$( "#featurebox" ).html( "Maximum Space Utilization" );
	}
	
	if( walkon == 8 ) {
		activateHighlight( $( "#controlpanel" ) );
		$( "#featurebox" ).html( "The Need for Hover Queries" );
	}
	
	if( walkon == 9 ) {
		activateHighlight( $( "#vis" ) );
		$( "#featurebox" ).html( "Hover Queries" );
	}
	
	if( walkon == 10 ) {
		activateHighlight( $( "#center-root" ) );
		$( "#featurebox" ).html( "Focus and Context" );
	}
	
	if( walkon == 11 ) {
		activateHighlight( $( "#vis" ) );
		$( "#featurebox" ).html( "Focus..." );
	}
	
	if( walkon == 12 ) {
		activateHighlight( $( "#overview" ) );
		$( "#featurebox" ).html( "...and Context" );
	}
	
	if( walkon == 13 ) {
		//activateHighlight( $( "body" ) );
		$( "#featurebox" ).html( "Three Areas of Highlighting" );
	}
	
	if( walkon == 14 ) {
		//activateHighlight( $( "body" ) );
		$( "#featurebox" ).html( "Highlighting - Control Panel" );
	}
	
	if( walkon == 15 ) {
		activateHighlight( $( "#vis" ) );
		$( "#featurebox" ).html( "Highlighting - Context" );
	}
	
	if( walkon == 16 ) {
		activateHighlight( $( "#overview" ) );
		$( "#featurebox" ).html( "Highlighting - Overview" );
		
		$( "#walkthroughnext" ).html( "DONE" );
		$( "#walkthroughnext" ).click( function(){ closeWalkthrough(); } );
	}
	
	walkon++;
}

function interactiveImplementationWalkthrough()
{
	$( "#featurebox" ).css( "display", "" );
	$( "#featurenext" ).css( "display", "" ).css( "left", $( document ).width() - $( "#featurenext" ).width() - 30 ).css( "top", $( document ).height() - $( "#featurenext" ).height() - 30 );
	deactivateHighlight();
	
	if( walkon == 0 ) {
		//activateHighlight( $( "body" ) );
		$( "#featurebox" ).html( "Implementation Overview" );
	}
	
	if( walkon == 1 ) {
		activateHighlight( $( "#controlpanel" ) );
		$( "#featurebox" ).html( "Control Panel" );
	}
	
	if( walkon == 2 ) {
		activateHighlight( $( "#countrypanel" ) );
		$( "#featurebox" ).html( "Country List" );
	}
	
	if( walkon == 3 ) {
		//activateHighlight( $( "body" ) );
		$( "#featurebox" ).html( "Country List Demo" );
	}
	
	if( walkon == 4 ) {
		activateHighlight( $( "#viewpanel" ) );
		$( "#featurebox" ).html( "View List" );
	}
	
	if( walkon == 5 ) {
		$( "#featurebox" ).html( "View List Demo" );
	}
	
	if( walkon == 6 ) {
		activateHighlight( $( "#filterspanel" ) );
		$( "#featurebox" ).html( "Filters List" );
	}
	
	if( walkon == 7 ) {
		activateHighlight( $( "#yearfilterdiv" ) );
		$( "#featurebox" ).html( "Year Filter" );
	}
	
	if( walkon == 8 ) {
		$( "#featurebox" ).html( "Year Filter Demo" );
	}
	
	if( walkon == 9 ) {
		activateHighlight( $( "#agefilterdiv" ) );
		$( "#featurebox" ).html( "Age Filter" );
	}
	
	if( walkon == 10 ) {
		$( "#featurebox" ).html( "Age Filter Demo" );
	}
	
	if( walkon == 11 ) {
		activateHighlight( $( "#genderselectdiv" ) );
		$( "#featurebox" ).html( "Gender Filter" );
	}
	
	if( walkon == 12 ) {
		$( "#featurebox" ).html( "Gender Filter Demo" );
	}
	
	if( walkon == 13 ) {
		activateHighlight( $( "#eventpanel" ) );
		$( "#featurebox" ).html( "Events Filter" );
	}
	
	if( walkon == 14 ) {
		$( "#featurebox" ).html( "Event Filter Demo" );
	}
	
	if( walkon == 15 ) {
		activateHighlight( $( "#overview" ) );
		$( "#featurebox" ).html( "Overview" );
	}
	
	if( walkon == 16 ) {
		$( "#featurebox" ).html( "Overview Demo" );
		
		$( "#walkthroughnext" ).html( "DONE" );
		$( "#walkthroughnext" ).click( function(){ closeWalkthrough(); } );
	}
	
	walkon++;
}