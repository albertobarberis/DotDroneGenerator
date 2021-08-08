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
   // to be implemented
}

function deleteModulatorCarrier(){
  // to be implemented
}

function deleteDot(currentDot){ // this is a recursive function that delete a dot from the array
    // to be implemented
}

function applyFM(modulator, carrier){ // function that activate the FM synthesis
    // to be implemented
}

/** ///////////////////////////////////////////////////////////////////////
  * CLASS DOT
    * a Dot is an oscillator
* /////////////////////////////////////////////////////////////////////// */

class Dot{
   // to be implemented
}


/** ///////////////////////////////////////////////////////////////////////
  * P5.JS FUNCTIONS
    * definition
* /////////////////////////////////////////////////////////////////////// */

function setup() { // create the canvas in the windows with an offset
   // to be implemented
}

function windowResized() { // resize the canvas if the user changes the window size
   // to be implemented
}

function mousePressed() { // functtion called if the mouse is pressed
   // to be implemented
}

function mouseDragged() { // function called if the mouse is dragged (for the FM synthesis)
  // to be implemented
}

// when the mouse is released or a key is released delete the stored modulator and carrier
function mouseRealeased() { 
    // to be implemented
}
function keyReleased(){ 
    // to be implemented
}

function draw(){ // this is the draw function of the p5.js calle dto draw on the canvas
   // to be implemented
} 