/** ///////////////////////////////////////////////////////////////////////
  * GLOBAL CONSTANT AND VARIABLES
    * definition
    * initialization
* /////////////////////////////////////////////////////////////////////// */

const MIN_FREQUENCY_HZ = 5; // min frequency in the x axis
const MAX_FREQUENCY_HZ = 3000; // max frequency in the x axis
const MIN_AMPLITUDE = 0.01; // min amplitude in the y axis
const MAX_AMPLITUDE = 0.5; // max amplitude in the y axis (never higher that 0.5)
const CANVAS_OFFSET = 100; // offset for the canvas
const TITLE_OFFSET = 75; // sum of text + padding of title and paragraph
const MASTER_GAIN = 0.01; // gain adaptation
const MODULATION_INDEX = 1000; // index of modulation for the FM
const MIN_AM_FREQ = 0.05; // min freq for the AM oscillator
const MAX_AM_FREQ = 0.5; // mas freq for the AM oscillator (never higher that 0.5)
const ATTACK_TIME = 1.6; // attack time for sounds
const RELEASE_TIME = 0.3; // release time for sounds
const MIN_DIAMETER = 10; // release time for sounds
const MAX_DIAMETER = 100; // release time for sounds

let audioContext; // variable that will store the audio context
let masterGain; // a Gain Node for the MASTER volume
let arrayOfDots = []; // array of Dots (oscillators)
let modulator = null; // variable that will contain the modulator oscillator (initialized to null)
let carrier = null; // variable that will contain the carrier oscillator (initialized to null)


/** ///////////////////////////////////////////////////////////////////////
  * SUPPORT FUNCTIONS
    * definition
* /////////////////////////////////////////////////////////////////////// */

function startAudio(){ // audio to start when the first dot is created
    audioContext = new AudioContext(); // create an audiocontext
    masterGain = audioContext.createGain(); // create a gian Node for the master gain 
    masterGain.gain.value = MASTER_GAIN; // set the level of the master gain (gain adaptation)
    masterGain.connect(audioContext.destination); // connect the master gain to the destination
}

function deleteModulatorCarrier(){
    modulator = null; // remove the object from the variable modulator
    carrier = null; // remove the object from the variable carrier
}

function deleteDot(currentDot){ // this is a recursive function that delete a dot from the array
    let indexToDelete = arrayOfDots.indexOf(currentDot); // fetch the index of the Object
    if(indexToDelete == -1) return;
    console.log(indexToDelete);

    currentDot.mainOscGain.gain.setTargetAtTime(0, audioContext.currentTime, RELEASE_TIME); // set to 0 the main osc Gain
    currentDot.AMoscGain.gain.setTargetAtTime(0, audioContext.currentTime, RELEASE_TIME); // set to 0 the AM osc Gain

    let modulator = currentDot.connections[0]; // store in a variable the modulator associated to the Object
    let carrier = currentDot.connections[1]; // store in a variable the carrier associated to the Object

    arrayOfDots.splice(indexToDelete, 1); // remove the Object from the array
    
    if(modulator && !carrier){ // if only the modulator exists delete also the modulator
        modulator.connections[1] = null;
        deleteDot(modulator); // recursion of the same function
    } else if (modulator && carrier){ // if both the modulator and the carrier exists delete both
        modulator.connections[1] = null;
        carrier.connections[0] = null;
        deleteDot(modulator); 
        deleteDot(carrier);
    } else if (!modulator && carrier){ // if only the carrier exists delete also the carrier
        carrier.connections[0] = null;
        deleteDot(carrier); 
    }
}

function applyFM(modulator, carrier){ // function that activate the FM synthesis
    modulator.FMoscGain.connect(carrier.mainOsc.frequency); // connect the FMoscGain to the frequency of the carrier main Oscillator (this is the FM)
    modulator.FMoscGain.gain.setTargetAtTime(MODULATION_INDEX, audioContext.currentTime , ATTACK_TIME); // set the FMoscGain to the modulation index value
}

/** ///////////////////////////////////////////////////////////////////////
  * CLASS DOT
    * a Dot is an oscillator
* /////////////////////////////////////////////////////////////////////// */

