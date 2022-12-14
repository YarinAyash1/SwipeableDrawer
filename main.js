import './style.scss'
import SwipeableDrawer from "./src/SwipeableDrawer.class.js";

new SwipeableDrawer( 'drawer-menu', {
    duration : 200,
    position : "bottom",
    draggable : true,
} );
