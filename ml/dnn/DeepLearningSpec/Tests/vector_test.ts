/// <reference path="../Scripts/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../deeplearning/scripts/vector.ts" />

describe("Vector",() => {
    
    var v1: rt.Vector, v2: rt.Vector, v3: rt.Vector;

    beforeEach(() => {
        v1 = new rt.Vector([1, 2, 3, 4, 5]);
        v2 = new rt.Vector([6, 7, 8, 9, 10]);
        v3 = new rt.Vector([1, 2, 3]);
    });
    
    it("can create",() => {
        var v: rt.Vector = rt.Vector.create([1, 2, 3]);
        expect(v.size).toBe(3);
        expect(v.toString()).toBe("[1, 2, 3]");
    });

    it("can rand",() => {
        var v: rt.Vector = rt.Vector.rand(5);
        expect(v.size).toBe(5);
        v.map(x => expect(x).toBeGreaterThan(0.0));
        v.map(x => expect(x).toBeLessThan(1.0));
    });

    it("can zeros",() => {
        var v: rt.Vector = rt.Vector.zeros(10);
        expect(v.size).toBe(10);
        v.map(x => expect(x).toBe(0));
    });

    it("can arange",() => {
        var v: rt.Vector = new rt.Vector([0, 1, 2, 3, 4]);
        expect(rt.Vector.arange(5)).toEqual(v);
    });

    it("can clone",() => {
        var v: rt.Vector = new rt.Vector([1, 2, 3, 4, 5]);
        expect(v1.clone()).toEqual(v);
    });

    it("can at",() => {
        expect(v1.at(1)).toBe(1);
        expect(v1.at(2)).toBe(2);
        expect(v1.at(3)).toBe(3);
        expect(v1.at(0)).toBeNull();
        expect(v1.at(10)).toBeNull();
    });

    it("can add",() => {
        var v: rt.Vector = new rt.Vector([7, 9, 11, 13, 15]);
        expect(v1.add(v2)).toEqual(v);
        expect(v1.add(v3)).toBeNull();
    });

    it("can subtract",() => {
        var v: rt.Vector = new rt.Vector([-5, -5, -5, -5, -5]);
        expect(v1.subtract(v2)).toEqual(v);
        expect(v1.subtract(v3)).toBeNull();
    });

    it("can multiply",() => {
        var v: rt.Vector = new rt.Vector([2, 4, 6, 8, 10]);
        expect(v1.multiply(2)).toEqual(v);
    });

    it("can dot",() => {
        expect(v1.dot(v2)).toBe(130);
        expect(v1.dot(v3)).toBeNull();
    });

    it("can cross",() => {
        var a: rt.Vector = new rt.Vector([1, 2, 3]);
        var b: rt.Vector = new rt.Vector([4, 5, 6]);
        var v: rt.Vector = new rt.Vector([-3, 6, -3]);
        expect(a.cross(v1)).toBeNull();
        expect(a.cross(b)).toEqual(v);
    });
});