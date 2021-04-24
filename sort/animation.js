const speed = 10; // 动画速度

class Rect {
    constructor(value, ctx, x, y, w, h) {
        this.value = value;
        this.ctx = ctx;
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.w = Math.floor(w);
        this.h = Math.floor(h);
        this.isReady = false;
        this.isMoving = false;
    }
    show() {
        if (this.isReady) {
            this.ctx.fillStyle = 'blue';
        } else if (this.isMoving) {
            this.ctx.fillStyle = 'red';
        } else {
            this.ctx.fillStyle = 'black';
        }
        this.ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    clear() {
        this.ctx.clearRect(this.x, this.y, this.w, this.h);
    }
    toReady(isReady, next) {
        this.isReady = isReady;
        this.show();
        next();
    }
    moveX(x, next) {
        let end = this.x + x;
        let rect = this;
        this.isMoving = true;
        move();
        function move() {
            rect.clear();
            if (x < 0) {
                if (rect.x <= end) {
                    rect.x = end;
                    rect.isMoving = false;
                    rect.show();
                    next();
                } else {
                    rect.x -= speed;
                    rect.show();
                    requestAnimationFrame(move);
                }
            } else {
                if (rect.x >= end) {
                    rect.x = end;
                    rect.isMoving = false;
                    rect.show();
                    next();
                } else {
                    rect.x += speed;
                    rect.show();
                    requestAnimationFrame(move);
                }
            }
        }
    }
    moveY(y, next) {
        let end = this.y + y;
        let rect = this;
        this.isMoving = true;
        move();
        function move() {
            rect.clear();
            if (y < 0) {
                if (rect.y <= end) {
                    rect.y = end;
                    rect.isMoving = false;
                    rect.show();
                    next();
                } else {
                    rect.y -= speed;
                    rect.show();
                    requestAnimationFrame(move);
                }
            } else {
                if (rect.y >= end) {
                    rect.y = end;
                    rect.isMoving = false;
                    rect.show();
                    next();
                } else {
                    rect.y += speed;
                    rect.show();
                    requestAnimationFrame(move);
                }
            }
        }
    }
}
class Animation {
    constructor(rect, action, arg) {
        this.rect = rect;
        this.action = action;
        this.arg = arg;
    }
}
class AnimSeq {
    constructor() {
        this.AnimArray = [];
        this.isEnd = true;
    }
    push(animation) {
        this.AnimArray.push(animation);
    }
    start() {
        if (this.AnimArray.length != 0) {
            let animation = this.AnimArray.shift();
            animation.rect[animation.action](animation.arg, this.start.bind(this));
        } else {
            this.isEnd = true;
        }
    }
    clear() {
        this.AnimArray = [];
    }
}