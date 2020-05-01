
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
        //console.log(D);
        //this.setP(D, this.params.perplexity);
        return new Promise((resolve, reject) => {
            resolve(this.Y);
        });
    }

    /**
     * set p_(ij) = p_(j|i) + p_(i|j) / 2n
     * @param {Float64Array[]} D pairwise distances
     */
    setP(D) {
        const N = this.data.length;
        const perpTarget = Math.log(this.params.perplexity);
        const P = new Float64Array(N * N);
        const condP = new Float64Array(N * N);
        const tol = 1e-3, maxIter = 50;

        // compute pairwise affinities p_(j|i) with perplexity
        for (let i = 0; i < N; i++) {
            // todo: decompose into functions
            // binary search to find sigma
            let lb = 0.0;
            let ub = Number.POSITIVE_INFINITY;
            let sigma = 1.0;
            let searching = true, n = 0;
            while(searching) {
                for (let j = 0; j < N; j++) {
                    if (i === j) {
                        condP[j * N + i] = 0.0;
                    } else {
                        condP[j * N + i] = Math.exp(-D[i * N + j] / (2.0 * sigma));
                    }
                }

                let sum = 0.0;
                for (let k = 0; k < N; k++) {
                    if (i != k) {
                        sum += condP[k * N + i];
                    }
                }
                for (let j = 0; j < N; j++) {
                    condP[j * N + i] /= sum;
                }

                // compute perplexity
                let Hpi = 0.0;  // H(Pi) = -Σp_(j|i)log(p_(j|i))
                for (let j = 0; j < N; j++) {
                    if (i != j) {
                        Hpi -= condP[j * N + i] * Math.log(condP[j * N + i]);
                    }
                }
                let perpPi = Math.pow(2.0, Hpi);  // Perp(Pi) = 2^H(Pi)

                if (perpPi < perpTarget) {
                    ub = sigma;
                    if(ub === Number.POSITIVE_INFINITY) {
                        sigma = sigma * 2;
                    } else {
                        sigma = (sigma + ub) / 2;
                    }
                } else {
                    lb = sigma;
                    if(lb === Number.NEGATIVE_INFINITY) {
                        sigma = sigma / 2;
                    } else {
                        sigma = (sigma + lb) / 2;
                    }
                }
                console.log(`sigma^2 ${i}: ${lb}`);

                n++;
            }
        } // end loop of i

        // set p_(ij)
        for(let i=0; i<N; i++) {
            for(let j=0; j<N; j++) {
                if(i!=j) {
                    P[i*N + j] = (condP[i*N + j] + condP[j*N + i])/(2*N);
                }
            }
        }
        return P;
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
     * @param {Float64Array} probs
     * @return {number}
     */
    calculateEntropy(probs) {
        return probs.reduce(
            (sum, p) => sum - (p > 1e-7 ? p * Math.log(p) : 0), 0
        );
    }

    /**
     * calculate gaussian probability: p_(i|j)
     * @param {Float64Array} distances
     * @param {number} sigma
     * @return {number[]}
     */
    calculateProbs(distances, sigma) {
        let sum = 0.0;
        const pij = distances.map(d => {
            const prob = Math.exp(-d / (2.0 * sigma));
            const currProb = d !== 0 ? prob : 0;  // p_(i|i) = 0
            sum += currProb;
            return currProb;
        }).map(p => p/sum);
        return pij;
    }

    /**
     * perform binary search to find sigma
     * @param {Float64Array[]} distances pairwise distances
     * @param {number} i index of distance[i]
     */
    searchSigma(distances, i) {
        const tol = 1e-3;
        const maxIter = 50;
        let lb = 0.0, ub = Number.POSITIVE_INFINITY;
        let sigma = 1.0;
        let isSearching = true;
        let probs, entropy;
        let n = 0;
        while(isSearching) {
            probs = this.calculateProbs()
            n++;
            //todo
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