// Globals
let d;
let game;
let score = 0;
let shipHP = 100;
let earthHP = 100;
let meteorsSpeed = 1;
let isSpaceDown = false;
let displayShipHP = document.querySelector(".ship-hpFill");
let displayEarthHP = document.querySelector(".earth-hpFill");
const menu = document.querySelector(".menu");
const displayScore = document.querySelector("#score");
const displayImage = document.querySelector("#displayImage");
const message = document.querySelector("#message");

// Canvas
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const cWidth = canvas.width;
const cHeight = canvas.height;
let minHeight = 0;
let maxHeight = 500;

// Assets
const bg = new Image();
const ship = new Image();
const meteor = new Image();
const missile = new Image();
const explosion = new Image();
const firstAid = new Image();
const comet = new Image();
const missileSound = new Audio();
const explosionSound = new Audio();

ship.src = "images/spaceship.png";
bg.src = "images/gameBg.png";
meteor.src = "images/meteor.png";
missile.src = "images/torpedo.png";
explosion.src = "images/explosion.png";
firstAid.src = "images/firstAid.png";
comet.src = "images/comet.png";
missileSound.src = "rocket.wav";
missileSound.volume = 0.1;
explosionSound.src = "explosion.wav";
explosionSound.volume = 0.1;

// Spaceship starting coordinates
let shipX = 50;
let shipY = 250;
let hitBoundary = false;

// Spaceship ammo
// let ammoX = shipX + ship.width;
// let ammoY = shipY + (ship.height / 2);
let ammo = [];
ammo[0] = {
    x:shipX + ship.width,
    y: shipY + (ship.height / 2)
}

// Meteors
let meteors = [];
meteors[0] = {
    x: cWidth,
    y: Math.floor(Math.random() * ( (maxHeight-meteor.height) - minHeight) + minHeight)
}

// Health renew
let healthRenew = [];
healthRenew[0] = {
    x: cWidth,
    y: Math.floor(Math.random() * ( (maxHeight - firstAid.height) - minHeight) + minHeight)
}
let initialHealthPushed = false;

// Comets for bonus points
let comets = [];
comets[0] = {
    x: cWidth,
    y: Math.floor(Math.random() * ( (maxHeight - comet.height) - minHeight) + minHeight)
}
let initialCometPushed = false;

// Start game
function startGame(){
    const mainMenu = document.querySelector(".main-menu");
    mainMenu.classList.add("mainMenuFade")
    setTimeout(() => {
        mainMenu.style.display = "none";
        
        // Display the MENU/SCORE panel
        menu.style.display = "flex";
        setTimeout(() => {
            menu.classList.add("menuActive");
        }, 500);

        // Show the info box
        const infobox = document.querySelector(".infobox");
        infobox.style.display = "flex";
        setTimeout(() => {
            infobox.classList.add("infoBoxActive");

            // After 5 seconds make the infobox fade away. (remove the active class).
            setTimeout(() => {
                infobox.classList.remove('infoBoxActive')
            }, 5000);
        }, 1000);

        game = setInterval(draw, 1000/60);
    }, 2500);
}
// Move the spaceship
function shipCommands(e){
    let key = e.keyCode;
    if(key == 37) {
        d = "LEFT"
    } else if (key == 38) {
        d = "UP"
    } else if (key == 39) {
        d = "RIGHT"
    } else if (key == 40) {
        d = "DOWN"
    }
}
function testShipCommands() {
    d = " ";
}
function shoot(e){
    let key = e.keyCode;
    if(key == 32) {
        isSpaceDown = true;
        // ammoX = shipX + ship.width;
        // ammoY = shipY + (ship.height / 2);
        ammo.push({
            x: shipX + ship.width,
            y: shipY + (ship.height / 2)
        })
        missileSound.play();
        missileSound.currentTime = 0;
    } else {
        isSpaceDown = false;
    }
}

setInterval(updateRocketPosition, 2);
function updateRocketPosition(){
        for(let j = 0; j < ammo.length; j++) {
        ctx.drawImage(missile, ammo[j].x, ammo[j].y);
        ammo[j].x += 5;

        for(let i = 0; i < meteors.length; i++) {
            if(ammo[j].x >= meteors[i].x && ammo[j].x <= meteors[i].x + meteor.width && ammo[j].y >= meteors[i].y && ammo[j].y <= meteors[i].y + meteor.height){
                // Draw explosion of the meteor.
                ctx.drawImage(explosion, meteors[i].x - meteor.width, meteors[i].y - meteor.height);

                // Delete meteor from screen and add points.
                destroyMeteor();
            }
        }
        // Ammo collides with the commet
        for(let i = 0; i < comets.length; i++) {
            if(ammo[j].x >= comets[i].x && ammo[j].x <= comets[i].x + comet.width && ammo[j].y >= comets[i].y && ammo[j].y <= comets[i].y + comet.height) {
                // Draw explosion at the spot
                ctx.drawImage(explosion, comets[i].x - comet.width, comets[i].y - comet.height);

                // Delete comet from screen and add points.
                destroyComet();
            }
        }
    }
}

