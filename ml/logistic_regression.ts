module ml {
    /**
     * Logistic Regression class
     */
    export class LogisticRegression {

        constructor(private input: Matrix, private label: Matrix,
            private W: Matrix = Matrix.zeros(input.cols, label.cols),
            private b: Vector = Vector.zeros(label.cols)) {
            // initializer
        }

        public fit(learningRate: number, iter: number, l2Reg: number = 0.00, verbose: boolean = false): void {
            // TODO: implement early stopping
            for(var i = 0; i < iter; i++) {
                this.train(learningRate, l2Reg);
                if(i % 10 == 0) {
                    var loss: number = this.getLoss();
                    if(verbose) {
                        console.log("Loss: " + loss.toString());
                    }
                    learningRate *= 0.995;
                }
            }
        }

        public train(learningRate: number, l2Reg: number = 0.00): void {
            var prob: Matrix = this.softmax(this.input.dot(this.W).addBias(this.b)),
                dy: Matrix = prob.subtract(this.label),
                gradW: Matrix = this.input.transpose().dot(dy).subtract(this.W.multiply(l2Reg)),
                gradB: Vector = dy.mean(0);
            this.W = this.W.subtract(gradW.multiply(learningRate)),
            this.b = this.b.subtract(gradB.multiply(learningRate));
        }

        public predict(x: Matrix): Matrix {
            return this.softmax(x.dot(this.W).addBias(this.b));
        }

        // computes cross entropy loss
        public getLoss(): number {
            // -log P(t|p) = -(tlog(p) + (1 - t)log(1 - p))
            // log loss is undefined for p=0 or p=1, so probabilities are clipped
            var p: Matrix = this.softmax(this.input.dot(this.W).addBias(this.b)),
                rows: number = this.label.rows,
                cols: number = this.label.cols,
                clip = x => Math.max(1.0e-14, Math.min(1 - 1.0e-14, x)),
                one_t: Matrix = Matrix.ones(rows, cols).subtract(this.label), // 1 - t
                logone_p: Matrix = Matrix.ones(rows, cols).subtract(p).map(clip).log(), // log(1 - p)
                tlogp: Matrix = this.label.multiply(p.map(clip).log()),  // tlog(p)
                loss: number = -(tlogp.add(one_t.multiply(logone_p)).sum(1).mean());
            return loss;
        }

        // numerically stable softmax function
        private softmax(x: Matrix): Matrix {
            var elements: number[][] = [];
            for(var i = 0; i < x.rows; i++) {
                elements[i] = [];
                var row: number[] = x.elements[i];
                var max: number = Math.max.apply(null, row);
                var total: number = 0.0;
                row = row.map(value => Math.exp(value - max));
                row.map(value => total += value);
                var a: number[] = row.map(value => value / total);
                for(var j = 0; j < x.cols; j++) {
                    elements[i][j] = a[j];
                }
            }
            return new Matrix(elements);
        }
        
        // TODO: implement logsumexp
        private softmax2(x: Matrix): Matrix {
            var max: number = x.max();
            var e: Matrix = x.map(value => Math.exp(value - max));
            var elements: number[][] = [];
            for(var i = 1; i <= e.rows; i++) {
                elements[i - 1] = [];
                var row: Vector = e.row(i);
                var total: number = 0.0;
                row.map(value => total += value);
                var a: Vector = row.map(value => value / total);
                for(var j = 1; j <= e.cols; j++) {
                    elements[i - 1][j - 1] = a.at(j);
                }
            }
            return new Matrix(elements);
        }
    }
} 