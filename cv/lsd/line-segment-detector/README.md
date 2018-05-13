# Line Segment Detector Module

## description

Line detection using Line Segment Detector ([LSD][IPOL]) algorithm

![lsd](https://raw.github.com/wiki/wellflat/imageprocessing-labs/images/lsd_apply.jpg)


see also [blog entry][entry]

## install

```
npm install line-segment-detector.js
```

- Todo npm publish ready: add package.json, unit test

### demo
[Line Segment Detector Demo](http://rest-term.com/labs/html5/lsd/index.html) [(mirror)](https://secret-nether-5891.herokuapp.com/lsd/)

[![lsd_demo](https://raw.github.com/wiki/wellflat/imageprocessing-labs/images/lsd_demo.jpg)](http://rest-term.com/labs/html5/lsd/index.html)


## usage in JavaScript (ES2015)
```js
import LSD from './lsd';
// input 8bit gray scale image
import SampleImage from './sample.jpg';

const image = new Image();
image.src = SampleImage;
image.onload = () => {
    const width = image.width;
    const height = image.height;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);
    document.getElementById('content').appendChild(canvas);
    const imageData = context.getImageData(0, 0, width, height);
    const detector = new LSD();
    const lines = detector.detect(imageData);
    console.log('lines: ' + lines.length.toString());
    detector.drawSegments(context, lines);
};
```

### React Component
```js
import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LSDComponent from './lsd_component';
import SampleImage from './sample.jpg';

ReactDOM.render(
    <MuiThemeProvider>
        <LSDComponent src={SampleImage} />
    </MuiThemeProvider>,
    document.getElementById('content')
);
```


license
----------
Copyright &copy; 2017 wellflat Licensed under the [MIT License][MIT]

[MIT]: http://www.opensource.org/licenses/mit-license.php
[IPOL]: http://www.ipol.im/pub/art/2012/gjmr-lsd/
[entry]: http://rest-term.com/archives/3393/
