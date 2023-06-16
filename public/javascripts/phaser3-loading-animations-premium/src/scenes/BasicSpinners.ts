import Phaser from 'phaser'
import { Primary } from '../colors'

import TripleBars from '../spinners/basic/TripleBars'
import CircleBars from '../spinners/basic/CircleBars'
import Ellipsis from '../spinners/basic/Ellipsis'

export default class BasicSpinners extends Phaser.Scene
{
	constructor()
	{
		super('basic-spinners')
	}

	create()
	{
		const { width, height } = this.scale

		TripleBars.create(this, width * 0.25, height * 0.4)
			.play()

		CircleBars.create(this, width * 0.5, height * 0.4)
			.play()

		Ellipsis.create(this, width * 0.75, height * 0.4)
			.play()

		this.displayName('Triple Bars', width * 0.25, height * 0.4)
		this.displayName('Circle Bars', width * 0.5, height * 0.4)
		this.displayName('Ellipsis', width * 0.75, height * 0.4)

		this.createMenu()
	}

	private createMenu()
	{
		const { height } = this.scale

		const banner = this.add.rectangle(0, height, 175, 40, Primary)
			.setOrigin(0, 1)
		this.add.text(banner.x + 20, height - 20, 'Basic Spinners')
			.setOrigin(0, 0.5)
	}

	private displayName(name: string, x: number, y: number)
	{
		this.add.text(x, y + 100, name).setOrigin(0.5)
	}
}
