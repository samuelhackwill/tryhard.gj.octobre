import "./window.html"

import { events } from "./../FSMs/showFSM.js"

Template.windowAdmin.onRendered(function () {})

Template.windowAdmin.helpers({
  FSMEvents() {
    // show.html is passing a currentState=<state> arg
    // so we have acess to the FSM state that way
    // because we need to have the context of the parent component quoi.
    return Object.values(events)
  },

  isOpen() {
    if (this.currentState == "INITIAL") {
      return "opacity-0"
    } else {
      return "opacity-80"
    }
  },
})
