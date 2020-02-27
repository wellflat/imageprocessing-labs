
/**
 * t-SNE Module
 * @author https://github.com/wellflat
 */
export default class tSNE {

    /**
     * @param {number[][]|Float64Array[]} data
     * @param {{perplexity:number, eta:number}} params
     */
    constructor(data, params) {
        /** @type {number[][]|Float64Array[]} */
        this.data = data;
        /** @type {{perplexity:number, eta:number}} */
        this.params = params;
        this.init();
    }

    init() {
        if (Array.isArray(this.data[0])) {
            // convert typed array
            const typed = this.data.map(e => new Float64Array(e));
            this.data = typed;
        }
    }

    /**
     * compute t-SNE projection
     * @param {number} iterations
     * @return {Promise<Float64Array>}
     */
    compute(iterations) {
        let Y = new Float64Array(this.data.length);
        return new Promise((resolve, reject) => {
            resolve(Y);
        });
    }

    /**
     * calculate L2 distance
     * @param {Float64Array} x1 
     * @param {Float64Array} x2 
     * @return {number}
     */
    calculateL2Distance(x1, x2) {
        let distance = 0;
        for(let i = 0; i < x1.length; i++) {
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
        for(let i = 0; i < N; i++) {
            for(let j = i + 1; j < N; j++) {
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
     */
    calculatePerplexity(probs) {
        return probs.reduce(
            (sum, p) => sum - (p > 1e-7 ? p*Math.log(p) : 0), 0
        );
    }

    /**
     * calcualte Kullback-Leibler Divergence (KLD)
     * @param {number} p 
     * @param {number} q 
     */
    calculateKLD(p, q) {
        return p * Math.log(p/q);
    }
}