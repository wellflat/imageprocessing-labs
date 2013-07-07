/**
 * Mobius Strip Maker
 */
var MobiusStrip = (function() {
  var _context = null,
      _width = null,
      _height = null,
      _scale = 60,
      _fov = 250,
      _points = [],
      _numPoints = 0,
      _isPlay = false,
      _timerID = null,
      // public methods
      _init = function(context, n) {
        _context = context;
        _width = context.canvas.width;
        _height = context.canvas.height;
        _points = [];
        _setStyle(context.createLinearGradient(0, 0, 0, 300));
        _setPoints(n);
      },
      _play = function(t, angle) {
        if(!_isPlay) {
          _timerID = setInterval(function() {
            _render(angle)
          }, t);
          _isPlay = true;
        }
      },
      _stop = function() {
        if(_isPlay) {
          clearInterval(_timerID);
          _isPlay = false;
        }
      },
      // private methods
      _setStyle = function(grad) {
        grad.addColorStop(0, 'rgb(0, 0, 0)');
        grad.addColorStop(0.7, 'rgb(16, 16, 16)');
        grad.addColorStop(0.8, 'rgb(32, 32, 32)');
        grad.addColorStop(0.9, 'rgb(48, 48, 48)');
        grad.addColorStop(1, 'rgb(64, 64, 64)');
        _context.fillStyle = grad;
        _context.strokeStyle = 'rgb(0, 255, 160)';
        _context.fillRect(0, 0, _width, _height);
      },
      _setPoints = function(num) {
        var s, t, k, n = 0, point;
        for(var i=0; i<=2*Math.PI*num; i++) {
          for(var j=-num/8; j<=num/8; j++) {
            s = i/num; t = j/10;
            k = 1 + t*Math.cos(s/2);
            point = [_scale*k*Math.cos(s),
                     _scale*k*Math.sin(s),
                     _scale*t*Math.sin(s/2)];
            _points.push(point);
            n++;
          }
        }
        _numPoints = n;
      },
      _render = function(angle) {
        _context.fillRect(0, 0, _width, _height);
        for(var i=0; i<_numPoints; i++)	{
          _rotateX(_points[i], angle);
          _rotateY(_points[i], angle);
          _rotateZ(_points[i], angle);
          _draw(_points[i]);
        }
      },
      _draw = function(point3d) {
        var scale = _fov/(_fov + point3d[2]),
            x = (point3d[0]*scale) + (_width >> 1),
            y = (point3d[1]*scale) + (_height >> 1);
        _context.lineWidth= scale << 1;
        _context.beginPath();
        _context.moveTo(x, y);
        _context.lineTo(x + scale, y);
        _context.stroke();
      },
      _rotateX = function(point3d, angle) {
        var y = point3d[1],
            z = point3d[2],
            c = Math.cos(angle),
            s = Math.sin(angle),
            ty = y,
            tz = z;
        y = ty*c - tz*s;
        z = ty*s + tz*c;
        point3d[1] = y;
        point3d[2] = z;
      },
      _rotateY = function(point3d, angle) {
        var x = point3d[0],
            z = point3d[2],
            c = Math.cos(angle),
            s = Math.sin(angle),
            tz = z,
            tx = x;
        x = tx*c + tz*s;
        z = tz*c - tx*s;
        point3d[0] = x;
        point3d[2] = z;
      },
      _rotateZ = function(point3d, angle) {
        var x = point3d[0],
            y = point3d[1],
            c = Math.cos(angle),
            s = Math.sin(angle),
            tx = x,
            ty = y;
        x = tx*c - ty*s;
        y = tx*s + ty*c;
        point3d[0] = x;
        point3d[1] = y;
      };

  // public APIs
  return {
    init: _init,
    play: _play,
    stop: _stop,
  };
})();