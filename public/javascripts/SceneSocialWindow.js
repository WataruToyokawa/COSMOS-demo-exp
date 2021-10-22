class SceneSocialWindow extends Phaser.Scene {

	constructor (){
	    super({ key: 'SceneSocialWindow', active: false });
	}

	preload(){
	}

	init (data) {
		this.previous_payoffs = data.previous_payoffs;
	}

	create(){
		// --- background ---
		let soci_window = this.add.rectangle(fieldWidth, 0, configWidth-fieldWidth, fieldHeight);
		soci_window.setFillStyle(0xFFFFFF, 0.6).setOrigin(0, 0);

		// --- history window ---
		let social_info_list = {};
		for (let i = 0; i<4; i++)
		social_info_list[i] = this.add.text(fieldWidth, 100*i+16, 'Player '+(i+1)+'\n'+this.previous_payoffs[i], { fontSize: '25px', fill: '#000' });


	}

	update(){

	}
}

export default SceneSocialWindow;