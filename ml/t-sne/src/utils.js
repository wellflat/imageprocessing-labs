
/**
 * generate normally distributed random number array using Marsaglia polar method
 * @param {number} n
 * @param {number} mu
 * @param {number} std
 * @return {Float64Array}
 */
export function generateRandom(n, mu, std) {
    if (n % 2 != 0) {
        throw new TypeError("n must be even number");
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

/**
 * clone 2d-typed array
 * @param {Float64Array[]} src
 * @return {Float64Array[]}
 */
export function clone(src) {
    const arr = [];
    const N = src.length;
    const dims = src[0].length;
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < dims; j++) {
            arr[i] = src[i].slice();
        }
    }
    return arr;
};