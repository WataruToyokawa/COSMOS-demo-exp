'use strict';

import {fieldHeight
	, fieldWidth
	, cell_size_x
    , cell_size_y
	, field_x_floor
	, field_y_floor
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
		this.popup = popup

		if (this.pointer_x > 0 & this.pointer_x < fieldWidth) {
			popup_x = Math.floor( this.pointer_x / cell_size_x) * cell_size_x + cell_size_x / 2 + field_x_floor
		} else if (this.pointer_x <= 0) {
			popup_x = cell_size_x / 2 + field_x_floor
		} else {
			popup_x = Math.floor( fieldWidth / cell_size_x) * cell_size_x - cell_size_x / 2 + field_x_floor
		}

		if (this.pointer_y > 0 & this.pointer_y < fieldHeight) {
			popup_y = Math.floor( this.pointer_y / cell_size_y) * cell_size_y + cell_size_y / 2 + field_y_floor
		} else if (this.pointer_y <= 0) {
			popup_y = cell_size_y / 2 + field_y_floor
		} else {
			popup_y = Math.floor( fieldHeight / cell_size_y) * cell_size_y - cell_size_y / 2 + field_y_floor
		}

		this.popup = this.add.rectangle(popup_x, popup_y, cell_size_x, cell_size_y); //.setInteractive({ cursor: 'pointer' })
		this.popup.setFillStyle(0x6666ff, 0.6);

	}

	update(){

	}
}

export default SceneDebugPopup;