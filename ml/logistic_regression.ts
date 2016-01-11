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

        public fit(learningRate: number, l2Reg: number = 0.00, maxIter: number = 100, verbose: boolean = false): void {
            // TODO: implement 
            for(var i = 0; i < maxIter; i++) {
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
            var prob: Matrix = this.softmax(this.input.dot(this.W).addBias(this.b));
            var dy: Matrix = this.label.subtract(prob);
            this.W = this.W.add(this.input.transpose().dot(dy).multiply(learningRate).subtract(this.W.multiply(l2Reg)));
            this.b = this.b.add(dy.mean(0).multiply(learningRate));
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
                clip = x => Math.max(1.0e-15, Math.min(1 - 1.0e-15, x)),
                one_t: Matrix = Matrix.ones(rows, cols).subtract(this.label), // 1 - t
                logone_p: Matrix = Matrix.ones(rows, cols).subtract(p).map(clip).log(), // log(1 - p)
                tlogp: Matrix = this.label.multiply(p.map(clip).log()),  // tlog(p)
                loss: number = -(tlogp.add(one_t.multiply(logone_p)).sum(1).mean());
            return loss;
        }

        // numerically stable softmax function
        private softmax(x: Matrix): Matrix {
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
