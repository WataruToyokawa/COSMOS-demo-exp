import Phaser from 'phaser';
export var TailType;
(function (TailType) {
    TailType[TailType["NONE"] = 0] = "NONE";
    TailType[TailType["BOTTOM_LEFT"] = 1] = "BOTTOM_LEFT";
    TailType[TailType["BOTTOM_RIGHT"] = 2] = "BOTTOM_RIGHT";
    TailType[TailType["TOP_LEFT"] = 3] = "TOP_LEFT";
    TailType[TailType["TOP_RIGHT"] = 4] = "TOP_RIGHT";
})(TailType || (TailType = {}));
export default class TypingBubble {
    constructor(scene, x, y, width = 96, height = 64, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.width = 128;
        this.height = 64;
        this.color = 0xffffff;
        this.dotsRadius = 6;
        this.dotsGap = this.dotsRadius * 4;
        this.dotsColors = [0x000000];
        this.dotsColorIndex = 0;
        this.dots = [];
        this.tail = TailType.NONE;
        this.enableStroke = false;
        this.strokeWidth = 8;
        this.strokeColor = 0x000000;
        this.scene = scene;
        this.position.x = x;
        this.position.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    static create(scene, x, y, width = 96, height = 64, color = 0xffffff) {
        return new TypingBubble(scene, x, y, width, height, color);
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
    useStroke(color, lineWidth) {
        this.enableStroke = true;
        this.strokeColor = color;
        this.strokeWidth = lineWidth;
        return this;
    }
    useRadiusForDots(radius) {
        this.dotsRadius = radius;
        return this;
    }
    useGapForDots(gap) {
        this.dotsGap = gap;
        return this;
    }
    useColorForDots(...color) {
        this.dotsColors = color.slice();
        return this;
    }
    useTail(type) {
        this.tail = type;
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
        if (!this.graphics) {
            this.make();
        }
        if (this.graphics) {
            container.add(this.graphics);
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
        var _a;
        (_a = this.graphics) === null || _a === void 0 ? void 0 : _a.destroy();
        while (this.dots.length > 0) {
            this.dots.pop().destroy();
        }
        const { x, y } = this.position;
        const halfWidth = this.width * 0.5;
        const halfHeight = this.height * 0.5;
        const path = new Phaser.Curves.Path(0, 0);
        path.moveTo(-halfWidth, 0);
        path.cubicBezierTo(new Phaser.Math.Vector2(-halfWidth, -halfHeight), new Phaser.Math.Vector2(-halfWidth, -halfHeight), new Phaser.Math.Vector2(-halfWidth * 0.5, -halfHeight));
        path.lineTo(this.width - halfWidth * 1.5, -halfHeight);
        path.cubicBezierTo(new Phaser.Math.Vector2(halfWidth, -halfHeight), new Phaser.Math.Vector2(halfWidth, -halfHeight), new Phaser.Math.Vector2(halfWidth, 0));
        path.cubicBezierTo(new Phaser.Math.Vector2(halfWidth, halfHeight), new Phaser.Math.Vector2(halfWidth, halfHeight), new Phaser.Math.Vector2(halfWidth * 0.5, halfHeight));
        path.lineTo(-halfWidth * 0.5, halfHeight);
        path.cubicBezierTo(new Phaser.Math.Vector2(-halfWidth, halfHeight), new Phaser.Math.Vector2(-halfWidth, halfHeight), new Phaser.Math.Vector2(-halfWidth, 0));
        path.closePath();
        this.graphics = this.scene.add.graphics({ x, y });
        this.graphics.fillStyle(this.color, 1);
        const tail = this.getTail(this.tail);
        if (tail) {
            this.graphics.fillPoints(tail.getPoints());
        }
        this.graphics.fillPoints(path.getPoints());
        if (this.enableStroke) {
            this.graphics.lineStyle(this.strokeWidth, this.strokeColor, 1);
            path.draw(this.graphics);
            if (tail) {
                tail.draw(this.graphics);
            }
        }
        for (let i = 0; i < 3; ++i) {
            const dot = this.scene.add.circle(x, y, this.dotsRadius, this.getDotColor(), 1);
            this.dots.push(dot);
        }
        this.layout();
        return this;
    }
    play(config = {}) {
        if (!this.graphics) {
            this.make();
        }
        const { dotFadeDuration = 400, dotFadeOffset = 200, dotsFadeOutDuration = 100 } = config;
        this.timeline = this.scene.tweens.timeline({
            loop: -1
        });
        let offset = 0;
        for (let i = 0; i < this.dots.length; ++i) {
            const dot = this.dots[i];
            dot.setAlpha(0);
            this.timeline.add({
                targets: dot,
                alpha: 1,
                duration: dotFadeDuration,
                ease: Phaser.Math.Easing.Sine.In,
                offset
            });
            offset += dotFadeOffset;
        }
        this.timeline.add({
            targets: this.dots,
            alpha: 0,
            duration: dotsFadeOutDuration
        });
        this.timeline.play();
        return this;
    }
    getDotColor() {
        if (this.dotsColorIndex > this.dotsColors.length - 1) {
            this.dotsColorIndex = 0;
        }
        const color = this.dotsColors[this.dotsColorIndex];
        ++this.dotsColorIndex;
        return color;
    }
    getTail(type) {
        if (type === TailType.NONE) {
            return null;
        }
        const halfWidth = this.width * 0.5;
        const halfHeight = this.height * 0.5;
        const th = 16;
        const tw = 14;
        switch (type) {
            case TailType.BOTTOM_RIGHT:
                {
                    const x = halfWidth * 0.6;
                    const y = halfHeight;
                    const tail = new Phaser.Curves.Path(x, y);
                    tail.lineTo(x, y + th);
                    tail.lineTo(x, y + th - (this.strokeWidth * 0.5));
                    tail.cubicBezierTo(new Phaser.Math.Vector2(x - tw, y + th), new Phaser.Math.Vector2(x - tw, y), new Phaser.Math.Vector2(x - tw, y));
                    return tail;
                }
            case TailType.BOTTOM_LEFT:
                {
                    const x = halfWidth * -0.6;
                    const y = halfHeight;
                    const tail = new Phaser.Curves.Path(x, y);
                    tail.lineTo(x, y + th);
                    tail.lineTo(x, y + th - (this.strokeWidth * 0.5));
                    tail.cubicBezierTo(new Phaser.Math.Vector2(x + tw, y + th), new Phaser.Math.Vector2(x + tw, y), new Phaser.Math.Vector2(x + tw, y));
                    return tail;
                }
            case TailType.TOP_LEFT:
                {
                    const x = halfWidth * -0.6;
                    const y = -halfHeight;
                    const tail = new Phaser.Curves.Path(x, y);
                    tail.lineTo(x, y - th);
                    tail.lineTo(x, y - th + (this.strokeWidth * 0.5));
                    tail.cubicBezierTo(new Phaser.Math.Vector2(x + tw, y - th), new Phaser.Math.Vector2(x + tw, y), new Phaser.Math.Vector2(x + tw, y));
                    return tail;
                }
            case TailType.TOP_RIGHT:
                {
                    const x = halfWidth * 0.6;
                    const y = -halfHeight;
                    const tail = new Phaser.Curves.Path(x, y);
                    tail.lineTo(x, y - th);
                    tail.lineTo(x, y - th + (this.strokeWidth * 0.5));
                    tail.cubicBezierTo(new Phaser.Math.Vector2(x - tw, y - th), new Phaser.Math.Vector2(x - tw, y), new Phaser.Math.Vector2(x - tw, y));
                    return tail;
                }
        }
        return null;
    }
    layout() {
        if (this.graphics) {
            this.graphics.x = this.position.x;
            this.graphics.y = this.position.y;
        }
        const { x, y } = this.position;
        let dx = x - this.dotsGap;
        for (let i = 0; i < this.dots.length; ++i) {
            const dot = this.dots[i];
            dot.x = dx;
            dot.y = y;
            // const dot = this.scene.add.circle(dx, y, this.dotsRadius, this.getDotColor(), 1)
            // this.dots.push(dot)
            dx += this.dotsGap;
        }
    }
}
