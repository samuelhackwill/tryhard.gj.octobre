import "./bulle.html"

import { Template } from "meteor/templating"
import { ReactiveVar } from "meteor/reactive-var"

import { samuelText as textArr } from "../../textAssets/samuel.js"

import { GlobalEvents } from "./main.js"
import { GlobalEvent } from "./main.js"

const States = {
  INITIAL: "INITIAL",
  OPENING: "OPENING",
  OPEN: "OPEN",
  CLOSING: "CLOSING",
  CLOSED: "CLOSED",
  FINISHED: "FINISHED", // this should probably not be the responsibility of this component, cause it doesn't have anything to do with the bulle! maybe move to main.js
}

const Events = {
  CLICK: "CLICK",
  BOX_ANIMATION_FINISHED: "ANIMATION_BOX_FINISHED",
  EVENT_LISTENER_ADDED: "EVENT_LISTENER_ADDED",
}

Template.bulle.onCreated(function helloOnCreated() {
  this.paragraphIndex = new ReactiveVar(0) // this should probably be handled entirely by the lettreur, because in the current situation we're indexing a distinct paragraph Index for each component. not good! probablby
  this.currentState = new ReactiveVar(States.INITIAL)
  this.text = new ReactiveVar("")
})

Template.bulle.onRendered(function () {
  onEnterInitial(this)

  this.autorun(() => {
    // console.log("bulle RE-RENDERING, global event : ", GlobalEvent.get())

    if (!GlobalEvent.get()) {
      return
    } else {
      if (GlobalEvent.get() == GlobalEvents.END_OF_PARAGRAPH) {
        // when it's the end of a paragraph, we'd like to close the dialog.
        transition(GlobalEvents.END_OF_PARAGRAPH, this)
      }
    }
  })
})

Template.bulle.helpers({
  openOrClosed() {
    const state = Template.instance().currentState.get()
    if (state == "FINISHED" || state == "INITIAL" || state == "CLOSING" || state == "CLOSED") {
      return "opacity-0"
    } else {
      return "opacity-1"
    }
  },
  state() {
    return Template.instance().currentState.get()
  },
})

Template.bulle.events({
  "click #bulleContainer"(event, instance, extra) {
    if (!extra) return //No extra data was provided: we don't know which pointer clicked?
    // console.log("click bullecontainer", event, instance, extra)
    let pointer = extra.pointer
    // console.log(pointer)
    if (pointer.id == "samuel") {
      // we might want to use a consistent way of handling events, like in the lettreur component. (ie, attaching an event listener to body and destroying it when the component is destroyed.)
      transition("CLICK", instance)
    } else {
      return
    }
  },
})

const transition = function (event, instance) {
  // console.log("bulle transition!", event, facultativeContext)

  switch (instance.currentState.get()) {
    case "INITIAL":
      if (event === Events.CLICK) {
        instance.currentState.set(States.OPENING)
      }
      break

    case "OPENING":
      if (event === Events.BOX_ANIMATION_FINISHED) {
        instance.currentState.set(States.OPEN)
        onEnterOpen(instance)
      }
      break

    case "OPEN":
      if (event === GlobalEvents.END_OF_PARAGRAPH) {
        onEnterClosing(instance)
        instance.currentState.set(States.CLOSING)
      }

      break

    case "CLOSING":
      if (event === Events.BOX_ANIMATION_FINISHED) {
        instance.currentState.set(States.CLOSED)
        onEnterClosed(instance)
      }
      break

    case "CLOSED":
      if (event === Events.CLICK) {
        parX = instance.paragraphIndex.get()
        if (parX > textArr.acte1.length - 1) {
          instance.currentState.set(States.FINISHED)
        } else {
          instance.currentState.set(States.OPENING)
        }
      }
      break

    case "FINISHED":
      if (event === Events.CLICK) {
        //alert("Text is finished mate. You can restart if you want")
        //instance.currentState.set(States.INITIAL)
        //onEnterInitial(instance)
        //GlobalEvent.set(GlobalEvents.RESTART)
      }
      break
  }
}

const onEnterInitial = function (instance) {
  parX = instance.paragraphIndex.set(0)

  element = document.getElementById("bulle")
  element.ontransitionend = () => {
    transition(Events.BOX_ANIMATION_FINISHED, instance)
  }
}

const onEnterClosing = function (instance) {
  // console.log("SETTING UP EVENT LISTENTER")
  element = document.getElementById("bulle")

  element.ontransitionend = () => {
    transition(Events.BOX_ANIMATION_FINISHED, instance)
  }

  transition(Events.EVENT_LISTENER_ADDED, instance)

  GlobalEvent.set(null)
}

const onEnterClosed = function (instance) {
  element = document.getElementById("bulle")
  element.ontransitionend = () => {
    transition(Events.BOX_ANIMATION_FINISHED, instance)
  }

  // we want to update the paragraph index to STAY IN SYNC with lettreur! this is probably bad! but maybe the alternative (more globals) is bad-er
  parX = instance.paragraphIndex.get() + 1
  instance.paragraphIndex.set(parX)
}

const onEnterOpen = function (instance) {
  GlobalEvent.set(GlobalEvents.START_WRITING)
}
