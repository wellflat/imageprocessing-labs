/**
 * FFT Power Spectrum Viewer
 */
var SpectrumViewer = (function() {
  var _context = null,
      _n = 0,
      _img = null,
      _data = null,
      // public methods
      _init = function(context) {
        _context = context;
        _n = context.canvas.width,
        _img = context.getImageData(0, 0, _n, _n);
        _data = _img.data;
      },
      // render FFT power spectrum on the Canvas
      _render = function(re, im, islog) {
        var val = 0,
            i = 0,
            p = 0,
            spectrum = [],
            max = 1.0,
            imax = 0.0,
            n2 = _n*_n;
        for(var i=0; i<n2; i++) {
          if(islog){
            spectrum[i] = Math.log(Math.sqrt(re[i]*re[i] + im[i]*im[i]));
          } else {
            spectrum[i] = Math.sqrt(re[i]*re[i] + im[i]*im[i]);
          }
          if(spectrum[i] > max) {
            max = spectrum[i];
          }
        }
        imax = 1/max;
        for(var j=0; j<n2; j++) {
          spectrum[j] = spectrum[j]*255*imax;
        }
        for(var y=0; y<_n; y++) {
          i = y*_n;
          for(var x=0; x<_n; x++) {
            val = spectrum[i + x];
            p = (i << 2) + (x << 2);
            _data[p] = 0;
            _data[p + 1] = val;
            _data[p + 2] = val >> 1;
          }
        }
        _context.putImageData(_img, 0, 0);
      };
  // public APIs
  return {
    init: _init,
    render: _render
  };
})();