export default class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.width = 20;
        this.height = 20;
        this.color = 'blue';
        this.speed = 5;
        this.dx = 0;
        this.dy = 0;
        this.experience = 0;
        this.level = 1;
        this.maxExperience = 100;
        this.health = 100;
        this.maxHealth = 100;
        this.lastMoveDirection = 'right';
        this.weaponType = 'default';
        this.powerUpActive = false;
        this.powerUpTimer = 0;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        this.detectWalls();
    }

    detectWalls() {
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > this.canvas.width) {
            this.x = this.canvas.width - this.width;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.y + this.height > this.canvas.height) {
            this.y = this.canvas.height - this.height;
        }
    }

    moveUp() {
        this.dy = -this.speed;
        this.lastMoveDirection = 'up';
    }

    moveDown() {
        this.dy = this.speed;
        this.lastMoveDirection = 'down';
    }

    moveLeft() {
        this.dx = -this.speed;
        this.lastMoveDirection = 'left';
    }

    moveRight() {
        this.dx = this.speed;
        this.lastMoveDirection = 'right';
    }

    stopX() {
        this.dx = 0;
    }

    stopY() {
        this.dy = 0;
    }
}