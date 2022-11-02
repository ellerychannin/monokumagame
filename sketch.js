let wingif;
let losegif;
let walkingbear;
let walkingplayer;
let progressbear;
let handsfree;
let eyeBlinkHistory = [];
const historyLen = 320;
let runningAvg = 0; 
var blinkActivation = 0; 
const bearW = 5;
const bearH = 6;
let speed = 0.5;
let progress = 0;
const maxProgress = 5;
let lost = false;
let win = false;
let monokumas = [];
let nextbear;
let counter = 0;
const playerW = 6;
const playerH = 6;
const playerStartVY = 1.4;
let player;
let prevClose = false;
let losesoundplaying = false;
let winsoundplaying = false;
function preload() {
  walkingbear = loadImage('assets/walkingbear.gif');
  walkingplayer = loadImage('assets/playerwalk.gif');
  progressbear = loadImage('assets/progressbar.png');
  losegif = loadImage('assets/upupup-evil.gif');
  wingif = loadImage('assets/monokuma_win.gif');
  jumpsound = loadSound('assets/jump.mp3');
  upupupusound = loadSound('assets/upupupu.mp3');
  dadasound = loadSound('assets/dada.mp3');
  startsound = loadSound('assets/start.mp3');
}


//https://editor.p5js.org/golan/sketches/d-JfFcGws

class Monokuma {

  constructor() {
    this.w = bearW;
    this.h = bearH;
    this.x = -bearH;
    this.y = height - this.h;
    this.passed = false;
  }

  move() {
    this.x += speed;
  }

  show() {
    image(walkingbear, this.x, this.y, this.w, this.h);
  }
}

class Player {
  
  constructor() {
    this.w = playerW;
    this.h = playerH;
    this.x = width - this.w - 2*this.w;
    this.y = height - this.h;
    this.vy = 0;
    this.gravity = 0.055;
  }

  jump() {
    this.elev = height - this.h - this.y;
    if (this.elev == 0) {
      this.vy = -playerStartVY;
    }
  }

  hits(kuma) {
    // kuma top right cornor
    if ((this.x < kuma.x + kuma.w) && (this.x + this.w > kuma.x) && (this.y < kuma.y + kuma.h) && (this.y + this.h > kuma.y)) {
      return true;
    } else {
      return false;
    }
  }

  passes(kuma) {
    if ((this.x + this.w) < (kuma.x)) {
      kuma.passed = true;
      return true;
    } else {
      return false;
    }
  }

  move() {
    this.y += this.vy;
    this.vy += this.gravity;
    this.y = constrain(this.y, 0, height - this.h);
  }

  show() {
    image(walkingplayer, this.x, this.y, this.w, this.h);
  }
}

function setup() {
  createCanvas(150, 50);
  // Configure handsfree.js to track hands, body, and/or face.
  handsfree = new Handsfree({
    showDebug: false,  /* shows or hides the camera */
    hands: false,      /* acquire hand data? */
    pose: false,       /* acquire body data? */
    facemesh: true     /* acquire face data? */
  });
  handsfree.start();
  startsound.play();
  startGame();
}

function startGame() {
  score = 0;
  win = false;
  lost = false;
  monokumas = [];
  player = new Player();
  counter = 0;
  progress = 0;
  speed = 0.5;
  losesoundplaying = false;
  winsoundplaying = false;
  if ((random(0, 1) > 0.9) && (!prevClose)) {
    nextbear = int(random(10, 15));
    prevClose = true;
  } else {
    nextbear = int(random(50, 100));
    prevClose = false;
  }
  
  loop();
}

function virtualKeyPress() {
  // if (keyCode == ENTER) {
      jumpsound.play();
      player.jump();
      if  (lost || win) {
        startsound.play();
        startGame();
      }
  // }
}


