// Adds commas to a number.
function addCommas( val ){
	while( /(\d+)(\d{3})/.test( val.toString() ) )
		val = val.toString().replace( /(\d+)(\d{3})/, '$1'+','+'$2' );
	return val;
}

// This makes the introbox and displays it.
function introBox()
{
	$( "body" ).height( $( document ).height() );
	$( "#fadebox" ).width( $( document ).width() );
	$( "#fadebox" ).height( $( document ).height() );

	var hWidth = $( document ).width() * .5;
	var hHeight = $( document ).height() * .5;

	$( "#introbox" ).width( hWidth );
	
	$( "#introbox" ).css( "left", hWidth - hWidth * .5 );
	$( "#introbox" ).css( "top", hHeight - $( "#introbox" ).height() * .5 );
	
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
		[ "#countryHelp",		"Select the countries to display data for.",			"left center",		"right center" ],
		[ "#viewHelp",			"Select which view to show.",							"left center",		"right center" ],
		[ "#filterHelp",		"Select the specific filters to apply to the data.",	"left center",		"right center" ],
		[ "#eventHelp",			"Select the events to display data for.",				"left center",		"right center" ],
		[ "#helpIcon",			"Help will popup in these tooltips!",					"bottom center",	"top center" ]
	];
	
	for( var h in helps )
		$(helps[h][0]).qtip( { content: { text: helps[h][1] }, style: { classes: "qtip-dark" }, position: { my: helps[h][2], at: helps[h][3] }, show: { delay: 0 } } )
}

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
}

// Fills out all of the controls.
function fillControls()
{
	for( var c in births ) {
		$( "#countrylist" ).append( "<div id=\"countryselectdiv_" + c + "\" class=\"controlpanelcountry\" onmouseover=\"baseOnMouseOver( '" + c + "' );\" onmouseout=\"onMouseOut( '" + c + "' );\"></div>" );
		$( "#countryselectdiv_" + c ).append( "<input type=\"checkbox\" id=\"countryselect_" + c + "\" name=\"countryselect\" value=\"" + c + "\" checked />" );
		
		var cw = $( "#countryselect_" + c ).width();
		
		$( "#countryselectdiv_" + c ).append( "<label id=\"countrylabel_" + c + "\" for=\"countryselect_" + c + "\"><img id=\"countryimage_" + c + "\" height=\"" + cw + "px\" src=\"css/images/flag_" + c + ".png\" />" + countries[c] + "</label>" );
		$( "#countryselectdiv_" + c ).append( "<div id=\"countrycolor_" + c + "\" class=\"countrycolor\" style=\"float: right; width:" + cw + "px; height:" + cw + "px; background-color: " + Colors[c] + "; color: " + Colors[c] + ";\"></div>" );
		$( "#countryselectdiv_" + c ).append( "<div style=\"clear: both;\"></div>" );
	}
		
	fillEvents();
	
	for( var v in views ) {
		$( "#viewlist" ).append( "<div id=\"viewselectdiv" + v + "\" class=\"controlpanelcountry\"></div>" );
		$( "#viewselectdiv" + v ).append( "<input type=\"radio\" id=\"viewselect_" + v + "\" name=\"viewselect\" value=\"" + v + "\" "+ views[v][1] +" />" );
		
		$( "#viewselectdiv" + v ).append( "<label id=\"viewlabel_" + v + "\" for=\"viewselect_" + v + "\">" + views[v][0] + "</label>" );
		$( "#viewselectdiv" + v ).append( "<div style=\"clear: both;\"></div>" );
	}
	
	$( "#yearsselected" ).html( "Years [1800-2010]:" );
	$( "#slider-year" ).slider({
      range: true,
      min: 1800,
      max: 2010,
      values: [ 1800, 2010 ],
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
      }
    });
	
	$( "#filterlist" ).append( "<div id=\"genderselectdiv" + "\" class=\"controlpanelcountry\"></div>" );
	for( var g in genders ) {
		$( "#genderselectdiv" ).append( "<input type=\"radio\" id=\"genderselect" + genders[g][1] + "\" name=\"genderselect\" value=\"" + genders[g][1] + "\" "+ genders[g][2] +" />" );
		
		$( "#genderselectdiv" ).append( "<label id=\"genderlabel_" + genders[g][1] + "\" for=\"genderselect_" + genders[g][1] + "\">" + genders[g][0] + "</label>" );
		$( "#genderselectdiv" ).append( "<div style=\"clear: both;\"></div>" );
	}
	
	// Add events.
	$('#countrylist input:checkbox').change(
		function(){
			fillVis();
		} );
		
	$('#viewlist input:radio').change(
		function(){
			fillVis();
		} );
}