
/**
 * t-SNE Module
 * @author https://github.com/wellflat
 */
export default class tSNE {
    /**
     * @param {number} perplexity
     * @param {number} dim
     * @param {number} eps 
     */
    constructor(dim = 2, perplexity = 30, learning_rate = 100, max_iter = 1000) {
        /** @type {number} */
        this.dim = dim;
        /** @type {number} */
        this.perplexity = perplexity;
        /** @type {number} */
        this.learning_rate = learning_rate;
        /** @type {number} */
        this.max_iter = max_iter;
    }

    fit(X) {

    }
}