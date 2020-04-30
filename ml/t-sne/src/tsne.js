
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
        this.init();
    }

    init() {
        if (Array.isArray(this.data[0])) {
            // convert typed array
            const typed = this.data.map(e => new Float64Array(e));
            this.data = typed;
        }
        // initial solution
        this.Y = generateRandom(this.data.length, 0, 0.001)

    }

    /**
     * compute t-SNE projection
     * @param {number} iterations
     * @return {Promise<Float64Array>}
     */
    compute(iterations) {
        // not yet impl.
        //
        let Y = new Float64Array(this.data.length);
        const D = this.calculatePairwiseDistance(this.data);
        console.log(D);
        //this.setP(D, this.params.perplexity);
        return new Promise((resolve, reject) => {
            resolve(Y);
        });
    }

    /**
     * set p_(ij) = p_(j|i) + p_(i|j) / 2n
     * @param {Float64Array[]} D pairwise distances
     */
    setP(D, perplexity) {
        const N = this.data.length;
        const P = new Float64Array(N * N);
        const condP = new Float64Array(N * N);

        // compute pairwise affinities p_(j|i) with perplexity
        for (let i = 0; i < N; i++) {
            // binary search to find a sigma2
            let lb = 0.0, ub = 1e+10;//Number.POSITIVE_INFINITY;
            let sigma2 = 1.0;
            const MAX_ATTEMPTS = 50;
            for (let bi = 0; bi < MAX_ATTEMPTS; bi++) {
                let sigma2 = (lb + ub)/2.0;
                for (let j = 0; j < N; j++) {
                    if (i == j) {
                        condP[j * N + i] = 0.0;
                    } else {
                        condP[j * N + i] = Math.exp(-D[i * N + j] / (2.0 * sigma2));
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
                let Hpi = 0.0;
                for (let j = 0; j < N; j++) {
                    if (i != j) {
                        Hpi -= condP[j * N + i] * Math.log(condP[j * N + i]);
                    }
                }
                let perpPi = Math.pow(2.0, Hpi);
                if (perpPi < perplexity) {
                    lb = sigma2;
                } else {
                    ub = sigma2;
                }
                console.log(`sigma^2 ${i}: ${lb}`);
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
     * calculate perplexity
     * @param {Float64Array} probs
     * @return {number}
     */
    calculatePerplexity(probs) {
        return probs.reduce(
            (sum, p) => sum - (p > 1e-7 ? p * Math.log(p) : 0), 0
        );
    }

    /**
     * calcualte Kullback-Leibler Divergence (KLD)
     * @param {number} p 
     * @param {number} q
     * @return {number}
     */
    calculateKLD(p, q) {
        return p * Math.log(p / q);
    }
}