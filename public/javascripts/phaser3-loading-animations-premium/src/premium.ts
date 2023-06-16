import Phaser from 'phaser'

import PremiumSpinners from './scenes/PremiumSpinners'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'premium-spinners',
	width: 960,
	height: 540,
	backgroundColor: '#421278',
	scale: {
		mode: Phaser.Scale.ScaleModes.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	scene: [PremiumSpinners]
}

export default new Phaser.Game(config)
