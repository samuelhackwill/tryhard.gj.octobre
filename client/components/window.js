import "./window.html"

import { events } from "./../FSMs/showFSM.js"
import { GlobalEvent, GlobalEvents } from "../FSMs/globalEvents.js"

import { checkboxCaptchas } from "./../textAssets/captchas.js"

const feed = new ReactiveVar([{ value: "Je ne suis pas un robot", hasInteracted: false }])
const captchaSolved = new ReactiveVar(false)
const captchaIndex = new ReactiveVar(0)

let fader = null

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

  isCaptchaSolved() {
    return captchaSolved.get()
  },

  FSMEvents() {
    // show.html is passing a currentState=<state> arg
    // so we have acess to the FSM state that way
    // because we need to have the context of the parent component quoi.
    return Object.values(events)
  },

  isOpen() {
    // "this" is actually the state of SHOW which was passed to its children.
    if (this.currentState == "INITIAL" || this.currentState == "ACTE2s1") {
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

    if (captchaSolved.get() == true && buttonId == "LANCER_LE_SPECTACLE") {
      GlobalEvent.set(GlobalEvents.VRAIMENT_LANCER_LE_SPECTACLE)
    }
  },
})

Template.captcha.onCreated(function () {})

Template.captcha.onRendered(function () {})

Template.captcha.helpers({
  hasInteracted() {
    console.log("HAS INTERACTED ", this.hasInteracted)
    return this.hasInteracted
  },
})

Template.captcha.events({
  "click input"() {
    index = captchaIndex.get()

    console.log(checkboxCaptchas)

    if (index < checkboxCaptchas.length - 1) {
      _feed = feed.get()
      _feed[_feed.length - 1].hasInteracted = true
      _feed.push({ value: checkboxCaptchas[index], hasInteracted: false })
      feed.set(_feed)
    } else {
      // trigger event! it's finished!
      fadeEveryCaptcha()
      console.log("ok samuel n'est pas un robot")
      return
    }

    _index = index + 1
    captchaIndex.set(_index)

    // scroll to bottom
    Meteor.setTimeout(() => {
      var objDiv = document.getElementById("captchaContainer")
      objDiv.scrollTop = objDiv.scrollHeight
    }, 0)
  },
})

fadeEveryCaptcha = function () {
  fader = Meteor.setInterval(() => {
    _feed = feed.get()
    _feed.pop()
    feed.set(_feed)

    if (_feed.length < 1) {
      Meteor.clearInterval(fader)
      captchaSolved.set(true)
    }
  }, 500)
}
