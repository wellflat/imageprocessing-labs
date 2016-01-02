module ml {
    /**
     * Matrix class
     * author @wellflat
     */
    export class Matrix {
        private elements: number[][];

        constructor(elements: number[][]) {
            this.setElements(elements);
        }
        // accessors
        get shape(): number[] {
            var cols: number = (this.elements.length === 0) ? 0 : this.elements[0].length;
            return [this.elements.length, cols];
        }
        get rows(): number { return this.elements.length; }
        get cols(): number { return this.elements[0].length; }

        static rand(n: number, m: number, round: boolean = false): Matrix {
            if(round) {
                return Matrix.zeros(n, m).map(Math.random).map(Math.round);
            } else {
                return Matrix.zeros(n, m).map(Math.random);
            }
            
        }

        static zeros(n: number, m: number): Matrix {
            var elements: number[][] = [], i = n, j = m;
            while(i--) {
                j = m;
                elements[i] = [];
                while(j--) {
                    elements[i][j] = 0;
                }
            }
            return new Matrix(elements);
        }

        static ones(n: number, m: number): Matrix {
            var elements: number[][] = [], i = n, j = m;
            while(i--) {
                j = m;
                elements[i] = [];
                while(j--) {
                    elements[i][j] = 1;
                }
            }
            return new Matrix(elements);
        }

        public row(i: number): Vector {
            if(i <= 0 || i > this.elements.length) {
                throw new RangeError("index range error");
            }
            return Vector.create(this.elements[i - 1]);
        }

        public col(j: number): Vector {
            if(this.elements.length === 0 ||
                j <= 0 || j > this.elements[0].length) {
                throw new RangeError("index range error");
            }
            var col: number[] = [],
                n: number = this.elements.length;
            for(var i = 0; i < n; i++) {
                col[i] = this.elements[i][j - 1];
            }
            return Vector.create(col);
        }

        public at(i: number, j: number): number {
            // Assertion
            //if(i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) {
            //    throw new RangeError("index range error");
            //}
            return this.elements[i - 1][j - 1];
        }

        public add(matrix: Matrix): Matrix {
            if(!this.isSameSizeAs(matrix)) {
                throw new Error("invalid matrix shape");
            }
            return this.map((x, i, j) => x + matrix.elements[i - 1][j - 1]);
        }

        public subtract(matrix: Matrix): Matrix {
            if(!this.isSameSizeAs(matrix)) {
                throw new Error("invalid matrix shape");
            }
            return this.map((x, i, j) => x - matrix.elements[i - 1][j - 1]);
        }

        private isSameSizeAs(matrix: Matrix): boolean {
            return (this.elements.length === matrix.elements.length &&
                this.elements[0].length === matrix.elements[0].length);
        }

        public multiply(matrix: number | Matrix): Matrix { // Jasmine not supported
        //public multiply(matrix): Matrix {
            if(typeof matrix === "number") {
                return this.map(x => x * matrix);
            } else {  // element-wise ( * operator in NumPy)
                var mat: number[][] = matrix.elements,
                    i: number = this.elements.length,
                    j: number = 0,
                    nj: number = mat[0].length,
                    elements: number[][] = [];
                while(i--) {
                    j = nj;
                    elements[i] = [];
                    while(j--) {
                        elements[i][j] = this.elements[i][j] * mat[i][j];
                    }
                }
                return new Matrix(elements);
            }
        }

        public dot(matrix: Matrix): Matrix {
            // can multiply from left
            if(this.elements[0].length !== matrix.elements.length) {
                throw new Error("invalid matrix shape");
            }
            var mat: number[][] = matrix.elements,
                i: number = this.elements.length,
                j: number = 0,
                nj: number = mat[0].length,
                cols: number = this.elements[0].length,
                c: number = 0,
                elements: number[][] = [],
                sum: number = 0;
            while(i--) {
                j = nj;
                elements[i] = [];
                while(j--) {
                    c = cols;
                    sum = 0;
                    while(c--) {
                        sum += this.elements[i][c] * mat[c][j];
                    }
                    elements[i][j] = sum;
                }
            }
            return new Matrix(elements);
        }

        public transpose(): Matrix {
            var rows: number = this.elements.length,
                cols: number = this.elements[0].length,
                i: number = cols, j: number = rows,
                elements: number[][] = [];
            while(i--) {
                j = rows;
                elements[i] = [];
                while(j--) {
                    elements[i][j] = this.elements[j][i];
                }
            }
            return new Matrix(elements);
        }

        public addBias(bias: Vector): Matrix {
            if(bias.size !== this.elements[0].length) {
                throw new Error("invalid vector size");
            }
            var elements: number[][] = [],
                rows: number = this.elements.length,
                cols: number = this.elements[0].length;
            for(var i = 0; i < rows; i++) {
                elements[i] = [];
                for(var j = 0; j < cols; j++) {
                    elements[i][j] = this.elements[i][j] + bias.at(j + 1);
                }
            }
            return new Matrix(elements);
        }

        public sum(axis: number = 0): Vector {
            var sums: number[] = [],
                rows: number = this.elements.length,
                cols: number = this.elements[0].length;
            if(axis == 0) {
                for(var i = 0; i < cols; i++) {
                    sums[i] = 0;
                }
                for(var i = 0; i < rows; i++) {
                    for(var j = 0; j < cols; j++) {
                        sums[j] += this.elements[i][j];
                    }
                }
                return Vector.create(sums);
            } else if(axis == 1) {
                for(var i = 0; i < rows; i++) {
                    sums[i] = 0;
                }
                for(var i = 0; i < rows; i++) {
                    for(var j = 0; j < cols; j++) {
                        sums[i] += this.elements[i][j];
                    }
                }
                return Vector.create(sums);
            }
        }

        public mean(axis: number = 0): Vector {
            var sums: number[] = [],
                rows: number = this.elements.length,
                cols: number = this.elements[0].length;
            if(axis == 0) {
                for(var i = 0; i < cols; i++) {
                    sums[i] = 0;
                }
                for(var i = 0; i < rows; i++) {
                    for(var j = 0; j < cols; j++) {
                        sums[j] += this.elements[i][j];
                    }
                }
                return Vector.create(sums).multiply(1.0 / rows);
            } else if(axis == 1) {
                for(var i = 0; i < rows; i++) {
                    sums[i] = 0;
                }
                for(var i = 0; i < rows; i++) {
                    for(var j = 0; j < cols; j++) {
                        sums[i] += this.elements[i][j];
                    }
                }
                return Vector.create(sums).multiply(1.0 / cols);
            }
        }

        public max(): number {
            var rows: number = this.elements.length,
                cols: number = this.elements[0].length,
                max: number = 0.0,
                tmp: number = 0;
            for(var i = 0; i < rows; i++) {
                for(var j = 0; j < cols; j++) {
                    if(max < this.elements[i][j]) {
                        max = this.elements[i][j];
                    }
                }
            }
            return max;
        }

        public log(): Matrix {
            return this.map(x => Math.log(x));
        }

        public map(fn: Function): Matrix {
            var elements: number[][] = [],
                i: number = this.elements.length,
                nj: number = this.elements[0].length,
                j: number = nj;
            while(i--) {
                j = nj;
                elements[i] = [];
                while(j--) {
                    elements[i][j] = fn.call(this, this.elements[i][j], i + 1, j + 1);
                }
            }
            return new Matrix(elements);
        }

        public toString(round: boolean = false): string {
            var rows: string[] = [],
                elements: number[] = null,
                n: number = this.elements.length;
            for(var i = 0; i < n; i++) {
                if(round) {
                    elements = this.elements[i].map(x => Math.round(x * 1000) / 1000);
                    rows[i] = Vector.create(elements).toString();
                } else {
                    rows[i] = Vector.create(this.elements[i]).toString();
                }
            }
            return rows.join("\n");
        }

        private setElements(elements: number[][]) {
            var i: number = 0, j: number = 0;
            if(elements[0] && typeof elements[0][0] !== undefined) {
                i = elements.length;
                this.elements = [];
                while(i--) {
                    j = elements[i].length;
                    this.elements[i] = [];
                    while(j--) {
                        this.elements[i][j] = elements[i][j];
                    }
                }
            }
        }
    }
}