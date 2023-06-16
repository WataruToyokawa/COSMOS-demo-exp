import Phaser from 'phaser'
import BezierEasing from 'bezier-easing'

export default class HeartBeat
{
	static create(scene: Phaser.Scene, x: number, y: number, color = 0xffffff, width = 128, height = 128)
	{
		return new HeartBeat(scene, x, y, color, width, height)
	}

	private scene: Phaser.Scene
	private position = { x: 0, y: 0 }
	private width = 128
	private height = 128
	private color = 0xffffff

	private graphics?: Phaser.GameObjects.Graphics
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

	constructor(scene: Phaser.Scene, x: number, y: number, color = 0xffffff, width = 128, height = 128)
	{
		this.scene = scene
		this.position.x = x
		this.position.y = y
		this.width = width
		this.height = height
		this.color = color
	}

	useColor(color: number)
	{
		this.color = color
		return this
	}

	useWidth(width: number)
	{
		this.width = width
		return this
	}

	useHeight(height: number)
	{
		this.height = height
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
		const { x, y } = this.position
		const halfWidth = this.width * 0.5
		const halfHeight = this.height * 0.5

		const halfLineWidth = 4

		const curve = new Phaser.Curves.Path()
		curve.moveTo(0, halfHeight)
		curve.splineTo([
			new Phaser.Math.Vector2(-halfWidth, -halfHeight * 0.3),
			new Phaser.Math.Vector2(-halfWidth * 0.5, -halfHeight),
			new Phaser.Math.Vector2(0, -halfHeight * 0.55)
		])
		curve.moveTo(-halfLineWidth, -halfHeight * 0.55)
		curve.splineTo([
			new Phaser.Math.Vector2(halfWidth * 0.5, -halfHeight),
			new Phaser.Math.Vector2(halfWidth, -halfHeight * 0.3),
			new Phaser.Math.Vector2(-halfLineWidth, halfHeight)
		])

		this.graphics = this.scene.add.graphics({ x, y })
		this.graphics.fillStyle(this.color, 1)
		this.graphics.fillPoints(curve.getPoints())
		
		return this
	}

	play()
	{
		if (!this.graphics)
		{
			this.make()
		}

		if (this.timeline)
		{
			this.timeline.destroy()
		}

		this.timeline = this.scene.tweens.timeline({
			onStart: () => {
				this.graphics!.scale = 0.95
			},
			loop: -1,
			loopDelay: 100
		})

		const ease = BezierEasing(0.215, 0.61, 0.355, 1)

		this.timeline.add({
			targets: this.graphics,
			scale: 1.2,
			duration: 100,
			ease
		})
		.add({
			targets: this.graphics,
			scale: 0.85,
			duration: 300,
			ease
		})
		.add({
			targets: this.graphics,
			scale: 1,
			duration: 200,
			ease
		})
		.add({
			targets: this.graphics,
			scale: 0.95,
			duration: 100,
			ease
		})
		.add({
			targets: this.graphics,
			scale: 0.9,
			duration: 200,
			ease
		})

		this.timeline.play()

		return this
	}
}
