var Heart = function(canvas, n) {
  this.initialize.apply(this, arguments);
};

Heart.prototype = {
  initialize : function(canvas, n) {
    if(canvas == undefined || canvas == null) return ;
    this.context = canvas.getContext('2d');
    this.WIDTH = canvas.width;
    this.HEIGHT = canvas.height;
    this.SCALE = 25;
    this.FOV = 250;
    this.points = [];
    this.numPoints = 0;
    this.isPlay = false;
    this.setStyle(this.context.createLinearGradient(0, 0, 0, 300));
    this.setPoints(n);
  },
  setStyle : function(grad) {
    grad.addColorStop(0, 'rgb(255, 255, 255)');
    grad.addColorStop(0.7, 'rgb(196, 196, 196)');
    grad.addColorStop(0.8, 'rgb(160, 160, 160)');
    grad.addColorStop(0.9, 'rgb(128, 128, 128)');
    grad.addColorStop(1, 'rgb(96, 96, 96)');
    this.context.fillStyle = grad;
    this.context.strokeStyle = 'rgb(255, 0, 160)'; 
    this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
  },
  setPoints : function(num) {
    var r = 0.0;
    var theta = 0.0;
    var z = 0.0;
    var n = 0;
    for(i=-Math.PI*num; i<=Math.PI*num; i++) {
      for(j=-num; j<=num; j++) {
        theta = i/num;
        z = j/num;
        r = 4*Math.sqrt(1 - z*z)*Math.pow(Math.sin(Math.abs(theta)), Math.abs(theta));
        point = [(this.SCALE*r*Math.sin(theta)), (this.SCALE*r*Math.cos(theta)), (this.SCALE*z)];
        this.points.push(point);
        n++;
      }
    }
    this.numPoints = n;
  },
  play : function(t, angle) {
    var self = this;
    if(!this.isPlay) {
      this.timerID = setInterval(function(){self.render(angle);}, t);
      this.isPlay = true;
    }
  },
  stop : function() {
    if(this.isPlay) {
      clearInterval(this.timerID);
      this.isPlay = false;
    }
  },
  render : function(angle) {
    this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    for(i=0; i<this.numPoints; i++)	{
      this.rotateY(this.points[i], angle); 	
      this.draw(this.points[i]); 
    }
  },
  draw : function(point3d) {
    var scale = this.FOV/(this.FOV + point3d[2]); 
    var x = (point3d[0]*scale) + this.WIDTH/2;
    var y = (point3d[1]*scale) + this.HEIGHT/2;
    this.context.lineWidth= scale*2; 
    this.context.beginPath();
    this.context.moveTo(x, y); 
    this.context.lineTo(x + scale, y); 
    this.context.stroke(); 
  },
  rotateY : function(point3d, angle) {
    var x = point3d[0]; 
    var z = point3d[2]; 
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var tempZ = z; 
    var tempX = x; 
    x = tempX*c + tempZ*s;
    z = tempZ*c - tempX*s;
    point3d[0] = x; 
    point3d[2] = z;     
  }
}