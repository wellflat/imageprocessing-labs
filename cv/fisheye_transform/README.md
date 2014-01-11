# Fish-Eye Transform Module

## description

Circular Fish-Eye transform

see also [blog entry][entry]

### sample
[![fisheye_transform](http://rest-term.com/labs/repos/images/fisheye_transform.jpg)](http://rest-term.com/labs/html5/fisheye.html)

(Tests: IE9, Firefox16.0, Chrome21.0, Safari6.0, Opera12.0)

## usage

```js
//  img: ImageData object
//  focalLength: focal-length Number (int)
//  radius: circle radius Number (int)
var focalLength = 55;
var radius = 60;

// return ImageData object
var result = Fisheye.transform(img, focalLength, radius);

```

license
----------
Copyright &copy; 2014 wellflat Licensed under the [MIT License][MIT]

[FishEye]: http://rest-term.com/labs/html5/fisheye.html
[MIT]: http://www.opensource.org/licenses/mit-license.php
[entry]: http://rest-term.com/archives/2991/
