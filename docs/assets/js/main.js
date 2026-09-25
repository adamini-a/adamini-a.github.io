/**
 * Adamini — interazioni front-end.
 * Nessuna dipendenza esterna.
 */
( function () {
	'use strict';

	var root = document.documentElement;
	root.classList.remove( 'no-js' );

	/* --- Tema chiaro/scuro ------------------------------------------- */

	var STORAGE_KEY = 'adamini-theme';

	function currentTheme() {
		if ( root.dataset.theme ) {
			return root.dataset.theme;
		}
		return window.matchMedia( '(prefers-color-scheme: light)' ).matches ? 'light' : 'dark';
	}

	function applyTheme( theme ) {
		root.dataset.theme = theme;
		try {
			localStorage.setItem( STORAGE_KEY, theme );
		} catch ( e ) {}
		document.querySelectorAll( '.theme-toggle' ).forEach( function ( btn ) {
			btn.setAttribute(
				'aria-label',
				theme === 'light' ? 'Attiva il tema scuro' : 'Attiva il tema chiaro'
			);
		} );
	}

	document.querySelectorAll( '.theme-toggle' ).forEach( function ( btn ) {
		btn.addEventListener( 'click', function () {
			applyTheme( currentTheme() === 'light' ? 'dark' : 'light' );
		} );
	} );

	applyTheme( currentTheme() );

	/* --- Menu mobile -------------------------------------------------- */

	var navToggle = document.querySelector( '.nav-toggle' );
	var nav = document.querySelector( '.nav' );

	if ( navToggle && nav ) {
		var setNav = function ( open ) {
			navToggle.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
		};

		navToggle.addEventListener( 'click', function () {
			setNav( navToggle.getAttribute( 'aria-expanded' ) !== 'true' );
		} );

		nav.addEventListener( 'click', function ( e ) {
			if ( e.target.closest( 'a' ) ) {
				setNav( false );
			}
		} );

		document.addEventListener( 'keydown', function ( e ) {
			if ( e.key === 'Escape' ) {
				setNav( false );
			}
		} );
	}

	/* --- Header "stuck" ---------------------------------------------- */

	var header = document.querySelector( '.site-header' );

	if ( header && 'IntersectionObserver' in window ) {
		var sentinel = document.createElement( 'div' );
		sentinel.setAttribute( 'aria-hidden', 'true' );
		sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
		document.body.prepend( sentinel );

		new IntersectionObserver( function ( entries ) {
			header.dataset.stuck = entries[ 0 ].isIntersecting ? 'false' : 'true';
		} ).observe( sentinel );
	}

	/* --- Reveal allo scroll ------------------------------------------- */

	var reduced = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	var revealables = document.querySelectorAll( '.reveal' );

	if ( reduced || ! ( 'IntersectionObserver' in window ) ) {
		revealables.forEach( function ( el ) {
			el.classList.add( 'is-visible' );
		} );
	} else {
		var revealObserver = new IntersectionObserver(
			function ( entries, obs ) {
				entries.forEach( function ( entry ) {
					if ( entry.isIntersecting ) {
						entry.target.classList.add( 'is-visible' );
						obs.unobserve( entry.target );
					}
				} );
			},
			{ rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
		);

		revealables.forEach( function ( el ) {
			revealObserver.observe( el );
		} );
	}

	/* --- Sezione attiva nella nav -------------------------------------- */

	var sections = document.querySelectorAll( 'section[id]' );
	var navLinks = document.querySelectorAll( '.nav a[href*="#"]' );

	if ( sections.length && navLinks.length && 'IntersectionObserver' in window ) {
		var setCurrent = function ( id ) {
			navLinks.forEach( function ( link ) {
				var match = link.getAttribute( 'href' ).split( '#' )[ 1 ] === id;
				if ( match ) {
					link.setAttribute( 'aria-current', 'true' );
				} else {
					link.removeAttribute( 'aria-current' );
				}
			} );
		};

		var spy = new IntersectionObserver(
			function ( entries ) {
				entries.forEach( function ( entry ) {
					if ( entry.isIntersecting ) {
						setCurrent( entry.target.id );
					}
				} );
			},
			{ rootMargin: '-45% 0px -50% 0px' }
		);

		sections.forEach( function ( s ) {
			spy.observe( s );
		} );
	}

	/* --- Repository private -------------------------------------------- */

	var work = document.querySelector( '.work' );

	if ( work ) {
		var viewport = work.querySelector( '.work__viewport' );
		var track = work.querySelector( '.work__track' );
		var group = work.querySelector( '.work__group' );
		var cards = work.querySelector( '.work__cards' );
		var intro = cards.querySelector( '.work-card--intro' );
		var tiles = [].slice.call( group.querySelectorAll( '.work-tile' ) );
		var motion = window.matchMedia( '(prefers-reduced-motion: reduce)' );
		var PX_AL_SECONDO = 42;
		var aperta = intro;
		var attiva = null;
		var uscita = null;

		/* Da qui in poi non è più un elenco di link ma una disclosure: gli
		   attributi li mette il JS, così senza JS non mentono mai. */
		cards.dataset.single = '';
		cards.querySelectorAll( '.work-card' ).forEach( function ( card ) {
			card.inert = ! card.hasAttribute( 'data-open' );
		} );
		tiles.forEach( function ( tile ) {
			tile.setAttribute( 'aria-expanded', 'false' );
			tile.setAttribute( 'aria-controls', tile.getAttribute( 'href' ).slice( 1 ) );
		} );

		function mostra( card ) {
			if ( ! card || card === aperta ) {
				return;
			}
			aperta.removeAttribute( 'data-open' );
			aperta.inert = true;
			card.setAttribute( 'data-open', '' );
			card.inert = false;
			aperta = card;
		}

		/* Il caret è l'unico elemento posizionato: clampato dentro la scheda,
		   quindi non può sbordare nemmeno con la tessera a filo di bordo. */
		function caret( tile ) {
			var box = cards.getBoundingClientRect();
			var t = tile.getBoundingClientRect();
			var x = t.left + t.width / 2 - box.left;
			cards.style.setProperty(
				'--work-caret',
				Math.min( Math.max( x, 28 ), box.width - 28 ) + 'px'
			);
		}

		/* Un click su un clone deve agire sull'originale. */
		function originale( tile ) {
			return group.querySelector( '[data-work="' + tile.dataset.work + '"]' ) || tile;
		}

		function apri( tile ) {
			clearTimeout( uscita );
			if ( attiva === tile ) {
				return;
			}
			var card = document.getElementById( tile.getAttribute( 'aria-controls' ) );
			if ( ! card ) {
				return;
			}

			mostra( card );
			work.querySelectorAll( '[data-active]' ).forEach( function ( el ) {
				el.removeAttribute( 'data-active' );
			} );
			// Lo stato visivo va su tutte le copie, aria-expanded solo sull'originale.
			work.querySelectorAll( '[data-work="' + tile.dataset.work + '"]' ).forEach( function ( el ) {
				el.setAttribute( 'data-active', '' );
			} );
			originale( tile ).setAttribute( 'aria-expanded', 'true' );
			work.setAttribute( 'data-open', '' );
			attiva = tile;
			caret( tile );
		}

		function chiudi() {
			if ( ! attiva ) {
				return;
			}
			originale( attiva ).setAttribute( 'aria-expanded', 'false' );
			work.querySelectorAll( '[data-active]' ).forEach( function ( el ) {
				el.removeAttribute( 'data-active' );
			} );
			work.removeAttribute( 'data-open' );
			attiva = null;
			mostra( intro );
		}

		function congela() {
			work.removeAttribute( 'data-mode' );
			track.querySelectorAll( '[data-clone]' ).forEach( function ( g ) {
				g.remove();
			} );
			track.style.removeProperty( '--work-shift' );
			track.style.removeProperty( '--work-dur' );
		}

		function nastro() {
			// Poche tessere: lo stesso wordmark che ripassa denuncia il trucco.
			if ( motion.matches || tiles.length < 4 ) {
				return;
			}

			var periodo = group.getBoundingClientRect().width;
			if ( ! periodo ) {
				return;
			}

			var copie = Math.ceil( viewport.clientWidth / periodo ) + 1;

			for ( var i = 0; i < copie; i++ ) {
				var clone = group.cloneNode( true );
				clone.setAttribute( 'aria-hidden', 'true' );
				clone.removeAttribute( 'role' );
				clone.dataset.clone = '';
				clone.querySelectorAll( '[id]' ).forEach( function ( el ) {
					el.removeAttribute( 'id' );
				} );
				clone.querySelectorAll( '.work-tile' ).forEach( function ( el ) {
					el.setAttribute( 'tabindex', '-1' );
					el.removeAttribute( 'aria-expanded' );
					el.removeAttribute( 'aria-controls' );
				} );
				track.appendChild( clone );
			}

			// Velocità costante in px/s: la durata si ricava dal periodo.
			track.style.setProperty( '--work-shift', periodo + 'px' );
			track.style.setProperty( '--work-dur', ( periodo / PX_AL_SECONDO ).toFixed( 2 ) + 's' );
			work.dataset.mode = 'marquee';
		}

		work.addEventListener( 'pointerover', function ( e ) {
			if ( e.pointerType !== 'mouse' ) {
				return;
			}
			var tile = e.target.closest( '.work-tile' );
			if ( tile ) {
				apri( tile );
			}
		} );

		work.addEventListener( 'pointerenter', function () {
			clearTimeout( uscita );
		} );

		// Tessera e scheda hanno .work come antenato comune: passare dall'una
		// all'altra non esce mai dall'elemento, quindi non chiude niente.
		work.addEventListener( 'pointerleave', function ( e ) {
			if ( e.pointerType !== 'mouse' || work.contains( document.activeElement ) ) {
				return;
			}
			uscita = setTimeout( chiudi, 180 );
		} );

		work.addEventListener( 'click', function ( e ) {
			var tile = e.target.closest( '.work-tile' );
			if ( ! tile ) {
				return;
			}
			e.preventDefault();
			if ( tile.hasAttribute( 'data-active' ) ) {
				chiudi();
			} else {
				apri( originale( tile ) );
			}
		} );

		// Sui link la barra spaziatrice non attiva di default.
		work.addEventListener( 'keydown', function ( e ) {
			if ( e.key !== ' ' && e.key !== 'Spacebar' ) {
				return;
			}
			var tile = e.target.closest( '.work-tile' );
			if ( tile ) {
				e.preventDefault();
				tile.click();
			}
		} );

		// Al primo focus da tastiera il nastro si congela: così il focus non
		// finisce mai fuori dall'area clippata.
		work.addEventListener( 'focusin', function ( e ) {
			var tile = e.target.closest( '.work-tile' );
			if ( ! tile ) {
				return;
			}
			if ( work.dataset.mode === 'marquee' && tile.matches( ':focus-visible' ) ) {
				congela();
				tile.scrollIntoView( { block: 'nearest', inline: 'center' } );
			}
			apri( tile );
		} );

		document.addEventListener( 'keydown', function ( e ) {
			if ( e.key === 'Escape' && attiva ) {
				var tile = originale( attiva );
				chiudi();
				tile.focus();
			}
		} );

		document.addEventListener( 'pointerdown', function ( e ) {
			if ( ! work.contains( e.target ) ) {
				chiudi();
			}
		} );

		nastro();

		motion.addEventListener( 'change', function () {
			congela();
			nastro();
		} );

		if ( 'ResizeObserver' in window ) {
			var larghezza = viewport.clientWidth;
			new ResizeObserver( function () {
				if ( Math.abs( viewport.clientWidth - larghezza ) < 2 ) {
					return;
				}
				larghezza = viewport.clientWidth;
				congela();
				nastro();
				if ( attiva ) {
					caret( attiva );
				}
			} ).observe( viewport );
		}
	}
} )();
