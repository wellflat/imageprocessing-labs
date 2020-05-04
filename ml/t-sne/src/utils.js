
import { promises as fs } from 'fs';

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
}

/**
 * write down result
 * @param {string} fileName 
 * @param {Float64Array[]} result 
 */
export async function writeResult(fileName, result) {
    const N = result.length;
    const dims = result[0].length;
    let str = '';
    for(let i=0; i<N; i++) {
        for(let d=0; d<dims; d++) {
            str += result[i][d] + '\t';
        }
        str += '\n';
    }
    await fs.appendFile(fileName, str);
}