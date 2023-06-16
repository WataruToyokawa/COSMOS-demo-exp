export default class Fidget {
    constructor(scene, x, y, size = 72) {
        this.position = { x: 0, y: 0 };
        this.size = 72;
        this.backgroundColor = 0xffffff;
        this.color1 = 0xff0000;
        this.color2 = 0x00ff00;
        this.color3 = 0x0000ff;
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.size = size;
    }
    static create(scene, x, y, size) {
        return new Fidget(scene, x, y, size);
    }
    set x(value) {
        this.position.x = value;
    }
    get x() {
        return this.position.x;
    }
    set y(value) {
        this.position.y = value;
    }
    get y() {
        return this.position.y;
    }
    useBackground(color) {
        this.backgroundColor = color;
        return this;
    }
    useColors(color1, color2, color3) {
        var _a;
        this.color1 = color1;
        this.color2 = color2 !== null && color2 !== void 0 ? color2 : color1;
        this.color3 = (_a = color3 !== null && color3 !== void 0 ? color3 : color2) !== null && _a !== void 0 ? _a : color1;
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
        const { x, y } = this.position;
        const halfSize = this.size * 0.5;
        const height = (this.size * Math.sqrt(3)) * 0.5;
        const radius = this.size * 0.3;
        const innerRadius = this.size * 0.225;
        // simulate the centroid instead of calcuating it
        const tp = 0.66;
        const bp = 0.34;
        this.graphics = this.scene.add.graphics({ x, y });
        this.graphics.fillStyle(this.backgroundColor, 1);
        this.graphics.fillTriangle(0, -height * tp, -halfSize, height * bp, halfSize, height * bp);
        this.graphics.fillCircle(0, -height * tp * 0.9, radius);
        this.graphics.fillCircle(-halfSize * 0.9, height * bp * 0.9, radius);
        this.graphics.fillCircle(halfSize * 0.9, height * bp * 0.9, radius);
        this.graphics.fillStyle(this.color1);
        this.graphics.fillCircle(0, -height * tp * 0.9, innerRadius);
        this.graphics.fillStyle(this.color2);
        this.graphics.fillCircle(-halfSize * 0.9, height * bp * 0.9, innerRadius);
        this.graphics.fillStyle(this.color3);
        this.graphics.fillCircle(halfSize * 0.9, height * bp * 0.9, innerRadius);
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
            duration: 1000 / revolutionsPerSecond
        });
        return this;
    }
}
