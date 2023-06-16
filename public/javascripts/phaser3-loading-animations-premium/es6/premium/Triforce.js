import Phaser from 'phaser';
export default class Triforce {
    constructor(scene, x, y, width = 128, height = 96, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.width = 128;
        this.height = 128;
        this.color = 0xffffff;
        this.triangles = [];
        this.scene = scene;
        this.position.x = x;
        this.position.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    static create(scene, x, y, width = 128, height = 96, color = 0xffffff) {
        return new Triforce(scene, x, y, width, height, color);
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
        if (this.triangles.length <= 0) {
            this.make();
        }
        this.triangles.forEach(tri => {
            container.add(tri);
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
        while (this.triangles.length > 0) {
            this.triangles.pop().destroy();
        }
        const { x, y } = this.position;
        for (let i = 0; i < 3; ++i) {
            this.triangles.push(this.createTriangle(x, y));
        }
        this.layout();
        return this;
    }
    play(config = {}) {
        var _a;
        if (this.triangles.length <= 0) {
            this.make();
        }
        (_a = this.timeline) === null || _a === void 0 ? void 0 : _a.destroy();
        const { spinDuration = 400, spinOffset = 0, loopDelay = 200 } = config;
        this.timeline = this.scene.tweens.timeline({
            loop: -1,
            loopDelay
        });
        let offset = 0;
        for (let i = 0; i < this.triangles.length; ++i) {
            const tri = this.triangles[i];
            this.timeline.add({
                targets: tri,
                scaleX: 0,
                duration: spinDuration,
                yoyo: true,
                ease: Phaser.Math.Easing.Sine.InOut,
                offset
            });
            offset += spinOffset;
        }
        this.timeline.play();
        return this;
    }
    createTriangle(x, y) {
        const triangleWidth = this.width * 0.5;
        const triangleHalfWidth = triangleWidth * 0.5;
        const triangleHeight = this.height * 0.5;
        return this.scene.add.triangle(x, y, 0, triangleHeight, triangleHalfWidth, 0, triangleWidth, triangleHeight, this.color, 1);
    }
    layout() {
        const { x, y } = this.position;
        const triangleHalfWidth = this.width * 0.25;
        const triangleHalfHeight = this.height * 0.25;
        const top = this.triangles[0];
        if (top) {
            top.x = x;
            top.y = y - triangleHalfHeight;
        }
        const left = this.triangles[1];
        if (left) {
            left.x = x - triangleHalfWidth;
            left.y = y + triangleHalfHeight;
        }
        const right = this.triangles[2];
        if (right) {
            right.x = x + triangleHalfWidth;
            right.y = y + triangleHalfHeight;
        }
    }
}
