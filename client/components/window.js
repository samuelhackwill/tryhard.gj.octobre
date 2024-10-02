import "./window.html"

import { events } from "./../FSMs/showFSM.js"
import { GlobalEvent } from "../FSMs/globalEvents.js"

const feed = new ReactiveVar([{ value: "Je ne suis pas un robot", hasInteracted: false }])
const captchaSolved = new ReactiveVar(false)

Template.windowAdmin.onCreated(function () {
  // this.feed = new ReactiveVar(["Je ne suis pas un robot"])
})

Template.windowAdmin.helpers({
  isSpecialButton() {
    if (this == "LANCER_LE_SPECTACLE") {
      return true
    } else {
      return false
    }
  },

  FSMEvents() {
    // show.html is passing a currentState=<state> arg
    // so we have acess to the FSM state that way
    // because we need to have the context of the parent component quoi.
    return Object.values(events)
  },

  isOpen() {
    // "this" is actually the state of SHOW which was passed to its children.
    if (this.currentState == "INITIAL") {
      return "opacity:0;"
    } else {
      return "opacity:80;"
    }
  },
  isItCaptchaTime() {
    // "this" is actually the state of SHOW which was passed to its children.
    if (Template.instance().data.currentState == "ACTE1s2") {
      return "display : block;"
    } else {
      return "display : none"
    }
  },
  feed() {
    return feed.get()
  },
})

Template.windowAdmin.events({
  "click button"() {
    buttonId = String(this)
    GlobalEvent.set(buttonId)
  },
})

Template.captcha.onCreated(function () {
  // this.index = new ReactiveVar(0)
  // this.interacted = new ReactiveVar(false)
  // console.log(this.data.value)
  // console.log(this.data.hasInteracted)
})

Template.captcha.onRendered(function () {})

Template.captcha.helpers({
  hasInteracted() {
    console.log("HAS INTERACTED ", this.hasInteracted)
    return this.hasInteracted
  },
})

Template.captcha.events({
  "click input"() {
    console.log(this)
    // _index = Template.instance().index.get() + 1
    // Template.instance().index.set(_index)

    // Template.instance().interacted.set(true)
    _feed = feed.get()
    _feed[_feed.length - 1].hasInteracted = true
    _feed.push({ value: "prout", hasInteracted: false })
    feed.set(_feed)

    // scroll to bottom
    Meteor.setTimeout(() => {
      var objDiv = document.getElementById("captchaContainer")
      objDiv.scrollTop = objDiv.scrollHeight
    }, 0)
  },
})
