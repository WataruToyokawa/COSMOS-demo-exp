import Phaser from 'phaser'
import { Rainbow, Primary } from '../colors'

import TripleBarsColors from '../spinners/plus/TripleBarsColors'
import CircleBarsColors from '../spinners/plus/CircleBarsColors'
import EllipsisColors from '../spinners/plus/EllipsisColors'
import DualRing from '../spinners/plus/DualRing'
import Hourglass from '../spinners/plus/Hourglass'
import Ring from '../spinners/plus/Ring'

export default class PlusSpinners extends Phaser.Scene
{
	constructor()
	{
		super('plus-spinners')
	}

	create()
	{
		const { width, height } = this.scale

		TripleBarsColors.create(this, width * 0.25, height * 0.2)
			.useColors(...Rainbow)
			.play()

		CircleBarsColors.create(this, width * 0.5, height * 0.2)
			.useColors(...Rainbow)
			.play()

		EllipsisColors.create(this, width * 0.75, height * 0.2)
			.useColors(...Rainbow)
			.play()

		DualRing.create(this, width * 0.25, height * 0.7)
			.play()

		Hourglass.create(this, width * 0.5, height * 0.7)
			.play()

		Ring.create(this, width * 0.75, height * 0.7)
			.play()

		this.displayName('Triple Bars Colors', width * 0.25, height * 0.2)
		this.displayName('Circle Bars Colors', width * 0.5, height * 0.2)
		this.displayName('Ellipsis Colors', width * 0.75, height * 0.2)

		this.displayName('Dual Ring', width * 0.25, height * 0.7)
		this.displayName('Hourglass', width * 0.5, height * 0.7)
		this.displayName('Ring', width * 0.75, height * 0.7)

		this.createMenu()
	}

	private createMenu()
	{
		const { height } = this.scale

		const banner = this.add.rectangle(0, height, 175, 40, Primary)
			.setOrigin(0, 1)
		this.add.text(banner.x + 20, height - 20, 'Plus Spinners')
			.setOrigin(0, 0.5)
	}

	private displayName(name: string, x: number, y: number)
	{
		this.add.text(x, y + 100, name).setOrigin(0.5)
	}
}
