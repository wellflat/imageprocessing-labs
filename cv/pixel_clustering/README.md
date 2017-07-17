# Pixel Clustering Module

## description

Pixel clustering using k-means++ algorithm

see also [blog entry][entry]

### sample
[![pixel_clustering](https://raw.github.com/wiki/wellflat/imageprocessing-labs/images/pixel_clustering.jpg)](http://rest-term.com/labs/html5/pixelclustering.html)

(Tests: IE10, Firefox23.0, Chrome28.0, Safari6.0)

## usage

```js
var ctx = document.querySelector('#Canvas').getContext('2d');
// source image, callback function
PixelCluster.load(srcImgName, function() {
  // performs k-means on a set of observation vectors forming k clusters
  var division = 100;
  var k = 4;
  var method = PixelCluster.KMEANS_PP;  // KMEANS_PP or KMEANS_RANDOM
  PixelCluster.perform(division, k, method, function(result) {
    // render the result to canvas element
    PixelCluster.render(ctx, division, result);
  });
});
```

license
----------
Copyright &copy; 2014 wellflat Licensed under the [MIT License][MIT]

[MIT]: http://www.opensource.org/licenses/mit-license.php
[entry]: http://rest-term.com/archives/3073/
