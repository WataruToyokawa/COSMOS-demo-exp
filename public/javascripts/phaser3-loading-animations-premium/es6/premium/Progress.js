import Phaser from 'phaser';
export default class Progress {
    constructor(scene, x, y, width = 128, height = 32) {
        this.position = { x: 0, y: 0 };
        this.width = 128;
        this.height = 32;
        this.cornerRadius = 14;
        this.background = 0xffffff;
        this.progress = 0xff0000;
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.cornerRadius = height * 0.5;
    }
    static create(scene, x, y, width) {
        return new Progress(scene, x, y, width);
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
    useColors(background, progress) {
        this.background = background;
        this.progress = progress;
        return this;
    }
    useCornerRadius(radius) {
        this.cornerRadius = radius;
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
        if (this.bar) {
            container.add(this.bar);
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
        this.graphics = this.scene.add.graphics({ x, y });
        this.graphics.fillStyle(this.background);
        this.graphics.fillRoundedRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height, this.cornerRadius);
        this.mask = this.scene.make.graphics({ x, y });
        const w = this.width * 0.95;
        const h = this.height * 0.8;
        this.mask.fillStyle(this.background);
        this.mask.fillRoundedRect(-w * 0.5, -h * 0.5, w, h, this.cornerRadius * 0.95);
        this.bar = this.scene.add.rectangle(x - this.width, y, this.width, this.height, this.progress)
            .setOrigin(0.5);
        this.bar.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, this.mask));
        return this;
    }
    play() {
        if (!this.graphics) {
            this.make();
        }
        if (this.scene.tweens.isTweening(this.bar)) {
            this.scene.tweens.killTweensOf(this.bar);
        }
        this.scene.tweens.add({
            targets: this.bar,
            x: this.x + this.width + 20,
            repeat: -1,
            duration: 1000
        });
        return this;
    }
    destroy() {
        var _a, _b, _c;
        if (this.scene.tweens.isTweening(this.bar)) {
            this.scene.tweens.killTweensOf(this.bar);
        }
        (_a = this.mask) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this.bar) === null || _b === void 0 ? void 0 : _b.destroy();
        (_c = this.graphics) === null || _c === void 0 ? void 0 : _c.destroy();
    }
}
