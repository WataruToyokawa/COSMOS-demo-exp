import DotsGrid from './DotsGrid';
export default class DotsGridColors extends DotsGrid {
    constructor(scene, x, y, width = 128, height = 128, color = 0xffffff) {
        super(scene, x, y, width, height, color);
        this.colors = [];
        this.colorIndex = 0;
        this.colors.push(color);
    }
    static create(scene, x, y, width = 128, height = 128, color = 0xffffff) {
        return new DotsGridColors(scene, x, y, width, height, color);
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
        for (let i = 0; i < this.ordering.length; ++i) {
            const color = this.getColor();
            const group = this.ordering[i];
            for (let j = 0; j < group.length; ++j) {
                const dot = this.dots[group[j]];
                dot.fillColor = color;
            }
        }
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
