
var url = require ( "url" );
var http = require ( "http" );

var config = null;


function solr_query ( request, response, parsed_url ) {
	var body = "";
	var fixed_params = "?indent=on&wt=json&";

	var query = config.solr.base_url + fixed_params + url.parse ( request.url, false ).query;

	http.get ( query, function ( res ) {
		res.on ( "data", function ( chunk ) {
			body += chunk;
		} );

		res.on ( "end", function () {
			response.write ( body );
			response.end ();
		} );

	} ).on ( "error", function ( e ) {
		console.log ( "ERROR: " + e.message );
	} );
}


function get_recursive_name ( obj, parts ) {
	var next = obj [ parts [ 0 ] ];
	if ( ! next ) return undefined;
	if ( parts.length > 1 )
		return get_recursive_name ( next, parts.slice ( 1 ) );
	else
		return next;
}


function get_config ( request, response, parsed_url ) {
	var params = parsed_url.query;
	var value = undefined;

	if ( params [ "name" ] )
		value = get_recursive_name ( config, params [ "name" ].split ( "." ) );

	response.write ( '{ "name": "' + params [ "name" ] + '", "value": "' + value + '" }' );
	response.end ();
}


function get_handlers ( cfg ) {
	// receive configuration from caller
	config = cfg;

	return {
		"/query": solr_query,
		"/get-config": get_config
	}
}


exports.get_handlers = get_handlers;


