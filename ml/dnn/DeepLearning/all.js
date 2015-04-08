window.onload = function () {
    var trainPreEl = document.getElementById("trainData");
    var testPreEl = document.getElementById("testData");
    var weightsPreEl = document.getElementById("weightsData");
    var resultEl = document.getElementById("result");
    var epochEl = document.getElementById("epochInput");
    var learningEl = document.getElementById("learningInput");
    var corruptedEl = document.getElementById("corruptedInput");
    var trainBtn = document.getElementById("trainButton");
    var saveBtn = document.getElementById("saveButton");
    var deleteBtn = document.getElementById("deleteButton");
    var trainCountEl = document.getElementById("trainCount");
    var trainData = new rt.Matrix([
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [1, 0, 1, 1, 0, 0, 0, 1, 0, 0],
        [1, 1, 0, 1, 1, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 0, 1, 0, 1, 0, 0, 0, 1],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
        [1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 1, 0, 1, 1],
        [0, 0, 1, 1, 0, 0, 1, 0, 1, 0],
        [0, 1, 1, 0, 0, 1, 1, 1, 0, 0],
        [1, 1, 0, 0, 1, 0, 1, 0, 1, 1],
        [1, 0, 0, 1, 1, 0, 0, 0, 1, 1],
    ]);
    var testData = new rt.Matrix([
        [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
    ]);
    trainData = new rt.Matrix(createTrainData(10, 30));
    trainPreEl.textContent = trainData.toString();
    testPreEl.textContent = testData.toString();
    var storage = new rt.ModelStorage("model", 2);
    var da = new rt.DenoisingAutoencoders(trainData, 10, 5);
    var maxIter = 50000;
    var iter = 10000;
    var trainCount = 0;
    var interval = 100;
    trainBtn.addEventListener("click", function () {
        var timer = setInterval(function () {
            var epoch = parseInt(epochEl.value);
            var lr = parseFloat(learningEl.value);
            var corruptedRate = parseFloat(corruptedEl.value);
            iter -= epoch;
            trainCount += epoch;
            trainCountEl.textContent = trainCount.toString();
            if (iter === 0) {
                iter = maxIter;
                clearInterval(timer);
            }
            for (var i = 0; i < epoch; i++) {
                da.train(lr, corruptedRate);
            }
            var reconstructed = da.reconstruct(testData);
            resultEl.textContent = reconstructed.toString(true);
            weightsPreEl.textContent = da.weights.toString();
            //weightsPreEl.textContent += da.hbias.toString();
            //weightsPreEl.textContent += da.vbias.toString();
        }, interval);
    });
    saveBtn.addEventListener("click", function () {
        storage.add(da);
    });
    deleteBtn.addEventListener("click", function () {
        storage.delete();
    });
    function createTrainData(dim, num) {
        var data = [];
        for (var i = 0; i < num; i++) {
            data[i] = [];
            for (var j = 0; j < dim; j++) {
                data[i][j] = Math.round(Math.random());
            }
        }
        return data;
    }
    function createElements() {
    }
};
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
var rt;
(function (rt) {
    /**
     * Matrix class
     */
    var Matrix = (function () {
        function Matrix(elements) {
            this.setElements(elements);
        }
        Object.defineProperty(Matrix.prototype, "shape", {
            // accessors
            get: function () {
                var cols = (this.elements.length === 0) ? 0 : this.elements[0].length;
                return [this.elements.length, cols];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix.prototype, "rows", {
            get: function () {
                return this.elements.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix.prototype, "cols", {
            get: function () {
                return this.elements[0].length;
            },
            enumerable: true,
            configurable: true
        });
        Matrix.rand = function (n, m) {
            return Matrix.zeros(n, m).map(Math.random);
        };
        Matrix.zeros = function (n, m) {
            var elements = [], i = n, j = m;
            while (i--) {
                j = m;
                elements[i] = [];
                while (j--) {
                    elements[i][j] = 0;
                }
            }
            return new Matrix(elements);
        };
        Matrix.prototype.row = function (i) {
            if (i <= 0 || i > this.elements.length) {
                throw new RangeError("index range error");
            }
            return rt.Vector.create(this.elements[i - 1]);
        };
        Matrix.prototype.col = function (j) {
            if (this.elements.length === 0 || j <= 0 || j > this.elements[0].length) {
                throw new RangeError("index range error");
            }
            var col = [], n = this.elements.length;
            for (var i = 0; i < n; i++) {
                col[i] = this.elements[i][j - 1];
            }
            return rt.Vector.create(col);
        };
        Matrix.prototype.at = function (i, j) {
            if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) {
                throw new RangeError("index range error");
            }
            return this.elements[i - 1][j - 1];
        };
        Matrix.prototype.add = function (matrix) {
            if (!this.isSameSizeAs(matrix)) {
                throw new Error("invalid matrix shape");
            }
            return this.map(function (x, i, j) { return x + matrix.elements[i - 1][j - 1]; });
        };
        Matrix.prototype.subtract = function (matrix) {
            if (!this.isSameSizeAs(matrix)) {
                throw new Error("invalid matrix shape");
            }
            return this.map(function (x, i, j) { return x - matrix.elements[i - 1][j - 1]; });
        };
        Matrix.prototype.isSameSizeAs = function (matrix) {
            return (this.elements.length === matrix.elements.length && this.elements[0].length === matrix.elements[0].length);
        };
        //public multiply(matrix: Matrix | number): Matrix {
        Matrix.prototype.multiply = function (matrix) {
            if (typeof matrix === "number") {
                return this.map(function (x) { return x * matrix; });
            }
            else {
                // can multiply from left
                if (this.elements[0].length !== matrix.elements.length) {
                    throw new Error("invalid matrix shape");
                }
                var M = matrix.elements, i = this.elements.length, j = 0, nj = M[0].length, cols = this.elements[0].length, c = 0, elements = [], sum = 0;
                while (i--) {
                    j = nj;
                    elements[i] = [];
                    while (j--) {
                        c = cols;
                        sum = 0;
                        while (c--) {
                            sum += this.elements[i][c] * M[c][j];
                        }
                        elements[i][j] = sum;
                    }
                }
            }
            return new Matrix(elements);
        };
        Matrix.prototype.transpose = function () {
            var rows = this.elements.length, cols = this.elements[0].length, i = cols, j = rows, elements = [];
            while (i--) {
                j = rows;
                elements[i] = [];
                while (j--) {
                    elements[i][j] = this.elements[j][i];
                }
            }
            return new Matrix(elements);
        };
        Matrix.prototype.addBias = function (bias) {
            if (bias.size !== this.elements[0].length) {
                throw new Error("invalid vector size");
            }
            var elements = [], rows = this.elements.length, cols = this.elements[0].length;
            for (var i = 0; i < rows; i++) {
                elements[i] = [];
                for (var j = 0; j < cols; j++) {
                    elements[i][j] = this.elements[i][j] + bias.at(j + 1);
                }
            }
            return new Matrix(elements);
        };
        Matrix.prototype.mean = function () {
            var sums = [], rows = this.elements.length, cols = this.elements[0].length;
            for (var i = 0; i < cols; i++) {
                sums[i] = 0;
            }
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < cols; j++) {
                    sums[j] += this.elements[i][j];
                }
            }
            return rt.Vector.create(sums).multiply(1.0 / rows);
        };
        Matrix.prototype.toString = function (round) {
            if (round === void 0) { round = false; }
            var rows = [], elements = null, n = this.elements.length;
            for (var i = 0; i < n; i++) {
                if (round) {
                    elements = this.elements[i].map(function (x) { return Math.round(x * 1000) / 1000; });
                    rows[i] = rt.Vector.create(elements).toString();
                }
                else {
                    rows[i] = rt.Vector.create(this.elements[i]).toString();
                }
            }
            return rows.join("\n");
        };
        Matrix.prototype.map = function (fn) {
            var elements = [], i = this.elements.length, nj = this.elements[0].length, j = nj;
            while (i--) {
                j = nj;
                elements[i] = [];
                while (j--) {
                    elements[i][j] = fn.call(this, this.elements[i][j], i + 1, j + 1);
                }
            }
            return new Matrix(elements);
        };
        Matrix.prototype.setElements = function (elements) {
            var i = 0, j = 0;
            if (elements[0] && typeof elements[0][0] !== undefined) {
                i = elements.length;
                this.elements = [];
                while (i--) {
                    j = elements[i].length;
                    this.elements[i] = [];
                    while (j--) {
                        this.elements[i][j] = elements[i][j];
                    }
                }
            }
        };
        return Matrix;
    })();
    rt.Matrix = Matrix;
})(rt || (rt = {}));
var rt;
(function (rt) {
    /**
     * Model Storage class
     */
    var ModelStorage = (function () {
        //declare var window.indexedDB, window.webkitIndexedDB, window.mozIndexedDB;
        function ModelStorage(name, version) {
            this.name = name;
            this.version = version;
            var idb = indexedDB;
            var dbr = idb.open(name, version);
            dbr.onupgradeneeded = this.upgrade;
            console.log(dbr);
        }
        ModelStorage.prototype.upgrade = function (e) {
            var db = e.target.result;
            var store = db.createObjectStore("model", { keyPath: "timestamp" });
            console.log(store);
            store.createIndex("name", "name", { unique: true });
        };
        ModelStorage.prototype.search = function (e) {
            var db = e.target.result;
            var trans = db.transaction("model", "readwrite");
            var store = trans.objectStore("model");
        };
        ModelStorage.prototype.add = function (da) {
            var dbr = indexedDB.open(this.name, this.version);
            dbr.onsuccess = function () {
                console.log("add#onsuccess");
                var db = dbr.result;
                var trans = db.transaction("model", "readwrite");
                var store = trans.objectStore("model");
                store.add(da);
            };
        };
        ModelStorage.prototype.delete = function () {
            var _this = this;
            var dbr = indexedDB.open(this.name, this.version);
            dbr.onsuccess = function () {
                console.log("delete#onsuccess");
                var ret = indexedDB.deleteDatabase(_this.name);
                console.log(ret);
            };
        };
        return ModelStorage;
    })();
    rt.ModelStorage = ModelStorage;
})(rt || (rt = {}));
var rt;
(function (rt) {
    /**
     * Vector class
     */
    var Vector = (function () {
        function Vector(elements) {
            this.elements = elements;
        }
        Object.defineProperty(Vector.prototype, "size", {
            get: function () {
                return this.elements.length;
            },
            enumerable: true,
            configurable: true
        });
        Vector.create = function (elements) {
            return new Vector(elements.slice());
        };
        Vector.rand = function (n) {
            var elements = [];
            while (n--) {
                elements.push(Math.random());
            }
            return Vector.create(elements);
        };
        Vector.zeros = function (n) {
            var elements = [];
            while (n--) {
                elements.push(0);
            }
            return Vector.create(elements);
        };
        Vector.arange = function (n) {
            var elements = [];
            for (var i = 0; i < n; i++) {
                elements[i] = i;
            }
            return Vector.create(elements);
        };
        Vector.prototype.clone = function () {
            return Vector.create(this.elements);
        };
        Vector.prototype.at = function (i) {
            return (i < 1 || i > this.elements.length) ? null : this.elements[i - 1];
        };
        Vector.prototype.add = function (vector) {
            var v = vector.elements;
            if (this.elements.length !== v.length) {
                return null;
            }
            return this.map(function (x, i) { return x + v[i - 1]; });
        };
        Vector.prototype.subtract = function (vector) {
            var v = vector.elements;
            if (this.elements.length !== v.length) {
                return null;
            }
            return this.map(function (x, i) { return x - v[i - 1]; });
        };
        Vector.prototype.multiply = function (k) {
            return this.map(function (x) { return x * k; });
        };
        Vector.prototype.dot = function (vector) {
            var v = vector.elements, product = 0, n = this.elements.length;
            if (n !== v.length) {
                return null;
            }
            while (n--) {
                product += this.elements[n] * v[n];
            }
            return product;
        };
        Vector.prototype.cross = function (vector) {
            var b = vector.elements;
            if (this.elements.length !== 3 || b.length !== 3) {
                return null;
            }
            var a = this.elements;
            return Vector.create([
                (a[1] * b[2]) - (a[2] * b[1]),
                (a[2] * b[0]) - (a[0] * b[2]),
                (a[0] * b[1]) - (a[1] * b[0])
            ]);
        };
        Vector.prototype.toString = function () {
            return "[" + this.elements.join(", ") + "]";
        };
        Vector.prototype.map = function (fn) {
            var _this = this;
            var elements = [];
            this.forEach(function (x, i) { return elements.push(fn.call(_this, x, i)); });
            return Vector.create(elements);
        };
        Vector.prototype.forEach = function (fn) {
            var n = this.elements.length;
            for (var i = 0; i < n; i++) {
                fn.call(this, this.elements[i], i + 1);
            }
        };
        return Vector;
    })();
    rt.Vector = Vector;
})(rt || (rt = {}));
//# sourceMappingURL=all.js.map