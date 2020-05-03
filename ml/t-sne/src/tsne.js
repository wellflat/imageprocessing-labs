
/**
 * t-SNE Module
 * @author https://github.com/wellflat
 */
import { generateRandom, clone } from './utils';

export default class tSNE {

    /**
     * @param {number[][]|Float64Array[]} data
     * @param {{perplexity:number, eta:number}} params
     */
    constructor(data, params) {
        /** @type {number[][]|Float64Array[]} */
        this.data = data;
        /** @type {{perplexity:number, eta:number, alpha:number}} */
        this.params = params;
        this.dims = 2;  // mapping output dimention
        this.init();
    }

    init() {
        if (Array.isArray(this.data[0])) {
            // convert typed array
            const typed = this.data.map(e => new Float64Array(e));
            this.data = typed;
        }
        /** @type {Float64Array[]} */
        this.Y = null;
    }

    /**
     * compute t-SNE projection
     * @param {number} iter max iterations
     * @return {Promise<Float64Array>}
     */
    compute(iter) {
        const N = this.data.length;
        const dims = this.dims;
        const D = this.calculatePairwiseDistance(this.data);
        const P = this.computeP(D, this.params.perplexity);
        this.Y = this.sampleInitialSolution();
        const step = new Float64Array(N*dims);
        const eta = this.params.eta;
        let alpha = this.params.alpha;  // momentam

        for(let t=0; t<iter; t++) {
            const Y = this.Y;
            const newY = clone(Y);
            const [cost, grad] = this.calculateCostGrad(Y, P, t);
            // set Y(t)
            if(t >= 250) {
                alpha = 0.8;
            }
            const mean = new Float64Array(dims);
            for (let i = 0; i < N; i++) {
                for (let d = 0; d < dims; d++) {
                    const id = i*dims + d;
                    newY[i][d] = Y[i][d] - eta * grad[id] + alpha * step[id];
                    step[id] = newY[i][d] - Y[i][d];
                    mean[d] += newY[i][d];
                }
            }
            this.Y = clone(newY);
            for(let i=0; i<N; i++) {
                for(let d=0; d<dims; d++) {
                    this.Y[i][d] -= mean[d]/N;
                }
            }
            if(t%100 === 0) {
                console.log(`t=${t} : cost=${cost}`);
            }
        }
        return new Promise((resolve, reject) => {
            resolve(this.Y);
        });
    }

    /**
     * p_(ij) = p_(j|i) + p_(i|j) / 2n
     * @param {Float64Array} D pairwise distances
     * @return {Float64Array} P_(ij)
     */
    computeP(D) {
        const N = this.data.length;
        const perp = this.params.perplexity;
        const P = new Float64Array(N * N);
        const condP = new Float64Array(N * N);
        const tol = 1e-3, maxIter = 100;

        // compute pairwise affinities p_(j|i) with perplexity
        for (let i = 0; i < N; i++) {
            // binary search to find sigma
            let lb = Number.NEGATIVE_INFINITY;
            let ub = Number.POSITIVE_INFINITY;
            //let lb = 0.0;
            //let ub = 1e+10;
            let sigma = 1.0;
            let searching = true, n = 0;
            while(searching) {
                //sigma = (lb + ub) / 2.0;
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
            console.log(`sigma ${i}: ${lb}`);
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
     * find Q distribution q_(ij)
     * @param {Float64Array[]} Y
     * @return {Float64Array}
     */
    findQ(Y) {
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
            const rand = generateRandom(dims, 0.0, 1e-3);
            for(let j=0; j<dims; j++) {
                yrow[j] = rand[j];
            }
            Y[i] = yrow;
        }
        return Y;
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
        return Math.pow(2.0, Hpi);  // Perp(Pi) = 2^H(Pi)
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
        const Q = this.findQ(Y);
        const grad = new Float64Array(N * dims);
        //const earlyExag = iter < 100 ? 4 : 1;
        // calculate KLD  Σ_iΣ_jp_ij*log(p_ij/q_ij)
        let cost = 0.0;
        const L2 = this.calculateL2Distance;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (i !== j) {
                    cost += P[i * N + j] * Math.log(P[i * N + j] / Q[i * N + j]);
                    let a = (P[i * N + j] - Q[i * N + j]) * (1.0 / (1.0 + L2(Y[i], Y[j])));
                    for (let k = 0; k < dims; k++) {
                        grad[i * dims + k] += 4.0 * a * (Y[i][k] - Y[j][k]);
                    }
                }
            }
        }
        return [cost, grad];
    }
}