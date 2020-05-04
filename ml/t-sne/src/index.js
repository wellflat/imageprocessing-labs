import tSNE from './tsne';
import { digits } from './digits_data';
import { writeResult } from './utils';

console.log(digits.target);
const params = {perplexity:30, eta: 100, alpha: 0.5};
const tsne = new tSNE(digits.data, params);

//const tsne = new tSNE(data, params);
const iter = 100;

tsne.compute(iter).then(result => {
    //console.log(result);
    console.log(result);
    writeResult('output.txt', result);
});

//const result = await tsne.compute(iter);
