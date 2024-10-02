import "./folder.html"
import { GlobalEvent, GlobalEvents } from "./../FSMs/globalEvents.js"

Template.folderAdmin.onCreated(function () {
  this.pos = new ReactiveVar([500, 200])
})

Template.folderAdmin.helpers({
  position() {
    return `left:${Template.instance().pos.get()[0]}px; top:${Template.instance().pos.get()[1]}px;`
  },
})

Template.folderAdmin.events({
  "click .folder"() {
    // note that the REAL pointer of localhost will be able to natively trigger this event as well as simulated clicks. (which is good for testing i guess)
    console.log("Folder clicked")
    GlobalEvent.set(GlobalEvents.goToAIs1)
    // launch acteIsc2
  },
})

Template.folderVestiaire.onCreated(function () {
  this.pos = new ReactiveVar([800, 100])
})

Template.folderVestiaire.helpers({
  position() {
    return `left:${Template.instance().pos.get()[0]}px; top:${Template.instance().pos.get()[1]}px;`
  },
})
