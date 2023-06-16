import Phaser from 'phaser'

export default class DualRing
{
	static create(scene: Phaser.Scene, x: number, y: number, radius: number = 64, color: number = 0xffffff)
	{
		return new DualRing(scene, x, y, radius, color)
	}

	protected container?: Phaser.GameObjects.Container

	protected scene: Phaser.Scene
	protected position = { x: 0, y: 0 }
	protected radius = 64
	private color = 0xffffff

	protected graphics?: Phaser.GameObjects.Graphics

	protected lineWidth = 8

	set x(value: number)
	{
		this.position.x = value
		this.graphics?.setX(value)
	}

	get x()
	{
		return this.position.x
	}

	set y(value: number)
	{
		this.position.y = value
		this.graphics?.setY(value)
	}

	get y()
	{
		return this.position.y
	}

	constructor(scene: Phaser.Scene, x: number, y: number, radius: number = 64, color: number = 0xffffff)
	{
		this.scene = scene
		this.position.x = x
		this.position.y = y
		this.radius = radius
		
		this.useColor(color)

		this.lineWidth = radius * 0.25
	}

	useColor(color: number)
	{
		this.color = color

		return this
	}

	useLineWidth(width: number)
	{
		this.lineWidth = width
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

		container.add(this.graphics!)

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
		if (this.graphics)
		{
			this.graphics.destroy()
		}

		const radius = this.radius - this.lineWidth * 0.5

		const curve1 = new Phaser.Curves.CubicBezier(
			new Phaser.Math.Vector2(-radius, 0),
			new Phaser.Math.Vector2(-radius, -radius * 0.5),
			new Phaser.Math.Vector2(-radius * 0.5, -radius),
			new Phaser.Math.Vector2(0, -radius)
		)

		const curve2 = new Phaser.Curves.CubicBezier(
			new Phaser.Math.Vector2(radius, 0),
			new Phaser.Math.Vector2(radius, radius * 0.5),
			new Phaser.Math.Vector2(radius * 0.5, radius),
			new Phaser.Math.Vector2(0, radius)
		)

		this.graphics = this.scene.add.graphics({
			x: this.x, y: this.y
		})
		this.graphics.lineStyle(this.lineWidth, this.color, 1)
		curve1.draw(this.graphics)
		curve2.draw(this.graphics)

		return this
	}

	play(revolutionsPerSecond = 0.5)
	{
		if (!this.graphics)
		{
			this.make()
		}

		if (this.scene.tweens.isTweening(this.graphics!))
		{
			this.scene.tweens.killTweensOf(this.graphics!)
		}

		this.scene.add.tween({
			targets: this.graphics,
			angle: 360,
			repeat: -1,
			duration: 1000 / revolutionsPerSecond
		})

		return this
	}
}
