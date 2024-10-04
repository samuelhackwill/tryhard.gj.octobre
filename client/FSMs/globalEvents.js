// global events are used to communicate
// between FSMs from different components.

// i.e. : one folder component contains a mousedown event
// which will trigger the showFSM imported in show.js to go
// into ACTEIsc2 mode.
import { events as showFSMevents } from "./showFSM.js"

export const GlobalEvent = new ReactiveVar(null)

export const GlobalEvents = {
  [showFSMevents.LANCER_LE_PLAYTEST]: showFSMevents.LANCER_LE_PLAYTEST,
  [showFSMevents.OUVRIR_LA_FNET]: showFSMevents.OUVRIR_LA_FNET,
  [showFSMevents.VRAIMENT_LANCER_LE_PLAYTEST]: showFSMevents.VRAIMENT_LANCER_LE_PLAYTEST,
  [showFSMevents.MONTRER_LE_NOM_DES_CURSEURS]: showFSMevents.MONTRER_LE_NOM_DES_CURSEURS,
  [showFSMevents.GO_TO_INSEE]: showFSMevents.GO_TO_INSEE,
  [showFSMevents.GO_TO_JOEL_ROBUCHON]: showFSMevents.GO_TO_JOEL_ROBUCHON,
  [showFSMevents.GO_TO_GRAPHE]: showFSMevents.GO_TO_GRAPHE,
  [showFSMevents.BREAK]: showFSMevents.BREAK,
  [showFSMevents.GO_TO_HIDE_N_SEEK]: showFSMevents.GO_TO_HIDE_N_SEEK,
}
