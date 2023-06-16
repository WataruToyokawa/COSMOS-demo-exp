import Ripple from './Ripple'

export default class RippleColors extends Ripple
{
	static create(scene: Phaser.Scene, x: number, y: number, radius = 64, color = 0xffffff)
	{
		return new RippleColors(scene, x, y, radius, color)
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
		this.colorIndex = 0

		return this
	}

	useColors(...colors: number[])
	{
		this.colors = colors.slice()
		this.colorIndex = 0

		return this
	}

	make()
	{
		this.rings.forEach(ring => ring.destroy())
		this.rings.length = 0

		const { x, y } = this.position

		const lineWidth = this.lineWidth
		const scale = this.startingScale

		for (let i = 0; i < this.ringCount; ++i)
		{
			const color = this.getColor()
			const ring = this.scene.add.circle(x, y, this.radius, color, 0)
				.setStrokeStyle(lineWidth / scale, color, 1)
				.setScale(scale)
				.setAlpha(0)

			this.rings.push(ring)
		}
		
		return this
	}

	play()
	{
		if (this.rings.length <= 0)
		{
			this.make()
		}

		const lineWidth = this.lineWidth
		const scale = this.startingScale
		const duration = this.duration
		const rings = this.ringCount

		const interval = duration / rings

		const didRepeat: Record<number, number> = {}
		this.rings.forEach((ring, i) => {
			this.scene.add.tween({
				targets: ring,
				alpha: 0,
				scale: 1,
				onStart: () => {
					ring.alpha = 1
				},
				onUpdate: (tween) => {
					const v = 1 - tween.getValue()
					if (v <= 0)
					{
						return
					}
					ring.setStrokeStyle(lineWidth / v, ring.strokeColor, 1)
				},
				onRepeat: () => {
					if (!didRepeat[i]) {
						didRepeat[i] = 0
					}

					++didRepeat[i]

					if (didRepeat[i] === 2) {
						didRepeat[i] = 0
						return
					}

					ring.alpha = 0
					ring.scale = scale
					ring.setStrokeStyle(lineWidth / scale, this.getColor(), 1)
				},
				delay: i * interval,
				duration,
				repeat: -1
			})
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
