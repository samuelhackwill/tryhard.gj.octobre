import "./background.html"

Template.background.helpers({
  getBg() {
    let currentView = Template.instance().view

    while (currentView != null) {
      if (currentView.name == "Template.show") {
        break
      }
      currentView = currentView.parentView.templateInstance()
    }

    return currentView.whichBackground.get()
  },
})
