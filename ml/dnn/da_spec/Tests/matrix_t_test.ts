/// <reference path="../scripts/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../deeplearning/scripts/vector_t.ts" />
/// <reference path="../../deeplearning/scripts/matrix_t.ts" />

describe("Matrix", () => {
    var d1: number[][] = [[1, 2], [0, -1], [5, 1]];
    var d2: number[][] = [[1, -2, 4, 0], [0, -1, 2, 3]];
    var d3: number[][] = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    var d4: number[][] = [[3, 2, 1], [6, 5, 4], [9, 8, 7]];
    var m1: ml.MatrixT, m2: ml.MatrixT, m3: ml.MatrixT, m4: ml.MatrixT, m5: ml.MatrixT;
    beforeEach(() => {
        m1 = new ml.MatrixT(d1);
        m2 = new ml.MatrixT(d2);
        m3 = new ml.MatrixT(d3)
        m4 = new ml.MatrixT(d4);
        m5 = new ml.MatrixT([[]]);
    });

    it("can create", () => {
        expect(m1.rows).toBe(3);
        expect(m1.cols).toBe(2);
        expect(m1.shape).toEqual([3, 2]);
        expect(m5.cols).toBe(0);
    });

    it("can rand", () => {
        var m: ml.MatrixT = ml.MatrixT.rand(2, 4);
        expect(m.shape).toEqual([2, 4]);
        m.map(n => expect(n).toBeGreaterThan(0.0));
        m.map(n => expect(n).toBeLessThan(1.0));
    });

    it("can zeros", () => {
        var m: ml.MatrixT = ml.MatrixT.zeros(5, 10);
        expect(m.shape).toEqual([5, 10]);
        m.map(n => expect(n).toBe(0));
    });

    it("can row", () => {
        var v: ml.VectorT = new ml.VectorT([1, 2]);
        expect(m1.row(1)).toEqual(v);
        expect(() => m1.row(0)).toThrowError();
        expect(() => m1.row(10)).toThrowError();
    });

    it("can col", () => {
        var v: ml.VectorT = new ml.VectorT([1, 0, 5]);
        expect(m1.col(1)).toEqual(v);
        expect(() => m1.col(0)).toThrowError();
        expect(() => m1.col(10)).toThrowError();
    });

    it("can at", () => {
        expect(m4.at(1, 1)).toBe(3);
        expect(m4.at(2, 2)).toBe(5);
        expect(m4.at(3, 3)).toBe(7);
        expect(() => m1.at(0, 1)).toThrowError();
        expect(() => m1.at(1, 0)).toThrowError();
        expect(() => m1.at(10, 0)).toThrowError();
        expect(() => m1.at(0, 10)).toThrowError();
    });

    it("can add", () => {
        var m: ml.MatrixT = new ml.MatrixT([[4, 4, 4], [10, 10, 10], [16, 16, 16]]);
        expect(m3.add(m4)).toEqual(m);
        expect(() => m1.add(m2)).toThrowError();
    });

    it("can subtruct", () => {
        var m: ml.MatrixT = new ml.MatrixT([[-2, 0, 2], [-2, 0, 2], [-2, 0, 2]]);
        expect(m3.subtract(m4)).toEqual(m);
        expect(() => m1.subtract(m2)).toThrowError();
    });

    it("can multiply", () => {
        var m: ml.MatrixT = m1.multiply(3);
        var t1: ml.MatrixT = new ml.MatrixT([[3, 6], [0, -3], [15, 3]]);
        var t2: ml.MatrixT = new ml.MatrixT([[3, 12], [0, 3], [75, 3]]);
        expect(m.shape).toEqual([3, 2]);
        expect(m).toEqual(t1);
        var mxt1: ml.MatrixT = m1.multiply(t1);
        expect(mxt1.shape).toEqual([3, 2]);
        expect(mxt1).toEqual(t2);
        expect(() => m1.multiply(m2)).toThrowError(); // TypeError
    });

    it("can dot", () => {
        var m: ml.MatrixT = m1.dot(m2);
        var t1: ml.MatrixT = new ml.MatrixT([[1, -4, 8, 6], [0, 1, -2, -3], [5, -11, 22, 3]]);
        var t2: ml.MatrixT = new ml.MatrixT([[3, 6], [0, -3], [15, 3]]);
        expect(m.shape).toEqual([3, 4]);
        expect(m).toEqual(t1);
        expect(m1.dot(3)).toEqual(t2);
        expect(() => m1.dot(m3)).toThrowError();
    });

    it("can transpose", () => {
        var m: ml.MatrixT = new ml.MatrixT([[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
        expect(m3.transpose()).toEqual(m);
    });

    it("can addBias", () => {
        var b: ml.VectorT = new ml.VectorT([1, 2, 3]);
        var m: ml.MatrixT = new ml.MatrixT([[2, 4, 6], [5, 7, 9], [8, 10, 12]]);
        expect(m3.addBias(b)).toEqual(m);
        expect(() => m1.addBias(b)).toThrowError();
    });

    it("can mean", () => {
        var m2mean: ml.VectorT = new ml.VectorT([0.5, -1.5, 3, 1.5]);
        var m2mean1: ml.VectorT = new ml.VectorT([0.75, 1]);
        var m3mean: ml.VectorT = new ml.VectorT([4, 5, 6]);
        var m3mean1: ml.VectorT = new ml.VectorT([2, 5, 8]);
        expect(m2.mean()).toEqual(m2mean);
        expect(m3.mean()).toEqual(m3mean);
        expect(m2.mean(1)).toEqual(m2mean1);
        expect(m3.mean(1)).toEqual(m3mean1);
    });

    it("can map", () => {
        var m3x2: ml.MatrixT = m3.map((x: number): number => {
            return x * 2;
        });
        var m: ml.MatrixT = new ml.MatrixT([[2, 4, 6], [8, 10, 12], [14, 16, 18]]);
        expect(m3x2).toEqual(m);
    });

    it("can toString", () => {
        expect(m1.toString()).toBe("[1, 2]\n[0, -1]\n[5, 1]");
        expect(m2.toString(true)).toBe("[1, -2, 4, 0]\n[0, -1, 2, 3]");
    });
});