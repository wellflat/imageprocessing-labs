# Poisson Image Editing Module

## description

Image composition using Poisson Image Editing algorithm

see also [blog entry][entry]

### sample
[![poisson_blending](https://raw.github.com/wiki/wellflat/imageprocessing-labs/images/poisson_blending.jpg)](http://rest-term.com/labs/html5/poisson.html)

(Tests: IE10, Firefox22.0, Chrome28.0, Safari6.0)

## usage

```js
var ctx = document.querySelector('#Canvas').getContext('2d');
// source image, destination image, mask image, callback function
Poisson.load(srcImgName, dstImgName, maskImgName, function() {
  // max iteration, X offset, Y offset
  var result = Poisson.blend(100, 10, -20);
  // render to canvas
  ctx.putImageData(result, 0, 0);
});
```

license
----------
Copyright &copy; 2014 wellflat Licensed under the [MIT License][MIT]

[MIT]: http://www.opensource.org/licenses/mit-license.php
[entry]: http://rest-term.com/archives/3066/
