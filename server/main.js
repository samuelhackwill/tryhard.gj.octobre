import { Meteor } from "meteor/meteor"
import { streamer } from "../both/streamer.js"
import { lerp, peakAtHalf } from "../both/math-helpers.js"
import { ValueNoise } from 'value-noise-js';
const noise = new ValueNoise();
import { sendToSides, circleRoutine } from "../server/bots.js"

const description = "Test de performance de la connection DDP. On teste d'utiliser la réactivité meteor out of the box pour voir si c'est crédible avec x pointeurs de souris en temps réél."
let eventQueue = []
let pointers = []
let bots = []
let universeDimensions = { width: 0, height: 0 }

WebApp.connectHandlers.use("/api/hello", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*") // Allow all origins (use specific domains for more security)
  res.setHeader("Content-Type", "text/plain")

  res.write(description)
  res.end()
})

streamer.allowRead("all")
streamer.allowWrite("all")

streamer.on("pointerMessage", function (message) {
  eventQueue.push(message);
})

streamer.on("showInit", function (message) {
  universeDimensions.width = message.width
  universeDimensions.height = message.height

  //Bots proof-of-concept
  /*for(let i = 0; i < 100; i++)
  {
    let bot = createPointer("bot" + (bots.length + 1), true)
    bot.seed = i; //It's useful to have a somewhat-unique number for bots, as a random seed for AI movement
    bots.push(bot);
  }
  sendToSides(bots, universeDimensions);
  circleRoutine(bots);
  */
})

Meteor.startup(async () => {
  console.log("nuking all clients ")
  pointers = []
  eventQueue = []

  Meteor.setInterval(step, (1 / 60.0) * 1000)
})

function step() {
  //Process the event queue
  eventQueue.forEach((e) => {
    let pointer = pointers.find((p) => p.id == e.loggerId)

    //We don't know this pointer yet.
    //Welcome!
    if (pointer == undefined) {
      pointer = createPointer(e.loggerId)
    }
    
    if(e.type == "move") {
      //TODO: Rewrite this using a single vector-type param (eg pointer.move(e.coords))
      pointer.coords.x += e.coords.x;
      pointer.coords.y += e.coords.y;
    } else if (e.type == "mousedown") {
      if(!pointer.isDown) pointer.mousedown = true;
      pointer.isDown = true;
    } else if (e.type == "mouseup") {
      if(pointer.isDown) pointer.mouseup = true;
      pointer.isDown = false;
    }
    
    pointer.dirty = true;
  });
  eventQueue = []

  //Filters
  //pointers = pointers.map((p) => applyGravity(p))
  pointers = pointers.map((p) => stepEventQueue(p)) //Step the internal event queue of each pointer
  pointers = pointers.map((p) => clampPositionToUniverseBounds(p))

  ////////

  let updateInstructions = {
    pointers: pointers.filter((p) => p.dirty),
  }

  streamer.emit("displayMessage", updateInstructions)

  pointers = pointers.map(p => {
    p.dirty = false
    p.mousedown = false
    p.mouseup = false
    return p
  })
} 

function createPointer(id, bot=false) {
  let newPointer = {
    id: id,
    coords:{x:0, y:0},
    bot: bot,
    events: [],
  }
  pointers.push(newPointer)
  return newPointer
}

function clampPositionToUniverseBounds(p) {
  let dirty = false
  if (p.coords.x < 0) {
    p.coords.x = 0
    dirty = true
  }
  if (p.coords.y < 0) {
    p.coords.y = 0
    dirty = true
  }
  if (p.coords.x > universeDimensions.width) {
    p.coords.x = universeDimensions.width
    dirty = true
  }
  if (p.coords.y > universeDimensions.height) {
    p.coords.y = universeDimensions.height
    dirty = true
  }
  return p
}

function applyGravity(p, deltaTime) {
  p.coords.y += 300 / 60.0
  p.dirty = true
  return p
}

function stepEventQueue(pointer) {
  //Early return if there's no event to step
  if(pointer.events.length == 0) return pointer;

  //Get the first event in the queue
  let event = pointer.events.shift();

  //Keep track of the elapsed time during this event (set it to 0 to start)
  if(!event.elapsed) event.elapsed = 0;
  //Step it by a frame each frame (assuming constant 60fps)
  event.elapsed += 1000/60.0;

  //Use t as a shorthand for the relative time elapsed in this event
  //t=0 at the start of the animation,
  //t=1 at the end of the animation
  let t = event.elapsed/event.duration;

  //Process the event, based on its type.
  //We probably want to do something based on event.elapsezd
  switch(event.type) {
    case "wait":
      //console.log("waiting " + ((event.elapsed/event.duration) * 100) + "%")
    break;
    case "move":
      //Use the current coordinates for `from` and `to` if they have not been specified 
      if(event.from == null) event.from = {...pointer.coords}
      if(event.to == null) event.to = {...pointer.coords}
      //The position of the cursor at `t` is a linear interpolation between `from` and `to`
      pointer.coords.x = lerp(event.from.x, event.to.x, t)
      pointer.coords.y = lerp(event.from.y, event.to.y, t)
      pointer.dirty = true
    break;
    case "humanizedMove":
      //Use the current coordinates for `from` and `to` if they have not been specified 
      if(event.from == null) event.from = {...pointer.coords}
      if(event.to == null) event.to = {...pointer.coords}

      //Positional offset: move the pointer around the desired position
      let offset = {x:0, y:0}
      let offsetAmp = event.offsetAmp ?? 20.0 //Amplitude of the offset, how far it's allowed to deviate from its normal position, in pixels
      let offsetRate = event.offsetRate ?? 3 //Variation rate: how quickly the values can change
      //Sample a noise function to get an amount between 0 and 1,
      // and scale that to [-offsetAmp/2, offsetAmp/2]
      offset.x = noise.evalXY(t * offsetRate, pointer.seed) * offsetAmp - offsetAmp/2.0
      offset.y = noise.evalXY(t * offsetRate, pointer.seed + 10) * offsetAmp - offsetAmp/2.0

      //Temporal offset: randomize the current time in the animation (creating a sort of wonky easing function)
      let delay = {x:0, y:0}
      let delayAmp = event.delayAmp ?? 0.2; //How much to deviate from normal time (on the relative time scale, where 0 is start and 1 is end)
      let delayRate = event.delayRate ?? 5; //Variation rate: how quickly the values can change
      delay.x = noise.evalXY(t * delayRate, pointer.seed) * delayAmp - delayAmp/2.0
      delay.y = noise.evalXY(t * delayRate, pointer.seed + 10) * delayAmp - delayAmp/2.0

      //Tone down the randomization near the start and end positions
      let attenuation = peakAtHalf(t);
      offset.y *= attenuation
      offset.x *= attenuation
      delay.x *= attenuation
      delay.y *= attenuation

      //The position of the cursor at `t` is a linear interpolation between `from` and `to`,
      //- except `t` is randomly delayed forward or backward a bit,
      //- and the position is offset by a small amount,
      //both of which vary along the path.
      //Not so linear after all.
      pointer.coords.x = lerp(event.from.x, event.to.x, t + delay.x) + offset.x
      pointer.coords.y = lerp(event.from.y, event.to.y, t + delay.y) + offset.y

      pointer.dirty = true
    break;
  }

  //If the event isn't finished, replace in the queue, to be further consumed next frame
  if(event.elapsed < event.duration) {
    pointer.events.unshift(event)
  }
  return pointer
}