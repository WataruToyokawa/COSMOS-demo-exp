import Phaser from 'phaser'
import { Rainbow, Background, Primary, Secondary, PrimaryLight } from '../colors'

import DualRingColors from '../spinners/premium/DualRingColors'
import CircleSpin from '../spinners/premium/CircleSpin'
import CircleSpinColors from '../spinners/premium/CircleSpinColors'
import Ripple from '../spinners/premium/Ripple'
import RippleColors from '../spinners/premium/RippleColors'
import RollerDots from '../spinners/premium/RollerDots'
import RollerDotsColors from '../spinners/premium/RollerDotsColors'
import CircleDots from '../spinners/premium/CircleDots'
import CircleDotsColors from '../spinners/premium/CircleDotsColors'
import HourglassColors from '../spinners/premium/HourglassColors'
import DotsGrid from '../spinners/premium/DotsGrid'
import DotsGridColors from '../spinners/premium/DotsGridColors'
import HeartBeat from '../spinners/premium/HeartBeat'
import Clock, { Ticks, TickShape } from '../spinners/premium/Clock'
import DotsEater from '../spinners/premium/DotsEater'
import Triforce from '../spinners/premium/Triforce'
import TypingBubble, { TailType } from '../spinners/premium/TypingBubble'
import GearSpin from '../spinners/premium/GearSpin'
import DualGears from '../spinners/premium/DualGears'
import Sunny from '../spinners/premium/Sunny'
import Swing from '../spinners/premium/Swing'
import Disk from '../spinners/premium/Disk'
import Fidget from '../spinners/premium/Fidget'
import Progress from '../spinners/premium/Progress'

export default class PremiumSpinners extends Phaser.Scene
{
	private actionButton!: Phaser.GameObjects.Rectangle
	private actionText!: Phaser.GameObjects.Text

	private page1?: Phaser.GameObjects.Container
	private page2?: Phaser.GameObjects.Container

	constructor()
	{
		super('premium-spinners')
	}

	create()
	{
		const page1 = this.add.container()
		const page2 = this.add.container(0, this.scale.height)
		this.page1 = page1
		this.page2 = page2

		this.createPageOne(this.page2)
		this.createPageTwo(this.page1)

		this.createMenu()
		this.createActionButton()
	}

	private createPageOne(page: Phaser.GameObjects.Container)
	{
		const positions = this.generatePositions()
		for (let i = 0; i < positions.length; ++i)
		{
			const { x, y } = positions[i]
			switch (i)
			{
				case 0:
					DualRingColors.create(this, x, y)
						.useColors(PrimaryLight, Secondary)
						.addToContainer(page)
						.play()

					this.displayName('Dual Ring\nColors', x, y, page)
					break

				case 1:
					CircleSpin.create(this, x, y)
						.addToContainer(page)
						.play()
					this.displayName('Circle Spin', x, y, page)
					break

				case 2:
					CircleSpinColors.create(this, x, y)
						.useColors(...Rainbow)
						.addToContainer(page)
						.play()
					this.displayName('Circle Spin\nColors', x, y, page)
					break

				case 3:
					Ripple.create(this, x, y)
						.addToContainer(page)
						.play()
					this.displayName('Ripple', x, y, page)
					break

				case 4:
					RippleColors.create(this, x, y)
						.useColors(...Rainbow)
						.addToContainer(page)
						.play()
					this.displayName('Ripple\nColors', x, y, page)
					break

				case 5:
					DotsGrid.create(this, x, y)
						.addToContainer(page)
						.play()
					this.displayName('Dots Grid', x, y, page)
					break

				case 6:
					HourglassColors.create(this, x, y)
						.useColors(PrimaryLight, Secondary)
						.addToContainer(page)
						.play()
					this.displayName('Hourglass\nColors', x, y, page)
					break

				case 7:
					RollerDots.create(this, x, y)
						.addToContainer(page)
						.play()
					this.displayName('Roller Dots', x, y, page)
					break

				case 8:
					RollerDotsColors.create(this, x, y)
						.useColors(...Rainbow)
						.addToContainer(page)
						.play()
					this.displayName('Roller Dots\nColors', x, y, page)
					break

				case 9:
					CircleDots.create(this, x, y)
						.addToContainer(page)
						.play()
					this.displayName('Circle Dots', x, y, page)
					break

				case 10:
					CircleDotsColors.create(this, x, y)
						.useColors(...Rainbow)
						.addToContainer(page)
						.play()
					this.displayName('Circle Dots\nColors', x, y, page)
					break

				case 11:
					DotsGridColors.create(this, x, y)
						.useColors(...Rainbow)
						.addToContainer(page)
						.play()
					this.displayName('Dots Grid\nColors', x, y, page)
					break
			}
		}
	}

