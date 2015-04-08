/// <reference path="../Scripts/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../deeplearning/scripts/vector.ts" />
/// <reference path="../../deeplearning/scripts/matrix.ts" />
/// <reference path="../../deeplearning/scripts/da.ts" />

describe("DenoisingAutoEncoder",() => {
    var da: rt.DenoisingAutoencoders,
        m1: rt.Matrix, m2: rt.Matrix, m3: rt.Matrix;

    beforeEach(() => {
        m1 = new rt.Matrix([
            [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [1, 0, 1, 1, 0, 0, 0, 1, 0, 0],
            [1, 1, 0, 1, 1, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
            [1, 1, 0, 1, 0, 1, 0, 0, 0, 1],
        ]);
        m2 = new rt.Matrix([
            [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
        ]);
        m3 = new rt.Matrix([[1], [2, 3], [4, 5, 6]]);
    });

    it("can create",() => {
        da = new rt.DenoisingAutoencoders(m1, 10, 5);
        expect(da.weights.shape).toEqual([10, 5]);
        expect(da.vbias.size).toBe(10);
        expect(da.hbias.size).toBe(5);
        expect(da.data).toEqual(m1);
    });

    it("can train",() => {
        da.data = m1;
        da.train(0.001, 0.3);
        expect(da.data).toEqual(m1);
        expect(() => da.train(0.001, 1.1)).toThrowError();
    });

    it("can reconstruct",() => {
        var m: rt.Matrix = da.reconstruct(m2);
        expect(m.shape).toEqual([2, 10]);
        expect(() => da.reconstruct(m3)).toThrowError();
    });
});
