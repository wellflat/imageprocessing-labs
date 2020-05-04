
/**
 * t-SNE Module
 * @author https://github.com/wellflat
 */
import { clone } from './utils';

export default class tSNE {

    /**
     * @param {number[][]|Float64Array[]} data
     * @param {{perplexity:number, eta:number, alpha:number}} params
     */
    constructor(data, params) {
        /** @type {number[][]|Float64Array[]} input data */
        this.data = data;
        /** @type {number} output dimention */
        this.dims = 2;
        /** @type {{perplexity:number, eta:number, alpha:number}} */
        this.params = params;
        /** @type {Float64Array[]} output embedding */
        this.Y = null;
        this.init();
        // internal debug
        this.debug = true;
    }

    init() {
        if (Array.isArray(this.data[0])) {
            // convert typed array
            const typed = this.data.map(e => new Float64Array(e));
            this.data = typed;
        }
        // check parameters
        ['perplexity', 'eta', 'alpha'].forEach(p => {
            if(!(p in this.params)) {
                throw new Error(`parameter '${p}' required`);
            }
        });
    }

    /**
     * compute t-SNE projection
     * @param {number} iter max iteration
     * @return {Promise<Float64Array[]>}
     */
    async compute(iter) {
        const P = this.computeP();
        this.Y = this.sampleInitialSolution();
        const step = new Float64Array(this.data.length*this.dims);
        for(let t=0; t<iter; t++) {
            const cost = this.stepGradient(P, step, t);
            if(this.debug && t%10 === 0) {
               console.log(`t=${t} : cost=${cost}`);
            }
        }
        return this.Y;
    }

    /**
     * t-SNE projection iterator version
     * @param {number} iter max iteration
     */
    *iterator(iter) {
        const P = this.computeP();
        this.Y = this.sampleInitialSolution();
        const step = new Float64Array(this.data.length*this.dims);
        for(let t=0; t<iter; t++) {
            const cost = this.stepGradient(P, step, t);
            if(this.debug && t%10 === 0) {
               console.log(`t=${t} : cost=${cost}`);
            }
            yield this.Y;
        }
    }

    /**
     * step down gradient
     * @param {Float64Array} P
     * @param {Float64Array} step
     * @return {number} cost
     */
    stepGradient(P, step, t) {
        const N = this.data.length;
        const dims = this.dims;
        const Y = this.Y;
        const newY = clone(Y);
        const [cost, grad] = this.calculateCostGrad(Y, P, t);
        const eta = this.params.eta;    // learning rate
        let alpha = this.params.alpha;  // momentam
        // step Y(t)
        if (t >= 250) {
            alpha = 0.8;
        }
        const meanY = new Float64Array(dims);
        for (let i = 0; i < N; i++) {
            for (let d = 0; d < dims; d++) {
                const id = i * dims + d;
                step[id] = alpha * step[id] - eta * grad[id];
                newY[i][d] = Y[i][d] + step[id];
                meanY[d] += newY[i][d];
            }
        }
        this.Y = clone(newY);
        for (let i = 0; i < N; i++) {
            for (let d = 0; d < dims; d++) {
                this.Y[i][d] -= meanY[d] / N;
            }
        }
        return cost;
    }

