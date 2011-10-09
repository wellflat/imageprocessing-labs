/**
 *  computes the disparity for the rectified stereo pair,
 *  naive implementation without using dynamic programming.
 */
function findStereoCorrespondence(pair, state) {
  var w = pair[0].width,
      h = pair[0].height,
      data = [pair[0].data, pair[1].data],
      disparity = [],
      step = w << 2,
      winSize = state.SADWindowSize,
      threshold = state.textureThreshold,
      minDisparity = state.minDisparity,
      maxDisparity = state.numberOfDisparities - minDisparity,
      maxDiff = 255 * winSize * winSize,
      localMin = maxDiff,
      sad = 0,
      diff, cur, ptr;
  for(var y=0, cur=step; y<h-1; y++, cur+=step) {
    for(var x=0, i=cur; x<w; x++, i+=4) {
      for(var d=minDisparity, ptr=i; d<maxDisparity; d++, ptr-=4) {
        if(ptr < cur) continue;
        for(var ly=0; ly<winSize; ly++) {
          if(sad > threshold || y + ly > h) break;
          for(var lx=0, j=ly*step; lx<winSize; lx++, j+=4) {
            if(x + lx > w) break;
            diff = data[0][i + j] - data[1][ptr + j];
            if(isNaN(diff)) diff = 0;
            sad += (diff < 0 ? -diff : diff);
          }
        }
        if(localMin > sad) {
          localMin = sad;
          disparity[i] = disparity[i + 1] = disparity[i + 2] = d << 4;
          disparity[i + 3] = 255;
        }
        sad = 0;
      }
      localMin = maxDiff;
    }
  }
  return {'width':w, 'height':h, 'disparity':disparity};
}

/* message handler */
self.addEventListener('message', function(e) {
  var message = e.data,
      data = message.pair,  // CanvasPixelArray pair
      state = message.state;
  postMessage(findStereoCorrespondence(data, state));
}, false);
self.addEventListener('error', function(e) {
  postMessage(e);
}, false);
