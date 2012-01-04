module("1D/2D-FFT/IFFT");
asyncTest("FFT module tests", function() {
  try {
    var image = new Image(),
        canvas = document.querySelector('#qunit-canvas'),
        context = canvas.getContext('2d');
    image.src = './lena_gray.jpg';
    image.addEventListener('load', function(e) {
      start();
      context.drawImage(image, 0, 0);
      var w = image.width,
          h = image.height,
          re = [],
          im = [],
          src = context.getImageData(0, 0, w, h),
          data = src.data;
      raises(function() {
        FFT.init(3);
      }, "raises Error, required radix-2");
      FFT.init(w);
      for(var y=0; y<h; y++) {
        var i = y*w;
        for(var x=0; x<w; x++) {
          re[i + x] = data[(i << 2) + (x << 2)];
          im[i + x] = 0.0;
        }
      }
      var re2 = re.concat(),
          im2 = im.concat(),
          step = 100,
          diff = 0.0,
          error = 1.0e-12;
      // 1D-FFT/IFFT
      FFT.fft1d(re, im);
      FFT.ifft1d(re, im);
      for(var j=0; j<step*step; j+=step) {
        diff = re[j] - re2[j];
        diff = diff > 0 ? diff : -diff;
        ok(diff < error, "fft1d -> ifft1d, Re error: " + diff);
        diff = im[j] - im2[j];
        diff = diff > 0 ? diff : -diff;
        ok(diff < error, "fft1d -> ifft1d, Im error: " + diff);
      }
      // 2D-FFT/IFFT
      re = re2.concat();
      im = im2.concat();
      FFT.fft2d(re, im);
      FFT.ifft2d(re, im);
      for(var j=0; j<step*step; j+=step) {
        diff = re[j] - re2[j];
        diff = diff > 0 ? diff : -diff;
        ok(diff < error, "fft2d -> ifft2d, Re error: " + diff);
        diff = im[j] - im2[j];
        diff = diff > 0 ? diff : -diff;
        ok(diff < error, "fft2d -> ifft2d, Im error: " + diff);
      }
    }, false);
  } catch(e) {
    return;
  }
});