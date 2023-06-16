import Phaser from 'phaser'
import BezierEasing from 'bezier-easing'

export interface IAnimationConfig
{
	loopDelay?: number
}

export default class Hourglass
{
	static create(scene: Phaser.Scene, x: number, y: number, radius = 64, color = 0xffffff)
	{
		return new Hourglass(scene, x, y, radius, color)
	}

	protected scene: Phaser.Scene
	protected position = { x: 0, y: 0 }
	protected radius = 64
	private color = 0xffffff

	protected graphics?: Phaser.GameObjects.Graphics
	private timeline?: Phaser.Tweens.Timeline

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

		const { x, y } = this.position

		this.graphics = this.scene.add.graphics({ x, y })
		const radius = this.radius

		const curve1 = new Phaser.Curves.Path(0, 0)
		curve1.lineTo(-radius, 0)
		curve1.cubicBezierTo(
			new Phaser.Math.Vector2(-radius, -radius * 0.5),
			new Phaser.Math.Vector2(-radius * 0.5, -radius),
			new Phaser.Math.Vector2(0, -radius)
		)
		curve1.lineTo(0, 0)

		const curve2 = new Phaser.Curves.Path(0, 0)
		curve2.lineTo(0, radius)
		curve2.cubicBezierTo(
			new Phaser.Math.Vector2(radius * 0.5, radius),
			new Phaser.Math.Vector2(radius, radius * 0.5),
			new Phaser.Math.Vector2(radius, 0),
		)
		curve2.lineTo(0, 0)

		const rotation = Phaser.Math.DEG_TO_RAD * 45

		this.graphics.fillStyle(this.color, 1)
		const points1 = curve1.getPoints().map(pt => pt.rotate(rotation))
		this.graphics.fillPoints(points1)

		const points2 = curve2.getPoints().map(pt => pt.rotate(rotation))
		this.graphics.fillPoints(points2)

		return this
	}

	play(config: IAnimationConfig = {})
	{
		if (!this.graphics)
		{
			this.make()
		}

		if (this.timeline)
		{
			this.timeline.destroy()
		}

		const {
			loopDelay = 0,
		} = config

		this.timeline = this.scene.tweens.timeline({
			loop: -1,
			loopDelay
		})

		let duration = 600

		this.timeline.add({
			targets: this.graphics,
			angle: 360,
			ease: BezierEasing(0.55, 0.055, 0.675, 0.19),
			duration: 500
		})

		this.timeline.add({
			targets: this.graphics,
			angle: 1440,
			duration
		})

		this.timeline.add({
			targets: this.graphics,
			angle: 360,
			ease: BezierEasing(0.215, 0.61, 0.355, 1),
			duration: 500
		})

		this.timeline.play()

		return this
	}
}
