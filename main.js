var activeAnim = "none";

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var mouseX = 0;
var mouseY = 0;

var activeKeys = {
    "ArrowUp": 0,
    "ArrowDown": 0,
    "ArrowLeft": 0,
    "ArrowRight": 0,
    "KeyW": 0,
    "KeyA": 0,
    "KeyS": 0,
    "KeyD": 0
};

function is_in_rect(xy, rxywh) {
    let [x, y] = xy;
    let [rx, ry, rw, rh] = rxywh;
    return (x >= rx && y >= ry && x <= rx+rw && y <= ry+rh);
}
function is_in_circle(xy, cxyr) {
    let [x, y] = xy;
    let [cx, cy, cr] = cxyr;
    let r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    return (r <= cr);
}

function rect2rect_collision(rect1, v1, rect2, v2, tStep) {
    //This function will use velocity to predict collisions 1 frame ahead of time.
    //Run this BEFORE updating rectangle position.
    let [x1, y1, w1, h1] = rect1;
    let [x2, y2, w2, h2] = rect2;
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

//Make the button click change the active animation
document.getElementById("btn").addEventListener("click", startAnim);
function startAnim() {
    document.body.style.backgroundColor = "#00000000"; //Reset background from the mouseover challenge

    const tStart = document.timeline.currentTime;
    let tPrev = tStart;

    //Figure out which challenge Mr. Veldkamp wants to see
    const choice = document.getElementById("choice").value;

    //Record the current animation and the time it started
    //This way, when a new animation is started, the old animation will know to stop
    activeAnim = `${choice} ${tStart}`;

    if (choice === "bounds") {

        //Resize canvas
        canvas.width = 600;
        canvas.height = 400;

        //Define initial position of squares
        let greenX = 200;
        let greenY = 175;
        let blueX = 350;
        let blueY = 175;

        function bounds_frame(tNow) {
            //Stop if a new animation has been started
            if (activeAnim != `bounds ${tStart}`) {
                return;
            }

            //Calculate time (in seconds) since last frame.
            let tStep = (tNow - tPrev) / 1e3;
            tPrev = tNow;

            //Find each square's speed
            let greenVX = 400 * (activeKeys["KeyD"] - activeKeys["KeyA"]);
            let greenVY = 400 * (activeKeys["KeyS"] - activeKeys["KeyW"]);
            let blueVX = 400 * (activeKeys["ArrowRight"] - activeKeys["ArrowLeft"]);
            let blueVY = 400 * (activeKeys["ArrowDown"] - activeKeys["ArrowUp"]);

            //Update green square's position
            greenX += greenVX * tStep;
            greenY += greenVY * tStep;
            if (greenX > canvas.width) {
                greenX = -50 + (greenX - canvas.width);
            } else if (greenX < -50) {
                greenX = canvas.width + (-50 - greenX);
            }
            if (greenY > canvas.height) {
                greenY = -50 + (greenY - canvas.height);
            } else if (greenY < -50) {
                greenY = canvas.height + (-50 - greenY);
            }

            //Update blue square's position
            blueX += blueVX * tStep;
            blueY += blueVY * tStep;
            if (blueX > canvas.width - 50) {
                blueX = canvas.width - 50;
            } else if (blueX < 0) {
                blueX = 0;
            }
            if (blueY > canvas.height - 50) {
                blueY = canvas.height - 50;
            } else if (blueY < 0) {
                blueY = 0;
            }

            //Clear previous frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            //Draw the squares
            ctx.fillStyle = "green";
            ctx.fillRect(greenX, greenY, 50, 50);
            ctx.fillStyle = "blue";
            ctx.fillRect(blueX, blueY, 50, 50);

            //Request next frame
            requestAnimationFrame(bounds_frame);
        }
        
        //Request first frame
        requestAnimationFrame(bounds_frame);
    } else if (choice === "mouseover") {
        
        //Resize canvas
        canvas.width = 800;
        canvas.height = 600;

        //Set initial positions of the blue and orange shapes
        let blueX = 50;
        let blueY = 400;
        let blueW = 100;
        let blueH = 100;

        let orangeX = 600;
        let orangeY = 400;
        let orangeR = 100;

        function mouseover_frame(tNow) {
            if (activeAnim != `mouseover ${tStart}`) {
                return;
            }

            //Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            //Prevent the canvas from turning red when you hover over the red rectangle
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            //Draw the red rectangle
            ctx.fillStyle = "red";
            ctx.fillRect(50, 50, 150, 100);

            //Draw the green circle
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(700, 100, 50, 0, 2*Math.PI);
            ctx.fill();

            //Draw the blue rectangle
            ctx.fillStyle = "blue";
            ctx.fillRect(blueX, blueY, blueW, blueH);

            //Draw the orange circle
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(orangeX, orangeY, orangeR, 0, 2*Math.PI);
            ctx.fill();
            
            //Check if the mouse is over any of the shapes
            if (is_in_rect([mouseX, mouseY], [50, 50, 150, 100])) {
                document.body.style.backgroundColor = "red";
            }
            if (is_in_circle([mouseX, mouseY], [700, 100, 50])) {
                document.body.style.backgroundColor = "green";
            }
            if (is_in_rect([mouseX, mouseY], [blueX, blueY, blueW, blueH])) {
                document.body.style.backgroundColor = "blue";
                blueW = 50 + 150 * Math.random();
                blueH = 50 + 150 * Math.random();
                blueX = (800 - blueW) * Math.random();
                blueY = (600 - blueH) * Math.random();
            }
            if (is_in_circle([mouseX, mouseY], [orangeX, orangeY, orangeR])) {
                document.body.style.backgroundColor = "orange";
                orangeR = 10 + 90 * Math.random();
                orangeX = (orangeR / 2) + (800 - orangeR) * Math.random();
                orangeY = (orangeR / 2) + (600 - orangeR) * Math.random();
            }

            //Request next frame
            requestAnimationFrame(mouseover_frame);
        }

        requestAnimationFrame(mouseover_frame);
    } else if (choice === "bounce") {
        canvas.width = 400;
        canvas.height = 400;

        //Define the squares' initial positions
        let blueX = 175;
        let greenY = 0;
        let orangeX = 125;
        let orangeY = 50;

        //Define the squares' initial velocities
        let blueVX = 100;
        let greenVY = 100;
        let orangeVX = 100;
        let orangeVY = 100;

        function bounce_frame(tNow) {
            if (activeAnim != `bounce ${tStart}`) {
                return;
            }
            
            //Get time since last frame
            let tStep = (tNow - tPrev) / 1e3;
            tPrev = tNow;

            //Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = "blue";
            ctx.fillRect(blueX, 175, 50, 50);
            ctx.fillStyle = "green";
            ctx.fillRect(175, greenY, 50, 50);
            ctx.fillStyle = "orange";
            ctx.fillRect(orangeX, orangeY, 50, 50);

            //Move the squares
            blueX += blueVX * tStep;
            greenY += greenVY * tStep;
            orangeX += orangeVX * tStep;
            orangeY += orangeVY * tStep;

            
            //Bounce blue square
            if (blueX >= 350) {
                blueX = (2 * 350) - blueX;
                blueVX = -100;
            } else if (blueX <= 0) {
                blueX = -blueX;
                blueVX = 100;
            }
            
            //Bounce green square
            if (greenY >= 350) {
                greenY = (2 * 350) - greenY;
                greenVY = -100;
            } else if (greenY <= 0) {
                greenY = -greenY;
                greenVY = 100;
            }

            //Bounce orange square
            if (orangeX >= 350) {
                orangeX = (2 * 350) - orangeX;
                orangeVX = -100;
            } else if (orangeX <= 0) {
                orangeX = -orangeX;
                orangeVX = 100;
            }
            if (orangeY >= 350) {
                orangeY = (2 * 350) - orangeY;
                orangeVY = -100;
            } else if (orangeY <= 0) {
                orangeY = -orangeY;
                orangeVY = 100;
            }

            //Request next frame
            requestAnimationFrame(bounce_frame);
        }
        requestAnimationFrame(bounce_frame);
    } else if (choice === "wall-easy") {
        canvas.width = 600;
        canvas.height = 400;

        let blueX = 25;
        let blueY = 175;

        function wall_easy_frame(tNow) {
            if (activeAnim != `wall-easy ${tStart}`) {
                return;
            }

            let tStep = (tNow - tPrev) / 1e3;
            tPrev = tNow;

            //Update blue square's position
            let blueVX = 400 * (activeKeys["ArrowRight"] - activeKeys["ArrowLeft"]);
            let blueVY = 400 * (activeKeys["ArrowDown"] - activeKeys["ArrowUp"]);
            blueX += blueVX * tStep;
            blueY += blueVY * tStep;

            //Make sure it stays in the canvas
            if (blueX > canvas.width - 50) {
                blueX = canvas.width - 50;
            } else if (blueX < 0) {
                blueX = 0;
            }
            if (blueY > canvas.height - 50) {
                blueY = canvas.height - 50;
            } else if (blueY < 0) {
                blueY = 0;
            }

            //Teleport the blue square back if it goes off-screen
            if (blueX > 230 && blueX < 300 && blueY > 50 && blueY < 300) {
                blueX = 25;
                blueY = 175;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "blue";
            ctx.fillRect(blueX, blueY, 50, 50);

            ctx.fillStyle = "lightgray";
            ctx.fillRect(280, 100, 20, 200);

            requestAnimationFrame(wall_easy_frame);
        }
        requestAnimationFrame(wall_easy_frame);
    } else if (choice === "wall-hard") {
        activeAnim = `wall-hard ${tStart}`;

        canvas.width = 600;
        canvas.height = 400;

        let blueX = 25;
        let blueY = 175;

        let blueVX = 0;
        let blueVY = 0;

        function wall_hard_frame(tNow) {
            if (activeAnim != `wall-hard ${tStart}`) {
                return;
            }

            let tStep = (tNow - tPrev) / 1e3;
            tPrev = tNow;

            //Check if the rectangles will collide this frame.
            let [collType, tColl] = rect2rect_collision([blueX, blueY, 50, 50], [blueVX, blueVY], [280, 100, 20, 200], [0, 0], tStep);
            console.log(collType, tColl);

            //Update blue square's position

            //If the blue square will collide with the wall this frame, only advance time to the collision.
            if (collType === "+x" || collType === "-x") {
                blueX += blueVX * tColl;
            } else {
                blueX += blueVX * tStep;
            }
            if (collType === "+y" || collType === "-y") {
                blueY += blueVY * tColl;
            } else {
                blueY += blueVY * tStep;
            }

            //Make keypresses move the square
            blueVX = 400 * (activeKeys["ArrowRight"] - activeKeys["ArrowLeft"]);
            blueVY = 400 * (activeKeys["ArrowDown"] - activeKeys["ArrowUp"]);

            //Keep the square in the canvas
            if (blueX > canvas.width - 50) {
                blueX = canvas.width - 50;
            } else if (blueX < 0) {
                blueX = 0;
            }
            if (blueY > canvas.height - 50) {
                blueY = canvas.height - 50;
            } else if (blueY < 0) {
                blueY = 0;
            }

            //Draw the stuff
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "blue";
            ctx.fillRect(blueX, blueY, 50, 50);

            ctx.fillStyle = "lightgray";
            ctx.fillRect(280, 100, 20, 200);

            requestAnimationFrame(wall_hard_frame);
        }
        requestAnimationFrame(wall_hard_frame);
    } else if (choice === "circle-easy") {
        canvas.width = 800;
        canvas.height = 600;

        let blueX;
        let blueY;

        let orangeX = 80;
        let orangeY = 80;

        function circle_easy_frame(tNow) {
            if (activeAnim != `circle-easy ${tStart}`) {
                return;
            }

            //Update blue circle position
            blueX = mouseX;
            blueY = mouseY;

            //Make sure the circle doesn't go off the canvas
            if (blueX > canvas.width) {
                blueX = canvas.width;
            } else if (blueX < 0) {
                blueX = 0;
            }
            if (blueY > canvas.height - 50) {
                blueY = canvas.height - 50;
            } else if (blueY < 0) {
                blueY = 0;
            }

            //This loop GUARANTEES that the orange circle will not spawn inside the blue circle
            while (Math.sqrt((mouseX - orangeX) ** 2 + (mouseY - orangeY) ** 2) < 100) {
                orangeX = 50 + Math.random() * (canvas.width - 100);
                orangeY = 50 + Math.random() * (canvas.height - 100);
            }

            //Now draw the things
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(blueX, blueY, 50, 0, 2*Math.PI);
            ctx.fill();

            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(orangeX, orangeY, 50, 0, 2*Math.PI);
            ctx.fill();

            requestAnimationFrame(circle_easy_frame);
        }
        requestAnimationFrame(circle_easy_frame);
    } else if (choice === "circle-hard") {
        canvas.width = 800;
        canvas.height = 600;

        let blueX = 400;
        let blueY = 300;

        let blueVX = 0;
        let blueVY = 0;

        let orangeX = 80;
        let orangeY = 80;

        function circle_hard_frame(tNow) {
            if (activeAnim != `circle-hard ${tStart}`) {
                return;
            }

            let tStep = (tNow - tPrev) / 1e3;
            tPrev = tNow;

            //Make blue circle move towards the mouse
            let angle = Math.atan2(mouseY - blueY, mouseX - blueX);
            blueVX = 200 * Math.cos(angle);
            blueVY = 200 * Math.sin(angle);

            //Update blue circle position
            blueX += blueVX * tStep;
            blueY += blueVY * tStep;

            //Make sure the circle doesn't go off the canvas
            if (blueX > canvas.width - 50) {
                blueX = canvas.width - 50;
            } else if (blueX < 50) {
                blueX = 50;
            }
            if (blueY > canvas.height - 50) {
                blueY = canvas.height - 50;
            } else if (blueY < 50) {
                blueY = 50;
            }

            //This loop GUARANTEES that the orange circle will not spawn inside the blue circle
            while (Math.sqrt((blueX - orangeX) ** 2 + (blueY - orangeY) ** 2) < 100) {
                orangeX = 50 + Math.random() * (canvas.width - 100);
                orangeY = 50 + Math.random() * (canvas.height - 100);
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(blueX, blueY, 50, 0, 2*Math.PI);
            ctx.fill();

            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(orangeX, orangeY, 50, 0, 2*Math.PI);
            ctx.fill();

            requestAnimationFrame(circle_hard_frame);
        }
        requestAnimationFrame(circle_hard_frame);
    } else if (choice === "platform-easy") {
        canvas.width = 800;
        canvas.height = 600;

        let blueX = 380;
        let blueY = 560;

        let blueVX = 0;
        let blueVY = 0;

        let orangeX = 80;
        let orangeY = 80;

        function platform_easy_frame(tNow) {
            if (activeAnim != `platform-easy ${tStart}`) {
                return;
            }

            let tStep = (tNow - tPrev) / 1e3;
            tPrev = tNow;

            //Update blue square velocity
            blueVX = 400 * (activeKeys["ArrowRight"] - activeKeys["ArrowLeft"]);
            if (activeKeys["ArrowUp"] && blueVY === 0) {
                blueVY = -640;
            } else {
                blueVY += 800 * tStep; //Gravity of 800px/s^2
            }

            //Handle platform collision and update blue square position
            let [collType, tColl] = rect2rect_collision([blueX, blueY, 40, 40], [blueVX, blueVY], [250, 400, 300, 20], [0, 0], tStep);
            console.log(collType);
            if (collType === "+y") {
                blueX += blueVX * tColl;
                blueY += blueVY * tColl;
                blueVY = 0;
            } else if (collType && blueVY !== 0) {
                blueY = 360;
                blueVY = 0;
            } else {
                blueY += blueVY * tStep;
            }
            blueX += blueVX * tStep;

            //Handle collision with canvas boundaries
            if (blueY > 560) {
                blueY = 560;
                blueVY = 0;
            }
            if (blueX < 0) {
                blueX = 0;
                blueVX = 0;
            } else if (blueX > 760) {
                blueX = 760;
                blueVX = 0;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "blue";
            ctx.fillRect(blueX, blueY, 40, 40);

            ctx.fillStyle = "lightgray";
            ctx.fillRect(250, 400, 300, 20);

            requestAnimationFrame(platform_easy_frame);
        }
        requestAnimationFrame(platform_easy_frame);
    } else if (choice === "platform-hard") {
        canvas.width = 800;
        canvas.height = 600;

        let blueX = 380;
        let blueY = 560;

        let blueVX = 0;
        let blueVY = 0;

        let orangeX = 80;
        let orangeY = 80;

        function platform_hard_frame(tNow) {
            if (activeAnim != `platform-hard ${tStart}`) {
                return;
            }

            let tStep = (tNow - tPrev) / 1e3;
            tPrev = tNow;

            //Update blue square velocity
            blueVX = 400 * (activeKeys["ArrowRight"] - activeKeys["ArrowLeft"]);
            if (activeKeys["ArrowUp"] && blueVY === 0) {
                blueVY = -640;
            } else {
                blueVY += 800 * tStep; //Gravity of 800px/s^2
            }

            //Handle platform collision and update blue square position
            let [collType, tColl] = rect2rect_collision([blueX, blueY, 40, 40], [blueVX, blueVY], [250, 400, 300, 20], [0, 0], tStep);
            console.log(collType);
            if (collType === "+y" || collType === "-y") {
                blueY += blueVY * tColl;
                if (collType === "+y") {
                    blueVY = 0;
                } else {
                    blueVY = -0.001;
                }
            } else {
                blueY += blueVY * tStep;
            }
            if (collType === "+x" || collType === "-x") {
                blueX += blueVX * tColl;
                blueVX = 0;
            } else {
                blueX += blueVX * tStep;
            }

            //Handle collision with canvas boundaries
            if (blueY > 560) {
                blueY = 560;
                blueVY = 0;
            }
            if (blueX < 0) {
                blueX = 0;
                blueVX = 0;
            } else if (blueX > 760) {
                blueX = 760;
                blueVX = 0;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "blue";
            ctx.fillRect(blueX, blueY, 40, 40);

            ctx.fillStyle = "lightgray";
            ctx.fillRect(250, 400, 300, 20);

            requestAnimationFrame(platform_hard_frame);
        }
        requestAnimationFrame(platform_hard_frame);
    }
}

//Update activeKeys when keys are pressed
document.addEventListener("keydown", keyPressed);
function keyPressed(event) {
    if (activeKeys.hasOwnProperty(event.code)) {
        activeKeys[event.code] = 1;
    }
}
document.addEventListener("keyup", keyReleased);
function keyReleased(event) {
    if (activeKeys.hasOwnProperty(event.code)) {
        activeKeys[event.code] = 0;
    }
}

//Update mouse position
document.addEventListener("mousemove", updateMouse);
function updateMouse(event) {
    let canvasBBox = canvas.getBoundingClientRect();
    mouseX = Math.round(event.clientX - canvasBBox.left);
    mouseY = Math.round(event.clientY - canvasBBox.top);
}