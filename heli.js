//Rectangle collision code borrowed from one of the other Game Developer challenges
function rect2rect_collision(rect1, v1, rect2, v2, tStep) {
  //This function will use velocity to predict collisions 1 frame ahead of time.
  //Run this BEFORE updating rectangle position.
  let x1 = rect1.x, y1 = rect1.y, w1 = rect1.w, h1 = rect1.h;
  let x2 = rect2.x, y2 = rect2.y, w2 = rect2.w, h2 = rect2.h;
  let [v1x, v1y] = v1;
  let [v2x, v2y] = v2;

  //Compute position of rectangles on next frame
  let x1_ = x1 + (tStep * v1x);
  let y1_ = y1 + (tStep * v1y);
  let x2_ = x2 + (tStep * v2x);
  let y2_ = y2 + (tStep * v2y);

  //If rect1 right edge passes rect2 left edge
  if (v1x > v2x && x1+w1 <= x2 && x1_+w1 > x2_) {
      //Find time until the edges have the same X coordinate
      let tColl = ((x1+w1) - x2) / (v2x - v1x);
      
      //Find Y-coordinates of rectangles at time of X-coordinate collision
      let y1Coll = y1 + (v1y * tColl);
      let y2Coll = y2 + (v2y * tColl);

      //If the rectangles overlap in the Y direction, then they have collided.
      if (y1Coll+h1 >= y2Coll && y1Coll <= y2Coll+h2) {
          return ["+x", tColl];
      }
  }

  //If rect2 right edge passes rect1 left edge
  if (v2x > v1x && x2+w2 <= x1 && x2_+w2 > x1_) {
      //Same as above block, but rect2 and rect1 are switched.
      let tColl = ((x2+w2) - x1) / (v1x - v2x);
      let y1Coll = y1 + (v1y * tColl);
      let y2Coll = y2 + (v2y * tColl);
      if (y2Coll+h2 >= y1Coll && y2Coll <= y1Coll+h1) {
          return ["-x", tColl];
      }
  }

  //If rect1 bottom edge passes rect2 top edge
  if (v1y > v2y && y1+h1 <= y2 && y1_+h1 > y2_) {
      //Find time until the edges have the same Y coordinate.
      let tColl = ((y1+h1) - y2) / (v2y - v1y);
      
      //Find X-coordinates of rectangles at time of Y-coordinate collision.
      let x1Coll = x1 + (v1x * tColl);
      let x2Coll = x2 + (v2x * tColl);

      //If the rectangles overlap in the X direction, then they have collided.
      if (x1Coll+w1 >= x2Coll && x1Coll <= x2Coll+w2) {
          return ["+y", tColl];
      }
  }

  //If rect2 bottom edge passes rect1 top edge
  if (v2y > v1y && y2+h2 <= y1 && y2_+h2 > y1_) {
      //Same as above block, but rect2 and rect1 are switched.
      let tColl = ((y2+h2) - y1) / (v1y - v2y);
      let x1Coll = x1 + (v1x * tColl);
      let x2Coll = x2 + (v2x * tColl);
      if (x2Coll+w2 >= x1Coll && x2Coll <= x1Coll+w1) {
          return ["-y", tColl];
      }
  }

  //If no collisions were detected, return [false, 0] to signify that.
  return [false, 0];
}


// Helicopter Game Start

// Set up canvas and graphics context
let cnv = document.getElementById("my-canvas");
let ctx = cnv.getContext("2d");
cnv.width = 800;
cnv.height = 600;


// Global Variables
let hiscore = 0;

let gameState = "start";
let distance = 0;
let speed = 1;
let heli = {
  x: 200,
  y: 250,
  vy: 0,
  w: 80,
  h: 40
};


let heliImg = document.createElement("img");
heliImg.src = "img/heliBlueTransparent.png";

let explosion = document.createElement("audio");
explosion.src = "sound/explosion.wav";

let propeller = document.createElement("audio");
propeller.src = "sound/propeller.wav";

let mousePressed = false;

