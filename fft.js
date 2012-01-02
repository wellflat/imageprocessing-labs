/**
 * Fast Fourier Transform
 * 1D-FFT/IFFT, 2D-FFT/IFFT (radix-2)
 */
var FFT = (function() {
  var _n = 0,
      _bitrev =  [],
      _cstb = [],
      // public methods
      _init = function(n) {
        if(n != 0 && (n & (n - 1)) == 0) {
          _n = n;
          _makeBitReversal();
          _makeCosSinTable();
        } else {
          throw new Error("init: radix-2 required");
        }
      },
      // 1D-FFT
      _fft1d = function(re, im) {
        _fft(re, im, 1);
      },
      // 1D-IFFT
      _ifft1d = function(re, im) {
        var n = 1/_n;
        _fft(re, im, -1);
        for(var i=0; i<_n; i++) {
          re[i] *= n;
          im[i] *= n;
        }
      },
      // 2D-FFT
      _fft2d = function(re, im) {
        var tre = [],
            tim = [],
            i = 0;
        // x-axis
        for(var y=0; y<_n; y++) {
          i = y*_n;
          for(var x1=0; x1<_n; x1++) {
            tre[x1] = re[x1 + i];
            tim[x1] = im[x1 + i];
          }
          _fft1d(tre, tim);
          for(var x2=0; x2<_n; x2++) {
            re[x2 + i] = tre[x2];
            im[x2 + i] = tim[x2];
          }
        }
        // y-axis
        for(var x=0; x<_n; x++) {
          for(var y1=0; y1<_n; y1++) {
            i = x + y1*_n;
            tre[y1] = re[i];
            tim[y1] = im[i];
          }
          _fft1d(tre, tim);
          for(var y2=0; y2<_n; y2++) {
            i = x + y2*_n;
            re[i] = tre[y2];
            im[i] = tim[y2];
          }
        }
      },
      // 2D-IFFT
      _ifft2d = function(re, im) {
        var tre = [],
            tim = [],
            i = 0;
        // x-axis
        for(var y=0; y<_n; y++) {
          i = y*_n;
          for(var x1=0; x1<_n; x1++) {
            tre[x1] = re[x1 + i];
            tim[x1] = im[x1 + i];
          }
          _ifft1d(tre, tim);
          for(var x2=0; x2<_n; x2++) {
            re[x2 + i] = tre[x2];
            im[x2 + i] = tim[x2];
          }
        }
        // y-axis
        for(var x=0; x<_n; x++) {
          for(var y1=0; y1<_n; y1++) {
            i = x + y1*_n;
            tre[y1] = re[i];
            tim[y1] = im[i];
          }
          _ifft1d(tre, tim);
          for(var y2=0; y2<_n; y2++) {
            i = x + y2*_n;
            re[i] = tre[y2];
            im[i] = tim[y2];
          }
        }
      },
      // private methods
      // core operation of FFT
      _fft = function(re, im, inv) {
        var d, h, ik, m, tmp, wr, wi, xr, xi,
            n4 = _n >> 2;
        // bit reversal
        for(var l=0; l<_n; l++) {
          m = _bitrev[l];
          if(l < m) {
            tmp = re[l];
            re[l] = re[m];
            re[m] = tmp;
            tmp = im[l];
            im[l] = im[m];
            im[m] = tmp;
          }
        }
        // butterfly operation
        for(var k=1; k<_n; k<<=1) {
          h = 0;
          d = _n/(k << 1);
          for(var j=0; j<k; j++) {
            wr = _cstb[h + n4];
            wi = inv*_cstb[h];
            for(var i=j; i<_n; i+=(k<<1)) {
              ik = i + k;
              xr = wr*re[ik] + wi*im[ik];
              xi = wr*im[ik] - wi*re[ik];
              re[ik] = re[i] - xr;
              re[i] += xr;
              im[ik] = im[i] - xi;
              im[i] += xi;
            }
            h += d;
          }
        }
      },
      // make bit reversal table
      _makeBitReversal = function() {
        var i = 0,
            j = 0,
            k = 0;
        _bitrev[0] = 0;
        while(++i < _n) {
          k = _n >> 1;
          while(k <= j) {
            j -= k;
            k >>= 1;
          }
          j += k;
          _bitrev[i] = j;
        }
      },
      // make trigonometiric function table
      _makeCosSinTable = function() {
        var n2 = _n >> 1,
            n4 = _n >> 2,
            n8 = _n >> 3,
            n2p4 = n2 + n4,
            t = Math.sin(Math.PI/_n),
            dc = 2*t*t,
            ds = Math.sqrt(dc*(2 - dc)),
            c = _cstb[n4] = 1,
            s = _cstb[0] = 0;
        t = 2*dc;
        for(var i=1; i<n8; i++) {
          c -= dc;
          dc += t*c;
          s += ds;
          ds -= t*s;
          _cstb[i] = s;
          _cstb[n4 - i] = c;
        }
        if(n8 != 0) {
          _cstb[n8] = Math.sqrt(0.5);
        }
        for(var j=0; j<n4; j++) {
          _cstb[n2 - j]  = _cstb[j];
        }
        for(var k=0; k<n2p4; k++) {
          _cstb[k + n2] = -_cstb[k];
        }
      };
  // public APIs
  return {
    init: _init,
    fft1d: _fft1d,
    ifft1d: _ifft1d,
    fft2d: _fft2d,
    ifft2d: _ifft2d
  };
})();

/**
 * Spatial Frequency Filtering
 * High-pass/Low-pass/Band-pass Filter
 * Windowing using hamming window
 */
var FrequencyFilter = (function() {
  var _n = 0,
      _init = function(n) {
        if(n != 0 && (n & (n - 1)) == 0) {
          _n = n;
        } else {
          throw new Error("init: radix-2 required");
        }
      },
      // swap quadrant
      _swap = function(re, im) {
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
      _HPF = function(re, im, radius) {
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
      _LPF = function(re, im, radius) {
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
      _BPF = function(re, im, radius, bandwidth) {
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
      _windowing = function(data, inv) {
        var len = data.length,
            pi = Math.PI;
        for(var i=0; i<len; i++) {
          if(inv == 1) {
            data[i] *= 0.54 - 0.46*Math.cos(2*pi*i/(len - 1));
          } else {
            data[i] /= 0.54 - 0.46*Math.cos(2*pi*i/(len - 1));
          }
        }
      };
  // public APIs
  return {
    init: _init,
    swap: _swap,
    windowing: _windowing,
    HPF: _HPF,
    LPF: _LPF,
    BPF: _BPF
  };
})();

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