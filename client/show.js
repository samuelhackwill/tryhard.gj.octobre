import { Template } from "meteor/templating"
import { ReactiveDict } from "meteor/reactive-dict"
import { streamer } from "../both/streamer.js"
import { FlowRouter } from "meteor/ostrio:flow-router-extra"

import "./components/main.js"
import "./show.html"

import { states, events, transition, triggers } from "./FSMs/showFSM.js"

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
})

streamer.on("displayMessage", function (message) {
  // Ensure the code only runs on the 'show' route to avoid unwanted executions.
  if (FlowRouter.getRouteName() === "show") {
    //message.pointers contains all the pointers that have changed state this frame (moved, etc)
    // => reflect this change on the reactive dictionary
    message.pointers.forEach((p) => {
      instance.pointers.set(p.id, p)

      if (p.mousedown) {
        simulateMouseDown(p)
      }
      if (p.mouseup) {
        simulateMouseUp(p)
      }
    })
  }
})

Template.show.helpers({
  // Get all client pointers for iteration if you want to display all.
  allPointers(arg) {
    if (arg.hash.getAdmin === true) {
      // the pointer with ?id=samuel is the boss!
      // TODO : refactor this because it's not very secure. genre si quelqu'un se connecte à localhost:3000/id=samuel il devient l'admin lel
      pointer = instance.pointers.get("samuel")
      return [pointer]
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
    console.log("isAdmin?", this)
    return true
  },
})

Template.show.events({
  "click button"() {
    console.log("yahouuuu")
  },
})

simulateMouseUp = function (pointer) {
  const element = getElementAt(pointer.coords)

  if (element.tagName == "BUTTON") {
    element.classList.remove("clicked")
  }
}

simulateMouseDown = function (pointer) {
  const element = getElementAt(pointer.coords)

  // we need to restrict clicks on privileged buttons, like the admin buttons
  // so that only samuel can click on them
  // TODO : refactor this because it's not very secure. genre si quelqu'un se connecte à localhost:3000/id=samuel il devient l'admin lel
  if (element.classList.contains("privileged") && pointer.id != "samuel") {
    return
  }

  if (element.tagName == "BUTTON") {
    element.click()
    element.classList.add("clicked")
  }
}

function getElementAt(coords) {
  return document.elementFromPoint(coords.x, coords.y)
}
