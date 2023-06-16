import Phaser from 'phaser'
import CircleSpin, { IAnimationConfig } from './CircleSpin'

export default class CircleSpinColors extends CircleSpin
{
	static create(scene: Phaser.Scene, x: number, y: number, radius = 64, color: number = 0xffffff)
	{
		return new CircleSpinColors(scene, x, y, radius, color)
	}

	private colors: number[] = []
	private colorIndex = 0

	constructor(scene: Phaser.Scene, x: number, y: number, radius = 64, color: number = 0xffffff)
	{
		super(scene, x, y, radius, color)

		this.colors.push(color)
	}

	useColor(color: number)
	{
		this.colors = [color]
		this.colorIndex = 0

		return this
	}

	useColors(...colors: number[])
	{
		this.colors = colors.slice()
		this.colorIndex = 0

		return this
	}

	make(config: IAnimationConfig = {})
	{
		if (this.circle)
		{
			this.circle.destroy()
		}

		const color = this.getColor()
		
		this.circle = this.scene.add.circle(this.x, this.y, this.radius, color, 1)

		if (this.timeline)
		{
			this.timeline.destroy()
		}

		const {
			loopDelay = 0,
			spins = 10
		} = config

		this.timeline = this.scene.tweens.timeline({
			loop: -1,
			loopDelay
		})

		const fastSpins = Math.floor(spins * 0.8)
		const slowSpins = spins - fastSpins
		let duration = 300

		for (let i = 0; i < fastSpins; ++i)
		{
			this.timeline.add({
				targets: this.circle,
				scaleX: 0,
				ease: Phaser.Math.Easing.Sine.InOut,
				duration,
				onComplete: () => {
					this.circle!.setFillStyle(this.getColor())
				}
			})
			.add({
				targets: this.circle,
				scaleX: 1,
				ease: Phaser.Math.Easing.Sine.InOut,
				duration
			})
			
			if (duration > 100)
			{
				duration *= 0.5
			}
		}

		for (let i = 0; i < slowSpins; ++i)
		{
			duration *= 2

			this.timeline.add({
				targets: this.circle,
				scaleX: 0,
				ease: Phaser.Math.Easing.Sine.InOut,
				duration,
				onComplete: () => {
					this.circle!.setFillStyle(this.getColor())
				}
			})
			.add({
				targets: this.circle,
				scaleX: 1,
				ease: Phaser.Math.Easing.Sine.InOut,
				duration
			})
		}

		return this
	}

	private getColor()
	{
		if (this.colorIndex > this.colors.length - 1)
		{
			this.colorIndex = 0
		}

		const color = this.colors[this.colorIndex]

		++this.colorIndex

		return color
	}
}