function draw(){
    canvas.style.display = "block";
    ctx.drawImage(bg, 0,0);

    for(let i = 0; i < meteors.length;i++){
        // Draw a meteor
        ctx.drawImage(meteor, meteors[i].x, meteors[i].y);

        meteors[i].x -= meteorsSpeed;

        if(meteors[i].x == 1200) {
            meteors.push({
                x: cWidth,
                y: Math.floor(Math.random() * ( (maxHeight-meteor.height) - minHeight) + minHeight) 
            })
        }
        // If spaceship and meteor colide
        if(shipX + ship.width >= meteors[i].x && shipX <= meteors[i].x + meteor.width && shipY + ship.height >= meteors[i].y && shipY <= meteors[i].y + meteor.height) {
            // Draw explosion at those coords.
            ctx.drawImage(explosion, meteors[i].x - meteor.width, meteors[i].y - meteor.height);

            // Delete the meteor from screen.
            destroyMeteor();

            // Deduct HP on hit.
            decreaseShipHP();

            // If spaceship HP reaches 0, end game.
            if(shipHP == 0) {
                clearInterval(game);
                endgame();
            }
        }

        // If meteor goes past the canvas width, remove.
        if(meteors[i].x + meteor.width < 0) {
            meteors.splice(meteors[i], 1);

            // Decrease earth's HP.
            decreaseEarthHP();
            
            // End game if earth is destroyed.
            if(earthHP == 0) {
                clearInterval(game);
                endgame();
            }
        }
    }
    // Increase difficulty when user reaches a certain score point.
    if(score == 3000) {
        meteorsSpeed = 2;
    }
    if (score == 6000) {
        meteorsSpeed = 4;
    }

    // Create a new meteor if all meteors on screen are destroyed.
    if(meteors.length == 0) {
        meteors.push({
            x: cWidth,
            y: Math.floor(Math.random() * ( (maxHeight-meteor.height) - minHeight) + minHeight) 
        })
    }

    // Display health renew with a timeout
    for(let i = 0; i < healthRenew.length; i++){
        ctx.drawImage(firstAid, healthRenew[i].x, healthRenew[i].y);

        // If the ship touches the health, restore the ship's HP.
        if(shipX + ship.width >= healthRenew[i].x && shipX <= healthRenew[i].x + firstAid.width && shipY + ship.height >= healthRenew[i].y && shipY <= healthRenew[i].y + firstAid.height) {
            // Remove the HP restore.
            let hpItem = healthRenew[i];
            let hpIndex = healthRenew.indexOf(hpItem);
            if(hpIndex > -1) {
                healthRenew.splice(hpIndex, 1)
            }

            // Restore ship's HP.
            restoreShipHP();
        }
        // If HP restore goes past the canvas width, remove it.
        if(healthRenew[i].x + firstAid.width < 0 ) {
            healthRenew.splice(healthRenew[i], 1);
        }
    }
    // Start moving the HP renew after a set timeout.
    setTimeout(() => {
        for(let i = 0; i < healthRenew.length; i++) {
            healthRenew[i].x--;
        }
        initialHealthPushed = true;
    }, 30 * 1000);

    // Display the comet
    for(let i = 0; i < comets.length;i++){
        ctx.drawImage(comet, comets[i].x, comets[i].y);

        // If spaceship and comet colide
        if(shipX + ship.width >= comets[i].x && shipX <= comets[i].x + comet.width && shipY + ship.height >= comets[i].y && shipY <= comets[i].y + comet.height) {
            // Draw explosion at those coords.
            ctx.drawImage(explosion, comets[i].x - comet.width, comets[i].y - comet.height);

            // Delete the meteor from screen.
            destroyComet();

            // Deduct HP on hit.
            decreaseShipHPComet();

            // If spaceship HP reaches 0, end game.
            if(shipHP == 0) {
                clearInterval(game);
                endgame();
            }
        }

        // If comet goes past the canvas width, remove.
        if(comets[i].x + comet.width < 0) {
            comets.splice(comets[i], 1);

            // Decrease earth's HP.
            decreaseEarthHPComet();
            
            // End game if earth is destroyed.
            if(earthHP == 0) {
                clearInterval(game);
                endgame();
            }
        }
    }
    // Start moving the comet after a set timeout
    setTimeout(() => {
        for(let i = 0; i < comets.length;i++){
            comets[i].x--;
        }
        initialCometPushed = true;
    }, 60 * 1000);
    // Move the ship
    if(d == "LEFT") {
        shipX -= 5;
    }
    if(d == "RIGHT"){
        shipX += 5;
    }
    if(d == "UP") {
        shipY -= 5;
    }
    if(d == "DOWN") {
        shipY += 5;
    }

    // If spaceship hits the boundry, remove the direction
    if(shipX <= 0) {
        shipX += 5;
    } else if (shipX >= 1300 - ship.width) {
        shipX -= 5;
    } else if (shipY <= 0) {
        shipY += 5;
    } else if (shipY >= 500 - ship.height) {
        shipY -= 5;
    }
    // Draw the ship
    ctx.drawImage(ship, shipX, shipY);
}

