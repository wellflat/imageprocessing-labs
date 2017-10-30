export default class RegressionTree {
    /**
     * @param {number} depth 
     */
    constructor(depth) {
        /** @type {number} */
        this.N = (1 << depth) - 1;
        /** @type {number} */
        this.depth = depth;
        /** @type {Node[]} */
        this.nodes = [];
        this.nodes.length = this.N;
    }

    /**
     * @param {Float64Array[]} x
     * @param {Float64Array} y
     */
    fit(x, y) {
        for (let i = 0; i < this.N; i++) {
            this.nodes[i] = new Node();
        }
        for (let i = 0; i < y.length; i++) {
            this.nodes[0].ids.push(i);
        }
        for (let i = 0; i < this.N; i++) {
            this.growTree(i, x, y);
        }
        this.nodes.forEach((node) => node.ids = []);
    }

    /**
     * @param {Float64Array} x
     * @return {number}
     */
    predict(x) {
        if (this.N == 0) {
            return 0.0;
        }
        let id = 0;
        while (true) {
            const node = this.nodes[id];
            if (node.j == -1) {
                return node.label;
            }
            if (x[node.j] < node.threshold) {
                id = node.left;
            } else {
                id = node.right;
            }
        }
    }

    /**
     * @param {number} id
     * @param {Float64Array[]} x
     * @param {Float64Array} y
     */
    growTree(id, x, y) {
        const node = this.nodes[id];
        node.label = 0.0;
        let len = node.ids.length;
        for (let i = 0; i < len; i++) {
            node.label += y[node.ids[i]];
        }
        if (node.ids.length == 0) return;
        node.label /= node.ids.length;
        if (2 * id + 1 >= this.N) return;
        [node.left, node.right] = [2 * id + 1, 2 * id + 2];
        const best = this.searchBestSplit(id, x, y);
        [node.j, node.threshold] = best;
        if (best[0] == -1) return;
        for (let i = 0; i < len; i++) {
            if (x[node.ids[i]][node.j] < node.threshold) {
                this.nodes[node.left].ids.push(node.ids[i]);
            } else {
                this.nodes[node.right].ids.push(node.ids[i]);
            }
        }
    }

    /**
     * @param {number} id
     * @param {Float64Array[]} x
     * @param {Float64Array} y
     * @return {number[]}
     */
    searchBestSplit(id, x, y) {
        let currentImpurity = Number.MAX_VALUE,
            dim = x[0].length,
            len = this.nodes[id].ids.length,
            best = [-1, Number.MAX_VALUE];
        for (let j = 0; j < dim; j++) {
            let v = new Float64Array(len);
            for (let i = 0; i < len; i++) {
                v[i] = x[this.nodes[id].ids[i]][j];
            }
            for (let i = 0; i < v.length; i++) {
                const impurity = this.calculateImpurity(j, v[i], id, x, y);
                if (currentImpurity > impurity) {
                    currentImpurity = impurity;
                    best = [j, v[i]];
                }
            }
        }
        return best;
    }

    /**
     * @param {number} j 
     * @param {number} threshold
     * @param {number} id 
     * @param {Float64Array[]} x 
     * @param {Float64Array} y 
     * @return {number}
     */
    calculateImpurity(j, threshold, id, x, y) {
        let llabel = 0.0, rlabel = 0.0,
            lnum = 0, rnum = 0,
            len = this.nodes[id].ids.length;
        for (let i = 0; i < len; i++) {
            const ii = this.nodes[id].ids[i];
            if (x[ii][j] < threshold) {
                llabel += y[ii];
                lnum++;
            } else {
                rlabel += y[ii];
                rnum++;
            }
        }
        if (lnum == 0 || rnum == 0) {
            return Number.MAX_VALUE;
        }
        llabel /= lnum;
        rlabel /= rnum;

        let lcost = 0.0, rcost = 0.0;
        for (let i = 0; i < len; i++) {
            let ii = this.nodes[id].ids[i];
            if (x[ii][j] < threshold) {
                lcost += (y[ii] - llabel) * (y[ii] - llabel);
            } else {
                rcost += (y[ii] - rlabel) * (y[ii] - rlabel);
            }
        }
        return lcost + rcost;
    }
}
/**
 * Regression tree's node
 */
class Node {
    constructor() {
        this.left = -1;
        this.right = -1;
        this.j = -1;
        /** @type {number[]} */
        this.ids = [];
        this.threshold = 0.0;
        this.label = 0.0;
    }
}