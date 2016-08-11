"use strict";
var AROW = (function () {
    function AROW(featureSize, r) {
        if (r === void 0) { r = 0.1; }
        this.f = featureSize;
        this.mean = new Float32Array(featureSize);
        this.cov = new Float32Array(featureSize);
        this.cov.fill(1.0);
        this.r = r;
    }
    AROW.prototype.update = function (x, label) {
        var _this = this;
        var margin = this.computeMargin(x);
        var loss = margin * label < 0 ? 1 : 0;
        if (margin * label >= 1) {
            return 0;
        }
        var v = this.computeConfidence(x);
        var beta = 1.0 / (v + this.r);
        var alpha = (1.0 - label * margin) * beta;
        x.forEach(function (e) {
            _this.mean[e.index] += alpha * label * _this.cov[e.index] * e.value;
        });
        x.forEach(function (e) {
            _this.cov[e.index] = 1.0 / ((1.0 / _this.cov[e.index]) + e.value * e.value / _this.r);
        });
        return loss;
    };
    AROW.prototype.predict = function (x) {
        return this.computeMargin(x) > 0 ? 1 : -1;
    };
    AROW.prototype.computeMargin = function (x) {
        var _this = this;
        var res = 0.0;
        x.forEach(function (e) { return res += _this.mean[e.index] * e.value; });
        return res;
    };
    AROW.prototype.computeConfidence = function (x) {
        var _this = this;
        var res = 0.0;
        x.forEach(function (e) { return res += _this.cov[e.index] * e.value * e.value; });
        return res;
    };
    return AROW;
}());
exports.AROW = AROW;
//# sourceMappingURL=arow.js.map