'use strict';


jQuery.extend(jQuery.fn, {
	within: function(pSelector) {
		return this.filter(function() {
			return $(this).closest(pSelector).length;
		});
	},
	filterAttrBegins: function(s) {
		return this.filter(function() {
			let matched = false;

			$.each(this.attributes, function(index, attr) {
				if (attr.name.indexOf(s) === 0) {
					matched = true;
					return false;
				}
			});

			return matched;
		});
	}
});


// CustomEvent polyfill - https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
(function() {
	if (typeof window.CustomEvent === "function") return false;

	function CustomEvent(event, params) {
		params = params || {bubbles: false, cancelable: false, detail: null};
		var evt = document.createEvent('CustomEvent');
		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return evt;
	}

	window.CustomEvent = CustomEvent;
})();

/*
 * Node.isConnected polyfill for IE and EdgeHTML
 * 2020-02-04
 *
 * By Eli Grey, https://eligrey.com
 * Public domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */
if (!('isConnected' in Node.prototype)) {
	Object.defineProperty(Node.prototype, 'isConnected', {
		get() {
			return (
				!this.ownerDocument ||
				!(
					this.ownerDocument.compareDocumentPosition(this) &
					this.DOCUMENT_POSITION_DISCONNECTED
				)
			);
		},
	});
}

// https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

// ajax header for webp support
window.hasWebpSupport = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
if (window.hasWebpSupport) {
	$.ajaxSetup({
		headers: {'Accept': '*/*,image/webp'}
	});
}


// UI handlers - binding various libs/tools to DOM elements
(function() {
	let onLoadHandlers = [];
	let onUnloadHandlers = [];

	window.uiHandlers = {
		onLoad: function (fn) {
			onLoadHandlers.push(fn);
		},
		onUnload: function (fn) {
			onUnloadHandlers.push(fn);
		},
		bind: function(el) {
			let $this = el || this;
			onLoadHandlers.forEach(function(fn) {
				fn.call($this);
			});
		},
		unbind: function(el) {
			let $this = el || this;
			onUnloadHandlers.forEach(function(fn) {
				fn.call($this);
			});
		},
	};

	window.initApp = function() {
		$(window).on('popstate', function(e) {
			if (e.originalEvent.state !== null) {
				location.reload()
			}
		});

		$.nette.init();
		window.uiHandlers.bind(document);
	};
})();
