import "./lettreur.js"
import "./bulle.js"

export const GlobalEvents = {
  START_WRITING: "START_WRITING",
  END_OF_PARAGRAPH: "END_OF_PARAGRAPH",
  RESTART: "RESTART",
}

export const GlobalEvent = new ReactiveVar(null)
