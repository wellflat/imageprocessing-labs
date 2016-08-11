# Adaptive Regularization of Weight Vectors (AROW)

* AROW algorithm and LIBSVM format data loader modules  
(JavaScript codes in 'out' directory)
* LIBSVM Data: Classification (Binary Class) [news20.binary](https://www.csie.ntu.edu.tw/~cjlin/libsvmtools/datasets/binary.html#news20.binary)

## usage in TypeScript

```typescript
import {Feature, DataSet} from './types';
import {AROW} from './arow';
import {DataLoader} from './data_loader';

const featureSize: number = 1355191;
const r: number = 0.1;
const clf: AROW = new AROW(featureSize, r);
const trainDataFile: string = 'data/news20_train';
const testDataFile: string = 'data/news20_test';

console.log('asynchronous stream data read training');
DataLoader.read(trainDataFile, (x: Feature, label: number) => {
    clf.update(x, label);
}, () => {
    console.log('a iteration training complete.');
    let size: number = 0;
    let error: number = 0;

    DataLoader.read(testDataFile, (x: Feature, label: number) => {
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
const trainData: DataLoader = new DataLoader(trainDataFile);
const testData: DataLoader = new DataLoader(testDataFile);
console.log('load data complete.');
console.log(trainData.size, testData.size);

const maxIter: number = 5;
for (let i = 0; i < maxIter; i++) {
    trainData.data.forEach(e => {
        clf.update(e.x, e.label);
    });
    var error: number = 0;
    testData.data.forEach(e => {
        var predLabel: number = clf.predict(e.x);
        if (predLabel != e.label) {
            error++;
        }
    });
    console.log('iteration: ' + (i + 1) + ', error rate = ' + (error / testData.size));
}
```
