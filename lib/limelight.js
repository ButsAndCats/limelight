"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Limelight =
/*#__PURE__*/
function () {
  function Limelight(config) {
    _classCallCheck(this, Limelight);

    Limelight.elements = Limelight.elements || {};
    var set = config || {};
    var defaults = {
      visibleClass: 'visible',
      bodyClass: null,
      triggerClass: null,
      outerSelector: '.popup-outer',
      closeSelector: '[data-close]',
      autoFocusSelector: '[data-auto-focus]',
      slide: null,
      click: true,
      slideChild: null,
      visible: false,
      beforeShowCallback: null,
      beforeHideCallback: null,
      showCallback: null,
      hideCallback: null,
      error: null,
      target: null
    };
    this.settings = _extends(defaults, set);
    if (!this.settings.target) return console.error("Limelight: no target was provided");
    this.visible = this.settings.visible;
    this.target = this.settings.target;
    this.element = document.querySelector(this.target);
    var element = this.element,
        settings = this.settings;
    var slide = settings.slide,
        slideChild = settings.slideChild,
        outerSelector = settings.outerSelector,
        hideCallback = settings.hideCallback,
        showCallback = settings.showCallback,
        beforeHideCallback = settings.beforeHideCallback,
        beforeShowCallback = settings.beforeShowCallback;
    if (!element) return console.error("".concat(this.target, " target not found!"));
    this.outer = element.querySelector(outerSelector);

    if (slide) {
      this.slideElem = slideChild ? element.querySelector(slideChild) : element;
    }

    this.hasBeforeShowCallback = beforeShowCallback && typeof beforeShowCallback === 'function';
    this.hasBeforeHideCallback = beforeHideCallback && typeof beforeHideCallback === 'function';
    this.hasShowCallback = showCallback && typeof showCallback === 'function';
    this.hasHideCallback = hideCallback && typeof hideCallback === 'function';
    Limelight.elements[this.target] = this;
    this.init();
  }

  _createClass(Limelight, [{
    key: "escEvent",
    value: function escEvent(event) {
      if (event.keyCode === 27) {
        this.element.removeEventListener('keyup', this.escEvent);
        this.hide();
      }
    }
  }, {
    key: "eventHandler",
    value: function eventHandler(event, method) {
      event.preventDefault();
      var target = event.elem.dataset.target;
      var element = Limelight.elements[target] || new Limelight({
        target: target
      });
      return method ? element[method]() : element['toggle']();
    }
  }, {
    key: "init",
    value: function init() {
      var _this = this;

      var settings = this.settings,
          element = this.element;

      function on(top, eventName, selector, fn) {
        top.addEventListener(eventName, function (event) {
          var possibleTargets = top.querySelectorAll(selector);
          var target = event.target;

          for (var i = 0, l = possibleTargets.length; i < l; i++) {
            var el = target;
            var p = possibleTargets[i];

            while (el && el !== top) {
              if (el === p) {
                event.preventDefault();
                event.elem = p;
                return fn.call(p, event);
              }

              el = el.parentNode;
            }
          }
        }, true);
      }

      var trigger = "[data-trigger][data-target=\"".concat(this.target, "\"]");

      if (settings.click) {
        on(document.body, 'click', trigger, function (e) {
          return _this.eventHandler(e);
        });
      }

      if (settings.hover) {
        on(document.body, 'mouseenter', trigger, function (e) {
          return _this.eventHandler(e, 'show');
        });
      }

      on(element, 'click', settings.closeSelector, function (e) {
        return _this.closeEvent(e);
      });

      if (settings.slide) {
        window.addEventListener('resize', this.adjustSlideHeight.bind(this));
      }
    }
  }, {
    key: "closeEvent",
    value: function closeEvent(event) {
      var target = this.getTarget(event);
      target ? this.eventHandler(event, target, 'hide') : this.hide();
    }
  }, {
    key: "getTarget",
    value: function getTarget(event) {
      var element = event.elem || event.currentTarget;

      if (element.tagName === 'A') {
        event.preventDefault();
        console.warn("Limelight: It is not recommended to use links as trigger for accessibility reasons.");
      }

      var selector = element.dataset.target;
      var target = selector || null;
      return target;
    }
  }, {
    key: "toggleTriggers",
    value: function toggleTriggers(method) {
      var settings = this.settings,
          target = this.target;

      if (settings.triggerClass) {
        var triggerSelector = "[data-trigger][data-target=\"".concat(target, "\"]");
        var triggerElements = document.querySelectorAll(triggerSelector);

        for (var elem = 0; elem < triggerElements.length; elem += 1) {
          var tElem = triggerElements[elem];

          if (method === 'on') {
            tElem.classList.add(settings.triggerClass);
          } else {
            tElem.classList.remove(settings.triggerClass);
          }
        }
      }
    }
  }, {
    key: "isVisible",
    value: function isVisible() {
      var element = this.element,
          visible = this.visible,
          settings = this.settings;
      return visible || element.classList.contains(settings.visibleClass);
    }
  }, {
    key: "show",
    value: function show() {
      var _this2 = this;

      var settings = this.settings,
          target = this.target,
          element = this.element,
          outer = this.outer;
      var bodyClass = settings.bodyClass,
          visibleClass = settings.visibleClass;

      if (this.isVisible()) {
        return this;
      }

      if (this.hasBeforeShowCallback) {
        settings.beforeShowCallback(this, Limelight.elements);
      }

      this.visible = true;
      if (bodyClass) document.body.classList.add(bodyClass);
      element.classList.add(visibleClass);
      this.slideToggle('down');
      this.toggleTriggers('on');
      var autoFocus = document.querySelector("".concat(target, " ").concat(settings.autoFocusSelector));

      if (autoFocus) {
        autoFocus.focus();
      }

      if (outer) {
        outer.addEventListener('click', function (e) {
          return _this2.closeEvent(e);
        });
      }

      element.addEventListener('keyup', function (e) {
        return _this2.escEvent(e);
      });

      if (this.hasShowCallBack) {
        settings.showCallback(this);
      }

      return this;
    }
  }, {
    key: "slideToggle",
    value: function slideToggle(method) {
      var settings = this.settings,
          slideElem = this.slideElem;

      if (settings.slide) {
        var el = slideElem;

        if (method === 'up') {
          el.style.height = settings.visible ? 0 : null;
        } else {
          el.style.height = settings.visible ? null : "".concat(el.scrollHeight, "px");
        }
      }
    }
  }, {
    key: "adjustSlideHeight",
    value: function adjustSlideHeight() {
      if (!this.isVisible()) return;
      if (!this.settings.visible) return;
      var el = this.slideElem;
      el.style.height = "".concat(el.scrollHeight, "px");
    }
  }, {
    key: "hide",
    value: function hide() {
      var _this3 = this;

      var settings = this.settings,
          element = this.element,
          outer = this.outer;

      if (!this.isVisible()) {
        return this;
      }

      if (this.hasBeforeHideCallback) {
        settings.beforeHideCallback(this);
      }

      this.visible = false;

      if (settings.bodyClass) {
        document.body.classList.remove(settings.bodyClass);
      }

      element.classList.remove(settings.visibleClass);
      this.slideToggle('up');
      this.toggleTriggers('off');
      if (outer) this.outer.removeEventListener('click', function (e) {
        return _this3.closeEvent(e);
      });

      if (this.hasHideCallback) {
        settings.hideCallback(this);
      }

      return this;
    }
  }, {
    key: "toggle",
    value: function toggle() {
      this.isVisible() ? this.hide() : this.show();
      return this;
    }
  }]);

  return Limelight;
}();

exports.default = Limelight;