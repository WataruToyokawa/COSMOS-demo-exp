import Phaser from 'phaser';
import BezierEasing from 'bezier-easing';
export default class RollerDots {
    constructor(scene, x, y, radius = 64, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.radius = 64;
        this.dotRadius = 5;
        this.color = 0xffffff;
        this.dots = [];
        this.scene = scene;
        this.position.x = x;
        this.position.y = y;
        this.radius = radius;
        this.color = color;
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new RollerDots(scene, x, y, radius, color);
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
    addToContainer(container, x, y) {
        if (!container) {
            return this;
        }
        if (this.dots.length <= 0) {
            this.make();
        }
        this.dots.forEach(({ display }) => {
            container.add(display);
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
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.layout();
        return this;
    }
    make() {
        while (this.dots.length > 0) {
            this.dots.pop().display.destroy();
        }
        let angle = 45;
        const { x, y } = this.position;
        for (let i = 0; i < 8; ++i) {
            const dot = this.scene.add.circle(x, y, this.dotRadius, this.color, 1);
            this.dots.push({
                display: dot,
                angle,
                startAngle: angle
            });
            angle += 13;
        }
        this.layout();
        return this;
    }
    /**
     *
     * @param duration Time in milliseconds for 1 animation loop
     * @param spacing Time in milliseconds that each dot waits before moving
     */
    play(duration = 1250, spacing = 25) {
        if (this.dots.length <= 0) {
            this.make();
        }
        if (this.timeline) {
            this.timeline.destroy();
        }
        this.timeline = this.scene.tweens.timeline({
            loop: -1,
            loopDelay: 100,
            onLoop: () => {
                this.dots.forEach(dot => {
                    dot.angle = dot.startAngle;
                });
            }
        });
        let offset = 0;
        for (let i = this.dots.length - 1; i >= 0; --i) {
            const dot = this.dots[i];
            this.timeline.add({
                targets: dot,
                angle: dot.angle + 360,
                duration,
                ease: BezierEasing(0.5, 0, 0.5, 1),
                onUpdate: (tween, target) => {
                    const v = tween.getValue();
                    const vec = new Phaser.Math.Vector2(0, 0);
                    vec.setToPolar(Phaser.Math.DEG_TO_RAD * v, this.realRadius);
                    const { x: sx, y: sy } = this.position;
                    target.display.x = sx + vec.x;
                    target.display.y = sy + vec.y;
                },
                offset
            });
            offset += spacing;
        }
        this.timeline.play();
        return this;
    }
    layout() {
        const vec = new Phaser.Math.Vector2(0, 0);
        const { x, y } = this.position;
        for (let i = 0; i < this.dots.length; ++i) {
            const { angle, display } = this.dots[i];
            vec.setToPolar(Phaser.Math.DEG_TO_RAD * angle, this.realRadius);
            display.x = x + vec.x;
            display.y = y + vec.y;
        }
    }
}
