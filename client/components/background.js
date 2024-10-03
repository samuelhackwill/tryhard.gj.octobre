import "./background.html"

Template.background.helpers({
  getBg() {
    let currentView = Template.instance().view

    while (currentView != null) {
      if (currentView.name == "Template.show") {
        break
      }
      currentView = currentView.parentView
    }

    if (currentView.templateInstance().whichBackground.get() == null) {
      return false
    } else {
      return "background-image:url('./backgrounds/" + currentView.templateInstance().whichBackground.get() + "');"
    }
  },
})
