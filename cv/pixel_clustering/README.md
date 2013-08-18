# Pixel Clustering Module

## description

Pixel Clustering using k-means algorithm

see also [blog entry][entry]

### example
[![pixel_clustering](http://rest-term.com/labs/repos/images/pixel_clustering.jpg)](http://rest-term.com/labs/html5/pixelclustering.html)

## usage

```js
var ctx = document.querySelector('#Canvas').getContext('2d');
// source image, callback function
PixelCluster.load(srcImgName, function() {
  // performs k-means on a set of observation vectors forming k clusters
  PixelCluster.perform(division, k, function(data) {
    // render result to canvas
    PixelCluster.render(ctx, data, division);
  });
});
```

license
----------
Copyright &copy; 2012 wellflat Licensed under the [MIT License][MIT]

[MIT]: http://www.opensource.org/licenses/mit-license.php
[entry]: http://rest-term.com/archives/3073/
