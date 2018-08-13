/* ===================================================================================== @preserve =

Limelight
version v2.1.7
Author: George Butter
https://github.com/ButsAndCats/limelight
ISC License
================================================================================================= */

/*
  Manages visibility for popups, drawers, modals, notifications, tabs, accordions and anything else.
*/
const Limelight = function LimelightVisibilityManager (target, config) {
  const settings = config || {}

  // The default configuration
  /*
    visibleClass: The class that will be applied to the target element.
    bodyClass: The class that will be applied to the body.
    triggerClass: The class that will be applied to the trigger that is clicked on.
    detach: if the body should be appended to the body.
    innerSelector: The outer area of the element, acts like a close button when clicked.
    autoFocusSelector: An input field that you would like to be focused with the element opens.
    slide: Whether the opening should be animated with javascript, useful for accordions.
    slideDuration: Speed of the animation, can be defined in ms.
    visible: Whether the element was loaded visible or not.
    success: Callback for when an element is success fully made visible.
    error: Callback fro when an element could not be made visible.
  */
  const defaultSettings = {
    visibleClass: 'visible',
    bodyClass: 'active-popup',
    triggerClass: null,
    detach: null,
    innerSelector: '.popup-inner',
    autoFocusSelector: '[data-auto-focus]',
    slide: null,
    slideDuration: 'fast',
    visible: false,
    beforeShowCallback: null,
    showCallback: null,
    hideCallback: null,
    error: null
  }

  // Merge configs
  this.settings = Object.assign(defaultSettings, settings)

  // Update current popup config
  this.visible = this.settings.visible
  // The Dom element of the popup
  this.element = document.querySelector(target)
  this.innerElement = document.querySelector(`${target} ${this.settings.innerSelector}`)
  this.closeElement = document.querySelector(`${target} [data-close]`)
  this.target = target

  if (this.settings.slide) {
    const defaultDisplay = this.element.style.display
    this.element.style.display = 'block'
    this.maxHeight = this.element.offsetHeight
    this.element.style.display = defaultDisplay
    this.height = this.element.offsetHeight
    this.counter = this.height
  }

  // Bind this into all of our prototype functions
  this.show = this.show.bind(this)
  this.hide = this.hide.bind(this)
  this.toggle = this.toggle.bind(this)
  this.detach = this.detach.bind(this)
  this.slideDown = this.slideDown.bind(this)
  this.slideUp = this.slideUp.bind(this)

  // If detach is set to true move the popup to the end of the popup
  if (this.settings.detach) {
    document.addEventListener('DOMContentLoaded', this.detach)
  }

  // Create a list of all of the currently active elements so that we can access them globally
  Limelight.elements[target] = this
}

// Create an empty object to store all of the elements in.
Limelight.elements = {}

// Prevent default if the element is a link and return the selector of the popup element
Limelight.getTarget = function getTheLimelightElementRelatedToTheTarget (event) {
  const element = event.target
  if (element.tagName === 'A') {
    event.preventDefault()
  }
  const selector = element.dataset.target
  const target = selector || null
  return target
}

/*
  If the element does not exist then it is being fired directly from a data attribute.
  Therefore we create a new Limelight element. Then we toggle the elements visibility.
*/
Limelight.eventHandler = function hideOrShowTheElement (event, target, method) {
  let element = Limelight.elements[target]
  if (!element) {
    element = new Limelight(target)
  }
  if (method === 'hide') {
    return element.hide()
  }
  return element.toggle()
}
/*
  When clicking on a close button or out element
*/
Limelight.closeEvent = function handleAnElementBeingClosed (event) {
  const target = Limelight.getTarget(event)
  if (target) {
    Limelight.eventHandler(event, target, 'hide')
  } else {
    this.hide()
  }
}

/*
  On key up event check if the user has pressed escape
*/
Limelight.escEvent = function onKeyUpEscape (event) {
  if (event.keyCode === 27) {
    this.element.removeEventListener('keyup', Limelight.escEvent)
    this.hide()
  }
}

/*
  Build the event listeners
*/
Limelight.buildEventListeners = function bindLimelightEventListeners () {
  const allTriggers = document.querySelectorAll('[data-trigger]')
  for (let trigger = 0; trigger < allTriggers.length; trigger += 1) {
    const { target } = allTriggers[trigger].dataset
    allTriggers[trigger].addEventListener('click', (event) => {
      event.preventDefault()
      Limelight.eventHandler(event, target)
    })
  }
}

/*
  Add a class to a given element
*/
Limelight.addClass = function addAClassToAGivenElement (element, className) {
  const el = element
  if (el.classList) {
    el.classList.add(className)
  }
}

/*
  Remove a class from a given element
*/
Limelight.removeClass = function removeAClassFromAGivenElement (element, className) {
  const el = element
  if (el.classList) {
    el.classList.remove(className)
  }
}

