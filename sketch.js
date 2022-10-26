let wingif;
let losegif;
let walkingbear;
let walkingplayer;
let progressbear;

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
  // numBears = round(random(1, 4));
  // determine the second bear;
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

function keyPressed() {
  if (keyCode == ENTER) {
      jumpsound.play();
      player.jump();
      if  (lost || win) {
        startsound.play();
        startGame();
      }
  }
}

function draw() {

  if (!win && !lost) {
    background(0);
    counter += 1;
    push();
    noStroke();
    fill(255);
    rect(120, 3, 20, 0.5);
    pop();
    image(progressbear, 120 + 20 * (progress/maxProgress), 1, 2, 2);
  
    if (counter == nextbear) {
      monokumas.push(new Monokuma());
      counter = 0;
      if (progress == maxProgress) {
        win = true;
        // started = false;
      }
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
        // started = false;
      }

      if (!kuma.passed && player.passes(kuma)) {
        progress += 1;
        speed += 0.02;
      }
    }
  
    player.show();
    player.move();
  } else if (lost) {
    if (!losesoundplaying) {
      upupupusound.play();
    }
    losesoundplaying = true;
    image(losegif, 35, 2.5, 80, 45);
  } else if (win) {
    if (!winsoundplaying) {
      dadasound.play();
    }
    winsoundplaying = true;
    image(wingif, 35, 2.5, 80, 45);
  }
 
}
