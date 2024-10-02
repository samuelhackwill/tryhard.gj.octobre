import "./window.html"

import { events } from "./../FSMs/showFSM.js"

Template.windowAdmin.onCreated(function () {
  console.log(this)
  console.log(Object.values(events))
})

Template.windowAdmin.helpers({
  FSMEvents() {
    return Object.values(events)
  },
})
