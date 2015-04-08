/// <reference path="../Scripts/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../deeplearning/scripts/vector.ts" />
/// <reference path="../../deeplearning/scripts/matrix.ts" />
/// <reference path="../../deeplearning/scripts/da.ts" />
describe("DenoisingAutoEncoder", function () {
    var da, m1, m2, m3;
    beforeEach(function () {
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
    it("can create", function () {
        da = new rt.DenoisingAutoencoders(m1, 10, 5);
        expect(da.weights.shape).toEqual([10, 5]);
        expect(da.vbias.size).toBe(10);
        expect(da.hbias.size).toBe(5);
        expect(da.data).toEqual(m1);
    });
    it("can train", function () {
        da.data = m1;
        da.train(0.001, 0.3);
        expect(da.data).toEqual(m1);
        expect(function () { return da.train(0.001, 1.1); }).toThrowError();
    });
    it("can reconstruct", function () {
        var m = da.reconstruct(m2);
        expect(m.shape).toEqual([2, 10]);
        expect(function () { return da.reconstruct(m3); }).toThrowError();
    });
});
//# sourceMappingURL=da_test.js.map