//------------------------------------------
function detectBlink(){
  
  if (handsfree.data.facemesh) {
    if (handsfree.data.facemesh.multiFaceLandmarks) {
      var faceLandmarks = handsfree.data.facemesh.multiFaceLandmarks;   
      var nFaces = faceLandmarks.length;
      if (nFaces > 0){
        var whichFace = 0;
        
        //----------------------
        // Vertices for the eyes
        var eyes = [[33,161,160,159,158,157,173,  133,155,154,153,145,144,163,7],
                    [362,384,385,386,387,388,466,263,  249,390,373,374,380,381,382]];

        //----------------------
        // Compute the centroid of the eye vertices.
        // This is purely for display purposes.
        var eyeAvgX = 0; 
        var eyeAvgY = 0;
        var count = 0; 
        for (var e=0; e<2; e++){
          for (var j=0; j<(eyes[e].length); j++){
            var px = faceLandmarks[whichFace][eyes[e][j]].x;
            var py = faceLandmarks[whichFace][eyes[e][j]].y;
            eyeAvgX += map(px, 0, 1, width, 0);
            eyeAvgY += map(py, 0, 1, 0, height);
            count++;
          }
        }
        eyeAvgX /= count;
        eyeAvgY /= count;
        
        //----------------------
        // Measure the openness of the eyes. Your mileage may vary. 
        var eyeBlinkMeasurementPairs = [[159,154],[158,145],[385,374],[386,373]];
        var measurement = 0; 
        for (var i=0; i<eyeBlinkMeasurementPairs.length; i++){
          var pa = faceLandmarks[whichFace][eyeBlinkMeasurementPairs[i][0]];
          var pb = faceLandmarks[whichFace][eyeBlinkMeasurementPairs[i][1]];
          measurement += dist(pa.x, pa.y, pb.x, pb.y); 
        }
        // Add the data to the history; 
        for (var i=0; i<(historyLen-1); i++){
          eyeBlinkHistory[i] = eyeBlinkHistory[i+1];
        }
        eyeBlinkHistory[historyLen-1] = measurement;
        
        
        //----------------------
        // Compute stats and Detect a blink!
        runningAvg = 0.95*runningAvg + 0.05*measurement;
        var stdv = 0; 
        for (var i=0; i<historyLen; i++){
          stdv += sq(eyeBlinkHistory[i] - runningAvg);
        }
        stdv = sqrt(stdv/historyLen);
    
        // var blink = false;
        blinkActivation = 0.9*blinkActivation; // reduce activation
        var threshStdv = 1.0; // how many stdv's to detect a blink
        var threshVal = runningAvg-stdv*threshStdv;
        if ((eyeBlinkHistory[historyLen-1] < threshVal) && 
            (eyeBlinkHistory[historyLen-2] >= threshVal)){
          // blink = true;
          blinkActivation = 1.0;
          return true;
        }

        return false;  
      }
    }
  }
}

function draw() {

  if (detectBlink()) {
    console.log("blinked");
    virtualKeyPress();

  }

  if (!win && !lost) {
    background(0);
    counter += 1;
    push();
    noStroke();
    fill(255);
    rect(120, 3, 20, 0.5);
    pop();
  
    if (counter == nextbear) {
      monokumas.push(new Monokuma());
      counter = 0;
      if ((random(0, 1) > 0.9) && (!prevClose)) {
        nextbear = int(random(10, 20));
        prevClose = true;
      } else {
        nextbear = int(random(55, 100));
        prevClose = false;
      }
      // kumaappearsound.play();
    }
  
    for (let kuma of monokumas) {
      if (kuma.x > width) {
        if (monokumas.length > 3) {
          monokumas.shift();
        }
      }
      kuma.move();
      kuma.show();
  
      if (player.hits(kuma)) {
        lost = true;
        // loseAnimation();
        // started = false;
        break;
      }

      if (!kuma.passed && player.passes(kuma)) {
        progress += 1;
        if (progress == maxProgress) {
          win = true;
          // winAnimation();
          break;
        }
        speed += 0.02;
      }
    }
    image(progressbear, 120 + 20 * (progress/maxProgress), 1, 2, 2);
    player.show();
    player.move();
  } 
  
  else if (lost) {
    if (!losesoundplaying) {
      upupupusound.play();
    }
    losesoundplaying = true;
    image(losegif, 35, 2.5, 80, 45);
  } else if (win) {
    // winAnimation();
    if (!winsoundplaying) {
        dadasound.play();
    }
    winsoundplaying = true;
    image(wingif, 35, 2.5, 80, 45);
  }
}
