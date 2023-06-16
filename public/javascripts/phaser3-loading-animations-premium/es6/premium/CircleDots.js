import Phaser from 'phaser';
export default class CircleDots {
    constructor(scene, x, y, radius = 64, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.radius = 64;
        this.dotRadius = 6;
        this.color = 0xffffff;
        this.dots = [];
        this.tweens = [];
        this.scene = scene;
        this.position.x = x;
        this.position.y = y;
        this.radius = radius;
        this.color = color;
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new CircleDots(scene, x, y, radius, color);
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
    get realRadius() {
        return this.radius - this.dotRadius;
    }
    useColor(color) {
        this.color = color;
        return this;
    }
    useRadiusForDots(radius) {
        this.dotRadius = radius;
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
        if (this.dots.length <= 0) {
            this.make();
        }
        this.dots.forEach(dot => {
            container.add(dot);
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
        while (this.dots.length > 0) {
            this.dots.pop().destroy();
        }
        const { x, y } = this.position;
        for (let i = 0; i < 12; ++i) {
            const dot = this.scene.add.circle(x, y, this.dotRadius, this.color, 1);
            this.dots.push(dot);
        }
        this.layout();
        return this;
    }
    play(config = {}) {
        if (this.dots.length <= 0) {
            this.make();
        }
        while (this.tweens.length > 0) {
            this.tweens.pop().remove();
        }
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent.destroy();
        }
        const { scale = 1.4, scaleDuration = 300, spacing = scaleDuration / 3 } = config;
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
                    const dot = this.dots[i];
                    const tween = this.scene.tweens.add({
                        targets: dot,
                        scale,
                        duration: scaleDuration,
                        yoyo: true,
                    });
                    this.tweens.push(tween);
                }
                ++i;
                if (i >= this.dots.length) {
                    i = 0;
                }
            }
        });
        return this;
    }
    layout() {
        let angle = 0;
        const vec = new Phaser.Math.Vector2(0, 0);
        const { x, y } = this.position;
        for (let i = 0; i < this.dots.length; ++i) {
            vec.setToPolar(Phaser.Math.DEG_TO_RAD * angle, this.realRadius);
            const dot = this.dots[i];
            dot.x = x + vec.x;
            dot.y = y + vec.y;
            angle += 30;
        }
    }
}
