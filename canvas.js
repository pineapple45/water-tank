const cleanBtn = document.getElementById('clean-btn');
const removeCharcoalBtn = document.getElementById('remove-charcoal-btn');
const purityMarker = document.getElementById('purity-concentration-marker');
const charcoalMarker = document.getElementById('charcoal-concentration-marker');
const canvas  = document.querySelector('canvas');
const c = canvas.getContext('2d');
// document.querySelector('body').append(img)

if(innerWidth < 700){
    canvas.width = innerWidth-20;
    canvas.height = innerHeight*0.7;
}else{
    canvas.width = innerWidth-20;
    canvas.height = innerHeight*0.9;
}

canvas.onselectstart = function () { return false; }
function gradientGenerator(){
    let my_gradient = c.createLinearGradient(0, 0, 0, 1200);
    my_gradient.addColorStop(0, "#0082c8");
    my_gradient.addColorStop(1, "white");
    c.fillStyle = my_gradient;
    c.fillRect(0, 0, canvas.width, canvas.height);
}

let colors = [
    '#a7ff83',
    '#ec1c24',
    '#ff8400',
    '#071a52'
]

let mouse = {
    x: undefined,
    y: undefined
}

cleanBtn.addEventListener('click',() =>{
    startCleaningProcess();
})

removeCharcoalBtn.addEventListener('click',() =>{
    charcoalBallsArray = [];
})

addEventListener('resize',() =>{
    if(innerWidth < 600){
        canvas.width = innerWidth-20;
        canvas.height = innerHeight*0.7;
    }else{
        canvas.width = innerWidth-20;
        canvas.height = innerHeight*0.9;
    }

    init();
})

canvas.addEventListener('mousedown',(e) =>{
    mouse.x = e.x;
    mouse.y = e.y;

    generateMolecules();
})

canvas.addEventListener('mouseup',(e) =>{
    mouse.x = undefined;
    mouse.y = undefined;
})


function randomIntFromRange(min,max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomColors(){
  let k = Math.floor(Math.random()*colors.length);
  return colors[k];
}

function collisionDist(x1,y1,x2,y2){
    let xDist = x2-x1;
    let yDist = y2-y1;

    return Math.sqrt(Math.pow(xDist,2)+Math.pow(yDist,2));
}


function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}


function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}


class Molecule{
    constructor(x,y,velocity,radius,color){
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.mass = 2;
    }

    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        let my_gradient = c.createLinearGradient(0, 0, 0, 1500);
        my_gradient.addColorStop(0, this.color);
        my_gradient.addColorStop(1, "white");
        c.fillStyle = my_gradient;
        c.fill();
        c.closePath();
    }

    drawCharcoalBall(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        let my_gradient = c.createLinearGradient(0, 0, 0, 1500);
        my_gradient.addColorStop(0, this.color);
        my_gradient.addColorStop(1, "white");
        c.fillStyle = my_gradient;
        c.fill();
        c.strokeStyle = 'red';
        c.stroke();
        c.closePath();
    }

    update(){
        if(this.x+this.radius >= canvas.width || this.x-this.radius <= 0){
            this.velocity.x = -this.velocity.x;
        }

        if(this.y+this.radius >= canvas.height || this.y-this.radius <= 0){
            this.velocity.y = -this.velocity.y;
        }        

        moleculeArray.forEach(molecule =>{
            if(this !== molecule){
                let collisionDistVal = collisionDist(this.x,this.y,molecule.x,molecule.y);
                if(collisionDistVal - (this.radius+molecule.radius) < 0){
                    resolveCollision(this,molecule);
                }
            }
        })        

      
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.draw();
    }

    updateCharcoalBall(){
        if(this.x+this.radius >= canvas.width || this.x-this.radius <= 0){
            this.velocity.x = -this.velocity.x;
        }

        if(this.y+this.radius >= canvas.height || this.y-this.radius <= 0){
            this.velocity.y = -this.velocity.y;
        }        

        charcoalBallsArray.forEach((ball,index) =>{
            if(this !== ball){
                let collisionDistVal = collisionDist(this.x,this.y,ball.x,ball.y);
                if(collisionDistVal - (this.radius+ball.radius) < 0){
                    resolveCollision(this,ball);
                }
            }


            moleculeArray.forEach((molecule,i) =>{
                let collisionDistVal = collisionDist(this.x,this.y,molecule.x,molecule.y);
                if(collisionDistVal - (this.radius+molecule.radius) < 0){
                    if(i<startingMolecules){
                        resolveCollision(this,molecule)
                    }
                    else{
                        if(this.radius < 20){
                            moleculeArray.splice(i,1);
                            this.radius += 1;
                        }
                        else{
                            charcoalBallsArray.splice(index,1);
                        }
                    }
                }
            })

        })        
      
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.drawCharcoalBall();
    }
}


let molecule;
let moleculeArray = [];
let charcoalBallsArray = [];
let startingMolecules;

let purityConcentrationValue = 0;
let charcoalConcentrationValue = 0;


function init(){
    moleculeArray = [];
    startingMolecules = 30;
    for(i = 0;i < startingMolecules; i++){
        let radius = randomIntFromRange(5,20);
        let x = randomIntFromRange(radius , canvas.width - radius);
        let y = randomIntFromRange(radius , canvas.height - radius);
        let velocity = {
            x: Math.random(),
            y: Math.random() 
        }

        if( i !== 0){
            for(let j=0; j < moleculeArray.length; j++){
                if(collisionDist(x,y,moleculeArray[j].x,moleculeArray[j].y) - radius - moleculeArray[j].radius < 0){
                    x = Math.random() * canvas.width;
                    y = Math.random() * canvas.height;

                    j = -1;
                }
            }
        }

        moleculeArray.push(new Molecule(x,y,velocity,radius,'blue'));
    }
}

function generateMolecules(){
    for(i = 0;i < randomIntFromRange(1,5); i++){
        let radius = randomIntFromRange(5,20);

        let x = mouse.x;
        let y = mouse.y
        let velocity = {
            x: randomIntFromRange(-8,8),
            y: randomIntFromRange(-8,8) 
        }

        moleculeArray.push(new Molecule(x,y,velocity,radius,getRandomColors()));
    }
}

function startCleaningProcess(){
    for(i = 0;i < 5; i++){
        let radius = 10;
        let genX = 50;
        let genY = 50;
        let velocity = {
            x: Math.random() * randomIntFromRange(3,8) ,
            y: Math.random() * randomIntFromRange(3,8)
        }
        charcoalBallsArray.push(new Molecule(genX,genY,velocity,radius,'black'));
    }
}


function animate(){
    requestAnimationFrame(animate);
    gradientGenerator();

    moleculeArray.forEach(molecule =>{
        molecule.update();
    })

    charcoalBallsArray.forEach(ball =>{
        ball.updateCharcoalBall();
    })

    purityMarker.innerHTML = 'Impurity Concentration: ' + (moleculeArray.length - startingMolecules);
    charcoalMarker.innerHTML = 'Charcoal Concentration: ' + charcoalBallsArray.length;
}

gradientGenerator();
init();
animate();
