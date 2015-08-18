module ml {
    /**
     * Logistic Regression class
     * author @wellflat
     */
    export class LogisticRegression {

        constructor(private input: Matrix, private label: Matrix,
            private nInput: number, private nOutput: number,
            private W: Matrix = Matrix.zeros(nInput, nOutput),
            private b: Vector = Vector.zeros(nOutput)) {
            // initializer
        }

        public train(learningRate: number, l2Reg: number): void {
            var values: Matrix = this.input.multiply(this.W);
            var prob: Matrix = this.softmax(values.addBias(this.b));
            var dy: Matrix = this.label.subtract(prob);
            this.W = this.W.add(this.input.transpose().dot(dy).multiply(learningRate)
                .subtract(this.W.multiply(l2Reg).multiply(learningRate)));
            this.b = this.b.add(dy.mean(0));
        }

        public predict(x: Matrix): Matrix {
            return this.softmax(this.input.dot(this.W).addBias(this.b));
        }

        private softmax(x: Matrix): Matrix {
            var max: number = x.max();
            var e: Matrix = x.map(value => Math.exp(value - max));
            var elements: number[][] = [];
            for(var i = 1; i <= e.rows; i++) {
                elements[i] = [];
                var row: Vector = e.row(i);
                var total: number = 0.0;
                row.map((value) => {
                    total += Math.exp(value);
                });
                var a: Vector = row.map(value => Math.exp(value) / total);
                for(var j = 1; j <= e.cols; j++) {
                    elements[i - 1][j - 1] = a.at(j);
                }
            }
            return new Matrix(elements);
        }

    }
} 