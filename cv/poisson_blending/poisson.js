/**
 * Poisson Image Editing module
 * http://rest-term.com
 */
(function() {
  var Poisson;       // top-level namaspace
  var _root = this;  // reference to 'window' or 'global'

  if(typeof exports !== 'undefined') {
    Poisson = exports;   // for CommonJS
  } else {
    Poisson = _root.Poisson = {};
  }

  // core operations
  var EPS = 1.0E-08;
  var ctx = null,
      images = [new Image(), new Image(), new Image()],
      files = [],
      data = [],
      loadedCount = 0;
  var core = {
    // loads images
    load: function(srcImgName, dstImgName, maskImgName, onComplete, onError) {
      ctx = document.createElement('canvas').getContext('2d');
      images[0].src = files[0] = srcImgName;
      images[1].src = files[1] = dstImgName;
      images[2].src = files[2] = maskImgName;
      // load complete handler
      for (var i=0; i<3; i++) {
        var image = images[i];
        image.addEventListener('load', function(e) {
          var img = e.target;
          ctx.canvas.width = img.width;
          ctx.canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          var imgData = ctx.getImageData(0, 0, img.width, img.height);
          switch(img.src) {
          case files[0]:  // cannot use a 'i' index
            data[0] = imgData;
            break;
          case files[1]:
            data[1] = imgData;
            break;
          case files[2]:
            data[2] = imgData;
            break;
          }
          loadedCount++;
          if(loadedCount === 3) {
            ctx.drawImage(images[1], 0, 0);
            data[3] = ctx.getImageData(0, 0, img.width, img.height);
            if(typeof onComplete === 'function') {
              onComplete(data);
            }
          }
        }, false);
        image.addEventListener('error', function() {
          if(typeof onError === 'function') {
            onError();
          }
        }, false);
      }
    },
    reset: function() {
      ctx.drawImage(images[1], 0, 0);
      data[3] = ctx.getImageData(0, 0, images[1].width, images[1].height);
      return data[3];
    },
    // applies poisson image editing
    blend: function(iteration, offsetX, offsetY) {
      var w = data[0].width,
          h = data[0].height,
          len = w*h*4,
          srcData = data[0].data,
          dstData = data[1].data,
          maskData = data[2].data,
          blendData = data[3].data,
          edge = false,
          error = 0.0,
          sumf = [0.0, 0.0, 0.0],
          sumfstar = [0.0, 0.0, 0.0],
          sumvq = [0.0, 0.0, 0.0],
          fp = [],
          fq =  [],
          gp = [],
          gq = [],
          subf = [],
          subg = [],
          naddr = [],
          threashold = 128,
          terminate = [],
          step, l, m;
      // validation
      if(!(parseInt(iteration) && parseInt(offsetX) && parseInt(offsetY))) {
        throw TypeError('invalid parameter type');
      }
      // core operation
      for(var i=0; i<iteration; i++) {
        terminate = [true, true, true];
        for(var y=1; y<h-1; y++) {
          step = y*w << 2;
          for(var x=1; x<w-1; x++) {
            l = step + (x << 2);
            m = offsetY*w + offsetX << 2;
            naddr = [l - (w << 2), l - 4, l + 4, l + (w << 2)];
            if(maskData[l] > threashold) { // on the mask
              sumf = [0.0, 0.0, 0.0];
              sumfstar = [0.0, 0.0, 0.0];
              sumvq = [0.0, 0.0, 0.0];
              edge = false;
              for(var n=0; n<4; n++) {
                if(maskData[naddr[n]] <= threashold) {
                  edge = true;
                  break;
                }
              }
              if(!edge) {
                if(y + offsetY >= 0 && x + offsetX >= 0 &&
                   y + offsetY < h && x + offsetX < w) {
                  for(n=0; n<4; n++) {
                    for(var c=0; c<3; c++) {
                      sumf[c] += blendData[naddr[n] + m + c];
                      sumvq[c] += srcData[l + c] - srcData[naddr[n] + c];
                    }
                  }
                }
              } else {
                if(y + offsetY >= 0 && x + offsetX >= 0 &&
                   y + offsetY < h && x + offsetX < w) {
                  fp[0] = dstData[l + m];
                  fp[1] = dstData[l + m + 1];
                  fp[2] = dstData[l + m + 2];
                  gp[0] = srcData[l];
                  gp[1] = srcData[l + 1];
                  gp[2] = srcData[l + 2];
                  for(n=0; n<4; n++) {
                    for(c=0; c<3; c++) {
                      fq[c] = dstData[naddr[n] + m + c];
                      gq[c] = srcData[naddr[n] + c];
                      sumfstar[c] += fq[c];
                      subf[c] = fp[c] - fq[c];
                      subf[c] = subf[c] > 0 ? subf[c] : -subf[c];
                      subg[c] = gp[c] - gq[c];
                      subg[c] = subg[c] > 0 ? subg[c] : -subg[c];
                      if(subf[c] > subg[c]) {
                        sumvq[c] += subf[c];
                      } else {
                        sumvq[c] += subg[c];
                      }
                    }
                  }
                }
              }
              for(c=0; c<3; c++) {
                fp[c] = (sumf[c] + sumfstar[c] + sumvq[c])*0.25; // division 4
                error = Math.floor(fp[c] - blendData[l + m + c]);
                error = error > 0 ? error : -error;
                if(terminate[c] && error > EPS*(1 + (fp[c] > 0 ? fp[c] : -fp[c]))) {
                  terminate[c] = false;
                }
                blendData[l + m + c] = fp[c];
              }
            } // end mask
          } // end x loop
        } // end y loop
        if(terminate[0] && terminate[1] && terminate[2]) break;
      } // end iteration
      return data[3];
    }
  };
  // aliases (public APIs)
  Poisson.load = core.load;
  Poisson.reset = core.reset;
  Poisson.blend = core.blend;
}).call(this);
