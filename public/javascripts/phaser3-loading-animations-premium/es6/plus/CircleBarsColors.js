import CircleBars from '../basic/CircleBars';
export default class CircleBarsColors extends CircleBars {
    constructor(scene, x, y, radius = 64, color = 0xffffff) {
        super(scene, x, y, radius, color);
        this.colors = [];
        this.colorIndex = 0;
        this.colors.push(color);
    }
    static create(scene, x, y, radius = 64, color = 0xffffff) {
        return new CircleBarsColors(scene, x, y, radius, color);
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
        this.bars.forEach(bar => {
            bar.fillColor = this.getColor();
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
