var fly;
var wait = 1;
var bombs = [];
var start_timestamp = null;
var prev_timestamp = null;
function start()
{

  fly = document.createElement("img");
  fly.src = "images/little-helicopter.png";
  fly.style.position = "absolute";
  var container = document.getElementsByTagName("body")[0];
  var article =   document.getElementsByTagName("body")[0];
  article.style.opacity = "0.95";

  container.style.position = "relative";
  article.style.position = "relative";

  container.appendChild(fly);
  fly.px = -100;
  fly.py = 100;
  fly.vx = 2/30;
  fly.vy = 0;
  fly.ax = 0;
  fly.ay = 0;
  fly.dx = 1;
  fly.dy = 1;
  fly.scale = 1;

  container.style.zIndex = 0;
  fly.style.zIndex = -1;
  fly.style.opacity = 0.5;
  fly.style.webkitFilter = "blur(2px)";
  fly.style.filter = "blur(2px)";
  fly.style.mozFilter = "blur(2px)";
  fly.reflect_count = 0;

  function bomb(fly)
  {
    var b  = document.createElement("img");
    b.src = "images/tomato_1f345.png";
    b.style.position = "absolute";
    container.style.position = "relative";
    article.style.position = "relative";
    container.appendChild(b);

    b.style.zIndex = fly.style.zIndex;
    if(b.style.zIndex < 0)
    {
    b.style.width = "48px";
    }else
    {
    b.style.width = "52px";
    }
    b.style.opacity = fly.style.opacity;
    b.style.webkitFilter = fly.style.webkitFilter;
    b.style.filter       = fly.style.filter;
    b.style.mozFilter    = fly.style.mozFilter;

    b.style.display = "none";
    b.px = fly.px;
    b.py = fly.py+20;
    b.vx = fly.vx*1.5;
    b.vy = -1/30;
    b.ax = 0;
    b.ay = 0.5/900;
    b.dx = 1;
    b.dy = 0.99;
    b.scale = 1;
    return b;
  }

  function reflect()
  {
    fly.reflect_count++;
    fly.vx *= -1;
    if(fly.vx>0)
    {
      fly.scale = 1;
    }else
    {
      fly.scale = -1;
    }
    fly.style.zIndex *= -1;
    fly.style.opacity = 0.75 + 0.25*fly.style.zIndex;
    var blur_str = "blur(" + (-fly.style.zIndex+1) + "px)";
    fly.style.webkitFilter = blur_str;
    fly.style.filter = blur_str;
    fly.style.mozFilter = blur_str;
  }
  function update(timestamp)
  {
    if (prev_timestamp === null)
    {
      prev_timestamp = timestamp;
      start_timestamp = timestamp;
      last_bomb_timestamp = timestamp;
    }
    var dt = timestamp - prev_timestamp;
    // Throttle the animation
    dt = Math.min(dt,100);
    prev_timestamp = timestamp;
    function step(obj,dt)
    {
      obj.style.display = "block";
      obj.style.left = "0px";
      obj.style.top = "0px";
      obj.style.webkitTransform = 
        "translate("+(obj.px)+"px,"+(obj.py)+"px) "+
        "scaleX("+obj.scale+")";
      // Verlet integration
      obj.vx = obj.dx*(obj.vx + dt*obj.ax);
      obj.vy = obj.dy*(obj.vy + dt*obj.ay);
      obj.px = obj.px + dt*obj.vx;
      obj.py = obj.py + dt*obj.vy;
    }
    function collide(a,b)
    {
      // http://stackoverflow.com/a/345863/148668
      // Check whether there actually was a collision
      if (a == b)
          return;

      var collision = [];
      collision.x = a.px-b.px;
      collision.y = a.py-b.py;
      var distance = Math.sqrt(collision.x*collision.x + collision.y*collision.y);
      if (distance == 0.0) {              // hack to avoid div by zero
          collision.x = 1;
          collision.y = 0;
          distance = 1.0;
      }
      var r = 24.0;
      if (distance > 2*r || b.style.zIndex != a.style.zIndex)
      {
        return;
      }

      // Get the components of the velocity vectors which are parallel to the collision.
      // The perpendicular component remains the same for both fish
      collision.x = collision.x / distance;
      collision.y = collision.y / distance;
      function dot(a,collision)
      {
        return a.vx*collision.x + a.vy*collision.y;
      }
      var aci = dot(a,collision);
      var bci = dot(b,collision);

      // Solve for the new velocities using the 1-dimensional elastic collision equations.
      // Turns out it's really simple when the masses are the same.
      var acf = bci;
      var bcf = aci;

      // Replace the collision velocity components with the new ones
      a.vx += (acf - aci) * collision.x;
      a.vy += (acf - aci) * collision.y;
      b.vx += (bcf - bci) * collision.x;
      b.vy += (bcf - bci) * collision.y;
      var avg = [];
      avg.x = 0.5*(a.px+b.px);
      avg.y = 0.5*(a.py+b.py);
      a.px = r*(collision.x)+avg.x;
      a.py = r*(collision.y)+avg.y;
      b.px = r*(-collision.x)+avg.x;
      b.py = r*(-collision.y)+avg.y;
    }
    fly.vy = (Math.random()*2-1)/30;
    step(fly,dt);
    fly.py = Math.min(Math.max(fly.py,0),200);
    for(var i = 0;i<bombs.length;i=i+1)
    {
      var b = bombs[i];
      step(b,dt);
      var ground = window.innerHeight + window.scrollY;
      // bounce on ground
      if(b.py+b.height>ground)
      {
        var d = Math.max((b.py+b.height)-ground,11);
        b.py = ground-b.height;
        b.vy *= -1;
        b.vx *= 0.999 + (d/4)*(0.99-0.999);
        b.vy *= 0.999 + (d/4)*(0.99-0.999);
      }
      if(b.px>window.innerWidth || b.px+b.width<0)
      {
        b.parentNode.removeChild(b);
        bombs.splice(i, 1);
      }
    }
    for(var i = 0;i<bombs.length;i=i+1)
    {
      var b = bombs[i];
      for(var j = i+1;j<bombs.length;j=j+1)
      {
        var c = bombs[j];
        collide(b,c);
      }
    }
    if(fly.vx>0)
    {
      if(fly.px > (article.offsetLeft + article.offsetWidth))
      {
        reflect();
      }
    }else
    {
      if(fly.px < (-100 + article.offsetLeft))
      {
        reflect();
      }
    }
    if(
      (timestamp - last_bomb_timestamp)>4000 && 
      // one more bomb every 1 seconds
      bombs.length < (timestamp-start_timestamp)/1000*1 &&
      fly.reflect_count >= wait*3)
    {
      bombs.push(bomb(fly));
      last_bomb_timestamp = timestamp;
    }
    requestAnimationFrame(update);
  }
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;
  requestAnimationFrame(update);
}

var queryDict = {}
location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]});
if(queryDict['wait'])
{
  wait = parseInt(queryDict['wait']);
}
window.onload = function ()
{
  // after full 0.5 minutes
  window.setTimeout(start,wait*0.5*60000);
}
