var floorPos_y;

var trees;
var canyon;
var collectable;
var clouds;
var mountain;

var scrollPos;
var game_score;
var flagpole;
var lives;
var inc;

var isEnd;
var charJumpPosStart; 
var charJumpPosCurrent;
var charJumping;

var coinSound;
var deathSound;
var stepSound;
var jumpSound;
var music;
var img;

//Loading different assets
function preload() {

    soundFormats('mp3', 'wav');
    song = loadSound('assets/music.wav');
    coinSound = loadSound('assets/coin.wav');
    deathSound = loadSound('assets/death.wav');
    stepSound = loadSound('assets/steps.mp3');
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    img = loadImage('assets/vrag.png');
    img.resize(2, 3);

}

function startGame() {
    inc = 1;
    scrollPos = 0;
    trees = [100, 500, 900, 1300, 1700];
    game_score = 0;
    isEnd = false;
    
    charJumping = false; // флаг для определения, идет ли прыжок


    enemies = [];
    enemies.push(new enemy(1500, floorPos_y - 30, 400, img));

    platforms = [];

    platforms.push(createPlatforms(600, floorPos_y - 50, 100));
    platforms.push(createPlatforms(1130, floorPos_y - 50, 100));
    platforms.push(createPlatforms(1500, floorPos_y - 80, 100));

    char = {
    x_pos: 300,
    y_pos: floorPos_y,
    isLeft: false,
    isRight: false,
    isFalling: false,
    isPlummeting: false,
    canJump: true,
    movement: function() {
        if (this.isPlummeting) {
            this.y_pos += 10;
            this.isLeft = false;
            this.isRight = false;
        }

        if (this.isLeft && !this.isFalling) {
            drawLeftFacing(this);
        } else if (this.isRight && !this.isFalling) {
            drawRightFacing(this);
        } else if (this.isFalling && this.isLeft) {
            drawJumpingLeftFaced(this);
        } else if (this.isFalling && this.isRight) {
            drawJumpingRightFaced(this);
        } else if (this.isFalling) {
            drawJumpingFrontFaced(this);
        } else {
            drawFrontFacing(this);
        }
        if (this.isLeft) {
            this.x_pos -= 5;
            scrollPos += 5;
            console.log("Sc pos");
            console.log(scrollPos);
            console.log("char x");
            console.log(this.x_pos);
        }
        if (this.isRight) {
            this.x_pos += 5;
            scrollPos -= 5;
        }
        if (this.y_pos < floorPos_y) {
            var isContact = false;
            for (var i = 0; i < platforms.length; i++) {
                if (platforms[i].checkContact(this.x_pos, this.y_pos)) {
                    isContact = true;
                    this.isFalling = false;
                    this.canJump = true;
                    break;
                }
                this.canJump = false;
            }
            if (isContact == false) {
                this.y_pos += 2;
                this.isFalling = true;
            }
        } else {
            this.isFalling = false;
        }
        if (this.x_pos < -50) {
            this.x_pos = -50;
            scrollPos = 365;
        }
    }
};

    clouds = [{
            x_pos: 150,
            y_pos: 100,
            size: 65
        },
        {
            x_pos: 600,
            y_pos: 150,
            size: 60
        },
        {
            x_pos: 900,
            y_pos: 125,
            size: 80
        }
    ];
    mountain = [{
            x_pos: 100,
            size: 300
        },
        {
            x_pos: 1000,
            size: 100
        }
    ];
    canyon = [{
            x_pos: 160,
            width: 80
        },
        {
            x_pos: 600,
            width: 80
        }
    ];
    collectable = [{
            x_pos: 400,
            y_pos: 432,
            size: 20,
            isFound: false
        },
        {
            x_pos: 900,
            y_pos: 432,
            size: 20,
            isFound: false
        },
        {
            x_pos: 1170,
            y_pos: floorPos_y - 50,
            size: 20,
            isFound: false
        },
                     {
            x_pos: -30,
            y_pos: floorPos_y,
            size: 20,
            isFound: false
        }
    ];



    flagpole = {
        x_pos: 1900,
        isReached: false
    }


}

//Game settings
function setup() {
    createCanvas(1024, 576);
    floorPos_y = 432;
    lives = 3;
    startGame();
}

