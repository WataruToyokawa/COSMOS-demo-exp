import Phaser from 'phaser'

interface IAnimationConfig
{
	dotFadeDuration?: number,
	dotFadeOffset?: number,
	dotsFadeOutDuration?: number
}

export enum TailType
{
	NONE,
	BOTTOM_LEFT,
	BOTTOM_RIGHT,
	TOP_LEFT,
	TOP_RIGHT
}

export default class TypingBubble
{
	static create(scene: Phaser.Scene, x: number, y: number, width = 96, height = 64, color = 0xffffff)
	{
		return new TypingBubble(scene, x, y, width, height, color)
	}

	private scene: Phaser.Scene
	private position = { x: 0, y: 0 }
	private width = 128
	private height = 64
	private color = 0xffffff
	private dotsRadius = 6
	private dotsGap = this.dotsRadius * 4
	private dotsColors: number[] = [0x000000]
	private dotsColorIndex = 0

	private graphics?: Phaser.GameObjects.Graphics
	private dots: Phaser.GameObjects.Arc[] = []
	private timeline?: Phaser.Tweens.Timeline

	private tail = TailType.NONE

	private enableStroke = false
	private strokeWidth = 8
	private strokeColor = 0x000000

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

	constructor(scene: Phaser.Scene, x: number, y: number, width = 96, height = 64, color = 0xffffff)
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

	useStroke(color: number, lineWidth: number)
	{
		this.enableStroke = true
		this.strokeColor = color
		this.strokeWidth = lineWidth
		return this
	}

	useRadiusForDots(radius: number)
	{
		this.dotsRadius = radius
		return this
	}

	useGapForDots(gap: number)
	{
		this.dotsGap = gap
		return this
	}

	useColorForDots(...color: number[])
	{
		this.dotsColors = color.slice()
		return this
	}

