import Ellipsis from '../basic/Ellipsis'

export default class EllipsisColors extends Ellipsis
{
	static create(scene: Phaser.Scene, x: number, y: number, color = 0xffffff)
	{
		return new EllipsisColors(scene, x, y, color)
	}

	private colors: number[] = []
	private colorIndex = 0

	constructor(scene: Phaser.Scene, x: number, y: number, color = 0xffffff)
	{
		super(scene, x, y, color)

		this.colors.push(color)
	}

	useColor(color: number)
	{
		this.colors = [color]
		return this
	}

	useColors(...colors: number[])
	{
		this.colors = colors.slice()
		return this
	}

	make()
	{
		super.make()

		this.dots.forEach(dot => dot.fillColor = this.getColor())

		return this
	}

	play(speedMultiplier = 1)
	{
		super.play(speedMultiplier)

		return this
	}

	protected handleOnLoop(timeline: Phaser.Tweens.Timeline)
	{
		for (let i = this.dots.length - 1; i > 0; --i)
		{
			this.dots[i].fillColor = this.dots[i - 1].fillColor
		}

		this.dots[0].fillColor = this.getColor()
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