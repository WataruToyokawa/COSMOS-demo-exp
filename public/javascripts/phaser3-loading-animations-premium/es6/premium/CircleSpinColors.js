import Phaser from 'phaser';
import CircleSpin from './CircleSpin';
export default class CircleSpinColors extends CircleSpin {
    constructor(scene, x, y, radius = 64, color = 0xffffff) {
        super(scene, x, y, radius, color);
        this.colors = [];
        this.colorIndex = 0;
        this.colors.push(color);
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new CircleSpinColors(scene, x, y, radius, color);
    }
    useColor(color) {
        this.colors = [color];
        this.colorIndex = 0;
        return this;
    }
    useColors(...colors) {
        this.colors = colors.slice();
        this.colorIndex = 0;
        return this;
    }
    make(config = {}) {
        if (this.circle) {
            this.circle.destroy();
        }
        const color = this.getColor();
        this.circle = this.scene.add.circle(this.x, this.y, this.radius, color, 1);
        if (this.timeline) {
            this.timeline.destroy();
        }
        const { loopDelay = 0, spins = 10 } = config;
        this.timeline = this.scene.tweens.timeline({
            loop: -1,
            loopDelay
        });
        const fastSpins = Math.floor(spins * 0.8);
        const slowSpins = spins - fastSpins;
        let duration = 300;
        for (let i = 0; i < fastSpins; ++i) {
            this.timeline.add({
                targets: this.circle,
                scaleX: 0,
                ease: Phaser.Math.Easing.Sine.InOut,
                duration,
                onComplete: () => {
                    this.circle.setFillStyle(this.getColor());
                }
            })
                .add({
                targets: this.circle,
                scaleX: 1,
                ease: Phaser.Math.Easing.Sine.InOut,
                duration
            });
            if (duration > 100) {
                duration *= 0.5;
            }
        }
        for (let i = 0; i < slowSpins; ++i) {
            duration *= 2;
            this.timeline.add({
                targets: this.circle,
                scaleX: 0,
                ease: Phaser.Math.Easing.Sine.InOut,
                duration,
                onComplete: () => {
                    this.circle.setFillStyle(this.getColor());
                }
            })
                .add({
                targets: this.circle,
                scaleX: 1,
                ease: Phaser.Math.Easing.Sine.InOut,
                duration
            });
        }
        return this;
    }
    getColor() {
        if (this.colorIndex > this.colors.length - 1) {
            this.colorIndex = 0;
        }
        const color = this.colors[this.colorIndex];
        ++this.colorIndex;
        return color;
    }
}
