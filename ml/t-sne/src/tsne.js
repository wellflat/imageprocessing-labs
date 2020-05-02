
/**
 * t-SNE Module
 * @author https://github.com/wellflat
 */
import { generateRandom } from './utils';

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
        this.dims = 2; // mapping output dimention
        this.init();
    }

    init() {
        if (Array.isArray(this.data[0])) {
            // convert typed array
            const typed = this.data.map(e => new Float64Array(e));
            this.data = typed;
        }
        // initial solution
        this.Y = new Float64Array(this.data.length*this.dims);
    }

    /**
     * compute t-SNE projection
     * @param {number} iterations
     * @return {Promise<Float64Array>}
     */
    compute(iterations) {
        // not yet impl.
        //
        const D = this.calculatePairwiseDistance(this.data);
        const P = this.getP(D, this.params.perplexity);
        this.Y = this.initialSolution();
        return new Promise((resolve, reject) => {
            resolve(this.Y);
        });
    }

    /**
     * p_(ij) = p_(j|i) + p_(i|j) / 2n
     * @param {Float64Array} D pairwise distances
     * @return {Float64Array} P_(ij)
     */
    getP(D) {
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
            //if(i==10) return; //exit
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

    // sample initial solution Y(0)
    initialSolution() {
        const N = this.data.length;
        const dims = this.dims;
        const Y = new Float64Array(N*dims);
        for(let i=0; i<N; i++) {
            const rand = generateRandom(dims, 0.0, 1e-3);
            for(let j=0; j<dims; j++) {
                Y[i*N + j] = rand[j];
            }
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
       /*
        return x1.reduce((sum, x1_i, i) => {
            sum + (x1_i - x2[i]) * (x1_i - x2[i]), 0
        });
       */
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
     * @param {} Y
     * @param {Float64Array[]} P
     * @param {Float64Array[]} Q
     */
    costGrad(Y, P, Q) {
        // todo
        const dims = this.dims;
        let grad = new Float64Array(dims);
        let pij, qij, cost = 0.0;
        for (let i = 0; i<dims; i++) {
            if(i == j) break;
            pij = P[i*N + j];
            qij = Q[i*N + j];
            cost += pij * Math.log(pij/qij); // calculate KLD
        }
    }
}