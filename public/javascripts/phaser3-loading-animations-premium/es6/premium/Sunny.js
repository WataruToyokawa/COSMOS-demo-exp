import Phaser from 'phaser';
export default class Sunny {
    constructor(scene, x, y, radius = 64, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.radius = 64;
        this.color = 0xffffff;
        this.raySize = 20;
        this.raysCount = 12;
        this.rayColors = [0xffffff];
        this.rayColorIndex = 0;
        this.rayGap = 2;
        this.scene = scene;
        this.position.x = x;
        this.position.y = y;
        this.radius = radius;
        this.color = color;
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new Sunny(scene, x, y, radius, color);
    }
    get x() {
        return this.position.x;
    }
    set x(v) {
        this.position.x = v;
        if (this.graphics) {
            this.graphics.x = v;
        }
    }
    get y() {
        return this.position.y;
    }
    set y(v) {
        this.position.y = v;
        if (this.graphics) {
            this.graphics.y = v;
        }
    }
    useColor(color) {
        this.color = color;
        return this;
    }
    useRayColor(...colors) {
        this.rayColors = colors.slice();
        return this;
    }
    useRaysCount(count) {
        this.raysCount = count;
        return this;
    }
    useRaySize(size) {
        this.raySize = size;
        return this;
    }
    useRayGap(gap) {
        this.rayGap = gap;
        return this;
    }
    addToContainer(container, x, y) {
        if (!container) {
            return this;
        }
        if (!this.graphics) {
            this.make();
        }
        if (this.graphics) {
            container.add(this.graphics);
        }
        if (x !== undefined) {
            this.x = x;
        }
        if (y !== undefined) {
            this.y = y;
        }
        return this;
    }
    make() {
        var _a;
        (_a = this.graphics) === null || _a === void 0 ? void 0 : _a.destroy();
        const { x, y } = this.position;
        this.graphics = this.scene.add.graphics({ x, y });
        const radius = this.radius - this.raySize;
        this.graphics.fillStyle(this.color, 1);
        this.graphics.fillCircle(0, 0, radius);
        let angle = -90;
        const vec = new Phaser.Math.Vector2(0, 0);
        const len = radius + this.raySize * 0.5 + this.rayGap;
        const interval = 360 / this.raysCount;
        for (let i = 0; i < this.raysCount; ++i) {
            vec.setToPolar(angle * Phaser.Math.DEG_TO_RAD, len);
            this.graphics.fillStyle(this.getRayColor(), 1);
            this.createTriangle(this.graphics, vec.x, vec.y, 90 + angle);
            angle += interval;
        }
        return this;
    }
    play(revolutionsPerSecond = 1) {
        if (!this.graphics) {
            this.make();
        }
        if (this.scene.tweens.isTweening(this.graphics)) {
            this.scene.tweens.killTweensOf(this.graphics);
        }
        this.scene.tweens.add({
            targets: this.graphics,
            angle: 360,
            repeat: -1,
            duration: 3000 / revolutionsPerSecond
        });
        return this;
    }
    createTriangle(graphics, x, y, angle = 0) {
        const triangleWidth = this.raySize;
        const triangleHalfWidth = triangleWidth * 0.5;
        const triangleQuarterWidth = triangleHalfWidth;
        const triangleHeight = this.raySize;
        const triangleHalfHeight = triangleHeight * 0.5;
        const rotation = angle * Phaser.Math.DEG_TO_RAD;
        const pt1 = new Phaser.Math.Vector2(x + triangleQuarterWidth, y + triangleHalfHeight);
        Phaser.Math.RotateAround(pt1, x, y, rotation);
        const pt2 = new Phaser.Math.Vector2(x, y - triangleHalfHeight);
        Phaser.Math.RotateAround(pt2, x, y, rotation);
        const pt3 = new Phaser.Math.Vector2(x - triangleQuarterWidth, y + triangleHalfHeight);
        Phaser.Math.RotateAround(pt3, x, y, rotation);
        graphics.fillTriangle(pt1.x, pt1.y, pt2.x, pt2.y, pt3.x, pt3.y);
    }
    getRayColor() {
        if (this.rayColorIndex > this.rayColors.length - 1) {
            this.rayColorIndex = 0;
        }
        const color = this.rayColors[this.rayColorIndex];
        ++this.rayColorIndex;
        return color;
    }
}
