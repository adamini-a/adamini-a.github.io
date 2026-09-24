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
} )();