	private createPageTwo(page: Phaser.GameObjects.Container)
	{
		const positions = this.generatePositions()
		for (let i = 0; i < positions.length; ++i)
		{
			const { x, y } = positions[i]
			switch (i)
			{
				case 0:
					HeartBeat.create(this, x, y)
						.useColor(Rainbow[0])
						.addToContainer(page)
						.play()
					this.displayName('Heart Beat', x, y, page)
					break

				case 1:
					Clock.create(this, x, y)
						.useFaceColor(Background)
						.useMinuteHandColor(Secondary)
						.useHourHandColor(Secondary)
						.useFaceStroke(4, PrimaryLight)
						.useHourTicks(Ticks.QUARTER, Secondary, 5, TickShape.SQUARE)
						.addToContainer(page)
						.play()
					this.displayName('Clock', x, y, page)
					break

				case 2:
					DotsEater.create(this, x, y)
						.useEaterColor(Secondary)
						.useDotColor(...Rainbow)
						.addToContainer(page)
						.play()
					this.displayName('Dots Eater', x, y, page)
					break

				case 3:
					Triforce.create(this, x, y)
						.useColor(Secondary)
						.addToContainer(page)
						.play()	
					this.displayName('Triforce', x, y, page)
					break

				case 4:
					TypingBubble.create(this, x, y)
						.useColor(Background)
						.useStroke(PrimaryLight, 4)
						.useColorForDots(Secondary)
						.useTail(TailType.BOTTOM_RIGHT)
						.addToContainer(page)
						.play()
					this.displayName('Typing Bubble', x, y, page)
					break

				case 5:
					 GearSpin.create(this, x, y)
						.useColor(Secondary)
						.addToContainer(page)
						.play()
					this.displayName('Gear Spin', x, y, page)
					break

				case 6:
					DualGears.create(this, x, y)
						.useColors(PrimaryLight, Secondary)
						.addToContainer(page)
						.play()
					this.displayName('Dual Gears', x, y, page)
					break

				case 7:
					Sunny.create(this, x, y)
						.useColor(Secondary)
						.useRayColor(...Rainbow)
						.useRayGap(3)
						.addToContainer(page)
						.play()
					this.displayName('Sunny', x, y, page)
					break

				case 8:
					Swing.create(this, x, y)
						.useColors(PrimaryLight, Secondary)
						.addToContainer(page)
						.play()
					this.displayName('Swing', x, y, page)
					break

				case 9:
					Disk.create(this, x, y)
						.useColors(PrimaryLight, Secondary)
						.addToContainer(page)
						.play({ revolutionsPerSecond: 1.5 })
					this.displayName('Disk', x, y, page)
					break

				case 10:
					Fidget.create(this, x, y)
						.useBackground(Secondary)
						.useColors(Primary)
						.addToContainer(page)
						.play()
					this.displayName('Fidget', x, y, page)
					break

				case 11:
					Progress.create(this, x, y)
						.useColors(PrimaryLight, Secondary)
						.useCornerRadius(12)
						.addToContainer(page)
						.play()
					this.displayName('Progress', x, y, page)
					break
			}
		}
	}

	private createMenu()
	{
		const { height } = this.scale

		const banner = this.add.rectangle(0, height, 175, 40, Primary)
			.setOrigin(0, 1)
		this.add.text(banner.x + 10, height - 20, 'Premium Spinners')
			.setOrigin(0, 0.5)
	}

	private createActionButton()
	{
		const { width, height } = this.scale
		this.actionButton = this.add.rectangle(width - 10, height - 30, 100, 40, Primary)
			.setOrigin(1, 0.5)
			.setStrokeStyle(2, Secondary)
		this.actionText = this.add.text(
			this.actionButton.x - this.actionButton.width * 0.5, this.actionButton.y,
			'👇 More', { color: 'white' }
		)
		.setOrigin(0.5)

		this.actionButton.setInteractive()
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
				this.actionButton.fillColor = PrimaryLight
				this.actionText.setColor('white')
			})
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
				this.actionButton.fillColor = Primary
				this.actionText.setColor('white')
			})
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
				this.actionButton.fillColor = Primary
				this.actionText.setColor('white')

				this.handleAction()
			})
	}

	private handleAction()
	{
		if (!this.page1 || this.tweens.isTweening(this.page1))
		{
			return
		}

		if (this.page1 && this.page1.y < 0)
		{
			// bring back page 1
			this.tweens.add({
				targets: [this.page1, this.page2],
				y: `+=${this.scale.height}`,
				ease: Phaser.Math.Easing.Sine.InOut,
				duration: 500
			})

			this.actionText.text = '👇 More'
		}
		else if (this.page2)
		{
			// show page 2
			this.tweens.add({
				targets: [this.page1, this.page2],
				y: `-=${this.scale.height}`,
				ease: Phaser.Math.Easing.Sine.InOut,
				duration: 500
			})

			this.actionText.text = '👆 Back'
		}
	}

	private generatePositions()
	{
		const gap = 20
		const interval = 128

		let x = 90 + gap
		let y = 80 + gap

		const positions: { x: number, y: number }[] = []

		for (let i = 0; i < 12; ++i)
		{
			positions.push({ x, y })

			x += interval + gap

			if (x >= 900)
			{
				x = 90 + gap
				y += interval + gap * 5.5
			}
		}

		return positions
	}

	private displayName(name: string, x: number, y: number, container?: Phaser.GameObjects.Container)
	{
		const text = this.add.text(x, y + 100, name).setOrigin(0.5).setAlign('center')
		if (container)
		{
			container.add(text)
		}
	}
}
