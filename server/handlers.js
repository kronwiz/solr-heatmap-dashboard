
var url = require ( "url" );
var http = require ( "http" );

var config = null;

/*
function get_heatmap ( request, response, parsed_url ) {
	var params = parsed_url.query;
	var body = "";
	var conds = "";

	var disterrpct = params [ "disterrpct" ];
	if ( disterrpct ) conds += "facet.heatmap.distErrPct=" + disterrpct;
	var gridlevel = params [ "gridlevel" ];
	if ( gridlevel ) conds += "&facet.heatmap.gridLevel=" + gridlevel;
	var geom = params [ "geom" ];
	if ( geom ) conds += "&facet.heatmap.geom=" + geom;

	var query = "http://localhost:8983/solr/airports/select?facet.heatmap=location_rpt&facet=true&indent=on&q=*:*&wt=json&" + conds;

	http.get ( query, ( res ) => {
		res.on ( "data", ( chunk ) => {
			body += chunk;
		} );

		res.on ( "end", () => {
			response.write ( body );
			response.end ();
		} );

	} ).on ( "error", ( e ) => {
		console.log ( "ERROR: " + e.message );
	} );
}
*/

function solr_query ( request, response, parsed_url ) {
	var body = "";
	var fixed_params = "&indent=on&wt=json&facet=true&";

	var query = config.solr.base_url + fixed_params + url.parse ( request.url, false ).query;

	http.get ( query, ( res ) => {
		res.on ( "data", function ( chunk ) {
			body += chunk;
		} );

		res.on ( "end", () => {
			response.write ( body );
			response.end ();
		} );

	} ).on ( "error", function ( e ) {
		console.log ( "ERROR: " + e.message );
	} );
}


function get_handlers ( cfg ) {
	// receive configuration from caller
	config = cfg;

	return {
		// "/get_heatmap": get_heatmap,
		"/query": solr_query
	}
}


exports.get_handlers = get_handlers;


