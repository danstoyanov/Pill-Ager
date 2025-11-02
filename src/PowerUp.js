export default class PowerUp {
    constructor(x, y, type, image) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.image = image;
        this.width = 50;
        this.height = 50;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}