    /**
     * calculate cost and gradient using Kullback-Leibler Divergence (KLD)
     * @param {Float64Array} Y
     * @param {Float64Array} P
     * @param {number} iter
     * @return {[number, Float64Array]}
     */
    calculateCostGrad(Y, P, iter) {
        // todo: early exaggeration
        const N = Y.length;
        const dims = this.dims;
        const Q = this.computeQ(Y);
        const grad = new Float64Array(N * dims);
        const earlyExagValue = iter < 100 ? 4.0 : 1.0; //
        // calculate KLD  Σ_iΣ_jp_ij*log(p_ij/q_ij)
        let cost = 0.0;
        const L2 = this.calculateL2Distance;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (i !== j) {
                    const pij = P[i*N + j];
                    const qij = Q[i*N + j];
                    cost += P[i * N + j] * Math.log(P[i * N + j] / Q[i * N + j]);
                    let a = (P[i * N + j] - Q[i * N + j]) * (1.0 / (1.0 + L2(Y[i], Y[j])));
                    //let earlyExag = 4.0 * (earlyExagValue*pij - qij*qij);
                    for (let k = 0; k < dims; k++) {
                        //grad[i * dims + k] += earlyExag * a * (Y[i][k] - Y[j][k]);
                        grad[i * dims + k] += 4.0 * a * (Y[i][k] - Y[j][k]);
                    }
                }
            }
        }
        return [cost, grad];
    }

    /**
     * compute pairwise affinities p_(j|i) with perplexity
     * set p_(ij) = p_(j|i) + p_(i|j) / 2n
     * @return {Float64Array} P_(ij)
     */
    computeP() {
        const N = this.data.length;
        const perp = this.params.perplexity;
        const P = new Float64Array(N * N);
        const condP = new Float64Array(N * N);
        const D = this.calculatePairwiseDistance(this.data);
        const tol = 1e-3, maxIter = 100;

        for (let i = 0; i < N; i++) {
            // binary search to find sigma
            let lb = Number.NEGATIVE_INFINITY;
            let ub = Number.POSITIVE_INFINITY;
            let sigma = 1.0;
            let searching = true, n = 0;
            while(searching) {
                this.calculateProbs(D, sigma, i, condP);
                let perpPi = this.calculateEntropy(condP, i);
                if (perpPi < perp) {
                    lb = sigma;
                    sigma = ub === Number.POSITIVE_INFINITY ? sigma*2 : (sigma + ub) / 2;
                } else {
                    ub = sigma;
                    sigma = lb === Number.NEGATIVE_INFINITY ? sigma/2 : (sigma + lb)/2;
                }
                if (Math.abs(perp - perpPi) < tol) {
                    searching = false;
                }
                if (n++ > maxIter) {
                    searching = false;
                }
            }
            if(this.debug) {
                console.log(`sigma ${i}: ${lb}`);
            }
        }

        // p_(ij)
        for(let i=0; i<N; i++) {
            for(let j=0; j<N; j++) {
                if(i!==j) {
                    P[i*N + j] = (condP[i*N + j] + condP[j*N + i])/(2*N);
                }
            }
        }
        return P;
    }

    /**
     * calculate entropy: H(Pi) = Σ-p_(j|i)log(p_(j|i))
     * @param {Float64Array} probs probability
     * @param {number} i index of sample
     * @return {number} Perp(Pi) = 2^H(Pi)
     */
    calculateEntropy(probs, i) {
        const N = this.data.length;
        let Hpi = 0.0;
        for (let j = 0; j < N; j++) {
            if (i !== j) {
                const p = probs[j*N+i];
                Hpi -= p > 1e-7 ? p * Math.log(p) : 0;
            }
        }
        return 2**Hpi; //Math.pow(2.0, Hpi);  // Perp(Pi) = 2^H(Pi)
    }

    /**
     * calculate gaussian probability
     * @param {Float64Array} D pairwise distances
     * @param {number} sigma sigma
     * @param {number} i index of sample
     * @param {Float64Array} P output array
     */
    calculateProbs(D, sigma, i, P) {
        const N = this.data.length;
        let sum = 0.0;
        for (let j = 0; j < N; j++) {
            if (i === j) {
                P[j * N + i] = 0.0;
            } else {
                const pj = Math.exp(-D[i * N + j] / (2.0 * sigma));
                P[j * N + i] = pj;
                sum += pj;
            }
        }
        for (let j = 0; j < N; j++) {
            P[j * N + i] /= sum;
        }
    }

    /**
     * compute low-dimensional affinities q_(ij)
     * @param {Float64Array[]} Y
     * @return {Float64Array}
     */
    computeQ(Y) {
        const N = Y.length;
        const Q = new Float64Array(N*N);
        let sum = 0.0;
        const L2 = this.calculateL2Distance;
        for (let k = 0; k < N; k++) {
            for (let l = 0; l < N; l++) {
                if (k !== l) {
                    sum += 1.0 / (1.0 + L2(Y[k], Y[l]));
                }
            }
        }
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (i !== j) {
                    // Student t-distribution
                    Q[i * N + j] = 1.0 / (1.0 + L2(Y[i], Y[j]));
                    Q[i * N + j] /= sum;
                }
            }
        }
        return Q;
    }

    /**
     * sample initial solution Y(0)
     * @return {Float64Array[]}
     */
    sampleInitialSolution() {
        const N = this.data.length;
        const dims = this.dims;
        const Y = [];
        for(let i=0; i<N; i++) {
            const yrow = new Float64Array(dims);
            const rand = this.generateRandom(dims, 0.0, 1e-3);
            for(let j=0; j<dims; j++) {
                yrow[j] = rand[j];
            }
            Y[i] = yrow;
        }
        return Y;
    }

    /**
     * generate normally distributed random number array using Marsaglia polar method
     * @param {number} n
     * @param {number} mu
     * @param {number} std
     * @return {Float64Array}
    */
    generateRandom(n, mu, std) {
        if (n % 2 != 0) {
            throw new TypeError("n must be even number");
        }
        const data = new Float64Array(n);
        for (let i = 0; i < n; i += 2) {
            let u, v, r;
            do {
                u = 2 * Math.random() - 1;
                v = 2 * Math.random() - 1;
                r = u * u + v * v;
            } while (r === 0 || r >= 1);
            const mul = Math.sqrt(-2 * Math.log(r) / r);
            data[i] = mu + (mul * u) * std;
            data[i + 1] = mu + (mul * v) * std;
        }
        return data;
    }

    /**
     * calculate L2 distance
     * @param {Float64Array} x1 
     * @param {Float64Array} x2 
     * @return {number}
     */
    calculateL2Distance(x1, x2) {
        let distance = 0;
        for (let i = 0; i < x1.length; i++) {
            distance += (x1[i] - x2[i]) * (x1[i] - x2[i]);
        }
        return distance;
    }

    /**
     * calculate pairwise distance
     * @param {Float64Array[]} X
     * @return {Float64Array}
     */
    calculatePairwiseDistance(X) {
        const N = X.length;
        let distance = new Float64Array(N * N);
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                const l2 = this.calculateL2Distance(X[i], X[j]);
                distance[i * N + j] = l2;
                distance[j * N + i] = l2;
            }
        }
        return distance;
    }
}