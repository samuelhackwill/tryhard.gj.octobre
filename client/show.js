import { Template } from "meteor/templating"
import { ReactiveDict } from "meteor/reactive-dict"
import { streamer } from "../both/streamer.js"
import { FlowRouter } from "meteor/ostrio:flow-router-extra"

import "./show.html"

let Lastelement = null
let animationFrame

Template.show.onCreated(function () {
  // Initialize the reactive dictionary to keep track of each client's pointer position.
  this.pointers = new ReactiveDict()

  // fuuuuu
  instance = this
})

Template.show.onRendered(function () {
  streamer.emit("showInit", {"width":window.innerWidth, "height":window.innerHeight})
})

streamer.on("displayMessage", function (message) {
  // Ensure the code only runs on the 'show' route to avoid unwanted executions.
  if (FlowRouter.getRouteName() === "show") {
    //message.pointers contains all the pointers that have changed state this frame (moved, etc)
    // => reflect this change on the reactive dictionary
    message.pointers.forEach(p => {
      instance.pointers.set(p.id, p);

      if(p.mousedown) {
        simulateMouseDown(p)
      }
      if(p.mouseup) {
        simulateMouseUp(p)
      }
    })
  }
})

Template.show.helpers({
  // Get all client pointers for iteration if you want to display all.
  allPointers() {
    const pointers = Object.values(instance.pointers.all());
    return pointers;
  },
})

Template.show.events({
  "click button"() {
    // console.log("yahouuuu")
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

  if (element.tagName == "BUTTON") {
    element.click()
    element.classList.add("clicked")
  }
}

function getElementAt(coords)
{
  return document.elementFromPoint(coords.x, coords.y)
}
