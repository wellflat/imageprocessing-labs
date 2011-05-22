/* CV: sandbox constructor */
function CV() {
  var args = Array.prototype.slice.call(arguments),
      callback = args.pop(),
      modules = (args[0] && typeof args[0] === "string") ? args : args[0],
      i;
  if(!(this instanceof CV)) {
    return new CV(modules, callback);
  }
  if(!modules || modules[0] === "*") {
    modules = [];
    for(i in CV.modules) {
      if(CV.modules.hasOwnProperty(i)) {
        modules.push(i);
      }
    }
  }
  for(i=0; i<modules.length; i++) {
    CV.modules[modules[i]](this);
  }
  callback(this);
}
CV.modules = {}; // modules

/* core module */
CV.modules.core = function(self) {
  // load image file
  self.load = function(source, context) {
    var p = self.constructor.prototype;
    var img = new Image();
    p.ctx = context;
    img.src = source;
    img.addEventListener('load', function() {
      p.ctx.drawImage(img, 0, 0);
      p.bitmapData = p.ctx.getImageData(0, 0, img.width, img.height);
    }, false);
    img.addEventListener('error', function() {
      throw new Error('cannot load image');
    }, false);
  };
  // draw on the canvas
  self.draw = function(data, context) {
    context.putImageData(data, 0, 0);
  };
};

/* filter module */
CV.modules.filter = function(self) {
  // convolution filter
  self.convolution = function(kernel, divisor, bias) {
    var p = self.constructor.prototype,
        w = p.bitmapData.width,
        h = p.bitmapData.height,
        srcData = p.bitmapData.data,
        dstImg = p.ctx.createImageData(w, h),
        dstData = dstImg.data,
        len = dstData.length,
        r, g, b, i, j, k, step, kStep;
    for(var y=1; y<h-1; y++) {
      step = y*w;
      for(var x=1; x<w-1; x++) {
        r = 0; g = 0; b = 0;
        i = (step + x) << 2;
        k = 0;
        for(var ky=-1; ky<=1; ky++) {
          kStep = ky*w;
          for(var kx=-1; kx<=1; kx++) {
            j = (kStep << 2) + (kx << 2);
            r += srcData[i + j]*kernel[k];
            g += srcData[i + j + 1]*kernel[k];
            b += srcData[i + j + 2]*kernel[k];
            k++;
          }
        }
        dstData[i] = r/divisor + bias;
        dstData[i + 1] = g/divisor + bias;
        dstData[i + 2] = b/divisor + bias;
        dstData[i + 3] = 255;
      }
    }
    for(var l=0; l<len; l++) {
      var value = dstData[l];
      dstData[l] = value<0 ? 0 : value>255 ? 255 : value; 
    }
    return dstImg;
  };
};

/* features2d module */
CV.modules.features2d = function(self) {
  // HLAC
  self.hlac = function() {
    var p = self.constructor.prototype,
        w = p.bitmapData.width,  // bitmapData: ImageData
        h = p.bitmapData.height,
        src = p.bitmapData.data, // CanvasPixelArray
        // mask patterns for HLAC (N:2, 3*3)
        mask = ['000010000','000011000','001010000','010010000','100010000',
                '000111000','001010100','010010010','100010001','001110000',
                '010010100','100010010','000110001','000011100','001010010',
                '010010001','100011000','010110000','100010100','000110010',
                '000010101','000011010','001010001','010011000','101010000'],
        len = mask.length,
        features = [],
        c, i, j, l, step, kstep,
        cmp = 0;
    
    // mask pattern, feature vector intialize
    for(var k=0; k<len; k++) {
      mask[k] = parseInt(mask[k], 2);
      features[k] = 0;
    }
    // product-sum operation for each mask pattern
    // CanvasPixelArray: [R0,G0,B0,A0,R1,G1,B1,A1, ...]
    for(k=0; k<len; k++) {
      for(var y=1; y<h-1; y++) {
        step = y*w;
        for(var x=1; x<w-1; x++) {
          i = (step + x) << 2;
          if(src[i] === cmp) continue;
          for(var ky=-1, l=8, c=1; ky<=1; ky++) {
            if(c === 0) break;
            kstep = ky*w;
            for(var kx=-1; kx<=1; kx++, l--) {
              j = (kstep + kx) << 2;
              if((mask[k] >> l & 1) && (src[i + j] === cmp)) {
                c = 0;
                break;
              }
            }
          }
          features[k] += c;
        }
      }
    }
    return features;
  };
  self.stardetect = function(param) {
    // TODO
  };
};

/* utilities module */
/* image histogram */
CV.modules.histogram = function(self) {
  // draw histogram on the canvas
  self.drawHistogram = function(bins, context, style) {
    var h = context.canvas.height,
        max = self.getMax(bins),
        len = bins.length,
        step = context.canvas.width/len,
        k = 2;
    style = style || {};
    context.globalAlpha = style['globalAlpha'] || 0.8;
    context.strokeStyle = style['strokeStyle'] || '#00cc66';
    context.lineWidth = style['lineWidth'] || 4;
    for(var i=0; i<len; i++, k+=step) {
      context.beginPath();
      context.moveTo(k, h);
      context.lineTo(k, Math.max(0.0, h - bins[i]*h/max));
      context.stroke();
      context.closePath();
    }
  };
  // calculate histogram intersection
  self.intersection = function(hist1, hist2) {
    if(hist1.length != hist2.length) {
      throw new Error('invalid histogram pair');
    }
    var minsum = 0.0,
        len = hist1.length,
        min = 0, sum1 = 0, sum2 = 0;
    for(var i=0; i<len; i++) {
      min = (hist1[i] < hist2[i]) ? hist1[i] : hist2[i];
      minsum += min;
      sum1 += hist1[i];
      sum2 += hist2[i];
    }
    return (sum1 > sum2) ? minsum/sum1 : minsum/sum2;
  };
  self.addHistogram = function(hist1, hist2) {
    if(hist1.length != hist2.length) {
      throw new Error('invalid histogram pair');
    }
    var newhist = [],
        len = hist1.length;
    for(var i=0; i<len; i++) {
      newhist[i] = hist1[i] + hist2[i];
    }
    return newhist;
  };
  self.getMax = function(bins) {
    var max = 0,
        len = bins.length;
    for(var i=0; i<len; i++) {
      if(bins[i] > max) max = bins[i];
    }
    return max;
  };
};

/* web storage */
CV.modules.storage = function(self) {
  // thin wrapper
  self.getData = function(key) {
    return JSON.parse(window.localStorage[key]);
  };
  self.setData = function(key, value) {
    window.localStorage[key] = JSON.stringify(value);
  };
};