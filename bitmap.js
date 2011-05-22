/**
 * Class.create(object)
 * returns a function that will fire its own initialize method.
 */
var Class = {
  create : function() {
    var properties = arguments[0];
    function self() {
      this.initialize.apply(this, arguments);
    }
    for(var i in properties) {
      self.prototype[i] = properties[i];
    }
    if(!self.prototype.initialize) {
      self.prototype.initialize = function() {};
    }
    return self;
  }
};

/*----------------------------------------*/
/**
 * Classes for Image Processing.
 */
var Bitmap = Class.create({
  initialize : function(source, context) {
    this.bitmapData = new Image();
    this.bitmapData.src = source;
    this.context = context;
    this.bitmapData.addEventListener('error',
                                     function() { alert("can't load image"); },
                                     false);
  },
  applyFilter : function(filter) {
    try {
      if(this.bitmapData.complete) {
        this.context.drawImage(this.bitmapData, 0, 0);
        var w = this.bitmapData.width, h = this.bitmapData.height;
        var src = this.context.getImageData(0, 0, w, h);
        var dst = this.context.createImageData(w, h);
        filter.apply(src, dst);
        this.context.putImageData(dst, 0, 0);
      }else {
        throw new Error("load image incomplete");
      }
    }catch(e) {
      throw e;
    }
  }
});

var ConvolutionFilter = Class.create({
  initialize : function(matrix, divisor, bias) {
    this.matrix = matrix;
    this.divisor = divisor;
    this.bias = bias;
  },
  apply : function(src, dst) {
    var w = src.width, h = src.height;
    var srcData = src.data;
    var dstData = dst.data;
    var len = dstData.length;
    var r, g, b, i, j, k, step, kStep;

    for(var y=1; y<h-1; y++) {
      step = y*w;
      for(var x=1; x<w-1; x++) {
        r = 0, g = 0, b = 0;
        i = (step + x) << 2;
        k = 0;
        for(var ky=-1; ky<=1; ky++) {
          kStep = ky*w;
          for(var kx=-1; kx<=1; kx++) {
            j = (kStep << 2) + (kx << 2);
            r += srcData[i + j]*this.matrix[k];
            g += srcData[i + j + 1]*this.matrix[k];
            b += srcData[i + j + 2]*this.matrix[k++];
          }
        }
        dstData[i] = r/this.divisor + this.bias;
        dstData[i + 1] = g/this.divisor + this.bias;
        dstData[i + 2] = b/this.divisor + this.bias;
        dstData[i + 3] = 255;
      }
    }
    for(var l=0; l<len; l++) {
      var value = dstData[l];
      dstData[l] = value<0 ? 0 : value>255 ? 255 : value; 
    }
  }
});

var SNNFilter = Class.create({
  initialize : function(radius) {
    this.radius = radius;
  },
  apply : function(src, dst) {
    var w = src.width, h = src.height;
    var srcData = src.data;
    var dstData = dst.data;
    var sumR, sumG, sumB;
    var rc, gc, bc, r1, g1, b1, r2, g2, b2;
    var cnt = 0;
    var xyStep, uvStep, xyPos, uvPos;

    for(var y=0; y<h; y++) {
      xyStep = w*y;
      for(var x=0; x<w; x++) {
        xyPos = (xyStep + x) << 2;
        sumR = 0, sumG = 0, sumB = 0;
        cnt = 0;
        rc = srcData[xyPos];
        gc = srcData[xyPos + 1];
        bc = srcData[xyPos + 2];
        for(var v=-this.radius; v<=this.radius; v++) {
          uvStep = w*v;
          for(var u=-this.radius; u<=this.radius; u++,cnt++) {
            uvPos = (uvStep + u) << 2;
            try {
              r1 = srcData[xyPos + uvPos];
              g1 = srcData[xyPos + uvPos + 1];
              b1 = srcData[xyPos + uvPos + 2];
              r2 = srcData[xyPos - uvPos];
              g2 = srcData[xyPos - uvPos + 1];
              b2 = srcData[xyPos - uvPos + 2];
            }catch(e) {
              break;
            }
            if(this.delta.apply(this, [rc, gc, bc, r1, g1, b1]) <
               this.delta.apply(this, [rc, gc, bc, r2, g2, b2])) {
              sumR += r1;
              sumG += g1;
              sumB += b2;
            }else {
              sumR += r2;
              sumG += g2;
              sumB += b2;
            }
          }
        }
        dstData[xyPos] = sumR/cnt;
        dstData[xyPos + 1] = sumG/cnt;
        dstData[xyPos + 2] = sumB/cnt;
        dstData[xyPos + 3] = 255;
      }
    }
  },
  delta : function(rc, gc, bc, r1, g1, b1) {
    return Math.sqrt((rc - r1)*(rc - r1) +
                     (gc - g1)*(gc - g1) +
                     (bc - b1)*(bc - b1));
  }
});

var ImageUtils = Class.create({
  initialize : function() {
  },
  cvtColor : function(src, dst, mode) {
    var w = src.width, h = src.height;
    var srcData = src.data;
    var dstData = dst.data;
    switch(mode) {
    case "gray":
      for(var y=0;y<h;y++) {
        var step = y*w;
        for(var x=0;x<w;x++) {
          var i = (step + x) << 2;
          dstData[i] = (77*srcData[i] +
                        150*srcData[i + 1] +
                        29*srcData[i + 2]) >> 8;
          dstData[i + 1] = dstData[i];
          dstData[i + 2] = dstData[i];
          dstData[i + 3] = 255;
        }
      }
      break;
    case "hsv":
      // TODO
      break;
    case "lab":
      // TODO
      break;
    default:
      break;
    }
  }
});