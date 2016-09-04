var ml;
(function (ml) {
    var Vector = (function () {
        function Vector(elements) {
            this.elements = elements;
        }
        Object.defineProperty(Vector.prototype, "size", {
            get: function () { return this.elements.length; },
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
            return this.elements[i - 1];
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
        Vector.prototype.mean = function () {
            var l = this.elements.length;
            var sum = 0.0;
            for (var i = 0; i < l; i++) {
                sum += this.elements[i];
            }
            return sum / l;
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
    }());
    ml.Vector = Vector;
})(ml || (ml = {}));
//# sourceMappingURL=vector.js.map