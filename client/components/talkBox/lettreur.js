import "./lettreur.html"

import { GlobalEvents } from "./main.js"
import { GlobalEvent } from "./main.js"

import { samuelText as textArr } from "../../textAssets/samuel.js"

let lastClick = null

const States = {
  INITIAL: "INITIAL",
  WRITING: "WRITING",
  // CHECKING_TRIGRAMME: "CHECKING_TRIGRAMME",
  // CHECKING_DIGRAMME: "CHECKING_DIGRAMME",
  PRINTING_LETTER: "PRINTING_LETTER",
  COMPLETE: "COMPLETE",
  FINISHED: "FINISHED",
}

const Events = {
  WAIT_END: "WAIT_END",
  END_OF_LETTER: "END_OF_LETTER",
  END_OF_SENTENCE: "END_OF_SENTENCE",
  CLICK: "CLICK",
}

Template.lettreur.onCreated(function helloOnCreated() {
  this.paragraphIndex = new ReactiveVar(0)
  this.sentenceIndex = new ReactiveVar(0)
  this.currentState = new ReactiveVar(States.INITIAL)
  this.nextPhrase = new ReactiveVar("")
  this.text = new ReactiveVar("")
  onEnterInitial(this)
})

Template.lettreur.onRendered(function () {
  const instance = this // Store the Template instance
  $("body .backgroundContainer").on("click.lettreur", function (event, extra) {
    // ok so as i really don't get what's going on here
    // probably because of meteor reactivity and the destroy function
    // not working properly, i'm just going to debounce the
    // clicks when they're suspiciously fast
    // console.log(event.target.id)

    newClick = new Date()
    var debounceInterval = 100 /* ms */

    // console.log("newClick", newClick, "lastClick", lastClick)
    if (newClick - lastClick < debounceInterval) {
      // console.log("DEBOUNCING!")
      lastClick = newClick
      return
    }
    lastClick = newClick

    if (!extra) return //No extra data was provided: we don't know which pointer clicked?
    let pointer = extra.pointer
    if (pointer.id == "samuel") {
      // we might want to use a consistent way of handling events, like in the lettreur component. (ie, attaching an event listener to body and destroying it when the component is destroyed.)
      const currentInstance = instance

      // Now you can call your transition function or use the instance
      transition(Events.CLICK, currentInstance)
      return
    } else {
      return
    }
  })

  this.autorun(() => {
    if (!GlobalEvent.get()) {
      return
    } else {
      if (GlobalEvent.get() == GlobalEvents.START_WRITING) {
        // Respond to state changes in prout2
        transition(GlobalEvents.START_WRITING, this)
      }
      if (GlobalEvent.get() == GlobalEvents.RESTART) {
        // Respond to state changes in prout2
        transition(GlobalEvents.RESTART, this)
      }
    }
  })
})

Template.lettreur.helpers({
  state() {
    return Template.instance().currentState.get()
  },
  text() {
    return Template.instance().text.get()
  },
})

// Template.lettreur.onDestroyed(function () {
//   console.log("DESTROYING EVENT LISTENER")
//   $("body").off("click.lettreur")
// })

// Template.lettreur.events({
//   click() {
//     console.log("prout")
//   },
// })

const transition = function (event, instance) {
  // console.log("lettreur transition !", event, facultativeContext)

  switch (instance.currentState.get()) {
    case "FINISHED":
      if (event === GlobalEvents.START_WRITING) {
        instance.paragraphIndex.set(instance.paragraphIndex.get() + 1)
        GlobalEvent.set(null)
        instance.currentState.set(States.WRITING)
        onEnterWriting(instance)
      }
      if (event === GlobalEvents.RESTART) {
        instance.sentenceIndex.set(0)
        instance.paragraphIndex.set(0)
        GlobalEvent.set(null)

        onEnterInitial(instance)
        instance.currentState.set(States.INITIAL)
      }
      break

    case "INITIAL":
      if (event === GlobalEvents.START_WRITING) {
        GlobalEvent.set(null)
        instance.currentState.set(States.WRITING)
        onEnterWriting(instance)
      }
      break
    case "WRITING":
      if (event === Events.WAIT_END) {
        instance.currentState.set(States.PRINTING_LETTER)
        onEnterPrinting_Letter(instance)
      }
      if (event === Events.CLICK) {
        instance.currentState.set(States.COMPLETE)
        onEnterComplete(instance)
      }

      break
    case "PRINTING_LETTER":
      if (event === Events.END_OF_LETTER) {
        instance.currentState.set(States.WRITING)
        onEnterWriting(instance)
      }
      if (event === Events.END_OF_SENTENCE || event === Events.CLICK) {
        instance.currentState.set(States.COMPLETE)
        onEnterComplete(instance)
      }

      break

    case "COMPLETE":
      if (event === Events.CLICK) {
        parX = instance.paragraphIndex.get()
        sentX = instance.sentenceIndex.get()

        instance.text.set("")

        console.log(parX, sentX, textArr.acte1[parX].length - 1)

        instance.nextPhrase.set(textArr.acte1[parX][sentX])

        if (sentX >= textArr.acte1[parX].length - 1) {
          instance.currentState.set(States.FINISHED)
          instance.sentenceIndex.set(0)
          GlobalEvent.set(GlobalEvents.END_OF_PARAGRAPH)
          return
        } else {
          instance.currentState.set(States.WRITING)
          onEnterWriting(instance)
        }
      }
      break
  }
}

const onEnterComplete = function (instance) {
  restOfTheText = instance.nextPhrase.get()

  oldText = instance.text.get()
  newText = oldText + restOfTheText
  instance.text.set(newText)

  //TODO: Obviously refactor this omg
  TellShowWeFinishedDisplayingParagraph(instance.text.get());


  instance.sentenceIndex.set(instance.sentenceIndex.get() + 1)
}

const onEnterInitial = function (instance) {
  const parX = instance.paragraphIndex.get()
  const sentX = instance.sentenceIndex.get()

  instance.nextPhrase.set(textArr.acte1[parX][sentX])
}

const onEnterWriting = function (instance) {
  Meteor.setTimeout(() => {
    transition(Events.WAIT_END, instance)
  }, 35)
}

const onEnterPrinting_Letter = function (instance) {
  // REFACTORING / TODO ; it would be nice that the animation pauses briefly when encountering a full stop or an interogation mark. expressivité ++

  sentence_length = instance.nextPhrase.get().length

  if (sentence_length <= 1) {
    // please note that the last letter of the text will
    // be fired by the onEnterComplete function. Why is that?
    // because we also want it to be able to print everything
    // d'un coup on click.
    transition(Events.END_OF_SENTENCE, instance)
    return
  }

  // get next letter
  nextLetter = instance.nextPhrase.get()[0]

  // add next letter to old text
  oldText = instance.text.get()
  newText = oldText + nextLetter
  instance.text.set(newText)

  // remove letter from data set
  instance.nextPhrase.set(instance.nextPhrase.get().substring(1))

  Meteor.setTimeout(function () {
    transition(Events.END_OF_LETTER, instance)
    // ça c'est juste pour qu'on voie le changement, sinon on voit jamais la machine passer en mode "printing"! à virer le jour J parce que ça doit faire chier l'event loop
  }, 0)
}
