import Phaser from 'phaser';
export var Ticks;
(function (Ticks) {
    Ticks[Ticks["HOUR"] = 0] = "HOUR";
    Ticks[Ticks["QUARTER"] = 1] = "QUARTER";
    Ticks[Ticks["HALF"] = 2] = "HALF";
    Ticks[Ticks["TOP"] = 3] = "TOP";
    Ticks[Ticks["LEFT"] = 4] = "LEFT";
    Ticks[Ticks["BOTTOM"] = 5] = "BOTTOM";
    Ticks[Ticks["RIGHT"] = 6] = "RIGHT";
    Ticks[Ticks["NONE"] = 7] = "NONE";
})(Ticks || (Ticks = {}));
export var TickShape;
(function (TickShape) {
    TickShape[TickShape["CIRCLE"] = 0] = "CIRCLE";
    TickShape[TickShape["SQUARE"] = 1] = "SQUARE";
})(TickShape || (TickShape = {}));
export default class Clock {
    constructor(scene, x, y, radius = 48, faceColor = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.radius = 128;
        this.color = 0xffffff;
        this.hourHandColor = 0x000000;
        this.minuteHandColor = 0x000000;
        this.ticks = [];
        this.faceStroke = false;
        this.faceStrokeWidth = 8;
        this.faceStrokeColor = 0x000000;
        this.hour = 0;
        this.ticksType = Ticks.NONE;
        this.ticksShape = TickShape.CIRCLE;
        this.tickColor = 0xffffff;
        this.ticksRadius = 2;
        this.scene = scene;
        this.position.x = x;
        this.position.y = y;
        this.radius = radius;
        this.color = faceColor;
    }
    static create(scene, x, y, radius = 48, faceColor = 0xffffff) {
        return new Clock(scene, x, y, radius, faceColor);
    }
    get x() {
        return this.position.x;
    }
    set x(v) {
        this.position.x = v;
        this.layout();
        this.layoutTicks();
    }
    get y() {
        return this.position.y;
    }
    set y(v) {
        this.position.y = v;
        this.layout();
        this.layoutTicks();
    }
    useFaceColor(color) {
        this.color = color;
        return this;
    }
    useHandColor(color) {
        this.hourHandColor = color;
        this.minuteHandColor = color;
        return this;
    }
    useHourHandColor(color) {
        this.hourHandColor = color;
        return this;
    }
    useMinuteHandColor(color) {
        this.minuteHandColor = color;
        return this;
    }
    useFaceStroke(lineWidth, color) {
        this.faceStroke = true;
        this.faceStrokeWidth = lineWidth;
        this.faceStrokeColor = color;
        return this;
    }
    useHourTicks(type = Ticks.HOUR, color = 0xffffff, size = 4, shape = TickShape.CIRCLE) {
        this.ticksType = type;
        this.tickColor = color;
        this.ticksRadius = size * 0.5;
        this.ticksShape = shape;
        return this;
    }
    addToContainer(container, x, y) {
        if (!container) {
            return this;
        }
        if (!this.face || !this.hourHand || !this.minuteHand) {
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
        if (this.face) {
            container.add(this.face);
        }
        this.ticks.forEach(tick => {
            container.add(tick);
        });
        if (this.hourHand) {
            container.add(this.hourHand);
        }
        if (this.minuteHand) {
            container.add(this.minuteHand);
        }
        this.layout();
        this.layoutTicks();
        return this;
    }
    make() {
        if (this.face) {
            this.face.destroy();
        }
        if (this.minuteHand) {
            this.minuteHand.destroy();
        }
        if (this.hourHand) {
            this.hourHand.destroy();
        }
        const { x, y } = this.position;
        const hourHandWidth = this.radius * 0.75;
        const minuteHandWidth = this.radius * 0.85;
        this.face = this.scene.add.circle(x, y, this.radius, this.color, 1);
        if (this.faceStroke) {
            this.face.setStrokeStyle(this.faceStrokeWidth, this.faceStrokeColor, 1);
        }
        this.makeTicks();
        this.hourHand = this.scene.add.rectangle(x, y, hourHandWidth, 4, this.hourHandColor, 1)
            .setOrigin(0, 0.5);
        this.minuteHand = this.scene.add.rectangle(x, y, minuteHandWidth, 4, this.minuteHandColor, 1)
            .setOrigin(0, 0.5)
            .setAngle(-90);
        return this;
    }
    play(hourDuration = 1500) {
        if (!this.face || !this.hourHand || !this.minuteHand) {
            this.make();
        }
        this.scene.tweens.addCounter({
            from: 0,
            to: 360,
            duration: hourDuration,
            onUpdate: (tween) => {
                const v = tween.getValue();
                const diff = (v - 90) - this.minuteHand.angle;
                this.minuteHand.angle += diff;
                const p = Math.max(0, Math.min(1, v / 360));
                const currentStartAngle = this.hour * 30;
                const hourDiff = p * 30;
                this.hourHand.angle = currentStartAngle + hourDiff;
                if (p === 1) {
                    ++this.hour;
                }
            },
            repeat: -1
        });
        return this;
    }
    getTickConfig(type) {
        let angle = 0;
        let count = 12;
        let interval = 30;
        switch (type) {
            case Ticks.HOUR:
                {
                    count = 12;
                    interval = 30;
                    break;
                }
            case Ticks.QUARTER:
                {
                    count = 4;
                    interval = 90;
                    break;
                }
            case Ticks.HALF:
                {
                    angle = -90;
                    count = 2;
                    interval = 180;
                    break;
                }
            case Ticks.TOP:
                {
                    angle = -90;
                    count = 1;
                    break;
                }
            case Ticks.BOTTOM:
                {
                    angle = 90;
                    count = 1;
                    break;
                }
            case Ticks.LEFT:
                {
                    angle = 180;
                    count = 1;
                    break;
                }
            case Ticks.RIGHT:
                {
                    angle = 0;
                    count = 1;
                    break;
                }
        }
        return {
            angle,
            count,
            interval
        };
    }
    makeTicks() {
        if (this.ticksType === Ticks.NONE) {
            return;
        }
        while (this.ticks.length > 0) {
            this.ticks.pop().destroy();
        }
        const { x, y } = this.position;
        const config = this.getTickConfig(this.ticksType);
        const count = config.count;
        for (let i = 0; i < count; ++i) {
            const tick = this.ticksShape === TickShape.CIRCLE
                ? this.scene.add.circle(x, y, this.ticksRadius, this.tickColor, 1)
                : this.scene.add.rectangle(x, y, this.ticksRadius * 2, this.ticksRadius * 2, this.tickColor, 1);
            this.ticks.push(tick);
        }
        this.layoutTicks();
    }
    layoutTicks() {
        const config = this.getTickConfig(this.ticksType);
        const interval = config.interval;
        let angle = config.angle;
        const len = this.radius * 0.8;
        const vec = new Phaser.Math.Vector2();
        const { x, y } = this.position;
        for (let i = 0; i < this.ticks.length; ++i) {
            vec.setToPolar(Phaser.Math.DEG_TO_RAD * angle, len);
            const tick = this.ticks[i];
            tick.x = x + vec.x;
            tick.y = y + vec.y;
            angle += interval;
        }
    }
    layout() {
        const { x, y } = this.position;
        if (this.face) {
            this.face.x = x;
            this.face.y = y;
        }
        if (this.hourHand) {
            this.hourHand.x = x;
            this.hourHand.y = y;
        }
        if (this.minuteHand) {
            this.minuteHand.x = x;
            this.minuteHand.y = y;
        }
    }
}