//Store the ID of the 2 second game over timeout so that it can be cancelled when the player clicks
//This is to allow the player to skip the 2 second timeout
let gameOverTimeoutID;


let tStart = 0;
let tPrev = 0;

//List of walls
let walls = [{x: cnv.width, y: Math.random()*300+100, w: 50, h: 100}]; //Spawn first wall

let timeUntilNextWall = 2 + 3 * Math.random(); //Time until next wall is spawned

// Draw Function
window.addEventListener("load", function() {
  requestAnimationFrame(draw);
});

function draw(tNow) {
  //console.log(`draw ${gameState}`);
  ctx.clearRect(0, 0, cnv.width, cnv.height);

  //Decide what to do based on the state of the game
  //The reason that the requestAnimationFrame is not outside the if block is because I don't
  // want to keep redrawing the same start menu or game over screen every frame
  if (gameState === "start") {
    drawStart();
  } else if (gameState === "running") {
    //Calculate time since start
    let tElapsed = (tNow - tStart) / 1000;

    //Calculate time since last frame
    let tStep = (tNow - tPrev) / 1000;
    tPrev = tNow;

    //Move stuff
    updatePhysics(tElapsed, tStep);

    //Draw stuff
    drawGame();
    requestAnimationFrame(draw);
  } else if (gameState === "gameover") {
    drawGameOver();
    gameOverTimeoutID = setTimeout(function() {
      if (gameState === "gameover") {
        gameState = "start";
        requestAnimationFrame(draw);
      }
    }, 2000);
  }
}

// FUNCTIONS
function updatePhysics(tElapsed, tStep) {
  
  //Update the distance travelled
  let distanceOld = distance;
  distance += 100 * speed * tStep;

  //Move the walls
  let i = 0;
  while (i < walls.length) {
    walls[i].x -= distance - distanceOld;
    i++;
  }

  //See if it is time to spawn a new wall
  timeUntilNextWall -= tStep;
  if (timeUntilNextWall <= 0) {
    walls.push({x: cnv.width - (tElapsed % 2) * speed, y: Math.random() * 300 + 100, w: 50, h: 100});
    timeUntilNextWall = (2 + 3 * Math.random()) / Math.sqrt(speed);
  }

  //Delete walls that have gone off the screen.
  i = 0;
  while (i < walls.length) {
    if (walls[0].x < 0 - walls[0].w && walls.length > 1) {
      walls.splice(i, 1);
    } else {
      i++;
    }
  }

  //See if helicopter should be dead
  if (heli.y < 50 || heli.y + heli.h > cnv.height - 50) {
    gameState = "gameover";
  } else {
    for (let i = 0; i < walls.length; i++) {
      let [collType, tColl] = rect2rect_collision(heli, [0, heli.vy], walls[i], [-100 * speed, 0], tStep);
      console.log(collType, tColl);
      if (collType) {
        walls[i].x += -100 * speed * tColl;
        gameState = "gameover";
        break;
      }
    }
  }

  //Move the helicopter
  if (mousePressed) {
    heli.vy -= 800 * tStep * Math.sqrt(speed);
  } else {
    heli.vy += 800 * tStep * Math.sqrt(speed);
  }
  if (heli.vy > 400 * speed) {
    heli.vy = 400;
  } else if (heli.vy < -400 * speed) {
    heli.vy = -400;
  }
  heli.y += heli.vy * tStep;
  //console.log(`${heli.y} ${heli.vy} ${tStep}`);

  //Update hiscore
  hiscore = Math.max(hiscore, Math.round(distance / 5));

  //Update speed
  speed = 1 + .1 * tElapsed;
}


