/**
 * Denoising Autoencoders class
 * author @wellflat
 */
module rt {
    //type activate = (x: number) => number;

    export class DenoisingAutoencoders {
        constructor(private input: Matrix, private nVisible: number, private nHidden: number,
            private W: Matrix = Matrix.rand(nVisible, nHidden),
            private vBias: Vector = Vector.zeros(nVisible),
            private hBias: Vector = Vector.zeros(nHidden),
            private timestamp: number = new Date().getDate()) {
            // initializer
        }
        // accessors
        get weights(): Matrix { return this.W; }
        get vbias(): Vector { return this.vBias; }
        get hbias(): Vector { return this.hBias; }
        get data(): Matrix { return this.input; }
        set data(input: Matrix) { this.input = input; }

        /**
         * computes the cost and the updates for one training step of the dA
         */
        public train(learningRate: number, corruptionLevel: number): void {
            var x: Matrix = this.input,
                corrupted: Matrix = this.getCorruptedInput(x, corruptionLevel),
                y: Matrix = this.getHiddenValues(corrupted),
                z: Matrix = this.getReconstructedInput(y),
                Lxz: Matrix = x.subtract(z),
                sigma: Matrix = Lxz.multiply(this.W),
                data: number[][] = [],
                rows: number = sigma.rows,
                cols: number = sigma.cols;
            for(var i = 0; i < rows; i++) {
                data[i] = [];
                for(var j = 0; j < cols; j++) {
                    data[i][j] = sigma.at(i + 1, j + 1) * y.at(i + 1, j + 1) * (1 - y.at(i + 1, j + 1));
                }
            }
            var LH: Matrix = new Matrix(data);
            var lW: Matrix = corrupted.transpose().multiply(LH).add(Lxz.transpose().multiply(y));
            this.W = this.W.add(lW.multiply(learningRate));
            this.vBias = this.vBias.add(Lxz.mean().multiply(learningRate));
            this.hBias = this.hBias.add(LH.mean().multiply(learningRate));
            this.timestamp = new Date().getDate();
        }

        public reconstruct(matrix: Matrix): Matrix {
            if(matrix.cols !== this.input.cols) {
                throw new Error("invalid vector size");
            }
            return this.getReconstructedInput(this.getHiddenValues(matrix));
        }

        private getCorruptedInput(input: Matrix, corruptionLevel: number): Matrix {
            if(corruptionLevel > 1.0) {
                throw new Error("corruptionLevel lower than 1.0");
            }
            var corrupted: number[][] = [],
                rows: number = input.rows,
                cols: number = input.cols,
                bernoulli = p => Math.random() <= p ? 1 : 0;
            for(var i = 0; i < rows; i++) {
                corrupted.push([]);
                for(var j = 0; j < cols; j++) {
                    corrupted[i].push(bernoulli(1 - corruptionLevel) * input.at(i + 1, j + 1));
                }
            }
            return new Matrix(corrupted);
        }

        // encode: y = s(Wx + b)
        private getHiddenValues(input: Matrix): Matrix {
            var weighted: Matrix = input.multiply(this.W);
            var s = x => 1.0 / (1 + Math.exp(-x));
            return weighted.addBias(this.hBias).map(s);
        }

        // decode: z = s(W'y + b')
        private getReconstructedInput(hidden: Matrix): Matrix {
            var weighted: Matrix = hidden.multiply(this.W.transpose());
            var s = x => 1.0 / (1 + Math.exp(-x));
            //var s: Function = (m: Matrix) => m.map(x => 1.0 / (1 + Math.exp(-x)));
            return weighted.addBias(this.vBias).map(s);
        }

        private binomial(n: number, p: number): number {
            var x: number = 0,
                bernoulli = p => Math.random() <= p ? 1 : 0;
            for(var i = 0; i < n; i++) {
                x += bernoulli(p);
            }
            return x;
        }
    }
}