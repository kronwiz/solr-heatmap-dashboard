
var http = require ( "http" );
var url = require ( "url" );
var path = require ( "path" );
var static = require ( "node-static" );
var querystring = require ( "querystring" );
var fs = require ( "fs" );
var yaml = require ( "js-yaml" );
// node built-in extend function
var extend = require ( "util" )._extend;

var handler_module = require ( "./handlers.js" );

var document_root = new static.Server ( "../web" );

function reload ( modname ) {
	abspath = path.resolve ( modname );
	delete require.cache [ abspath ];
	return require ( modname );
}

function call_handler ( request, response, parsed_url ) {
	// this is done not to restart the server each time an handler is modified
	handler_module = reload ( "./handlers.js" )
	/* Note: while we get the handlers we pass the configuration on to the
	   handlers' module */
	var handlers = handler_module.get_handlers ( config );

	var func = handlers [ parsed_url.pathname ];

	if ( func ) {
		try {
			func ( request, response, parsed_url );

		} catch ( err ) {
			console.log ( "ERROR: " + err.code + " - " + err.message );
		}

	} else {
		document_root.serve ( request, response, function ( err, result ) {
			if ( err ) {
				// if no file has been specified return the index from the configuration (if any)
				if ( ( parsed_url.pathname == "/" ) && ( config.server.index ) ) {
					document_root.serveFile ( config.server.index, 200, {}, request, response );

				} else {
					response.writeHead ( err.status, err.headers );
					response.write ( "Error retrieving file '" + request.url + "': " + err.message );
					response.end ();
				}
			}
		} );
	} // else
}

function handle_request ( request, response ) {
	var parsed_url = url.parse ( request.url, true );
	console.log ( "Request for " + parsed_url.pathname + " received." );

	if ( request.method == "POST" ) {
		var body = "";
		request.on ( "data", function ( data ) {
			body += data;
			// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
			if ( body.length > 1e6 ) {
				// flood attack or faulty client, nuke request
				request.connection.destroy ();
			}
		} );

		request.on ( "end", function () {
			var post_data = querystring.parse ( body );

			// merge POST data with GET data (if any)
			extend ( parsed_url.query, post_data );

			call_handler ( request, response, parsed_url );
		} );

	} else {
		call_handler ( request, response, parsed_url );
	}
}


function read_cfg () {
	try {
		config = yaml.safeLoad ( fs.readFileSync ( "./config.yaml", "utf8" ) );
		// console.log ( config );

	} catch (e) {
		console.log ( "Error while reading configuration: " + e );
	}
}


/* start */

var config = null;
read_cfg ();

console.log ( "Starting server on port " + config.server.port );

http.createServer ( handle_request ).listen ( config.server.port );