// Draw Start Screen
function drawStart() {

  // Background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  // Green Bars
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, cnv.width, 50);
  ctx.fillRect(0, cnv.height - 50, cnv.width, 50);

  // Green Bar Text
  ctx.font = "30px Consolas";
  ctx.fillStyle = "black";
  ctx.fillText("HELICOPTER GAME", 25, 35);
  ctx.fillText("DISTANCE: 0", 25, cnv.height - 15);
  ctx.fillText(`BEST: ${hiscore}`, cnv.width - 250, cnv.height - 15);

  // Helicopter
  ctx.drawImage(heliImg, 200, 250);

  // Start Text
  ctx.font = "40px Consolas";
  ctx.fillStyle = "lightblue";
  ctx.fillText("CLICK TO START", 350, 285)

  ctx.font = "25px Consolas";
  ctx.fillText("CLICK AND HOLD LEFT MOUSE BUTTON TO GO UP", 100, 450);
  ctx.fillText("RELEASE TO GO DOWN", 415, 480);
}

// Draw Game Elements
function drawGame() {
  // Background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  // Green Bars
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, cnv.width, 50);
  ctx.fillRect(0, cnv.height - 50, cnv.width, 50);

  // Green Bar Text
  ctx.font = "30px Consolas";
  ctx.fillStyle = "black";
  ctx.fillText("HELICOPTER GAME", 25, 35);
  ctx.fillText(`DISTANCE: ${Math.round(distance / 5)}`, 25, cnv.height - 15);
  ctx.fillText(`BEST: ${hiscore}`, cnv.width - 250, cnv.height - 15);

  // Helicopter
  ctx.drawImage(heliImg, heli.x, heli.y);

  // Draw walls
  ctx.fillStyle = "green";
  for (var i = 0; i < walls.length; i++) {
    ctx.fillRect(walls[i].x, walls[i].y, walls[i].w, walls[i].h);
  }
}

// Draw Game Over Screen
function drawGameOver() {
  if (!propeller.paused) {
    propeller.pause();
  }
  explosion.play();

  // Background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  // Green Bars
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, cnv.width, 50);
  ctx.fillRect(0, cnv.height - 50, cnv.width, 50);

  // Green Bar Text
  ctx.font = "30px Consolas";
  ctx.fillStyle = "black";
  ctx.fillText("HELICOPTER GAME", 25, 35);
  ctx.fillText(`DISTANCE: ${Math.round(distance / 5)}`, 25, cnv.height - 15);
  ctx.fillText(`BEST: ${hiscore}`, cnv.width - 250, cnv.height - 15);

  // Helicopter
  ctx.drawImage(heliImg, heli.x, heli.y);

  // Draw walls
  ctx.fillStyle = "green";
  for (var i = 0; i < walls.length; i++) {
    ctx.fillRect(walls[i].x, walls[i].y, walls[i].w, walls[i].h);
  }

  // Circle around Helicopter
  ctx.strokeStyle = "red";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(heli.x + heli.w / 2, heli.y + heli.h / 2, 60, 0, 2 * Math.PI);
  ctx.stroke();

  // Game Over Text
  ctx.font = "40px Consolas";
  ctx.fillStyle = "lightblue";
  ctx.fillText("GAME OVER", 350, 285);
}

function reset() {
  heli = {
    x: 200,
    y: 250,
    vy: 0,
    w: 80,
    h: 40
  };
  tStart = document.timeline.currentTime; //Set the start time
  walls = [{x: cnv.width, distanceInitial: 0, y: Math.random()*300+100, w: 50, h: 100}]; //Spawn first wall
  tPrev = tStart;
  speed = 1;
  distance = 0;
  timeUntilNextWall = 1 + 3 * Math.random();
}

cnv.addEventListener("mousedown", function () {
  if (gameState === "start") {
    //Start the game on click
    gameState = "running";
    reset();
    requestAnimationFrame(draw); //Start drawing
  } else if (gameState === "gameover") {
    //Skip the game over screen on click
    gameState = "start";
    clearTimeout(gameOverTimeoutID);
    requestAnimationFrame(draw); //Draw the start screen
  } else {
    //If the game is running, play the propeller sound on click
    propeller.currentTime = 0;
    propeller.play();
  }
  mousePressed = true;
});
cnv.addEventListener("mouseup", function () {
  propeller.pause();
  mousePressed = false;
});