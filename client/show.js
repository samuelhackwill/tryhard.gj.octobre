import { Template } from "meteor/templating"
import { ReactiveDict } from "meteor/reactive-dict"
import { streamer } from "../both/streamer.js"
import { FlowRouter } from "meteor/ostrio:flow-router-extra"
import { getRandomBossAccessory, getRandomAccessory } from "./dressup.js"
import { getRandomTree } from "./trees.js"
import { stepper } from "./stepper.js"
import { sendToSides, circleRoutine, dressupAnimation, killAnimation, treePickUpAnimation } from "./bots.js"

import "./components/main.js"
import "./show.html"

import { states, events, transition, triggers } from "./FSMs/showFSM.js"
import { GlobalEvents, GlobalEvent } from "./FSMs/globalEvents.js"

let eventQueue = []
let pointers = []
let bots = []

Template.show.onCreated(function () {
  this.currentState = new ReactiveVar(states.INITIAL)
  this.areNamesHidden = new ReactiveVar(true)
  this.plantedTrees = new ReactiveDict()
  // Initialize the reactive dictionary to keep track of each client's pointer position.
  this.pointers = new ReactiveDict()

  this.windowBoundaries = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - 60 }

  // fuuuuu
  // ux state for windows
  this.isAdminOpen = new ReactiveVar(false)
  this.adminPosition = new ReactiveVar([0, 0])

  // make instance callable from everywhere
  instance = this

  //Start the stepper at a fixed framerate (60fps)
  this.stepInterval = Meteor.setInterval(
    stepper.bind(this, [checkHover, checkBufferedClick]), //Call stepper, passing `this` as the context, and an array of callbacks to call on each pointer every frame
    (1 / 60.0) * 1000 //60 frames per second <=> (1000/60)ms per frame
  )
  //Listen to logger events (one message whenever a pointer moves or clicks)
  streamer.on("pointerMessage", handlePointerMessage)

  //Create 96 bots
  this.bots = [] //Keep the array of bots on hand, it's easier than filtering this.pointers every time
  for (let i = 0; i < 96; i++) {
    let bot = createBot("bot" + i)
    this.pointers.set(bot.id, bot)
    bots.push(bot)
  }
  //Keep this around: it gives bots a home position
  sendToSides(bots, this.windowBoundaries)
  bots.forEach((b) => this.pointers.set(b.id, b))
})
Template.show.onDestroyed(function () {
  //Stop the stepper
  clearInterval(this.stepInterval)
  //Stop listening to logger events
  streamer.removeAllListeners("pointerMessage")
  pointers = []
})
Template.show.onRendered(function () {
  streamer.emit("showInit", { width: window.innerWidth, height: window.innerHeight })

  this.autorun(() => {
    // console.log("show RE-RENDERING because of global event : ", GlobalEvent.get())

    if (!GlobalEvent.get()) {
      return
    } else {
      // global events should always have the value
      // of the key of a local FSM event.
      // got it?

      // so for instance, if we want to trigger a transition
      // to Acte1s2 (showFSM > events.goToA1s2)
      // we should call a global event using the key
      // GlobalEvents.goToAIs2

      key = GlobalEvent.get()
      console.log("GlobalEvents[key] ", GlobalEvents[key])
      transition(GlobalEvents[key], this)
      GlobalEvent.set(null)
    }
  })
})
function handlePointerMessage(message) {
  let pointer = instance.pointers.get(message.loggerId)

  //We don't know this pointer yet.
  //Welcome!
  if (pointer == undefined) {
    pointer = createPointer(message.loggerId)
  }

  if (message.type == "move" && !pointer.locked) {
    //Move messages are relative (e.g. 1px right, 2px down)
    //Apply that change to the coords
    pointer.coords.x += message.coords.x
    pointer.coords.y += message.coords.y
    //Save the pointer
    instance.pointers.set(pointer.id, pointer)
  } else if (message.type == "mousedown") {
    simulateMouseDown(pointer)
  } else if (message.type == "mouseup") {
    simulateMouseUp(pointer)
  }
}

Template.show.helpers({
  areNamesHidden() {
    if (Template.instance().areNamesHidden.get() === true) {
      return "opacity-0"
    } else {
      return "opacity-1"
    }
  },
  // Get all client pointers for iteration if you want to display all.
  allPointers(arg) {
    if (arg.hash.getAdmin === true) {
      // the pointer with ?id=samuel is the boss!
      pointer = instance.pointers.get("samuel")
      if (pointer == undefined) {
        return
      } else {
        return [pointer]
      }
    } else {
      allPointers = instance.pointers.all()
      const { samuel, ...userData } = allPointers
      pointers = Object.values(userData)
      return pointers
    }
  },
  allPlantedTrees() {
    return Object.values(instance.plantedTrees.all())
  },
  showState() {
    return [Template.instance().currentState.get()]
  },
  isAdmin() {
    return true
  },
})

