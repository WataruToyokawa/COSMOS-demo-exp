import Phaser from 'phaser';
export default class GearSpin {
    constructor(scene, x, y, radius = 64, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.radius = 64;
        this.color = 0xffffff;
        this.lineWidth = 24;
        this.scene = scene;
        this.position.x = x;
        this.position.y = y;
        this.radius = radius;
        this.color = color;
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new GearSpin(scene, x, y, radius, color);
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
    useThickness(thickness) {
        this.lineWidth = thickness;
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
        const halfLineWidth = this.lineWidth * 0.5;
        const radius = this.radius - this.lineWidth;
        this.graphics = this.scene.add.graphics({ x, y });
        this.graphics.lineStyle(this.lineWidth, this.color, 1);
        this.graphics.fillStyle(this.color, 1);
        this.graphics.strokeCircle(0, 0, radius);
        const len = this.radius - halfLineWidth;
        const vec = new Phaser.Math.Vector2(1, 0);
        const rect = new Phaser.Curves.Path(0, 0);
        rect.moveTo(-halfLineWidth, -halfLineWidth);
        rect.lineTo(halfLineWidth, -halfLineWidth);
        rect.lineTo(halfLineWidth, halfLineWidth);
        rect.lineTo(-halfLineWidth, halfLineWidth);
        rect.lineTo(-halfLineWidth, -halfLineWidth);
        let angle = 0;
        for (let i = 0; i < 8; ++i) {
            const rotation = angle * Phaser.Math.DEG_TO_RAD;
            vec.setToPolar(rotation, len);
            const points = rect.getPoints().map(pt => {
                pt.rotate(rotation);
                pt.x += vec.x;
                pt.y += vec.y;
                return pt;
            });
            this.graphics.fillPoints(points);
            angle += 45;
        }
        return this;
    }
    play(revolutionsPerSecond = 0.25) {
        if (!this.graphics) {
            this.make();
        }
        if (this.scene.tweens.isTweening(this.graphics)) {
            this.scene.tweens.killTweensOf(this.graphics);
        }
        this.scene.add.tween({
            targets: this.graphics,
            angle: 360,
            repeat: -1,
            duration: 1000 / revolutionsPerSecond
        });
        return this;
    }
}
