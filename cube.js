/**
 * CSS Cube
 *
 * This was mostly just an excuse to play with 3D transforms, transitions, and object-oriented
 * javascript. It's not the most practical way to build this kind of tool, but I had fun doing it
 * and I hope you find it interesting.
 *
 * (c) Scott Bedard 2014
 * http://scottbedard.net/csscube
 */

$( document ).ready(function() {
	var cube = {

		/**
		 * METHOD INDEX
		 * 		construct
		 * 		
		 * 		addTurn
		 * 		scramble
		 * 		executeTurns
		 * 		
		 * 		doRotation
		 * 		
		 * 		selectStickers
		 * 		readStickers
		 * 		writeStickers
		 * 		
		 * 		turnU
		 * 		turnL
		 * 		turnF
		 * 		turnR
		 * 		turnB
		 * 		turnD
		 * 		rotateX
		 * 		rotateY
		 */
		
		// Make sure these values match the ones in the SCSS file, otherwise the transitions will
		// look screwy because jQuery and CSS won't agree about the size and location of the stickers
		sticker_depth : 100,
		sticker_size : 55,
		sticker_spacing : 10,

		// Turning status, this prevents turns from firing before a previous turn is complete
		turning : false,

		// The number of moves the scramble function will generate
		scramble_depth : 30,

		// The que of moves waiting to be animated
		pending_turns : [],

		// Here we define the starting position for our stickers. When the cube is turned, the stickers
		// will be transitioned to one of the other sticker's locations, and then reset back to where
		// it started from. After this happens, the stickers will be re-painted to reflect the turn that
		// was just made. This way, we can always refer to the stickers we are trying to move without
		// having to keep track of where they are. The UFL sticker, for example, will ALWAYS be located 
		// at the UP-FRONT-LEFT corner position.
		sticker : {
			ULB	: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translate3d(-_size_, -_size_, _depth_)',
			UB	: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translate3d(0, -_size_, _depth_)',
			UBR	: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translate3d(_size_, -_size_, _depth_)',
			UL	: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translate3d(-_size_, 0, _depth_)',
			U	: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translate3d(0, 0, _depth_)',
			UR	: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translate3d(_size_, 0, _depth_)',
			UFL	: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translate3d(-_size_, _size_, _depth_)',
			UF	: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translate3d(0, _size_, _depth_)',
			URF	: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translate3d(_size_, _size_, _depth_)',

			LBU	: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translate3d(-_size_, -_size_, _depth_)',
			LU	: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translate3d(0, -_size_, _depth_)',
			LUF	: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translate3d(_size_, -_size_, _depth_)',
			LB	: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translate3d(-_size_, 0, _depth_)',
			L	: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translate3d(0, 0, _depth_)',
			LF	: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translate3d(_size_, 0, _depth_)',
			LDB	: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translate3d(-_size_, _size_, _depth_)',
			LD	: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translate3d(0, _size_, _depth_)',
			LFD	: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translate3d(_size_, _size_, _depth_)',

			FLU	: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(-_size_, -_size_, _depth_)',
			FU	: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(0, -_size_, _depth_)',
			FUR	: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(_size_, -_size_, _depth_)',
			FL	: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(-_size_, 0, _depth_)',
			F	: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(0, 0, _depth_)',
			FR	: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(_size_, 0, _depth_)',
			FDL	: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(-_size_, _size_, _depth_)',
			FD	: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(0, _size_, _depth_)',
			FRD	: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(_size_, _size_, _depth_)',

			RFU	: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translate3d(-_size_, -_size_, _depth_)',
			RU	: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translate3d(0, -_size_, _depth_)',
			RUB	: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translate3d(_size_, -_size_, _depth_)',
			RF	: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translate3d(-_size_, 0, _depth_)',
			R	: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translate3d(0, 0, _depth_)',
			RB	: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translate3d(_size_, 0, _depth_)',
			RDF	: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translate3d(-_size_, _size_, _depth_)',
			RD	: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translate3d(0, _size_, _depth_)',
			RBD	: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translate3d(_size_, _size_, _depth_)',

			BRU	: 'rotateY(180deg) rotateX(0deg) rotateZ(0deg) translate3d(-_size_, -_size_, _depth_)',
			BU	: 'rotateY(180deg) rotateX(0deg) rotateZ(0deg) translate3d(0, -_size_, _depth_)',
			BUL	: 'rotateY(180deg) rotateX(0deg) rotateZ(0deg) translate3d(_size_, -_size_, _depth_)',
			BR	: 'rotateY(180deg) rotateX(0deg) rotateZ(0deg) translate3d(-_size_, 0, _depth_)',
			B	: 'rotateY(180deg) rotateX(0deg) rotateZ(0deg) translate3d(0, 0, _depth_)',
			BL	: 'rotateY(180deg) rotateX(0deg) rotateZ(0deg) translate3d(_size_, 0, _depth_)',
			BDR	: 'rotateY(180deg) rotateX(0deg) rotateZ(0deg) translate3d(-_size_, _size_, _depth_)',
			BD	: 'rotateY(180deg) rotateX(0deg) rotateZ(0deg) translate3d(0, _size_, _depth_)',
			BLD	: 'rotateY(180deg) rotateX(0deg) rotateZ(0deg) translate3d(_size_, _size_, _depth_)',

			DLF	: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translate3d(-_size_, -_size_, _depth_)',
			DF	: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translate3d(0, -_size_, _depth_)',
			DFR	: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translate3d(_size_, -_size_, _depth_)',
			DL	: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translate3d(-_size_, 0, _depth_)',
			D	: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translate3d(0, 0, _depth_)',
			DR	: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translate3d(_size_, 0, _depth_)',
			DBL	: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translate3d(-_size_, _size_, _depth_)',
			DB	: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translate3d(0, _size_, _depth_)',
			DRB	: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translate3d(_size_, _size_, _depth_)',
		},

		/**
		 * Make sure the JS and CSS are on the same page
		 */
		construct : function () {
			var css;
			for (var stickerName in this.sticker) {
				if (this.sticker.hasOwnProperty(stickerName)) {
					css = this.sticker[stickerName];
					this.sticker[stickerName] = this.sticker[stickerName].replace(/_depth_/g, this.sticker_depth + 'px');
					this.sticker[stickerName] = this.sticker[stickerName].replace(/_size_/g, (this.sticker_size + this.sticker_spacing) + 'px');
				}
			}
		},

		/**
		 * Process keypress events and add to pending turns
		 */
		addTurn : function ( event ) {
			// Shut down the default action of the keypress
			event.preventDefault();

			// Figure out which key we're dealing with
			var key = String.fromCharCode(event.keyCode).toLowerCase();
			var turn = {};

			// UP TURNS ( J & F )
			if (key == 'j') { turn = { 'face' : 'U', 'turn' : 90 }
			} else if (key == 'f') { turn = { 'face' : 'U', 'turn' : -90 }

			// LEFT TURNS ( D & E )
			} else if (key == 'd') { turn = { 'face' : 'L', 'turn' : 90 }
			} else if (key == 'e') { turn = { 'face' : 'L', 'turn' : -90 }
			
			// FACE TURNS ( H & G )
			} else if (key == 'h') { turn = { 'face' : 'F', 'turn' : 90 }
			} else if (key == 'g') { turn = { 'face' : 'F', 'turn' : -90 }

			// RIGHT TURNS ( I & K )
			} else if (key == 'i') { turn = { 'face' : 'R', 'turn' : 90 }
			} else if (key == 'k') { turn = { 'face' : 'R', 'turn' : -90 }

			// BACK TURNS ( W & O )
			} else if (key == 'w') { turn = { 'face' : 'B', 'turn' : 90 }
			} else if (key == 'o') { turn = { 'face' : 'B', 'turn' : -90 }
			
			// DOWN TURNS ( S & L )
			} else if (key == 's') { turn = { 'face' : 'D', 'turn' : 90 }
			} else if (key == 'l') { turn = { 'face' : 'D', 'turn' : -90 }

			// X ROTATIONS ( U, Y, T, N, & V )
			} else if (key == 'u' || key == 'y' || key == 't') {
				turn = { 'face' : 'X', 'turn' : 90 }
			} else if (key == 'n' || key == 'v') {
				turn = { 'face' : 'X', 'turn' : -90 }

			// Y ROTATIONS ( ; & A )
			} else if (key == ';') { turn = { 'face' : 'Y', 'turn' : 90 }
			} else if (key == 'a') { turn = { 'face' : 'Y', 'turn' : -90 }

			// Unknown input, do nothing
			} else { return false; }

			// Add the turn to the que
			this.pending_turns.push(turn);

			// Call the next turn if the turning status is false
			if ( ! this.turning ) {
				this.executeTurns();
			}
		},

		/**
		 * Generates a ramdom sequence of moves and adds it to the turn que
		 */
		scramble : function () {
			// Clear the pending turns que
			this.pending_turns = [];

			// Possible faces we might turn, and how far we might turn them
			var faces = ['U', 'L', 'F', 'R', 'B', 'D'];
			var rotation = [-90, 90];
			
			// Generate a random turn until the scramble reaches the desired depth
			var i = 0;
			var previous = false;
			while ( i < this.scramble_depth) {
				// Pick a random face
				var face = faces[Math.floor(Math.random()*faces.length)];

				// Make sure we aren't turning the same face twice in a row, this will prevent mirrored
				// scramble moves from canceling each other out
				if ( ! previous || previous != face) {
					// Determine the degree of the turn
					var turn = { 'face' : face, 'turn' : rotation[Math.floor(Math.random()*rotation.length)]}
					
					// Add the turn to the que
					this.pending_turns.push(turn);

					// Keep track of the face we just turned
					previous = face;
					i++;
				}
			}

			// Start executing the scramble
			this.executeTurns();
		},

		/**
		 * Executes turns sitting in the que
		 */
		executeTurns : function () {
			// If we have turns pending, call the next one
			if (this.pending_turns.length > 0) {
				// The next move in the que
				var turn = this.pending_turns[0];

				// Take the turn off the pending list
				this.pending_turns.shift();

				// Set our turning status to true
				this.turning = true;

				// Route the turn to the method responsible for turning that face or rotating the cube
				if (turn['face'] == 'U') { this.turnU( turn['turn'] ); }
				else if (turn['face'] == 'L') { this.turnL( turn['turn'] ); }
				else if (turn['face'] == 'F') { this.turnF( turn['turn'] ); }
				else if (turn['face'] == 'R') { this.turnR( turn['turn'] ); }
				else if (turn['face'] == 'B') { this.turnB( turn['turn'] ); }
				else if (turn['face'] == 'D') { this.turnD( turn['turn'] ); }
				else if (turn['face'] == 'X') { this.rotateX( turn['turn'] ); }
				else if (turn['face'] == 'Y') { this.rotateY( turn['turn'] ); }
			}
		},

		/**
		 * Adjusts one of the axis rotation values of a sticker
		 */
		doRotation : function ( stickers, axis, rotation ) {
			// Reference this as self so we can use it inside anonymous functions
			var self = this;

			// Loop through the stickers given and adjust their rotations
			stickers.forEach( function( sticker ) {
				if (axis == 'X') {
					var css = self.sticker[sticker].replace(/rotateX\((-)?[0-9]+deg\)/, 'rotateX(' + rotation + 'deg)');
				} else if (axis == 'Y') {
					var css = self.sticker[sticker].replace(/rotateY\((-)?[0-9]+deg\)/, 'rotateY(' + rotation + 'deg)');
				} else if (axis == 'Z') {
					var css = self.sticker[sticker].replace(/rotateZ\((-)?[0-9]+deg\)/, 'rotateZ(' + rotation + 'deg)');
				}
				$('#'+sticker).css('transform', css);
			});
		},

		/**
		 * Returns the jQuery selector for all stickers being effected by a turn
		 */
		selectStickers : function ( effects ) {
			// Loop through the effects of our turn, create an array of stickers being effected
			var stickers = [];
			for (var sticker in effects) {
				if (effects.hasOwnProperty(sticker)) {
					stickers.push('#' + sticker);
				}
			}

			// Implode our stickers into a nice jQuery selector
			stickers = stickers.join(',');

			return stickers;
		},

		/**
		 * Reads the pre-turn sticker positions of effected stickers
		 */
		readStickers : function( effects ) {
			var colors = [];

			// Loop through the effects of our turn, and save the value of effected stickers.
			for (var sticker in effects) {
				if (effects.hasOwnProperty(sticker)) {
					colors['#' + sticker] = $('#' + sticker).css('background-color');
				}
			}

			// Allow stickers that are going to be effected to transition
			var stickers = this.selectStickers ( effects );
			$(stickers).css('transition', '');

			return colors;
		},

		/**
		 * Paints the stickers to reflect the turn that was just made
		 */
		writeStickers : function ( effects, inverted ) {
			// Reference this as self so we can use it from inside anonymous functions
			var self = this;

			// Get our stickers and jQuery selector
			var stickers = this.selectStickers ( effects );
			var colors = this.readStickers ( effects );

			// Pick a sticker to use as our transition callback
			var callback;
			for (var i in effects) {
				if (effects.hasOwnProperty(i)) {
					callback = effects[i];
					break;
				}
			}

			// When our callback animation finishes, restore default css positions and paint the new sticker colors
			$('#' + callback).bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){

				$('#' + callback).unbind();
				
				// Shut down css transitions for our stickers
				$(stickers).css('transition', 'none').css('transform', '');

				// Loop through our effects and write the new sticker colors
				for (var source in effects) {
					if (effects.hasOwnProperty(source)) {
						// Check which direction the effects should be read
						if ( inverted ) {
							// Counter-clockwise turn, invert the effects
							$('#'+source).css('background-color', colors['#'+effects[source]]);
						} else {
							// Standard cloclwise turn
							$('#'+effects[source]).css('background-color', colors['#'+source]);
						}
					}
				}

				// Remove turning status
				self.turning = false;

				// Execute the next turn in the que
				self.executeTurns();
			});
		},

		/**
		 * UP turns
		 */
		turnU : function ( direction ) {
			// Determine which direction this face is being turned
			if (direction == 90) {
				// Clockwise turn directions
				var L_rotation = -180; var F_rotation = -90; var R_rotation = 0; var U_rotation = 90; var B_rotation = 90;

				// For clockwise turns, we will read the effects variable exactly as it's written
				var inverted = false;
			} else if (direction == -90) {
				// Counter-clockwise turn directions
				var U_rotation = -90; var L_rotation = 0; var F_rotation = 90; var R_rotation = 180; var B_rotation = 270;

				// For counter-clockwise turns, we are going to read the effects variable backwards
				// to produce a turn in the opposite direction
				var inverted = true;
			}

			// The effects of our turn, this is essentially just a map of where the stickers are going 
			// when a clockwise turn is made. For counter-clockwise turns, we are just going to read
			// this map backwards.
			var effects = {
				'U':'U',	// The center stickers don't move
				'ULB' : 'UBR', 'UBR' : 'URF', 'URF' : 'UFL', 'UFL' : 'ULB',		// UP face corners
				'UB' : 'UR', 'UR' : 'UF', 'UF' : 'UL', 'UL' : 'UB',				// UP face edges
				'BUL' : 'RUB', 'RUB' : 'FUR', 'FUR' : 'LUF', 'LUF' : 'BUL',		// Adjacent corners
				'BRU' : 'RFU', 'RFU' : 'FLU', 'FLU' : 'LBU', 'LBU' : 'BRU',		// Adjacent corners
				'BU' : 'RU', 'RU' : 'FU', 'FU' : 'LU', 'LU' : 'BU'				// Adjacent edges
			}

			// Remember the colors of the stickers we are going to be changing
			this.readStickers ( effects );

			// Tell the CSS transitions to do their thing
			this.doRotation(['ULB','UB','UBR','UL','U','UR','UFL','UF','URF'], 'Z', U_rotation);
			this.doRotation(['LUF','LU','LBU'], 'Y', L_rotation);
			this.doRotation(['FUR','FU','FLU'], 'Y', F_rotation);
			this.doRotation(['RUB','RU','RFU'], 'Y', R_rotation);
			this.doRotation(['BUL','BU','BRU'], 'Y', B_rotation);

			// Re-paint the stickers to reflect the turn we just made
			this.writeStickers( effects, inverted );
		},

		/**
		 * LEFT turns
		 */
		 turnL : function ( direction ) {
			if (direction == 90) {
				var D_rotation = -180; var F_rotation = -90; var U_rotation = 0; var L_rotation = 90; var B_rotation = 90;
				var inverted = false;
			} else if (direction == -90) {
				var L_rotation = -90; var B_rotation = -90; var D_rotation = 0; var F_rotation = 90; var U_rotation = 180;
				var inverted = true;
			}

			var effects = {
				'L':'L',
				'LU':'LF', 'LF':'LD', 'LD':'LB', 'LB':'LU',
				'LBU':'LUF', 'LUF':'LFD', 'LFD':'LDB', 'LDB':'LBU',
				'UFL':'FDL', 'FDL':'DBL', 'DBL':'BUL', 'BUL':'UFL',
				'ULB':'FLU', 'FLU':'DLF', 'DLF':'BLD', 'BLD':'ULB',
				'UL':'FL', 'FL':'DL', 'DL':'BL', 'BL':'UL'
			};

			this.readStickers ( effects );

			this.doRotation(['LBU','LU','LUF','LB','L','LF','LDB','LD','LFD'], 'Z', L_rotation);
			this.doRotation(['ULB','UL','UFL'], 'X', U_rotation);
			this.doRotation(['FLU','FL','FDL'], 'X', F_rotation);
			this.doRotation(['DLF','DL','DBL'], 'X', D_rotation);
			this.doRotation(['BLD','BL','BUL'], 'X', B_rotation);

			this.writeStickers( effects, inverted );
		 },

		/**
		 * FRONT turns
		 */
		turnF : function ( direction ) {
			if (direction == 90) {
				var F_rotation = 90; var U_rotation = 90; var L_rotation = 90; var R_rotation = -90; var D_rotation = -90;
				var inverted = false;
			} else if (direction == -90) {
				var F_rotation = -90; var U_rotation = -90; var L_rotation = -90; var R_rotation = 90; var D_rotation = 90;
				var inverted = true;
			}

			var effects = {
				'F':'F',
				'FLU' : 'FUR', 'FUR' : 'FRD', 'FRD' : 'FDL', 'FDL' : 'FLU',	// F Corners
				'FU' : 'FR', 'FR' : 'FD', 'FD' : 'FL', 'FL' : 'FU',			// F Edges
				'UFL' : 'RFU', 'RFU' : 'DFR', 'DFR' : 'LFD', 'LFD' : 'UFL', // Corners
				'URF' : 'RDF', 'RDF' : 'DLF', 'DLF' : 'LUF', 'LUF' : 'URF',
				'UF' : 'RF', 'RF' : 'DF', 'DF' : 'LF', 'LF' : 'UF'
			};

			this.readStickers ( effects);

			this.doRotation(['FLU','FU','FUR','FL','F','FR','FDL','FD','FRD'], 'Z', F_rotation);
			this.doRotation(['UFL','UF','URF'], 'Y', U_rotation);
			this.doRotation(['RFU','RF','RDF'], 'X', R_rotation);
			this.doRotation(['DFR','DF','DLF'], 'Y', D_rotation);
			this.doRotation(['LFD','LF','LUF'], 'X', L_rotation);

			this.writeStickers(effects, inverted );
		},

		 /**
		  * RIGHT turns
		  */
		 turnR : function ( direction ) {
			if (direction == 90) {
				var B_rotation = -90; var D_rotation = 0; var R_rotation = 90; var F_rotation = 90; var U_rotation = 180;
				var inverted = false;
			} else if (direction == -90) {
				var D_rotation = -180; var R_rotation = -90; var F_rotation = -90; var U_rotation = 0; var B_rotation = 90;
				var inverted = true;
			}

			var effects = {
				'R':'R',
				'RU':'RB', 'RB':'RD', 'RD':'RF', 'RF':'RU',
				'RFU':'RUB', 'RUB':'RBD', 'RBD':'RDF', 'RDF':'RFU',
				'URF':'BRU', 'BRU':'DRB', 'DRB':'FRD', 'FRD':'URF',
				'UBR':'BDR', 'BDR':'DFR', 'DFR':'FUR','FUR':'UBR',
				'UR':'BR', 'BR':'DR', 'DR':'FR', 'FR':'UR'
			}

			this.readStickers ( effects );

			this.doRotation(['RFU','RU','RUB','RF','R','RB','RDF','RD','RBD'], 'Z', R_rotation);
			this.doRotation(['URF','UR','UBR'], 'X', U_rotation);
			this.doRotation(['BRU','BR','BDR'], 'X', B_rotation);
			this.doRotation(['DRB','DR','DFR'], 'X', D_rotation);
			this.doRotation(['FRD','FR','FUR'], 'X', F_rotation);

			this.writeStickers( effects, inverted );
		},

		/**
		 * BACK turns
		 */
		turnB : function ( direction ) {
			if (direction == 90) {
				var U_rotation = -90; var L_rotation = -90; var B_rotation = 90; var D_rotation = 90; var R_rotation = 90;
				var inverted = false;
			} else if (direction == -90) {
				var B_rotation = -90; var D_rotation = -90; var R_rotation = -90; var U_rotation = 90; var L_rotation = 90;
				var inverted = true;
			}

			var effects = {
				'B':'B',
				'BRU':'BUL', 'BUL':'BLD', 'BLD':'BDR', 'BDR':'BRU',
				'BU':'BL', 'BL':'BD', 'BD':'BR', 'BR':'BU',
				'UBR':'LBU', 'LBU':'DBL', 'DBL':'RBD', 'RBD':'UBR',
				'ULB':'LDB', 'LDB':'DRB', 'DRB':'RUB', 'RUB':'ULB',
				'UB':'LB', 'LB':'DB', 'DB':'RB', 'RB':'UB'
			}

			this.readStickers ( effects );

			this.doRotation(['BRU','BU','BUL','BR','B','BL','BDR','BD','BLD'], 'Z', B_rotation);
			this.doRotation(['ULB','UB','UBR'], 'Y', U_rotation);
			this.doRotation(['LBU','LB','LDB'], 'X', L_rotation);
			this.doRotation(['RUB','RB','RBD'], 'X', R_rotation);
			this.doRotation(['DBL','DB','DRB'], 'Y', D_rotation);

			this.writeStickers( effects, inverted );
		},

		/**
		 * DOWN turns
		 */
		turnD : function ( direction ) {
			if (direction == 90) {
				var L_rotation = 0; var D_rotation = 90; var F_rotation = 90; var R_rotation = 180; var B_rotation = 270;
				var inverted = false;
			} else if (direction == -90) {
				var L_rotation = -180; var D_rotation = -90; var F_rotation = -90; var R_rotation = 0; var B_rotation = 90;
				var inverted = true;
			}

			var effects = {
				'D':'D',
				'DF':'DR', 'DR':'DB', 'DB':'DL', 'DL':'DF',
				'DLF':'DFR', 'DFR':'DRB', 'DRB':'DBL', 'DBL':'DLF',
				'FDL':'RDF', 'RDF':'BDR', 'BDR':'LDB', 'LDB': 'FDL',
				'FRD':'RBD', 'RBD':'BLD', 'BLD':'LFD', 'LFD': 'FRD',
				'FD':'RD', 'RD':'BD', 'BD':'LD', 'LD':'FD'
			}

			this.readStickers ( effects );

			this.doRotation(['DLF','DF','DFR','DL','D','DR','DBL','DB','DRB'], 'Z', D_rotation);
			this.doRotation(['FDL','FD','FRD'], 'Y', F_rotation);
			this.doRotation(['RDF','RD','RBD'], 'Y', R_rotation);
			this.doRotation(['BDR','BD','BLD'], 'Y', B_rotation);
			this.doRotation(['LDB','LD','LFD'], 'Y', L_rotation);

			this.writeStickers( effects, inverted );
		},

		/**
		 * Rotate the entire cube along the X axis
		 */
		rotateX : function ( direction ) {
			if (direction == 90) {
				var B_rotation = -90; var D_rotation = 0; var R_rotation = 90; var F_rotation = 90; var U_rotation = 180; var L_rotation = -90;
				var inverted = false;
			} else if (direction == -90) {
				var D_rotation = -180; var R_rotation = -90; var F_rotation = -90; var U_rotation = 0; var B_rotation = 90; var L_rotation = 90;
				var inverted = true;
			}

			// Cube rotations are essentially just turning all 3 layers at once, so we need a huge map 
			// that routes every sticker to it's new position.
			var effects = {
				'L':'L',
				'LF':'LU', 'LD':'LF', 'LB':'LD', 'LU':'LB',
				'LUF':'LBU', 'LFD':'LUF', 'LDB':'LFD', 'LBU':'LDB',
				'FDL':'UFL', 'DBL':'FDL', 'BUL':'DBL', 'UFL':'BUL',
				'FLU':'ULB', 'DLF':'FLU', 'BLD':'DLF', 'ULB':'BLD',
				'FL':'UL', 'DL':'FL', 'BL':'DL', 'UL':'BL',
				'F':'U', 'U':'B', 'B':'D', 'D':'F',
				'UB':'BD', 'BD':'DF', 'DF':'FU', 'FU':'UB',
				'UF':'BU', 'BU':'DB', 'DB':'FD', 'FD':'UF',
				'R':'R',
				'RU':'RB', 'RB':'RD', 'RD':'RF', 'RF':'RU',
				'RFU':'RUB', 'RUB':'RBD', 'RBD':'RDF', 'RDF':'RFU',
				'URF':'BRU', 'BRU':'DRB', 'DRB':'FRD', 'FRD':'URF',
				'UBR':'BDR', 'BDR':'DFR', 'DFR':'FUR','FUR':'UBR',
				'UR':'BR', 'BR':'DR', 'DR':'FR', 'FR':'UR'
			}

			this.readStickers ( effects );

			// We also have to tell CSS to transition every single sticker
			this.doRotation(['ULB','UB','UBR','UL','U','UR','UFL','UF','URF'], 'X', U_rotation);
			this.doRotation(['LB','L','LF', 'LDB','LD','LFD', 'LUF','LU','LBU'], 'Z', L_rotation);
			this.doRotation(['FL','F','FR', 'FDL','FD','FRD', 'FUR','FU','FLU'], 'X', F_rotation);
			this.doRotation(['RB','R','RF', 'RDF','RD','RBD', 'RUB','RU','RFU'], 'Z', R_rotation);
			this.doRotation(['BDR','BD','BLD', 'BL','B','BR', 'BUL','BU','BRU'], 'X', B_rotation);
			this.doRotation(['DLF','DF','DFR','DL','D','DR','DBL','DB','DRB'], 'X', D_rotation);

			this.writeStickers( effects, inverted );
		},

		/**
		 * Rotate entire cube along the Y axis
		 */
		rotateY : function ( direction ) {
			if (direction == 90) {
				var F_rotation = -90; var D_rotation = -90; var L_rotation = -180; var B_rotation = 90; var U_rotation = 90; var R_rotation = 0;
				var inverted = false;
			} else if (direction == -90) {
				var U_rotation = -90; var L_rotation = 0; var D_rotation = 90; var F_rotation = 90; var R_rotation = 180; var B_rotation = 270;
				var inverted = true;
			}

			var effects = {
				'U':'U',
				'ULB' : 'UBR', 'UBR' : 'URF', 'URF' : 'UFL', 'UFL' : 'ULB',
				'UB' : 'UR', 'UR' : 'UF', 'UF' : 'UL', 'UL' : 'UB',
				'BUL' : 'RUB', 'RUB' : 'FUR', 'FUR' : 'LUF', 'LUF' : 'BUL',
				'BRU' : 'RFU', 'RFU' : 'FLU', 'FLU' : 'LBU', 'LBU' : 'BRU',
				'BU' : 'RU', 'RU' : 'FU', 'FU' : 'LU', 'LU' : 'BU',
				'F':'L', 'L':'B', 'B':'R', 'R':'F',
				'FL':'LB', 'LB':'BR', 'BR':'RF', 'RF':'FL',
				'FR':'LF', 'LF':'BL', 'BL':'RB', 'RB':'FR',
				'D':'D',
				'DR':'DF', 'DB':'DR', 'DL':'DB', 'DF':'DL',
				'DFR':'DLF', 'DRB':'DFR', 'DBL':'DRB', 'DLF':'DBL',
				'RDF':'FDL', 'BDR':'RDF', 'LDB':'BDR', 'FDL':'LDB',
				'RBD':'FRD', 'BLD':'RBD', 'LFD':'BLD', 'FRD':'LFD',
				'RD':'FD', 'BD':'RD', 'LD':'BD', 'FD':'LD'
			}

			this.readStickers ( effects );

			this.doRotation(['ULB','UB','UBR','UL','U','UR','UFL','UF','URF'], 'Z', U_rotation);
			this.doRotation(['LB','L','LF', 'LDB','LD','LFD', 'LUF','LU','LBU'], 'Y', L_rotation);
			this.doRotation(['FL','F','FR', 'FDL','FD','FRD', 'FUR','FU','FLU'], 'Y', F_rotation);
			this.doRotation(['RB','R','RF', 'RDF','RD','RBD', 'RUB','RU','RFU'], 'Y', R_rotation);
			this.doRotation(['BDR','BD','BLD', 'BL','B','BR', 'BUL','BU','BRU'], 'Y', B_rotation);
			this.doRotation(['DLF','DF','DFR','DL','D','DR','DBL','DB','DRB'], 'Z', D_rotation);

			this.writeStickers( effects, inverted );
		}
	}

	// Call construct so the JS and CSS are on the same page
	cube.construct();
	$('#controller').focus();

	// Listen for keypress events from our input controller
	$('#controller').keypress(function( event ) {
		// Send the event to addTurn()
		cube.addTurn( event );
	});

	// Lastly, a button to mix up our cube
	$('#scramble').click(function() {
		cube.scramble() }
	);

});