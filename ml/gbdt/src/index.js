import GradientBoostingRegressor from './gradient_boosting';
import boston from './boston_data';
import { rmse, score } from './metrics';
import sourcemap from 'source-map-support';
sourcemap.install();

const [x, y] = [boston.data, boston.target];
const end = Math.floor(x.length * 0.8);
const trainX = x.slice(0, end),
    testX = x.slice(end),
    trainY = y.slice(0, end),
    testY = y.slice(end);

console.log(trainX.length, testX.length, trainY.length, testY.length);

const estimator = new GradientBoostingRegressor(100, 0.1, 3);

console.log('train');
const st = new Date().getTime();
estimator.fit(trainX, trainY);
console.log(`${(new Date().getTime() - st) / 1000} sec`);

console.log('predict');
const predY = estimator.predict(testX);

console.log(`RMSE = ${rmse(testY, predY)}`);
console.log(`R2 Score = ${score(testY, predY)}`);
