export default class DotsGrid {
    constructor(scene, x, y, width = 128, height = 128, color = 0xffffff) {
        this.position = { x: 0, y: 0 };
        this.width = 128;
        this.height = 128;
        this.color = 0xffffff;
        this.dotRadius = 12;
        this.dots = [];
        this.ordering = [
            [0],
            [1, 3],
            [2, 4, 6],
            [5, 7],
            [8]
        ];
        this.tweens = [];
        this.scene = scene;
        this.position.x = x;
        this.position.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    static create(scene, x, y, width = 128, height = 128, color = 0xffffff) {
        return new DotsGrid(scene, x, y, width, height, color);
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
    useRadiusForDots(radius) {
        this.dotRadius = radius;
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
        if (this.dots.length <= 0) {
            this.make();
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
        while (this.dots.length > 0) {
            this.dots.pop().destroy();
        }
        const { x, y } = this.position;
        for (let i = 0; i < 9; ++i) {
            const dot = this.scene.add.circle(x, y, this.dotRadius, this.color, 1)
                .setAlpha(0.3);
            this.dots.push(dot);
        }
        this.layout();
        return this;
    }
    play(config = {}) {
        if (this.dots.length <= 0) {
            this.make();
        }
        while (this.tweens.length > 0) {
            this.tweens.pop().remove();
        }
        const { reverse = false, spacing = 200, startAlpha = 0.3, fadeDuration = 500 } = config;
        let delay = 0;
        const list = reverse ? this.ordering.slice().reverse() : this.ordering;
        for (let j = 0; j < list.length; ++j) {
            const group = list[j];
            for (let i = 0; i < group.length; ++i) {
                const dots = group.map(idx => this.dots[idx]);
                this.scene.tweens.add({
                    targets: dots,
                    alpha: 1,
                    duration: fadeDuration,
                    delay,
                    yoyo: true,
                    repeat: -1,
                    onStart: (tween, targets) => {
                        targets.forEach(dot => dot.setAlpha(startAlpha));
                    }
                });
            }
            delay += spacing;
        }
        return this;
    }
    layout() {
        const cellWidth = this.width / 3;
        const cellHeight = this.height / 3;
        let x = this.position.x - (this.width * 0.5);
        let y = this.position.y - (this.height * 0.5);
        for (let i = 0; i < this.dots.length; ++i) {
            if (i && i % 3 === 0) {
                x = this.position.x - (this.width * 0.5);
                y += cellHeight;
            }
            const dot = this.dots[i];
            dot.x = x + cellWidth * 0.5;
            dot.y = y + cellWidth * 0.5;
            x += cellWidth;
        }
    }
}
