import Phaser from 'phaser';
import DualRing from '../plus/DualRing';
export default class DualRingColors extends DualRing {
    constructor() {
        super(...arguments);
        this.curveColor1 = 0xffffff;
        this.curveColor2 = 0xffffff;
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new DualRingColors(scene, x, y, radius, color);
    }
    useColor(color) {
        this.curveColor1 = color;
        this.curveColor2 = color;
        return this;
    }
    useColors(color1, color2) {
        this.curveColor1 = color1;
        this.curveColor2 = color2 !== null && color2 !== void 0 ? color2 : color1;
        return this;
    }
    make() {
        if (this.graphics) {
            this.graphics.destroy();
        }
        const radius = this.radius - this.lineWidth * 0.5;
        const curve1 = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(-radius, 0), new Phaser.Math.Vector2(-radius, -radius * 0.5), new Phaser.Math.Vector2(-radius * 0.5, -radius), new Phaser.Math.Vector2(0, -radius));
        const curve2 = new Phaser.Curves.CubicBezier(new Phaser.Math.Vector2(radius, 0), new Phaser.Math.Vector2(radius, radius * 0.5), new Phaser.Math.Vector2(radius * 0.5, radius), new Phaser.Math.Vector2(0, radius));
        this.graphics = this.scene.add.graphics({
            x: this.x, y: this.y
        });
        this.graphics.lineStyle(this.lineWidth, this.curveColor1, 1);
        curve1.draw(this.graphics);
        this.graphics.lineStyle(this.lineWidth, this.curveColor2, 1);
        curve2.draw(this.graphics);
        return this;
    }
}
