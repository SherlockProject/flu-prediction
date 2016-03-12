
	// Get Started

	var
		username	= 'c46dc820-3d2a-4b8e-9a4b-839619a7afc0-bluemix',
		password	= 'b736bccac549c7ed64d4d681abb5ef5b8d9bde2673db535d33e9c0e0f12e376c',
		host		= 'c46dc820-3d2a-4b8e-9a4b-839619a7afc0-bluemix.cloudant.com',
		port		= '443',
		dburl		= 'https://' + username + ':' + password + '@' + host + ':' + port,

		bodyParser	= require( 'body-parser' ),

		// Database Connection
		nano		= require( 'nano' )( { 'url': dburl } ),
		tw			= nano.db.use( 'flutweets_3' ),
		db			= nano.db.use( 'flu_data' ),

		express		= require( 'express' ),
		moment		= require( 'moment' ),
		cfenv		= require( 'cfenv' ),

		app			= express(),
		appEnv		= cfenv.getAppEnv();


	// Configuration

	app.use( function( req, res, next ) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		next();
	} );

	app.use( express.static( __dirname + '/public' ) );

	app.use( bodyParser.urlencoded( { extended: false } ) );
	app.use( bodyParser.json() );


	// Request/Response

	function getMap( response, year, week ) {
		if( !week ) {
			var
				result	= year,
				year	= result.max.date[0],
				week	= result.max.week;
		}

		db.view( 'frontend', 'map', { 'key': [ year, week ] },
			function ( err, body ) {
				if( err )
					return res.send( 'Error' );

				var output = {};

				for( var i = 0, r = body.rows, l = r.length; i < l; i++ )
					output[ r[i].value[0] ] = [ r[i].value[1], r[i].value[2] ];

				if( result ) {
					result.map = output;
					response.send( result );
				}
				else
					response.send( output );
			}
		);
	};

	app.get( '/time-range', function ( req, res ) {

		db.view( 'frontend', 'time-range',
			function ( err, body ) {
				if( err )
					return res.send( 'Error' );

				var
					result = body.rows[0].value,
					d1 = new Date( result.max[0] ),
					d2 = new Date( result.min[0] );

				db.view( 'frontend', 'weeks', { group: true },
					function ( err, body ) {
						if( err )
							return res.send( 'Error' );

						for( var i = 0, y, m, w, ret = {}, r = body.rows, l = r.length; i < l; i++ ) {
							y = r[i].key[0];
							m = r[i].key[1];

							!ret[y] && ( ret[y] = {} );
							!ret[y][m] ? (ret[y][m] = 1) : ret[y][m]++;
						}

						res.send( { // getMap( res
							'max': {
								'date': [result.max[1][0],d1.getMonth()+1,d1.getDate()],
								'week': result.max[1][1]
							},
							'min': {
								'date': [result.min[1][0],d2.getMonth()+1,d2.getDate()],
								'week': result.min[1][1]
							},
							'timeline': ret
						} );
					}
				);
			}
		);

	} );

	app.post( '/map', function ( req, res ) {
		getMap( res, req.body.year * 1, req.body.week * 1 );
	} );

	app.get( '/details', function ( req, res ) {

		db.view( 'frontend', 'details', {
				'startkey': [ req.query.s, 0, 0 ],
				'endkey': [ req.query.s, 3000, 0 ]
			},

			function ( err, body ) {
				if( err )
					return res.send( 'Error' );

				var
					r = body.rows,
					levels = [],
					points = {};

				for( var i = 0, l = r.length; i < l; i++ ) {
					levels.push( r[i].value[0] );
					points[ r[i].key.slice(1).join('/') ] = r[i].value.slice(1);
				}

				result = {
					levels: levels,
					points: points
				};

				res.send( result );
			}
		);

	} );

	app.get( '/tweets', function ( req, res ) {
		var
			year	= req.query.year * 1,
			week	= req.query.week * 1,
			dStart	= moment( [ year ] ).week( week ),
			dEnd	= moment( dStart ).add( 1, 'w' );

		tw.view( 'tweets', 'by-date', {
				'startkey': [dStart.get('year'),dStart.get('month')+1,dStart.get('date')],
				'endkey': [dEnd.get('year'),dEnd.get('month')+1,dEnd.get('date')]
			},

			function ( err, body ) {
				var
					r		= body.rows,
					l		= r.length,
					i		= 0,
					list	= [];

				for( ; i < l; i++ )
					list.push( r[i].value.reverse() );

				res.send( list );
			}
		);
	} );

	app.listen( appEnv.port, '0.0.0.0', function() {
		console.log( "server starting on " + appEnv.url );
	} );

/*
	cd flu-prediction/
	cd ../
	cf push "flu-prediction" -p "flu-prediction" -m 512M -n "flu-prediction"
*/