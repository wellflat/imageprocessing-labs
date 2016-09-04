var ml;
(function (ml) {
    var Preprocessing = (function () {
        function Preprocessing() {
        }
        Preprocessing.scale = function (data) {
            var rows = data.length, cols = data[0].length, mean = [];
            return new ml.Matrix([[]]);
        };
        Preprocessing.binalizeLabel = function (labels) {
            var max = Math.max.apply(null, labels), len = labels.length, data = [];
            for (var i = 0; i < len; i++) {
                var label = [];
                for (var j = 0; j <= max; j++) {
                    labels[i] == j ? label[j] = 1 : label[j] = 0;
                }
                data[i] = label;
            }
            return data;
        };
        Preprocessing.splitData = function (data, trainSize, testSize) {
            if (trainSize === void 0) { trainSize = 0.75; }
            if (testSize === void 0) { testSize = 0.25; }
            var eps = 2.2204460492503130808472633361816E-16;
            if (1.0 - trainSize + testSize > eps) {
                throw new Error("invalid arguments: trainSize or testSize");
            }
            var trainData = [], trainLabel = [], testData = [], testLabel = [], n = data[1].length;
            if (data[0].length != n) {
                console.log(data[0].length, n);
                throw new Error("invalid data shape");
            }
            return [[trainData, trainLabel], [testData, testLabel]];
        };
        return Preprocessing;
    }());
    ml.Preprocessing = Preprocessing;
})(ml || (ml = {}));
//# sourceMappingURL=preprocessing.js.map