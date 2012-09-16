/**
 * Fish-Eye Transform module
 */
(function() {
  var Fisheye;        // top-level namespace
  var _root = this;   // reference to 'window' or 'global'

  if(typeof exports !== 'undefined') {
    Fisheye = exports;   // for CommonJS
  } else {
    Fisheye = _root.Fisheye = {};
  }

  var version = {
    release: '0.1.0',
    date: '2012-09'
  };
  Fisheye.toString = function() {
    return "version " + version.release + ", released " + version.date;
  };

  // core operations
  var _ctx = document.createElement('canvas').getContext('2d');
  var core = {
    transform : function(img, focalLength, radius) {
      var w = img.width,
          h = img.height,
          src = img.data,
          f = focalLength,
          r = radius,
          buff = [0, 0, 0],
          dstimg, dst,
          sqrt = Math.sqrt,
          round = Math.round,
          cx, cy, dx, dy, nx, ny, d, fd, i, j, step;

      _ctx.canvas.width = w;
      _ctx.canvas.height = h;
      _ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      _ctx.fillRect(0, 0, w, h);
      dstimg = _ctx.getImageData(0, 0, w, h);
      dst = dstimg.data;
      cx = w/2;
      cy = h/2;
      for(var y=0; y<h; y++) {
        step = y*w;
        for(var x=0; x<w; x++) {
          dx = x - cx;
          dy = y - cy;
          d = sqrt(dx*dx + dy*dy);
          fd = f*f + d*d;
          nx = round((r*dx/sqrt(fd) + cx));
          ny = round((r*dy/sqrt(fd) + cy));
          if(0<=nx && nx<w && 0<=ny && ny<h) {
            i = (step + x) << 2;
            j = (ny*w + nx) << 2;
            dst[j] = src[i];
            dst[j + 1] = src[i + 1];
            dst[j + 2] = src[i + 2];
            dst[j + 3] = 1; // alpha channel, as flag
          }
        }
      }
      core.interpolation(dstimg, 1);
      return dstimg;
    },
    /* interpolation (destructive!) */
    interpolation : function(img, radius) {
      var w = img.width,
          h = img.height,
          data = img.data,
          r = radius,
          kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1], // 3*3
          threshold = (2*r + 1)*(2*r + 1)/2,
          buff = [0, 0, 0],
          i, j, k, acc, step, kstep, px, py, div;

      for(var y=0; y<h; y++) {
        step = y*w;
        for(var x=0; x<w; x++) {
          i = (step + x) << 2;
          if(data[i + 3] !== 1) {
            buff[0] = buff[1] = buff[2] = 0;
            k = 0;
            acc = 0;
            for(var ky=-r; ky<=r; ky++) {
              py = y + ky;
              if(py <= 0 || h <= py) py = y;
              kstep = py*w;
              for(var kx=-r; kx<=r; kx++) {
                px = x + kx;
                if(px <= 0 || w <= px) px = x;
                j = (kstep + px) << 2;
                if(data[j + 3] === 1) {
                  buff[0] += data[j]*kernel[k];
                  buff[1] += data[j + 1]*kernel[k];
                  buff[2] += data[j + 2]*kernel[k];
                  acc += kernel[k];
                  k++;
                }
              }
            }
            if(k > threshold) {
              div = 1/acc;
              data[i] = buff[0]*div;
              data[i + 1] = buff[1]*div;
              data[i + 2] = buff[2]*div;
              data[i + 3] = 1; // as flag
            }
          }
          //data[i + 3] = 255;
        }
      }
    }
  };
  // public API
  Fisheye.transform = core.transform;
}).call(this);