Template.show.events({
  "click #background"(event, tpl, extra) {
    if (!extra) return
    let pointer = instance.pointers.get(extra.pointer.id)

    if (extra.pointer.id == "samuel") {
      tpl.isAdminOpen.set(false)
    }

    //Does the pointer currently hold a tree?
    if (pointer.tree) {
      //Make up a new tree identifier (they're sequential)
      let newTreeId = "tree-" + Object.keys(instance.plantedTrees.all()).length
      //Add that tree to the reactive plantedTrees dictionary, so it can appear on the page
      instance.plantedTrees.set(newTreeId, { coords: pointer.coords, tree: pointer.tree })
      //The pointer no longer holds a tree
      pointer.tree = null
      instance.pointers.set(pointer.id, pointer)
    }
  },
  "click button"() {
    // note that the REAL pointer of localhost will be able to natively trigger this event as well as simulated clicks. (which is good for testing i guess)
    console.log("SHOW.JS button clicked. ", this)
  },
  "click .pointer"(event, tpl, extra) {
    //Boss "kill on click" behaviour
    if (extra.pointer.id == "samuel") {
      //We're a pointer clicking on another pointer (the _pointee_)
      let pointeeId = event.target.getAttribute("pointer-id")
      let pointee = instance.pointers.get(pointeeId)
      killAnimation(pointee)
      instance.pointers.set(pointee.id, pointee)
    }
  },
  "click #folderVestiaire"(event, tpl, extra) {
    if (!extra) return //No extra data was provided: we don't know which pointer clicked?
    let pointer = instance.pointers.get(extra.pointer.id)
    //Don't let locked pointers change their accessories
    if (pointer.locked) return

    //Clear the event queue (this helps bot dress up immediately, humans probably don't have events)
    pointer.events = []

    if (pointer.id == "samuel") {
      dressupAnimation(pointer, getRandomBossAccessory())
    } else {
      dressupAnimation(pointer, getRandomAccessory())
    }

    instance.pointers.set(pointer.id, pointer)
  },
  "click #folderTrees"(event, tpl, extra) {
    if (!extra) return //No extra data was provided: we don't know which pointer clicked?
    let pointer = instance.pointers.get(extra.pointer.id)

    //Don't let locked pointers change their accessories
    if (pointer.locked) return

    treePickUpAnimation(pointer, getRandomTree())

    instance.pointers.set(pointer.id, pointer)
  },
  "click #folderAdmin"(event, tpl, extra) {
    if (extra) {
      instance.adminPosition.set([extra.pointer.coords.x, extra.pointer.coords.y])
    } else {
      instance.adminPosition.set([event.pageX, event.pageY])
    }
    GlobalEvent.set(GlobalEvents.OUVRIR_LA_FNET)
  },
})

simulateMouseUp = function (pointer) {
  const elements = getElementsUnder(pointer)
  if (elements.length == 0) return

  elements.forEach(e => e.classList.remove("clicked"));
}

simulateMouseDown = function (pointer) {
  const elements = getElementsUnder(pointer)
  if (elements.length == 0) return
  elements.forEach(element => {
    // we need to restrict clicks on privileged buttons, like the admin buttons
    // so that only samuel can click on them.
    if (element.classList.contains("privileged") && pointer.id != "samuel") {
      return
    }

    //Trigger a jQuery click event with extra data (the pointer)
    $(element).trigger("click", { pointer: pointer })
    element.classList.remove("clicked")
  })
}

function getElementsUnder(pointer) {
  let elements = document.elementsFromPoint(pointer.coords.x, pointer.coords.y)

  //Ignore elements without an id
  elements = elements.filter((e) => e.id != "")
  //Ignore the pointer itself
  elements = elements.filter((e) => e.id != "pointer" + pointer.id)

  return elements
}

function checkHover(pointer) {
  let prevHoveredElement = document.getElementById(pointer.hoveredElement)
  let currentHoveredElements = getElementsUnder(pointer);
  if(currentHoveredElements.length == 0) return;
  let currentHoveredElement = currentHoveredElements[0]

  //"We were hovering something, now we're hovering something else"
  if (prevHoveredElement != currentHoveredElement) {
    //Update the hover counter of the previous element (if there's one)
    if (prevHoveredElement) {
      addToDataAttribute(prevHoveredElement, "hovered", -1)
      $(prevHoveredElement).trigger("mouseleave", { pointer: pointer })
    }
    //Update the pointer state
    pointer.hoveredElement = currentHoveredElement ? currentHoveredElement.id : null
    instance.pointers.set(pointer.id, pointer)
    //Update the hover counter of the new element (if there's one)
    if (currentHoveredElement) {
      addToDataAttribute(currentHoveredElement, "hovered", 1)
      $(currentHoveredElement).trigger("mouseenter", { pointer: pointer })
    }
  }
}

//A buffered click is a click that was added as part of an animation (usually for bots), waiting for the end of the frame to be applied
function checkBufferedClick(pointer) {
  //If there's a buffered click: do it now
  if(pointer.bufferedClick) {
    simulateMouseDown(pointer)
    simulateMouseUp(pointer)
  }
  //Reset the flag
  pointer = instance.pointers.get(pointer.id, pointer)
  pointer.bufferedClick = false
  instance.pointers.set(pointer.id, pointer)
}

//Shorthand for "getting a data attribute in `element` as an integer to add `amount` to it before re-saving the new value as a data attribute"
function addToDataAttribute(element, attr, amount) {
  let value = parseInt(element.getAttribute(attr) ?? 0)
  value += amount
  if (value == 0) {
    element.removeAttribute(attr)
  } else {
    element.setAttribute(attr, value)
  }
}

function createPointer(id, bot = false) {
  return {
    id: id,
    coords: { x: 0, y: 0 },
    events: [],
    bot: bot,
    seed: Math.random() * 1000000,
    gravity: 0, //in pixels per second
    locked: false,
    opacity: 1,
    tree: null,
  }
}
function createBot(id) {
  return createPointer(id, true)
}
