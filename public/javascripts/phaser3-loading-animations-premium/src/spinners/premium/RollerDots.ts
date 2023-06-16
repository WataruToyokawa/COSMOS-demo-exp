import Phaser from 'phaser'
import BezierEasing from 'bezier-easing'

interface IDotData
{
	display: Phaser.GameObjects.Arc
	angle: number
	startAngle: number
}

export default class RollerDots
{
	static create(scene: Phaser.Scene, x: number, y: number, radius = 64, color = 0xffffff)
	{
		return new RollerDots(scene, x, y, radius, color)
	}

	private scene: Phaser.Scene
	private position = { x: 0, y: 0 }

	private radius = 64
	private dotRadius = 5
	private color = 0xffffff

	protected dots: IDotData[] = []

	private timeline?: Phaser.Tweens.Timeline

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

	private get realRadius()
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

		this.dots.forEach(({ display }) => {
			container.add(display)
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

	setPosition(x: number, y: number)
	{
		this.position.x = x
		this.position.y = y
		this.layout()

		return this
	}

	make()
	{
		while (this.dots.length > 0)
		{
			this.dots.pop()!.display.destroy()
		}

		let angle = 45
		const { x, y } = this.position

		for (let i = 0; i < 8; ++i)
		{
			const dot = this.scene.add.circle(x, y, this.dotRadius, this.color, 1)
			this.dots.push({
				display: dot,
				angle,
				startAngle: angle
			})

			angle += 13
		}

		this.layout()

		return this
	}

	/**
	 * 
	 * @param duration Time in milliseconds for 1 animation loop
	 * @param spacing Time in milliseconds that each dot waits before moving
	 */
	play(duration = 1250, spacing = 25)
	{
		if (this.dots.length <= 0)
		{
			this.make()
		}

		if (this.timeline)
		{
			this.timeline.destroy()
		}

		this.timeline = this.scene.tweens.timeline({
			loop: -1,
			loopDelay: 100,
			onLoop: () => {
				this.dots.forEach(dot => {
					dot.angle = dot.startAngle
				})
			}
		})

		let offset = 0
		for (let i = this.dots.length - 1; i >= 0; --i)
		{
			const dot = this.dots[i]
			this.timeline.add({
				targets: dot,
				angle: dot.angle + 360,
				duration,
				ease: BezierEasing(0.5, 0, 0.5, 1),
				onUpdate: (tween, target: IDotData) => {
					const v = tween.getValue()
					const vec = new Phaser.Math.Vector2(0, 0)
				
					vec.setToPolar(Phaser.Math.DEG_TO_RAD * v, this.realRadius)
	
					const { x: sx, y: sy } = this.position
	
					target.display.x = sx + vec.x
					target.display.y = sy + vec.y
				},
				offset
			})

			offset += spacing
		}

		this.timeline.play()

		return this
	}

	private layout()
	{
		const vec = new Phaser.Math.Vector2(0, 0)
		const { x, y } = this.position

		for (let i = 0; i < this.dots.length; ++i)
		{
			const { angle, display } = this.dots[i]

			vec.setToPolar(Phaser.Math.DEG_TO_RAD * angle, this.realRadius)

			display.x = x + vec.x
			display.y = y + vec.y
		}
	}
}
