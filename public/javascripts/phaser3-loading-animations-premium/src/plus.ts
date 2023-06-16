import Phaser from 'phaser'

import PlusSpinners from './scenes/PlusSpinners'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'plus-spinners',
	width: 960,
	height: 540,
	backgroundColor: '#421278',
	scale: {
		mode: Phaser.Scale.ScaleModes.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	scene: [PlusSpinners]
}

export default new Phaser.Game(config)
