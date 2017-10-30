# Gradient Boosting Module

## description
Gradient Boosting Decision Trees (GBDT) Learning 

## usage in JavaScript (ES2015)
```js
import GradientBoostingRegressor from './gradient_boosting';
import boston from './boston_data';        // Boston housing dataset
import { rmse, score } from './metrics';   // RMSE, R^2 score

// data preparation
const [x, y] = [boston.data, boston.target];
const end = Math.floor(x.length * 0.8);
const trainX = x.slice(0, end),
    testX = x.slice(end),
    trainY = y.slice(0, end),
    testY = y.slice(end);

const estimator = new GradientBoostingRegressor(100, 0.1, 3);

// train
estimator.fit(trainX, trainY);

// predict
const predY = estimator.predict(testX);

// calculate RMSE, R2 Score
console.log(`RMSE = ${rmse(testY, predY)}`);
console.log(`R2 Score = ${score(testY, predY)}`);
```
