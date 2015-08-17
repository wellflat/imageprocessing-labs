/// <reference path="../scripts/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../deeplearning/scripts/vector.ts" />

describe("Vector",() => {
    
    var v1: ml.Vector, v2: ml.Vector, v3: ml.Vector;

    beforeEach(() => {
        v1 = new ml.Vector([1, 2, 3, 4, 5]);
        v2 = new ml.Vector([6, 7, 8, 9, 10]);
        v3 = new ml.Vector([1, 2, 3]);
    });
    
    it("can create", () => {
        var v: ml.Vector = ml.Vector.create([1, 2, 3]);
        expect(v.size).toBe(3);
        expect(v.toString()).toBe("[1, 2, 3]");
    });

    it("can rand", () => {
        var v: ml.Vector = ml.Vector.rand(5);
        expect(v.size).toBe(5);
        v.map(x => expect(x).toBeGreaterThan(0.0));
        v.map(x => expect(x).toBeLessThan(1.0));
    });

    it("can zeros", () => {
        var v: ml.Vector = ml.Vector.zeros(10);
        expect(v.size).toBe(10);
        v.map(x => expect(x).toBe(0));
    });

    it("can arange", () => {
        var v: ml.Vector = new ml.Vector([0, 1, 2, 3, 4]);
        expect(ml.Vector.arange(5)).toEqual(v);
    });

    it("can clone", () => {
        var v: ml.Vector = new ml.Vector([1, 2, 3, 4, 5]);
        expect(v1.clone()).toEqual(v);
    });

    it("can at", () => {
        expect(v1.at(1)).toBe(1);
        expect(v1.at(2)).toBe(2);
        expect(v1.at(3)).toBe(3);
        //expect(v1.at(0)).toBeNull();
        //expect(v1.at(10)).toBeNull();
    });

    it("can add", () => {
        var v: ml.Vector = new ml.Vector([7, 9, 11, 13, 15]);
        expect(v1.add(v2)).toEqual(v);
        expect(v1.add(v3)).toBeNull();
    });

    it("can subtract", () => {
        var v: ml.Vector = new ml.Vector([-5, -5, -5, -5, -5]);
        expect(v1.subtract(v2)).toEqual(v);
        expect(v1.subtract(v3)).toBeNull();
    });

    it("can multiply", () => {
        var v: ml.Vector = new ml.Vector([2, 4, 6, 8, 10]);
        expect(v1.multiply(2)).toEqual(v);
    });

    it("can dot", () => {
        expect(v1.dot(v2)).toBe(130);
        expect(v1.dot(v3)).toBeNull();
    });

    it("can cross", () => {
        var a: ml.Vector = new ml.Vector([1, 2, 3]);
        var b: ml.Vector = new ml.Vector([4, 5, 6]);
        var v: ml.Vector = new ml.Vector([-3, 6, -3]);
        expect(a.cross(v1)).toBeNull();
        expect(a.cross(b)).toEqual(v);
    });

    it("can mean", () => {
        var mean: number = 0;
        expect(v1.mean()).toBe(3);
        expect(v2.mean()).toBe(8);
    });
});