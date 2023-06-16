import Phaser from 'phaser';
export default class CircleBars {
    constructor(scene, x, y, radius = 64, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.radius = 64;
        this.color = 0xffffff;
        this.bars = [];
        this.tweens = [];
        this.scene = scene;
        this.position.x = x;
        this.position.y = y;
        this.radius = radius;
        this.color = color;
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new CircleBars(scene, x, y, radius, color);
    }
    get x() {
        return this.position.x;
    }
    set x(v) {
        this.position.x = v;
        this.layout();
    }
    get y() {
        return this.position.y;
    }
    set y(v) {
        this.position.y = v;
        this.layout();
    }
    useColor(color) {
        this.color = color;
        return this;
    }
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.layout();
        return this;
    }
    addToContainer(container, x, y) {
        if (!container) {
            return this;
        }
        if (this.bars.length <= 0) {
            this.make();
        }
        this.bars.forEach(bar => {
            container.add(bar);
        });
        if (x !== undefined && y !== undefined) {
            this.setPosition(x, y);
        }
        else if (x !== undefined) {
            this.x = x;
        }
        else if (y !== undefined) {
            this.y = y;
        }
        return this;
    }
    make() {
        while (this.bars.length > 0) {
            this.bars.pop().destroy();
        }
        const height = this.radius * 0.5;
        const width = 10;
        const { x, y } = this.position;
        let angle = -90;
        for (let i = 0; i < 12; ++i) {
            const bar = this.scene.add.rectangle(x, y, width, height, this.color, 1)
                .setAngle(angle)
                .setAlpha(0.2);
            this.bars.push(bar);
            angle += 30;
        }
        this.layout();
        return this;
    }
    play(config = {}) {
        if (this.bars.length <= 0) {
            this.make();
        }
        while (this.tweens.length > 0) {
            this.tweens.pop().remove();
        }
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent.destroy();
        }
        const { alpha = 0.2, alphaDuration = 400, spacing = 70 } = config;
        let i = 0;
        this.timerEvent = this.scene.time.addEvent({
            delay: spacing,
            loop: true,
            callback: () => {
                if (i < this.tweens.length) {
                    const tween = this.tweens[i];
                    tween.restart();
                }
                else {
                    const bar = this.bars[i];
                    const tween = this.scene.tweens.add({
                        targets: bar,
                        alpha,
                        duration: alphaDuration,
                        onStart: () => {
                            bar.alpha = 1;
                        }
                    });
                    this.tweens.push(tween);
                }
                ++i;
                if (i >= this.bars.length) {
                    i = 0;
                }
            }
        });
        return this;
    }
    layout() {
        const height = this.radius * 0.5;
        const { x: sx, y: sy } = this.position;
        for (let i = 0; i < this.bars.length; ++i) {
            const bar = this.bars[i];
            const angle = bar.angle;
            const { x, y } = Phaser.Math.RotateAround({ x: sx, y: sy - (this.radius - (height * 0.5)) }, sx, sy, Phaser.Math.DEG_TO_RAD * angle);
            bar.x = x;
            bar.y = y;
        }
    }
}
