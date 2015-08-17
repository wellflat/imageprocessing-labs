/// <reference path="../scripts/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../deeplearning/scripts/vector_t.ts" />

describe("VectorT",() => {
    
    var v1: ml.VectorT, v2: ml.VectorT, v3: ml.VectorT;

    beforeEach(() => {
        v1 = new ml.VectorT([1, 2, 3, 4, 5]);
        v2 = new ml.VectorT([6, 7, 8, 9, 10]);
        v3 = new ml.VectorT([1, 2, 3]);
    });
    
    it("can create",() => {
        var v: ml.VectorT = ml.VectorT.create(new Float32Array([1, 2, 3]));
        expect(v.size).toBe(3);
        expect(v.toString()).toBe("[1, 2, 3]");
    });

    it("can rand",() => {
        var v: ml.VectorT = ml.VectorT.rand(5);
        expect(v.size).toBe(5);
        v.map(x => expect(x).toBeGreaterThan(0.0), v.size);
        v.map(x => expect(x).toBeLessThan(1.0), v.size);
    });

    it("can zeros",() => {
        var v: ml.VectorT = ml.VectorT.zeros(10);
        expect(v.size).toBe(10);
        v.map(x => expect(x).toBe(0), v.size);
    });

    it("can arange",() => {
        var v: ml.VectorT = new ml.VectorT([0, 1, 2, 3, 4]);
        expect(ml.VectorT.arange(5)).toEqual(v);
    });

    it("can clone",() => {
        var v: ml.VectorT = new ml.VectorT([1, 2, 3, 4, 5]);
        expect(v1.clone()).toEqual(v);
    });

    it("can at",() => {
        expect(v1.at(1)).toBe(1);
        expect(v1.at(2)).toBe(2);
        expect(v1.at(3)).toBe(3);
        //expect(v1.at(0)).toBeNull();
        //expect(v1.at(10)).toBeNull();
    });

    it("can add",() => {
        var v: ml.VectorT = new ml.VectorT([7, 9, 11, 13, 15]);
        expect(v1.add(v2)).toEqual(v);
        expect(v1.add(v3)).toBeNull();
    });

    it("can subtract",() => {
        var v: ml.VectorT = new ml.VectorT([-5, -5, -5, -5, -5]);
        expect(v1.subtract(v2)).toEqual(v);
        expect(v1.subtract(v3)).toBeNull();
    });

    it("can multiply",() => {
        var v: ml.VectorT = new ml.VectorT([2, 4, 6, 8, 10]);
        expect(v1.multiply(2)).toEqual(v);
    });

    it("can dot",() => {
        expect(v1.dot(v2)).toBe(130);
        expect(v1.dot(v3)).toBeNull();
    });

    it("can cross",() => {
        var a: ml.VectorT = new ml.VectorT([1, 2, 3]);
        var b: ml.VectorT = new ml.VectorT([4, 5, 6]);
        var v: ml.VectorT = new ml.VectorT([-3, 6, -3]);
        expect(a.cross(v1)).toBeNull();
        expect(a.cross(b)).toEqual(v);
    });
});