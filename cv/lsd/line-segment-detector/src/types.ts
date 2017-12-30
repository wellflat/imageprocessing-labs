class Vec4 {
    constructor(public x1 = 0, public y1 = 0, public x2 = 0, public y2 = 0) { }
}

class Point {
    constructor(public x = 0.0, public y = 0.0) { }
}

class CoorList {
    p: Point;
    next: CoorList | null;

    constructor() {
        this.p = new Point();
    }
}

class RegionPoint {
    constructor(public x = 0, public y = 0, public angle = 0.0, public modgrad = 0.0, public used?: number) { }
}

class Rect {
    constructor(
        public x1 = 0, public y1 = 0, public x2 = 0, public y2 = 0,
        public width = 0, public height = 0, public x = 0, public y = 0, public theta = 0,
        public dx = 0, public dy = 0, public prec = 0, public p = 0
    ) { }

    copy(rect: Rect) {
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
    p: Point;
    taken?: boolean;

    constructor() {
        this.p = new Point();
    }
}

export {
    Vec4, Point, CoorList, RegionPoint, Rect, Edge
};
