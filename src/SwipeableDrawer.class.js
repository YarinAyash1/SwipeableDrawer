class SwipeableDrawer {
    constructor( id, options = {} ) {
        if(!id)
            return console.warn(`SwipeableDrawer::element id is not found!`)
        if(!options['position'])
            options['position'] = 'bottom';

        this.drawer = document.getElementById( id );
        this.shadow = document.createElement( "div" );
        this.bodyElement = document.body;
        this.options = {
            position : or( typeof options.position === "string" ? /^(left|right|top|bottom)$/.test( options.position.toLowerCase() ) ? options.position : undefined : undefined, "left" ).toLowerCase(),
            duration : or( options.duration, 200 ),
            exitDuration : or( options.exitDuration, options.duration ),
            size : or( options.size, this.drawer.clientHeight ),
            background : or( options.background, "#ffffff" ),
            opacity : or( options.opacity, 0.6 ),
            draggable : or( options.draggable, true ),
            enableEventBg : or( options.enableEventBg, true ),
            animation : or( options.animation, "arc" ),
        }
        this.id = id;
        this.drawerSettings = {
            position : this.options.position,
            size : this.options.size,
            unMoveAxis : (this.options.position === 'left' || this.options.position === 'right') ? 'top' : 'left' // check if is not on axis X or Y
        }

        // set shadow styles
        this.setShadowStyles()
        // set drawer styles
        this.initDrawer()
        // set elements ( shadow and override drawer element )
        this.setElements();

        this.initTriggerButton()

        // on click shadow background close this drawer
        if ( this.options.enableEventBg )
            this.shadow.addEventListener( 'click', () => !this.isMove ? this.close() : false )

        this.defaultEvents();
        this.isOpen = false;
        this.isMove = false;
        this.position = -options.size;

        this.draggableEvents()

        this.animation = undefined

        function or( n, v ) {
            return n !== undefined ? n : v
        }
    }

    initDrawer() {
        this.drawer.classList.add( 'swipe-drawer-loaded' )
        this.setDrawerStyles();
    }

    draggableEvents() {
        if ( !this.options.draggable ) return;

        let touchPosition = 0;
        let onAxisY = this.drawerSettings.unMoveAxis === "top"; // is on y-axis
        let isRightOrBottom = this.options.position === "right" || this.options.position === "bottom";
        let _screen = screen[ onAxisY ? 'width' : 'height' ];

        this.drawer.addEventListener( 'touchstart', ( e ) => {
            this.drawer.drag = true;
            e = e.changedTouches[ 0 ][ onAxisY ? "screenX" : "screenY" ]
            touchPosition = (!isRightOrBottom ? e : _screen - e) - this.position;
        } )
        this.drawer.addEventListener( 'touchmove', ( e ) => {
            if ( this.drawer.drag ) {
                e = e.changedTouches[ 0 ];
                let currentPosition;
                let dragPosition = e[ onAxisY ? "screenX" : "screenY" ];

                if ( isRightOrBottom )
                    dragPosition = _screen - dragPosition;
                currentPosition = dragPosition - touchPosition;

                if ( currentPosition <= 0 ) {
                    this.position = currentPosition;
                    this.drawer.style[ this.options.position ] = currentPosition + "px";
                }
            }
        } )
        this.drawer.addEventListener( 'touchend', ( e ) => {
            this.drawer.drag = false;
            touchPosition = 0;
            let position = this.position;

            if ( -this.position < this.options.size / 2 ) {
                this.eventHandler.open();
                SwipeableDrawer.utils.animate( ( progress ) => {
                    this.position = position * (1 - progress);
                    this.drawer.style[ this.options.position ] = this.position + "px";
                }, 200 ).start();
            } else {
                this.isMove = true;
                SwipeableDrawer.utils.animate( ( progress ) => {
                    this.position = -(this.drawerSettings.size * progress + -position);
                    this.drawer.style[ this.options.position ] = this.position + "px";
                    this.shadow.style.filter = "opacity(" + this.options.opacity * (1 - progress) + ")";
                }, 200 )
                    .finish( () => {
                        this.isOpen = false;
                        this.isMove = false;
                        this.shadow.style.display = "none";
                        this.toggleBodyStyles(this.isOpen);
                        this.drawer.classList.remove( 'show' )
                    } )
                    .start();
                this.eventHandler.close();
            }
        } )
    }

    toggleBodyStyles(status) {
        if ( !status ) {

            Object.assign( this.bodyElement.style, {
                'touch-action' : 'none',
                '-ms-touch-action' : 'none',
                'overflow' : 'hidden',
            } )
        } else {
            Object.assign( this.bodyElement.style, {
                'touch-action' : 'none',
                '-ms-touch-action' : 'none',
                'overflow' : 'unset',
            } )
        }
    }

    setShadowStyles() {
        return Object.assign( this.shadow.style, {
            display : 'none',
            margin : '0',
            padding : '0',
            backgroundColor : 'rgba(0,0,0,1',
            width : screen.width + 'px',
            height : screen.height + 'px',
            filter : 'opacity(0)',
            position : 'fixed',
            top : '0',
            left : '0',
            zIndex : 99
        } );
    }

    setDrawerStyles() {
        return Object.assign( this.drawer.style, {
            margin : '0',
            padding : '0',
            backgroundColor : this.options.background,
            minHeight : (this.drawerSettings.unMoveAxis === 'top' ? screen.height : this.drawerSettings.size) + 'px',
            width : (this.drawerSettings.unMoveAxis === 'left' ? screen.width : this.drawerSettings.size) + 'px',
            [ this.drawerSettings.position ] : (this.drawerSettings.size * -1) + 'px',
            [ this.drawerSettings.unMoveAxis ] : '0',
            position : 'fixed',
            zIndex: 100,
        } );
    }

    setElements() {
        //nadir menu
        if ( this.drawer.parentNode )
            this.drawer.parentNode.removeChild( this.drawer );
        this.bodyElement.appendChild( this.shadow );
        this.bodyElement.appendChild( this.drawer );
    }

    open() {
        this.shadow.style.display = "block";
        this.toggleBodyStyles(this.isOpen);
        this.drawer.classList.add( 'show' )

        this.isMove = true;
        let animation = SwipeableDrawer.utils.animate( ( progress ) => {
            this.position = -this.options.size * (1 - progress);
            this.drawer.style[ this.options.position ] = this.position + "px";
            this.shadow.style.filter = "opacity(" + (this.options.opacity * progress) + ")";
        }, this.options.duration, this.animation );
        animation.start()
        animation.finish( () => {
            this.isOpen = true;
            this.isMove = false;
        } );

        animation = null;
        this.eventHandler.open();
    }

    close() {
        this.isMove = true;
        let animation = SwipeableDrawer.utils.animate( ( progress ) => {
            this.position = -this.options.size * progress;
            this.drawer.style[ this.options.position ] = this.position + "px";
            this.shadow.style.filter = "opacity(" + this.options.opacity * (1 - progress) + ")";
        }, this.options.duration, this.animation );
        animation.start()
        animation.finish( () => {
            this.isOpen = false;
            this.isMove = false;
            this.shadow.style.display = "none";
            this.toggleBodyStyles(this.isOpen);
            this.drawer.classList.remove( 'show' )

        } );

        animation = null;
        this.eventHandler.close();
    }

    /**
     * event
     * @param event
     * @param callback
     */
    on( event, callback ) {
        this.eventHandler[ event ] = callback;
    }

    defaultEvents() {
        this.eventHandler = {};
        this.eventHandler.open = function() {};
        this.eventHandler.close = function() {};
        this.eventHandler.click = function() {};
    }

    initTriggerButton() {
        document.querySelectorAll( `[data-swipe-drawer="#${this.id}"]` ).forEach( ( i ) => {
            i.addEventListener( 'click', ( e ) => {
                e.preventDefault();
                this.open()
            } )
        } )
    }
}

SwipeableDrawer.utils = {};
SwipeableDrawer.utils.animate = ( draw, duration, timing ) => {

    let start,
        running = true,
        finish = () => {};

    if ( !timing ) timing = ( n ) => {
        return n
    }

    const animate = ( time ) => {
        // timeFraction va de 0 a 1
        let timeFraction = (time - start) / duration;
        if ( timeFraction > 1 ) timeFraction = 1;

        let progress = timing( timeFraction )

        draw( progress );

        if ( timeFraction < 1 && running ) window.requestAnimationFrame( animate ); else finish();
    }

    return {
        start : function() {
            running = true;
            start = performance.now();
            window.requestAnimationFrame( animate );
            return this;
        },
        stop : function() {
            running = false;
            return this;
        },
        finish : function( fn ) {
            finish = fn;
            return this;
        },
    }
}

export default SwipeableDrawer;
