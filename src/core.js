"use strict";

import { view } from 'Utility/view';

const isIE = navigator.userAgent.indexOf('MSIE') !== -1,
    isIE11 = /Trident\/\d+.\d+;/.test(navigator.userAgent),
    reg = new RegExp("lazy[A-Z](.*)"),
    regComment = "lazyComment",
    regDone = "lazyDone";

const limitPoll = 3;
let limitCnt = 0;

let updateEvent,
    destroyEvent,
    doneEvent;

const dataSet = "data-lazy-src|data-lazy-srcset".split('|');

const defaults = {
    useIO: true,
    useApp: false, // Use app will limit the scope of DOM tree
    container: window.document,
    defaultSelector: "img[data-lazy-src]",
    options: {
        root: null, // Container. Leave as is if you want to use browser viewport
        rootMargin: "0px", // Threshold margin
        threshold: null, // The list of visibility ratio thresholds
    },
    callback: null,
    useClass: false,
    loadingClass: "is-lazyloading",
    doneClass: "is-lazydone",
    onload: true,
    debounce: 250
};

const isNull = (a) => Object.prototype.toString.call(a).indexOf("Null") !== -1;
const detach = (arr) => {
    return arr.filter((elem) => isNull(elem.getAttribute("data-lazy-done")));
}

function extend(out) {
    out = out || {};
    let i = 1, key, args = arguments;
    for (; i < args.length; i++) {
        if (!args[i]) continue;

        for (key in args[i])
            if (args[i].hasOwnProperty(key))
                out[key] = args[i][key];
    }
    return out;
}

function getAttrs(elem) {
    // Extract list of 'data' attribute
    if (isIE) {
        let _o = {};
        dataSet.forEach((el) => {
            switch (el) {
                case "data-lazy-src":
                    _o.lazySrc = elem.getAttribute(el);
                    break;
                case "data-lazy-srcset":
                    _o.lazySrcset = elem.getAttribute(el);
                    break;
                default:
                    break;
            }
        });
        console.log(_o);
        return _o;
    }
    return extend({}, elem.dataset);
}

function setAttrs(elem, conf) {
    let _a = getAttrs(elem),
        _tag = elem.tagName,
        _type = "";

    if (_a.lazySrcset) {
        elem.setAttribute("srcset", _a.lazySrcset);
    }
    if (_a.lazySrc) {
        if (_tag.indexOf("IMG", "IFRAME") !== -1) elem.setAttribute("src", _a.lazySrc);
        else elem.style.backgroundImage = 'url("' + _a.lazySrc + '")';
    }
}

function setDone(elem) {
    // Add a flag
    elem.setAttribute("data-lazy-done", true);
}

function showElements(elem, conf) {
    setAttrs(elem, conf);
    setDone(elem);
}

function removeClass(elem, cls) {
    if (!elem.classList)
        elem.className = elem.className.replace(new RegExp('(^|\\b)' 
        + cls.split(' ').join('|') 
        + '(\\b|$)', 'gi'), ' ');
    else 
        elem.classList.remove(cls);
}

function addClass(elem, cls) {
    if (elem.classList)
        elem.classList.add(cls);
    else
        elem.className += ' ' + cls;
}

function initpoll(inst) {
    let stop = limitCnt === limitPoll ? true : false;

    if (!stop) {
        for (let i = 0; i < inst._elements.length; i++) {
            if (view.inview(inst._elements[i])) {
                showElements(inst._elements[i], inst.conf);
                break;
            }
        } 
        limitCnt++;
        window.setTimeout(initpoll.bind(null, inst), inst.conf.debounce);
    }

}


/**
 * Constructor
 * @param {object} obj configuration object
 */
let lazycouch = function (obj) {
    const self = this;
    obj = Object.prototype.toString.call(obj) === "[object Object]" ? obj : {};
    self.conf = extend(defaults, obj);

    if (self.conf.container !== defaults.container && self.conf.useApp) {
        console.warn("Using \"useApp\" option has overrode the container setting. You've been warned");
    }

    if (self.conf.useApp) {
        self.conf.container = document.querySelector("*[data-lazy-app]");
        if (isNull(self.conf.container)) 
            throw new Error("Unable to find relavant element to attach to");
    }

    self._timeModel = 0;

    self.set();
    if (self.conf.onload) self.on('load', self.observe.bind(self));
    else self.observe();

    return self;
};

/**
 * window.addEventListener wrapper with multiple events hook support
 * @param {string} Event string. Multiple events are separated by white space
 * @param {function} Function callback
 */
