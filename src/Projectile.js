export default class Projectile {
    constructor(x, y, dx, dy, image) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.image = image;
        this.dx = dx;
        this.dy = dy;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
}