import tSNE from './tsne';
import { generateRandom } from './utils';
import { digits } from './digits_data';


//console.log(digits);
const params = {perplexity:5, eta: 100};
//const typed = digits.data.map(e => new Float64Array(e));
const tsne = new tSNE(digits.data, params);
//const data = generateRandom(50, 0, 0.001);
//console.log(data);
//const tsne = new tSNE(data, params);

tsne.compute(1000).then(result => {
    //console.log(result);
    console.log('end');
});
