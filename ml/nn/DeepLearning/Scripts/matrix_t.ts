module ml {
    /**
     * Matrix class using Typed Array (Float32Array)
     */
    export class MatrixT {
        private elements: Float32Array[];

        constructor(elements: number[][]);
        constructor(elements: Float32Array[]);

        constructor(elements: any) {
            if(elements[0] instanceof Float32Array) {
                this.elements = elements;
            } else {
                this.setElements(elements);
            }
        }

        // accessors
        get shape(): number[] {
            var cols: number = (this.elements.length === 0) ? 0 : this.elements[0].length;
            return [this.elements.length, cols];
        }
        get rows(): number { return this.elements.length; }
        get cols(): number { return this.elements[0].length; }

        static rand(n: number, m: number): MatrixT {
            return MatrixT.zeros(n, m).map(Math.random);
        }

        static zeros(n: number, m: number): MatrixT {
            var elements: number[][] = [], i = n, j = m;
            while(i--) {
                j = m;
                elements[i] = [];
                while(j--) {
                    elements[i][j] = 0;
                }
            }
            return new MatrixT(elements);
        }

        public row(i: number): VectorT {
            if(i <= 0 || i > this.elements.length) {
                throw new RangeError("index range error");
            }
            return VectorT.create(this.elements[i - 1]);
        }

        public col(j: number): VectorT {
            if(this.elements.length === 0 ||
                j <= 0 || j > this.elements[0].length) {
                throw new RangeError("index range error");
            }
            var n: number = this.elements.length,
                col: Float32Array = new Float32Array(n);
            for(var i = 0; i < n; i++) {
                col[i] = this.elements[i][j - 1];
            }
            return VectorT.create(col);
        }

        public at(i: number, j: number): number {
            //if(i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) {
            //    throw new RangeError("index range error");
            //}
            return this.elements[i - 1][j - 1];
        }

        public add(matrix: MatrixT): MatrixT {
            if(!this.isSameSizeAs(matrix)) {
                throw new Error("invalid matrix shape");
            }
            return this.map((x, i, j) => x + matrix.elements[i - 1][j - 1]);
        }

        public subtract(matrix: MatrixT): MatrixT {
            if(!this.isSameSizeAs(matrix)) {
                throw new Error("invalid matrix shape");
            }
            return this.map((x, i, j) => x - matrix.elements[i - 1][j - 1]);
        }

        private isSameSizeAs(matrix: MatrixT): boolean {
            return (this.elements.length === matrix.elements.length &&
                this.elements[0].length === matrix.elements[0].length);
        }

        //public multiply(matrix: number | Matrix): Matrix {
        public multiply(matrix): MatrixT {
            if(typeof matrix === "number") {
                return this.map(x => x * matrix);
            } else { // element-wise
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
                return new MatrixT(elements);
            }
        }

        public dot(matrix): MatrixT {
            // can multiply from left
            if(this.elements[0].length !== matrix.elements.length) {
                throw new Error("invalid matrix shape");
            }
            var M: number[][] = matrix.elements,
                i: number = this.elements.length,
                j: number = 0,
                nj: number = M[0].length,
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
                        sum += this.elements[i][c] * M[c][j];
                    }
                    elements[i][j] = sum;
                }
            }
            return new MatrixT(elements);
        }

        public transpose(): MatrixT {
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
            return new MatrixT(elements);
        }

        public addBias(bias: VectorT): MatrixT {
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
            return new MatrixT(elements);
        }

        public sum(axis: number = 0): VectorT {
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
                return VectorT.create(new Float32Array(sums));
            } else if(axis == 1) {
                for(var i = 0; i < rows; i++) {
                    sums[i] = 0;
                }
                for(var i = 0; i < rows; i++) {
                    for(var j = 0; j < cols; j++) {
                        sums[i] += this.elements[i][j];
                    }
                }
                return VectorT.create(new Float32Array(sums));
            }
        }

        public mean(axis: number = 0): VectorT {
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
                return VectorT.create(new Float32Array(sums)).multiply(1.0 / rows);
            } else if(axis == 1) {
                for(var i = 0; i < rows; i++) {
                    sums[i] = 0;
                }
                for(var i = 0; i < rows; i++) {
                    for(var j = 0; j < cols; j++) {
                        sums[i] += this.elements[i][j];
                    }
                }
                return VectorT.create(new Float32Array(sums)).multiply(1.0 / cols);
            }
        }

        public log(): MatrixT {
            return this.map(x => Math.log(x));
        }

        public map(fn: Function): MatrixT {
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
            return new MatrixT(elements);
        }

        public toString(round: boolean = false): string {
            var rows: string[] = [],
                n: number = this.elements.length,
                elements: Float32Array = null;
            for(var i = 0; i < n; i++) {
                if(round) {
                    elements = this.elements[i].map(x => Math.round(x * 1000) / 1000);
                    rows[i] = VectorT.create(elements).toString();
                } else {
                    rows[i] = VectorT.create(this.elements[i]).toString();
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
                    this.elements[i] = new Float32Array(j);
                    while(j--) {
                        this.elements[i][j] = elements[i][j];
                    }
                }
            }
        }
    }
}