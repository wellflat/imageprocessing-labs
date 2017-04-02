# Line Segment Detector Module

## description

Line detection using Line Segments Detector (LSD) algorithm

see also [IPOL Journal][IPOL]

### demo
todo

## usage in ES6
```js
import LSD from './lsd';
import SampleImage from './sample.jpg';

let image = new Image();
image.src = SampleImage;
image.onload = () => {
  const width = image.width;
  const height = image.height;
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);
  let imageData = context.getImageData(0, 0, width, height);
  let detector = new LSD();
  let lines = detector.detect(imageData);
};
```


license
----------
Copyright &copy; 2017 wellflat Licensed under the [MIT License][MIT]

[MIT]: http://www.opensource.org/licenses/mit-license.php
[IPOL]: http://www.ipol.im/pub/art/2012/gjmr-lsd/