//Draw
function draw() {
    background(100, 155, 255);
    noStroke();
    fill(0, 155, 0);
    rect(0, floorPos_y, height * 2, width - floorPos_y);
    translate(scrollPos, 0);

    push();
    updateJump()
    rect(-500,250,450,300,50);
    fill(0);
    
    renderFlagpole();

    checkPlayerDie();

    for (var i = 0; i < clouds.length; i++) {
        drawCloud(clouds[i]);
    }

    if (!flagpole.isReached) {
        checkFlagpole();
    }
    fill(0);
    textSize(32);
    text("Score: " + game_score, char.x_pos - 240, 50);
    text("Lives: " + lives, char.x_pos + 500, 50);

    for (var i = 0; i < canyon.length; i++) {
        drawCanyon(canyon[i]);
    }


    for (var i = 0; i < mountain.length; i++) {
        drawMountain(mountain[i]);
    }

    for (var i = 0; i < trees.length; i++) {
        drawTree(trees[i]);
    }

    for (var i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }

    for (var i = 0; i < collectable.length; i++) {
        if (!collectable[i].isFound) {
            collectable[i].isFound = drawCollectable(collectable[i]);
        }
    }

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].draw();
        var isContact = enemies[i].checkContact(char.x_pos, char.y_pos);
        if (isContact) {
            deathSound.play();
            lives = lives - 1;
            if (lives > 0) {
                startGame();
                break;
            }
        }

    }
    pop();

    for (var i = 0; i < canyon.length; i++) {
        if ((char.x_pos > canyon[i].x_pos - canyon[i].width) && (char.x_pos < canyon[i].x_pos + canyon[i].width) && char.y_pos < floorPos_y) {
            char.isPlummeting = false;
        } else if (char.x_pos > canyon[i].x_pos - canyon[i].width && char.x_pos < canyon[i].x_pos + canyon[i].width) {
            char.isPlummeting = true;
        }
    }

    char.movement();

    if (flagpole.isReached) {
        textSize(60);
        fill(255);
        text("Level complete.", char.x_pos, 300);
        endGame();
        return;
    }

    if (lives < 1) {
        textSize(60);
        fill(255);
        text("Game over", char.x_pos, 300);
        endGame();
        lives = 0;
        return;
    }


}

//Describe character's appereance
function drawLeftFacing(character) {
    fill(0);
    rect(character.x_pos - 10, character.y_pos - 62, 20, 15);
    rect(character.x_pos - 12, character.y_pos - 47, 25, 20);
    rect(character.x_pos - 2, character.y_pos - 27, 5, 30);
    rect(character.x_pos - 22, character.y_pos - 47, 20, 5);
    beginShape();
    vertex(character.x_pos - 2, character.y_pos - 27);
    vertex(character.x_pos - 11, character.y_pos + 1);
    vertex(character.x_pos - 15, character.y_pos);
    vertex(character.x_pos - 7, character.y_pos - 27);
    endShape();
    fill(139, 0, 255);
    rect(character.x_pos - 10, character.y_pos - 58, 7, 5);
}

function drawRightFacing(character) {
    fill(0);
    rect(character.x_pos - 10, character.y_pos - 62, 20, 15);
    rect(character.x_pos - 12, character.y_pos - 47, 25, 20);
    rect(character.x_pos - 2, character.y_pos - 27, 5, 30);
    rect(character.x_pos + 10, character.y_pos - 47, 13, 5);
    beginShape();
    vertex(character.x_pos + 3, character.y_pos - 27);
    vertex(character.x_pos + 12, character.y_pos + 1);
    vertex(character.x_pos + 16, character.y_pos);
    vertex(character.x_pos + 8, character.y_pos - 27);
    endShape();
    fill(139, 0, 255);
    rect(character.x_pos + 2.5, character.y_pos - 58, 7, 5);
}

function drawFrontFacing(character) {
    fill(0);
    rect(character.x_pos - 10, character.y_pos - 62, 24, 15);
    rect(character.x_pos - 12, character.y_pos - 47, 27, 20);
    rect(character.x_pos - 15, character.y_pos - 47, 5, 40);
    rect(character.x_pos + 15, character.y_pos - 47, 5, 40);
    rect(character.x_pos - 6, character.y_pos - 27, 5, 30);
    rect(character.x_pos + 6, character.y_pos - 27, 5, 30);
    fill(139, 0, 255);
    rect(character.x_pos - 10, character.y_pos - 58, 7, 5);
    rect(character.x_pos + 7, character.y_pos - 58, 7, 5);
}

