"use strict";
var SCW = (function () {
    function SCW(n, eta, C, type) {
        if (type === void 0) { type = SCW.SCW_I; }
        this.n = n;
        this.eta = eta;
        this.C = C;
        this.mu = new Float32Array(n).fill(0.0);
        this.sigma = [];
        for (var i = 0; i < n; i++) {
            this.sigma[i] = new Float32Array(n).fill(0.0);
        }
        this.phi = this.normcdf(eta);
        for (var i = 0; i < n; i++) {
            this.sigma[i][i] = 1.0;
        }
        this.type = type;
    }
    SCW.prototype.predict = function (x) {
        return this.dot(x, this.mu) < 0.0 ? -1 : 1;
    };
    SCW.prototype.update = function (x, y, verbose) {
        if (verbose === void 0) { verbose = false; }
        var loss = this.loss(x, y);
        if (verbose) {
            console.log('loss: ' + loss.toString());
        }
        if (loss > 0.0) {
            var n = this.n;
            var vt = this.updateConfidence(x);
            var alpha = this.calculateAlpha(x, y, vt);
            var beta = this.calculateBeta(alpha, vt);
            this.updateWeights(alpha, x, y);
            this.updateCovariance(beta, x);
        }
    };
    SCW.prototype.loss = function (x, y) {
        return this.phi * Math.sqrt(this.updateConfidence(x)) - y * this.dot(x, this.mu);
    };
    SCW.prototype.calculateAlpha = function (x, y, vt) {
        var nt = vt + 1.0 / (2.0 * this.C);
        var mt = y * this.dot(x, this.mu);
        var phi = this.phi;
        var alpha = 0.0;
        var tmp = 0.0;
        switch (this.type) {
            case SCW.SCW_I:
                var zeta = phi * phi;
                var psi = 1.0 + (phi * phi) / 2.0;
                tmp = (-mt * psi + Math.sqrt(mt * mt * phi * phi * phi * phi / 4.0 + vt * phi * phi * zeta)) / (vt * zeta);
                var max = tmp > 0.0 ? tmp : 0.0;
                alpha = max > this.C ? this.C : max;
                break;
            case SCW.SCW_II:
                var gamma = phi * Math.sqrt(phi * phi * mt * mt * vt * vt + 4.0 * nt * vt * (nt + vt * phi * phi));
                tmp = (-(2.0 * mt * nt + phi * phi * mt * vt) + gamma) /
                    (2.0 * (nt * nt + nt * vt * phi * phi));
                alpha = tmp > 0.0 ? tmp : 0.0;
                break;
        }
        return alpha;
    };
    SCW.prototype.calculateBeta = function (alpha, vt) {
        var phi = this.phi;
        var tmp = -alpha * vt * phi +
            Math.sqrt(alpha * alpha * vt * vt * phi * phi + 4.0 * vt);
        var ut = tmp * tmp / 4.0;
        var beta = alpha * phi / (Math.sqrt(ut) + vt * alpha * phi);
        return beta;
    };
    SCW.prototype.updateConfidence = function (x) {
        var sigma = this.sigma;
        var n = this.n;
        var tmp = new Float32Array(n).fill(0.0);
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                tmp[i] += sigma[i][j] * x[j];
            }
        }
        return this.dot(x, tmp);
    };
    SCW.prototype.updateWeights = function (alpha, x, y) {
        var n = this.n;
        var sigma = this.sigma;
        var sigx = new Float32Array(n).fill(0.0);
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                sigx[i] += sigma[i][j] * x[j];
            }
        }
        for (var k = 0; k < n; k++) {
            this.mu[k] += alpha * y * sigx[k];
        }
    };
    SCW.prototype.updateCovariance = function (beta, x) {
        var n = this.n;
        var xtx = [];
        for (var a = 0; a < n; a++) {
            xtx[a] = new Float32Array(n).fill(0.0);
        }
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                xtx[i][j] = x[i] * x[j];
            }
        }
        var m = this.prod(this.sigma, this.prod(xtx, this.sigma));
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                this.sigma[i][j] -= beta * m[i][j];
            }
        }
    };
    SCW.prototype.normcdf = function (x) {
        var z = x / Math.sqrt(2.0);
        var ret = 0.0;
        var N = 60;
        for (var n = 0; n <= N; n++) {
            var tmp = 1.0;
            for (var k = 1; k <= n; k++) {
                tmp *= -1.0 * z * z / k;
            }
            ret += z / (2.0 * n + 1.0) * tmp;
        }
        return 1.0 / (0.5 * (1.0 + (2.0 / Math.sqrt(Math.PI) * ret)));
    };
    SCW.prototype.dot = function (x, y) {
        var ret = 0.0;
        var n = this.n;
        for (var i = 0; i < n; i++) {
            ret += x[i] * y[i];
        }
        return ret;
    };
    SCW.prototype.prod = function (m1, m2) {
        var ret = [];
        var n = this.n;
        for (var a = 0; a < n; a++) {
            ret[a] = new Float32Array(n).fill(0.0);
        }
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                for (var k = 0; k < n; k++) {
                    ret[i][j] += m1[i][k] * m2[k][j];
                }
            }
        }
        return ret;
    };
    SCW.SCW_I = 'scw_i';
    SCW.SCW_II = 'scw_ii';
    return SCW;
}());
exports.SCW = SCW;
//# sourceMappingURL=scw.js.map