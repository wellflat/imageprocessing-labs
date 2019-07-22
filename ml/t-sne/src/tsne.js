
/**
 * t-SNE Module
 * @author https://github.com/wellflat
 */
export default class tSNE {

    /**
     * @param {number} dim
     * @param {number} perplexity
     * @param {number} eta
     * @param {number} max_iter
     */
    constructor(dim = 2, perplexity = 30, eta = 100, max_iter = 1000) {
        /** @type {number} */
        this.dim = dim;
        /** @type {number} */
        this.perplexity = perplexity;
        /** @type {number} */
        this.eta = eta;
        /** @type {number} */
        this.max_iter = max_iter;

        this.init();
    }

    /**
     * @param {number[][]|Float64Array[]} X 
     */
    fit(X) {
    }

    init() {

    }
}