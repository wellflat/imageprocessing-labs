import { Edge } from './types';

/**
 * constants and utility math functions
 */

const M_3_2_PI = (3 * Math.PI) / 2;
const M_2__PI = (2 * Math.PI);
const M_LN10 = 2.30258509299404568402;
const NOT_DEF = -1024.0;
const USED = 1;
const NOT_USED = 0;
const RELATIVE_ERROR_FACTOR = 100.0;
const DEG_TO_RADS = Math.PI / 180;
const REFINE_NONE = 0;
const REFINE_STD = 1;
const REFINE_ADV = 2;


const logGamma = (x: number) => x > 15.0 ? logGammaWindschitl(x) : logGammaLanczos(x);

const logGammaWindschitl = (x: number) =>
    0.918938533204673 + (x - 0.5) * Math.log(x) - x
    + 0.5 * x * Math.log(x * Math.sinh(1 / x) + 1 / (810.0 * Math.pow(x, 6.0)));

function logGammaLanczos(x: number) {
    const q = [
        75122.6331530, 80916.6278952, 36308.2951477,
        8687.24529705, 1168.92649479, 83.8676043424,
        2.50662827511
    ];
    let a = (x + 0.5) * Math.log(x + 5.5) - (x + 5.5);
    let b = 0;
    for(let n = 0; n < 7; ++n) {
        a -= Math.log(x + n);
        b += q[n] * Math.pow(x, n);
    }
    return a + Math.log(b);
}

const distSq = (x1: number, x2: number, y1: number, y2: number) =>
    (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);

const dist = (x1: number, x2: number, y1: number, y2: number) => Math.sqrt(distSq(x1, y1, x2, y2));

function angleDiffSigned(a: number, b: number) {
    let diff = a - b;
    const PI = Math.PI;
    while (diff <= -PI) {
        diff += M_2__PI;
    }
    while (diff > PI) {
        diff -= M_2__PI;
    }
    return diff;
}

function angleDiff(a: number, b: number) {
    const value = angleDiffSigned(a, b);
    return value >= 0  ? value : -value;
}

function doubleEqual(a: number, b: number) {
    if (a == b) {
        return true;
    }
    const diff = a - b;
    const absDiff = diff >= 0 ? diff : -diff;
    const aa = a >= 0 ? a : - a;
    const bb = b >= 0 ? b : - b;
    let absMax = (aa > bb) ? aa : bb;
    const MIN_VALUE = Number.MIN_VALUE;
    if (absMax < MIN_VALUE) {
        absMax = MIN_VALUE;
    }
    return (absDiff / absMax) <= (RELATIVE_ERROR_FACTOR * Number.EPSILON);
}

function AsmallerB_XoverY(a: Edge, b: Edge) {
    if (a.p.x == b.p.x) {
        return Number(a.p.y < b.p.y);
    } else {
        return Number(a.p.x < b.p.x);
    }
}

export {
    M_3_2_PI, M_2__PI, M_LN10,
    NOT_DEF, USED, NOT_USED, RELATIVE_ERROR_FACTOR, DEG_TO_RADS,
    REFINE_NONE, REFINE_STD, REFINE_ADV,
    logGamma, dist, distSq, angleDiff, doubleEqual, AsmallerB_XoverY
};
