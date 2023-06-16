export default class DotsEater {
    constructor(scene, x, y, radius = 48, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.radius = 64;
        this.eaterColor = 0xffffff;
        this.dotsColors = [];
        this.dotsColorIndex = 0;
        this.dotsRadius = 6;
        this.dots = [];
        this.scene = scene;
        this.position.x = x;
        this.position.y = y;
        this.radius = radius;
        this.eaterColor = color;
        this.dotsColors.push(color);
    }
    static create(scene, x, y, radius = 48, color = 0xffffff) {
        return new DotsEater(scene, x, y, radius, color);
    }
    useEaterColor(color) {
        this.eaterColor = color;
        return this;
    }
    useDotColor(...colors) {
        this.dotsColors = colors.slice();
        return this;
    }
    useRadiusForDots(radius) {
        this.dotsRadius = radius;
        return this;
    }
    addToContainer(container, x, y) {
        if (!container) {
            return this;
        }
        if (!this.topJaw || !this.bottomJaw) {
            this.make();
        }
        if (x !== undefined && y !== undefined) {
            this.position.x = x;
            this.position.y = y;
        }
        else if (x !== undefined) {
            this.position.x = x;
        }
        else if (y !== undefined) {
            this.position.y = y;
        }
        this.dots.forEach(dot => {
            container.add(dot);
        });
        if (this.topJaw) {
            container.add(this.topJaw);
        }
        if (this.bottomJaw) {
            container.add(this.bottomJaw);
        }
        this.layout();
        this.reconstructDotsTimeline();
        return this;
    }
    make() {
        var _a, _b;
        (_a = this.topJaw) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this.bottomJaw) === null || _b === void 0 ? void 0 : _b.destroy();
        const { x, y } = this.position;
        const dotRadius = this.dotsRadius;
        // const gap = dotRadius * 4
        // let dx = x + gap
        for (let i = 0; i < 3; ++i) {
            const dot = this.scene.add.circle(x, y, dotRadius, this.getDotColor(), 1);
            this.dots.push(dot);
            // dx += gap
        }
        this.topJaw = this.scene.add.arc(x, y, this.radius, 90, 270, false, this.eaterColor, 1)
            .setAngle(90);
        this.bottomJaw = this.scene.add.arc(x, y, this.radius, 90, 270, false, this.eaterColor, 1)
            .setAngle(-90);
        this.layout();
        return this;
    }
    play(config = {}) {
        var _a, _b;
        if (!this.topJaw || !this.bottomJaw) {
            this.make();
        }
        (_a = this.eaterTimeline) === null || _a === void 0 ? void 0 : _a.destroy();
        (_b = this.dotsTimeline) === null || _b === void 0 ? void 0 : _b.destroy();
        const { eatSpeedMultiplier = 1, dotSpeedMultiplier = 1 } = config;
        this.cachedConfig = config;
        this.eaterTimeline = this.scene.tweens.timeline({
            loop: -1
        });
        const eatDuration = 300 / eatSpeedMultiplier;
        this.eaterTimeline.add({
            targets: this.topJaw,
            angle: this.topJaw.angle - 45,
            yoyo: true,
            duration: eatDuration,
            offset: 0
        });
        this.eaterTimeline.add({
            targets: this.bottomJaw,
            angle: this.bottomJaw.angle + 45,
            yoyo: true,
            duration: eatDuration,
            offset: 0
        });
        this.eaterTimeline.play();
        this.constructDotsTimeline(dotSpeedMultiplier);
        if (this.dotsTimeline) {
            this.dotsTimeline.play();
        }
        return this;
    }
    reconstructDotsTimeline() {
        var _a;
        if (!this.dotsTimeline) {
            return;
        }
        const { dotSpeedMultiplier = 1 } = (_a = this.cachedConfig) !== null && _a !== void 0 ? _a : {};
        this.constructDotsTimeline(dotSpeedMultiplier);
        if (this.dotsTimeline) {
            this.dotsTimeline.play();
        }
    }
    constructDotsTimeline(dotSpeedMultiplier = 1) {
        if (this.dotsTimeline) {
            this.dotsTimeline.stop();
            this.dotsTimeline.resetTweens(true);
            this.dotsTimeline.destroy();
        }
        this.dotsTimeline = this.scene.tweens.timeline({
            loop: -1
        });
        const dotRadius = this.dotsRadius;
        const gap = dotRadius * 4;
        const dotDuration = 250 / dotSpeedMultiplier;
        const size = this.dots.length;
        for (let i = 0; i < size; ++i) {
            const dot = this.dots[i];
            const nextDot = i < size - 1 ? this.dots[i + 1] : null;
            this.dotsTimeline.add({
                targets: dot,
                x: dot.x - gap,
                duration: dotDuration,
                offset: 0,
                onComplete: () => {
                    dot.x += gap;
                    if (nextDot) {
                        dot.fillColor = nextDot.fillColor;
                    }
                    else {
                        dot.alpha = 0;
                        dot.fillColor = this.getDotColor();
                    }
                }
            });
        }
        const lastDot = this.dots[this.dots.length - 1];
        lastDot.alpha = 0;
        this.dotsTimeline.add({
            targets: lastDot,
            alpha: 1,
            duration: dotDuration * 0.8,
            offset: 0
        });
    }
    getDotColor() {
        if (this.dotsColorIndex > this.dotsColors.length - 1) {
            this.dotsColorIndex = 0;
        }
        const color = this.dotsColors[this.dotsColorIndex];
        ++this.dotsColorIndex;
        return color;
    }
    layout() {
        const { x, y } = this.position;
        const dotRadius = this.dotsRadius;
        const gap = dotRadius * 4;
        let dx = x + gap;
        for (let i = 0; i < this.dots.length; ++i) {
            const dot = this.dots[i];
            dot.x = dx;
            dot.y = y;
            // const dot = this.scene.add.circle(dx, y, dotRadius, this.getDotColor(), 1)
            // this.dots.push(dot)
            dx += gap;
        }
        if (this.topJaw) {
            this.topJaw.x = x;
            this.topJaw.y = y;
        }
        if (this.bottomJaw) {
            this.bottomJaw.x = x;
            this.bottomJaw.y = y;
        }
        // this.topJaw = this.scene.add.arc(x, y, this.radius, 90, 270, false, this.eaterColor, 1)
        // 	.setAngle(90)
        // this.bottomJaw = this.scene.add.arc(x, y, this.radius, 90, 270, false, this.eaterColor, 1)
        // 	.setAngle(-90)
    }
}
