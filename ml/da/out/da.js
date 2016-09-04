/**
 * Denoising Autoencoders class
 * author @wellflat
 */
var ml;
(function (ml) {
    var DenoisingAutoencoders = (function () {
        function DenoisingAutoencoders(input, nVisible, nHidden, W, vBias, hBias, timestamp) {
            if (W === void 0) { W = ml.Matrix.rand(nVisible, nHidden); }
            if (vBias === void 0) { vBias = ml.Vector.zeros(nVisible); }
            if (hBias === void 0) { hBias = ml.Vector.zeros(nHidden); }
            if (timestamp === void 0) { timestamp = new Date().getTime(); }
            this.input = input;
            this.nVisible = nVisible;
            this.nHidden = nHidden;
            this.W = W;
            this.vBias = vBias;
            this.hBias = hBias;
            this.timestamp = timestamp;
            // initializer
        }
        Object.defineProperty(DenoisingAutoencoders.prototype, "weights", {
            // accessors
            get: function () { return this.W; },
            set: function (w) { this.W = w; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DenoisingAutoencoders.prototype, "vbias", {
            get: function () { return this.vBias; },
            set: function (b) { this.vBias = b; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DenoisingAutoencoders.prototype, "hbias", {
            get: function () { return this.hBias; },
            set: function (b) { this.hBias = b; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DenoisingAutoencoders.prototype, "data", {
            get: function () { return this.input; },
            set: function (input) { this.input = input; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DenoisingAutoencoders.prototype, "time", {
            get: function () { return this.timestamp; },
            enumerable: true,
            configurable: true
        });
        /**
         * computes the cost and the updates for one training step of the dA
         */
        DenoisingAutoencoders.prototype.train = function (learningRate, corruptionLevel) {
            var x = this.input, tildeX = this.getCorruptedInput(x, corruptionLevel), y = this.getHiddenValues(tildeX), z = this.getReconstructedInput(y), Lvbias = x.subtract(z), Lhbias = null, LW = null, sigma = Lvbias.dot(this.W), data = [], rows = sigma.rows, cols = sigma.cols;
            for (var i = 0; i < rows; i++) {
                data[i] = [];
                for (var j = 0; j < cols; j++) {
                    data[i][j] = sigma.at(i + 1, j + 1) * y.at(i + 1, j + 1) * (1 - y.at(i + 1, j + 1));
                }
            }
            Lhbias = new ml.Matrix(data);
            LW = tildeX.transpose().dot(Lhbias).add(Lvbias.transpose().dot(y));
            this.W = this.W.add(LW.multiply(learningRate));
            this.hBias = this.hBias.add(Lhbias.mean().multiply(learningRate));
            this.vBias = this.vBias.add(Lvbias.mean().multiply(learningRate));
        };
        DenoisingAutoencoders.prototype.reconstruct = function (matrix) {
            if (matrix.cols !== this.input.cols) {
                throw new Error("invalid vector size");
            }
            return this.getReconstructedInput(this.getHiddenValues(matrix));
        };
        // computes the cost (cross entropy)
        DenoisingAutoencoders.prototype.getCost = function (corruptionLevel) {
            var tildeX = this.getCorruptedInput(this.input, corruptionLevel), y = this.getHiddenValues(tildeX), z = this.getReconstructedInput(y), rows = this.input.rows, cols = this.input.cols, xs = ml.Matrix.ones(rows, cols).subtract(this.input), logzs = ml.Matrix.ones(rows, cols).subtract(z).log(), xlogz = this.input.multiply(z.log()), xslogzs = xs.multiply(logzs), cost = xlogz.add(xslogzs).sum(1).mean();
            return -cost;
        };
        /* uses timestamp when store model in IndexedDB */
        DenoisingAutoencoders.prototype.updateTimestamp = function () {
            this.timestamp = new Date().getTime();
        };
        /* converts object to model */
        DenoisingAutoencoders.prototype.convertModel = function (value) {
            var input = new ml.Matrix(value.input.elements), W = new ml.Matrix(value.W.elements), vBias = new ml.Vector(value.vBias.elements), hBias = new ml.Vector(value.hBias.elements), net = new ml.DenoisingAutoencoders(input, value.nVisible, value.nHidden, W, vBias, hBias), date = new Date(value.timestamp);
            return [net, date];
        };
        DenoisingAutoencoders.prototype.getCorruptedInput = function (input, corruptionLevel) {
            if (corruptionLevel > 1.0) {
                throw new Error("corruptionLevel lower than 1.0");
            }
            var corrupted = [], rows = input.rows, cols = input.cols, bernoulli = function (p) { return Math.random() <= p ? 1 : 0; };
            for (var i = 0; i < rows; i++) {
                corrupted.push([]);
                for (var j = 0; j < cols; j++) {
                    corrupted[i].push(bernoulli(1 - corruptionLevel) * input.at(i + 1, j + 1));
                }
            }
            return new ml.Matrix(corrupted);
        };
        // encode: y = s(Wx + b)
        DenoisingAutoencoders.prototype.getHiddenValues = function (input) {
            var weighted = input.dot(this.W);
            var s = function (x) { return 1.0 / (1 + Math.exp(-x)); };
            return weighted.addBias(this.hBias).map(s);
        };
        // decode: z = s(W'y + b')
        DenoisingAutoencoders.prototype.getReconstructedInput = function (hidden) {
            var weighted = hidden.dot(this.W.transpose());
            var s = function (x) { return 1.0 / (1 + Math.exp(-x)); };
            return weighted.addBias(this.vBias).map(s);
        };
        DenoisingAutoencoders.prototype.binomial = function (n, p) {
            var x = 0, bernoulli = function (p) { return Math.random() <= p ? 1 : 0; };
            for (var i = 0; i < n; i++) {
                x += bernoulli(p);
            }
            return x;
        };
        return DenoisingAutoencoders;
    })();
    ml.DenoisingAutoencoders = DenoisingAutoencoders;
})(ml || (ml = {}));
//# sourceMappingURL=da.js.map