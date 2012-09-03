/**
 * Spatial Frequency Filtering
 * High-pass/Low-pass/Band-pass Filter
 * Windowing using hamming window
 */
(function() {
  var FrequencyFilter;  // top-level namespace
  var _root = this;     // reference to 'window' or 'global'

  if(typeof exports !== 'undefined') {
    FrequencyFilter = exports;   // for CommonJS
  } else {
    FrequencyFilter = _root.FrequencyFilter = {};
  }

  // core operations
  var _n = 0;
  var core = {
    init : function(n) {
      if(n !== 0 && (n & (n - 1)) === 0) {
        _n = n;
      } else {
        throw new Error("init: radix-2 required");
      }
    },
    // swap quadrant
    swap : function(re, im) {
      var xn, yn, i, j, k, l, tmp,
          len = _n >> 1;
      for(var y=0; y<len; y++) {
        yn = y + len;
        for(var x=0; x<len; x++) {
          xn = x + len;
          i = x + y*_n;
          j = xn + yn*_n;
          k = x + yn*_n;
          l = xn + y*_n;
          tmp = re[i];
          re[i] = re[j];
          re[j] = tmp;
          tmp = re[k];
          re[k] = re[l];
          re[l] = tmp;
          tmp = im[i];
          im[i] = im[j];
          im[j] = tmp;
          tmp = im[k];
          im[k] = im[l];
          im[l] = tmp;
        }
      }
    },
    // apply High-Pass Filter
    HPF : function(re, im, radius) {
      var i = 0,
          p = 0,
          r = 0.0,
          n2 = _n >> 1;
      for(var y=-n2; y<n2; y++) {
        i = n2 + (y + n2)*_n;
        for(var x=-n2; x<n2; x++) {
          r = Math.sqrt(x*x + y*y);
          p = x + i;
          if(r < radius) {
            re[p] = im[p] = 0;
          }
        }
      }
    },
    // apply Low-Pass Filter
    LPF : function(re, im, radius) {
      var i = 0,
          p = 0,
          r = 0.0,
          n2 = _n >> 1;
      for(var y=-n2; y<n2; y++) {
        i = n2 + (y + n2)*_n;
        for(var x=-n2; x<n2; x++) {
          r = Math.sqrt(x*x + y*y);
          p = x + i;
          if(r > radius) {
            re[p] = im[p] = 0;
          }
        }
      }
    },
    // apply Band-Pass Filter
    BPF : function(re, im, radius, bandwidth) {
      var i = 0,
          p = 0,
          r = 0.0,
          n2 = _n >> 1;
      for(var y=-n2; y<n2; y++) {
        i = n2 + (y + n2)*_n;
        for(var x=-n2; x<n2; x++) {
          r = Math.sqrt(x*x + y*y);
          p = x + i;
          if(r < radius || r > (radius + bandwidth)) {
            re[p] = im[p] = 0;
          }
        }
      }
    },
    // windowing using hamming window
    windowing : function(data, inv) {
      var len = data.length,
          pi = Math.PI;
      for(var i=0; i<len; i++) {
        if(inv === 1) {
          data[i] *= 0.54 - 0.46*Math.cos(2*pi*i/(len - 1));
        } else {
          data[i] /= 0.54 - 0.46*Math.cos(2*pi*i/(len - 1));
        }
      }
    }
  };
  // aliases (public APIs)
  var apis = ['init', 'swap', 'HPF', 'LPF', 'BPF', 'windowing'];
  for(var i=0; i<apis.length; i++) {
    FrequencyFilter[apis[i]] = core[apis[i]];
  }
}).call(this);
