"use strict";
var scw_1 = require('./scw');
var data_loader_1 = require('./data_loader');
var featureSize = 123;
var eta = 1.0;
var C = 0.9;
var clf = new scw_1.SCW(featureSize, eta, C, scw_1.SCW.SCW_II);
var trainDataFile = 'data/a9a_train.txt';
var testDataFile = 'data/a9a_test.txt';
console.log('synchronous batch data read training');
var trainData = new data_loader_1.DataLoader(trainDataFile, featureSize);
var testData = new data_loader_1.DataLoader(testDataFile, featureSize);
console.log('load data complete.');
console.log(trainData.size, testData.size);
var maxIter = 1;
var c = 0;
var verbose = false;
for (var i = 0; i < maxIter; i++) {
    trainData.data.forEach(function (e) {
        if (c % 100 == 0) {
            verbose = true;
        }
        clf.update(e.x, e.label, verbose);
        c++;
        verbose = false;
    });
    var error = 0;
    testData.data.forEach(function (e) {
        var predLabel = clf.predict(e.x);
        if (predLabel != e.label) {
            error++;
        }
    });
    console.log('iteration: ' + (i + 1) + ', error rate = ' + (error / testData.size));
}
//# sourceMappingURL=app.js.map