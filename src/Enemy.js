export default class Enemy {
    constructor(canvas, x, y, color, health, type, image) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.color = color;
        this.speed = 2;
        this.health = health;
        this.type = type;
        this.image = image;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update(player) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }
}