	useTail(type: TailType)
	{
		this.tail = type
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

		if (!this.graphics)
		{
			this.make()
		}

		if (this.graphics)
		{
			container.add(this.graphics)
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
		this.graphics?.destroy()

		while (this.dots.length > 0)
		{
			this.dots.pop()!.destroy()
		}

		const { x, y } = this.position

		const halfWidth = this.width * 0.5
		const halfHeight = this.height * 0.5

		const path = new Phaser.Curves.Path(0, 0)
		path.moveTo(-halfWidth, 0)
		path.cubicBezierTo(
			new Phaser.Math.Vector2(-halfWidth, -halfHeight),
			new Phaser.Math.Vector2(-halfWidth, -halfHeight),
			new Phaser.Math.Vector2(-halfWidth * 0.5, -halfHeight)
		)
		path.lineTo(this.width - halfWidth * 1.5, -halfHeight)
		path.cubicBezierTo(
			new Phaser.Math.Vector2(halfWidth, -halfHeight),
			new Phaser.Math.Vector2(halfWidth, -halfHeight),
			new Phaser.Math.Vector2(halfWidth, 0)
		)
		path.cubicBezierTo(
			new Phaser.Math.Vector2(halfWidth, halfHeight),
			new Phaser.Math.Vector2(halfWidth, halfHeight),
			new Phaser.Math.Vector2(halfWidth * 0.5, halfHeight)
		)
		path.lineTo(-halfWidth * 0.5, halfHeight)
		path.cubicBezierTo(
			new Phaser.Math.Vector2(-halfWidth, halfHeight),
			new Phaser.Math.Vector2(-halfWidth, halfHeight),
			new Phaser.Math.Vector2(-halfWidth, 0)
		)
		path.closePath()

		this.graphics = this.scene.add.graphics({ x, y })
		this.graphics.fillStyle(this.color, 1)

		const tail = this.getTail(this.tail)
		if (tail)
		{
			this.graphics.fillPoints(tail.getPoints())
		}

		this.graphics.fillPoints(path.getPoints())

		if (this.enableStroke)
		{
			this.graphics.lineStyle(this.strokeWidth, this.strokeColor, 1)
			path.draw(this.graphics)

			if (tail)
			{
				tail.draw(this.graphics)
			}
		}

		for (let i = 0; i < 3; ++i)
		{
			const dot = this.scene.add.circle(x, y, this.dotsRadius, this.getDotColor(), 1)
			this.dots.push(dot)
		}

		this.layout()

		return this
	}

	play(config: IAnimationConfig = {})
	{
		if (!this.graphics)
		{
			this.make()
		}

		const {
			dotFadeDuration = 400,
			dotFadeOffset = 200,
			dotsFadeOutDuration = 100
		} = config

		this.timeline = this.scene.tweens.timeline({
			loop: -1
		})

		let offset = 0

		for (let i = 0; i < this.dots.length; ++i)
		{
			const dot = this.dots[i]
			dot.setAlpha(0)

			this.timeline.add({
				targets: dot,
				alpha: 1,
				duration: dotFadeDuration,
				ease: Phaser.Math.Easing.Sine.In,
				offset
			})

			offset += dotFadeOffset
		}

		this.timeline.add({
			targets: this.dots,
			alpha: 0,
			duration: dotsFadeOutDuration
		})

		this.timeline.play()

		return this
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

	private getTail(type: TailType)
	{
		if (type === TailType.NONE)
		{
			return null
		}

		const halfWidth = this.width * 0.5
		const halfHeight = this.height * 0.5
		const th = 16
		const tw = 14

		switch (type)
		{
			case TailType.BOTTOM_RIGHT:
			{
				const x = halfWidth * 0.6
				const y = halfHeight
				const tail = new Phaser.Curves.Path(x, y)
				tail.lineTo(x, y + th)
				tail.lineTo(x, y + th - (this.strokeWidth * 0.5))
				tail.cubicBezierTo(
					new Phaser.Math.Vector2(x - tw, y + th),
					new Phaser.Math.Vector2(x - tw, y),
					new Phaser.Math.Vector2(x - tw, y)
				)
				return tail
			}

			case TailType.BOTTOM_LEFT:
			{
				const x = halfWidth * -0.6
				const y = halfHeight
				const tail = new Phaser.Curves.Path(x, y)
				tail.lineTo(x, y + th)
				tail.lineTo(x, y + th - (this.strokeWidth * 0.5))
				tail.cubicBezierTo(
					new Phaser.Math.Vector2(x + tw, y + th),
					new Phaser.Math.Vector2(x + tw, y),
					new Phaser.Math.Vector2(x + tw, y)
				)
				return tail
			}

			case TailType.TOP_LEFT:
			{
				const x = halfWidth * -0.6
				const y = -halfHeight
				const tail = new Phaser.Curves.Path(x, y)
				tail.lineTo(x, y - th)
				tail.lineTo(x, y - th + (this.strokeWidth * 0.5))
				tail.cubicBezierTo(
					new Phaser.Math.Vector2(x + tw, y - th),
					new Phaser.Math.Vector2(x + tw, y),
					new Phaser.Math.Vector2(x + tw, y)
				)
				return tail
			}

			case TailType.TOP_RIGHT:
			{
				const x = halfWidth * 0.6
				const y = -halfHeight
				const tail = new Phaser.Curves.Path(x, y)
				tail.lineTo(x, y - th)
				tail.lineTo(x, y - th + (this.strokeWidth * 0.5))
				tail.cubicBezierTo(
					new Phaser.Math.Vector2(x - tw, y - th),
					new Phaser.Math.Vector2(x - tw, y),
					new Phaser.Math.Vector2(x - tw, y)
				)
				return tail
			}
		}

		return null
	}

	private layout()
	{
		if (this.graphics)
		{
			this.graphics.x = this.position.x
			this.graphics.y = this.position.y
		}

		const { x, y } = this.position
		let dx = x - this.dotsGap
		for (let i = 0; i < this.dots.length; ++i)
		{
			const dot = this.dots[i]
			dot.x = dx
			dot.y = y
			// const dot = this.scene.add.circle(dx, y, this.dotsRadius, this.getDotColor(), 1)
			// this.dots.push(dot)

			dx += this.dotsGap
		}
	}
}
