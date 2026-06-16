/**
 * BBH-Lite Navigation
 *
 * Multi-level dropdowns, keyboard navigation, touch support, mobile overlay.
 * No jQuery dependency.
 */
( function() {
    'use strict';

    var focusableSelector = 'a[href], button:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    /**
     * Get all focusable elements inside a container.
     */
    function getFocusable( container ) {
        if ( ! container ) return [];
        return Array.from( container.querySelectorAll( focusableSelector ) );
    }

    var activeTrap = null;

    /**
     * Trap Tab/Shift+Tab focus within a container.
     */
    function trapFocus( container, e ) {
        var focusable = getFocusable( container );
        if ( focusable.length === 0 ) return;

        var first = focusable[0];
        var last  = focusable[ focusable.length - 1 ];

        if ( e.key === 'Tab' ) {
            if ( e.shiftKey ) {
                if ( document.activeElement === first ) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if ( document.activeElement === last ) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    }

    /**
     * Trap focus inside a container on keydown.
     */
    function setFocusTrap( container ) {
        activeTrap = container;
    }

    function clearFocusTrap() {
        activeTrap = null;
    }

    document.addEventListener( 'keydown', function( e ) {
        if ( activeTrap && ( e.key === 'Tab' ) ) {
            trapFocus( activeTrap, e );
        }
    } );

    var menuToggle     = document.querySelector( '.menu-toggle' );
    var navMenu        = document.querySelector( '.nav-menu' );
    var mobileOverlay  = document.getElementById( 'mobile-nav-overlay' );
    var mobileCloseBtn = document.querySelector( '.mobile-nav-close' );

    if ( ! menuToggle || ! navMenu ) {
        return;
    }

    var isMobile = window.innerWidth <= 768;

    /**
     * Track whether the last interaction was pointer-based.
     * Used to avoid stale :focus-visible rings after mouse-closing modals.
     */
    var pointerActive = false;

    document.addEventListener( 'pointerdown', function() {
        pointerActive = true;
    } );

    document.addEventListener( 'keydown', function( e ) {
        if ( e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter' || e.key === ' ' || e.key.indexOf( 'Arrow' ) === 0 ) {
            pointerActive = false;
        }
    } );

    function focusTriggerSafely( el ) {
        if ( ! el ) return;
        el.focus();
        if ( pointerActive ) {
            el.blur();
        }
    }

    window.addEventListener( 'resize', function() {
        clearTimeout( window.bbhResizeTimer );
        window.bbhResizeTimer = setTimeout( function() {
            var wasMobile = isMobile;
            isMobile = window.innerWidth <= 768;
            if ( wasMobile && ! isMobile ) {
                closeMobileNav();
            }
        }, 100 );
    } );

    /**
     * Open mobile overlay.
     */
    function openMobileNav() {
        if ( ! isMobile ) return;

        menuToggle.setAttribute( 'aria-expanded', 'true' );
        if ( mobileOverlay ) {
            mobileOverlay.classList.add( 'active' );
            mobileOverlay.setAttribute( 'aria-hidden', 'false' );
            setFocusTrap( mobileOverlay );
        }
        document.body.classList.add( 'nav-open' );

        var firstLink = navMenu.querySelector( 'a' );
        if ( firstLink ) {
            setTimeout( function() { firstLink.focus(); }, 100 );
        }
    }

    /**
     * Close mobile overlay.
     */
    function closeMobileNav() {
        menuToggle.setAttribute( 'aria-expanded', 'false' );
        if ( mobileOverlay ) {
            mobileOverlay.classList.remove( 'active' );
            mobileOverlay.setAttribute( 'aria-hidden', 'true' );
        }
        document.body.classList.remove( 'nav-open' );

        closeAllSubmenus();
        clearFocusTrap();
        focusTriggerSafely( menuToggle );
    }

    /**
     * Close all open submenus.
     */
    function closeAllSubmenus() {
        navMenu.querySelectorAll( '.sub-menu' ).forEach( function( submenu ) {
            submenu.style.display = '';
        } );
        navMenu.querySelectorAll( '.menu-item-has-children' ).forEach( function( item ) {
            item.classList.remove( 'focus' );
            var link = item.querySelector( ':scope > a' );
            if ( link ) {
                link.setAttribute( 'aria-expanded', 'false' );
            }
        } );
    }

    /**
     * Toggle mobile menu.
     */
    menuToggle.addEventListener( 'click', function() {
        if ( isMobile ) {
            if ( this.getAttribute( 'aria-expanded' ) === 'true' ) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        }
    } );

    /**
     * Close button.
     */
    if ( mobileCloseBtn ) {
        mobileCloseBtn.addEventListener( 'click', function() {
            closeMobileNav();
        } );
    }

    /**
     * Close on overlay background click (not on the menu itself).
     */
    if ( mobileOverlay ) {
        mobileOverlay.addEventListener( 'click', function( e ) {
            if ( e.target === mobileOverlay ) {
                closeMobileNav();
            }
        } );
    }

    /**
     * Escape key on mobile overlay container.
     */
    if ( mobileOverlay ) {
        mobileOverlay.addEventListener( 'keydown', function( e ) {
            if ( e.key === 'Escape' ) {
                e.preventDefault();
                closeMobileNav();
            }
        } );
    }

    /**
     * Desktop: open submenu when Tab-focus lands on a parent item.
     * Uses focusin (bubbles) so dynamically-added items are also covered.
     */
    navMenu.addEventListener( 'focusin', function( e ) {
        if ( isMobile ) return;

        var link = e.target.closest( 'a' );
        if ( ! link ) return;

        var parentLi = link.closest( 'li' );
        if ( ! parentLi || ! parentLi.classList.contains( 'menu-item-has-children' ) ) return;

        var submenu = parentLi.querySelector( ':scope > .sub-menu' );
        if ( ! submenu ) return;

        parentLi.classList.add( 'focus' );
        link.setAttribute( 'aria-expanded', 'true' );
    } );

    /**
     * Desktop: close submenus when focus leaves the nav entirely.
     * Uses a short timeout so focus moving between items doesn't trigger close.
     */
    navMenu.addEventListener( 'focusout', function( e ) {
        if ( isMobile ) return;

        setTimeout( function() {
            if ( ! navMenu.contains( document.activeElement ) ) {
                closeAllSubmenus();
            }
        }, 0 );
    } );

    /**
     * Dropdown toggle: click opens/closes submenu on mobile.
     * Stops propagation so it doesn't close the overlay.
     */
    navMenu.addEventListener( 'click', function( e ) {
        var target = e.target.closest( '.menu-item-has-children > a' );

        if ( target && isMobile ) {
            e.preventDefault();
            e.stopPropagation();

            var parentLi = target.parentElement;
            var submenu  = parentLi.querySelector( ':scope > .sub-menu' );

            if ( ! submenu ) return;

            var isOpen = submenu.style.display === 'block';

            if ( isOpen ) {
                submenu.style.display = 'none';
                parentLi.classList.remove( 'focus' );
                target.setAttribute( 'aria-expanded', 'false' );

                var childSubmenus = parentLi.querySelectorAll( '.sub-menu' );
                childSubmenus.forEach( function( childMenu ) {
                    childMenu.style.display = 'none';
                } );
                parentLi.querySelectorAll( '.menu-item-has-children' ).forEach( function( childItem ) {
                    childItem.classList.remove( 'focus' );
                    var childLink = childItem.querySelector( ':scope > a' );
                    if ( childLink ) {
                        childLink.setAttribute( 'aria-expanded', 'false' );
                    }
                } );
            } else {
                submenu.style.display = 'block';
                parentLi.classList.add( 'focus' );
                target.setAttribute( 'aria-expanded', 'true' );
            }
        }
    } );

    /**
     * Close overlay when a leaf menu link is clicked on mobile.
     */
    navMenu.addEventListener( 'click', function( e ) {
        var link = e.target.closest( 'a' );
        if ( ! link || ! isMobile ) return;

        var parentLi = link.parentElement;
        if ( parentLi.classList.contains( 'menu-item-has-children' ) ) return;

        closeMobileNav();
    } );

    /**
     * Keyboard navigation.
     */
    navMenu.addEventListener( 'keydown', function( e ) {
        var target = e.target;
        var parentLi = target.closest( 'li' );

        if ( ! parentLi ) return;

        var submenu = parentLi.querySelector( ':scope > .sub-menu' );

        switch ( e.key ) {
            case 'Escape':
                e.preventDefault();
                e.stopPropagation();

                // Find the innermost open submenu the current item is inside
                var parentSubmenu = target.closest( '.sub-menu' );

                if ( parentSubmenu ) {
                    // Close the submenu level the item is in
                    parentSubmenu.style.display = '';

                    var parentItem = parentSubmenu.closest( 'li' );
                    if ( parentItem ) {
                        parentItem.classList.remove( 'focus' );
                        var parentLink = parentItem.querySelector( ':scope > a' );
                        if ( parentLink ) {
                            parentLink.setAttribute( 'aria-expanded', 'false' );
                            parentLink.focus();
                        }
                    }
                } else if ( submenu ) {
                    // Focus is on a parent item with an open submenu — close it
                    submenu.style.display = '';
                    parentLi.classList.remove( 'focus' );
                    target.setAttribute( 'aria-expanded', 'false' );
                } else if ( isMobile ) {
                    closeMobileNav();
                }
                break;

            case 'ArrowDown':
                if ( submenu && parentLi.classList.contains( 'menu-item-has-children' ) ) {
                    e.preventDefault();
                    submenu.style.display = 'block';
                    parentLi.classList.add( 'focus' );
                    target.setAttribute( 'aria-expanded', 'true' );
                    var firstLink = submenu.querySelector( 'a' );
                    if ( firstLink ) firstLink.focus();
                }
                break;

            case 'ArrowUp':
                if ( submenu && submenu.style.display === 'block' ) {
                    e.preventDefault();
                    submenu.style.display = 'none';
                    parentLi.classList.remove( 'focus' );
                    target.setAttribute( 'aria-expanded', 'false' );
                }
                break;

            case 'ArrowRight':
                if ( parentLi.parentElement.classList.contains( 'sub-menu' ) && parentLi.classList.contains( 'menu-item-has-children' ) ) {
                    e.preventDefault();
                    submenu = parentLi.querySelector( ':scope > .sub-menu' );
                    if ( submenu ) {
                        submenu.style.display = 'block';
                        parentLi.classList.add( 'focus' );
                        target.setAttribute( 'aria-expanded', 'true' );
                        var firstLink = submenu.querySelector( 'a' );
                        if ( firstLink ) firstLink.focus();
                    }
                }
                break;

            case 'ArrowLeft':
                if ( parentLi.parentElement.classList.contains( 'sub-menu' ) ) {
                    e.preventDefault();
                    var parentSubmenu = parentLi.closest( 'ul.sub-menu' );
                    if ( parentSubmenu ) {
                        parentSubmenu.style.display = 'none';
                        var parentItem = parentSubmenu.closest( 'li' );
                        if ( parentItem ) {
                            parentItem.classList.remove( 'focus' );
                            var parentLink = parentItem.querySelector( ':scope > a' );
                            if ( parentLink ) {
                                parentLink.setAttribute( 'aria-expanded', 'false' );
                                parentLink.focus();
                            }
                        }
                    }
                }
                break;
        }
    } );

    /**
     * Search overlay toggle.
     */
    var searchToggle  = document.getElementById( 'search-toggle' );
    var searchOverlay = document.getElementById( 'search-overlay' );

    if ( searchToggle && searchOverlay ) {
        var searchInput = searchOverlay.querySelector( '.search-field' );

        function openSearch() {
            searchToggle.setAttribute( 'aria-expanded', 'true' );
            searchOverlay.classList.add( 'active' );
            searchOverlay.setAttribute( 'aria-hidden', 'false' );
            document.body.classList.add( 'search-open' );

            setFocusTrap( searchOverlay );

            if ( searchInput ) {
                setTimeout( function() { searchInput.focus(); }, 300 );
            }
        }

        function closeSearch() {
            searchToggle.setAttribute( 'aria-expanded', 'false' );
            searchOverlay.classList.remove( 'active' );
            searchOverlay.setAttribute( 'aria-hidden', 'true' );
            document.body.classList.remove( 'search-open' );
            clearFocusTrap();
            focusTriggerSafely( searchToggle );
        }

        searchToggle.addEventListener( 'click', function() {
            if ( this.getAttribute( 'aria-expanded' ) === 'true' ) {
                closeSearch();
            } else {
                openSearch();
            }
        } );

        searchOverlay.addEventListener( 'click', function( e ) {
            if ( e.target === searchOverlay ) {
                closeSearch();
            }
        } );

        searchOverlay.addEventListener( 'keydown', function( e ) {
            if ( e.key === 'Escape' ) {
                e.preventDefault();
                e.stopPropagation();
                closeSearch();
            }
        } );
    }

    /**
     * Scroll to top button.
     */
    var scrollTopBtn = document.getElementById( 'scroll-top' );

    if ( scrollTopBtn ) {
        var scrollTimeout;

        window.addEventListener( 'scroll', function() {
            clearTimeout( scrollTimeout );
            scrollTimeout = setTimeout( function() {
                if ( window.scrollY > 20 ) {
                    scrollTopBtn.classList.add( 'visible' );
                } else {
                    scrollTopBtn.classList.remove( 'visible' );
                }
            }, 50 );
        } );

        scrollTopBtn.addEventListener( 'click', function() {
            window.scrollTo( { top: 0, behavior: 'smooth' } );
        } );
    }

} )();
