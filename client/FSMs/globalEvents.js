// global events are used to communicate
// between FSMs from different components.

// i.e. : one folder component contains a mousedown event
// which will trigger the showFSM imported in show.js to go
// into ACTEIsc2 mode.
import { events as showFSMevents } from "./showFSM.js"

export const GlobalEvent = new ReactiveVar(null)

export const GlobalEvents = {
  [showFSMevents.LANCER_LE_SPECTACLE]: showFSMevents.LANCER_LE_SPECTACLE,
  [showFSMevents.OUVRIR_LA_FNET]: showFSMevents.OUVRIR_LA_FNET,
  [showFSMevents.VRAIMENT_LANCER_LE_SPECTACLE]: showFSMevents.VRAIMENT_LANCER_LE_SPECTACLE,
  [showFSMevents.MONTRER_LE_NOM_DES_CURSEURS]: showFSMevents.MONTRER_LE_NOM_DES_CURSEURS,
}
