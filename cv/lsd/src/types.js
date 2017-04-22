class Vec4 {
    constructor(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
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
    constructor(
        x1 = 0, y1 = 0, x2 = 0, y2 = 0,
        width = 0, height = 0, x = 0, y = 0, theta = 0,
        dx = 0, dy = 0, prec = 0, p = 0
    ) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.theta = theta;
        this.dx = dx;
        this.dy = dy;
        this.prec = prec;
        this.p = p;
    }
    /**
     * @param {Rect} rect
     */
    copy(rect) {
        this.x1 = rect.x1;
        this.y1 = rect.y1;
        this.x2 = rect.x2;
        this.y2 = rect.y2;
        this.width = rect.width;
        this.height = rect.height;
        this.x = rect.x;
        this.y = rect.y;
        this.theta = rect.theta;
        this.dx = rect.dx;
        this.dy = rect.dy;
        this.prec = rect.prec;
        this.p = rect.p;
    }
}

class Edge {
    constructor() {
        this.p = new Point();
        this.taken = null;
    }
}

export {
    Vec4, Point, CoorList, RegionPoint, Rect, Edge
};