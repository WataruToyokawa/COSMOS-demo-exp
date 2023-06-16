import Phaser from 'phaser'

export default class Sunny
{
	static create(scene: Phaser.Scene, x: number, y: number, radius = 64, color = 0xffffff)
	{
		return new Sunny(scene, x, y, radius, color)
	}

	private scene: Phaser.Scene
	private position = { x: 0, y: 0 }
	private radius = 64
	private color = 0xffffff

	private raySize = 20
	private raysCount = 12
	private rayColors = [0xffffff]
	private rayColorIndex = 0
	private rayGap = 2

	private graphics?: Phaser.GameObjects.Graphics

	get x()
	{
		return this.position.x
	}

	set x(v: number)
	{
		this.position.x = v
		if (this.graphics)
		{
			this.graphics.x = v
		}
	}

	get y()
	{
		return this.position.y
	}

	set y(v: number)
	{
		this.position.y = v
		if (this.graphics)
		{
			this.graphics.y = v
		}
	}

	constructor(scene: Phaser.Scene, x: number, y: number, radius = 64, color = 0xffffff)
	{
		this.scene = scene
		this.position.x = x
		this.position.y = y
		this.radius = radius
		this.color = color
	}

	useColor(color: number)
	{
		this.color = color
		return this
	}

	useRayColor(...colors: number[])
	{
		this.rayColors = colors.slice()
		return this
	}

	useRaysCount(count: number)
	{
		this.raysCount = count
		return this
	}

	useRaySize(size: number)
	{
		this.raySize = size
		return this
	}

	useRayGap(gap: number)
	{
		this.rayGap = gap
		return this
	}

	addToContainer(container: Phaser.GameObjects.Container, x?: number, y?: number)
	{
		if (!container)
		{
			return this
		}

		if (!this.graphics)
		{
			this.make()
		}

		if (this.graphics)
		{
			container.add(this.graphics)
		}

		if (x !== undefined)
		{
			this.x = x
		}

		if (y !== undefined)
		{
			this.y = y
		}

		return this
	}

	make()
	{
		this.graphics?.destroy()

		const { x, y } = this.position

		this.graphics = this.scene.add.graphics({ x, y})

		const radius = this.radius - this.raySize

		this.graphics.fillStyle(this.color, 1)
		this.graphics.fillCircle(0, 0, radius)

		let angle = -90
		const vec = new Phaser.Math.Vector2(0, 0)
		const len = radius + this.raySize * 0.5 + this.rayGap
		const interval = 360 / this.raysCount

		for (let i = 0; i < this.raysCount; ++i)
		{
			vec.setToPolar(angle * Phaser.Math.DEG_TO_RAD, len)

			this.graphics.fillStyle(this.getRayColor(), 1)
			this.createTriangle(this.graphics, vec.x, vec.y, 90 + angle)
			
			angle += interval
		}

		return this
	}

	play(revolutionsPerSecond = 1)
	{
		if (!this.graphics)
		{
			this.make()
		}

		if (this.scene.tweens.isTweening(this.graphics!))
		{
			this.scene.tweens.killTweensOf(this.graphics!)
		}

		this.scene.tweens.add({
			targets: this.graphics,
			angle: 360,
			repeat: -1,
			duration: 3000 / revolutionsPerSecond
		})

		return this
	}

	private createTriangle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, angle = 0)
	{
		const triangleWidth = this.raySize
		const triangleHalfWidth = triangleWidth * 0.5
		const triangleQuarterWidth = triangleHalfWidth
		const triangleHeight = this.raySize
		const triangleHalfHeight = triangleHeight * 0.5

		const rotation = angle * Phaser.Math.DEG_TO_RAD
		const pt1 = new Phaser.Math.Vector2(x + triangleQuarterWidth, y + triangleHalfHeight)
		Phaser.Math.RotateAround(pt1, x, y, rotation)

		const pt2 = new Phaser.Math.Vector2(x, y - triangleHalfHeight)
		Phaser.Math.RotateAround(pt2, x, y, rotation)

		const pt3 = new Phaser.Math.Vector2(x - triangleQuarterWidth, y + triangleHalfHeight)
		Phaser.Math.RotateAround(pt3, x, y, rotation)
			

		graphics.fillTriangle(
			pt1.x, pt1.y,
			pt2.x, pt2.y,
			pt3.x, pt3.y
		)
	}

	private getRayColor()
	{
		if (this.rayColorIndex > this.rayColors.length - 1)
		{
			this.rayColorIndex = 0
		}

		const color = this.rayColors[this.rayColorIndex]

		++this.rayColorIndex

		return color
	}
}
