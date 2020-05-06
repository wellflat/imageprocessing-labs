import tSNE from './tsne';
import { digits } from './digits_data';

const params = {perplexity:30, eta: 100, alpha: 0.5};
const tsne = new tSNE(digits.data, params);

//const tsne = new tSNE(data, params);
const iter = 100;
/*
tsne.compute(iter).then(result => {
    //console.log(result);
    console.log(result);
    writeResult('output.txt', result);
});*/

const it = tsne.iterator(iter);
let step = it.next();
while(!step.done) {
    //console.log(step.value);
    step = it.next();
}
//const result = await tsne.compute(iter);
