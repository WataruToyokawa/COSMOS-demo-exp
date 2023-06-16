import Phaser from 'phaser'
import BezierEasing from 'bezier-easing'

const clone = (curve: Phaser.Curves.CubicBezier, angle: number = 0) => {
	return new Phaser.Curves.CubicBezier(
		curve.p0.clone().rotate(Phaser.Math.DEG_TO_RAD * angle),
		curve.p1.clone().rotate(Phaser.Math.DEG_TO_RAD * angle),
		curve.p2.clone().rotate(Phaser.Math.DEG_TO_RAD * angle),
		curve.p3.clone().rotate(Phaser.Math.DEG_TO_RAD * angle)
	)
}

export default class Ring
{
	static create(scene: Phaser.Scene, x: number, y: number, radius = 64, color = 0xffffff)
	{
		return new Ring(scene, x, y, radius, color)
	}

	protected scene: Phaser.Scene
	protected position = { x: 0, y: 0 }
	protected radius = 64
	protected lineWidth = 8

	private color = 0xffffff

	private graphics?: Phaser.GameObjects.Graphics
	private timeline?: Phaser.Tweens.Timeline
	private curve?: Phaser.Curves.CubicBezier

	private angle = 90
	private rotation = 0

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

	set y(v)
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

		this.lineWidth = radius * 0.25
	}

	useLineWidth(width: number)
	{
		this.lineWidth = width

		return this
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
		const radius = this.radius

		const c = 0.551915024494
		const start = new Phaser.Math.Vector2(-radius, 0)
		const c1 = new Phaser.Math.Vector2(-radius, -radius * c)
		const c2 = new Phaser.Math.Vector2(-radius * c, -radius)
		const end = new Phaser.Math.Vector2(0, -radius)

		this.curve = new Phaser.Curves.CubicBezier(start, c1, c2, end)

		this.graphics = this.scene.add.graphics({ x, y })
		this.graphics.angle = 45

		this.setAngle(90)

		return this
	}

	play(duration = 700)
	{
		if (!this.graphics)
		{
			this.make()
		}

		if (this.timeline)
		{
			this.timeline.destroy()
		}

		const obj = { count: 90 }

		this.timeline = this.scene.tweens.timeline({
			loop: -1,
			onLoop: () => {
				this.rotation = 0
			}
		})

		this.timeline.add({
			targets: obj,
			count: 320,
			duration,
			ease: BezierEasing(0.5, 0, 0.5, 1),
			onUpdate: (tween) => {
				const v = tween.getValue()
				this.setAngle(v)
			}
		})
		.add({
			targets: obj,
			count: 90,
			duration: duration * 0.8,
			ease: BezierEasing(0.5, 0, 0.5, 1),
			onUpdate: (tween) => {
				const v = tween.getValue()
				this.setAngleInverse(v)
			}
		})
		.add({
			targets: this,
			rotation: 130,
			duration: 1000,
			offset: duration * 0.4,
			ease: BezierEasing(0.5, 0, 0.5, 1)
		})

		this.timeline.play()

		return this
	}

	private setAngle(angle: number)
	{
		if (!this.graphics || !this.curve)
		{
			return
		}
		
		if (angle < 90)
		{
			this.angle = 90
		}
		else if (angle > 330)
		{
			this.angle = 330
		}
		else
		{
			this.angle = angle
		}

		this.graphics.clear()
		this.graphics.lineStyle(this.lineWidth, this.color, 1)

		if (this.angle <= 90)
		{
			const c1 = clone(this.curve, this.rotation)
			c1.draw(this.graphics)
		}
		else if (this.angle <= 170)
		{
			const c1 = clone(this.curve)
			c1.draw(this.graphics)

			const c2 = clone(this.curve, this.angle - 90 + this.rotation)
			c2.draw(this.graphics)
		}
		else if (this.angle <= 250)
		{
			const c1 = clone(this.curve, this.rotation)
			c1.draw(this.graphics)

			const c2 = clone(this.curve, 80 + this.rotation)
			c2.draw(this.graphics)

			const c3 = clone(this.curve, this.angle - 90 + this.rotation)
			c3.draw(this.graphics)
		}
		else if (this.angle <= 330)
		{
			const c1 = clone(this.curve, this.rotation)
			c1.draw(this.graphics)

			const c2 = clone(this.curve, 80 + this.rotation)
			c2.draw(this.graphics)

			const c3 = clone(this.curve, 160 + this.rotation)
			c3.draw(this.graphics)

			const c4 = clone(this.curve, this.angle - 90 + this.rotation)
			c4.draw(this.graphics)
		}
	}

	private setAngleInverse(angle: number, max = 320)
	{
		if (!this.graphics || !this.curve)
		{
			return
		}
		
		if (angle < 90)
		{
			this.angle = 90
		}
		else if (angle > 330)
		{
			this.angle = 330
		}
		else
		{
			this.angle = angle
		}

		this.graphics.clear()
		this.graphics.lineStyle(this.lineWidth, this.color, 1)

		const inverseAngle = max - this.angle

		if (inverseAngle <= 90)
		{
			const c1 = clone(this.curve, inverseAngle + this.rotation)
			c1.draw(this.graphics)

			const c2 = clone(this.curve, 80 + this.rotation)
			c2.draw(this.graphics)

			const c3 = clone(this.curve, 160 + this.rotation)
			c3.draw(this.graphics)

			const c4 = clone(this.curve, max - 90 + this.rotation)
			c4.draw(this.graphics)
		}
		else if (inverseAngle <= 170)
		{
			const c1 = clone(this.curve, inverseAngle + this.rotation)
			c1.draw(this.graphics)

			const c3 = clone(this.curve, 160 + this.rotation)
			c3.draw(this.graphics)

			const c4 = clone(this.curve, max - 90 + this.rotation)
			c4.draw(this.graphics)
		}
		else if (inverseAngle <= 250)
		{
			const c1 = clone(this.curve, inverseAngle + this.rotation)
			c1.draw(this.graphics)

			const c4 = clone(this.curve, max - 90 + this.rotation)
			c4.draw(this.graphics)
		}
		else if (inverseAngle <= 330)
		{
			const c1 = clone(this.curve, inverseAngle + this.rotation)
			c1.draw(this.graphics)
		}
	}
}
