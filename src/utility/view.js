/**
 * @module view
 * @description A module for checking if element is in view or not
 * @author Moss Pakhapoca
 */

const doc = document && document.documentElement;
const matchMedia = window.matchMedia || window.msMatchMedia;

let mediaQuery = (q) => {
    return matchMedia ? matchMedia.call(window, q).matches : false;
};

const viewport = () => {
    let h = doc.clientHeight < window.innerHeight;
    let w = doc.clientWidth < window.innerWidth;
    return {
        height: h ? window.innerHeight : doc.clientHeight,
        width: w ? window.innerWidth : doc.clientWidth
    };
};

let rect = (el) => {
    el = el && !el.nodeType ? el[0] : el;
    if (!el || 1 !== el.nodeType) return {};
    return el.getBoundingClientRect();
};

let inview = (el) => {
    let r = rect(el), v = viewport();
    return !!r && r.bottom >= 0 && r.right >= 0 && r.top <= v.height && r.left <= v.width;
};

let scroll = () => window.pageYOffset || doc.scrollTop;

export const view = {
    viewport: viewport,
    inview: inview,
    scroll: scroll
};