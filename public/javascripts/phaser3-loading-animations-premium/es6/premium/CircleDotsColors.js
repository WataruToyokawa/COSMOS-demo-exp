import CircleDots from './CircleDots';
export default class CircleDotsColors extends CircleDots {
    constructor(scene, x, y, radius = 64, color = 0xffffff) {
        super(scene, x, y, radius, color);
        this.colors = [];
        this.colorIndex = 0;
        this.colors.push(color);
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new CircleDotsColors(scene, x, y, radius, color);
    }
    useColor(color) {
        this.colors = [color];
        return this;
    }
    useColors(...colors) {
        this.colors = colors.slice();
        return this;
    }
    make() {
        super.make();
        this.dots.forEach(dot => {
            dot.fillColor = this.getColor();
        });
        return this;
    }
    getColor() {
        if (this.colorIndex > this.colors.length - 1) {
            this.colorIndex = 0;
        }
        const color = this.colors[this.colorIndex];
        ++this.colorIndex;
        return color;
    }
}
