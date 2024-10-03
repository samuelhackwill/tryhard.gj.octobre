import { Template } from "meteor/templating"
import { ReactiveDict } from "meteor/reactive-dict"
import { streamer } from "../both/streamer.js"
import { FlowRouter } from "meteor/ostrio:flow-router-extra"
import { applyRandomAccessory } from "./dressup.js"

import "./components/main.js"
import "./show.html"

import { states, events, transition, triggers } from "./FSMs/showFSM.js"
import { GlobalEvents, GlobalEvent } from "./FSMs/globalEvents.js"

let Lastelement = null
let animationFrame

Template.show.onCreated(function () {
  this.currentState = new ReactiveVar(states.INITIAL)

  // Initialize the reactive dictionary to keep track of each client's pointer position.
  this.pointers = new ReactiveDict()

  // fuuuuu
  instance = this
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
      transition(GlobalEvents[key], this)
      GlobalEvent.set(null)
    }
  })
})

streamer.on("displayMessage", function (message) {
  // Ensure the code only runs on the 'show' route to avoid unwanted executions.
  if (FlowRouter.getRouteName() === "show") {
    //message.pointers contains all the pointers that have changed state this frame (moved, etc)
    // => reflect this change on the reactive dictionary
    message.pointers.forEach((pointerData) => {
      //Get the reactive pointer
      let pointer = instance.pointers.get(pointerData.id)
      if (!pointer) {
        //It doesn't exist: we don't have any other data than what the server sent us
        pointer = pointerData
      } else {
        //Apply all the updated data sent by the server
        //(Note that this doesn't erase any of the state we set in this client, e.g. what's being hovered)
        pointer = Object.assign(pointer, pointerData)
      }
      //Save the updated pointer state
      instance.pointers.set(pointer.id, pointer)
      //Note that we shouldn't change `pointer` after this point,
      // and especially not write to `instance.pointers`!
      //This is because simulating the events might trigger a bunch of things,
      // including template events, which may want to access the reactive pointers too.

      //Handle events
      if (pointer.mousedown) {
        simulateMouseDown(pointer)
      }
      if (pointer.mouseup) {
        simulateMouseUp(pointer)
      }

      //Update the hover state, in case the pointer moved
      checkHover(pointer)
    })
  }
})

Template.show.helpers({
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
  showState() {
    return [Template.instance().currentState.get()]
  },
  isAdmin() {
    return true
  },
})

Template.show.events({
  "click button"() {
    // note that the REAL pointer of localhost will be able to natively trigger this event as well as simulated clicks. (which is good for testing i guess)
    console.log("SHOW.JS button clicked.")
  },
  "click #folderVestiaire" (event, tpl, extra) {
    if(!extra) return //No extra data was provided: we don't know which pointer clicked?
    let pointer = instance.pointers.get(extra.pointer.id)
    applyRandomAccessory(pointer)
    instance.pointers.set(pointer.id, pointer)
  }
})

simulateMouseUp = function (pointer) {
  const element = getElementAt(pointer.coords)
  if (element == null) return

  element.classList.remove("clicked")
}

simulateMouseDown = function (pointer) {
  const element = getElementAt(pointer.coords)
  if (element == null) return

  // we need to restrict clicks on privileged buttons, like the admin buttons
  // so that only samuel can click on them.
  if (element.classList.contains("privileged") && pointer.id != "samuel") {
    return
  }

  //Trigger a jQuery click event with extra data (the pointer)
  $(element).trigger("click", { pointer: pointer })
  element.classList.remove("clicked")
}

function getElementAt(coords) {
  let element = document.elementFromPoint(coords.x, coords.y)
  if (element == null) return null

  if (element.id == "") {
    //We only interact with elements that have an id, this one doesn't.
    //Find its nearest parent that does have
    element = element.closest("*[id]")
    if (element == null) return null
  }
  return element
}

function checkHover(pointer) {
  let prevHoveredElement = document.getElementById(pointer.hoveredElement)
  let currentHoveredElement = getElementAt(pointer.coords)

  //"We were hovering something, now we're hovering something else"
  if (prevHoveredElement != currentHoveredElement) {
    //Update the hover counter of the previous element (if there's one)
    if (prevHoveredElement) {
      addToDataAttribute(prevHoveredElement, "hovered", -1)
      $(prevHoveredElement).trigger("mouseleave", { pointer: pointer })
    }
    //Update the pointer state
    pointer.hoveredElement = currentHoveredElement ? currentHoveredElement.id : null
    instance.pointers.set(pointer.id, pointer);
    //Update the hover counter of the new element (if there's one)
    if (currentHoveredElement) {
      addToDataAttribute(currentHoveredElement, "hovered", 1)
      $(currentHoveredElement).trigger("mouseenter", { pointer: pointer })
    }
  }
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
