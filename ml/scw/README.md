# SCW (Soft Confidence Weighted Learning)

* SCW algorithm and LIBSVM format data loader modules  
(JavaScript codes in 'out' directory)
* LIBSVM Data: Classification (Binary Class) [a9a](https://www.csie.ntu.edu.tw/~cjlin/libsvmtools/datasets/binary.html#a9a)

## usage in TypeScript

```typescript
import {Feature, DataSet} from './types';
import {SCW} from './scw';
import {DataLoader} from './data_loader';

const featureSize: number = 123;
const eta: number = 0.9;
const C: number = 1.0;
const clf: SCW = new SCW(featureSize, eta, C, SCW.SCW_II);
const trainDataFile: string = 'data/a9a';
const testDataFile: string = 'data/a9a.t';

console.log('asynchronous stream data read training');
DataLoader.read(trainDataFile, featureSize, (x: Float32Array, label: number) => {
    clf.update(x, label);
}, () => {
    console.log('a iteration training complete.');
    let size: number = 0;
    let error: number = 0;

    DataLoader.read(testDataFile, featureSize, (x: Float32Array, label: number) => {
        size++;
        let predLabel: number = clf.predict(x);
        if (predLabel != label) {
            error++;
        }
    }, () => {
        console.log('error rate = ' + (error / size));
    });
});

console.log('synchronous batch data read training');
const trainData: DataLoader = new DataLoader(trainDataFile, featureSize);
const testData: DataLoader = new DataLoader(testDataFile, featureSize);
console.log('load data complete.');
console.log(trainData.size, testData.size);

const maxIter: number = 5;
for (let i = 0; i < maxIter; i++) {
    trainData.data.forEach(e => {
        clf.update(<Float32Array>e.x, e.label);
    });
    let error: number = 0;
    testData.data.forEach(e => {
        let predLabel: number = clf.predict(<Float32Array>e.x);
        if (predLabel != e.label) {
            error++;
        }
    });
    console.log('iteration: ' + (i + 1) + ', error rate = ' + (error / testData.size));
}
```
