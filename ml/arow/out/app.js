"use strict";
var arow_1 = require('./arow');
var data_loader_1 = require('./data_loader');
var featureSize = 1355191;
var r = 0.1;
var clf = new arow_1.AROW(featureSize, r);
var trainDataFile = 'data/news20_train';
var testDataFile = 'data/news20_test';
console.log('asynchronous stream data read training');
data_loader_1.DataLoader.read(trainDataFile, function (x, label) {
    clf.update(x, label);
}, function () {
    console.log('a iteration training complete.');
    var size = 0;
    var error = 0;
    data_loader_1.DataLoader.read(testDataFile, function (x, label) {
        size++;
        var predLabel = clf.predict(x);
        if (predLabel != label) {
            error++;
        }
    }, function () {
        console.log('error rate = ' + (error / size));
    });
});
console.log('synchronous batch data read training');
var trainData = new data_loader_1.DataLoader(trainDataFile);
var testData = new data_loader_1.DataLoader(testDataFile);
console.log('load data complete.');
console.log(trainData.size, testData.size);
var maxIter = 5;
for (var i = 0; i < maxIter; i++) {
    trainData.data.forEach(function (e) {
        clf.update(e.x, e.label);
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