function drawJumpingFrontFaced(character) {
    fill(0);
    rect(character.x_pos - 10, character.y_pos - 62, 24, 15);
    rect(character.x_pos - 12, character.y_pos - 47, 27, 20);
    rect(character.x_pos - 15, character.y_pos - 47, 5, 40);
    rect(character.x_pos + 15, character.y_pos - 47, 5, 40);
    //stroke(100);
    beginShape();
    vertex(character.x_pos - 6, character.y_pos - 27);
    vertex(character.x_pos - 8, character.y_pos - 1);
    vertex(character.x_pos - 3, character.y_pos);
    vertex(character.x_pos, character.y_pos - 27);
    endShape();
    beginShape();
    vertex(character.x_pos + 6, character.y_pos - 27);
    vertex(character.x_pos + 8, character.y_pos);
    vertex(character.x_pos + 13, character.y_pos - 1);
    vertex(character.x_pos + 12, character.y_pos - 27);
    endShape();
    fill(139, 0, 255);
    rect(character.x_pos - 10, character.y_pos - 58, 7, 5);
    rect(character.x_pos + 7, character.y_pos - 58, 7, 5);
}

function drawJumpingLeftFaced(character) {
    fill(0);
    rect(character.x_pos - 10, character.y_pos - 62, 20, 15);
    rect(character.x_pos - 12, character.y_pos - 47, 25, 20);
    beginShape();
    vertex(character.x_pos + 3, character.y_pos - 27);
    vertex(character.x_pos + 12, character.y_pos + 1);
    vertex(character.x_pos + 16, character.y_pos);
    vertex(character.x_pos + 8, character.y_pos - 27);
    endShape();
    beginShape();
    vertex(character.x_pos - 2, character.y_pos - 27);
    vertex(character.x_pos - 11, character.y_pos + 1);
    vertex(character.x_pos - 15, character.y_pos);
    vertex(character.x_pos - 7, character.y_pos - 27);
    endShape();
    fill(139, 0, 255);
    rect(character.x_pos - 10, character.y_pos - 58, 7, 5);
}

function drawJumpingRightFaced(character) {
    fill(0);
    rect(character.x_pos - 10, character.y_pos - 62, 20, 15);
    rect(character.x_pos - 12, character.y_pos - 47, 25, 20);
    beginShape();
    vertex(character.x_pos + 3, character.y_pos - 27);
    vertex(character.x_pos + 12, character.y_pos + 1);
    vertex(character.x_pos + 16, character.y_pos);
    vertex(character.x_pos + 8, character.y_pos - 27);
    endShape();
    beginShape();
    vertex(character.x_pos - 2, character.y_pos - 27);
    vertex(character.x_pos - 11, character.y_pos + 1);
    vertex(character.x_pos - 15, character.y_pos);
    vertex(character.x_pos - 7, character.y_pos - 27);
    endShape();
    fill(139, 0, 255);
    rect(character.x_pos + 2.5, character.y_pos - 58, 7, 5);
}

//Controls

function keyPressed() {
    if (keyCode == 37 && !isEnd) {
        char.isLeft = true;
        char.isRight = false;
    } else if (keyCode == 39 && !isEnd) {
        char.isLeft = false;
        char.isRight = true;
    } else if (keyCode === 32 && (char.y_pos == floorPos_y || char.canJump)) {
        charJumping = true;
        charJumpPosStart = char.y_pos;
        charJumpPosCurrent = char.y_pos;
        jumpSound.play();
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW) {
        char.isLeft = false;
    }

    if (keyCode === RIGHT_ARROW) {
        char.isRight = false;
    }
}

// Funcs for drawing background 

function drawCloud(cloud) {
    fill(255);
    ellipse(cloud.x_pos, cloud.y_pos, cloud.size, cloud.size);
    ellipse(cloud.x_pos + 10, cloud.y_pos - 30, cloud.size - 10, cloud.size * 4 / 5);
    ellipse(cloud.x_pos + 40, cloud.y_pos - 45, cloud.size, cloud.size);
    ellipse(cloud.x_pos + 40, cloud.y_pos, cloud.size, cloud.size);
    ellipse(cloud.x_pos + 70, cloud.y_pos, cloud.size, cloud.size);
    ellipse(cloud.x_pos + 70, cloud.y_pos - 25, cloud.size - 10, cloud.size * 4 / 5);
}

function drawCanyon(canyon) {
    fill(90, 61, 48);
    beginShape();
    vertex(canyon.x_pos, 432);
    vertex(canyon.x_pos + 80, 432);
    vertex(canyon.x_pos + 90, 461);
    vertex(canyon.x_pos + 70, 490);
    vertex(canyon.x_pos + 90, 519);
    vertex(canyon.x_pos + 70, 548);
    vertex(canyon.x_pos + 90, 576);
    vertex(canyon.x_pos - canyon.width, 576);
    vertex(canyon.x_pos - canyon.width + 20, 540);
    vertex(canyon.x_pos - canyon.width, 519);
    vertex(canyon.x_pos - canyon.width + 20, 490);
    vertex(canyon.x_pos - canyon.width, 432);
    endShape();
}

