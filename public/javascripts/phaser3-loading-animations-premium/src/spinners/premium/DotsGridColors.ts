import DotsGrid from './DotsGrid'

export default class DotsGridColors extends DotsGrid
{
	static create(scene: Phaser.Scene, x: number, y: number, width = 128, height = 128, color = 0xffffff)
	{
		return new DotsGridColors(scene, x, y, width, height, color)
	}

	private colors: number[] = []
	private colorIndex = 0

	constructor(scene: Phaser.Scene, x: number, y: number, width = 128, height = 128, color = 0xffffff)
	{
		super(scene, x, y, width, height, color)

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

		for (let i = 0; i < this.ordering.length; ++i)
		{
			const color = this.getColor()
			const group = this.ordering[i]
			for (let j = 0; j < group.length; ++j)
			{
				const dot = this.dots[group[j]]
				dot.fillColor = color
			}
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
