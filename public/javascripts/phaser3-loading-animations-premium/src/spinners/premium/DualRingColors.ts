import Phaser from 'phaser'
import DualRing from '../plus/DualRing'

export default class DualRingColors extends DualRing
{
	static create(scene: Phaser.Scene, x: number, y: number, radius: number = 64, color: number = 0xffffff)
	{
		return new DualRingColors(scene, x, y, radius, color)
	}

	private curveColor1 = 0xffffff
	private curveColor2 = 0xffffff

	useColor(color: number)
	{
		this.curveColor1 = color
		this.curveColor2 = color
		return this
	}

	useColors(color1: number, color2: number)
	{
		this.curveColor1 = color1
		this.curveColor2 = color2 ?? color1
		return this
	}

	make()
	{
		if (this.graphics)
		{
			this.graphics.destroy()
		}

		const radius = this.radius - this.lineWidth * 0.5

		const curve1 = new Phaser.Curves.CubicBezier(
			new Phaser.Math.Vector2(-radius, 0),
			new Phaser.Math.Vector2(-radius, -radius * 0.5),
			new Phaser.Math.Vector2(-radius * 0.5, -radius),
			new Phaser.Math.Vector2(0, -radius)
		)

		const curve2 = new Phaser.Curves.CubicBezier(
			new Phaser.Math.Vector2(radius, 0),
			new Phaser.Math.Vector2(radius, radius * 0.5),
			new Phaser.Math.Vector2(radius * 0.5, radius),
			new Phaser.Math.Vector2(0, radius)
		)

		this.graphics = this.scene.add.graphics({
			x: this.x, y: this.y
		})
		this.graphics.lineStyle(this.lineWidth, this.curveColor1, 1)
		curve1.draw(this.graphics)
		this.graphics.lineStyle(this.lineWidth, this.curveColor2, 1)
		curve2.draw(this.graphics)

		return this
	}
}
