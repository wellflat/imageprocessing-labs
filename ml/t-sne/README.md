# t-SNE Module
==============
## t-SNE (t-Distributed Stochastic Neighbor Embedding) implementation

## usage in JavaScript (ES2017)
```js
import tSNE from './tsne';
import { digits } from './digits_data';  // digits dataset

const params = { perplexity: 30, eta: 100, alpha: 0.5 };  // parameters
const tsne = new tSNE(digits.data, params);
const maxIter = 1000;  // max iteration

// Promise version
tsne.compute(maxIter).then(result => {
    console.log(result);  // result: Float64Array[]
});
// async/await
const result = await tsne.compute(maxIter);

// generator version
const it = tsne.iterator(maxIter);
let step = it.next();  // step down gradient
while(!step.done) {
    console.log(step.value);
    step = it.next();
}
```