function destroyMeteor(){
    for(let j = 0; j < ammo.length; j++){
        for(let i = 0; i < meteors.length; i++) {
            // Ammo hits meteor
            let ammoDestroysMeteor = ammo[j].x >= meteors[i].x && ammo[j].x <= meteors[i].x + meteor.width && ammo[j].y >= meteors[i].y && ammo[j].y <= meteors[i].y + meteor.height;

            // Ship hits meteor
            let shipDestroysMeteor = shipX + ship.width >= meteors[i].x && shipX <= meteors[i].x + meteor.width && shipY + ship.height >= meteors[i].y && shipY <= meteors[i].y + meteor.height;

            // Destory missile if ammo destoys meteor
            if(ammoDestroysMeteor) {
                let missile = ammo[j];
                let missileIndex = ammo.indexOf(missile);
                if(missileIndex > -1) {
                    ammo.splice(missileIndex, 1);
                }
            }

            // Either the ammo destorys the meteor, or the ship.
            if(ammoDestroysMeteor || shipDestroysMeteor) {
                let item = meteors[i];
                let index = meteors.indexOf(item);
                if(index > -1) {
                    meteors.splice(index, 1);
                }
                // Update score
                score += 100;
                displayScore.textContent = score;
            }
            explosionSound.play();
            explosionSound.currentTime = 0;
        }
    }
}
function destroyComet() {
    for(let j = 0; j < ammo.length; j++) {
        for(let i = 0; i < comets.length; i++) {
            // Ammo hits meteor
            let ammoDestroysComet =  ammo[j].x >= comets[i].x && ammo[j].x <= comets[i].x + comet.width && ammo[j].y >= comets[i].y && ammo[j].y <= comets[i].y + comet.height;

            // Ship hits meteor
            let shipDestroysComet = shipX + ship.width >= comets[i].x && shipX <= comets[i].x + comet.width && shipY + ship.height >= comets[i].y && shipY <= comets[i].y + comet.height;

            // Destory missile if ammo destoys meteor
            if(ammoDestroysComet) {
                let missile = ammo[j];
                let missileIndex = ammo.indexOf(missile);
                if(missileIndex > -1) {
                    ammo.splice(missileIndex, 1);
                }
            }

            // Either the ammo destorys the meteor, or the ship.
            if(ammoDestroysComet || shipDestroysComet) {
                let item = comets[i];
                let index = comets.indexOf(item);
                if(index > -1) {
                    comets.splice(index, 1);
                }
                // Update score
                score += 500;
                displayScore.textContent = score;
            }
            explosionSound.play();
            explosionSound.currentTime = 0;
        }
    }
}
function decreaseShipHP()   {
    shipHP = shipHP - 20;
    displayShipHP.style.width = `${shipHP}%`;
}

function restoreShipHP() {   
    if(shipHP == 100) {
        shipHP = shipHP;
    } else {
        shipHP = shipHP + 20;
        displayShipHP.style.width = `${shipHP}%`;
    }
}
function decreaseEarthHP() {
    earthHP = earthHP  - 20;
    displayEarthHP.style.width = `${earthHP}%`;
}

function decreaseShipHPComet(){
    shipHP = shipHP - 40;
    displayShipHP.style.width = `${shipHP}%`;
}
function decreaseEarthHPComet(){
    earthHP = earthHP - 40;
    displayEarthHP.style.width = `${earthHP}%`;
}

function endgame(){
    const gameOver = document.querySelector(".game--over");
    
    gameOver.style.display = "block";
    // If earth was destroyed, show a different image.
    if(earthHP == 0) {
        displayImage.src = "images/destroyed-planet.svg";
        message.textContent = "You have failed every citizen of the Earth. The earth was destroyed thanks to you n00b."
    } else {
        displayImage.src = "images/gravestone.svg";
        message.textContent = "Thank you for your service. At least you tried.";
    }
}

// Health renew callback function to push into the array
function healthRenewFunction() {
    if(initialHealthPushed == true) {
        setTimeout(() => {
            healthRenew.push({
                x: cWidth,
                y: Math.floor(Math.random() * ( (maxHeight - firstAid.height) - minHeight) + minHeight)
            })
        
            healthRenewFunction();
        }, 30 * 1000);
    } else {
        setTimeout(() => {
            healthRenewFunction();
        }, 30 * 1000);
    }
}
healthRenewFunction();

// Comet for bonus points (500 points) spawn each minute
function spawnComet(){
    if(initialCometPushed == true) {
        setTimeout(() => {
            comets.push({
                x: cWidth,
                y: Math.floor(Math.random() * ( (maxHeight - comet.height) - minHeight) + minHeight)
            })
            spawnComet();
        }, 60 * 1000);
    } else {
        setTimeout(() => {
            spawnComet();
        }, 60 * 1000);
    }
}
spawnComet();


// Exit game
document.querySelector("#exitGame").addEventListener("click", ()=>{
    location.reload();
})

// Event listeners
document.addEventListener("keydown", shipCommands);
document.addEventListener("keyup", testShipCommands);
document.querySelector("#startGame").addEventListener("click", startGame);
document.addEventListener("keyup", shoot);



