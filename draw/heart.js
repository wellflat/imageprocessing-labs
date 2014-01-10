/**
 * Heart Surface Maker
 */
var Heart = (function() {
  var _context = null,
      _width = null,
      _height = null,
      _scale = 25,
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
        _setStyle(_context.createLinearGradient(0, 0, 0, 300));
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
        grad.addColorStop(0, 'rgb(255, 255, 255)');
        grad.addColorStop(0.7, 'rgb(196, 196, 196)');
        grad.addColorStop(0.8, 'rgb(160, 160, 160)');
        grad.addColorStop(0.9, 'rgb(128, 128, 128)');
        grad.addColorStop(1, 'rgb(96, 96, 96)');
        _context.fillStyle = grad;
        _context.strokeStyle = 'rgb(255, 0, 160)';
        _context.fillRect(0, 0, _width, _height);
      },
      _setPoints = function(num) {
        var r, theta, z, n = 0, point;
        for(var i=-Math.PI*num; i<=Math.PI*num; i++) {
          for(var j=-num; j<=num; j++) {
            theta = i/num; z = j/num;
            r = 4*Math.sqrt(1 - z*z)*Math.pow(Math.sin(Math.abs(theta)), Math.abs(theta));
            point = [_scale*r*Math.sin(theta),
                     _scale*r*Math.cos(theta),
                     _scale*z];
            _points.push(point);
            n++;
          }
        }
        _numPoints = n;
      },
      _render = function(angle) {
        _context.fillRect(0, 0, _width, _height);
        for(var i=0; i<_numPoints; i++)	{
          _rotateY(_points[i], angle);
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
      };
  // public APIs
  return {
    init: _init,
    play: _play,
    stop: _stop,
  };
})();