function createPlatforms(x, y, length) {
    var p = {
        x: x,
        y: y,
        length: length,
        draw: function() {
            fill(72, 6, 7);
            rect(this.x, this.y, this.length, 20);
        },
        checkContact: function(gc_x, gc_y) {
            if (gc_x > this.x && gc_x < this.x + this.length) {
                var d = this.y - gc_y;
                if (d >= 0 && d < 5) {
                    return true;
                }
            }
            return false;
        }
    }
    return p;
}

function drawMountain(mountain) {
    fill(120);
    triangle(mountain.x_pos, 432, mountain.x_pos + 108, mountain.size + 50, mountain.x_pos + 168, 432);
    fill(130);
    triangle(mountain.x_pos + 38, 432, mountain.x_pos + 208, mountain.size, mountain.x_pos + 368, 432);
    fill(255);
}

function drawTree(treePosx) {
    fill(144, 77, 48);
    rect(treePosx, height / 2 - 25, 30, 170);
    fill(40, 114, 51);
    ellipse(treePosx + 40, height / 2 - 25 + 30, 60, 60);
    ellipse(treePosx + 50, height / 2 - 25, 40, 40);
    ellipse(treePosx - 10, height / 2 - 25 + 45, 60, 60);
    ellipse(treePosx - 30, height / 2 - 25 + 20, 60, 60);
    ellipse(treePosx + 20, height / 2 - 25, 60, 60);
    ellipse(treePosx - 20, height / 2 - 25 - 20, 40, 40);
    ellipse(treePosx + 10, height / 2 - 25 - 30, 40, 40);
    ellipse(treePosx + 40, height / 2 - 25 - 20, 40, 40);
}

function drawCollectable(collectable) {
    if (!collectable.isFound) {
        fill(255, 215, 0);
        ellipse(collectable.x_pos, collectable.y_pos, collectable.size, collectable.size / 2);
    }

    if (dist(char.x_pos, char.y_pos, collectable.x_pos, collectable.y_pos) < collectable.size) {
        collectable.isFound = true;
        game_score += 1;
        coinSound.play();
    }
    return collectable.isFound;
}

// Flagpole and winning 
function renderFlagpole() {
    if (flagpole.isReached === false) {
        fill(200);
        rect(flagpole.x_pos, floorPos_y, 10, -300);
    } else {
        fill(200);
        rect(flagpole.x_pos, floorPos_y, 10, -300);
        fill(196, 30, 58);
        triangle(flagpole.x_pos + 10, floorPos_y - 300, flagpole.x_pos + 10, floorPos_y - 250, flagpole.x_pos + 60, floorPos_y - 275);
    }
}

function checkFlagpole() {
    if (char.x_pos >= flagpole.x_pos - 5 && char.x_pos <= flagpole.x_pos + 5) {
        flagpole.isReached = true;
        song.play();
    }
}

//Failing the game
function checkPlayerDie() {
    if (char.y_pos > height) {
        lives--;
        deathSound.play();
        if (lives > 0) {
            startGame();
        }
    }
}
//Enemy
function enemy(x, y, range, img) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.range = range;
    this.currentX = x;
    this.update = function() {
        this.currentX += inc;
        if (this.currentX >= this.x + this.range) {
            inc = -1;
        } else if (this.currentX < this.x) {
            inc = 1;
        }
    }
    this.draw = function() {
        this.update();
        imageMode(CENTER);
        image(this.img, this.currentX, this.y, 30, 60);
    }
    this.checkContact = function(gc_x, gc_y) {
        var d = dist(gc_x, gc_y, this.currentX - 15, this.y + 30);
        if (d < 20) {
            return true;
        }
        return false;
    }
}

//End game state
function endGame() {
    char.canJump = false;
    char.y_pos = floorPos_y - 2;
    isFalling = false;
    isEnd = true;
    inc = 0;
}

function updateJump() {
    if (charJumping) {
        charJumpPosCurrent -= 10; 

        if (charJumpPosCurrent <= charJumpPosStart - 100) { 
            charJumpPosCurrent = charJumpPosStart - 100;
            charJumping = false;
        }

        char.y_pos = charJumpPosCurrent;
    }
}