export default class Vec4 {
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
    /**
     * dot product
     * @param {Vec4} v
     */
    dot(v) {
        
    }
    /**
     * multiply element-wise
     * @param {Vec4} v
     * @return {Vec4}
     */
    mul(v) {
        return new Vec4(
            this.x1 * v.x1,
            this.y1 * v.y1,
            this.x2 * v.x2,
            this.y2 * v.y2
        );
    }
}
