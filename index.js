#!/usr/bin/env node

  var ansi = require('ansi')
    , cursor = ansi(process.stdout)
    ;

  // cursor.hide();

  // Globals
  var tick = 0
    , cols = process.stdout.columns
    , rows = process.stdout.rows
    , cos = Math.cos
    , sin = Math.sin

    // The rotation origin (0=center)
    , oX=0
    , oZ=0
    , oY=0

    // The rotation amount around certain axis
    , rX=0
    , rY=0
    , rZ=0

    // The world projection coords 
    , mX=cols/2 // center
    , mY=rows/2 // center
    , mZ=20     // depth angle (changes lens-type effect)

    // Magnitude of the cube
    , mag = 8
    ;



  // Clear the console
  function clear(){
    console.log('\033[2J');
  }


  
  // Draw a point if it's on the screen
  function point(x, y){
    if(!(
        x < 1     || y < 1    ||
        x > cols  || y > rows ||
        x < 1     || y < 1    ||
        x > cols  || y > rows
    )){
        cursor.goto(parseInt(x), parseInt(y)).write('/');
    }
  }
  


  // Get in interpolation point between two points at a given magnitude
  function lerp(p1, p2, m) {
    return ((p2 - p1) * m) + p1;
  };



  // Get the distance between two points
  function dist(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
  }



  // Get all the points along a line and draw them
  function line (x1, y1, x2, y2) {
    var D = dist(x1, y1, x2, y2);

    for(var i=0; i< D; i++){
      var m = 1 / D * i;
      var x = lerp(x1, x2, m)
        , y = lerp(y1, y2, m)
        ;
      point(x, y);
    }
  }



  // Rotate by Y
  function rotY(a,b,c){return {
    x: cos(rY)   * a+0     * b+sin(rY)  *c,
    y: 0         * a+1     * b+0        *c+0,
    z: -sin(rY)  * a+0     * b+cos(rY)  *c
  }}



  // Rotate by X
  function rotX(a,b,c){return {
    x: a+1       * 0         * b+0        * c+0,
    y: 0         * a+cos(rX) * b-sin(rX)  * c,
    z: 0         * a+sin(rX) * b+cos(rX)  * c
  }}



  // Project through X & Y rotation matrices
  function project(a,b,c,d){
    d=rotY(a+oX,b+oY,c+oZ);
    d=rotX(d.x+oX,d.y+oY,d.z+oZ);
    return {
      x:mX+d.x*mZ/(d.z+mZ),
      y: (mY-d.y*mZ/(d.z+mZ)),
      z:d.z
    }
  }
    


  // Draws lines around a quad surface
  function quad(E, R, T, Y){
    line(E.x,E.y, R.x,R.y);
    line(R.x,R.y, T.x,T.y);
    line(T.x,T.y, Y.x,Y.y);
    line(Y.x,Y.y, E.x,E.y);
  }
    


  // The main animation loop
  var mainLoop = setInterval(function(){
    
    // Increment the counter
    tick++;
    rY+=.05;
    rX-=.03;

    // Change the cursor color
    var c = parseInt(64+Math.abs(Math.cos(tick/10)*64));
    cursor.rgb(0,c*2,128);

    // We will draw 2 faces (quads)
    E1=project(-mag, -mag, mag);
    R1=project( mag, -mag, mag);
    T1=project( mag,  mag, mag);
    Y1=project(-mag,  mag, mag);

    // This is another quad
    E2=project(-mag, -mag, -mag);
    R2=project( mag, -mag, -mag);
    T2=project( mag,  mag, -mag);
    Y2=project(-mag,  mag, -mag);

    // Clears the console screen
    clear();

    // Draw lines around the quad
    quad(E1,R1,T1,Y1);
    quad(E2,R2,T2,Y2);
    
    // Draw lines between the quads
    line(E1.x, E1.y, E2.x, E2.y);
    line(R1.x, R1.y, R2.x, R2.y);
    line(T1.x, T1.y, T2.x, T2.y);
    line(Y1.x, Y1.y, Y2.x, Y2.y);

  }, 20);