class Dot{
    constructor(x,y){
        
        this.x = x; // x position of the Dot (associated to frequency in Hz)
        this.y = y; // y position of the Dot (associated to amplitude)

        /** array of the possible connections to a Dot
         * connections[0] is the possible Dot object (modulator) connected to this dot 
         * connections[1] is the possible Dot object (carrier) connected to this dot 
         */
        this.connections = [null, null];  

        // define amplitude and frequency of the associated sinusoid
        this.freq = map(this.x, 0, windowWidth, MIN_FREQUENCY_HZ, MAX_FREQUENCY_HZ);
        this.amp = map(this.y, windowHeight - CANVAS_OFFSET, 0, MIN_AMPLITUDE, MAX_AMPLITUDE);
    
        // set the dimension of the circle associated to this Dot
        this.dimension = map(this.freq, MAX_FREQUENCY_HZ, MIN_FREQUENCY_HZ, MAX_DIAMETER, MIN_DIAMETER);

        // the main oscillator (sinusoid)
        this.mainOsc = audioContext.createOscillator(); // create the oscillator Node
        this.mainOsc.type = "sine"; // definte the type
        this.mainOsc.frequency.value = this.freq; // set the frequency
        this.mainOsc.start(audioContext.currentTime); // start the oscillator

        // the amplitude oscillator (triangle) for AM
        this.AMosc = audioContext.createOscillator(); // create the oscillator Node
        this.AMosc.type = "triangle"; // definte the type 
        this.AMosc.frequency.value = random(MAX_AM_FREQ) + MIN_AM_FREQ; // set the frequency
        this.AMosc.start(audioContext.currentTime); // start the oscillator

        // create the gain Nodes
        this.mainOscGain = audioContext.createGain(); // gain Node for the main Oscillator
        this.mainOscGain.gain.value = 0; // set the initial gain to 0

        this.AMoscGain = audioContext.createGain(); // gain Node for the AM Oscillator
        this.AMoscGain.gain.value = 0; // set the initial gain to 0; it will be from 0 to 2*this.amp (-1 1)*this.amp 

        this.FMoscGain = audioContext.createGain(); // gain Node for the FM Oscillator (if it is used as modulator) : this is the modulation INDEX
        this.FMoscGain.gain.value = 0; // set the initial gain to 0

        // the connections
        this.mainOsc.connect(this.mainOscGain); // connect the main oscillator to its gain 
        this.mainOscGain.connect(masterGain); // connect the main oscillator to the master gain 
        this.AMosc.connect(this.AMoscGain); // connect the AM oscillator to its gain 
        this.AMoscGain.connect(this.mainOscGain.gain); // connect the AM oscillator gain to the main oscillator gain (amplitude modulation)
        this.mainOsc.connect(this.FMoscGain); // connect the main Osc to the FM oscillator gain (in the case this will be used as modulator)
        
        // set the main oscillator gain and the AM oscillator gain to to the amplitude in a certain attack time
        this.mainOscGain.gain.setTargetAtTime(this.amp, audioContext.currentTime, ATTACK_TIME); 
        this.AMoscGain.gain.setTargetAtTime(this.amp, audioContext.currentTime, ATTACK_TIME);
    }
}


/** ///////////////////////////////////////////////////////////////////////
  * P5.JS FUNCTIONS
    * definition
* /////////////////////////////////////////////////////////////////////// */

function setup() { // create the canvas in the windows with an offset
    createCanvas(windowWidth, windowHeight - CANVAS_OFFSET);
}

function windowResized() { // resize the canvas if the user changes the window size
    resizeCanvas(windowWidth, windowHeight - CANVAS_OFFSET);
}

function mousePressed() { // functtion called if the mouse is pressed
    if(!audioContext){ startAudio(); } // if the audio context still does not exists create it
    if(mouseY < 0 || keyIsDown(76)) return; // exit if the mouse is out of the canvas OR the user is pressing "L"

    for(let i=0; i < arrayOfDots.length; i++){ // check if the mouse is pressed in an existing Dot; if so delete it 
        
        let currentDot = arrayOfDots[i];
        let d = dist(currentDot.x, currentDot.y, mouseX, mouseY); // calculate the distance between the current Dot center and the mouse position
        
        if(d < currentDot.dimension/2){ // if pressing on an existing Dot (and key 'L' is not down)
            deleteDot(currentDot); // delete the Dot
            return;
        }
    }

    let newDot = new Dot(mouseX,mouseY); // create the Dot calling the constructor of the class
    arrayOfDots.push(newDot); // put the Dot in the array of Dots
}

function mouseDragged() { // function called if the mouse is dragged (for the FM synthesis)
    if(!keyIsDown(76)) return; // exit from the function if is not pressed the key 'L'
    
    for(let i=0; i<arrayOfDots.length; i++){
        let currentDot = arrayOfDots[i];
        let d = dist(currentDot.x, currentDot.y, mouseX, mouseY); // calculate the distance between the current Dot center and the mouse position
        /**
         * if there is not a modulator and not a carrier 
         * and the mouse is on a Dot 
         * and that Dot does not already have a carrier;
         *      set the Dot as a modulator
         */
        if(!modulator && !carrier && d<currentDot.dimension/2 && !currentDot.connections[1] ) {
            modulator = currentDot;
            break; // exit from the for loop
        } 
        /**
         * else if there is a modulator but not a carrier 
         * and the mouse is on a Dot 
         * and that Dot does not already have a modulator 
         * and the current index of the loop is not the one of the modulator
         *      set the Dot as a carrier
         *      assign the carrier to the modulator
         *      assign the modulator to the carrier
         *      and apply the FM
         */
        else if(modulator && !carrier && d<currentDot.dimension/2 && !currentDot.connections[0] && arrayOfDots.indexOf(modulator)!=i){
            carrier = currentDot;
            modulator.connections[1] = carrier;
            carrier.connections[0] = modulator;
            applyFM(modulator, carrier);
            break; // exit from the for loop
        } 
    }
}

// when the mouse is released or a key is released delete the stored modulator and carrier
function mouseRealeased() { deleteModulatorCarrier(); }
function keyReleased(){ deleteModulatorCarrier(); }

function draw(){ // this is the draw function of the p5.js calle dto draw on the canvas
    clear(); // clear the canvas
    fill('rgba(255,0,0,0.3)'); // the color of the Dot: red with alpha
    strokeWeight(2); // the weight of the border of the elements

    for(let i=0; i<arrayOfDots.length; i++){ // draw each Dot in the array
        let currentDot = arrayOfDots[i];

        ellipse(currentDot.x, currentDot.y, currentDot.dimension, currentDot.dimension); // draw a circle 

        let carrier = currentDot.connections[1]; // the carrier of the current Dot
        if(carrier){ // if the carrier exists draw a line between the modulator (current Dot) and the carrier
            line(currentDot.x, currentDot.y, carrier.x, carrier.y);// draw the line
        }
    } 
} 