import Phaser from 'phaser';
import BezierEasing from 'bezier-easing';
export default class TripleBars {
    constructor(scene, x, y, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.color = 0xffffff;
        this.barWidth = 30;
        this.barHeight = 70;
        this.gap = 10;
        this.bars = [];
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.color = color;
    }
    static create(scene, x, y, color = 0xffffff) {
        return new TripleBars(scene, x, y, color);
    }
    set x(value) {
        this.position.x = value;
        this.layout();
    }
    get x() {
        return this.position.x;
    }
    set y(value) {
        this.position.y = value;
        this.layout();
    }
    get y() {
        return this.position.y;
    }
    useBarWidth(width) {
        this.barWidth = width;
        return this;
    }
    useBarHeight(height) {
        this.barHeight = height;
        return this;
    }
    useBarGap(gap) {
        this.gap = gap;
        return this;
    }
    useBarColor(color) {
        this.color = color;
        return this;
    }
    addToContainer(container, x, y) {
        if (!container) {
            return this;
        }
        if (!this.timeline) {
            this.make();
        }
        this.bars.forEach(bar => {
            container.add(bar);
            if (x !== undefined) {
                this.x = x;
            }
            if (y !== undefined) {
                this.y = y;
            }
        });
        return this;
    }
    make(config = {}) {
        var _a, _b, _c;
        this.bars.forEach(bar => bar.destroy());
        this.bars.length = 0;
        for (let i = 0; i < 3; ++i) {
            this.bars.push(this.scene.add.rectangle(0, 0, this.barWidth, this.barHeight, this.color));
        }
        this.layout();
        this.timeline = this.scene.tweens.timeline({ loop: -1, loopDelay: 400 });
        const { expand = {}, contract = {}, scaleY = 1.6 } = config;
        const duration1 = (_a = expand.duration) !== null && _a !== void 0 ? _a : 35;
        const holdDelay = (_b = expand.hold) !== null && _b !== void 0 ? _b : 120;
        const duration2 = (_c = contract.duration) !== null && _c !== void 0 ? _c : 450;
        let offset1 = 0;
        let offset2 = duration1;
        this.bars.forEach((bar, i) => {
            this.timeline.add({
                targets: bar,
                scaleY,
                duration: duration1,
                ease: BezierEasing(0.0, 0.5, 0.5, 0.1),
                offset: offset1
            });
            this.timeline.add({
                targets: bar,
                scaleY: 1,
                duration: duration2,
                ease: Phaser.Math.Easing.Cubic.Out,
                offset: offset2
            });
            offset1 += duration1 + holdDelay;
            offset2 += duration1 + holdDelay;
        });
        return this;
    }
    play() {
        if (!this.timeline) {
            this.make();
        }
        this.timeline.play();
        return this;
    }
    layout() {
        if (this.bars.length < 3) {
            return;
        }
        const { x, y } = this.position;
        const left = this.bars[0];
        left.x = x - this.barWidth - this.gap;
        left.y = y;
        const middle = this.bars[1];
        middle.x = x;
        middle.y = y;
        const right = this.bars[2];
        right.x = x + this.barWidth + this.gap;
        right.y = y;
    }
}
