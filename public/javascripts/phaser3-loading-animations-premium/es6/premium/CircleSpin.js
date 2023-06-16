import Phaser from 'phaser';
export default class CircleSpin {
    constructor(scene, x, y, radius = 64, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.radius = 64;
        this.color = 0xffffff;
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new CircleSpin(scene, x, y, radius, color);
    }
    set x(value) {
        this.position.x = value;
        if (this.circle) {
            this.circle.x = value;
        }
    }
    get x() {
        return this.position.x;
    }
    set y(value) {
        this.position.y = value;
        if (this.circle) {
            this.circle.y = value;
        }
    }
    get y() {
        return this.position.y;
    }
    useColor(color) {
        this.color = color;
        return this;
    }
    addToContainer(container, x, y) {
        if (!container) {
            return this;
        }
        if (!this.circle || !this.timeline) {
            this.make();
        }
        container.add(this.circle);
        if (x !== undefined) {
            this.x = x;
        }
        if (y !== undefined) {
            this.y = y;
        }
        return this;
    }
    make(config = {}) {
        if (this.circle) {
            this.circle.destroy();
        }
        this.circle = this.scene.add.circle(this.x, this.y, this.radius, this.color, 1);
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
                duration
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
                duration
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
    play() {
        var _a;
        if (!this.circle || !this.timeline) {
            this.make();
        }
        (_a = this.timeline) === null || _a === void 0 ? void 0 : _a.play();
        return this;
    }
}
