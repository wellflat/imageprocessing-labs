class Vec4 {
    /**
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}

class Point {
    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }
}

class CoorList {
    constructor() {
        this.p = new Point();
        /** @type {CoorList} */
        this.next = null;
    }
}

class RegionPoint {
    constructor(x = 0, y = 0, angle = 0.0, modgrad = 0.0, used = null) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.modgrad = modgrad;
        /** @type {number} */
        this.used = used;
    }
}

class Rect {
    constructor() {
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.width = 0;
        this.height = 0;
        this.x = 0;
        this.y = 0;
        this.theta = 0;
        this.dx = 0;
        this.dy = 0;
        this.prec = 0;
        this.p = 0;
    }
}

export {
    Vec4, Point, CoorList, RegionPoint, Rect
}