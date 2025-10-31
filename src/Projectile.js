export default class Projectile {
    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 5;
        this.color = 'yellow';
        this.dx = dx;
        this.dy = dy;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
}