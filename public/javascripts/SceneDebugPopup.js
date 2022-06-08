'use strict';

import {configWidth
	, fieldHeight
	, fieldWidth
	, cell_size_x
    , cell_size_y
} from './global_const_values.js';

// import {testFunction
// } from './functions.js';

class SceneDebugPopup extends Phaser.Scene {

	constructor (){
	    super({ key: 'SceneDebugPopup', active: false });
	}

	preload(){
	}

	init (data) {
		this.pointer_x = data.x;
		this.pointer_y = data.y;
	}

	create(){
		let popup
		,	popup_x
		,	popup_y
		;

		if (this.pointer_x > 0 & this.pointer_x < fieldWidth) {
			popup_x = Math.floor( this.pointer_x / cell_size_x) * cell_size_x + cell_size_x / 2
		} else if (this.pointer_x <= 0) {
			popup_x = cell_size_x / 2
		} else {
			popup_x = Math.floor( fieldWidth / cell_size_x) * cell_size_x - cell_size_x / 2
		}

		if (this.pointer_y > 0 & this.pointer_y < fieldHeight) {
			popup_y = Math.floor( this.pointer_y / cell_size_y) * cell_size_y + cell_size_y / 2
		} else if (this.pointer_y <= 0) {
			popup_y = cell_size_y / 2
		} else {
			popup_y = Math.floor( fieldHeight / cell_size_y) * cell_size_y - cell_size_y / 2
		}

		popup = this.add.rectangle(popup_x, popup_y, cell_size_x, cell_size_y);
		popup.setFillStyle(0x6666ff, 0.6);

	}

	update(){

	}
}

export default SceneDebugPopup;