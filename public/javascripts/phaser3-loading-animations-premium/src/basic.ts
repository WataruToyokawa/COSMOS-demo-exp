import Phaser from 'phaser'

import BasicSpinners from './scenes/BasicSpinners'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'basic-spinners',
	width: 960,
	height: 540,
	backgroundColor: '#421278',
	scale: {
		mode: Phaser.Scale.ScaleModes.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	scene: [BasicSpinners]
}

export default new Phaser.Game(config)