lazycouch.prototype.on = function (type, callback) {
    if (typeof callback !== "function") {
        console.error(callback, " is not type of function");
        return this;
    } else if (typeof type !== "string") {
        console.error(type, " is not type of string");
        return this;
    }
    const self = this,
        addEvt = window.addEventListener;
        
    let _type = type.split(' ');
    let i, _e;

    for (i = 0; i < _type.length; i++) {
        _e = _type[i];
        addEvt(_e, callback);
    }

    return self;
};

/**
 * window.removeEventListener wrapper with multiple events hook support
 * @param {string} Event string. Multiple events are separated by white space
 * @param {function} Function callback
 */
lazycouch.prototype.off = function (type, callback) {
    if (typeof callback !== "function") {
        console.error(callback, " is not type of function");
        return this;
    } else if (typeof type !== "string") {
        console.error(type, " is not type of string");
        return this;
    }
    const rmvEvt = window.removeEventListener;
    let _type = type.split(' ');
    let i, _e;

    for (i = 0; i < _type.length; i++) {
        _e = _type[i];
        rmvEvt(_e, callback);
    }

    return self;
};

/**
 * Setting up the elements
 * @param element {HTMLElements|string} [optional]
 */
lazycouch.prototype.set = function () {
    const self = this;
    let elements, _arr;

    _arr = arguments.length > 0 ? arguments[0] : self.conf.defaultSelector;
    elements = typeof _arr === "string" ? self.conf.container.querySelectorAll(_arr) : _arr;
    self._elements = Array.prototype.slice.call(elements);
    
    return self;
};

/**
 * Setting up the observer, use Intersection Observer API if available
 */
lazycouch.prototype.observe = function () {
    const self = this,
        cb = self.conf.callback;
    let i, _el, _l, intstobs, 
        runcallback = 0;

    self._upd = function () {
        let elements, _arr;

        self._elements.forEach((elem) => {
            if (view.inview(elem))
                showElements(elem, self.conf);
        });

        self._elements = detach(self._elements);

        // Detach resize event if all elements are detached
        if (self._elements.length < 1) {
            self.off('resize', self._upd);
        }
    };

    if (window["IntersectionObserver"] === void 0) {
        console.warn("IntersectionObserver is not supported on this browser." 
            + "Falling back to scroll-based event");
        self.conf.useIO = false;
    }

    if (self.conf.useIO) {
        console.log("Using IntersectionObserver API");

        intstobs = (el) => {
            runcallback = 0;
            el.forEach((entry) => {
                if (entry.intersectionRatio) {
                    showElements(entry.target, self.conf);

                    if (self.conf.useClass) {
                        removeClass(entry.target, self.conf.loadingClass);
                        addClass(entry.target, self.conf.doneClass);
                    }

                    self._obsvr.unobserve(entry.target);
                    if (typeof cb === "function") runcallback = 1;
                }
            });
            self._elements = detach(self._elements);
            if (runcallback) cb.call(null);
        };

        self._obsvr = new IntersectionObserver(intstobs, self.conf.options);

        self._elements.forEach((el) => {
            self._obsvr.observe(el);
        });

    } else {
        console.log("Using scroll event");
        
        self._sc = function (ev) {
            _l = self._elements.length;

            window.clearTimeout(self._timeModel);
            runcallback = 0;

            if (_l < 1) {
                // Unattach the event itself once all elements are loaded
                self.off('scroll', self._sc);
                return;
            }

            // Debouncing to prevent performance bottlenecking 
            self._timeModel = window.setTimeout(() => {
                for (i = 0; i < _l; i++) {
                    _el = self._elements[i];
                    if (view.inview(_el)) {
                        showElements(_el, self.conf);

                        if (self.conf.useClass) {
                            removeClass(_el, self.conf.loadingClass);
                            addClass(_el, self.conf.doneClass);
                        }

                        if (typeof cb === "function") runcallback = 1;
                    }
                }
                self._elements = detach(self._elements);
                if (runcallback) cb.call(null);
            }, self.conf.debounce);
        };
        self.on('scroll', self._sc).on('resize', self._upd)
        
        // Update the elements on first initial view
        window.requestAnimationFrame(self._upd);
    }
    
    return self;
};

/**
 * Self-destruct. Game over man.
 */
lazycouch.prototype.destroy = function() {
    // Self-destruct. Game over man.
    const self = this;
    let _arr = detach(self._elements);

    if (self._obsvr) {
        _arr.forEach((el) => {
            self._obsvr.unobserve(el);
        });
        self._obsvr = null;
    } else {
        self.off('scroll', self._sc).off('resize', self._upd);
    }

    self._elements = [];
    self.conf = {};

    return self;
};

module.exports = lazycouch;