import type Phaser from 'phaser'

export default class Fidget
{
	static create(scene: Phaser.Scene, x: number, y: number, size?: number)
	{
		return new Fidget(scene, x, y, size)
	}

	private scene: Phaser.Scene
	private position = { x: 0, y: 0 }
	private size = 72

	private backgroundColor = 0xffffff
	private color1 = 0xff0000
	private color2 = 0x00ff00
	private color3 = 0x0000ff

	private graphics?: Phaser.GameObjects.Graphics

	set x(value: number)
	{
		this.position.x = value
	}

	get x()
	{
		return this.position.x
	}

	set y(value: number)
	{
		this.position.y = value
	}

	get y()
	{
		return this.position.y
	}

	constructor(scene: Phaser.Scene, x: number, y: number, size = 72)
	{
		this.scene = scene
		this.x = x
		this.y = y
		this.size = size
	}

	useBackground(color: number)
	{
		this.backgroundColor = color
		return this
	}

	useColors(color1: number, color2?: number, color3?: number)
	{
		this.color1 = color1
		this.color2 = color2 ?? color1
		this.color3 = color3 ?? color2 ?? color1
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
		const { x, y } = this.position

		const halfSize = this.size * 0.5
		const height = (this.size * Math.sqrt(3)) * 0.5
		const radius = this.size * 0.3
		const innerRadius = this.size * 0.225

		// simulate the centroid instead of calcuating it
		const tp = 0.66
		const bp = 0.34

		this.graphics = this.scene.add.graphics({ x, y })
		this.graphics.fillStyle(this.backgroundColor, 1)
		this.graphics.fillTriangle(
			0, -height * tp,
			-halfSize, height * bp,
			halfSize, height * bp,
		)

		this.graphics.fillCircle(0, -height * tp * 0.9, radius)
		this.graphics.fillCircle(-halfSize * 0.9, height * bp * 0.9, radius)
		this.graphics.fillCircle(halfSize * 0.9, height * bp * 0.9, radius)

		this.graphics.fillStyle(this.color1)
		this.graphics.fillCircle(0, -height * tp * 0.9, innerRadius)
		this.graphics.fillStyle(this.color2)
		this.graphics.fillCircle(-halfSize * 0.9, height * bp * 0.9, innerRadius)
		this.graphics.fillStyle(this.color3)
		this.graphics.fillCircle(halfSize * 0.9, height * bp * 0.9, innerRadius)
		
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
			duration: 1000 / revolutionsPerSecond
		})

		return this
	}
}
