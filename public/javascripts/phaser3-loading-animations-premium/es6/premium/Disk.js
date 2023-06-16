import Phaser from 'phaser';
export default class Disk {
    constructor(scene, x, y, radius = 64, innerRadius = 16, color = 0xffffff, innerColor = 0x000000) {
        this.position = { x: 0, y: 0 };
        this.radius = 64;
        this.innerRadius = 24;
        this.color = 0xffffff;
        this.innerColor = 0x000000;
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.innerRadius = innerRadius;
        this.color = color;
        this.innerColor = innerColor;
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new Disk(scene, x, y, radius, radius * 0.375, color);
    }
    set x(value) {
        this.position.x = value;
        if (this.circle) {
            this.circle.x = value;
        }
        if (this.innerCircle) {
            this.innerCircle.x = value;
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
        if (this.innerCircle) {
            this.innerCircle.y = value;
        }
    }
    get y() {
        return this.position.y;
    }
    useColors(color1, color2) {
        this.color = color1;
        this.innerColor = color2;
        return this;
    }
    addToContainer(container, x, y) {
        if (!container) {
            return this;
        }
        if (!this.circle) {
            this.make();
        }
        container.add(this.circle);
        container.add(this.innerCircle);
        if (x !== undefined) {
            this.x = x;
        }
        if (y !== undefined) {
            this.y = y;
        }
        return this;
    }
    make() {
        if (this.circle) {
            this.circle.destroy();
        }
        this.circle = this.scene.add.circle(this.x, this.y, this.radius, this.color, 1);
        this.innerCircle = this.scene.add.circle(this.x, this.y, this.innerRadius, this.innerColor, 1);
        return this;
    }
    play(options = {}) {
        const { revolutionsPerSecond = 1, direction = 'cw' } = options;
        if (!this.circle) {
            this.make();
        }
        const vec = new Phaser.Math.Vector2();
        const data = { angle: 0 };
        const length = this.innerRadius * 1.25;
        const dir = this.getDirection(direction);
        this.scene.tweens.add({
            targets: data,
            angle: 360,
            onUpdate: () => {
                vec.setToPolar(data.angle * Phaser.Math.DEG_TO_RAD * dir, length);
                this.innerCircle.x = this.x + vec.x;
                this.innerCircle.y = this.y + vec.y;
            },
            repeat: -1,
            duration: 1000 / revolutionsPerSecond
        });
        return this;
    }
    getDirection(direction) {
        switch (direction) {
            case 'clockwise':
            case 'cw':
                return 1;
            default:
                return -1;
        }
    }
}
