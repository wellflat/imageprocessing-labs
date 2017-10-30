/**
 * MSE (Mean Squared Error)
 * @param {number[]} test
 * @param {number[]} pred
 * @return {number}
 */
export function mse(test, pred) {
    if (test.length != pred.length) {
        throw Error('test.length != pred.length');
    }
    return test.reduce((p, c, i) => {
        return p + (c - pred[i]) * (c - pred[i]);
    }, 0.0) / pred.length;
}

/**
 * RMSE (Root Mean Squared Error)
 * @param {number[]} test
 * @param {number[]} pred
 * @return {number}
 */
export function rmse(test, pred) {
    return Math.sqrt(mse(pred, test));
}

/**
 * R^2 score
 * @param {number[]} test
 * @param {number[]} pred 
 * @return {number}
 */
export function score(test, pred) {
    return 1.0 - mse(test, pred) / variance(test);
}

/**
 * Residuals
 * @param {number[]} test
 * @param {number[]} pred
 * @return {number[]}
 */
export function residual(test, pred) {
    if (test.length != pred.length) {
        throw Error('test.length != pred.length');
    }
    let residual = [];
    for (let i = 0; i < test.length; i++) {
        residual[i] = test[i] - pred[i];
    }
    return residual;
}

/**
 * @param {number[]} data
 * @return {number}
 */
function variance(data) {
    const mean = data.reduce((p, c) => p + c) / data.length;
    return data.reduce((p, c) => {
        return p + (c - mean) * (c - mean);
    }, 0.0) / data.length;
}