import Phaser from 'phaser';
export default class DualGears {
    constructor(scene, x, y, radius = 32, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.radius = 32;
        this.gearColor1 = 0xffffff;
        this.gearColor2 = 0xffffff;
        this.gears = [];
        this.scene = scene;
        this.position.x = x;
        this.position.y = y;
        this.radius = radius;
        this.useColor(color);
    }
    static create(scene, x, y, radius = 32, color = 0xffffff) {
        return new DualGears(scene, x, y, radius, color);
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
    get lineWidth() {
        return this.radius * 0.375;
    }
    useColor(color) {
        this.gearColor1 = color;
        this.gearColor2 = color;
        return this;
    }
    useColors(color1, color2) {
        this.gearColor1 = color1;
        this.gearColor2 = color2 !== null && color2 !== void 0 ? color2 : color1;
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
        if (this.gears.length <= 0) {
            this.make();
        }
        this.gears.forEach(gear => {
            container.add(gear);
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
        while (this.gears.length > 0) {
            this.gears.pop().destroy();
        }
        const { x, y } = this.position;
        const halfLineWidth = this.lineWidth * 0.5;
        const radius = this.radius - halfLineWidth;
        const gear1 = this.createGear(x, y, radius, this.gearColor1);
        const gear2 = this.createGear(x, y, radius, this.gearColor2)
            .setAngle(22);
        this.gears.push(gear1, gear2);
        this.layout();
        return this;
    }
    play() {
        var _a;
        if (this.gears.length <= 0) {
            this.make();
        }
        (_a = this.timeline) === null || _a === void 0 ? void 0 : _a.destroy();
        this.timeline = this.scene.tweens.timeline({
            loop: -1
        });
        for (let i = 0; i < this.gears.length; ++i) {
            const gear = this.gears[i];
            this.timeline.add({
                targets: gear,
                angle: gear.angle + (360 * (i % 2 === 0 ? 1 : -1)),
                duration: 3000,
                offset: 0
            });
        }
        this.timeline.play();
        return this;
    }
    createGear(x, y, radius, color) {
        const halfLineWidth = this.lineWidth * 0.5;
        const graphics = this.scene.add.graphics({ x, y });
        graphics.lineStyle(this.lineWidth, color, 1);
        graphics.fillStyle(color, 1);
        graphics.strokeCircle(0, 0, radius);
        const len = radius + halfLineWidth;
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
            graphics.fillPoints(points);
            angle += 45;
        }
        return graphics;
    }
    layout() {
        if (this.gears.length < 2) {
            return;
        }
        const { x, y } = this.position;
        const halfLineWidth = this.lineWidth * 0.5;
        const radius = this.radius - halfLineWidth;
        const distance = radius;
        const gear1 = this.gears[0];
        const gear2 = this.gears[1];
        gear1.x = x - distance;
        gear1.y = y - distance;
        gear2.x = x + distance;
        gear2.y = y + distance;
    }
}
