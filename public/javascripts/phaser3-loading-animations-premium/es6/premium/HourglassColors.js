import Phaser from 'phaser';
import Hourglass from '../plus/Hourglass';
export default class HourglassColors extends Hourglass {
    constructor() {
        super(...arguments);
        this.topColor = 0xffffff;
        this.bottomColor = 0xffffff;
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new HourglassColors(scene, x, y, radius, color);
    }
    useColor(color) {
        this.topColor = color;
        this.bottomColor = color;
        return this;
    }
    useColors(color, color2) {
        this.topColor = color;
        this.bottomColor = color2 !== null && color2 !== void 0 ? color2 : color;
        return this;
    }
    make() {
        if (this.graphics) {
            this.graphics.destroy();
        }
        const { x, y } = this.position;
        this.graphics = this.scene.add.graphics({ x, y });
        const radius = this.radius;
        const curve1 = new Phaser.Curves.Path(0, 0);
        curve1.lineTo(-radius, 0);
        curve1.cubicBezierTo(new Phaser.Math.Vector2(-radius, -radius * 0.5), new Phaser.Math.Vector2(-radius * 0.5, -radius), new Phaser.Math.Vector2(0, -radius));
        curve1.lineTo(0, 0);
        const curve2 = new Phaser.Curves.Path(0, 0);
        curve2.lineTo(0, radius);
        curve2.cubicBezierTo(new Phaser.Math.Vector2(radius * 0.5, radius), new Phaser.Math.Vector2(radius, radius * 0.5), new Phaser.Math.Vector2(radius, 0));
        curve2.lineTo(0, 0);
        const rotation = Phaser.Math.DEG_TO_RAD * 45;
        this.graphics.fillStyle(this.topColor, 1);
        const points1 = curve1.getPoints().map(pt => pt.rotate(rotation));
        this.graphics.fillPoints(points1);
        this.graphics.fillStyle(this.bottomColor, 1);
        const points2 = curve2.getPoints().map(pt => pt.rotate(rotation));
        this.graphics.fillPoints(points2);
        return this;
    }
}
