function splitData(data, testSize) {
    if (testSize === void 0) { testSize = 0.2; }
    var trainData = [], testData = [], n = data[1].length;
    if (data[0].length != data[1].length) {
        console.log(data[0].length, data[1].length);
        throw new Error("invalid data shape");
    }
    return [trainData, testData];
}
function createSample(d, n) {
    var data = [];
    for (var i = 0; i < n; i++) {
        data[i] = [];
        for (var j = 0; j < d; j++) {
            data[i][j] = Math.floor(randn());
        }
    }
    return data;
}
function createLabel(d, c, n) {
    var data = [];
    for (var i = 0; i < n; i++) {
        data[i] = [];
        for (var j = 0; j < d; j++) {
            data[i][j] = 0;
            if (j == (c - 1)) {
                data[i][j] = 1;
            }
        }
    }
    return data;
}
function randn(m, v) {
    if (m === void 0) { m = 0.0; }
    if (v === void 0) { v = 1.0; }
    var a = 1 - Math.random(), b = 1 - Math.random(), c = Math.sqrt(-2 * Math.log(a));
    if (0.5 - Math.random() > 0) {
        return c * Math.sin(Math.PI * 2 * b) * v + m;
    }
    else {
        return c * Math.cos(Math.PI * 2 * b) * v + m;
    }
}
//# sourceMappingURL=utils.js.map