
	String.prototype.is_string = true;
	Array.prototype.is_array = true;

	Array.max = function( array ){ return Math.max.apply( Math, array ); };
	Array.min = function( array ){ return Math.min.apply( Math, array ); };

	document.get = function ( ID ) { return document.getElementById( ID ); };
	document.getTags = function ( TAG, PARENT ) {
		if( PARENT.is_string )
			PARENT = document.getElementById( PARENT );

		if( !PARENT )
			PARENT = document;

		return PARENT.getElementsByTagName( TAG.toLowerCase() );
	};
	document.getChildTags = function ( TAG, PARENT ) {
		var
			l = PARENT.children.length,
			list = [],
			i = 0;

		for( ; i < l; i++ ) {
			if( PARENT.children[i].tagName.toLowerCase() == TAG.toLowerCase() )
				list.push( PARENT.children[i] );
		}

		return list;
	};

	window.animate = (function () {
		var
			self = this,

			run = function () {
				TWEEN.update() ? requestAnimationFrame(run) : self.running = false;
			};

		this.running = false;

		return function () {
			for( var i = 0, l = arguments.length; i < l; i++ ) {
				if( arguments[i].stop ) {
					arguments[i].stop();
					arguments[i].reverse();
				}

				arguments[i].start();
			}

			if( !self.running ) {
				self.running = true;
				run();
			}
		};
	})();

	window.vp = (function() {
		var obj = window, prop = 'inner';

		if( !( 'innerWidth' in window ) ) {
			prop = 'client';
			obj = document.documentElement || document.body;
		}

		return {
			'height': function () {
				return obj[ prop + 'Height' ];
			},
			'width': function () {
				return obj[ prop + 'Width' ];
			}
		};
	})();

	function preventDefault( e ) {
		if( e.preventDefault )
			e.preventDefault();

		e.returnValue = false;
	};

	function getcss3prop( cssprop ){
		var
			vendors = [ '', '-moz-', '-webkit-', '-o-', '-ms-', '-khtml-' ],
			root = document.documentElement,
			l = vendors.length,
			i = 0,
			prop,

			camelCase = function ( str ) {
				return str.replace( /\-([a-z])/gi, function ( match, p1 ) {
					return p1.toUpperCase();
				} );
			};

		for( ; i < l; i++ ) {
			prop = camelCase( vendors[i] + cssprop );

			if( prop.substr( 0, 2 ) == 'Ms' )
				prop = 'm' + prop.substr( 1 );

			if( prop in root.style )
				return prop;

			return 'cssprop';
		}
	}

	var transform = (function () {
		var prop = getcss3prop( 'transform' );

		return function ( o, value ) {
			o.style[prop] = value;
		};
	})();

	// RequestAnimationFrame Polyfill
	(function() {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
									   || window[vendors[x]+'CancelRequestAnimationFrame'];
		}
	 
		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
				  timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
	 
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
	}());

	function loadConfig( callback ) {
		if( sessionStorage.getItem( 'time-range' ) !== null )
			return callback();

		var Request = Ajax.GET( 'http://www.flu-prediction.com/time-range', {
			'onload': function ( response ) {
				if( response.text !== 'Error' )
					sessionStorage.setItem( 'time-range', response.text );
				else
					throw 'Error: could not extract time-range from database';

				callback();
			}
		} );
	};

	function getTimeRange() {
		var range = JSON.parse( sessionStorage.getItem( 'time-range' ) );

		getTimeRange = function () { return range; };

		return range;
	};

	// M = [1:12]
	function weeksInMonth( Y, M ) {
		return Math.floor( ( new Date(Y,M,0).getDate() + ( new Date(Y,M-1,1).getDay() + 6 ) % 7 ) / 7 );
	};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function loadMap() {
		var
			map = L.map( 'map', {
				zoom: window.vp.width() > 1600 ? 5 : 4,
				center: [37.959409,-96.635742],
				zoomControl: false,
				minZoom: 2,
				maxZoom: 8
			} ),

			mapboxToken	= 'pk.eyJ1Ijoic2FuZGgiLCJhIjoiY2lsY3A1ZmZzMDA3ZHc5bTJ1bDM4ZjQ0MSJ9.Y6mZyvwwegXg-sL43dmDVg',
			mapboxURL	= 'https://api.mapbox.com/styles/v1/sandh/cilcp7iv5006xcbm113ga9a0d/tiles/{z}/{x}/{y}' +
						  '?access_token=pk.eyJ1Ijoic2FuZGgiLCJhIjoiY2lsY3A1ZmZzMDA3ZHc5bTJ1bDM4ZjQ0MSJ9.Y6mZ' +
						  'yvwwegXg-sL43dmDVg',

			blocksCont	= document.get( 'blocks-container' ),
			statsParent	= document.get( 'stats-parent' ),
			zoomCtrl	= document.get( 'zoom-control' ),
			labels		= document.get( 'level-labels' ),
			scaleTitle	= document.get( 'scale-title' ),
			back		= document.get( 'back-to-map' ),
			statePop	= document.get( 'population' ),
			stateImg	= document.get( 'state-img' ),
			indicator	= document.get( 'indicator' ),
			zoomOut		= document.get( 'zoom-out' ),
			indiIn		= document.get( 'indi-in' ),
			zoomIn		= document.get( 'zoom-in' ),
			twitter		= document.get( 'twitter' ),
			stateName	= document.get( 'st-name' ),
			blocks		= document.get( 'blocks' ),
			sImg		= document.get( 's-img' ),
			view		= document.get( 'view' ),
			cdc			= document.get( 'cdc' ),
			m			= document.get( 'map' ),

			range		= getTimeRange(),

			options = {
				fillColor: '#F52C3E', // F52C3E
				color: '#ffffff',
				fillOpacity: .1,
				dashArray: '',
				opacity: 1,
				weight: 1
			},

			details = function ( e ) {
				if( e.target.mode !== 'map' )
					return;

				if( flags.active == 'map' ) {
					flags.active = 'details';

					changeTextContent( stateName, e.target.state );
					changeTextContent( statePop, formatNum( population[e.target.state] * e.target.percent / 100 ) );

					stateImg.src = 'images/states/' + e.target.state + '.png';
					back.style.visibility = 'visible';
					back.style.pointerEvents = 'all';
					zoomCtrl.style.display = 'none';
					m.style.pointerEvents = 'none';
					view.style.display = 'none';
					stateImg.style.opacity = 1;
					sImg.style.width = '101px';
					indicator.className = '';
					m.style.opacity = 0;

					pole.toggle();

					flags.stateActive = e.target.state;

					Ajax.GET( 'http://www.flu-prediction.com/details?s=' + e.target.state, {
						'onload': function ( response ) {
							var
								res = JSON.parse( response.text ),
								bar, i, l = res.levels.length;

							blocks.innerHTML = '';

							bar = document.createElement( 'div' );
							bar.style.width = 51 * 30 + 'px';
							bar.className = 'spacer';

							blocks.appendChild( bar );

							for( i = 0; i < l; i++ ) {
								bar = document.createElement( 'div' );
								bar.className = 'bar v' + res.levels[i];
								blocks.appendChild( bar );
							}

							indicator.style.pointerEvents = 'none';
							statsParent.style.display = 'block';
							blocks.style.display = 'block';
							indiIn.style.opacity = 0;

							flags.points = res.points;
							updateDetails( flags.lastKey );

							setTimeout( function () {
								transform( blocks, 'translateY(0)' );
								labels.style.lineHeight = '30px';
								indicator.style.height = '300px';
								labels.style.height = '300px';
								indicator.style.opacity = 0;
							}, 200 );
						}
					} );
				}
			},

			mapView = function ( type ) {
				var title = { 'cdc': 'Flu Level', 'twitter': 'Activity' };

				return function ( e ) {
					preventDefault( e );

					if( view.className == type )
						return;

					scaleTitle.innerHTML = title[type];
					view.className = type;

					switch( type ) {
						case 'twitter':
							for( var i in states ) {
								states[i].setStyle( {
									'fillOpacity': 1
								} );
								states[i].stateStyle.fillColor = '#eeeeee';
								states[i].stateStyle.colorHover = '#ffffff';
								states[i].stateStyle.weightHover = 2;
								states[i].mode = 'twitter';
							}

							indicator.className = indicator.className + ' tw';
							flags.active = 'twitter';
						break;

						case 'cdc':
							flags.nofade = true;

							for( var i in states ) {
								states[i].stateStyle.fillColor = '#F52C3E';
								states[i].stateStyle.colorHover = '#901A24';
								states[i].stateStyle.weightHover = 1;
								states[i].mode = 'map';

								states[i].setStyle( {
									'fillColor': states[i].stateStyle.fillColor,
									'fillOpacity': .1
								} );
							}

							indicator.className = indicator.className.replace( ' tw', '' );
							flags.active = 'map';
						break;
					}

					updateMap( Math.round( ( blocksCont.scrollLeft + blocksCont.offsetWidth / 2 - flags.offset ) / 30 ) );
				};
			},

			states = {},
			state;

		back.onclick = function ( e ) {
			preventDefault( e );

			if( flags.active == 'details' ) {
				flags.active = 'map';

				indicator.style.pointerEvents = 'all';
				statsParent.style.display = 'none';
				back.style.pointerEvents = 'none';
				indicator.style.height = '200px';
				zoomCtrl.style.display = 'block';
				back.style.visibility = 'hidden';
				labels.style.lineHeight = '20px';
				labels.style.height = '200px';
				m.style.pointerEvents = 'all';
				view.style.display = 'block';
				indicator.style.opacity = 1;
				stateImg.style.opacity = 0;
				sImg.style.width = '0px';
				indiIn.style.opacity = 1;
				m.style.opacity = 1;

				transform( blocks, 'translateY(100%)' );
				flags.points = null;

				setTimeout( function () {
					blocks.style.display = 'none';
				}, 700 );

				changeTextContent( stateName, 'USA' );

				updateMap( Math.round( ( blocksCont.scrollLeft + blocksCont.offsetWidth / 2 - flags.offset ) / 30 ) );

				pole.toggle();
			}
		}

		// Global variables
		window.states	= states;
		window.map		= map;

		// SouthWest, NorthEast
		map.setMaxBounds( [[-5.120779,-190.706553 ],[65.383625,-6.979601]] );

		twitter.onclick	= mapView( 'twitter' );
		cdc.onclick		= mapView( 'cdc' );

		zoomOut.onclick	= function () { map.zoomOut(); };
		zoomIn.onclick	= function () { map.zoomIn(); };

		map.doubleClickZoom.disable();
		map.scrollWheelZoom.disable();
		map.keyboard.disable();

		// Draw Layers
		for( state in stateData ) {
			states[state] = L[stateData[state].type]( stateData[state].coordinates ).addTo( map );
			states[state].setStyle( options );

			states[state].mode = 'map';

			states[state].stateStyle = {
				'fillColor': '#F52C3E', // red
				'colorHover': '#901A24', // dark red
				'color': '#ffffff',
				'weightHover': 1,
				'weight': 1
			};
		}

		// Initialize Layers
		for( state in states ) {
			if( !states.hasOwnProperty( state ) )
				continue;

			states[state].state = state;

			states[state].on( 'mouseover', function ( e ) {
				var
					state	= e.target,
					styles	= state.stateStyle;

				if( state.mode == 'map' )
					indicator.className = 'indi-' + e.target.lvl;

				state.setStyle( { weight: styles.weightHover, color: styles.colorHover } );

				changeTextContent( stateName, state.state );
				if( flags.unkPop ) {
					changeTextContent( statePop, 'Unknown' );
				}
				else {
					changeTextContent( statePop, formatNum( population[state.state] * state.percent / 100 ) );
				}

				if( !L.Browser.ie && !L.Browser.opera )
					state.bringToFront();
			} );

			states[state].on( 'mouseout', function ( e ) {
				var
					state	= e.target,
					styles	= state.stateStyle;

				state.setStyle( { weight: styles.weight, color: styles.color } );

				if( state.mode == 'map' )
					indicator.className = '';

				if( flags.active == 'map' ) {
					changeTextContent( stateName, 'USA' );
					changeTextContent( statePop, population['USA'] );
				}
			} );

			states[state].on( 'click', details );
		}
	};

	function Pole( callback, size ) {
		var
			container	= document.get( 'blocks-container' ),
			cvs			= document.get( 'line-canvas' ),
			datePoint	= document.get( 'date-point' ),
			dateMonth	= document.get( 'date-month' ),
			dateDay		= document.get( 'date-day' ),
			canvas		= cvs.getContext( '2d' ),
			dragging	= false,
			target		= 0,
			dif			= 0,
			difbuf		= 0,
			offsetLeft,
			interval,
			xinit,

			poleTypes = {
				big: {
					dismin: -0.300796813 * 502,
					displus: 0.300796813 * 502,
					origin: [ 251, 542 ],
					size: [ 502, 542 ],
					dataPointSize: 55,
					breakPoint: 242,
					pointMarginLeft: -55,
					pointSize: 110,
					point: 432, // Point.style.Bottom
					dateDay: '100px',
					dateDayFont: '57px',
					dateMarginTop: '5px',
					dateMarginRight: '0px',
					dateMarginBottom: '2px',
					monthFont: '16px',
					dateWeight: 200,
					rotate: 40
				},

				small: {
					dismin: -0.300796813 * 100,
					displus: 0.300796813 * 100,
					origin: [ 50, 154 ],
					size: [ 100, 154 ],
					dataPointSize: 20,
					breakPoint: 120,
					pointSize: 90,
					pointMarginLeft: -45,
					point: 53, // Point.style.Bottom
					dateDay: '90px',
					dateDayFont: '48px',
					dateMarginTop: '3px',
					dateMarginBottom: '0px',
					dateMarginRight: '0px',
					monthFont: '14px',
					dateWeight: 200,
					rotate: 10
				}
			},

			config = poleTypes.small,

			draw = function ( x, y ) {
				canvas.clearRect( 0, 0, config.size[0], config.size[1] );

				canvas.beginPath();
				canvas.moveTo( config.origin[0] + 0.5, config.origin[1] + 0.5 );
				canvas.quadraticCurveTo( config.origin[0], config.breakPoint, config.origin[0] + x, y + config.dataPointSize );
				canvas.stroke();
			},

			mousemove = function ( e ) {
				var e = e || window.event;

				target = offsetLeft + ( xinit - (e.pageX ? e.pageX : e.clientX) ) * 2;

				if( target < 0 )
					target = 0;
			},

			endDrag = function ( e ) {
				container.style.cursor = "url( 'http://borsp.com/sandh/fp/images/grab.cur' ), auto";
				document.onmousemove	= null;
				document.onmouseup		= null;
				dragging				= false;

				if( target + container.offsetWidth > container.scrollWidth )
					target = container.scrollWidth - container.offsetWidth;

				target = Math.round( target / 30 ) * 30; // SNAP!

				callback( Math.round( ( target + container.offsetWidth / 2 - flags.offset ) / 30 ) );
			},

			updatePosition = function ( e ) {
				var
					e = e || window.event,
					rest = target - dif,
					dif2 = -0.3 * rest;

				dif = 0.15 * rest + dif;
				container.scrollLeft = dif;

				if( config.current == 'big' ) {
					var min=config.dismin>difbuf-10?config.dismin:difbuf-10,
					max=-config.dismin<difbuf+10?-config.dismin:difbuf+10;
					dif2<min&&(dif2=min);
					dif2>max&&(dif2=max);

					difbuf = Math.round( dif2 );
					dif2y = Math.round( 0.0016 * dif2 * dif2 );

					transform( datePoint, 'translate( ' + difbuf + 'px, ' + dif2y + 'px ) rotate(' + Math.round( difbuf * config.rotate / config.displus ) + 'deg)' );

					draw( difbuf, dif2y );
				}

				if( !dragging && Math.abs( dif - target ) < 0.1 ) {
					transform( datePoint, 'translate(0,0) rotate(0deg)' );
					container.scrollLeft = target;
				}
				else
					interval = requestAnimationFrame( updatePosition );
			},

			startDrag = function ( e ) {
				var e = e || event;

				interval && cancelAnimationFrame( interval );
				preventDefault( e );

				container.style.cursor	= "url( 'http://borsp.com/sandh/fp/images/grabbing.cur' ), auto";
				xinit		= e.pageX ? e.pageX : e.clientX;
				offsetLeft	= container.scrollLeft;
				dif			= container.scrollLeft;
				dragging	= true;

				document.onmousemove = mousemove;
				document.onmouseup = endDrag;

				interval = requestAnimationFrame( updatePosition );
			},

			API = {
				'create': function () {
					draw( 0, 0 );
					container.onmousedown = startDrag;

					return API;
				},

				'setSize': function ( size, flag ) {
					size = size == 'big' ? 'big' : 'small';

					if( size == 'small' )
						transform( datePoint, 'translate(0,0) rotate(0deg)' );

					config = poleTypes[ size ];
					config.current = size;

					cvs.height = config.size[1];
					cvs.width = config.size[0];

					canvas.strokeStyle = '#F52C3E';
					canvas.lineWidth = 1;

					cvs.style.height = config.size[1] + 'px';
					cvs.style.width = config.size[0] + 'px';
					cvs.style.marginLeft = -config.origin[0] + 'px';
					datePoint.style.bottom = config.point + 'px';
					datePoint.style.height = config.pointSize + 'px';
					datePoint.style.width = config.pointSize + 'px';
					datePoint.style.marginLeft = config.pointMarginLeft + 'px';
					dateDay.style.marginBottom = config.dateMarginBottom;
					dateDay.style.marginRight = config.dateMarginRight;
					dateDay.style.marginTop = config.dateMarginTop;
					dateDay.style.fontSize = config.dateDayFont;
					dateDay.style.width = config.dateDay;
					dateMonth.style.fontSize = config.monthFont;

					if( size == 'small' ) {
						setTimeout( function () {
							dateDay.style.fontWeight = config.dateWeight;
						}, 550 );
					}
					else
						dateDay.style.fontWeight = config.dateWeight;

					draw( 0, 0 );

					return API;
				},

				'toggle': function () {
					API.setSize( {'big':'','small':'big'}[ config.current ] );
				}
			};

		updateMap = callback;

		// Default
		config.current = config.small;

		container.scrollLeft = ( flags.nowWeek - Math.round( ( container.offsetWidth / 2 - flags.offset ) / 30 ) ) * 30;
		dif = container.scrollLeft;
		target = container.scrollLeft;

		callback( flags.nowWeek );

		if( typeof size !== 'undefined' )
			return API.setSize( size );

		return API;
	};

	function TimeLine() {
		var
			months = [ null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],

			container	= document.get( 'blocks-container' ),
			t			= document.get( 'timeline' ),
			blocks		= document.get( 'blocks' ),
			range		= getTimeRange(),

			create = function () {
				var
					sy	= range.min.date[0],
					fy	= range.max.date[0],
					sm	= range.min.date[1],
					fm	= range.max.date[1],
					now	= new Date(),
					yto	= fy + 1,
					y	= sy - 1,

					nowYear		= now.getFullYear(),
					nowMonth	= now.getMonth(),
					nowDay		= now.getDate(),

					foundDate = false,
					foundOne = false,
					div, time,
					counter,
					weeks,
					em, i,
					n;

				while( y <= yto ) {
					for( i = 1, counter = 0; i <= 12; i++, n = 0 ) {
						if( i < sm && y == sy - 1 || i > fm && y == yto )
							continue;

						time	= document.createElement( 'time' );
						div		= document.createElement( 'div' );

						weeks = weeksInMonth( y, i );

						if( range.timeline[y] && range.timeline[y][i] && range.timeline[y][i] > 3 ) {
							weeks = range.timeline[y][i];
							foundOne = true;
						}

						if( y == sy && counter >= range.min.week - 1 && !foundOne )
							continue;

						while( n++ < weeks ) {
							if( y == sy && counter >= range.min.week - 1 && !foundOne ) {
								weeks--;
								continue;
							}
							API.weeks.push( counter === 0 ? [y-1,API.weeks.length > 0 ? API.weeks[API.weeks.length-1][1]+1 : 0] : [ y, counter ] );

							// Detect current week
							if( !foundDate && y == nowYear && ( i == nowMonth + 1 || i == nowMonth + 2 || i == nowMonth ) ) {
								var
									key		= API.weeks[ API.weeks.length - 1 ],
									d		= new Date( key[0], 0, key[1]*7 ),
									wd		= d.getDay(),
									d		= new Date( key[0], 0, key[1]*7 + (7-wd) ),
									year	= d.getFullYear(),
									month	= d.getMonth(),
									day		= d.getDate();

								if( year == nowYear && month == nowMonth && day >= nowDay ) {
									flags.nowWeek = API.weeks.length - 1;
									foundDate = true;
								}
							}

							counter++;
						}

						div.className = 'month w' + weeks;

						time.innerHTML = months[i] + ' ';

						if( i === 1 ) {
							em = document.createElement( 'em' );
							em.innerHTML = y;

							time.appendChild( em );
						}

						div.appendChild( time );
						t.appendChild( div );
					}

					y++;
				}

				return API;
			},

			API = {
				weeks: []
			};

		create();

		window.onresize = function () {
			var cHalfWidth = container.offsetWidth / 2;

			flags.offset = Math.floor( cHalfWidth ) - Math.floor( cHalfWidth / 30 ) * 30 + 5;
			t.style.backgroundPosition = flags.offset + 'px 20px';
			blocks.style.paddingLeft = flags.offset + 'px';
			t.style.paddingLeft = flags.offset + 'px';
		};

		window.onresize();

		return API;
	};

	var changeTextContent = (function () {
		var textMeasure	= document.createElement( 'div' );

		textMeasure.setAttribute( 'id', 'textMeasure' );
		document.body.appendChild( textMeasure );

		return function ( obj, text ) {
			textMeasure.innerHTML = text;
			obj.style.width = textMeasure.offsetWidth + 'px';
			obj.innerHTML = text;
		};
	})();

	function formatNum( num ) {
		return Math.round( num ).toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
	}

	var updateDetails = (function () {
		var
			statsParent	= document.get( 'stats-parent' ),
			statePop	= document.get( 'population' ),
			average		= document.get( 'average-ili' ),
			current		= document.get( 'current-ili' ),
			deaths		= document.get( 'deaths-ili' );

		return function ( key ) {
			var
				data	= flags.points[ key[0] + '/' + key[1] ],
				state	= flags.stateActive,
				dth;

			statsParent.style.display = data ? 'block' : 'none';

			if( !data )
				return;

			dth = data[1];

			if( dth === null )
				dth = 'UNKNOWN';
			else {
				if( dth === 0 )
					dth = '0% (0)';
				else {
					dth = ( Math.round( dth * 1000 / data[2] ) / 10 ).toString().replace( '.', ',' );
					dth = dth + ' (' + data[1] + ')';
				}
			}

			changeTextContent( statePop, formatNum( population[state] * data[3] / 100 ) );

			average.innerHTML = data[0].toString().replace( '.', ',' ) + '% (' + formatNum( population[state] * data[0] / 100 ) + ')';
			current.innerHTML = ( Math.round( data[3] * 10 ) / 10 ).toString().replace( '.', ',' ) + '% (' + formatNum( population[state] * data[3] / 100 ) + ')';

			deaths.innerHTML = dth;
		};
	})();

	var updateMap = function () {
		var
			months		= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
			statePop	= document.get( 'population' ),
			dmonth		= document.get( 'date-month' ),
			dday		= document.get( 'date-day' ),
			average		= document.get( 'average-ili' ),
			current		= document.get( 'current-ili' ),
			deaths		= document.get( 'deaths-ili' ),
			range		= getTimeRange(),

			mind		= range.min.date[0],
			maxd		= range.max.date[0],
			minw		= range.min.week,
			maxw		= range.max.week,

			heatLayer	= null,

			heatOptions	= {
				'gradient': {
					0.1: '#2CF54C', 0.2: '#54F146', 0.3: '#7CEE3F',
					0.4: '#A5EA39', 0.5: '#CDE732', 0.6: '#F5BE30',
					0.7: '#F59A33', 0.8: '#F57537', 0.9: '#F5513A',
					1.0: '#F52C3E'
				},
				'minOpacity': .4,
				'radius': 20,
				'blur': 15
			},

			inRange	= function ( key ) {
				return (
					( key[0] > mind || key[0] == mind && key[1] >= minw ) &&
					( key[1] < maxd || key[1] == maxd && key[1] <= maxw )
				);
			};

		return function ( week ) {
			week >= timeline.weeks.length && (week = timeline.weeks.length - 1);
			week < 0 && (week = 0);

			var
				key		= timeline.weeks[week],
				d		= new Date( key[0], 0, key[1]*7 ),
				month	= months[ d.getMonth() ],
				day		= d.getDate();

			dday.innerHTML = ( day < 10 ? '0' : '' ) + day;
			dmonth.innerHTML = month + ' ' + key[0];

			flags.lastKey = key;

			if( inRange ) {
				if( flags.active == 'map' ) {
					if( heatLayer ) {
						map.removeLayer( heatLayer );
						heatLayer = null;
					}

					Ajax.POST( 'http://www.flu-prediction.com/map', {
						'data': { 'year': key[0], 'week': key[1] },

						'onload': function ( response ) {
							var
								obj	= JSON.parse( response.text ),
								changes = [],
								from, to,
								opts, i,
								sum = 0;

							for( i in states ) {
								if( !obj.hasOwnProperty( i ) ) {
									states[i].setStyle( {
										fillColor: '#eeeeee',
										fillOpacity: 1
									} );
									states[i].percent = 1;
									states[i].lvl = 1;
								}
								else {
									opts = states[i].options || states[i]._layers[Object.keys(states[i]._layers)[0]].options;

									from = opts.fillOpacity * 100;
									to = obj[i][0] * 10;

									if( flags.nofade )
										from = to + 0.00001;

									if( to != from ) {
										changes.push( {
											'to': ( to - from ) / 100,
											'from': from / 100,
											'state': i
										} );
									}

									states[i].setStyle( { fillColor: states[i].stateStyle.fillColor } );
									sum += population[i] * obj[i][1] / 100;
									states[i].percent = obj[i][1];
									states[i].lvl = obj[i][0];
								}
							}

							if( flags.nofade )
								flags.nofade = false;

							if( sum === 0 ) {
								changeTextContent( statePop, 'Unknown' );
								population['USA'] = 'Unknown';
								flags.unkPop = true;
							}
							else {
								changeTextContent( statePop, formatNum( sum ) );
								population['USA'] = formatNum( sum );
								flags.unkPop = false;
							}

							if( flags.anim )
								flags.anim.stop();

							flags.anim = new TWEEN.Tween( { o: 0 } )
								.to( { o: 100 }, 250 )
								.easing( TWEEN.Easing.Quadratic.Out )
								.onUpdate( (function ( changes ) {
									var l = changes.length, i;

									return function () {
										for( i = 0; i < l; i++ ) {
											states[changes[i].state].setStyle( {
												fillOpacity: changes[i].from + this.o * changes[i].to / 100 
											} );
										}
									};
								})( changes ) );

							animate( flags.anim );
						}
					} );
				}
				else if ( flags.active == 'twitter' ) {
					for( var i in states ) {
						states[i].setStyle( { fillColor: states[i].stateStyle.fillColor } );
					}

					Ajax.GET( 'http://www.flu-prediction.com/tweets', {
						'data': { 'year': key[0], 'week': key[1] },

						'onload': function ( response ) {
							var list = JSON.parse( response.text );

							if( heatLayer ) {
								map.removeLayer( heatLayer );
								heatLayer = null;
							}

							if( list.length > 0 )
								heatLayer = L.heatLayer( list, heatOptions ).addTo( map );
						}
					} );
				}
				else if( flags.active == 'details' ) {
					updateDetails( key );
				}
			}
		};
	};