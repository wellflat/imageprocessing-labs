export default class Edge {
    constructor() {
        this.p = { x: 0.0, y: 0.0 };
        this.taken = null;
    }
    get p() {
        return this.p;
    }
    set p({x, y}) {
        this.p.x = x;
        this.p.y = y;
    }
    setX(x) {
        this.p.x = x;
    }
    setY(y) {
        this.p.y = y;
    }
    get taken() {
        return this.taken;
    }
    set taken(taken) {
        this.taken = taken;
    }

}