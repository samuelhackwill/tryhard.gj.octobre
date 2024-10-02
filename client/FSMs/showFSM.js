// diane elle dit que ça serait bien d'utiliser INK
// ou un gros fichier MARKDOWN parce qu'en fait c'est pas tellement
// compliqué de faire un split sur les headers et éventuellement configurer
// la FSM automatiquement comme ça.

export const states = {
  INITIAL: "INITIAL",

  // ACTE I
  ACTEIsc1: "ACTEIsc1",
  // samuel cherche son accessoire
  ACTEIsc2: "ACTEIsc2",
  // samuel démarre le spectacle mais doit prouver qu'il n'est pas un robot
  ACTEIIsc1: "ACTEIIsc1",
  // les joueureuses/bots apparaissent en tombant du ciel

  // ACTE II
  ACTEIIsc2: "ACTEIIsc2",
  // les joueureuses doivent se rassembler devant samuel
  ACTEIIsc3: "ACTEIIsc3",
  // les joueureuses doivent faire un cerle autour de samuel
  ACTEIIsc4: "ACTEIIsc4",
  // les joueureuses doivent faire un carré autour de samuel
  ACTEIIsc5: "ACTEIIsc5",
  // les joueureuses doivent se mettre de part à d'autre de l'écran
  ACTEIIsc6: "ACTEIIsc6",
  // les joueureuses doivent se mettre sur un axe en fonction de la dernière fois qu'iels ont mangé
  ACTEIIsc7: "ACTEIIsc7",
  // les joueureuses doivent faire une pyramide des ages
}

export const events = {
  START: "lancer le spectacle",
  // this data is consumed by the windowAdmin helper which uses the VALUES of the events to make buttons for the admin. samuel se sert de ces boutons pour passer d'une scène à une autre.
  goToAIs1: "goToAIs1",
}

export const transition = function (event, instance) {
  // console.log("bulle transition!", event, facultativeContext)

  switch (instance.currentState.get()) {
    case "INITIAL":
      //   if (event === Events.CLICK) {
      //     instance.currentState.set(States.OPENING)
      //   }
      break
  }
}

export const triggers = {
  onEnterInitial: function (instance) {
    // parX = instance.paragraphIndex.set(0)
    // element = document.getElementById("bulle")
    // element.ontransitionend = () => {
    //   transition(Events.BOX_ANIMATION_FINISHED, instance)
    // }
  },
}
