/**
 * Corner Detector module
 */
(function() {
  var CornerDetector;  // top-level namespace
  var _root = this;    // reference to 'window' or 'global'

  if(typeof exports !== 'undefined') {
    CornerDetector = exports;   // for CommonJS
  } else {
    CornerDetector = _root.CornerDetector = {};
  }

  var version = {
    release: '0.1.0',
    date: '2012-09'
  };
  CornerDetector.toString = function() {
    return "version " + version.release + ", released " + version.date;
  };

  // core operations
  var core = {
    detect : function(img, type, params) {
      core._validateParams(params);
      switch(type) {
      case 'eigen':
        // implement ?
        throw new Error('not implementation error');
        break;
      case 'harris':
        return core._detectHarris(img, params);
        break;
      case 'fast':
        // implement ?
        throw new Error('not implementation error');
        break;
      default:
        return core._detectHarris(img, params);
        break;
      }
    },
    _validateParams : function(params) {
      var _params = ['qualityLevel', 'blockSize', 'k'], msg = '';
      for(var i=0; i<_params.length; i++) {
        if(!params.hasOwnProperty(_params[i])) {
          msg = 'invalid parameters, required \'' + _params[i] + '\'';
          throw new Error(msg);
        }
        if(!parseFloat(params[_params[i]])) {
          msg = 'invalid parameters, required number \'' + _params[i] + '\'';
          throw new TypeError(msg);
        }
      }
      if(params.blockSize%2 !== 1) {
        throw new Error('odd number required \'blockSize\'');
      }
      if(params.blockSize > 5) {
        throw new Error('unsupported \'blockSize\' ' + params.blockSize);
      }
    },
    /* Harris Operator */
    _detectHarris : function(img, params) {
      var w = img.width,
          h = img.height,
          imgdata = img.data,
          len = w*h << 2,
          src, cov, eig, corners,
          r = (params.blockSize - 1)/2,
          dx, dy, dxdata, dydata, kernelx, kernely, maxval, quality,
          x, y, kx, ky, i, j, step, tmp;

      if(typeof Float32Array === 'function') {
        src = cov = new Float32Array(w*h*3);
        corners = new Float32Array(w*h);
      } else {
        src = cov = corners = [];
      }
      // change container, uint8 to float32
      for(i=0,j=0; i<len; i+=3,j+=4) {
        src[i] = imgdata[j];
        src[i + 1] = imgdata[j + 1];
        src[i + 2] = imgdata[j + 2];
      }
      // apply sobel filter
      switch(params.blockSize) {
      case 3:
        kernelx = [-1, 0, 1, -2, 0, 2, -1, 0, 1]; // 3*3 kernel
        kernely = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        break;
      case 5:
        kernelx = [1,  2, 0,  -2,  -1,  // 5*5 kernel
                   4,  8, 0,  -8,  -4,
                   6, 12, 0, -12,  -6,
                   4,  8, 0,  -8,  -4,
                   1,  2, 0,  -2,  -1];
        kernely = [-1, -4,  -6, -4, -1,
                   -2, -8, -12, -8, -2,
                    0,  0,   0,  0,  0,
                    2,  8,  12,  8,  2,
                    1,  4,   6,  4,  1];
        break;
      }
      dx = core._convolution(src, w, h, kernelx, 1);
      dy = core._convolution(src, w, h, kernely, 1);
      // store squared differences directly
      for(y=0; y<h; y++) {
        step = y*w;
        for(x=0; x<w; x++) {
          i = (step + x)*3;
          dxdata = dx[i];
          dydata = dy[i];
          cov[i] = dxdata*dxdata;      // dxx
          cov[i + 1] = dxdata*dydata;  // dxy
          cov[i + 2] = dydata*dydata;  // dyy
        }
      }
      // apply box blur filter
      cov = core._blur(cov, w, h, (params.blockSize - 1)/2);
      // compute Harris operator
      eig = core._calcHarris(cov, w, h, params.k);
      // suppress non-maxima values
      for(y=r; y<h-r; y++) {
        step = y*w;
        for(x=r; x<w-r; x++) {
          i = step + x;
          tmp = eig[i];
          for(ky=-r; (tmp!==0) && (ky<=r); ky++) {
            for(kx=-r; kx<=r; kx++) {
              if(eig[i + ky*w + kx] > tmp) {
                tmp = 0;
                break;
              }
            }
          }
          if(tmp !== 0) {
            corners[i] = eig[i];
          }
        }
      }
      // threshold
      maxval = 0;
      len = eig.length;
      for(i=0; i<len; i++) {
        if(corners[i] > maxval) maxval = corners[i];
      }
      quality = maxval*params.qualityLevel;
      for(j=0; j<len; j++) {
        if(corners[j] <= quality) {
          corners[j] = 0;
        }
      }
      return corners;
    },
    _calcHarris : function(data, width, height, k) {
      var w = width,
          h = height,
          cov = data,
          M, A, B, C, step, i;

      if(typeof Float32Array === 'function') {
        M = new Float32Array(w*h*3);
      } else {
        M = [];
      }
      for(var y=0; y<h; y++) {
        step = y*w;
        for(var x=0; x<w; x++) {
          i = (step + x)*3;
          A = cov[i];
          B = cov[i + 1];
          C = cov[i + 2];
          M[step + x] = (A*C - B*B - k*(A + C)*(A + C));
        }
      }
      return M;
    },
    /* convolution filter (as sobel/box filter, sigle channel) */
    _convolution : function(data, width, height, kernel, divisor) {
      var w = width,
          h = height,
          src = data,
          dst,
          div = 1/divisor,
          r = Math.sqrt(kernel.length),
          buff = [],
          i, j, k, v, px, py, step, kstep;

      if(divisor === 0) {
        throw new Error('division zero');
      }
      if(r%2 !== 1) {
        throw new Error('square kernel required');
      }
      if(typeof Float32Array === 'function') {
        dst = new Float32Array(w*h*3);
      } else {
        dst = [];
      }
      r = (r - 1)/2;
      for(var y=0; y<h; y++) {
        step = y*w;
        for(var x=0; x<w; x++) {
          buff[0] = buff[1] = buff[2] = 0;
          i = (step + x)*3;
          k = 0;
          // convolution
          for(var ky=-r; ky<=r; ky++) {
            py = y + ky;
            if(py <= 0 || h <= py) py = y;
            kstep = py*w;
            for(var kx=-r; kx<=r; kx++) {
              px = x + kx;
              if(px <= 0 || w <= px) px = x;
              j = (kstep + px)*3;
              buff[0] += src[j]*kernel[k];
              buff[1] += src[j + 1]*kernel[k];
              buff[2] += src[j + 2]*kernel[k];
              k++;
            }
          }
          dst[i] = buff[0]*div;
          dst[i + 1] = buff[1]*div;
          dst[i + 2] = buff[2]*div;
        }
      }
      return dst;
    },
    /* box blur filter */
    _blur : function(data, width, height, radius) {
      var kernel = [],
          size = (2*radius + 1)*(2*radius + 1);
      for(var i=0; i<size; i++) {
        kernel[i] = 1.0;
      }
      return core._convolution(data, width, height, kernel, 1);
    }
  };
  // aliases (public APIs and constants)
  CornerDetector.EIGEN = 'eigen';
  CornerDetector.HARRIS = 'harris';
  CornerDetector.FAST = 'fast';
  CornerDetector.detect = core.detect;
}).call(this);
