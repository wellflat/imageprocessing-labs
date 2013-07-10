# Corner Detection Module

## description

Corner detection using Harris operator

see also [blog entry][entry]

### example
[![corner_detection](http://rest-term.com/labs/repos/images/room_corners.jpg)](http://rest-term.com/labs/html5/corner.html)

## usage

```js
// parameters for Harris corner detection
// blockSize: Neighborhood size (3×3 or 5×5)
// k: Harris detector free parameter (recommends 0.04 ~ 0.15)
// qualityLevel: Parameter characterizing the minimal accepted quality of image corners
var params = { blockSize: 3, k: 0.04, qualityLevel: 0.01 };
// img: ImageData object
// returns Array of detected corners
var corners = CornerDetector.detect(img, CornerDetector.HARRIS, params);

```

license
----------
Copyright &copy; 2012 wellflat Licensed under the [MIT License][MIT]

[MIT]: http://www.opensource.org/licenses/mit-license.php
[entry]: http://rest-term.com/archives/2986/
