var ml;
(function (ml) {
    var Matrix = (function () {
        function Matrix(elements) {
            this.setElements(elements);
        }
        Object.defineProperty(Matrix.prototype, "shape", {
            get: function () {
                var cols = (this.elements.length === 0) ? 0 : this.elements[0].length;
                return [this.elements.length, cols];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix.prototype, "rows", {
            get: function () { return this.elements.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix.prototype, "cols", {
            get: function () { return this.elements[0].length; },
            enumerable: true,
            configurable: true
        });
        Matrix.rand = function (n, m, round) {
            if (round === void 0) { round = false; }
            if (round) {
                return Matrix.zeros(n, m).map(Math.random).map(Math.round);
            }
            else {
                return Matrix.zeros(n, m).map(Math.random);
            }
        };
        Matrix.zeros = function (n, m) {
            return Matrix.fill(n, m, 0);
        };
        Matrix.ones = function (n, m) {
            return Matrix.fill(n, m, 1);
        };
        Matrix.fill = function (n, m, x) {
            var elements = [], i = n, j = m;
            while (i--) {
                j = m;
                elements[i] = [];
                while (j--) {
                    elements[i][j] = x;
                }
            }
            return new Matrix(elements);
        };
        Matrix.prototype.row = function (i) {
            if (i <= 0 || i > this.elements.length) {
                throw new RangeError("index range error");
            }
            return ml.Vector.create(this.elements[i - 1]);
        };
        Matrix.prototype.col = function (j) {
            if (this.elements.length === 0 ||
                j <= 0 || j > this.elements[0].length) {
                throw new RangeError("index range error");
            }
            var col = [], n = this.elements.length;
            for (var i = 0; i < n; i++) {
                col[i] = this.elements[i][j - 1];
            }
            return ml.Vector.create(col);
        };
        Matrix.prototype.at = function (i, j) {
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
            return (this.elements.length === matrix.elements.length &&
                this.elements[0].length === matrix.elements[0].length);
        };
        Matrix.prototype.multiply = function (matrix) {
            if (typeof matrix === "number") {
                return this.map(function (x) { return x * matrix; });
            }
            else {
                var mat = matrix.elements, i = this.elements.length, j = 0, nj = mat[0].length, elements = [];
                while (i--) {
                    j = nj;
                    elements[i] = [];
                    while (j--) {
                        elements[i][j] = this.elements[i][j] * mat[i][j];
                    }
                }
                return new Matrix(elements);
            }
        };
        Matrix.prototype.dot = function (matrix) {
            if (this.elements[0].length !== matrix.elements.length) {
                throw new Error("invalid matrix shape");
            }
            var mat = matrix.elements, i = this.elements.length, j = 0, nj = mat[0].length, cols = this.elements[0].length, c = 0, elements = [], sum = 0;
            while (i--) {
                j = nj;
                elements[i] = [];
                while (j--) {
                    c = cols;
                    sum = 0;
                    while (c--) {
                        sum += this.elements[i][c] * mat[c][j];
                    }
                    elements[i][j] = sum;
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
        Matrix.prototype.sum = function (axis) {
            if (axis === void 0) { axis = 0; }
            var sums = [], rows = this.elements.length, cols = this.elements[0].length;
            if (axis == 0) {
                for (var i = 0; i < cols; i++) {
                    sums[i] = 0;
                }
                for (var i = 0; i < rows; i++) {
                    for (var j = 0; j < cols; j++) {
                        sums[j] += this.elements[i][j];
                    }
                }
                return ml.Vector.create(sums);
            }
            else if (axis == 1) {
                for (var i = 0; i < rows; i++) {
                    sums[i] = 0;
                }
                for (var i = 0; i < rows; i++) {
                    for (var j = 0; j < cols; j++) {
                        sums[i] += this.elements[i][j];
                    }
                }
                return ml.Vector.create(sums);
            }
        };
        Matrix.prototype.mean = function (axis) {
            if (axis === void 0) { axis = 0; }
            var rows = this.elements.length, cols = this.elements[0].length;
            if (axis == 0) {
                return this.sum(axis).multiply(1.0 / rows);
            }
            else if (axis == 1) {
                return this.sum(axis).multiply(1.0 / cols);
            }
        };
        Matrix.prototype.max = function () {
            var rows = this.elements.length, cols = this.elements[0].length, max = 0.0, tmp = 0;
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < cols; j++) {
                    if (max < this.elements[i][j]) {
                        max = this.elements[i][j];
                    }
                }
            }
            return max;
        };
        Matrix.prototype.log = function () {
            return this.map(function (x) { return Math.log(x); });
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
        Matrix.prototype.toString = function (round) {
            if (round === void 0) { round = false; }
            var rows = [], elements = null, n = this.elements.length;
            for (var i = 0; i < n; i++) {
                if (round) {
                    elements = this.elements[i].map(function (x) { return Math.round(x * 1000) / 1000; });
                    rows[i] = ml.Vector.create(elements).toString();
                }
                else {
                    rows[i] = ml.Vector.create(this.elements[i]).toString();
                }
            }
            return rows.join("\n");
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
    }());
    ml.Matrix = Matrix;
})(ml || (ml = {}));
//# sourceMappingURL=matrix.js.map