import { FlowRouter } from "meteor/ostrio:flow-router-extra"
import "./logger.js"
import "./show.js"

FlowRouter.route("/", {
  name: "logger",
  action() {
    //Read a logger id from the url, with the format: localhost:3000?id=id_goes_here
    let loggerId = FlowRouter.getQueryParam("id")
    this.render("logger", {loggerId:loggerId});
  },
})

FlowRouter.route("/show", {
  name: "show",
  action() {
    this.render("show")
  },
})
