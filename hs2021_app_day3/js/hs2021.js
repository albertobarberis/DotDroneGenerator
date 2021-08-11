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
    if(mouseY < 0) return; // exit if the mouse is out of the canvas OR the user is pressing "L"

    let newDot = new Dot(mouseX,mouseY); // create the Dot calling the constructor of the class
    arrayOfDots.push(newDot); // put the Dot in the array of Dots
}

function draw(){ // this is the draw function of the p5.js calle dto draw on the canvas
    clear(); // clear the canvas
    fill('rgba(255,0,0,0.3)'); // the color of the Dot: red with alpha
    strokeWeight(2); // the weight of the border of the elements

    for(let i=0; i<arrayOfDots.length; i++){ // draw each Dot in the array
        let currentDot = arrayOfDots[i];

        ellipse(currentDot.x, currentDot.y, currentDot.dimension, currentDot.dimension); // draw a circle 
    } 
} 