/**
 * Denoising Autoencoders class
 * author @wellflat
 */
module ml {
    type dA = ml.DenoisingAutoencoders;
    type f = (x: number) => number;

    export interface Model {
        updateTimestamp(): void;
    }

    export class DenoisingAutoencoders implements Model {
        constructor(private input: Matrix, private nVisible: number, private nHidden: number,
            private W: Matrix = Matrix.rand(nVisible, nHidden),
            private vBias: Vector = Vector.zeros(nVisible),
            private hBias: Vector = Vector.zeros(nHidden),
            private timestamp: number = new Date().getTime()) {
            // initializer
        }
        // accessors
        get weights(): Matrix { return this.W; }
        set weights(w: Matrix) { this.W = w; }
        get vbias(): Vector { return this.vBias; }
        set vbias(b: Vector) { this.vBias = b; }
        get hbias(): Vector { return this.hBias; }
        set hbias(b: Vector) { this.hBias = b; }
        get data(): Matrix { return this.input; }
        set data(input: Matrix) { this.input = input; }
        get time(): number { return this.timestamp; }

        /**
         * computes the cost and the updates for one training step of the dA
         */
        public train(learningRate: number, corruptionLevel: number): void {
            var x: Matrix = this.input,
                tildeX: Matrix = this.getCorruptedInput(x, corruptionLevel),
                y: Matrix = this.getHiddenValues(tildeX),
                z: Matrix = this.getReconstructedInput(y),
                Lvbias: Matrix = x.subtract(z),
                Lhbias: Matrix = null,
                LW: Matrix = null,
                sigma: Matrix = Lvbias.dot(this.W),
                data: number[][] = [],
                rows: number = sigma.rows,
                cols: number = sigma.cols;

            for(var i = 0; i < rows; i++) {
                data[i] = [];
                for(var j = 0; j < cols; j++) {
                    data[i][j] = sigma.at(i + 1, j + 1) * y.at(i + 1, j + 1) * (1 - y.at(i + 1, j + 1));
                }
            }
            Lhbias = new Matrix(data);
            LW = tildeX.transpose().dot(Lhbias).add(Lvbias.transpose().dot(y));
            this.W = this.W.add(LW.multiply(learningRate));
            this.hBias = this.hBias.add(Lhbias.mean().multiply(learningRate));
            this.vBias = this.vBias.add(Lvbias.mean().multiply(learningRate));
        }

        public reconstruct(matrix: Matrix): Matrix {
            if(matrix.cols !== this.input.cols) {
                throw new Error("invalid vector size");
            }
            return this.getReconstructedInput(this.getHiddenValues(matrix));
        }
        
        // computes the cost (cross entropy)
        public getCost(corruptionLevel: number): number {
            var tildeX: Matrix = this.getCorruptedInput(this.input, corruptionLevel),
                y: Matrix = this.getHiddenValues(tildeX),
                z: Matrix = this.getReconstructedInput(y),
                rows: number = this.input.rows,
                cols: number = this.input.cols,
                xs: Matrix = Matrix.ones(rows, cols).subtract(this.input),
                logzs: Matrix = Matrix.ones(rows, cols).subtract(z).log(),
                xlogz: Matrix = this.input.multiply(z.log()),
                xslogzs: Matrix = xs.multiply(logzs),
                cost: number = xlogz.add(xslogzs).sum(1).mean();
            return -cost;
        }

        /* uses timestamp when store model in IndexedDB */
        public updateTimestamp(): void {
            this.timestamp = new Date().getTime();
        }

        /* converts object to model */
        public convertModel(value: any): [dA, Date] {
            var input: ml.Matrix = new ml.Matrix(value.input.elements),
                W: ml.Matrix = new ml.Matrix(value.W.elements),
                vBias: ml.Vector = new ml.Vector(value.vBias.elements),
                hBias: ml.Vector = new ml.Vector(value.hBias.elements),
                net: dA = new ml.DenoisingAutoencoders(input, value.nVisible, value.nHidden,
                    W, vBias, hBias),
                date = new Date(value.timestamp);
            return [net, date];
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
            var weighted: Matrix = input.dot(this.W);
            var s = x => 1.0 / (1 + Math.exp(-x));
            return weighted.addBias(this.hBias).map(s);
        }

        // decode: z = s(W'y + b')
        private getReconstructedInput(hidden: Matrix): Matrix {
            var weighted: Matrix = hidden.dot(this.W.transpose());
            var s = x => 1.0 / (1 + Math.exp(-x));
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