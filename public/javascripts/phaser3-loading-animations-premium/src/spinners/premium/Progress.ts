import Phaser from 'phaser'

export default class Progress
{
	static create(scene: Phaser.Scene, x: number, y: number, width?: number)
	{
		return new Progress(scene, x, y, width)
	}

	private scene: Phaser.Scene
	private position = { x: 0, y: 0 }
	private width = 128
	private height = 32
	private cornerRadius = 14

	private graphics?: Phaser.GameObjects.Graphics
	private mask?: Phaser.GameObjects.Graphics
	private bar?: Phaser.GameObjects.Rectangle

	private background = 0xffffff
	private progress = 0xff0000

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

	constructor(scene: Phaser.Scene, x: number, y: number, width = 128, height = 32)
	{
		this.scene = scene
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.cornerRadius = height * 0.5
	}

	useColors(background: number, progress: number)
	{
		this.background = background
		this.progress = progress
		return this
	}

	useCornerRadius(radius: number)
	{
		this.cornerRadius = radius
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
		if (this.bar)
		{
			container.add(this.bar)
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

		this.graphics = this.scene.add.graphics({ x, y })

		this.graphics.fillStyle(this.background)
		this.graphics.fillRoundedRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height, this.cornerRadius)

		this.mask = this.scene.make.graphics({ x, y })
		const w = this.width * 0.95
		const h = this.height * 0.8
		this.mask.fillStyle(this.background)
		this.mask.fillRoundedRect(-w * 0.5, -h * 0.5, w, h, this.cornerRadius * 0.95)
		
		this.bar = this.scene.add.rectangle(x - this.width, y, this.width, this.height, this.progress)
			.setOrigin(0.5)
		this.bar.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, this.mask))

		return this
	}

	play()
	{
		if (!this.graphics)
		{
			this.make()
		}

		if (this.scene.tweens.isTweening(this.bar!))
		{
			this.scene.tweens.killTweensOf(this.bar!)
		}

		this.scene.tweens.add({
			targets: this.bar,
			x: this.x + this.width + 20,
			repeat: -1,
			duration: 1000
		})

		return this
	}

	destroy()
	{
		if (this.scene.tweens.isTweening(this.bar!))
		{
			this.scene.tweens.killTweensOf(this.bar!)
		}

		this.mask?.destroy()
		this.bar?.destroy()
		this.graphics?.destroy()
	}
}