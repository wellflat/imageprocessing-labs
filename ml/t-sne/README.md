# t-SNE Module

## description
[t-SNE](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding) (t-Distributed Stochastic Neighbor Embedding) implementation

## usage in JavaScript (ES2017)
```js
import tSNE from './tsne';
import { digits } from './digits_data';  // digits dataset

const params = { perplexity: 30, eta: 100, alpha: 0.5 };  // parameters
const tsne = new tSNE(digits.data, params);
const maxIter = 1000;  // max iteration

// 1. Promise version
tsne.compute(maxIter).then(result => {
    console.log(result);  // result: Float64Array[]
});

// 2. async/await
const result = await tsne.compute(maxIter);

// 3. generator version
const it = tsne.iterator(maxIter);
let step = it.next();  // step down gradient
while(!step.done) {
    console.log(step.value);
    step = it.next();
}
```

run sample code (see also src/index.js)
```
$ yarn install
$ yarn start
```

## demo tool
* [t-SNE projection visualizer](https://rest-term.com/labs/html5/tsne/)
* [vue-chart-sample](https://github.com/wellflat/vue-chart-sample)