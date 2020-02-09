import tSNE from './tsne';
import { generateRandom } from './utils';

const data = generateRandom(10, 0, 0.001);
console.log(data);
const params = {perplexity:18, eta: 100};
const tsne = new tSNE(data, params);
/*
tsne.compute(1000).then(result => {
    console.log(result);
});*/
const result = tsne.compute(1000);
console.log(result);
