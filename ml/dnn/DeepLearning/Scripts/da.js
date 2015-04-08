/**
 * Denoising Autoencoders class
 * author @wellflat
 */
var rt;
(function (rt) {
    //type activate = (x: number) => number;
    var DenoisingAutoencoders = (function () {
        function DenoisingAutoencoders(input, nVisible, nHidden, W, vBias, hBias, timestamp) {
            if (W === void 0) { W = rt.Matrix.rand(nVisible, nHidden); }
            if (vBias === void 0) { vBias = rt.Vector.zeros(nVisible); }
            if (hBias === void 0) { hBias = rt.Vector.zeros(nHidden); }
            if (timestamp === void 0) { timestamp = new Date().getDate(); }
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
            get: function () {
                return this.W;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DenoisingAutoencoders.prototype, "vbias", {
            get: function () {
                return this.vBias;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DenoisingAutoencoders.prototype, "hbias", {
            get: function () {
                return this.hBias;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DenoisingAutoencoders.prototype, "data", {
            get: function () {
                return this.input;
            },
            set: function (input) {
                this.input = input;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * computes the cost and the updates for one training step of the dA
         */
        DenoisingAutoencoders.prototype.train = function (learningRate, corruptionLevel) {
            var x = this.input, corrupted = this.getCorruptedInput(x, corruptionLevel), y = this.getHiddenValues(corrupted), z = this.getReconstructedInput(y), Lxz = x.subtract(z), sigma = Lxz.multiply(this.W), data = [], rows = sigma.rows, cols = sigma.cols;
            for (var i = 0; i < rows; i++) {
                data[i] = [];
                for (var j = 0; j < cols; j++) {
                    data[i][j] = sigma.at(i + 1, j + 1) * y.at(i + 1, j + 1) * (1 - y.at(i + 1, j + 1));
                }
            }
            var LH = new rt.Matrix(data);
            var lW = corrupted.transpose().multiply(LH).add(Lxz.transpose().multiply(y));
            this.W = this.W.add(lW.multiply(learningRate));
            this.vBias = this.vBias.add(Lxz.mean().multiply(learningRate));
            this.hBias = this.hBias.add(LH.mean().multiply(learningRate));
            this.timestamp = new Date().getDate();
        };
        DenoisingAutoencoders.prototype.reconstruct = function (matrix) {
            if (matrix.cols !== this.input.cols) {
                throw new Error("invalid vector size");
            }
            return this.getReconstructedInput(this.getHiddenValues(matrix));
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
            return new rt.Matrix(corrupted);
        };
        // encode: y = s(Wx + b)
        DenoisingAutoencoders.prototype.getHiddenValues = function (input) {
            var weighted = input.multiply(this.W);
            var s = function (x) { return 1.0 / (1 + Math.exp(-x)); };
            return weighted.addBias(this.hBias).map(s);
        };
        // decode: z = s(W'y + b')
        DenoisingAutoencoders.prototype.getReconstructedInput = function (hidden) {
            var weighted = hidden.multiply(this.W.transpose());
            var s = function (x) { return 1.0 / (1 + Math.exp(-x)); };
            //var s: Function = (m: Matrix) => m.map(x => 1.0 / (1 + Math.exp(-x)));
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
    rt.DenoisingAutoencoders = DenoisingAutoencoders;
})(rt || (rt = {}));
//# sourceMappingURL=da.js.map