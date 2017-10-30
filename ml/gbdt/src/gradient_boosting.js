/**
 * Gradient Boosting Regression Tree (GBRT) Module
 * @author https://github.com/wellflat
 */

import RegressionTree from './regression_tree';

export default class GradientBoostingRegressor {
    /**
     * @param {number} nEstimators
     * @param {number} learningRate
     * @param {number} depth
     * @param {Function} lossFunction
     */
    constructor(nEstimators = 100, learningRate = 0.1, depth = 3, lossFunction = (y, f) => y - f) {
        /** @type {number} */
        this.depth = depth;
        /** @type {number} */
        this.nEstimators = nEstimators;
        /** @type {RegressionTree[]} */
        this.trees = [];
        for (let i = 0; i < this.nEstimators; i++) {
            this.trees[i] = new RegressionTree(this.depth);
        }
        /** @type {number} */
        this.lr = learningRate;
        /** @type {Function} */
        this.loss = lossFunction;
    }

    /**
     * @param {Float64Array[]} x
     * @param {Float64Array} y
     */
    fit(x, y) {
        if (x.length != y.length) {
            throw Error('x.length != y.length');
        }
        this.trees[0].fit(x, y);
        let f = x.map(v =>  this.trees[0].predict(v));
        for (let i = 1; i < this.nEstimators; i++) {
            const ngrad = y.map((v, i) =>  this.loss(v, f[i]));
            this.trees[i].fit(x, ngrad);
            f = x.map((v, j) => f[j] + this.lr * this.trees[i].predict(v));
        }
    }

    /**
     * @param {Float64Array|Float64Array[]} x
     * @return {number|number[]}
     */
    predict(x) {
        /** @type {number|number[]} */
        let pred;
        if (typeof x[0].length === 'undefined') {
            pred = this.trees.slice(1).reduce((pred, tree) => {
                return pred + this.lr * tree.predict(x);
            }, this.trees[0].predict(x));
        } else {
            pred = new Array(x.length).fill(0.0).map((v, i) => {
                return this.trees.slice(1).reduce((pred, tree) => {
                    return pred + this.lr * tree.predict(x[i]);
                }, this.trees[0].predict(x[i]));
            });
        }
        return pred;
    }
}