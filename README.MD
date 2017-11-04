# lazycouch.js

lazycouch.js is a lightweight Lazy Load written in plain Javascript. This module makes use of a new [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) (if available) with fallback to regular onscroll. 

* `npm install`
* `npm run start`
* Navigate to http://localhost:8080/

## Usage

Simply add `data-lazy-src` in place `src` attribute to img tag, then initialize the module:

```html5
<body>

	<img alt="Image" data-lazy-src="img/iamge.jpg">
    
    <script src="dist/lazycouch.js"></script>
    <script>
    	var lazy = new lazycouch({
        	defaultSelector: "img"
        });
    </script>
    
</body>
```

## Options

You can override the behavior of the lazycouch.js by passing an object containing configurations to the contructor.

#### useIO
Type: `Boolean` Default: `true`

The `useIO` is available for when you want to use onscroll by default.

#### useApp
Type: `Boolean` Default: `false`

By default lazycouch.js will an object reference to the document. The `useApp` is useful for when you'd like to limit the scope of the DOM tree.

#### container
Type: `Object` Default: `window.document`

Similar to `useApp` option, except you have to provide a reference to the DOM tree on your own. Useful for when you'd like to fine tune the scope of the DOM tree.

*Warning: `useApp` will take priority over `container` so do not use both at the same time*

#### defaultSelector
Type: `String` Default: `img[data-lazy-src]`

#### options
Type: `Object` Default: `{ root: null, rootMargin: "0px", threshold: null }`

This provides options to the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). 

#### callback
Type: `Function` Default: `null`

The `callback` allows a custom function to be called upon when any element is in the viewport.

#### useClass
Type: `Boolean` Default: `false`

Enable the `useClass` whenever you need to add/remove class.

#### loadingClass
Type: `String` Default: `is-lazyloading`

IF `useClass` is eneabled, a predefined class will be removed when an observed element is in viewport.

#### doneClass
Type: `String` Default: `is-lazydone`

Similar to `loadingClass` option, except a predefined class will be added instead.

#### onload
Type: `Boolean` Default: `true`

The `onload` makes lazycouch.js to wait until an entire has loaded to improve load speed. 

#### debounce
Type: `Number` Default: `250`

When onscroll event is used. This `debounce` option prevents performance bottleneck by only execute scroll function for only when a user has stopped scrolling.


## License

#### MIT