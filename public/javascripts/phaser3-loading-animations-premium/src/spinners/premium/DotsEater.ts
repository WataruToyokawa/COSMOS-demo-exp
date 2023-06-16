interface IAnimationConfig
{
	eatSpeedMultiplier?: number
	dotSpeedMultiplier?: number
}

export default class DotsEater
{
	static create(scene: Phaser.Scene, x: number, y: number, radius = 48, color = 0xffffff)
	{
		return new DotsEater(scene, x, y, radius, color)
	}

	private scene: Phaser.Scene
	private position = { x: 0, y: 0 }
	private radius = 64
	private eaterColor = 0xffffff
	private dotsColors: number[] = []
	private dotsColorIndex = 0
	private dotsRadius = 6

	private topJaw?: Phaser.GameObjects.Arc
	private bottomJaw?: Phaser.GameObjects.Arc
	private dots: Phaser.GameObjects.Arc[] = []

	private eaterTimeline?: Phaser.Tweens.Timeline
	private dotsTimeline?: Phaser.Tweens.Timeline

	private cachedConfig?: IAnimationConfig

	constructor(scene: Phaser.Scene, x: number, y: number, radius = 48, color = 0xffffff)
	{
		this.scene = scene
		this.position.x = x
		this.position.y = y
		this.radius = radius
		this.eaterColor = color
		this.dotsColors.push(color)
	}

	useEaterColor(color: number)
	{
		this.eaterColor = color
		return this
	}

	useDotColor(...colors: number[])
	{
		this.dotsColors = colors.slice()
		return this
	}

	useRadiusForDots(radius: number)
	{
		this.dotsRadius = radius
		return this
	}

	addToContainer(container: Phaser.GameObjects.Container, x?: number, y?: number)
	{
		if (!container)
		{
			return this
		}

		if (!this.topJaw || !this.bottomJaw)
		{
			this.make()
		}

		if (x !== undefined && y !== undefined)
		{
			this.position.x = x
			this.position.y = y
		}
		else if (x !== undefined)
		{
			this.position.x = x
		}
		else if (y !== undefined)
		{
			this.position.y = y
		}

		this.dots.forEach(dot => {
			container.add(dot)
		})

		if (this.topJaw)
		{
			container.add(this.topJaw)
		}

		if (this.bottomJaw)
		{
			container.add(this.bottomJaw)
		}

		this.layout()
		this.reconstructDotsTimeline()

		return this
	}

	make()
	{
		this.topJaw?.destroy()
		this.bottomJaw?.destroy()

		const { x, y } = this.position
		const dotRadius = this.dotsRadius
		// const gap = dotRadius * 4

		// let dx = x + gap
		for (let i = 0; i < 3; ++i)
		{
			const dot = this.scene.add.circle(x, y, dotRadius, this.getDotColor(), 1)

			this.dots.push(dot)

			// dx += gap
		}

		this.topJaw = this.scene.add.arc(x, y, this.radius, 90, 270, false, this.eaterColor, 1)
			.setAngle(90)
		this.bottomJaw = this.scene.add.arc(x, y, this.radius, 90, 270, false, this.eaterColor, 1)
			.setAngle(-90)

		this.layout()

		return this
	}

	play(config: IAnimationConfig = {})
	{
		if (!this.topJaw || !this.bottomJaw)
		{
			this.make()
		}

		this.eaterTimeline?.destroy()
		this.dotsTimeline?.destroy()

		const {
			eatSpeedMultiplier = 1,
			dotSpeedMultiplier = 1
		} = config

		this.cachedConfig = config

		this.eaterTimeline = this.scene.tweens.timeline({
			loop: -1
		})

		const eatDuration = 300 / eatSpeedMultiplier

		this.eaterTimeline.add({
			targets: this.topJaw,
			angle: this.topJaw!.angle - 45,
			yoyo: true,
			duration: eatDuration,
			offset: 0
		})

		this.eaterTimeline.add({
			targets: this.bottomJaw,
			angle: this.bottomJaw!.angle + 45,
			yoyo: true,
			duration: eatDuration,
			offset: 0
		})

		this.eaterTimeline.play()

		this.constructDotsTimeline(dotSpeedMultiplier)

		if (this.dotsTimeline)
		{
			this.dotsTimeline.play()
		}

		return this
	}

	private reconstructDotsTimeline()
	{
		if (!this.dotsTimeline)
		{
			return
		}

		const {
			dotSpeedMultiplier = 1
		} = this.cachedConfig ?? {}

		this.constructDotsTimeline(dotSpeedMultiplier)
		
		if (this.dotsTimeline)
		{
			this.dotsTimeline.play()
		}
	}

	private constructDotsTimeline(dotSpeedMultiplier = 1)
	{
		if (this.dotsTimeline)
		{
			this.dotsTimeline.stop()
			this.dotsTimeline.resetTweens(true)
			this.dotsTimeline.destroy()
		}

		this.dotsTimeline = this.scene.tweens.timeline({
			loop: -1
		})

		const dotRadius = this.dotsRadius
		const gap = dotRadius * 4
		const dotDuration = 250 / dotSpeedMultiplier

		const size = this.dots.length
		for (let i = 0; i < size; ++i)
		{
			const dot = this.dots[i]
			const nextDot = i < size - 1 ? this.dots[i + 1] : null
			this.dotsTimeline.add({
				targets: dot,
				x: dot.x - gap,
				duration: dotDuration,
				offset: 0,
				onComplete: () => {
					dot.x += gap
					if (nextDot)
					{
						dot.fillColor = nextDot.fillColor
					}
					else
					{
						dot.alpha = 0
						dot.fillColor = this.getDotColor()
					}
				}
			})
		}

		const lastDot = this.dots[this.dots.length - 1]
		lastDot.alpha = 0
		this.dotsTimeline.add({
			targets: lastDot,
			alpha: 1,
			duration: dotDuration * 0.8,
			offset: 0
		})
	}

	private getDotColor()
	{
		if (this.dotsColorIndex > this.dotsColors.length - 1)
		{
			this.dotsColorIndex = 0
		}

		const color = this.dotsColors[this.dotsColorIndex]

		++this.dotsColorIndex

		return color
	}

	private layout()
	{
		const { x, y } = this.position
		const dotRadius = this.dotsRadius
		const gap = dotRadius * 4

		let dx = x + gap
		for (let i = 0; i < this.dots.length; ++i)
		{
			const dot = this.dots[i]
			dot.x = dx
			dot.y = y
			// const dot = this.scene.add.circle(dx, y, dotRadius, this.getDotColor(), 1)

			// this.dots.push(dot)

			dx += gap
		}

		if (this.topJaw)
		{
			this.topJaw.x = x
			this.topJaw.y = y
		}

		if (this.bottomJaw)
		{
			this.bottomJaw.x = x
			this.bottomJaw.y = y
		}
		
		// this.topJaw = this.scene.add.arc(x, y, this.radius, 90, 270, false, this.eaterColor, 1)
		// 	.setAngle(90)
		// this.bottomJaw = this.scene.add.arc(x, y, this.radius, 90, 270, false, this.eaterColor, 1)
		// 	.setAngle(-90)
	}
}
