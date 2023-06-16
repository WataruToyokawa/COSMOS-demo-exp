export default class Ripple
{
	static create(scene: Phaser.Scene, x: number, y: number, radius = 64, color = 0xffffff)
	{
		return new Ripple(scene, x, y, radius, color)
	}

	protected scene: Phaser.Scene
	protected position = { x: 0, y: 0 }
	protected radius = 64
	private color = 0xffffff

	protected lineWidth = 8
	protected duration = 1000
	protected ringCount = 2
	protected startingScale = 0.01

	protected rings: Phaser.GameObjects.Arc[] = []

	get x()
	{
		return this.position.x
	}

	set x(value)
	{
		this.position.x = value
		this.rings.forEach(ring => {
			ring.x = value
		})
	}

	get y()
	{
		return this.position.y
	}

	set y(value)
	{
		this.position.y = value
		this.rings.forEach(ring => {
			ring.y = value
		})
	}

	constructor(scene: Phaser.Scene, x: number, y: number, radius = 64, color = 0xffffff)
	{
		this.scene = scene
		this.position.x = x
		this.position.y = y
		this.radius = radius
		this.color = color
		this.lineWidth = radius * 0.1
	}

	useColor(color: number)
	{
		this.color = color
		return this
	}

	useDuration(duration: number)
	{
		this.duration = duration
		return this
	}

	useRings(ringCount: number)
	{
		this.ringCount = ringCount
		return this
	}

	addToContainer(container: Phaser.GameObjects.Container, x?: number, y?: number)
	{
		if (!container)
		{
			return this
		}

		if (this.rings.length <= 0)
		{
			this.make()
		}

		this.rings.forEach(ring => {
			container.add(ring)

			if (x !== undefined)
			{
				this.x = x
			}

			if (y !== undefined)
			{
				this.y = y
			}
		})
		
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
			const ring = this.scene.add.circle(x, y, this.radius, this.color, 0)
				.setStrokeStyle(lineWidth / scale, this.color, 1)
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
					ring.alpha = 0
					ring.scale = scale
					ring.setStrokeStyle(lineWidth / scale, ring.strokeColor, 1)
				},
				delay: i * interval,
				duration,
				repeat: -1
			})
		})

		return this
	}
}
