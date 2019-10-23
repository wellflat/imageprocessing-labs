
/**
 * t-SNE Module
 * @author https://github.com/wellflat
 */
export default class tSNE {

    /**
     * @param {number} perplexity
     * @param {number} eta
     * @param {number} maxIter
     */
    constructor(perplexity = 30, eta = 100, maxIter = 1000) {
        /** @type {number} */
        this.perplexity = perplexity;
        //this.perplexity = 18;
        /** @type {number} */
        this.eta = eta;
        /** @type {number} */
        this.maxIter = maxIter;

        this.init();
    }

    /**
     * @param {number[][]|Float64Array[]} X 
     * @return {Promise}
     */
    compute(X) {
        return new Promise();
    }

    init() {

    }

    /**
     * calculate L2 distance
     * @param {Float64Array} x1 
     * @param {Float64Array} x2 
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
     * @param {Float64Array} X 
     */
    calculatePairwiseDistance(X) {
        //let dist = zeros
    }

    /**
     * generate normally distributed random number array using Marsaglia polar method
     * @param {number} n 
     * @return {Float64Array}
     */
    generateRandom(n, mu, std) {
        if (n % 2 != 0) {
            throw new Error("n must be even number");
        }
        const data = new Float64Array(n);
        for(let i = 0; i < n; i+=2) {
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
}