/*
  Show the popup element
*/
Limelight.prototype.show = function showTheElement () {
  // Check if the element is visible or not.
  if (!this.visible || !this.element.classList.contains(this.settings.visibleClass)) {
    // Fire the success callback
    if (this.settings.beforeShowCallback && typeof this.settings.beforeShowCallback === 'function') {
      this.settings.beforeShowCallback(this, Limelight.elements)
    }
    // Add the class to the trigger button if one is defined.
    if (this.settings.triggerClass) {
      const triggerElement = document.querySelector(`[data-target="${this.target}"]`)
      Limelight.addClass(triggerElement, this.settings.visibleClass)
    }
    // If slide is set to true slide the element down.
    if (this.settings.slide) {
      this.slideDown(this.settings.slideDuration)
    }
    // Add the visible class to the popup
    Limelight.addClass(this.element, this.settings.visibleClass)
    // Add the body class to the body
    Limelight.addClass(document.body, this.settings.bodyClass)
    // Define that this element is visible
    this.visible = true

    // Focus on an input field once the modal has opened
    const focusEl = document.querySelector(`${this.target} ${this.settings.autoFocusSelector}`)
    if (focusEl) {
      setTimeout(() => {
        focusEl.focus()
      }, 300)
    }
    if (this.closeElement) {
      // When someone clicks the [data-close] button then we should close the modal
      this.closeElement.addEventListener('click', Limelight.closeEvent.bind(this))
    }
    if (this.innerElement) {
      // When someone clicks on the inner class hide the popup
      this.innerElement.addEventListener('click', Limelight.closeEvent.bind(this))
    }
    // When someone presses esc hide the popup and unbind the event listener
    this.element.addEventListener('keyup', Limelight.escEvent.bind(this))

    // Fire the success callback
    if (this.settings.showCallback && typeof this.settings.showCallback === 'function') {
      this.settings.showCallback(this)
    }
  } else if (this.settings.error && typeof this.settings.error === 'function') {
    this.settings.error('Limelight: Error this element is already visible', this)
  }
  // Return this so that we can chain functions together
  return this
}

Limelight.prototype.slideDown = function slideDown () {
  const el = this.element
  // Display none
  const defaultDisplay = this.element.style.display

  el.style.display = 'block'
  el.style.overflow = 'visible'
  el.style.maxHeight = '100%'
  // Declare the value of "height" variable
  this.maxHeight = el.offsetHeight
  el.style.display = defaultDisplay
  this.height = el.offsetHeight
  // Declare the value of "counter" variable
  this.counter = this.height
  el.style.maxHeight = `${this.height}px`
  el.style.overflow = 'hidden'
  el.style.display = 'block'

  const adder = this.maxHeight / 100
  // Iteratively increase the height
  this.interval = setInterval(() => {
    this.counter += adder
    if (this.counter < this.maxHeight) {
      el.style.maxHeight = `${this.counter}px`
    } else {
      el.style.maxHeight = null
      el.style.overflow = null
      this.height = this.element.offsetHeight
      clearInterval(this.interval)
    }
  }, this.settings.slideSpeed / 100)
}

Limelight.prototype.slideUp = function slideUp () {
  const el = this.element
  const subtractor = this.maxHeight / 100
  // To hide the content of the element
  el.style.overflow = 'hidden'

  // Decreasing the height
  this.interval = setInterval(() => {
    this.counter -= subtractor
    if (this.counter > 0) {
      el.style.maxHeight = `${this.counter}px`
    } else {
      el.style.maxHeight = null
      el.style.display = 'none'
      el.style.overflow = null

      clearInterval(this.interval)
    }
  }, this.settings.slideSpeed / 100)
}

Limelight.prototype.hide = function hideTheElement () {
  if (this.visible || this.element.classList.contains(this.settings.visibleClass)) {
    Limelight.removeClass(this.element, this.settings.visibleClass)

    if (this.settings.triggerClass) {
      const triggerElement = document.querySelector(`[data-target="${this.target}"]`)
      Limelight.removeClass(triggerElement, this.settings.visibleClass)
    }
    if (this.settings.slide) {
      this.slideUp(this.settings.slideDuration)
    }
    Limelight.removeClass(document.body, this.settings.bodyClass)

    if (this.closeElement) {
      // When someone clicks the [data-close] button then we should close the modal
      this.closeElement.removeEventListener('click', Limelight.closeEvent)
    }
    if (this.innerElement) {
      // When someone clicks on the inner class hide the popup
      this.innerElement.removeEventListener('click', Limelight.closeEvent)
    }

    this.visible = false
    // Fire the success callback
    if (this.settings.hideCallback && typeof this.settings.hideCallback === 'function') {
      this.settings.hideCallback(this)
    }
  } else if (this.settings.error && typeof this.settings.error === 'function') {
    this.settings.error('Limelight: Error this element is already hidden', this)
  }
  return this
}

/*
  Show if hidden, hide if shown.
*/
Limelight.prototype.toggle = function toggleLimelightVisibility () {
  if (this.visible) {
    this.hide()
  } else {
    this.show()
  }
  return this
}

/*
  Move the element to the end of the body, sometime useful for popups.
*/
Limelight.prototype.detach = function moveTheElementToTheEndOfTheBody () {
  document.body.appendChild(this.element)
  return this
}

export default Limelight
