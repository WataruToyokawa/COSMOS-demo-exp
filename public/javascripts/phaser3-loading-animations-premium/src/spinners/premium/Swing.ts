import Phaser from 'phaser'

export default class Swing
{
	static create(scene: Phaser.Scene, x: number, y: number, width = 96, height = 96, color = 0xffffff)
	{
		return new Swing(scene, x, y, width, height, color)
	}

	private scene: Phaser.Scene
	private position = { x: 0, y: 0 }
	private width = 128
	private height = 128

	private leftDot?: Phaser.GameObjects.Arc
	private rightDot?: Phaser.GameObjects.Arc

	private leftDotColor = 0xffffff
	private rightDotColor = 0xffffff

	private leftDotTimeline?: Phaser.Tweens.Timeline
	private rightDotTimeline?: Phaser.Tweens.Timeline
	private timerEvent?: Phaser.Time.TimerEvent

	private duration = 400

	constructor(scene: Phaser.Scene, x: number, y: number, width = 96, height = 96, color = 0xffffff)
	{
		this.scene = scene
		this.position.x = x
		this.position.y = y
		this.width = width
		this.height = height

		this.leftDotColor = color
		this.rightDotColor = color
	}

	useColor(color: number)
	{
		this.leftDotColor = color
		this.rightDotColor = color
		return this
	}

	useColors(color1: number, color2: number)
	{
		this.leftDotColor = color1
		this.rightDotColor = color2 ?? color1
		return this
	}

	addToContainer(container: Phaser.GameObjects.Container, x?: number, y?: number)
	{
		if (!container)
		{
			return this
		}

		if (!this.leftDot || !this.rightDot)
		{
			this.make()
		}

		if (this.leftDot)
		{
			container.add(this.leftDot)
		}

		if (this.rightDot)
		{
			container.add(this.rightDot)
		}

		if (x !== undefined && y !== undefined)
		{
			this.position.x = x
			this.position.y = y
			this.layout()
			this.reconstructTimelines()
		}
		else if (x !== undefined)
		{
			this.position.x = x
			this.layout()
			this.reconstructTimelines()
		}
		else if (y !== undefined)
		{
			this.position.y = y
			this.layout()
			this.reconstructTimelines()
		}

		return this
	}

	make()
	{
		this.leftDot?.destroy()
		this.rightDot?.destroy()

		const quarterWidth = this.width * 0.25
		const radius = quarterWidth
		const { x, y } = this.position

		this.leftDot = this.scene.add.circle(x, y, radius, this.leftDotColor)
		this.rightDot = this.scene.add.circle(x, y, radius, this.rightDotColor)

		this.layout()

		return this
	}

	play(duration = 400)
	{
		if (!this.leftDot || !this.rightDot)
		{
			this.make()
		}

		this.duration = duration

		this.reconstructTimelines()

		return this
	}

	private reconstructTimelines()
	{
		if (this.leftDotTimeline)
		{
			this.leftDotTimeline.stop()
			this.leftDotTimeline.resetTweens(true)
			this.leftDotTimeline.destroy()
		}

		if (this.rightDotTimeline)
		{
			this.rightDotTimeline.stop()
			this.rightDotTimeline.resetTweens(true)
			this.rightDotTimeline.destroy()
		}

		if (this.timerEvent)
		{
			this.timerEvent.destroy()
		}

		const quarterWidth = this.width * 0.25
		const quarterHeight = this.height * 0.25

		this.leftDotTimeline = this.timelineForDot(this.leftDot!, quarterWidth, quarterHeight, this.duration)
		this.leftDotTimeline.play()

		this.rightDotTimeline = this.timelineForDot(this.rightDot!,  -quarterWidth, quarterHeight, this.duration)
		 this.timerEvent = this.scene.time.delayedCall(this.duration * 0.5, () => {
			this.rightDotTimeline!.play()
		})
	}

	private timelineForDot(dot: Phaser.GameObjects.Arc, dx: number, dy: number, duration: number)
	{
		const { x, y } = this.position
		const timeline = this.scene.tweens.timeline({
			loop: -1
		})

		const halfDuration = duration * 0.5

		timeline.add({
			targets: dot,
			x: x + dx,
			y: y + dy,
			ease: Phaser.Math.Easing.Sine.InOut,
			duration
		})

		timeline.add({
			targets: dot,
			scale: 0.2,
			ease: Phaser.Math.Easing.Sine.InOut,
			duration: halfDuration,
			offset: 0,
			yoyo: true
		})

		timeline.add({
			targets: dot,
			x: x - dx,
			y: y - dy,
			ease: Phaser.Math.Easing.Sine.InOut,
			duration,
			offset: duration
		})

		timeline.add({
			targets: dot,
			scale: 0.2,
			ease: Phaser.Math.Easing.Sine.InOut,
			duration: halfDuration,
			offset: duration,
			yoyo: true
		})

		return timeline
	}

	private layout()
	{
		const quarterWidth = this.width * 0.25
		const quarterHeight = this.height * 0.25
		const { x, y } = this.position

		if (this.leftDot)
		{
			this.leftDot.x = x - quarterWidth
			this.leftDot.y = y - quarterHeight
		}

		if (this.rightDot)
		{
			this.rightDot.x = x + quarterWidth
			this.rightDot.y = y - quarterHeight
		}
	}
}
