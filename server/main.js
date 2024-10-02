import { Meteor } from "meteor/meteor"
import { streamer } from "../both/streamer.js"

const description = "Test de performance de la connection DDP. On teste d'utiliser la réactivité meteor out of the box pour voir si c'est crédible avec x pointeurs de souris en temps réél."
let eventQueue = []
let pointers = []
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
  console.log(message)
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

function createPointer(id) {
  let newPointer = { id: id, coords: { x: 50, y: 50 } }
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
