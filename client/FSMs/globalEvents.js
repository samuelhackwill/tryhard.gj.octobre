// global events are used to communicate
// between FSMs from different components.

// i.e. : one folder component contains a mousedown event
// which will trigger the showFSM imported in show.js to go
// into ACTEIsc2 mode.
import { events as showFSMevents } from "./showFSM.js"

export const GlobalEvent = new ReactiveVar(null)

export const GlobalEvents = {
  [showFSMevents.goToAIs1]: showFSMevents.goToAIs1,
}
