import tSNE from './tsne';
import { generateRandom } from './utils';
import { digits } from './digits_data';

const data = generateRandom(10, 0, 0.001);
console.log(data);
const params = {perplexity:18, eta: 100};
//const typed = digits.data.map(e => new Float64Array(e));
const tsne = new tSNE(digits.data, params);
console.log(digits);
tsne.compute(1000).then(result => {
    console.log(result);
});
const result = tsne.compute(1000);
console.log(result);