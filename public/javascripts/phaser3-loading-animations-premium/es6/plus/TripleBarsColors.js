import TripleBars from '../basic/TripleBars';
export default class TripleBarsColors extends TripleBars {
    constructor(scene, x, y, color = 0xffffff) {
        super(scene, x, y, color);
        this.colors = [];
        this.colorIndex = 0;
        this.colors.push(color);
    }
    static create(scene, x, y, color = 0xffffff) {
        return new TripleBarsColors(scene, x, y, color);
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
