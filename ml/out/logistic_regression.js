var ml;
(function (ml) {
    var LogisticRegression = (function () {
        function LogisticRegression(input, label, W, b) {
            if (W === void 0) { W = ml.Matrix.zeros(input.cols, label.cols); }
            if (b === void 0) { b = ml.Vector.zeros(label.cols); }
            this.input = input;
            this.label = label;
            this.W = W;
            this.b = b;
        }
        LogisticRegression.prototype.fit = function (learningRate, iter, l2Reg, verbose) {
            if (l2Reg === void 0) { l2Reg = 0.00; }
            if (verbose === void 0) { verbose = false; }
            for (var i = 0; i < iter; i++) {
                this.train(learningRate, l2Reg);
                if (i % 10 == 0) {
                    var loss = this.getLoss();
                    if (verbose) {
                        console.log("Loss: " + loss.toString());
                    }
                    learningRate *= 0.995;
                }
            }
        };
        LogisticRegression.prototype.train = function (learningRate, l2Reg) {
            if (l2Reg === void 0) { l2Reg = 0.00; }
            var prob = this.softmax(this.input.dot(this.W).addBias(this.b)), dy = prob.subtract(this.label), gradW = this.input.transpose().dot(dy).subtract(this.W.multiply(l2Reg)), gradB = dy.mean(0);
            this.W = this.W.subtract(gradW.multiply(learningRate)),
                this.b = this.b.subtract(gradB.multiply(learningRate));
        };
        LogisticRegression.prototype.predict = function (x) {
            return this.softmax(x.dot(this.W).addBias(this.b));
        };
        LogisticRegression.prototype.getLoss = function () {
            var p = this.softmax(this.input.dot(this.W).addBias(this.b)), rows = this.label.rows, cols = this.label.cols, clip = function (x) { return Math.max(1.0e-14, Math.min(1 - 1.0e-14, x)); }, one_t = ml.Matrix.ones(rows, cols).subtract(this.label), logone_p = ml.Matrix.ones(rows, cols).subtract(p).map(clip).log(), tlogp = this.label.multiply(p.map(clip).log()), loss = -(tlogp.add(one_t.multiply(logone_p)).sum(1).mean());
            return loss;
        };
        LogisticRegression.prototype.softmax = function (x) {
            var elements = [];
            for (var i = 0; i < x.rows; i++) {
                elements[i] = [];
                var row = x.elements[i];
                var max = Math.max.apply(null, row);
                var total = 0.0;
                row = row.map(function (value) { return Math.exp(value - max); });
                row.map(function (value) { return total += value; });
                var a = row.map(function (value) { return value / total; });
                for (var j = 0; j < x.cols; j++) {
                    elements[i][j] = a[j];
                }
            }
            return new ml.Matrix(elements);
        };
        LogisticRegression.prototype.softmax2 = function (x) {
            var max = x.max();
            var e = x.map(function (value) { return Math.exp(value - max); });
            var elements = [];
            for (var i = 1; i <= e.rows; i++) {
                elements[i - 1] = [];
                var row = e.row(i);
                var total = 0.0;
                row.map(function (value) { return total += value; });
                var a = row.map(function (value) { return value / total; });
                for (var j = 1; j <= e.cols; j++) {
                    elements[i - 1][j - 1] = a.at(j);
                }
            }
            return new ml.Matrix(elements);
        };
        return LogisticRegression;
    }());
    ml.LogisticRegression = LogisticRegression;
})(ml || (ml = {}));
//# sourceMappingURL=logistic_regression.js.map