import CircleBars from '../basic/CircleBars'

export default class CircleBarsColors extends CircleBars
{
	static create(scene: Phaser.Scene, x: number, y: number, radius = 64, color = 0xffffff)
	{
		return new CircleBarsColors(scene, x, y, radius, color)
	}

	private colors: number[] = []
	private colorIndex = 0

	constructor(scene: Phaser.Scene, x: number, y: number, radius = 64, color = 0xffffff)
	{
		super(scene, x, y, radius, color)

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

		this.bars.forEach(bar => {
			bar.fillColor = this.getColor()
		})

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
