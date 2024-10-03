// diane elle dit que ça serait bien d'utiliser INK
// ou un gros fichier MARKDOWN parce qu'en fait c'est pas tellement
// compliqué de faire un split sur les headers et éventuellement configurer
// la FSM automatiquement comme ça.

export const states = {
  INITIAL: "INITIAL",

  // ACTE I
  ACTE1s1: "ACTE1s1",
  // samuel cherche son accessoire
  ACTE1s2: "ACTE1s2",
  // samuel démarre le spectacle mais doit prouver qu'il n'est pas un robot

  // ACTE II
  ACTE2s1: "ACTE2s1",
  // les joueureuses/bots apparaissent (fade in)
  ACTE2s2: "ACTE2s2",
  // samuel gagne le droit de parler & les joueureuses doivent se rassembler devant samuel
  ACTE2s3: "ACTE2s3",
  // les joueureuses doivent faire un cerle autour de samuel
  ACTE2s4: "ACTE2s4",
  // les joueureuses doivent faire un carré autour de samuel
  ACTE2s5: "ACTE2s5",
  // les joueureuses doivent se mettre de part à d'autre de l'écran
  ACTE2s6: "ACTE2s6",
  // les joueureuses doivent se mettre sur un axe en fonction de leurs revenus
  ACTE2s6: "ACTE2s7",
  // les joueureuses doivent se mettre sur un axe en fonction de la dernière fois qu'iels ont mangé
  ACTE2sc7: "ACTE2sc8",
  // les joueureuses doivent se placer sur un graphe

  CUT: "CUT",
  // CUT

  ACTE3sc1: "ACTE3sc3",
  // samuel parle de douglas englebart pendant que les joueureuses plantent des arbres
  ACTE3sc2: "ACTE3sc2",
  // samuel dit que c'est fini et qu'il va tuer tout le monde.

  // fin
}

export const events = {
  // this data is consumed by the windowAdmin helper which uses the VALUES of the events to make buttons for the admin. samuel se sert de ces boutons pour passer d'une scène à une autre.
  REDÉMARRER: "REDÉMARRER",
  LANCER_LE_SPECTACLE: "LANCER_LE_SPECTACLE",
  OUVRIR_LA_FNET: "OUVRIR_LA_FNET",
  VRAIMENT_LANCER_LE_SPECTACLE: "VRAIMENT_LANCER_LE_SPECTACLE",
  MONTRER_LE_NOM_DES_CURSEURS: "MONTRER_LE_NOM_DES_CURSEURS",
}

export const transition = function (event, instance) {
  // ici pour les transitions qui ne causent pas de changement d'état.. uhu
  if (event === events.MONTRER_LE_NOM_DES_CURSEURS) {
    _ = instance.areNamesHidden.get()
    _ = !_
    instance.areNamesHidden.set(_)
    console.log("are names hidden = ", _)
    return
  }
  if (event === events.OUVRIR_LA_FNET) {
    _ = instance.isAdminOpen.get()
    if (_ === true) {
      instance.isAdminOpen.set(false)
    } else {
      instance.isAdminOpen.set(true)
    }
  }

  // ici les transitions plus classiques
  switch (instance.currentState.get()) {
    case "INITIAL":
      if (event === events.OUVRIR_LA_FNET) {
        instance.currentState.set(states.ACTE1s1)
      }
      break

    case "ACTE1s1":
      if (event === events.LANCER_LE_SPECTACLE) {
        instance.currentState.set(states.ACTE1s2)
      }
      break

    case "ACTE1s2":
      if (event === events.VRAIMENT_LANCER_LE_SPECTACLE) {
        instance.currentState.set(states.ACTE2s1)
      }
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
