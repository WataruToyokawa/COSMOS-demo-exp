import Phaser from 'phaser'

interface IAnimationConfig
{
	scale?: number
	scaleDuration?: number
	spacing?: number
}

export default class CircleDots
{
	static create(scene: Phaser.Scene, x: number, y: number, radius = 64, color = 0xffffff)
	{
		return new CircleDots(scene, x, y, radius, color)
	}

	private scene: Phaser.Scene
	private position = { x: 0, y: 0 }

	private radius = 64
	private dotRadius = 6
	private color = 0xffffff

	protected dots: Phaser.GameObjects.Arc[] = []
	private tweens: Phaser.Tweens.Tween[] = []
	private timerEvent?: Phaser.Time.TimerEvent

	get x()
	{
		return this.position.x
	}

	set x(v: number)
	{
		this.position.x = v
		this.layout()
	}

	get y()
	{
		return this.position.y
	}

	set y(v: number)
	{
		this.position.y = v
		this.layout()
	}

	get realRadius()
	{
		return this.radius - this.dotRadius
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

	useRadiusForDots(radius: number)
	{
		this.dotRadius = radius
		return this
	}

	setPosition(x: number, y: number)
	{
		this.position.x = x
		this.position.y = y
		this.layout()
		return this
	}

	addToContainer(container: Phaser.GameObjects.Container, x?: number, y?: number)
	{
		if (!container)
		{
			return this
		}

		if (this.dots.length <= 0)
		{
			this.make()
		}

		this.dots.forEach(dot => {
			container.add(dot)
		})

		if (x !== undefined && y !== undefined)
		{
			this.setPosition(x, y)
		}
		else if (x !== undefined)
		{
			this.x = x
		}
		else if (y !== undefined)
		{
			this.y = y
		}

		return this
	}

	make()
	{
		while (this.dots.length > 0)
		{
			this.dots.pop()!.destroy()
		}

		const { x, y } = this.position

		for (let i = 0; i < 12; ++i)
		{
			const dot = this.scene.add.circle(x, y, this.dotRadius, this.color, 1)
			this.dots.push(dot)
		}

		this.layout()

		return this
	}

	play(config: IAnimationConfig = {})
	{
		if (this.dots.length <= 0)
		{
			this.make()
		}

		while (this.tweens.length > 0)
		{
			this.tweens.pop()!.remove()
		}

		if (this.timerEvent)
		{
			this.timerEvent.remove()
			this.timerEvent.destroy()
		}

		const {
			scale = 1.4,
			scaleDuration = 300,
			spacing = scaleDuration / 3
		} = config

		let i = 0
		this.timerEvent = this.scene.time.addEvent({
			delay: spacing,
			loop: true,
			callback: () => {
				if (i < this.tweens.length)
				{
					const tween = this.tweens[i]
					tween.restart()
				}
				else
				{
					const dot = this.dots[i]

					const tween = this.scene.tweens.add({
						targets: dot,
						scale,
						duration: scaleDuration,
						yoyo: true,
					})

					this.tweens.push(tween)
				}

				++i

				if (i >= this.dots.length)
				{
					i = 0
				}
			}
		})

		return this
	}

	private layout()
	{
		let angle = 0
		const vec = new Phaser.Math.Vector2(0, 0)
		const { x, y } = this.position

		for (let i = 0; i < this.dots.length; ++i)
		{
			vec.setToPolar(Phaser.Math.DEG_TO_RAD * angle, this.realRadius)

			const dot = this.dots[i]
			dot.x = x + vec.x
			dot.y = y + vec.y

			angle += 30
		}
	}
}
