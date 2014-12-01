(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Router = require('director').Router;
var Regular = require("regularjs");
var book = require('./controller/book.js');

var currentView;
var recycle = document.createElement('div');
function show(controller) {
	return function() {
		var args = [].slice.call(arguments);
		args.push(function cb(view) {
			if(currentView){
				currentView.$inject(recycle);
			}
			currentView = view;
			currentView.$inject('#view');
		});
		controller.apply(null, args);
	};
}

var routes = {
	'/books': show(book.list),
	'/books/:bookId': show(book.get)
};

var router = Router(routes);

router.init();
},{"./controller/book.js":2,"director":9,"regularjs":10}],2:[function(require,module,exports){
var BookView = require("../view/book.js");
var BooksView = require("../view/books.js");
var bookService = require("../service/book.js");
var bookController = {};
bookController.list = function(cb) {
	bookService.getList(function(books) {
		cb(new BooksView({
			data: {
				books: books
			}
		}));
	});
};
bookController.get = function(bookId, cb) {
	bookService.getBookById(parseInt(bookId), function(book) {
		cb(new BookView({
			data: {
				book: book
			}
		}));
	});
};
module.exports = bookController;
},{"../service/book.js":4,"../view/book.js":6,"../view/books.js":8}],3:[function(require,module,exports){
var reqwest = require("reqwest");
var bookDAO = {};

bookDAO.getList = function(cb) {
	reqwest({
		url: "/api/books",
		method: "get",
		type: "json",
		success: function(books){
			cb(books);
		}
	});
};
bookDAO.getBookById = function(id, cb) {
	reqwest({
		url: "/api/books",
		method: "get",
		type: "json",
		data: {id: id},
		success: function(book){
			cb(book);
		}
	});
};
module.exports = bookDAO;
},{"reqwest":28}],4:[function(require,module,exports){
var bookDAO = require("../dao/book.js");
var bookService = {};

bookService.getList = function(cb) {
	bookDAO.getList(cb);
};
bookService.getBookById = function(id, cb) {
	bookDAO.getBookById(id, cb);
};
module.exports = bookService;
},{"../dao/book.js":3}],5:[function(require,module,exports){
module.exports="<dl>	<dt>{{book.name}}</dt>	<dd>{{book.author}}</dd>	<dd>{{book.publisher}}</dd></dl>"
},{}],6:[function(require,module,exports){
var Regular = require("regularjs");
var html = require("./book.html");

var BookView = Regular.extend({
	name: 'book',
	template: html
});
module.exports = BookView;
},{"./book.html":5,"regularjs":10}],7:[function(require,module,exports){
module.exports="<table>	<thead>		<tr>			<th>书名</th>			<th>作者</th>			<th>出版社</th>		</tr>	</thead>	<tbody>		{{#list books as book}}		<tr>			<td><a href=\"#/books/{{book.id}}\">{{book.name}}</a></td>			<td>{{book.author}}</td>			<td>{{book.publisher}}</td>		</tr>		{{/list}}	</tbody></table>"
},{}],8:[function(require,module,exports){
var Regular = require("regularjs");
var html = require("./books.html");

var BooksView = Regular.extend({
	name: 'books',
	template: html
});

module.exports = BooksView;
},{"./books.html":7,"regularjs":10}],9:[function(require,module,exports){


//
// Generated on Fri Dec 27 2013 12:02:11 GMT-0500 (EST) by Nodejitsu, Inc (Using Codesurgeon).
// Version 1.2.2
//

(function (exports) {

/*
 * browser.js: Browser specific functionality for director.
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

if (!Array.prototype.filter) {
  Array.prototype.filter = function(filter, that) {
    var other = [], v;
    for (var i = 0, n = this.length; i < n; i++) {
      if (i in this && filter.call(that, v = this[i], i, this)) {
        other.push(v);
      }
    }
    return other;
  };
}

if (!Array.isArray){
  Array.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };
}

var dloc = document.location;

function dlocHashEmpty() {
  // Non-IE browsers return '' when the address bar shows '#'; Director's logic
  // assumes both mean empty.
  return dloc.hash === '' || dloc.hash === '#';
}

var listener = {
  mode: 'modern',
  hash: dloc.hash,
  history: false,

  check: function () {
    var h = dloc.hash;
    if (h != this.hash) {
      this.hash = h;
      this.onHashChanged();
    }
  },

  fire: function () {
    if (this.mode === 'modern') {
      this.history === true ? window.onpopstate() : window.onhashchange();
    }
    else {
      this.onHashChanged();
    }
  },

  init: function (fn, history) {
    var self = this;
    this.history = history;

    if (!Router.listeners) {
      Router.listeners = [];
    }

    function onchange(onChangeEvent) {
      for (var i = 0, l = Router.listeners.length; i < l; i++) {
        Router.listeners[i](onChangeEvent);
      }
    }

    //note IE8 is being counted as 'modern' because it has the hashchange event
    if ('onhashchange' in window && (document.documentMode === undefined
      || document.documentMode > 7)) {
      // At least for now HTML5 history is available for 'modern' browsers only
      if (this.history === true) {
        // There is an old bug in Chrome that causes onpopstate to fire even
        // upon initial page load. Since the handler is run manually in init(),
        // this would cause Chrome to run it twise. Currently the only
        // workaround seems to be to set the handler after the initial page load
        // http://code.google.com/p/chromium/issues/detail?id=63040
        setTimeout(function() {
          window.onpopstate = onchange;
        }, 500);
      }
      else {
        window.onhashchange = onchange;
      }
      this.mode = 'modern';
    }
    else {
      //
      // IE support, based on a concept by Erik Arvidson ...
      //
      var frame = document.createElement('iframe');
      frame.id = 'state-frame';
      frame.style.display = 'none';
      document.body.appendChild(frame);
      this.writeFrame('');

      if ('onpropertychange' in document && 'attachEvent' in document) {
        document.attachEvent('onpropertychange', function () {
          if (event.propertyName === 'location') {
            self.check();
          }
        });
      }

      window.setInterval(function () { self.check(); }, 50);

      this.onHashChanged = onchange;
      this.mode = 'legacy';
    }

    Router.listeners.push(fn);

    return this.mode;
  },

  destroy: function (fn) {
    if (!Router || !Router.listeners) {
      return;
    }

    var listeners = Router.listeners;

    for (var i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i] === fn) {
        listeners.splice(i, 1);
      }
    }
  },

  setHash: function (s) {
    // Mozilla always adds an entry to the history
    if (this.mode === 'legacy') {
      this.writeFrame(s);
    }

    if (this.history === true) {
      window.history.pushState({}, document.title, s);
      // Fire an onpopstate event manually since pushing does not obviously
      // trigger the pop event.
      this.fire();
    } else {
      dloc.hash = (s[0] === '/') ? s : '/' + s;
    }
    return this;
  },

  writeFrame: function (s) {
    // IE support...
    var f = document.getElementById('state-frame');
    var d = f.contentDocument || f.contentWindow.document;
    d.open();
    d.write("<script>_hash = '" + s + "'; onload = parent.listener.syncHash;<script>");
    d.close();
  },

  syncHash: function () {
    // IE support...
    var s = this._hash;
    if (s != dloc.hash) {
      dloc.hash = s;
    }
    return this;
  },

  onHashChanged: function () {}
};

var Router = exports.Router = function (routes) {
  if (!(this instanceof Router)) return new Router(routes);

  this.params   = {};
  this.routes   = {};
  this.methods  = ['on', 'once', 'after', 'before'];
  this.scope    = [];
  this._methods = {};

  this._insert = this.insert;
  this.insert = this.insertEx;

  this.historySupport = (window.history != null ? window.history.pushState : null) != null

  this.configure();
  this.mount(routes || {});
};

Router.prototype.init = function (r) {
  var self = this;
  this.handler = function(onChangeEvent) {
    var newURL = onChangeEvent && onChangeEvent.newURL || window.location.hash;
    var url = self.history === true ? self.getPath() : newURL.replace(/.*#/, '');
    self.dispatch('on', url.charAt(0) === '/' ? url : '/' + url);
  };

  listener.init(this.handler, this.history);

  if (this.history === false) {
    if (dlocHashEmpty() && r) {
      dloc.hash = r;
    } else if (!dlocHashEmpty()) {
      self.dispatch('on', '/' + dloc.hash.replace(/^(#\/|#|\/)/, ''));
    }
  }
  else {
    var routeTo = dlocHashEmpty() && r ? r : !dlocHashEmpty() ? dloc.hash.replace(/^#/, '') : null;
    if (routeTo) {
      window.history.replaceState({}, document.title, routeTo);
    }

    // Router has been initialized, but due to the chrome bug it will not
    // yet actually route HTML5 history state changes. Thus, decide if should route.
    if (routeTo || this.run_in_init === true) {
      this.handler();
    }
  }

  return this;
};

Router.prototype.explode = function () {
  var v = this.history === true ? this.getPath() : dloc.hash;
  if (v.charAt(1) === '/') { v=v.slice(1) }
  return v.slice(1, v.length).split("/");
};

Router.prototype.setRoute = function (i, v, val) {
  var url = this.explode();

  if (typeof i === 'number' && typeof v === 'string') {
    url[i] = v;
  }
  else if (typeof val === 'string') {
    url.splice(i, v, s);
  }
  else {
    url = [i];
  }

  listener.setHash(url.join('/'));
  return url;
};

//
// ### function insertEx(method, path, route, parent)
// #### @method {string} Method to insert the specific `route`.
// #### @path {Array} Parsed path to insert the `route` at.
// #### @route {Array|function} Route handlers to insert.
// #### @parent {Object} **Optional** Parent "routes" to insert into.
// insert a callback that will only occur once per the matched route.
//
Router.prototype.insertEx = function(method, path, route, parent) {
  if (method === "once") {
    method = "on";
    route = function(route) {
      var once = false;
      return function() {
        if (once) return;
        once = true;
        return route.apply(this, arguments);
      };
    }(route);
  }
  return this._insert(method, path, route, parent);
};

Router.prototype.getRoute = function (v) {
  var ret = v;

  if (typeof v === "number") {
    ret = this.explode()[v];
  }
  else if (typeof v === "string"){
    var h = this.explode();
    ret = h.indexOf(v);
  }
  else {
    ret = this.explode();
  }

  return ret;
};

Router.prototype.destroy = function () {
  listener.destroy(this.handler);
  return this;
};

Router.prototype.getPath = function () {
  var path = window.location.pathname;
  if (path.substr(0, 1) !== '/') {
    path = '/' + path;
  }
  return path;
};
function _every(arr, iterator) {
  for (var i = 0; i < arr.length; i += 1) {
    if (iterator(arr[i], i, arr) === false) {
      return;
    }
  }
}

function _flatten(arr) {
  var flat = [];
  for (var i = 0, n = arr.length; i < n; i++) {
    flat = flat.concat(arr[i]);
  }
  return flat;
}

function _asyncEverySeries(arr, iterator, callback) {
  if (!arr.length) {
    return callback();
  }
  var completed = 0;
  (function iterate() {
    iterator(arr[completed], function(err) {
      if (err || err === false) {
        callback(err);
        callback = function() {};
      } else {
        completed += 1;
        if (completed === arr.length) {
          callback();
        } else {
          iterate();
        }
      }
    });
  })();
}

function paramifyString(str, params, mod) {
  mod = str;
  for (var param in params) {
    if (params.hasOwnProperty(param)) {
      mod = params[param](str);
      if (mod !== str) {
        break;
      }
    }
  }
  return mod === str ? "([._a-zA-Z0-9-]+)" : mod;
}

function regifyString(str, params) {
  var matches, last = 0, out = "";
  while (matches = str.substr(last).match(/[^\w\d\- %@&]*\*[^\w\d\- %@&]*/)) {
    last = matches.index + matches[0].length;
    matches[0] = matches[0].replace(/^\*/, "([_.()!\\ %@&a-zA-Z0-9-]+)");
    out += str.substr(0, matches.index) + matches[0];
  }
  str = out += str.substr(last);
  var captures = str.match(/:([^\/]+)/ig), capture, length;
  if (captures) {
    length = captures.length;
    for (var i = 0; i < length; i++) {
      capture = captures[i];
      if (capture.slice(0, 2) === "::") {
        str = capture.slice(1);
      } else {
        str = str.replace(capture, paramifyString(capture, params));
      }
    }
  }
  return str;
}

function terminator(routes, delimiter, start, stop) {
  var last = 0, left = 0, right = 0, start = (start || "(").toString(), stop = (stop || ")").toString(), i;
  for (i = 0; i < routes.length; i++) {
    var chunk = routes[i];
    if (chunk.indexOf(start, last) > chunk.indexOf(stop, last) || ~chunk.indexOf(start, last) && !~chunk.indexOf(stop, last) || !~chunk.indexOf(start, last) && ~chunk.indexOf(stop, last)) {
      left = chunk.indexOf(start, last);
      right = chunk.indexOf(stop, last);
      if (~left && !~right || !~left && ~right) {
        var tmp = routes.slice(0, (i || 1) + 1).join(delimiter);
        routes = [ tmp ].concat(routes.slice((i || 1) + 1));
      }
      last = (right > left ? right : left) + 1;
      i = 0;
    } else {
      last = 0;
    }
  }
  return routes;
}

Router.prototype.configure = function(options) {
  options = options || {};
  for (var i = 0; i < this.methods.length; i++) {
    this._methods[this.methods[i]] = true;
  }
  this.recurse = options.recurse || this.recurse || false;
  this.async = options.async || false;
  this.delimiter = options.delimiter || "/";
  this.strict = typeof options.strict === "undefined" ? true : options.strict;
  this.notfound = options.notfound;
  this.resource = options.resource;
  this.history = options.html5history && this.historySupport || false;
  this.run_in_init = this.history === true && options.run_handler_in_init !== false;
  this.every = {
    after: options.after || null,
    before: options.before || null,
    on: options.on || null
  };
  return this;
};

Router.prototype.param = function(token, matcher) {
  if (token[0] !== ":") {
    token = ":" + token;
  }
  var compiled = new RegExp(token, "g");
  this.params[token] = function(str) {
    return str.replace(compiled, matcher.source || matcher);
  };
};

Router.prototype.on = Router.prototype.route = function(method, path, route) {
  var self = this;
  if (!route && typeof path == "function") {
    route = path;
    path = method;
    method = "on";
  }
  if (Array.isArray(path)) {
    return path.forEach(function(p) {
      self.on(method, p, route);
    });
  }
  if (path.source) {
    path = path.source.replace(/\\\//ig, "/");
  }
  if (Array.isArray(method)) {
    return method.forEach(function(m) {
      self.on(m.toLowerCase(), path, route);
    });
  }
  path = path.split(new RegExp(this.delimiter));
  path = terminator(path, this.delimiter);
  this.insert(method, this.scope.concat(path), route);
};

Router.prototype.dispatch = function(method, path, callback) {
  var self = this, fns = this.traverse(method, path, this.routes, ""), invoked = this._invoked, after;
  this._invoked = true;
  if (!fns || fns.length === 0) {
    this.last = [];
    if (typeof this.notfound === "function") {
      this.invoke([ this.notfound ], {
        method: method,
        path: path
      }, callback);
    }
    return false;
  }
  if (this.recurse === "forward") {
    fns = fns.reverse();
  }
  function updateAndInvoke() {
    self.last = fns.after;
    self.invoke(self.runlist(fns), self, callback);
  }
  after = this.every && this.every.after ? [ this.every.after ].concat(this.last) : [ this.last ];
  if (after && after.length > 0 && invoked) {
    if (this.async) {
      this.invoke(after, this, updateAndInvoke);
    } else {
      this.invoke(after, this);
      updateAndInvoke();
    }
    return true;
  }
  updateAndInvoke();
  return true;
};

Router.prototype.invoke = function(fns, thisArg, callback) {
  var self = this;
  var apply;
  if (this.async) {
    apply = function(fn, next) {
      if (Array.isArray(fn)) {
        return _asyncEverySeries(fn, apply, next);
      } else if (typeof fn == "function") {
        fn.apply(thisArg, fns.captures.concat(next));
      }
    };
    _asyncEverySeries(fns, apply, function() {
      if (callback) {
        callback.apply(thisArg, arguments);
      }
    });
  } else {
    apply = function(fn) {
      if (Array.isArray(fn)) {
        return _every(fn, apply);
      } else if (typeof fn === "function") {
        return fn.apply(thisArg, fns.captures || []);
      } else if (typeof fn === "string" && self.resource) {
        self.resource[fn].apply(thisArg, fns.captures || []);
      }
    };
    _every(fns, apply);
  }
};

Router.prototype.traverse = function(method, path, routes, regexp, filter) {
  var fns = [], current, exact, match, next, that;
  function filterRoutes(routes) {
    if (!filter) {
      return routes;
    }
    function deepCopy(source) {
      var result = [];
      for (var i = 0; i < source.length; i++) {
        result[i] = Array.isArray(source[i]) ? deepCopy(source[i]) : source[i];
      }
      return result;
    }
    function applyFilter(fns) {
      for (var i = fns.length - 1; i >= 0; i--) {
        if (Array.isArray(fns[i])) {
          applyFilter(fns[i]);
          if (fns[i].length === 0) {
            fns.splice(i, 1);
          }
        } else {
          if (!filter(fns[i])) {
            fns.splice(i, 1);
          }
        }
      }
    }
    var newRoutes = deepCopy(routes);
    newRoutes.matched = routes.matched;
    newRoutes.captures = routes.captures;
    newRoutes.after = routes.after.filter(filter);
    applyFilter(newRoutes);
    return newRoutes;
  }
  if (path === this.delimiter && routes[method]) {
    next = [ [ routes.before, routes[method] ].filter(Boolean) ];
    next.after = [ routes.after ].filter(Boolean);
    next.matched = true;
    next.captures = [];
    return filterRoutes(next);
  }
  for (var r in routes) {
    if (routes.hasOwnProperty(r) && (!this._methods[r] || this._methods[r] && typeof routes[r] === "object" && !Array.isArray(routes[r]))) {
      current = exact = regexp + this.delimiter + r;
      if (!this.strict) {
        exact += "[" + this.delimiter + "]?";
      }
      match = path.match(new RegExp("^" + exact));
      if (!match) {
        continue;
      }
      if (match[0] && match[0] == path && routes[r][method]) {
        next = [ [ routes[r].before, routes[r][method] ].filter(Boolean) ];
        next.after = [ routes[r].after ].filter(Boolean);
        next.matched = true;
        next.captures = match.slice(1);
        if (this.recurse && routes === this.routes) {
          next.push([ routes.before, routes.on ].filter(Boolean));
          next.after = next.after.concat([ routes.after ].filter(Boolean));
        }
        return filterRoutes(next);
      }
      next = this.traverse(method, path, routes[r], current);
      if (next.matched) {
        if (next.length > 0) {
          fns = fns.concat(next);
        }
        if (this.recurse) {
          fns.push([ routes[r].before, routes[r].on ].filter(Boolean));
          next.after = next.after.concat([ routes[r].after ].filter(Boolean));
          if (routes === this.routes) {
            fns.push([ routes["before"], routes["on"] ].filter(Boolean));
            next.after = next.after.concat([ routes["after"] ].filter(Boolean));
          }
        }
        fns.matched = true;
        fns.captures = next.captures;
        fns.after = next.after;
        return filterRoutes(fns);
      }
    }
  }
  return false;
};

Router.prototype.insert = function(method, path, route, parent) {
  var methodType, parentType, isArray, nested, part;
  path = path.filter(function(p) {
    return p && p.length > 0;
  });
  parent = parent || this.routes;
  part = path.shift();
  if (/\:|\*/.test(part) && !/\\d|\\w/.test(part)) {
    part = regifyString(part, this.params);
  }
  if (path.length > 0) {
    parent[part] = parent[part] || {};
    return this.insert(method, path, route, parent[part]);
  }
  if (!part && !path.length && parent === this.routes) {
    methodType = typeof parent[method];
    switch (methodType) {
     case "function":
      parent[method] = [ parent[method], route ];
      return;
     case "object":
      parent[method].push(route);
      return;
     case "undefined":
      parent[method] = route;
      return;
    }
    return;
  }
  parentType = typeof parent[part];
  isArray = Array.isArray(parent[part]);
  if (parent[part] && !isArray && parentType == "object") {
    methodType = typeof parent[part][method];
    switch (methodType) {
     case "function":
      parent[part][method] = [ parent[part][method], route ];
      return;
     case "object":
      parent[part][method].push(route);
      return;
     case "undefined":
      parent[part][method] = route;
      return;
    }
  } else if (parentType == "undefined") {
    nested = {};
    nested[method] = route;
    parent[part] = nested;
    return;
  }
  throw new Error("Invalid route context: " + parentType);
};



Router.prototype.extend = function(methods) {
  var self = this, len = methods.length, i;
  function extend(method) {
    self._methods[method] = true;
    self[method] = function() {
      var extra = arguments.length === 1 ? [ method, "" ] : [ method ];
      self.on.apply(self, extra.concat(Array.prototype.slice.call(arguments)));
    };
  }
  for (i = 0; i < len; i++) {
    extend(methods[i]);
  }
};

Router.prototype.runlist = function(fns) {
  var runlist = this.every && this.every.before ? [ this.every.before ].concat(_flatten(fns)) : _flatten(fns);
  if (this.every && this.every.on) {
    runlist.push(this.every.on);
  }
  runlist.captures = fns.captures;
  runlist.source = fns.source;
  return runlist;
};

Router.prototype.mount = function(routes, path) {
  if (!routes || typeof routes !== "object" || Array.isArray(routes)) {
    return;
  }
  var self = this;
  path = path || [];
  if (!Array.isArray(path)) {
    path = path.split(self.delimiter);
  }
  function insertOrMount(route, local) {
    var rename = route, parts = route.split(self.delimiter), routeType = typeof routes[route], isRoute = parts[0] === "" || !self._methods[parts[0]], event = isRoute ? "on" : rename;
    if (isRoute) {
      rename = rename.slice((rename.match(new RegExp("^" + self.delimiter)) || [ "" ])[0].length);
      parts.shift();
    }
    if (isRoute && routeType === "object" && !Array.isArray(routes[route])) {
      local = local.concat(parts);
      self.mount(routes[route], local);
      return;
    }
    if (isRoute) {
      local = local.concat(rename.split(self.delimiter));
      local = terminator(local, self.delimiter);
    }
    self.insert(event, local, routes[route]);
  }
  for (var route in routes) {
    if (routes.hasOwnProperty(route)) {
      insertOrMount(route, path.slice(0));
    }
  }
};



}(typeof exports === "object" ? exports : window));
},{}],10:[function(require,module,exports){

var Lexer = require("./parser/Lexer.js");
var Parser = require("./parser/Parser.js");
var dom = require("./dom.js");
var config = require("./config.js");
var Group = require('./group.js');
var _ = require('./util');
var extend = require('./helper/extend.js');
var Event = require('./helper/event.js');
var combine = require('./helper/combine.js');
var Watcher = require('./helper/watcher.js');
var parse = require('./helper/parse.js');
var doc = typeof document==='undefined'? {} : document;
var env = require('./env.js');


/**
* `Regular` is regularjs's NameSpace and BaseClass. Every Component is inherited from it
* 
* @class Regular
* @module Regular
* @constructor
* @param {Object} options specification of the component
*/
var Regular = function(options){
  var prevRunning = env.isRunning;
  env.isRunning = true;
  var node, template;

  options = options || {};
  options.data = options.data || {};
  options.computed = options.computed || {};
  if(this.data) _.extend(options.data, this.data);
  if(this.computed) _.extend(options.computed, this.computed);
  _.extend(this, options, true);
  if(this.$parent){
     this.$parent._append(this);
  }
  this._children = [];
  this.$refs = {};

  template = this.template;

  // template is a string (len < 40). we will find it container first
  if((typeof template === 'string' && template.length < 40) && (node = dom.find(template))) {
    template = node.innerHTML;
  }
  // if template is a xml
  if(template && template.nodeType) template = template.innerHTML;
  if(typeof template === 'string') this.template = new Parser(template).parse();

  this.computed = handleComputed(this.computed);
  this.$context = this.$context || this;
  this.$root = this.$root || this;
  // if have events
  if(this.events){
    this.$on(this.events);
    this.events = null;
  }

  this.config && this.config(this.data);
  // handle computed
  if(template){
    this.group = this.$compile(this.template, {namespace: options.namespace});
    combine.node(this);
  }


  if(this.$root === this) this.$update();
  this.$ready = true;
  if(this.$context === this) this.$emit("$init");
  if( this.init ) this.init(this.data);

  // @TODO: remove, maybe , there is no need to update after init; 
  // if(this.$root === this) this.$update();
  env.isRunning = prevRunning;

  // children is not required;
}


var walkers = require('./walkers.js');
walkers.Regular = Regular;


// description
// -------------------------
// 1. Regular and derived Class use same filter
_.extend(Regular, {
  // private data stuff
  _directives: { __regexp__:[] },
  _plugins: {},
  _exprCache:{},
  _running: false,
  _config: config,
  _protoInheritCache: ['use', 'directive'] ,
  __after__: function(supr, o) {

    var template;
    this.__after__ = supr.__after__;

    if(o.name) Regular.component(o.name, this);
    if(template = o.template){
      var node, name;
      if( typeof template === 'string' && template.length < 20 && ( node = dom.find( template )) ){
        template = node.innerHTML;
        if(name = dom.attr(node, 'name')) Regular.component(name, this);
      }

      if(template.nodeType) template = template.innerHTML;

      if(typeof template === 'string'){
        this.prototype.template = new Parser(template).parse();
      }
    }

    if(o.computed) this.prototype.computed = handleComputed(o.computed);
    // inherit directive and other config from supr
    Regular._inheritConfig(this, supr);

  },
  /**
   * Define a directive
   *
   * @method directive
   * @return {Object} Copy of ...
   */  
  directive: function(name, cfg){

    if(_.typeOf(name) === "object"){
      for(var k in name){
        if(name.hasOwnProperty(k)) this.directive(k, name[k]);
      }
      return this;
    }
    var type = _.typeOf(name);
    var directives = this._directives, directive;
    if(cfg == null){
      if( type === "string" && (directive = directives[name]) ) return directive;
      else{
        var regexp = directives.__regexp__;
        for(var i = 0, len = regexp.length; i < len ; i++){
          directive = regexp[i];
          var test = directive.regexp.test(name);
          if(test) return directive;
        }
      }
      return undefined;
    }
    if(typeof cfg === 'function') cfg = { link: cfg } 
    if(type === 'string') directives[name] = cfg;
    else if(type === 'regexp'){
      cfg.regexp = name;
      directives.__regexp__.push(cfg)
    }
    return this
  },
  plugin: function(name, fn){
    var plugins = this._plugins;
    if(fn == null) return plugins[name];
    plugins[name] = fn;
    return this;
  },
  use: function(fn){
    if(typeof fn === "string") fn = Regular.plugin(fn);
    if(typeof fn !== "function") return this;
    fn(this, Regular);
    return this;
  },
  // config the Regularjs's global
  config: function(name, value){
    var needGenLexer = false;
    if(typeof name === "object"){
      for(var i in name){
        // if you config
        if( i ==="END" || i==='BEGIN' )  needGenLexer = true;
        config[i] = name[i];
      }
    }
    if(needGenLexer) Lexer.setup();
  },
  expression: parse.expression,
  parse: parse.parse,

  Parser: Parser,
  Lexer: Lexer,

  _addProtoInheritCache: function(name){
    if( Array.isArray( name ) ){
      return name.forEach(Regular._addProtoInheritCache);
    }
    var cacheKey = "_" + name + "s"
    Regular._protoInheritCache.push(name)
    Regular[cacheKey] = {};
    Regular[name] = function(key, cfg){
      var cache = this[cacheKey];

      if(typeof key === "object"){
        for(var i in key){
          if(key.hasOwnProperty(i)) this[name](i, key[i]);
        }
        return this;
      }
      if(cfg == null) return cache[key];
      cache[key] = cfg;
      return this;
    }
  },
  _inheritConfig: function(self, supr){

    // prototype inherit some Regular property
    // so every Component will have own container to serve directive, filter etc..
    var defs = Regular._protoInheritCache;
    var keys = _.slice(defs);
    keys.forEach(function(key){
      self[key] = supr[key];
      var cacheKey = '_' + key + 's';
      if(supr[cacheKey]) self[cacheKey] = _.createObject(supr[cacheKey]);
    })
    return self;
  }

});

extend(Regular);

Regular._addProtoInheritCache(["filter", "component"])


Event.mixTo(Regular);
Watcher.mixTo(Regular);

Regular.implement({
  init: function(){},
  config: function(){},
  destroy: function(){
    // destroy event wont propgation;
    if(this.$context === this) this.$emit("$destroy");
    this.group && this.group.destroy(true);
    this.group = null;
    this.parentNode = null;
    this._watchers = null;
    this._children = [];
    var parent = this.$parent;
    if(parent){
      var index = parent._children.indexOf(this);
      parent._children.splice(index,1);
    }
    this.$parent = null;
    this.$root = null;
    this._handles = null;
    this.$refs = null;
  },

  /**
   * compile a block ast ; return a group;
   * @param  {Array} parsed ast
   * @param  {[type]} record
   * @return {[type]}
   */
  $compile: function(ast, options){
    options = options || {};
    if(typeof ast === 'string'){
      ast = new Parser(ast).parse()
    }
    var preNs = this.__ns__,
      record = options.record, 
      records;
    if(options.namespace) this.__ns__ = options.namespace;
    if(record) this._record();
    var group = this._walk(ast, options);
    if(record){
      records = this._release();
      var self = this;
      if(records.length){
        // auto destroy all wather;
        group.ondestroy = function(){ self.$unwatch(records); }
      }
    }
    if(options.namespace) this.__ns__ = preNs;
    return group;
  },


  /**
   * create two-way binding with another component;
   * *warn*: 
   *   expr1 and expr2 must can operate set&get, for example: the 'a.b' or 'a[b + 1]' is set-able, but 'a.b + 1' is not, 
   *   beacuse Regular dont know how to inverse set through the expression;
   *   
   *   if before $bind, two component's state is not sync, the component(passed param) will sync with the called component;
   *
   * *example: *
   *
   * ```javascript
   * // in this example, we need to link two pager component
   * var pager = new Pager({}) // pager compoennt
   * var pager2 = new Pager({}) // another pager component
   * pager.$bind(pager2, 'current'); // two way bind throw two component
   * pager.$bind(pager2, 'total');   // 
   * // or just
   * pager.$bind(pager2, {"current": "current", "total": "total"}) 
   * ```
   * 
   * @param  {Regular} component the
   * @param  {String|Expression} expr1     required, self expr1 to operate binding
   * @param  {String|Expression} expr2     optional, other component's expr to bind with, if not passed, the expr2 will use the expr1;
   * @return          this;
   */
  $bind: function(component, expr1, expr2){
    var type = _.typeOf(expr1);
    if( expr1.type === 'expression' || type === 'string' ){
      this._bind(component, expr1, expr2)
    }else if( type === "array" ){ // multiply same path binding through array
      for(var i = 0, len = expr1.length; i < len; i++){
        this._bind(component, expr1[i]);
      }
    }else if(type === "object"){
      for(var i in expr1) if(expr1.hasOwnProperty(i)){
        this._bind(component, i, expr1[i]);
      }
    }
    // digest
    component.$update();
    return this;
  },
  /**
   * unbind one component( see $bind also)
   *
   * unbind will unbind all relation between two component
   * 
   * @param  {Regular} component [description]
   * @return {This}    this
   */
  $unbind: function(){
    // todo
  },
  $get: function(expr){
    return parse.expression(expr).get(this);
  },
  $inject: function(node, position){
    var fragment = combine.node(this);
    if(typeof node === 'string') node = dom.find(node);
    if(!node) throw 'injected node is not found';
    if(!fragment) return;
    dom.inject(fragment, node, position);
    this.$emit("$inject", node);
    this.parentNode = Array.isArray(fragment)? fragment[0].parentNode: fragment.parentNode;
    return this;
  },
  // private bind logic
  _bind: function(component, expr1, expr2){

    var self = this;
    // basic binding

    if(!component || !(component instanceof Regular)) throw "$bind() should pass Regular component as first argument";
    if(!expr1) throw "$bind() should  pass as least one expression to bind";

    if(!expr2) expr2 = expr1;

    expr1 = parse.expression( expr1 );
    expr2 = parse.expression( expr2 );

    // set is need to operate setting ;
    if(expr2.set){
      var wid1 = this.$watch( expr1, function(value){
        component.$update(expr2, value)
      });
      component.$on('$destroy', function(){
        self.$unwatch(wid1)
      })
    }
    if(expr1.set){
      var wid2 = component.$watch(expr2, function(value){
        self.$update(expr1, value)
      });
      // when brother destroy, we unlink this watcher
      this.$on('$destroy', component.$unwatch.bind(component,wid2))
    }
    // sync the component's state to called's state
    expr2.set(component, expr1.get(this));
  },
  _walk: function(ast, arg1){
    if( _.typeOf(ast) === 'array' ){
      var res = [];

      for(var i = 0, len = ast.length; i < len; i++){
        res.push( this._walk(ast[i], arg1) );
      }

      return new Group(res);
    }
    if(typeof ast === 'string') return doc.createTextNode(ast)
    return walkers[ast.type || "default"].call(this, ast, arg1);
  },
  _append: function(component){
    this._children.push(component);
    component.$root = this.$root;
    component.$parent = this;
  },
  _handleEvent: function(elem, type, value, attrs){
    var Component = this.constructor,
      fire = typeof value !== "function"? _.handleEvent.call( this, value, type ) : value,
      handler = Component.event(type), destroy;

    if ( handler ) {
      destroy = handler.call(this, elem, fire, attrs);
    } else {
      dom.on(elem, type, fire);
    }
    return handler ? destroy : function() {
      dom.off(elem, type, fire);
    }
  },
  // find filter
  _f_: function(name){
    var Component = this.constructor;
    var filter = Component.filter(name);
    if(typeof filter !== 'function') throw 'filter ' + name + 'is undefined';
    return filter;
  },
  // simple accessor get
  _sg_:function(path, defaults){
    var computed = this.computed,
      computedProperty = computed[path];
    if(computedProperty){
      if(computedProperty.get)  return computedProperty.get(this);
      else _.log("the computed '" + path + "' don't define the get function,  get data."+path + " altnately", "error")
    }
    return defaults;

  },
  // simple accessor set
  _ss_:function(path, value, data, op){
    var computed = this.computed,
      op = op || "=",
      computedProperty = computed[path],
      prev;

    if(op!== '='){
      prev = computedProperty? computedProperty.get(this): data[path];
      switch(op){
        case "+=":
          value = prev + value;
          break;
        case "-=":
          value = prev - value;
          break;
        case "*=":
          value = prev * value;
          break;
        case "/=":
          value = prev / value;
          break;
        case "%=":
          value = prev % value;
          break;
      }
    }  

    if(computedProperty) {
      if(computedProperty.set) return computedProperty.set(this, value);
      else _.log("the computed '" + path + "' don't define the set function,  assign data."+path + " altnately", "error" )
    }
    data[path] = value;
    return value;
  }
});

Regular.prototype.inject = Regular.prototype.$inject;

module.exports = Regular;



var handleComputed = (function(){
  // wrap the computed getter;
  function wrapGet(get){
    return function(context){
      var ctx = context.$context;
      return get.call(ctx, ctx.data );
    }
  }
  // wrap the computed setter;
  function wrapSet(set){
    return function(context, value){
      var ctx = context.$context;
      set.call( ctx, value, ctx.data );
      return value;
    }
  }

  return function(computed){
    if(!computed) return;
    var parsedComputed = {}, handle, pair, type;
    for(var i in computed){
      handle = computed[i]
      type = typeof handle;

      if(handle.type === 'expression'){
        parsedComputed[i] = handle;
        continue;
      }
      if( type === "string" ){
        parsedComputed[i] = parse.expression(handle)
      }else{
        pair = parsedComputed[i] = {type: 'expression'};
        if(type === "function" ){
          pair.get = wrapGet(handle);
        }else{
          if(handle.get) pair.get = wrapGet(handle.get);
          if(handle.set) pair.set = wrapSet(handle.set);
        }
      } 
    }
    return parsedComputed;
  }
})();

},{"./config.js":11,"./dom.js":12,"./env.js":13,"./group.js":14,"./helper/combine.js":16,"./helper/event.js":18,"./helper/extend.js":19,"./helper/parse.js":20,"./helper/watcher.js":22,"./parser/Lexer.js":23,"./parser/Parser.js":24,"./util":26,"./walkers.js":27}],11:[function(require,module,exports){

module.exports = {
'BEGIN': '{{',
'END': '}}'
}
},{}],12:[function(require,module,exports){

// thanks for angular && mootools for some concise&cross-platform  implemention
// =====================================

// The MIT License
// Copyright (c) 2010-2014 Google, Inc. http://angularjs.org

// ---
// license: MIT-style license. http://mootools.net

var dom = module.exports;
var env = require("./env.js");
var _ = require("./util");
var tNode = document.createElement('div')
var addEvent, removeEvent;
var noop = function(){}

var namespaces = {
  html: "http://www.w3.org/1999/xhtml",
  svg: "http://www.w3.org/2000/svg"
}

dom.body = document.body;

dom.doc = document;

// camelCase
function camelCase(str){
  return ("" + str).replace(/-\D/g, function(match){
    return match.charAt(1).toUpperCase();
  });
}


dom.tNode = tNode;

if(tNode.addEventListener){
  addEvent = function(node, type, fn) {
    node.addEventListener(type, fn, false);
  }
  removeEvent = function(node, type, fn) {
    node.removeEventListener(type, fn, false) 
  }
}else{
  addEvent = function(node, type, fn) {
    node.attachEvent('on' + type, fn);
  }
  removeEvent = function(node, type, fn) {
    node.detachEvent('on' + type, fn); 
  }
}


dom.msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
if (isNaN(dom.msie)) {
  dom.msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
}

dom.find = function(sl){
  if(document.querySelector) {
    try{
      return document.querySelector(sl);
    }catch(e){

    }
  }
  if(sl.indexOf('#')!==-1) return document.getElementById( sl.slice(1) );
}

dom.inject = function(node, refer, position){

  position = position || 'bottom';

  if(Array.isArray(node)){
    var tmp = node;
    node = dom.fragment();
    for(var i = 0,len = tmp.length; i < len ;i++){
      node.appendChild(tmp[i]);
    }
  }

  var firstChild, next;
  switch(position){
    case 'bottom':
      refer.appendChild( node );
      break;
    case 'top':
      if( firstChild = refer.firstChild ){
        refer.insertBefore( node, refer.firstChild );
      }else{
        refer.appendChild( node );
      }
      break;
    case 'after':
      if( next = refer.nextSibling ){
        next.parentNode.insertBefore( node, next );
      }else{
        refer.parentNode.appendChild( node );
      }
      break;
    case 'before':
      refer.parentNode.insertBefore( node, refer );
  }
}


dom.id = function(id){
  return document.getElementById(id);
}

// createElement 
dom.create = function(type, ns, attrs){
  if(ns === 'svg'){
    if(!env.svg) throw Error('the env need svg support')
    ns = namespaces.svg;
  }
  return !ns? document.createElement(type): document.createElementNS(ns, type);
}

// documentFragment
dom.fragment = function(){
  return document.createDocumentFragment();
}



var specialAttr = {
  'class': function(node, value){
    ('className' in node && (node.namespaceURI === namespaces.html || !node.namespaceURI)) ?
      node.className = (value || '') : node.setAttribute('class', value);
  },
  'for': function(node, value){
    ('htmlFor' in node) ? node.htmlFor = value : node.setAttribute('for', value);
  },
  'style': function(node, value){
    (node.style) ? node.style.cssText = value : node.setAttribute('style', value);
  },
  'value': function(node, value){
    node.value = (value != null) ? value : '';
  }
}


// attribute Setter & Getter
dom.attr = function(node, name, value){
  if (_.isBooleanAttr(name)) {
    if (typeof value !== 'undefined') {
      if (!!value) {
        node[name] = true;
        node.setAttribute(name, name);
        // lt ie7 . the javascript checked setting is in valid
        //http://bytes.com/topic/javascript/insights/799167-browser-quirk-dynamically-appended-checked-checkbox-does-not-appear-checked-ie
        if(dom.msie && dom.msie <=7 ) node.defaultChecked = true
      } else {
        node[name] = false;
        node.removeAttribute(name);
      }
    } else {
      return (node[name] ||
               (node.attributes.getNamedItem(name)|| noop).specified) ? name : undefined;
    }
  } else if (typeof (value) !== 'undefined') {
    // if in specialAttr;
    if(specialAttr[name]) specialAttr[name](node, value);
    else if(value === null) node.removeAttribute(name)
    else node.setAttribute(name, value);
  } else if (node.getAttribute) {
    // the extra argument "2" is to get the right thing for a.href in IE, see jQuery code
    // some elements (e.g. Document) don't have get attribute, so return undefined
    var ret = node.getAttribute(name, 2);
    // normalize non-existing attributes to undefined (as jQuery)
    return ret === null ? undefined : ret;
  }
}


dom.on = function(node, type, handler){
  var types = type.split(' ');
  handler.real = function(ev){
    handler.call(node, new Event(ev));
  }
  types.forEach(function(type){
    type = fixEventName(node, type);
    addEvent(node, type, handler.real);
  });
}
dom.off = function(node, type, handler){
  var types = type.split(' ');
  handler = handler.real || handler;
  types.forEach(function(type){
    type = fixEventName(node, type);
    removeEvent(node, type, handler);
  })
}


dom.text = (function (){
  var map = {};
  if (dom.msie && dom.msie < 9) {
    map[1] = 'innerText';    
    map[3] = 'nodeValue';    
  } else {
    map[1] = map[3] = 'textContent';
  }
  
  return function (node, value) {
    var textProp = map[node.nodeType];
    if (value == null) {
      return textProp ? node[textProp] : '';
    }
    node[textProp] = value;
  }
})();


dom.html = function( node, html ){
  if(typeof html === "undefined"){
    return node.innerHTML;
  }else{
    node.innerHTML = html;
  }
}

dom.replace = function(node, replaced){
  if(replaced.parentNode) replaced.parentNode.replaceChild(node, replaced);
}

dom.remove = function(node){
  if(node.parentNode) node.parentNode.removeChild(node);
}

// css Settle & Getter from angular
// =================================
// it isnt computed style 
dom.css = function(node, name, value){
  if( _.typeOf(name) === "object" ){
    for(var i in name){
      if( name.hasOwnProperty(i) ){
        dom.css( node, i, name[i] );
      }
    }
    return;
  }
  if ( typeof value !== "undefined" ) {

    name = camelCase(name);
    if(name) node.style[name] = value;

  } else {

    var val;
    if (dom.msie <= 8) {
      // this is some IE specific weirdness that jQuery 1.6.4 does not sure why
      val = node.currentStyle && node.currentStyle[name];
      if (val === '') val = 'auto';
    }
    val = val || node.style[name];
    if (dom.msie <= 8) {
      val = val === '' ? undefined : val;
    }
    return  val;
  }
}

dom.addClass = function(node, className){
  var current = node.className || "";
  if ((" " + current + " ").indexOf(" " + className + " ") === -1) {
    node.className = current? ( current + " " + className ) : className;
  }
}

dom.delClass = function(node, className){
  var current = node.className || "";
  node.className = (" " + current + " ").replace(" " + className + " ", " ").trim();
}

dom.hasClass = function(node, className){
  var current = node.className || "";
  return (" " + current + " ").indexOf(" " + className + " ") !== -1;
}



// simple Event wrap

//http://stackoverflow.com/questions/11068196/ie8-ie7-onchange-event-is-emited-only-after-repeated-selection
function fixEventName(elem, name){
  return (name === 'change'  &&  dom.msie < 9 && 
      (elem && elem.tagName && elem.tagName.toLowerCase()==='input' && 
        (elem.type === 'checkbox' || elem.type === 'radio')
      )
    )? 'click': name;
}

var rMouseEvent = /^(?:click|dblclick|contextmenu|DOMMouseScroll|mouse(?:\w+))$/
var doc = document;
doc = (!doc.compatMode || doc.compatMode === 'CSS1Compat') ? doc.documentElement : doc.body;
function Event(ev){
  ev = ev || window.event;
  if(ev._fixed) return ev;
  this.event = ev;
  this.target = ev.target || ev.srcElement;

  var type = this.type = ev.type;
  var button = this.button = ev.button;

  // if is mouse event patch pageX
  if(rMouseEvent.test(type)){ //fix pageX
    this.pageX = (ev.pageX != null) ? ev.pageX : ev.clientX + doc.scrollLeft;
    this.pageY = (ev.pageX != null) ? ev.pageY : ev.clientY + doc.scrollTop;
    if (type === 'mouseover' || type === 'mouseout'){// fix relatedTarget
      var related = ev.relatedTarget || ev[(type === 'mouseover' ? 'from' : 'to') + 'Element'];
      while (related && related.nodeType === 3) related = related.parentNode;
      this.relatedTarget = related;
    }
  }
  // if is mousescroll
  if (type === 'DOMMouseScroll' || type === 'mousewheel'){
    // ff ev.detail: 3    other ev.wheelDelta: -120
    this.wheelDelta = (ev.wheelDelta) ? ev.wheelDelta / 120 : -(ev.detail || 0) / 3;
  }
  
  // fix which
  this.which = ev.which || ev.keyCode;
  if( !this.which && button !== undefined){
    // http://api.jquery.com/event.which/ use which
    this.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
  }
  this._fixed = true;
}

_.extend(Event.prototype, {
  immediateStop: _.isFalse,
  stop: function(){
    this.preventDefault().stopPropgation();
  },
  preventDefault: function(){
    if (this.event.preventDefault) this.event.preventDefault();
    else this.event.returnValue = false;
    return this;
  },
  stopPropgation: function(){
    if (this.event.stopPropagation) this.event.stopPropagation();
    else this.event.cancelBubble = true;
    return this;
  },
  stopImmediatePropagation: function(){
    if(this.event.stopImmediatePropagation) this.event.stopImmediatePropagation();
  }
})


dom.nextFrame = (function(){
    var request = window.requestAnimationFrame ||
                  window.webkitRequestAnimationFrame ||
                  window.mozRequestAnimationFrame|| 
                  function(callback){
                    setTimeout(callback, 16)
                  }

    var cancel = window.cancelAnimationFrame ||
                 window.webkitCancelAnimationFrame ||
                 window.mozCancelAnimationFrame ||
                 window.webkitCancelRequestAnimationFrame ||
                 function(tid){
                    clearTimeout(tid)
                 }
  
  return function(callback){
    var id = request(callback);
    return function(){ cancel(id); }
  }
})();

// 3ks for angular's raf  service
var k;
dom.nextReflow = function(callback){
  dom.nextFrame(function(){
    k = document.body.offsetWidth;
    callback();
  })
}




},{"./env.js":13,"./util":26}],13:[function(require,module,exports){
// some fixture test;
// ---------------
var _ = require('./util');
exports.svg = (function(){
  return typeof document !== "undefined" && document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" );
})();


exports.transition = (function(){
  
})();

// whether have component in initializing
exports.exprCache = _.cache(100);
exports.isRunning = false;

},{"./util":26}],14:[function(require,module,exports){
var _ = require('./util');
var combine = require('./helper/combine')

function Group(list){
  this.children = list || [];
}


_.extend(Group.prototype, {
  destroy: function(first){
    combine.destroy(this.children, first);
    if(this.ondestroy) this.ondestroy();
    this.children = null;
  },
  get: function(i){
    return this.children[i]
  },
  push: function(item){
    this.children.push( item );
  }

})



module.exports = Group;



},{"./helper/combine":16,"./util":26}],15:[function(require,module,exports){
var _ = require("../util");
var dom  = require("../dom.js");
var animate = {};
var env = require("../env.js");


var 
  transitionEnd = 'transitionend', 
  animationEnd = 'animationend', 
  transitionProperty = 'transition', 
  animationProperty = 'animation';

if(!('ontransitionend' in window)){
  if('onwebkittransitionend' in window) {
    
    // Chrome/Saf (+ Mobile Saf)/Android
    transitionEnd += ' webkitTransitionEnd';
    transitionProperty = 'webkitTransition'
  } else if('onotransitionend' in dom.tNode || navigator.appName === 'Opera') {

    // Opera
    transitionEnd += ' oTransitionEnd';
    transitionProperty = 'oTransition';
  }
}
if(!('onanimationend' in window)){
  if ('onwebkitanimationend' in window){
    // Chrome/Saf (+ Mobile Saf)/Android
    animationEnd += ' webkitAnimationEnd';
    animationProperty = 'webkitAnimation';

  }else if ('onoanimationend' in dom.tNode){
    // Opera
    animationEnd += ' oAnimationEnd';
    animationProperty = 'oAnimation';
  }
}

/**
 * inject node with animation
 * @param  {[type]} node      [description]
 * @param  {[type]} refer     [description]
 * @param  {[type]} direction [description]
 * @return {[type]}           [description]
 */
animate.inject = function( node, refer ,direction, callback ){
  callback = callback || _.noop;
  if( Array.isArray(node) ){
    var fragment = dom.fragment();
    var count=0;

    for(var i = 0,len = node.length;i < len; i++ ){
      fragment.appendChild(node[i]); 
    }
    dom.inject(fragment, refer, direction);

    var enterCallback = function (){
      count++;
      if( count === len ) callback();
    }
    if(len === count) callback();
    for( i = 0; i < len; i++ ){
      if(node[i].onenter){
        node[i].onenter(enterCallback);
      }else{
        enterCallback();
      }
    }
  }else{
    dom.inject( node, refer, direction );
    if(node.onenter){
      node.onenter(callback)
    }else{
      callback();
    }
    // if( node.nodeType === 1 && callback !== false ){
    //   return startClassAnimate( node, 'r-enter', callback , 2);
    // }
    // ignored else
    
  }
}

/**
 * remove node with animation
 * @param  {[type]}   node     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
animate.remove = function(node, callback){
  callback = callback || _.noop;
  if(node.onleave){
    node.onleave(function(){
      dom.remove(node);
    })
  }else{
    dom.remove(node) 
    callback && callback();
  }
}



animate.startClassAnimate = function ( node, className,  callback, mode ){
  var activeClassName, timeout, tid, onceAnim;
  if( (!animationEnd && !transitionEnd) || env.isRunning ){
    return callback();
  }


  onceAnim = _.once(function onAnimateEnd(){
    if(tid) clearTimeout(tid);

    if(mode === 2) {
      dom.delClass(node, activeClassName);
    }
    if(mode !== 3){ // mode hold the class
      dom.delClass(node, className);
    }
    dom.off(node, animationEnd, onceAnim)
    dom.off(node, transitionEnd, onceAnim)

    callback();

  });
  if(mode === 2){ // auto removed
    dom.addClass( node, className );

    activeClassName = className.split(/\s+/).map(function(name){
       return name + '-active';
    }).join(" ");

    dom.nextReflow(function(){
      dom.addClass( node, activeClassName );
      timeout = getMaxTimeout( node );
      tid = setTimeout( onceAnim, timeout );
    });

  }else{

    dom.nextReflow(function(){
      dom.addClass( node, className );
      timeout = getMaxTimeout( node );
      tid = setTimeout( onceAnim, timeout );
    });

  }


  dom.on( node, animationEnd, onceAnim )
  dom.on( node, transitionEnd, onceAnim )
  return onceAnim;
}


animate.startStyleAnimate = function(node, styles, callback){
  var timeout, onceAnim, tid;

  dom.nextReflow(function(){
    dom.css( node, styles );
    timeout = getMaxTimeout( node );
    tid = setTimeout( onceAnim, timeout );
  });


  onceAnim = _.once(function onAnimateEnd(){
    if(tid) clearTimeout(tid);

    dom.off(node, animationEnd, onceAnim)
    dom.off(node, transitionEnd, onceAnim)

    callback();

  });

  dom.on( node, animationEnd, onceAnim )
  dom.on( node, transitionEnd, onceAnim )

  return onceAnim;
}


/**
 * get maxtimeout
 * @param  {Node} node 
 * @return {[type]}   [description]
 */
function getMaxTimeout(node){
  var timeout = 0,
    tDuration = 0,
    tDelay = 0,
    aDuration = 0,
    aDelay = 0,
    ratio = 5 / 3,
    styles ;

  if(window.getComputedStyle){

    styles = window.getComputedStyle(node),
    tDuration = getMaxTime( styles[transitionProperty + 'Duration']) || tDuration;
    tDelay = getMaxTime( styles[transitionProperty + 'Delay']) || tDelay;
    aDuration = getMaxTime( styles[animationProperty + 'Duration']) || aDuration;
    aDelay = getMaxTime( styles[animationProperty + 'Delay']) || aDelay;
    timeout = Math.max( tDuration+tDelay, aDuration + aDelay );

  }
  return timeout * 1000 * ratio;
}

function getMaxTime(str){

  var maxTimeout = 0, time;

  if(!str) return 0;

  str.split(",").forEach(function(str){

    time = parseFloat(str);
    if( time > maxTimeout ) maxTimeout = time;

  });

  return maxTimeout;
}

module.exports = animate;
},{"../dom.js":12,"../env.js":13,"../util":26}],16:[function(require,module,exports){
// some nested  operation in ast 
// --------------------------------

var dom = require("../dom.js");

var combine = module.exports = {

  // get the initial dom in object
  node: function(item){
    var children,node;
    if(item.element) return item.element;
    if(typeof item.node === "function") return item.node();
    if(typeof item.nodeType === "number") return item;
    if(item.group) return combine.node(item.group)
    if(children = item.children){
      if(children.length === 1){
        
        return combine.node(children[0]);
      }
      var nodes = [];
      for(var i = 0, len = children.length; i < len; i++ ){
        node = combine.node(children[i]);
        if(Array.isArray(node)){
          nodes.push.apply(nodes, node)
        }else{
          nodes.push(node)
        }
      }
      return nodes;
    }
  },

  // get the last dom in object(for insertion operation)
  last: function(item){
    var children = item.children;

    if(typeof item.last === "function") return item.last();
    if(typeof item.nodeType === "number") return item;

    if(children && children.length) return combine.last(children[children.length - 1]);
    if(item.group) return combine.last(item.group);

  },

  destroy: function(item, first){
    if(!item) return;
    if(Array.isArray(item)){
      for(var i = 0, len = item.length; i < len; i++ ){
        combine.destroy(item[i], first);
      }
    }
    var children = item.children;
    if(typeof item.destroy === "function") return item.destroy(first);
    if(typeof item.nodeType === "number" && first)  dom.remove(item);
    if(children && children.length){
      combine.destroy(children, true);
      item.children = null;
    }
  }

}
},{"../dom.js":12}],17:[function(require,module,exports){
// http://stackoverflow.com/questions/1354064/how-to-convert-characters-to-html-entities-using-plain-javascript
var entities = {
  'quot':34, 
  'amp':38, 
  'apos':39, 
  'lt':60, 
  'gt':62, 
  'nbsp':160, 
  'iexcl':161, 
  'cent':162, 
  'pound':163, 
  'curren':164, 
  'yen':165, 
  'brvbar':166, 
  'sect':167, 
  'uml':168, 
  'copy':169, 
  'ordf':170, 
  'laquo':171, 
  'not':172, 
  'shy':173, 
  'reg':174, 
  'macr':175, 
  'deg':176, 
  'plusmn':177, 
  'sup2':178, 
  'sup3':179, 
  'acute':180, 
  'micro':181, 
  'para':182, 
  'middot':183, 
  'cedil':184, 
  'sup1':185, 
  'ordm':186, 
  'raquo':187, 
  'frac14':188, 
  'frac12':189, 
  'frac34':190, 
  'iquest':191, 
  'Agrave':192, 
  'Aacute':193, 
  'Acirc':194, 
  'Atilde':195, 
  'Auml':196, 
  'Aring':197, 
  'AElig':198, 
  'Ccedil':199, 
  'Egrave':200, 
  'Eacute':201, 
  'Ecirc':202, 
  'Euml':203, 
  'Igrave':204, 
  'Iacute':205, 
  'Icirc':206, 
  'Iuml':207, 
  'ETH':208, 
  'Ntilde':209, 
  'Ograve':210, 
  'Oacute':211, 
  'Ocirc':212, 
  'Otilde':213, 
  'Ouml':214, 
  'times':215, 
  'Oslash':216, 
  'Ugrave':217, 
  'Uacute':218, 
  'Ucirc':219, 
  'Uuml':220, 
  'Yacute':221, 
  'THORN':222, 
  'szlig':223, 
  'agrave':224, 
  'aacute':225, 
  'acirc':226, 
  'atilde':227, 
  'auml':228, 
  'aring':229, 
  'aelig':230, 
  'ccedil':231, 
  'egrave':232, 
  'eacute':233, 
  'ecirc':234, 
  'euml':235, 
  'igrave':236, 
  'iacute':237, 
  'icirc':238, 
  'iuml':239, 
  'eth':240, 
  'ntilde':241, 
  'ograve':242, 
  'oacute':243, 
  'ocirc':244, 
  'otilde':245, 
  'ouml':246, 
  'divide':247, 
  'oslash':248, 
  'ugrave':249, 
  'uacute':250, 
  'ucirc':251, 
  'uuml':252, 
  'yacute':253, 
  'thorn':254, 
  'yuml':255, 
  'fnof':402, 
  'Alpha':913, 
  'Beta':914, 
  'Gamma':915, 
  'Delta':916, 
  'Epsilon':917, 
  'Zeta':918, 
  'Eta':919, 
  'Theta':920, 
  'Iota':921, 
  'Kappa':922, 
  'Lambda':923, 
  'Mu':924, 
  'Nu':925, 
  'Xi':926, 
  'Omicron':927, 
  'Pi':928, 
  'Rho':929, 
  'Sigma':931, 
  'Tau':932, 
  'Upsilon':933, 
  'Phi':934, 
  'Chi':935, 
  'Psi':936, 
  'Omega':937, 
  'alpha':945, 
  'beta':946, 
  'gamma':947, 
  'delta':948, 
  'epsilon':949, 
  'zeta':950, 
  'eta':951, 
  'theta':952, 
  'iota':953, 
  'kappa':954, 
  'lambda':955, 
  'mu':956, 
  'nu':957, 
  'xi':958, 
  'omicron':959, 
  'pi':960, 
  'rho':961, 
  'sigmaf':962, 
  'sigma':963, 
  'tau':964, 
  'upsilon':965, 
  'phi':966, 
  'chi':967, 
  'psi':968, 
  'omega':969, 
  'thetasym':977, 
  'upsih':978, 
  'piv':982, 
  'bull':8226, 
  'hellip':8230, 
  'prime':8242, 
  'Prime':8243, 
  'oline':8254, 
  'frasl':8260, 
  'weierp':8472, 
  'image':8465, 
  'real':8476, 
  'trade':8482, 
  'alefsym':8501, 
  'larr':8592, 
  'uarr':8593, 
  'rarr':8594, 
  'darr':8595, 
  'harr':8596, 
  'crarr':8629, 
  'lArr':8656, 
  'uArr':8657, 
  'rArr':8658, 
  'dArr':8659, 
  'hArr':8660, 
  'forall':8704, 
  'part':8706, 
  'exist':8707, 
  'empty':8709, 
  'nabla':8711, 
  'isin':8712, 
  'notin':8713, 
  'ni':8715, 
  'prod':8719, 
  'sum':8721, 
  'minus':8722, 
  'lowast':8727, 
  'radic':8730, 
  'prop':8733, 
  'infin':8734, 
  'ang':8736, 
  'and':8743, 
  'or':8744, 
  'cap':8745, 
  'cup':8746, 
  'int':8747, 
  'there4':8756, 
  'sim':8764, 
  'cong':8773, 
  'asymp':8776, 
  'ne':8800, 
  'equiv':8801, 
  'le':8804, 
  'ge':8805, 
  'sub':8834, 
  'sup':8835, 
  'nsub':8836, 
  'sube':8838, 
  'supe':8839, 
  'oplus':8853, 
  'otimes':8855, 
  'perp':8869, 
  'sdot':8901, 
  'lceil':8968, 
  'rceil':8969, 
  'lfloor':8970, 
  'rfloor':8971, 
  'lang':9001, 
  'rang':9002, 
  'loz':9674, 
  'spades':9824, 
  'clubs':9827, 
  'hearts':9829, 
  'diams':9830, 
  'OElig':338, 
  'oelig':339, 
  'Scaron':352, 
  'scaron':353, 
  'Yuml':376, 
  'circ':710, 
  'tilde':732, 
  'ensp':8194, 
  'emsp':8195, 
  'thinsp':8201, 
  'zwnj':8204, 
  'zwj':8205, 
  'lrm':8206, 
  'rlm':8207, 
  'ndash':8211, 
  'mdash':8212, 
  'lsquo':8216, 
  'rsquo':8217, 
  'sbquo':8218, 
  'ldquo':8220, 
  'rdquo':8221, 
  'bdquo':8222, 
  'dagger':8224, 
  'Dagger':8225, 
  'permil':8240, 
  'lsaquo':8249, 
  'rsaquo':8250, 
  'euro':8364
}



module.exports  = entities;
},{}],18:[function(require,module,exports){
// simplest event emitter 60 lines
// ===============================
var slice = [].slice, _ = require("../util.js");
var buildin = ['$inject', "$init", "$destroy", "$update"];
var API = {
    $on: function(event, fn) {
        if(typeof event === "object"){
            for (var i in event) {
                this.$on(i, event[i]);
            }
        }else{
            // @patch: for list
            var context = this;
            var handles = context._handles || (context._handles = {}),
                calls = handles[event] || (handles[event] = []);
            calls.push(fn);
        }
        return this;
    },
    $off: function(event, fn) {
        var context = this;
        if(!context._handles) return;
        if(!event) this._handles = {};
        var handles = context._handles,
            calls;

        if (calls = handles[event]) {
            if (!fn) {
                handles[event] = [];
                return context;
            }
            for (var i = 0, len = calls.length; i < len; i++) {
                if (fn === calls[i]) {
                    calls.splice(i, 1);
                    return context;
                }
            }
        }
        return context;
    },
    // bubble event
    $emit: function(event){
        // @patch: for list
        var context = this;
        var handles = context._handles, calls, args, type;
        if(!event) return;
        var args = slice.call(arguments, 1);
        var type = event;

        if(!handles) return context;
        // @deprecated 0.3.0
        // will be removed when completely remove the old events('destroy' 'init') support

        /*@remove 0.4.0*/
        var isBuildin = ~buildin.indexOf(type);
        if(calls = handles[type.slice(1)]){
            for (var j = 0, len = calls.length; j < len; j++) {
                calls[j].apply(context, args)
            }
        }
        /*/remove*/

        if (!(calls = handles[type])) return context;
        for (var i = 0, len = calls.length; i < len; i++) {
            calls[i].apply(context, args)
        }
        // if(calls.length) context.$update();
        return context;
    },
    // capture  event
    $broadcast: function(){
        
    }
}
// container class
function Event() {
  if (arguments.length) this.$on.apply(this, arguments);
}
_.extend(Event.prototype, API)

Event.mixTo = function(obj){
  obj = typeof obj === "function" ? obj.prototype : obj;
  _.extend(obj, API)
}
module.exports = Event;
},{"../util.js":26}],19:[function(require,module,exports){
// (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://backbonejs.org

// klass: a classical JS OOP façade
// https://github.com/ded/klass
// License MIT (c) Dustin Diaz 2014
  
// inspired by backbone's extend and klass
var _ = require("../util.js"),
  fnTest = /xy/.test(function(){"xy";}) ? /\bsupr\b/:/.*/,
  isFn = function(o){return typeof o === "function"};


function wrap(k, fn, supro) {
  return function () {
    var tmp = this.supr;
    this.supr = supro[k];
    var ret = fn.apply(this, arguments);
    this.supr = tmp;
    return ret;
  }
}

function process( what, o, supro ) {
  for ( var k in o ) {
    if (o.hasOwnProperty(k)) {

      what[k] = isFn( o[k] ) && isFn( supro[k] ) && 
        fnTest.test( o[k] ) ? wrap(k, o[k], supro) : o[k];
    }
  }
}

module.exports = function extend(o){
  o = o || {};
  var supr = this, proto,
    supro = supr && supr.prototype || {};
  if(typeof o === 'function'){
    proto = o.prototype;
    o.implement = implement;
    o.extend = extend;
    return o;
  } 
  
  function fn() {
    supr.apply(this, arguments);
  }

  proto = _.createProto(fn, supro);

  function implement(o){
    process(proto, o, supro); 
    return this;
  }



  fn.implement = implement
  fn.implement(o)
  if(supr.__after__) supr.__after__.call(fn, supr, o);
  fn.extend = extend;
  return fn;
}


},{"../util.js":26}],20:[function(require,module,exports){
var exprCache = require('../env').exprCache;
var _ = require("../util");
var Parser = require("../parser/Parser.js");
module.exports = {
  expression: function(expr, simple){
    // @TODO cache
    if( typeof expr === 'string' && ( expr = expr.trim() ) ){
      expr = exprCache.get( expr ) || exprCache.set( expr, new Parser( expr, { state: 'JST', mode: 2 } ).expression() )
    }
    if(expr) return _.touchExpression( expr );
  },
  parse: function(template){
    return new Parser(template).parse();
  }
}


},{"../env":13,"../parser/Parser.js":24,"../util":26}],21:[function(require,module,exports){
// shim for es5
var slice = [].slice;
var tstr = ({}).toString;

function extend(o1, o2 ){
  for(var i in o2) if( o1[i] === undefined){
    o1[i] = o2[i]
  }
}

// String proto ;
extend(String.prototype, {
  trim: function(){
    return this.replace(/^\s+|\s+$/g, '');
  }
});


// Array proto;
extend(Array.prototype, {
  indexOf: function(obj, from){
    from = from || 0;
    for (var i = from, len = this.length; i < len; i++) {
      if (this[i] === obj) return i;
    }
    return -1;
  },
  forEach: function(callback, context){
    for (var i = 0, len = this.length; i < len; i++) {
      callback.call(context, this[i], i, this);
    }
  },
  filter: function(callback, context){
    var res = [];
    for (var i = 0, length = this.length; i < length; i++) {
      var pass = callback.call(context, this[i], i, this);
      if(pass) res.push(this[i]);
    }
    return res;
  },
  map: function(callback, context){
    var res = [];
    for (var i = 0, length = this.length; i < length; i++) {
      res.push(callback.call(context, this[i], i, this));
    }
    return res;
  }
});

// Function proto;
extend(Function.prototype, {
  bind: function(context){
    var fn = this;
    var preArgs = slice.call(arguments, 1);
    return function(){
      var args = preArgs.concat(slice.call(arguments));
      return fn.apply(context, args);
    }
  }
})

// Object
extend(Object, {
  keys: function(obj){
    var keys = [];
    for(var i in obj) if(obj.hasOwnProperty(i)){
      keys.push(i);
    }
    return keys;
  } 
})

// Date
extend(Date, {
  now: function(){
    return +new Date;
  }
})
// Array
extend(Array, {
  isArray: function(arr){
    return tstr.call(arr) === "[object Array]";
  }
})

},{}],22:[function(require,module,exports){
var _ = require('../util.js');
var parseExpression = require('./parse.js').expression;


function Watcher(){}

var methods = {
  $watch: function(expr, fn, options){
    var get, once, test, rlen; //records length
    if(!this._watchers) this._watchers = [];
    options = options || {};
    if(options === true){
       options = { deep: true }
    }
    var uid = _.uid('w_');
    if(Array.isArray(expr)){
      var tests = [];
      for(var i = 0,len = expr.length; i < len; i++){
          tests.push(parseExpression(expr[i]).get) 
      }
      var prev = [];
      test = function(context){
        var equal = true;
        for(var i =0, len = tests.length; i < len; i++){
          var splice = tests[i](context);
          if(!_.equals(splice, prev[i])){
             equal = false;
             prev[i] = _.clone(splice);
          }
        }
        return equal? false: prev;
      }
    }else{
      expr = this.$expression? this.$expression(expr) : parseExpression(expr);
      get = expr.get;
      once = expr.once || expr.constant;
    }

    var watcher = {
      id: uid, 
      get: get, 
      fn: fn, 
      once: once, 
      force: options.force,
      test: test,
      deep: options.deep
    }
    
    this._watchers.push( watcher );

    rlen = this._records && this._records.length;
    if(rlen) this._records[rlen-1].push(uid)
    // init state.
    if(options.init === true){
      this.$phase = 'digest';
      this._checkSingleWatch( watcher, this._watchers.length-1 );
      this.$phase = null;
    }
    return uid;
  },
  $unwatch: function(uid){
    if(!this._watchers) this._watchers = [];
    if(Array.isArray(uid)){
      for(var i =0, len = uid.length; i < len; i++){
        this.$unwatch(uid[i]);
      }
    }else{
      var watchers = this._watchers, watcher, wlen;
      if(!uid || !watchers || !(wlen = watchers.length)) return;
      for(;wlen--;){
        watcher = watchers[wlen];
        if(watcher && watcher.id === uid ){
          watchers.splice(wlen, 1);
        }
      }
    }
  },
  /**
   * the whole digest loop ,just like angular, it just a dirty-check loop;
   * @param  {String} path  now regular process a pure dirty-check loop, but in parse phase, 
   *                  Regular's parser extract the dependencies, in future maybe it will change to dirty-check combine with path-aware update;
   * @return {Void}   
   */

  $digest: function(){
    if(this.$phase === 'digest') return;
    this.$phase = 'digest';
    var dirty = false, n =0;
    while(dirty = this._digest()){

      if((++n) > 20){ // max loop
        throw 'there may a circular dependencies reaches' 
      }
    }
    if( n > 0 && this.$emit) this.$emit("$update");
    this.$phase = null;
  },
  // private digest logic
  _digest: function(){
    // if(this.context) return this.context.$digest();
    // if(this.$emit) this.$emit('digest');
    var watchers = this._watchers;
    var dirty = false, children, watcher, watcherDirty;
    if(watchers && watchers.length){
      for(var i = 0, len = watchers.length;i < len; i++){
        watcher = watchers[i];
        watcherDirty = this._checkSingleWatch(watcher, i);
        if(watcherDirty) dirty = true;
      }
    }
    // check children's dirty.
    children = this._children;
    if(children && children.length){
      for(var m = 0, mlen = children.length; m < mlen; m++){
        if(children[m]._digest()) dirty = true;
      }
    }
    return dirty;
  },
  // check a single one watcher 
  _checkSingleWatch: function(watcher, i){
    var dirty = false;
    if(!watcher) return;
    if(watcher.test) { //multi 
      var result = watcher.test(this);
      if(result){
        dirty = true;
        watcher.fn.apply(this, result)
      }
    }else{

      var now = watcher.get(this);
      var last = watcher.last;
      var eq = true;

      if(_.typeOf( now ) === 'object' && watcher.deep){
        if(!watcher.last){
           eq = false;
         }else{
          for(var j in now){
            if(watcher.last[j] !== now[j]){
              eq = false;
              break;
            }
          }
          if(eq !== false){
            for(var n in last){
              if(last[n] !== now[n]){
                eq = false;
                break;
              }
            }
          }
        }
      }else{
        eq = _.equals(now, watcher.last);
      }
      if(eq === false || watcher.force){ // in some case. if undefined, we must force digest.
        eq = false;
        watcher.force = null;
        dirty = true;
        watcher.fn.call(this, now, watcher.last);
        if(typeof now !== 'object'|| watcher.deep){
          watcher.last = _.clone(now);
        }else{
          watcher.last = now;
        }
      }else{ // if eq == true
        if( _.typeOf(eq) === 'array' && eq.length ){
          watcher.last = _.clone(now);
          watcher.fn.call(this, now, eq);
          dirty = true;
        }else{
          eq = true;
        }
      }
      // @TODO
      if(dirty && watcher.once) this._watchers.splice(i, 1);

      return dirty;
    }
  },

  /**
   * **tips**: whatever param you passed in $update, after the function called, dirty-check(digest) phase will enter;
   * 
   * @param  {Function|String|Expression} path  
   * @param  {Whatever} value optional, when path is Function, the value is ignored
   * @return {this}     this 
   */
  $update: function(path, value){
    if(path != null){
      var type = _.typeOf(path);
      if( type === 'string' || path.type === 'expression' ){
        path = parseExpression(path);
        path.set(this, value);
      }else if(type === 'function'){
        path.call(this, this.data);
      }else{
        for(var i in path) {
          if(path.hasOwnProperty(i)){
            this.data[i] = path[i];
          }
        }
      }
    }
    if(this.$root) this.$root.$digest()
  },
  // auto collect watchers for logic-control.
  _record: function(){
    if(!this._records) this._records = [];
    this._records.push([]);
  },
  _release: function(){
    return this._records.pop();
  }
}


_.extend(Watcher.prototype, methods)


Watcher.mixTo = function(obj){
  obj = typeof obj === "function" ? obj.prototype : obj;
  return _.extend(obj, methods)
}

module.exports = Watcher;
},{"../util.js":26,"./parse.js":20}],23:[function(require,module,exports){
var _ = require("../util.js");
var config = require("../config.js");

// some custom tag  will conflict with the Lexer progress
var conflictTag = {"}": "{", "]": "["}, map1, map2;
// some macro for lexer
var macro = {
  'NAME': /(?:[:_A-Za-z][-\.:_0-9A-Za-z]*)/,
  'IDENT': /[\$_A-Za-z][_0-9A-Za-z\$]*/,
  'SPACE': /[\r\n\f ]/
}


var test = /a|(b)/.exec("a");
var testSubCapure = test && test[1] === undefined? 
  function(str){ return str !== undefined }
  :function(str){return !!str};

function wrapHander(handler){
  return function(all){
    return {type: handler, value: all }
  }
}

function Lexer(input, opts){
  if(conflictTag[config.END]){
    this.markStart = conflictTag[config.END];
    this.markEnd = config.END;
  }


  this.input = (input||"").trim();
  this.opts = opts || {};
  this.map = this.opts.mode !== 2?  map1: map2;
  this.states = ["INIT"];
  if(this.opts.state) this.states.push( this.opts.state );
}

var lo = Lexer.prototype


lo.lex = function(str){
  str = (str || this.input).trim();
  var tokens = [], split, test,mlen, token, state;
  this.input = str, 
  this.marks = 0;
  // init the pos index
  this.index=0;
  var i = 0;
  while(str){
    i++
    state = this.state();
    split = this.map[state] 
    test = split.TRUNK.exec(str);
    if(!test){
      this.error('Unrecoginized Token');
    }
    mlen = test[0].length;
    str = str.slice(mlen)
    token = this._process.call(this, test, split, str)
    if(token) tokens.push(token)
    this.index += mlen;
    // if(state == 'TAG' || state == 'JST') str = this.skipspace(str);
  }

  tokens.push({type: 'EOF'});

  return tokens;
}

lo.error = function(msg){
  throw "Parse Error: " + msg +  ':\n' + _.trackErrorPos(this.input, this.index);
}

lo._process = function(args, split,str){
  // console.log(args.join(","), this.state())
  var links = split.links, marched = false, token;

  for(var len = links.length, i=0;i<len ;i++){
    var link = links[i],
      handler = link[2],
      index = link[0];
    // if(args[6] === '>' && index === 6) console.log('haha')
    if(testSubCapure(args[index])) {
      marched = true;
      if(handler){
        token = handler.apply(this, args.slice(index, index + link[1]))
        if(token)  token.pos = this.index;
      }
      break;
    }
  }
  if(!marched){ // in ie lt8 . sub capture is "" but ont 
    switch(str.charAt(0)){
      case "<":
        this.enter("TAG");
        break;
      default:
        this.enter("JST");
        break;
    }
  }
  return token;
}
lo.enter = function(state){
  this.states.push(state)
  return this;
}

lo.state = function(){
  var states = this.states;
  return states[states.length-1];
}

lo.leave = function(state){
  var states = this.states;
  if(!state || states[states.length-1] === state) states.pop()
}


Lexer.setup = function(){
  macro.END = config.END;
  macro.BEGIN = config.BEGIN;
  //
  map1 = genMap([
    // INIT
    rules.ENTER_JST,
    rules.ENTER_TAG,
    rules.TEXT,

    //TAG
    rules.TAG_NAME,
    rules.TAG_OPEN,
    rules.TAG_CLOSE,
    rules.TAG_PUNCHOR,
    rules.TAG_ENTER_JST,
    rules.TAG_UNQ_VALUE,
    rules.TAG_STRING,
    rules.TAG_SPACE,
    rules.TAG_COMMENT,

    // JST
    rules.JST_OPEN,
    rules.JST_CLOSE,
    rules.JST_COMMENT,
    rules.JST_EXPR_OPEN,
    rules.JST_IDENT,
    rules.JST_SPACE,
    rules.JST_LEAVE,
    rules.JST_NUMBER,
    rules.JST_PUNCHOR,
    rules.JST_STRING,
    rules.JST_COMMENT
    ])

  // ignored the tag-relative token
  map2 = genMap([
    // INIT no < restrict
    rules.ENTER_JST2,
    rules.TEXT,
    // JST
    rules.JST_COMMENT,
    rules.JST_OPEN,
    rules.JST_CLOSE,
    rules.JST_EXPR_OPEN,
    rules.JST_IDENT,
    rules.JST_SPACE,
    rules.JST_LEAVE,
    rules.JST_NUMBER,
    rules.JST_PUNCHOR,
    rules.JST_STRING,
    rules.JST_COMMENT
    ])
}


function genMap(rules){
  var rule, map = {}, sign;
  for(var i = 0, len = rules.length; i < len ; i++){
    rule = rules[i];
    sign = rule[2] || 'INIT';
    ( map[sign] || (map[sign] = {rules:[], links:[]}) ).rules.push(rule);
  }
  return setup(map);
}

function setup(map){
  var split, rules, trunks, handler, reg, retain, rule;
  function replaceFn(all, one){
    return typeof macro[one] === 'string'? 
      _.escapeRegExp(macro[one]) 
      : String(macro[one]).slice(1,-1);
  }

  for(var i in map){

    split = map[i];
    split.curIndex = 1;
    rules = split.rules;
    trunks = [];

    for(var j = 0,len = rules.length; j<len; j++){
      rule = rules[j]; 
      reg = rule[0];
      handler = rule[1];

      if(typeof handler === 'string'){
        handler = wrapHander(handler);
      }
      if(_.typeOf(reg) === 'regexp') reg = reg.toString().slice(1, -1);

      reg = reg.replace(/\{(\w+)\}/g, replaceFn)
      retain = _.findSubCapture(reg) + 1; 
      split.links.push([split.curIndex, retain, handler]); 
      split.curIndex += retain;
      trunks.push(reg);
    }
    split.TRUNK = new RegExp("^(?:(" + trunks.join(")|(") + "))")
  }
  return map;
}

var rules = {

  // 1. INIT
  // ---------------

  // mode1's JST ENTER RULE
  ENTER_JST: [/[^\x00<]*?(?={BEGIN})/, function(all){
    this.enter('JST');
    if(all) return {type: 'TEXT', value: all}
  }],

  // mode2's JST ENTER RULE
  ENTER_JST2: [/[^\x00]*?(?={BEGIN})/, function(all){
    this.enter('JST');
    if(all) return {type: 'TEXT', value: all}
  }],

  ENTER_TAG: [/[^\x00<>]*?(?=<)/, function(all){ 
    this.enter('TAG');
    if(all) return {type: 'TEXT', value: all}
  }],

  TEXT: [/[^\x00]+/, 'TEXT'],

  // 2. TAG
  // --------------------
  TAG_NAME: [/{NAME}/, 'NAME', 'TAG'],
  TAG_UNQ_VALUE: [/[^&"'=><`\r\n\f ]+/, 'UNQ', 'TAG'],

  TAG_OPEN: [/<({NAME})\s*/, function(all, one){
    return {type: 'TAG_OPEN', value: one}
  }, 'TAG'],
  TAG_CLOSE: [/<\/({NAME})[\r\n\f ]*>/, function(all, one){
    this.leave();
    return {type: 'TAG_CLOSE', value: one }
  }, 'TAG'],

    // mode2's JST ENTER RULE
  TAG_ENTER_JST: [/(?={BEGIN})/, function(){
    this.enter('JST');
  }, 'TAG'],


  TAG_PUNCHOR: [/[\>\/=&]/, function(all){
    if(all === '>') this.leave();
    return {type: all, value: all }
  }, 'TAG'],
  TAG_STRING:  [ /'([^']*)'|"([^"]*)"/, function(all, one, two){ //"'
    var value = one || two || "";

    return {type: 'STRING', value: value}
  }, 'TAG'],

  TAG_SPACE: [/{SPACE}+/, null, 'TAG'],
  TAG_COMMENT: [/<\!--([^\x00]*?)--\>/, null ,'TAG'],

  // 3. JST
  // -------------------

  JST_OPEN: ['{BEGIN}#{SPACE}*({IDENT})', function(all, name){
    return {
      type: 'OPEN',
      value: name
    }
  }, 'JST'],
  JST_LEAVE: [/{END}/, function(){
    if(!this.markEnd || !this.marks ){
      this.leave('JST');
      return {type: 'END'}
    }else{
      this.marks--;
      return {type: this.markEnd, value: this.markEnd}
    }
  }, 'JST'],
  JST_CLOSE: [/{BEGIN}\s*\/({IDENT})\s*{END}/, function(all, one){
    this.leave('JST');
    return {
      type: 'CLOSE',
      value: one
    }
  }, 'JST'],
  JST_COMMENT: [/{BEGIN}\!([^\x00]*?)\!{END}/, function(){
    this.leave();
  }, 'JST'],
  JST_EXPR_OPEN: ['{BEGIN}',function(all, one){
    if(all === this.markStart){
      if(this.marks){
        return {type: this.markStart, value: this.markStart };
      }else{
        this.marks++;
      }
    }
    var escape = one === '=';
    return {
      type: 'EXPR_OPEN',
      escape: escape
    }
  }, 'JST'],
  JST_IDENT: ['{IDENT}', 'IDENT', 'JST'],
  JST_SPACE: [/[ \r\n\f]+/, null, 'JST'],
  JST_PUNCHOR: [/[=!]?==|[-=><+*\/%\!]?\=|\|\||&&|\@\(|\.\.|[<\>\[\]\(\)\-\|\{}\+\*\/%?:\.!,]/, function(all){
    return { type: all, value: all }
  },'JST'],

  JST_STRING:  [ /'([^']*)'|"([^"]*)"/, function(all, one, two){ //"'
    return {type: 'STRING', value: one || two || ""}
  }, 'JST'],
  JST_NUMBER: [/(?:[0-9]*\.[0-9]+|[0-9]+)(e\d+)?/, function(all){
    return {type: 'NUMBER', value: parseFloat(all, 10)};
  }, 'JST']
}


// setup when first config
Lexer.setup();



module.exports = Lexer;



},{"../config.js":11,"../util.js":26}],24:[function(require,module,exports){
var _ = require("../util.js");
var node = require("./node.js");
var Lexer = require("./Lexer.js");
var varName = _.varName;
var ctxName = _.ctxName;
var isPath = _.makePredicate("STRING IDENT NUMBER");
var isKeyWord = _.makePredicate("true false undefined null this Array Date JSON Math NaN RegExp decodeURI decodeURIComponent encodeURI encodeURIComponent parseFloat parseInt Object");




function Parser(input, opts){
  opts = opts || {};

  this.input = input;
  this.tokens = new Lexer(input, opts).lex();
  this.pos = 0;
  this.noComputed =  opts.noComputed;
  this.length = this.tokens.length;
}


var op = Parser.prototype;


op.parse = function(){
  this.pos = 0;
  var res= this.program();
  if(this.ll().type === 'TAG_CLOSE'){
    this.error("You may got a unclosed Tag")
  }
  return res;
}

op.ll =  function(k){
  k = k || 1;
  if(k < 0) k = k + 1;
  var pos = this.pos + k - 1;
  if(pos > this.length - 1){
      return this.tokens[this.length-1];
  }
  return this.tokens[pos];
}
  // lookahead
op.la = function(k){
  return (this.ll(k) || '').type;
}

op.match = function(type, value){
  var ll;
  if(!(ll = this.eat(type, value))){
    ll  = this.ll();
    this.error('expect [' + type + (value == null? '':':'+ value) + ']" -> got "[' + ll.type + (value==null? '':':'+ll.value) + ']', ll.pos)
  }else{
    return ll;
  }
}

op.error = function(msg, pos){
  msg =  "Parse Error: " + msg +  ':\n' + _.trackErrorPos(this.input, typeof pos === 'number'? pos: this.ll().pos||0);
  throw new Error(msg);
}

op.next = function(k){
  k = k || 1;
  this.pos += k;
}
op.eat = function(type, value){
  var ll = this.ll();
  if(typeof type !== 'string'){
    for(var len = type.length ; len--;){
      if(ll.type === type[len]) {
        this.next();
        return ll;
      }
    }
  }else{
    if( ll.type === type && (typeof value === 'undefined' || ll.value === value) ){
       this.next();
       return ll;
    }
  }
  return false;
}

// program
//  :EOF
//  | (statement)* EOF
op.program = function(){
  var statements = [],  ll = this.ll();
  while(ll.type !== 'EOF' && ll.type !=='TAG_CLOSE'){

    statements.push(this.statement());
    ll = this.ll();
  }
  // if(ll.type === 'TAG_CLOSE') this.error("You may have unmatched Tag")
  return statements;
}

// statement
//  : xml
//  | jst
//  | text
op.statement = function(){
  var ll = this.ll();
  switch(ll.type){
    case 'NAME':
    case 'TEXT':
      var text = ll.value;
      this.next();
      while(ll = this.eat(['NAME', 'TEXT'])){
        text += ll.value;
      }
      return node.text(text);
    case 'TAG_OPEN':
      return this.xml();
    case 'OPEN': 
      return this.directive();
    case 'EXPR_OPEN':
      return this.interplation();
    case 'PART_OPEN':
      return this.template();
    default:
      this.error('Unexpected token: '+ this.la())
  }
}

// xml 
// stag statement* TAG_CLOSE?(if self-closed tag)
op.xml = function(){
  var name, attrs, children, selfClosed;
  name = this.match('TAG_OPEN').value;
  attrs = this.attrs();
  selfClosed = this.eat('/')
  this.match('>');
  if( !selfClosed && !_.isVoidTag(name) ){
    children = this.program();
    if(!this.eat('TAG_CLOSE', name)) this.error('expect </'+name+'> got'+ 'no matched closeTag')
  }
  return node.element(name, attrs, children);
}

// xentity
//  -rule(wrap attribute)
//  -attribute
//
// __example__
//  name = 1 |  
//  ng-hide |
//  on-click={{}} | 
//  {{#if name}}on-click={{xx}}{{#else}}on-tap={{}}{{/if}}

op.xentity = function(ll){
  var name = ll.value, value;
  if(ll.type === 'NAME'){
    if( this.eat("=") ) value = this.attvalue();
    return node.attribute( name, value );
  }else{
    if( name !== 'if') this.error("current version. ONLY RULE #if #else #elseif is valid in tag, the rule #" + name + ' is invalid');
    return this['if'](true);
  }

}

// stag     ::=    '<' Name (S attr)* S? '>'  
// attr    ::=     Name Eq attvalue
op.attrs = function(isAttribute){
  var eat
  if(!isAttribute){
    eat = ["NAME", "OPEN"]
  }else{
    eat = ["NAME"]
  }

  var attrs = [], ll;
  while (ll = this.eat(eat)){
    attrs.push(this.xentity( ll ))
  }
  return attrs;
}

// attvalue
//  : STRING  
//  | NAME
op.attvalue = function(){
  var ll = this.ll();
  switch(ll.type){
    case "NAME":
    case "UNQ":
    case "STRING":
      this.next();
      var value = ll.value;
      if(~value.indexOf('{{')){
        var constant = true;
        var parsed = new Parser(value, { mode: 2 }).parse();
        if(parsed.length === 1 && parsed[0].type === 'expression') return parsed[0];
        var body = [];
        parsed.forEach(function(item){
          if(!item.constant) constant=false;
          body.push(item.body || "'" + item.text + "'");
        });
        body = "[" + body.join(",") + "].join('')";
        value = node.expression(body, null, constant);
      }
      return value;
    case "EXPR_OPEN":
      return this.interplation();
    default:
      this.error('Unexpected token: '+ this.la())
  }
}


// {{#}}
op.directive = function(){
  var name = this.ll().value;
  this.next();
  if(typeof this[name] === 'function'){
    return this[name]()
  }else{
    this.error('Undefined directive['+ name +']');
  }
}

// {{}}
op.interplation = function(){
  this.match('EXPR_OPEN');
  var res = this.expression(true);
  this.match('END');
  return res;
}

// {{~}}
op.include = function(){
  var content = this.expression();
  this.match('END');
  return node.template(content);
}

// {{#if}}
op["if"] = function(tag){
  var test = this.expression();
  var consequent = [], alternate=[];

  var container = consequent;
  var statement = !tag? "statement" : "attrs";

  this.match('END');

  var ll, close;
  while( ! (close = this.eat('CLOSE')) ){
    ll = this.ll();
    if( ll.type === 'OPEN' ){
      switch( ll.value ){
        case 'else':
          container = alternate;
          this.next();
          this.match( 'END' );
          break;
        case 'elseif':
          this.next();
          alternate.push( this["if"](tag) );
          return node['if']( test, consequent, alternate );
        default:
          container.push( this[statement](true) );
      }
    }else{
      container.push(this[statement](true));
    }
  }
  // if statement not matched
  if(close.value !== "if") this.error('Unmatched if directive')
  return node["if"](test, consequent, alternate);
}


// @mark   mustache syntax have natrure dis, canot with expression
// {{#list}}
op.list = function(){
  // sequence can be a list or hash
  var sequence = this.expression(), variable, ll;
  var consequent = [], alternate=[];
  var container = consequent;

  this.match('IDENT', 'as');

  variable = this.match('IDENT').value;

  this.match('END');

  while( !(ll = this.eat('CLOSE')) ){
    if(this.eat('OPEN', 'else')){
      container =  alternate;
      this.match('END');
    }else{
      container.push(this.statement());
    }
  }
  if(ll.value !== 'list') this.error('expect ' + '{{/list}} got ' + '{{/' + ll.value + '}}', ll.pos );
  return node.list(sequence, variable, consequent, alternate);
}


op.expression = function(){
  var expression;
  if(this.eat('@(')){ //once bind
    expression = this.expr();
    expression.once = true;
    this.match(')')
  }else{
    expression = this.expr();
  }
  return expression;
}

op.expr = function(){
  this.depend = [];

  var buffer = this.filter()

  var body = buffer.get || buffer;
  var setbody = buffer.set;
  return node.expression(body, setbody, !this.depend.length);
}


// filter
// assign ('|' filtername[':' args]) * 
op.filter = function(){
  var left = this.assign();
  var ll = this.eat('|');
  var buffer, attr;
  if(ll){
    buffer = [
      "(function(){", 
          "var ", attr = "_f_", "=", left.get, ";"]
    do{

      buffer.push(attr + " = "+ctxName+"._f_('" + this.match('IDENT').value+ "')(" + attr) ;
      if(this.eat(':')){
        buffer.push(", "+ this.arguments("|").join(",") + ");")
      }else{
        buffer.push(');');
      }

    }while(ll = this.eat('|'));
    buffer.push("return " + attr + "})()");
    return this.getset(buffer.join(""));
  }
  return left;
}

// assign
// left-hand-expr = condition
op.assign = function(){
  var left = this.condition(), ll;
  if(ll = this.eat(['=', '+=', '-=', '*=', '/=', '%='])){
    if(!left.set) this.error('invalid lefthand expression in assignment expression');
    return this.getset( left.set.replace("_p_", this.condition().get).replace("'='", "'"+ll.type+"'"), left.set);
    // return this.getset('(' + left.get + ll.type  + this.condition().get + ')', left.set);
  }
  return left;
}

// or
// or ? assign : assign
op.condition = function(){

  var test = this.or();
  if(this.eat('?')){
    return this.getset([test.get + "?", 
      this.assign().get, 
      this.match(":").type, 
      this.assign().get].join(""));
  }

  return test;
}

// and
// and && or
op.or = function(){

  var left = this.and();

  if(this.eat('||')){
    return this.getset(left.get + '||' + this.or().get);
  }

  return left;
}
// equal
// equal && and
op.and = function(){

  var left = this.equal();

  if(this.eat('&&')){
    return this.getset(left.get + '&&' + this.and().get);
  }
  return left;
}
// relation
// 
// equal == relation
// equal != relation
// equal === relation
// equal !== relation
op.equal = function(){
  var left = this.relation(), ll;
  // @perf;
  if( ll = this.eat(['==','!=', '===', '!=='])){
    return this.getset(left.get + ll.type + this.equal().get);
  }
  return left
}
// relation < additive
// relation > additive
// relation <= additive
// relation >= additive
// relation in additive
op.relation = function(){
  var left = this.additive(), ll;
  // @perf
  if(ll = (this.eat(['<', '>', '>=', '<=']) || this.eat('IDENT', 'in') )){
    return this.getset(left.get + ll.value + this.relation().get);
  }
  return left
}
// additive :
// multive
// additive + multive
// additive - multive
op.additive = function(){
  var left = this.multive() ,ll;
  if(ll= this.eat(['+','-']) ){
    return this.getset(left.get + ll.value + this.additive().get);
  }
  return left
}
// multive :
// unary
// multive * unary
// multive / unary
// multive % unary
op.multive = function(){
  var left = this.range() ,ll;
  if( ll = this.eat(['*', '/' ,'%']) ){
    return this.getset(left.get + ll.type + this.multive().get);
  }
  return left;
}

op.range = function(){
  var left = this.unary(), ll, right;

  if(ll = this.eat('..')){
    right = this.unary();
    var body = 
      "(function(start,end){var res = [],step=end>start?1:-1; for(var i = start; end>start?i <= end: i>=end; i=i+step){res.push(i); } return res })("+left.get+","+right.get+")"
    return this.getset(body);
  }

  return left;
}



// lefthand
// + unary
// - unary
// ~ unary
// ! unary
op.unary = function(){
  var ll;
  if(ll = this.eat(['+','-','~', '!'])){
    return this.getset('(' + ll.type + this.unary().get + ')') ;
  }else{
    return this.member()
  }
}

// call[lefthand] :
// member args
// member [ expression ]
// member . ident  

op.member = function(base, last, pathes){
  var ll, path;

  var onlySimpleAccessor = false;
  if(!base){ //first
    path = this.primary();
    var type = typeof path;
    if(type === 'string'){ 
      pathes = [];
      pathes.push( path );
      last = path;
      base = ctxName + "._sg_('" + path + "', " + varName + "['" + path + "'])";
      onlySimpleAccessor = true;
    }else{ //Primative Type
      if(path.get === 'this'){
        base = ctxName;
        pathes = ['this'];
      }else{
        pathes = null;
        base = path.get;
      }
    }
  }else{ // not first enter
    if(typeof last === 'string' && isPath( last) ){ // is valid path
      pathes.push(last);
    }else{
      if(pathes && pathes.length) this.depend.push(pathes);
      pathes = null;
    }
  }
  if(ll = this.eat(['[', '.', '('])){
    switch(ll.type){
      case '.':
          // member(object, property, computed)
        var tmpName = this.match('IDENT').value;
          base += "['" + tmpName + "']";
        return this.member( base, tmpName, pathes );
      case '[':
          // member(object, property, computed)
        path = this.assign();
        base += "[" + path.get + "]";
        this.match(']')
        return this.member(base, path, pathes);
      case '(':
        // call(callee, args)
        var args = this.arguments().join(',');
        base =  base+"(" + args +")";
        this.match(')')
        return this.member(base, null, pathes);
    }
  }
  if( pathes && pathes.length ) this.depend.push( pathes );
  var res =  {get: base};
  if(last){
    if(onlySimpleAccessor) res.set = ctxName + "._ss_('" + path + "'," + _.setName + "," + _.varName + ", '=')";
    else res.set = base + '=' + _.setName;
  }
  return res;
}

/**
 * 
 */
op.arguments = function(end){
  end = end || ')'
  var args = [];
  do{
    if(this.la() !== end){
      args.push(this.assign().get)
    }
  }while( this.eat(','));
  return args
}


// primary :
// this 
// ident
// literal
// array
// object
// ( expression )

op.primary = function(){
  var ll = this.ll();
  switch(ll.type){
    case "{":
      return this.object();
    case "[":
      return this.array();
    case "(":
      return this.paren();
    // literal or ident
    case 'STRING':
      this.next();
      return this.getset("'" + ll.value + "'")
    case 'NUMBER':
      this.next();
      return this.getset(""+ll.value);
    case "IDENT":
      this.next();
      if(isKeyWord(ll.value)){
        return this.getset( ll.value );
      }
      return ll.value;
    default: 
      this.error('Unexpected Token: ' + ll.type);
  }
}

// object
//  {propAssign [, propAssign] * [,]}

// propAssign
//  prop : assign

// prop
//  STRING
//  IDENT
//  NUMBER

op.object = function(){
  var code = [this.match('{').type];

  var ll = this.eat( ['STRING', 'IDENT', 'NUMBER'] );
  while(ll){
    code.push("'" + ll.value + "'" + this.match(':').type);
    var get = this.assign().get;
    code.push(get);
    ll = null;
    if(this.eat(",") && (ll = this.eat(['STRING', 'IDENT', 'NUMBER'])) ) code.push(",");
  }
  code.push(this.match('}').type);
  return {get: code.join("")}
}

// array
// [ assign[,assign]*]
op.array = function(){
  var code = [this.match('[').type], item;
  while(item = this.assign()){
    code.push(item.get);
    if(this.eat(',')) code.push(",");
    else break;
  }
  code.push(this.match(']').type);
  return {get: code.join("")};
}

// '(' expression ')'
op.paren = function(){
  this.match('(');
  var res = this.filter()
  res.get = '(' + res.get + ')';
  this.match(')');
  return res;
}

op.getset = function(get, set){
  return {
    get: get,
    set: set
  }
}



module.exports = Parser;

},{"../util.js":26,"./Lexer.js":23,"./node.js":25}],25:[function(require,module,exports){
module.exports = {
  element: function(name, attrs, children){
    return {
      type: 'element',
      tag: name,
      attrs: attrs,
      children: children
    }
  },
  attribute: function(name, value){
    return {
      type: 'attribute',
      name: name,
      value: value
    }
  },
  "if": function(test, consequent, alternate){
    return {
      type: 'if',
      test: test,
      consequent: consequent,
      alternate: alternate
    }
  },
  list: function(sequence, variable, body){
    return {
      type: 'list',
      sequence: sequence,
      variable: variable,
      body: body
    }
  },
  expression: function( body, setbody, constant ){
    return {
      type: "expression",
      body: body,
      constant: constant || false,
      setbody: setbody || false
    }
  },
  text: function(text){
    return {
      type: "text",
      text: text
    }
  },
  template: function(template){
    return {
      type: 'template',
      content: template
    }
  }
}

},{}],26:[function(require,module,exports){
(function (global){
require('./helper/shim.js');
var _  = module.exports;
var entities = require('./helper/entities.js');
var slice = [].slice;
var o2str = ({}).toString;
var win = typeof window !=='undefined'? window: global;


_.noop = function(){};
_.uid = (function(){
  var _uid=0;
  return function(){
    return _uid++;
  }
})();

_.varName = '_d_';
_.setName = '_p_';
_.ctxName = '_c_';

_.rWord = /^[\$\w]+$/;
_.rSimpleAccessor = /^[\$\w]+(\.[\$\w]+)*$/;

_.nextTick = typeof setImmediate === 'function'? 
  setImmediate.bind(win) : 
  function(callback) {
    setTimeout(callback, 0) 
  }



var prefix =  "var " + _.ctxName + "=context.$context||context;" + "var " + _.varName + "=context.data;";


_.host = "data";


_.slice = function(obj, start, end){
  var res = [];
  for(var i = start || 0, len = end || obj.length; i < len; i++){
    var item = obj[i];
    res.push(item)
  }
  return res;
}

_.typeOf = function (o) {
  return o == null ? String(o) : ({}).toString.call(o).slice(8, -1).toLowerCase();
}


_.extend = function( o1, o2, override ){
  if(_.typeOf(override) === 'array'){
   for(var i = 0, len = override.length; i < len; i++ ){
    var key = override[i];
    o1[key] = o2[key];
   } 
  }else{
    for(var i in o2){
      if( typeof o1[i] === "undefined" || override === true ){
        o1[i] = o2[i]
      }
    }
  }
  return o1;
}

_.makePredicate = function makePredicate(words, prefix) {
    if (typeof words === "string") {
        words = words.split(" ");
    }
    var f = "",
    cats = [];
    out: for (var i = 0; i < words.length; ++i) {
        for (var j = 0; j < cats.length; ++j){
          if (cats[j][0].length === words[i].length) {
              cats[j].push(words[i]);
              continue out;
          }
        }
        cats.push([words[i]]);
    }
    function compareTo(arr) {
        if (arr.length === 1) return f += "return str === '" + arr[0] + "';";
        f += "switch(str){";
        for (var i = 0; i < arr.length; ++i){
           f += "case '" + arr[i] + "':";
        }
        f += "return true}return false;";
    }

    // When there are more than three length categories, an outer
    // switch first dispatches on the lengths, to save on comparisons.
    if (cats.length > 3) {
        cats.sort(function(a, b) {
            return b.length - a.length;
        });
        f += "switch(str.length){";
        for (var i = 0; i < cats.length; ++i) {
            var cat = cats[i];
            f += "case " + cat[0].length + ":";
            compareTo(cat);
        }
        f += "}";

        // Otherwise, simply generate a flat `switch` statement.
    } else {
        compareTo(words);
    }
    return new Function("str", f);
}


_.trackErrorPos = (function (){
  // linebreak
  var lb = /\r\n|[\n\r\u2028\u2029]/g;
  function findLine(lines, pos){
    var tmpLen = 0;
    for(var i = 0,len = lines.length; i < len; i++){
      var lineLen = (lines[i] || "").length;
      if(tmpLen + lineLen > pos) return {num: i, line: lines[i], start: pos - tmpLen};
      // 1 is for the linebreak
      tmpLen = tmpLen + lineLen + 1;
    }
    
  }
  return function(input, pos){
    if(pos > input.length-1) pos = input.length-1;
    lb.lastIndex = 0;
    var lines = input.split(lb);
    var line = findLine(lines,pos);
    var len = line.line.length;

    var min = line.start - 10;
    if(min < 0) min = 0;

    var max = line.start + 10;
    if(max > len) max = len;

    var remain = line.line.slice(min, max);
    var prefix = (line.num+1) + "> " + (min > 0? "..." : "")
    var postfix = max < len ? "...": "";

    return prefix + remain + postfix + "\n" + new Array(line.start + prefix.length + 1).join(" ") + "^";
  }
})();


var ignoredRef = /\((\?\!|\?\:|\?\=)/g;
_.findSubCapture = function (regStr) {
  var left = 0,
    right = 0,
    len = regStr.length,
    ignored = regStr.match(ignoredRef); // ignored uncapture
  if(ignored) ignored = ignored.length
  else ignored = 0;
  for (; len--;) {
    var letter = regStr.charAt(len);
    if (len === 0 || regStr.charAt(len - 1) !== "\\" ) { 
      if (letter === "(") left++;
      if (letter === ")") right++;
    }
  }
  if (left !== right) throw "RegExp: "+ regStr + "'s bracket is not marched";
  else return left - ignored;
};


_.escapeRegExp = function( str){// Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
  return str.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, function(match){
    return '\\' + match;
  });
};


var rEntity = new RegExp("&(" + Object.keys(entities).join('|') + ');', 'gi');

_.convertEntity = function(chr){

  return ("" + chr).replace(rEntity, function(all, capture){
    return String.fromCharCode(entities[capture])
  });

}


// simple get accessor

_.createObject = function(o, props){
    function Foo() {}
    Foo.prototype = o;
    var res = new Foo;
    if(props) _.extend(res, props);
    return res;
}

_.createProto = function(fn, o){
    function Foo() { this.constructor = fn;}
    Foo.prototype = o;
    return (fn.prototype = new Foo());
}


/**
clone
*/
_.clone = function clone(obj){
    var type = _.typeOf(obj);
    if(type === 'array'){
      var cloned = [];
      for(var i=0,len = obj.length; i< len;i++){
        cloned[i] = obj[i]
      }
      return cloned;
    }
    if(type === 'object'){
      var cloned = {};
      for(var i in obj) if(obj.hasOwnProperty(i)){
        cloned[i] = obj[i];
      }
      return cloned;
    }
    return obj;
  }


_.equals = function(now, old){
  var type = _.typeOf(now);
  if(type === 'array'){
    var splices = ld(now, old||[]);
    return splices;
  }
  if(type === 'number' && typeof old === 'number'&& isNaN(now) && isNaN(old)) return true
  return now === old;
}


//Levenshtein_distance
//=================================================
//1. http://en.wikipedia.org/wiki/Levenshtein_distance
//2. github.com:polymer/observe-js

var ld = (function(){
  function equals(a,b){
    return a === b;
  }
  function ld(array1, array2){
    var n = array1.length;
    var m = array2.length;
    var matrix = [];
    for(var i = 0; i <= n; i++){
      matrix.push([i]);
    }
    for(var j=1;j<=m;j++){
      matrix[0][j]=j;
    }
    for(var i = 1; i <= n; i++){
      for(var j = 1; j <= m; j++){
        if(equals(array1[i-1], array2[j-1])){
          matrix[i][j] = matrix[i-1][j-1];
        }else{
          matrix[i][j] = Math.min(
            matrix[i-1][j]+1, //delete
            matrix[i][j-1]+1//add
            )
        }
      }
    }
    return matrix;
  }
  function whole(arr2, arr1) {
      var matrix = ld(arr1, arr2)
      var n = arr1.length;
      var i = n;
      var m = arr2.length;
      var j = m;
      var edits = [];
      var current = matrix[i][j];
      while(i>0 || j>0){
      // the last line
        if (i === 0) {
          edits.unshift(3);
          j--;
          continue;
        }
        // the last col
        if (j === 0) {
          edits.unshift(2);
          i--;
          continue;
        }
        var northWest = matrix[i - 1][j - 1];
        var west = matrix[i - 1][j];
        var north = matrix[i][j - 1];

        var min = Math.min(north, west, northWest);

        if (min === west) {
          edits.unshift(2); //delete
          i--;
          current = west;
        } else if (min === northWest ) {
          if (northWest === current) {
            edits.unshift(0); //no change
          } else {
            edits.unshift(1); //update
            current = northWest;
          }
          i--;
          j--;
        } else {
          edits.unshift(3); //add
          j--;
          current = north;
        }
      }
      var LEAVE = 0;
      var ADD = 3;
      var DELELE = 2;
      var UPDATE = 1;
      var n = 0;m=0;
      var steps = [];
      var step = {index: null, add:0, removed:[]};

      for(var i=0;i<edits.length;i++){
        if(edits[i] > 0 ){ // NOT LEAVE
          if(step.index === null){
            step.index = m;
          }
        } else { //LEAVE
          if(step.index != null){
            steps.push(step)
            step = {index: null, add:0, removed:[]};
          }
        }
        switch(edits[i]){
          case LEAVE:
            n++;
            m++;
            break;
          case ADD:
            step.add++;
            m++;
            break;
          case DELELE:
            step.removed.push(arr1[n])
            n++;
            break;
          case UPDATE:
            step.add++;
            step.removed.push(arr1[n])
            n++;
            m++;
            break;
        }
      }
      if(step.index != null){
        steps.push(step)
      }
      return steps
    }
    return whole;
  })();



_.throttle = function throttle(func, wait){
  var wait = wait || 100;
  var context, args, result;
  var timeout = null;
  var previous = 0;
  var later = function() {
    previous = +new Date;
    timeout = null;
    result = func.apply(context, args);
    context = args = null;
  };
  return function() {
    var now = + new Date;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
      context = args = null;
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

// hogan escape
// ==============
_.escape = (function(){
  var rAmp = /&/g,
      rLt = /</g,
      rGt = />/g,
      rApos = /\'/g,
      rQuot = /\"/g,
      hChars = /[&<>\"\']/;

  return function(str) {
    return hChars.test(str) ?
      str
        .replace(rAmp, '&amp;')
        .replace(rLt, '&lt;')
        .replace(rGt, '&gt;')
        .replace(rApos, '&#39;')
        .replace(rQuot, '&quot;') :
      str;
  }
})();

_.cache = function(max){
  max = max || 1000;
  var keys = [],
      cache = {};
  return {
    set: function(key, value) {
      if (keys.length > this.max) {
        cache[keys.shift()] = undefined;
      }
      // 
      if(cache[key] === undefined){
        keys.push(key);
      }
      cache[key] = value;
      return value;
    },
    get: function(key) {
      if (key === undefined) return cache;
      return cache[key];
    },
    max: max,
    len:function(){
      return keys.length;
    }
  };
}

// setup the raw Expression
_.touchExpression = function(expr){
  if(expr.type === 'expression'){
    if(!expr.get){
      expr.get = new Function("context", prefix + "return (" + expr.body + ")");
      expr.body = null;
      if(expr.setbody){
        expr.set = function(ctx, value){
          if(expr.setbody){
            expr.set = new Function('context', _.setName ,  prefix + expr.setbody);
            expr.setbody = null;
          }
          return expr.set(ctx, value);
        }
      }
    }
  }
  return expr;
}


// handle the same logic on component's `on-*` and element's `on-*`
// return the fire object
_.handleEvent = function(value, type ){
  var self = this, evaluate;
  if(value.type === 'expression'){ // if is expression, go evaluated way
    evaluate = value.get;
  }
  if(evaluate){
    return function fire(obj){
      self.data.$event = obj;
      var res = evaluate(self);
      if(res === false && obj && obj.preventDefault) obj.preventDefault();
      delete self.data.$event;
      self.$update();
    }
  }else{
    return function fire(){
      var args = slice.call(arguments)      
      args.unshift(value);
      self.$emit.apply(self.$context, args);
      self.$update();
    }
  }
}

// only call once
_.once = function(fn){
  var time = 0;
  return function(){
    if( time++ === 0) fn.apply(this, arguments);
  }
}








_.log = function(msg, type){
  if(typeof console !== "undefined")  console[type || "log"](msg);
}




//http://www.w3.org/html/wg/drafts/html/master/single-page.html#void-elements
_.isVoidTag = _.makePredicate("area base br col embed hr img input keygen link menuitem meta param source track wbr r-content");
_.isBooleanAttr = _.makePredicate('selected checked disabled readOnly required open autofocus controls autoplay compact loop defer multiple');

_.isFalse - function(){return false}
_.isTrue - function(){return true}


_.assert = function(test, msg){
  if(!test) throw msg;
}



_.defineProperty = function(){
  
}


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./helper/entities.js":17,"./helper/shim.js":21}],27:[function(require,module,exports){
var node = require("./parser/node.js");
var dom = require("./dom.js");
var animate = require("./helper/animate.js");
var Group = require('./group.js');
var _ = require('./util');
var combine = require('./helper/combine.js');

var walkers = module.exports = {};

walkers.list = function(ast){

  var Regular = walkers.Regular;  
  var placeholder = document.createComment("Regular list"),
    namespace = this.__ns__;
  // proxy Component to implement list item, so the behaviar is similar with angular;
  var Section =  Regular.extend( { 
    template: ast.body, 
    $context: this.$context,
    // proxy the event to $context
    $on: this.$context.$on.bind(this.$context),
    $off: this.$context.$off.bind(this.$context),
    $emit: this.$context.$emit.bind(this.$context)
  });
  Regular._inheritConfig(Section, this.constructor);

  // var fragment = dom.fragment();
  // fragment.appendChild(placeholder);
  var self = this;
  var group = new Group();
  group.push(placeholder);
  var indexName = ast.variable + '_index';
  var variable = ast.variable;
  // group.push(placeholder);


  function update(newValue, splices){
    newValue = newValue || [];
    if(!splices || !splices.length) return;
    var cur = placeholder;
    var m = 0, len = newValue.length,
      mIndex = splices[0].index;

    for(var i = 0; i < splices.length; i++){ //init
      var splice = splices[i];
      var index = splice.index; // beacuse we use a comment for placeholder

      for(var k = m; k < index; k++){ // no change
        var sect = group.get( k + 1 );
        sect.data[indexName] = k;
      }
      for(var j = 0, jlen = splice.removed.length; j< jlen; j++){ //removed
        var removed = group.children.splice( index + 1, 1)[0];
        removed.destroy(true);
      }

      for(var o = index; o < index + splice.add; o++){ //add
        // prototype inherit
        var item = newValue[o];
        var data = _.createObject(self.data);
        data[indexName] = o;
        data[variable] = item;

        //@TODO
        var section = new Section({data: data, $parent: self , namespace: namespace});


        // autolink
        var insert =  combine.last(group.get(o));
        // animate.inject(combine.node(section),insert,'after')
        if(insert.parentNode){
          animate.inject(combine.node(section),insert, 'after');
        }
        // insert.parentNode.insertBefore(combine.node(section), insert.nextSibling);
        group.children.splice( o + 1 , 0, section);
      }
      m = index + splice.add - splice.removed.length;
      m  = m < 0? 0 : m;

    }
    if(m < len){
      for(var i = m; i < len; i++){
        var pair = group.get(i + 1);
        pair.data[indexName] = i;
      }
    }
  }

  this.$watch(ast.sequence, update, { init: true });
  return group;
}

walkers.template = function(ast){
  var content = ast.content, compiled;
  var placeholder = document.createComment('template');
  var compiled, namespace = this.__ns__;
  // var fragment = dom.fragment();
  // fragment.appendChild(placeholder);
  var group = new Group();
  group.push(placeholder);
  if(content){
    var self = this;
    this.$watch(content, function(value){
      if( compiled = group.get(1)){
        compiled.destroy(true); 
        group.children.pop();
      }
      group.push( compiled =  self.$compile(value, {record: true, namespace: namespace}) ); 
      if(placeholder.parentNode) animate.inject(combine.node(compiled), placeholder, 'before')
    }, {
      init: true
    });
  }
  return group;
};


// how to resolve this problem
var ii = 0;
walkers['if'] = function(ast, options){
  var self = this, consequent, alternate;
  if(options && options.element){ // attribute inteplation
    var update = function(nvalue){
      if(!!nvalue){
        if(alternate) combine.destroy(alternate)
        if(ast.consequent) consequent = self.$compile(ast.consequent, {record: true, element: options.element });
      }else{
        if(consequent) combine.destroy(consequent)
        if(ast.alternate) alternate = self.$compile(ast.alternate, {record: true, element: options.element});
      }
    }
    this.$watch(ast.test, update, { force: true });
    return {
      destroy: function(){
        if(consequent) combine.destroy(consequent);
        else if(alternate) combine.destroy(alternate);
      }
    }
  }


  var test, consequent, alternate, node;
  var placeholder = document.createComment("Regular if" + ii++);
  var group = new Group();
  group.push(placeholder);
  var preValue = null, namespace= this.__ns__;


  var update = function (nvalue, old){
    var value = !!nvalue;
    if(value === preValue) return;
    preValue = value;
    if(group.children[1]){
      group.children[1].destroy(true);
      group.children.pop();
    }
    if(value){ //true
      if(ast.consequent && ast.consequent.length){
        consequent = self.$compile( ast.consequent , {record:true, namespace: namespace })
        // placeholder.parentNode && placeholder.parentNode.insertBefore( node, placeholder );
        group.push(consequent);
        if(placeholder.parentNode){
          animate.inject(combine.node(consequent), placeholder, 'before');
        }
      }
    }else{ //false
      if(ast.alternate && ast.alternate.length){
        alternate = self.$compile(ast.alternate, {record:true, namespace: namespace});
        group.push(alternate);
        if(placeholder.parentNode){
          animate.inject(combine.node(alternate), placeholder, 'before');
        }
      }
    }
  }
  this.$watch(ast.test, update, {force: true, init: true});

  return group;
}


walkers.expression = function(ast){
  var node = document.createTextNode("");
  this.$watch(ast, function(newval){
    dom.text(node, "" + (newval == null? "": "" + newval) );
  })
  return node;
}
walkers.text = function(ast){
  var node = document.createTextNode(_.convertEntity(ast.text));
  return node;
}


var eventReg = /^on-(.+)$/

/**
 * walkers element (contains component)
 */
walkers.element = function(ast){
  var attrs = ast.attrs, 
    component, self = this,
    Constructor=this.constructor,
    children = ast.children,
    namespace = this.__ns__, ref, group, 
    Component = Constructor.component(ast.tag);


  if(ast.tag === 'svg') var namespace = "svg";


  if(children && children.length){
    group = this.$compile(children, {namespace: namespace });
  }


  if(Component){
    var data = {},events;
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = attr.value||"";
      _.touchExpression(value);
      var name = attr.name;
      var etest = name.match(eventReg);
      // bind event proxy
      if(etest){
        events = events || {};
        events[etest[1]] = _.handleEvent.call(this, value, etest[1]);
        continue;
      }

      if(value.type !== 'expression'){
        data[attr.name] = value;
      }else{
        data[attr.name] = value.get(self); 
      }
      if( attr.name === 'ref'  && value != null){
        ref = value.type === 'expression'? value.get(self): value;
      }

    }

    var $body;
    if(ast.children) $body = this.$compile(ast.children);
    var component = new Component({data: data, events: events, $body: $body, $parent: this, namespace: namespace});
    if(ref &&  self.$context.$refs) self.$context.$refs[ref] = component;
    for(var i = 0, len = attrs.length; i < len; i++){
      var attr = attrs[i];
      var value = attr.value||"";
      if(value.type === 'expression' && attr.name.indexOf('on-')===-1){
        this.$watch(value, component.$update.bind(component, attr.name))
        if(value.set) component.$watch(attr.name, self.$update.bind(self, value))
      }
    }
    if(ref){
      component.$on('destroy', function(){
        if(self.$context.$refs) self.$context.$refs[ref] = null;
      })
    }
    return component;
  }else if(ast.tag === 'r-content' && this.$body){
    return this.$body;
  }

  var element = dom.create(ast.tag, namespace, attrs);
  // context element

  var child;

  if(group && !_.isVoidTag(ast.tag)){
    dom.inject( combine.node(group) , element)
  }

  // sort before
  attrs.sort(function(a1, a2){
    var d1 = Constructor.directive(a1.name),
      d2 = Constructor.directive(a2.name);
    if(d1 && d2) return (d2.priority || 1) - (d1.priority || 1);
    if(d1) return 1;
    if(d2) return -1;
    if(a2.name === "type") return 1;
    return -1;
  })
  // may distinct with if else
  var destroies = walkAttributes.call(this, attrs, element, destroies);



  var res  = {
    type: "element",
    group: group,
    node: function(){
      return element;
    },
    last: function(){
      return element;
    },
    destroy: function(first){
      if( first ){
        animate.remove( element, group? group.destroy.bind( group ): _.noop );
      }
      // destroy ref
      if( destroies.length ) {
        destroies.forEach(function( destroy ){
          if( destroy ){
            if( typeof destroy.destroy === 'function' ){
              destroy.destroy()
            }else{
              destroy();
            }
          }
        })
      }
    }
  }
  return res;
}

function walkAttributes(attrs, element){
  var bindings = []
  for(var i = 0, len = attrs.length; i < len; i++){
    var binding = this._walk(attrs[i], {element: element, fromElement: true, attrs: attrs})
    if(binding) bindings.push(binding);
  }
  return bindings;
}

walkers.attribute = function(ast ,options){
  var attr = ast;
  var Component = this.constructor;
  var self = this;
  var element = options.element;
  var name = attr.name,
    value = attr.value || "", directive = Component.directive(name);

  _.touchExpression(value);


  if(directive && directive.link){
    var binding = directive.link.call(self, element, value, name, options.attrs);
    if(typeof binding === 'function') binding = {destroy: binding}; 
    return binding;
  }else{
    if( name === 'ref'  && value != null && options.fromElement){
      var ref = value.type === 'expression'? value.get(self): value;
      var refs = this.$context.$refs;
      if(refs){
        refs[ref] = element
        return {
          destroy: function(){
            refs[ref] = null;
          }
        }
      }
    }
    if(value.type === 'expression' ){

      this.$watch(value, function(nvalue, old){
        dom.attr(element, name, nvalue);
      }, {init: true});
    }else{
      if(_.isBooleanAttr(name)){
        dom.attr(element, name, true);
      }else{
        dom.attr(element, name, value);
      }
    }
    if(!options.fromElement){
      return {
        destroy: function(){
          dom.attr(element, name, null);
        }
      }
    }
  }

}


},{"./dom.js":12,"./group.js":14,"./helper/animate.js":15,"./helper/combine.js":16,"./parser/node.js":25,"./util":26}],28:[function(require,module,exports){
/*!
  * Reqwest! A general purpose XHR connection manager
  * license MIT (c) Dustin Diaz 2014
  * https://github.com/ded/reqwest
  */

!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('reqwest', this, function () {

  var win = window
    , doc = document
    , httpsRe = /^http/
    , protocolRe = /(^\w+):\/\//
    , twoHundo = /^(20\d|1223)$/ //http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
    , byTag = 'getElementsByTagName'
    , readyState = 'readyState'
    , contentType = 'Content-Type'
    , requestedWith = 'X-Requested-With'
    , head = doc[byTag]('head')[0]
    , uniqid = 0
    , callbackPrefix = 'reqwest_' + (+new Date())
    , lastValue // data stored by the most recent JSONP callback
    , xmlHttpRequest = 'XMLHttpRequest'
    , xDomainRequest = 'XDomainRequest'
    , noop = function () {}

    , isArray = typeof Array.isArray == 'function'
        ? Array.isArray
        : function (a) {
            return a instanceof Array
          }

    , defaultHeaders = {
          'contentType': 'application/x-www-form-urlencoded'
        , 'requestedWith': xmlHttpRequest
        , 'accept': {
              '*':  'text/javascript, text/html, application/xml, text/xml, */*'
            , 'xml':  'application/xml, text/xml'
            , 'html': 'text/html'
            , 'text': 'text/plain'
            , 'json': 'application/json, text/javascript'
            , 'js':   'application/javascript, text/javascript'
          }
      }

    , xhr = function(o) {
        // is it x-domain
        if (o['crossOrigin'] === true) {
          var xhr = win[xmlHttpRequest] ? new XMLHttpRequest() : null
          if (xhr && 'withCredentials' in xhr) {
            return xhr
          } else if (win[xDomainRequest]) {
            return new XDomainRequest()
          } else {
            throw new Error('Browser does not support cross-origin requests')
          }
        } else if (win[xmlHttpRequest]) {
          return new XMLHttpRequest()
        } else {
          return new ActiveXObject('Microsoft.XMLHTTP')
        }
      }
    , globalSetupOptions = {
        dataFilter: function (data) {
          return data
        }
      }

  function succeed(r) {
    var protocol = protocolRe.exec(r.url);
    protocol = (protocol && protocol[1]) || window.location.protocol;
    return httpsRe.test(protocol) ? twoHundo.test(r.request.status) : !!r.request.response;
  }

  function handleReadyState(r, success, error) {
    return function () {
      // use _aborted to mitigate against IE err c00c023f
      // (can't read props on aborted request objects)
      if (r._aborted) return error(r.request)
      if (r._timedOut) return error(r.request, 'Request is aborted: timeout')
      if (r.request && r.request[readyState] == 4) {
        r.request.onreadystatechange = noop
        if (succeed(r)) success(r.request)
        else
          error(r.request)
      }
    }
  }

  function setHeaders(http, o) {
    var headers = o['headers'] || {}
      , h

    headers['Accept'] = headers['Accept']
      || defaultHeaders['accept'][o['type']]
      || defaultHeaders['accept']['*']

    var isAFormData = typeof FormData === 'function' && (o['data'] instanceof FormData);
    // breaks cross-origin requests with legacy browsers
    if (!o['crossOrigin'] && !headers[requestedWith]) headers[requestedWith] = defaultHeaders['requestedWith']
    if (!headers[contentType] && !isAFormData) headers[contentType] = o['contentType'] || defaultHeaders['contentType']
    for (h in headers)
      headers.hasOwnProperty(h) && 'setRequestHeader' in http && http.setRequestHeader(h, headers[h])
  }

  function setCredentials(http, o) {
    if (typeof o['withCredentials'] !== 'undefined' && typeof http.withCredentials !== 'undefined') {
      http.withCredentials = !!o['withCredentials']
    }
  }

  function generalCallback(data) {
    lastValue = data
  }

  function urlappend (url, s) {
    return url + (/\?/.test(url) ? '&' : '?') + s
  }

  function handleJsonp(o, fn, err, url) {
    var reqId = uniqid++
      , cbkey = o['jsonpCallback'] || 'callback' // the 'callback' key
      , cbval = o['jsonpCallbackName'] || reqwest.getcallbackPrefix(reqId)
      , cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)')
      , match = url.match(cbreg)
      , script = doc.createElement('script')
      , loaded = 0
      , isIE10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1

    if (match) {
      if (match[3] === '?') {
        url = url.replace(cbreg, '$1=' + cbval) // wildcard callback func name
      } else {
        cbval = match[3] // provided callback func name
      }
    } else {
      url = urlappend(url, cbkey + '=' + cbval) // no callback details, add 'em
    }

    win[cbval] = generalCallback

    script.type = 'text/javascript'
    script.src = url
    script.async = true
    if (typeof script.onreadystatechange !== 'undefined' && !isIE10) {
      // need this for IE due to out-of-order onreadystatechange(), binding script
      // execution to an event listener gives us control over when the script
      // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
      script.htmlFor = script.id = '_reqwest_' + reqId
    }

    script.onload = script.onreadystatechange = function () {
      if ((script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded') || loaded) {
        return false
      }
      script.onload = script.onreadystatechange = null
      script.onclick && script.onclick()
      // Call the user callback with the last value stored and clean up values and scripts.
      fn(lastValue)
      lastValue = undefined
      head.removeChild(script)
      loaded = 1
    }

    // Add the script to the DOM head
    head.appendChild(script)

    // Enable JSONP timeout
    return {
      abort: function () {
        script.onload = script.onreadystatechange = null
        err({}, 'Request is aborted: timeout', {})
        lastValue = undefined
        head.removeChild(script)
        loaded = 1
      }
    }
  }

  function getRequest(fn, err) {
    var o = this.o
      , method = (o['method'] || 'GET').toUpperCase()
      , url = typeof o === 'string' ? o : o['url']
      // convert non-string objects to query-string form unless o['processData'] is false
      , data = (o['processData'] !== false && o['data'] && typeof o['data'] !== 'string')
        ? reqwest.toQueryString(o['data'])
        : (o['data'] || null)
      , http
      , sendWait = false

    // if we're working on a GET request and we have data then we should append
    // query string to end of URL and not post data
    if ((o['type'] == 'jsonp' || method == 'GET') && data) {
      url = urlappend(url, data)
      data = null
    }

    if (o['type'] == 'jsonp') return handleJsonp(o, fn, err, url)

    // get the xhr from the factory if passed
    // if the factory returns null, fall-back to ours
    http = (o.xhr && o.xhr(o)) || xhr(o)

    http.open(method, url, o['async'] === false ? false : true)
    setHeaders(http, o)
    setCredentials(http, o)
    if (win[xDomainRequest] && http instanceof win[xDomainRequest]) {
        http.onload = fn
        http.onerror = err
        // NOTE: see
        // http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/30ef3add-767c-4436-b8a9-f1ca19b4812e
        http.onprogress = function() {}
        sendWait = true
    } else {
      http.onreadystatechange = handleReadyState(this, fn, err)
    }
    o['before'] && o['before'](http)
    if (sendWait) {
      setTimeout(function () {
        http.send(data)
      }, 200)
    } else {
      http.send(data)
    }
    return http
  }

  function Reqwest(o, fn) {
    this.o = o
    this.fn = fn

    init.apply(this, arguments)
  }

  function setType(header) {
    // json, javascript, text/plain, text/html, xml
    if (header.match('json')) return 'json'
    if (header.match('javascript')) return 'js'
    if (header.match('text')) return 'html'
    if (header.match('xml')) return 'xml'
  }

  function init(o, fn) {

    this.url = typeof o == 'string' ? o : o['url']
    this.timeout = null

    // whether request has been fulfilled for purpose
    // of tracking the Promises
    this._fulfilled = false
    // success handlers
    this._successHandler = function(){}
    this._fulfillmentHandlers = []
    // error handlers
    this._errorHandlers = []
    // complete (both success and fail) handlers
    this._completeHandlers = []
    this._erred = false
    this._responseArgs = {}

    var self = this

    fn = fn || function () {}

    if (o['timeout']) {
      this.timeout = setTimeout(function () {
        timedOut()
      }, o['timeout'])
    }

    if (o['success']) {
      this._successHandler = function () {
        o['success'].apply(o, arguments)
      }
    }

    if (o['error']) {
      this._errorHandlers.push(function () {
        o['error'].apply(o, arguments)
      })
    }

    if (o['complete']) {
      this._completeHandlers.push(function () {
        o['complete'].apply(o, arguments)
      })
    }

    function complete (resp) {
      o['timeout'] && clearTimeout(self.timeout)
      self.timeout = null
      while (self._completeHandlers.length > 0) {
        self._completeHandlers.shift()(resp)
      }
    }

    function success (resp) {
      var type = o['type'] || resp && setType(resp.getResponseHeader('Content-Type')) // resp can be undefined in IE
      resp = (type !== 'jsonp') ? self.request : resp
      // use global data filter on response text
      var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type)
        , r = filteredResponse
      try {
        resp.responseText = r
      } catch (e) {
        // can't assign this in IE<=8, just ignore
      }
      if (r) {
        switch (type) {
        case 'json':
          try {
            resp = win.JSON ? win.JSON.parse(r) : eval('(' + r + ')')
          } catch (err) {
            return error(resp, 'Could not parse JSON in response', err)
          }
          break
        case 'js':
          resp = eval(r)
          break
        case 'html':
          resp = r
          break
        case 'xml':
          resp = resp.responseXML
              && resp.responseXML.parseError // IE trololo
              && resp.responseXML.parseError.errorCode
              && resp.responseXML.parseError.reason
            ? null
            : resp.responseXML
          break
        }
      }

      self._responseArgs.resp = resp
      self._fulfilled = true
      fn(resp)
      self._successHandler(resp)
      while (self._fulfillmentHandlers.length > 0) {
        resp = self._fulfillmentHandlers.shift()(resp)
      }

      complete(resp)
    }

    function timedOut() {
      self._timedOut = true
      self.request.abort()      
    }

    function error(resp, msg, t) {
      resp = self.request
      self._responseArgs.resp = resp
      self._responseArgs.msg = msg
      self._responseArgs.t = t
      self._erred = true
      while (self._errorHandlers.length > 0) {
        self._errorHandlers.shift()(resp, msg, t)
      }
      complete(resp)
    }

    this.request = getRequest.call(this, success, error)
  }

  Reqwest.prototype = {
    abort: function () {
      this._aborted = true
      this.request.abort()
    }

  , retry: function () {
      init.call(this, this.o, this.fn)
    }

    /**
     * Small deviation from the Promises A CommonJs specification
     * http://wiki.commonjs.org/wiki/Promises/A
     */

    /**
     * `then` will execute upon successful requests
     */
  , then: function (success, fail) {
      success = success || function () {}
      fail = fail || function () {}
      if (this._fulfilled) {
        this._responseArgs.resp = success(this._responseArgs.resp)
      } else if (this._erred) {
        fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._fulfillmentHandlers.push(success)
        this._errorHandlers.push(fail)
      }
      return this
    }

    /**
     * `always` will execute whether the request succeeds or fails
     */
  , always: function (fn) {
      if (this._fulfilled || this._erred) {
        fn(this._responseArgs.resp)
      } else {
        this._completeHandlers.push(fn)
      }
      return this
    }

    /**
     * `fail` will execute when the request fails
     */
  , fail: function (fn) {
      if (this._erred) {
        fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._errorHandlers.push(fn)
      }
      return this
    }
  , 'catch': function (fn) {
      return this.fail(fn)
    }
  }

  function reqwest(o, fn) {
    return new Reqwest(o, fn)
  }

  // normalize newline variants according to spec -> CRLF
  function normalize(s) {
    return s ? s.replace(/\r?\n/g, '\r\n') : ''
  }

  function serial(el, cb) {
    var n = el.name
      , t = el.tagName.toLowerCase()
      , optCb = function (o) {
          // IE gives value="" even where there is no value attribute
          // 'specified' ref: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-862529273
          if (o && !o['disabled'])
            cb(n, normalize(o['attributes']['value'] && o['attributes']['value']['specified'] ? o['value'] : o['text']))
        }
      , ch, ra, val, i

    // don't serialize elements that are disabled or without a name
    if (el.disabled || !n) return

    switch (t) {
    case 'input':
      if (!/reset|button|image|file/i.test(el.type)) {
        ch = /checkbox/i.test(el.type)
        ra = /radio/i.test(el.type)
        val = el.value
        // WebKit gives us "" instead of "on" if a checkbox has no value, so correct it here
        ;(!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val))
      }
      break
    case 'textarea':
      cb(n, normalize(el.value))
      break
    case 'select':
      if (el.type.toLowerCase() === 'select-one') {
        optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null)
      } else {
        for (i = 0; el.length && i < el.length; i++) {
          el.options[i].selected && optCb(el.options[i])
        }
      }
      break
    }
  }

  // collect up all form elements found from the passed argument elements all
  // the way down to child elements; pass a '<form>' or form fields.
  // called with 'this'=callback to use for serial() on each element
  function eachFormElement() {
    var cb = this
      , e, i
      , serializeSubtags = function (e, tags) {
          var i, j, fa
          for (i = 0; i < tags.length; i++) {
            fa = e[byTag](tags[i])
            for (j = 0; j < fa.length; j++) serial(fa[j], cb)
          }
        }

    for (i = 0; i < arguments.length; i++) {
      e = arguments[i]
      if (/input|select|textarea/i.test(e.tagName)) serial(e, cb)
      serializeSubtags(e, [ 'input', 'select', 'textarea' ])
    }
  }

  // standard query string style serialization
  function serializeQueryString() {
    return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments))
  }

  // { 'name': 'value', ... } style serialization
  function serializeHash() {
    var hash = {}
    eachFormElement.apply(function (name, value) {
      if (name in hash) {
        hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]])
        hash[name].push(value)
      } else hash[name] = value
    }, arguments)
    return hash
  }

  // [ { name: 'name', value: 'value' }, ... ] style serialization
  reqwest.serializeArray = function () {
    var arr = []
    eachFormElement.apply(function (name, value) {
      arr.push({name: name, value: value})
    }, arguments)
    return arr
  }

  reqwest.serialize = function () {
    if (arguments.length === 0) return ''
    var opt, fn
      , args = Array.prototype.slice.call(arguments, 0)

    opt = args.pop()
    opt && opt.nodeType && args.push(opt) && (opt = null)
    opt && (opt = opt.type)

    if (opt == 'map') fn = serializeHash
    else if (opt == 'array') fn = reqwest.serializeArray
    else fn = serializeQueryString

    return fn.apply(null, args)
  }

  reqwest.toQueryString = function (o, trad) {
    var prefix, i
      , traditional = trad || false
      , s = []
      , enc = encodeURIComponent
      , add = function (key, value) {
          // If value is a function, invoke it and return its value
          value = ('function' === typeof value) ? value() : (value == null ? '' : value)
          s[s.length] = enc(key) + '=' + enc(value)
        }
    // If an array was passed in, assume that it is an array of form elements.
    if (isArray(o)) {
      for (i = 0; o && i < o.length; i++) add(o[i]['name'], o[i]['value'])
    } else {
      // If traditional, encode the "old" way (the way 1.3.2 or older
      // did it), otherwise encode params recursively.
      for (prefix in o) {
        if (o.hasOwnProperty(prefix)) buildParams(prefix, o[prefix], traditional, add)
      }
    }

    // spaces should be + according to spec
    return s.join('&').replace(/%20/g, '+')
  }

  function buildParams(prefix, obj, traditional, add) {
    var name, i, v
      , rbracket = /\[\]$/

    if (isArray(obj)) {
      // Serialize array item.
      for (i = 0; obj && i < obj.length; i++) {
        v = obj[i]
        if (traditional || rbracket.test(prefix)) {
          // Treat each array item as a scalar.
          add(prefix, v)
        } else {
          buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add)
        }
      }
    } else if (obj && obj.toString() === '[object Object]') {
      // Serialize object item.
      for (name in obj) {
        buildParams(prefix + '[' + name + ']', obj[name], traditional, add)
      }

    } else {
      // Serialize scalar item.
      add(prefix, obj)
    }
  }

  reqwest.getcallbackPrefix = function () {
    return callbackPrefix
  }

  // jQuery and Zepto compatibility, differences can be remapped here so you can call
  // .ajax.compat(options, callback)
  reqwest.compat = function (o, fn) {
    if (o) {
      o['type'] && (o['method'] = o['type']) && delete o['type']
      o['dataType'] && (o['type'] = o['dataType'])
      o['jsonpCallback'] && (o['jsonpCallbackName'] = o['jsonpCallback']) && delete o['jsonpCallback']
      o['jsonp'] && (o['jsonpCallback'] = o['jsonp'])
    }
    return new Reqwest(o, fn)
  }

  reqwest.ajaxSetup = function (options) {
    options = options || {}
    for (var k in options) {
      globalSetupOptions[k] = options[k]
    }
  }

  return reqwest
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvanMvaW5kZXguanMiLCJjbGllbnQvanMvY29udHJvbGxlci9ib29rLmpzIiwiY2xpZW50L2pzL2Rhby9ib29rLmpzIiwiY2xpZW50L2pzL3NlcnZpY2UvYm9vay5qcyIsImNsaWVudC9qcy92aWV3L2Jvb2suaHRtbCIsImNsaWVudC9qcy92aWV3L2Jvb2suanMiLCJjbGllbnQvanMvdmlldy9ib29rcy5odG1sIiwiY2xpZW50L2pzL3ZpZXcvYm9va3MuanMiLCJub2RlX21vZHVsZXMvZGlyZWN0b3IvYnVpbGQvZGlyZWN0b3IuanMiLCJub2RlX21vZHVsZXMvcmVndWxhcmpzL3NyYy9SZWd1bGFyLmpzIiwibm9kZV9tb2R1bGVzL3JlZ3VsYXJqcy9zcmMvY29uZmlnLmpzIiwibm9kZV9tb2R1bGVzL3JlZ3VsYXJqcy9zcmMvZG9tLmpzIiwibm9kZV9tb2R1bGVzL3JlZ3VsYXJqcy9zcmMvZW52LmpzIiwibm9kZV9tb2R1bGVzL3JlZ3VsYXJqcy9zcmMvZ3JvdXAuanMiLCJub2RlX21vZHVsZXMvcmVndWxhcmpzL3NyYy9oZWxwZXIvYW5pbWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWd1bGFyanMvc3JjL2hlbHBlci9jb21iaW5lLmpzIiwibm9kZV9tb2R1bGVzL3JlZ3VsYXJqcy9zcmMvaGVscGVyL2VudGl0aWVzLmpzIiwibm9kZV9tb2R1bGVzL3JlZ3VsYXJqcy9zcmMvaGVscGVyL2V2ZW50LmpzIiwibm9kZV9tb2R1bGVzL3JlZ3VsYXJqcy9zcmMvaGVscGVyL2V4dGVuZC5qcyIsIm5vZGVfbW9kdWxlcy9yZWd1bGFyanMvc3JjL2hlbHBlci9wYXJzZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWd1bGFyanMvc3JjL2hlbHBlci9zaGltLmpzIiwibm9kZV9tb2R1bGVzL3JlZ3VsYXJqcy9zcmMvaGVscGVyL3dhdGNoZXIuanMiLCJub2RlX21vZHVsZXMvcmVndWxhcmpzL3NyYy9wYXJzZXIvTGV4ZXIuanMiLCJub2RlX21vZHVsZXMvcmVndWxhcmpzL3NyYy9wYXJzZXIvUGFyc2VyLmpzIiwibm9kZV9tb2R1bGVzL3JlZ3VsYXJqcy9zcmMvcGFyc2VyL25vZGUuanMiLCJub2RlX21vZHVsZXMvcmVndWxhcmpzL3NyYy91dGlsLmpzIiwibm9kZV9tb2R1bGVzL3JlZ3VsYXJqcy9zcmMvd2Fsa2Vycy5qcyIsIm5vZGVfbW9kdWxlcy9yZXF3ZXN0L3JlcXdlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOXNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Z0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL29CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcGhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSb3V0ZXIgPSByZXF1aXJlKCdkaXJlY3RvcicpLlJvdXRlcjtcbnZhciBSZWd1bGFyID0gcmVxdWlyZShcInJlZ3VsYXJqc1wiKTtcbnZhciBib29rID0gcmVxdWlyZSgnLi9jb250cm9sbGVyL2Jvb2suanMnKTtcblxudmFyIGN1cnJlbnRWaWV3O1xudmFyIHJlY3ljbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbmZ1bmN0aW9uIHNob3coY29udHJvbGxlcikge1xuXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cdFx0YXJncy5wdXNoKGZ1bmN0aW9uIGNiKHZpZXcpIHtcblx0XHRcdGlmKGN1cnJlbnRWaWV3KXtcblx0XHRcdFx0Y3VycmVudFZpZXcuJGluamVjdChyZWN5Y2xlKTtcblx0XHRcdH1cblx0XHRcdGN1cnJlbnRWaWV3ID0gdmlldztcblx0XHRcdGN1cnJlbnRWaWV3LiRpbmplY3QoJyN2aWV3Jyk7XG5cdFx0fSk7XG5cdFx0Y29udHJvbGxlci5hcHBseShudWxsLCBhcmdzKTtcblx0fTtcbn1cblxudmFyIHJvdXRlcyA9IHtcblx0Jy9ib29rcyc6IHNob3coYm9vay5saXN0KSxcblx0Jy9ib29rcy86Ym9va0lkJzogc2hvdyhib29rLmdldClcbn07XG5cbnZhciByb3V0ZXIgPSBSb3V0ZXIocm91dGVzKTtcblxucm91dGVyLmluaXQoKTsiLCJ2YXIgQm9va1ZpZXcgPSByZXF1aXJlKFwiLi4vdmlldy9ib29rLmpzXCIpO1xudmFyIEJvb2tzVmlldyA9IHJlcXVpcmUoXCIuLi92aWV3L2Jvb2tzLmpzXCIpO1xudmFyIGJvb2tTZXJ2aWNlID0gcmVxdWlyZShcIi4uL3NlcnZpY2UvYm9vay5qc1wiKTtcbnZhciBib29rQ29udHJvbGxlciA9IHt9O1xuYm9va0NvbnRyb2xsZXIubGlzdCA9IGZ1bmN0aW9uKGNiKSB7XG5cdGJvb2tTZXJ2aWNlLmdldExpc3QoZnVuY3Rpb24oYm9va3MpIHtcblx0XHRjYihuZXcgQm9va3NWaWV3KHtcblx0XHRcdGRhdGE6IHtcblx0XHRcdFx0Ym9va3M6IGJvb2tzXG5cdFx0XHR9XG5cdFx0fSkpO1xuXHR9KTtcbn07XG5ib29rQ29udHJvbGxlci5nZXQgPSBmdW5jdGlvbihib29rSWQsIGNiKSB7XG5cdGJvb2tTZXJ2aWNlLmdldEJvb2tCeUlkKHBhcnNlSW50KGJvb2tJZCksIGZ1bmN0aW9uKGJvb2spIHtcblx0XHRjYihuZXcgQm9va1ZpZXcoe1xuXHRcdFx0ZGF0YToge1xuXHRcdFx0XHRib29rOiBib29rXG5cdFx0XHR9XG5cdFx0fSkpO1xuXHR9KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IGJvb2tDb250cm9sbGVyOyIsInZhciByZXF3ZXN0ID0gcmVxdWlyZShcInJlcXdlc3RcIik7XG52YXIgYm9va0RBTyA9IHt9O1xuXG5ib29rREFPLmdldExpc3QgPSBmdW5jdGlvbihjYikge1xuXHRyZXF3ZXN0KHtcblx0XHR1cmw6IFwiL2FwaS9ib29rc1wiLFxuXHRcdG1ldGhvZDogXCJnZXRcIixcblx0XHR0eXBlOiBcImpzb25cIixcblx0XHRzdWNjZXNzOiBmdW5jdGlvbihib29rcyl7XG5cdFx0XHRjYihib29rcyk7XG5cdFx0fVxuXHR9KTtcbn07XG5ib29rREFPLmdldEJvb2tCeUlkID0gZnVuY3Rpb24oaWQsIGNiKSB7XG5cdHJlcXdlc3Qoe1xuXHRcdHVybDogXCIvYXBpL2Jvb2tzXCIsXG5cdFx0bWV0aG9kOiBcImdldFwiLFxuXHRcdHR5cGU6IFwianNvblwiLFxuXHRcdGRhdGE6IHtpZDogaWR9LFxuXHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGJvb2spe1xuXHRcdFx0Y2IoYm9vayk7XG5cdFx0fVxuXHR9KTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IGJvb2tEQU87IiwidmFyIGJvb2tEQU8gPSByZXF1aXJlKFwiLi4vZGFvL2Jvb2suanNcIik7XG52YXIgYm9va1NlcnZpY2UgPSB7fTtcblxuYm9va1NlcnZpY2UuZ2V0TGlzdCA9IGZ1bmN0aW9uKGNiKSB7XG5cdGJvb2tEQU8uZ2V0TGlzdChjYik7XG59O1xuYm9va1NlcnZpY2UuZ2V0Qm9va0J5SWQgPSBmdW5jdGlvbihpZCwgY2IpIHtcblx0Ym9va0RBTy5nZXRCb29rQnlJZChpZCwgY2IpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gYm9va1NlcnZpY2U7IiwibW9kdWxlLmV4cG9ydHM9XCI8ZGw+XHQ8ZHQ+e3tib29rLm5hbWV9fTwvZHQ+XHQ8ZGQ+e3tib29rLmF1dGhvcn19PC9kZD5cdDxkZD57e2Jvb2sucHVibGlzaGVyfX08L2RkPjwvZGw+XCIiLCJ2YXIgUmVndWxhciA9IHJlcXVpcmUoXCJyZWd1bGFyanNcIik7XG52YXIgaHRtbCA9IHJlcXVpcmUoXCIuL2Jvb2suaHRtbFwiKTtcblxudmFyIEJvb2tWaWV3ID0gUmVndWxhci5leHRlbmQoe1xuXHRuYW1lOiAnYm9vaycsXG5cdHRlbXBsYXRlOiBodG1sXG59KTtcbm1vZHVsZS5leHBvcnRzID0gQm9va1ZpZXc7IiwibW9kdWxlLmV4cG9ydHM9XCI8dGFibGU+XHQ8dGhlYWQ+XHRcdDx0cj5cdFx0XHQ8dGg+5Lmm5ZCNPC90aD5cdFx0XHQ8dGg+5L2c6ICFPC90aD5cdFx0XHQ8dGg+5Ye654mI56S+PC90aD5cdFx0PC90cj5cdDwvdGhlYWQ+XHQ8dGJvZHk+XHRcdHt7I2xpc3QgYm9va3MgYXMgYm9va319XHRcdDx0cj5cdFx0XHQ8dGQ+PGEgaHJlZj1cXFwiIy9ib29rcy97e2Jvb2suaWR9fVxcXCI+e3tib29rLm5hbWV9fTwvYT48L3RkPlx0XHRcdDx0ZD57e2Jvb2suYXV0aG9yfX08L3RkPlx0XHRcdDx0ZD57e2Jvb2sucHVibGlzaGVyfX08L3RkPlx0XHQ8L3RyPlx0XHR7ey9saXN0fX1cdDwvdGJvZHk+PC90YWJsZT5cIiIsInZhciBSZWd1bGFyID0gcmVxdWlyZShcInJlZ3VsYXJqc1wiKTtcbnZhciBodG1sID0gcmVxdWlyZShcIi4vYm9va3MuaHRtbFwiKTtcblxudmFyIEJvb2tzVmlldyA9IFJlZ3VsYXIuZXh0ZW5kKHtcblx0bmFtZTogJ2Jvb2tzJyxcblx0dGVtcGxhdGU6IGh0bWxcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvb2tzVmlldzsiLCJcblxuLy9cbi8vIEdlbmVyYXRlZCBvbiBGcmkgRGVjIDI3IDIwMTMgMTI6MDI6MTEgR01ULTA1MDAgKEVTVCkgYnkgTm9kZWppdHN1LCBJbmMgKFVzaW5nIENvZGVzdXJnZW9uKS5cbi8vIFZlcnNpb24gMS4yLjJcbi8vXG5cbihmdW5jdGlvbiAoZXhwb3J0cykge1xuXG4vKlxuICogYnJvd3Nlci5qczogQnJvd3NlciBzcGVjaWZpYyBmdW5jdGlvbmFsaXR5IGZvciBkaXJlY3Rvci5cbiAqXG4gKiAoQykgMjAxMSwgTm9kZWppdHN1IEluYy5cbiAqIE1JVCBMSUNFTlNFXG4gKlxuICovXG5cbmlmICghQXJyYXkucHJvdG90eXBlLmZpbHRlcikge1xuICBBcnJheS5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24oZmlsdGVyLCB0aGF0KSB7XG4gICAgdmFyIG90aGVyID0gW10sIHY7XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0aGlzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgaWYgKGkgaW4gdGhpcyAmJiBmaWx0ZXIuY2FsbCh0aGF0LCB2ID0gdGhpc1tpXSwgaSwgdGhpcykpIHtcbiAgICAgICAgb3RoZXIucHVzaCh2KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG90aGVyO1xuICB9O1xufVxuXG5pZiAoIUFycmF5LmlzQXJyYXkpe1xuICBBcnJheS5pc0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xufVxuXG52YXIgZGxvYyA9IGRvY3VtZW50LmxvY2F0aW9uO1xuXG5mdW5jdGlvbiBkbG9jSGFzaEVtcHR5KCkge1xuICAvLyBOb24tSUUgYnJvd3NlcnMgcmV0dXJuICcnIHdoZW4gdGhlIGFkZHJlc3MgYmFyIHNob3dzICcjJzsgRGlyZWN0b3IncyBsb2dpY1xuICAvLyBhc3N1bWVzIGJvdGggbWVhbiBlbXB0eS5cbiAgcmV0dXJuIGRsb2MuaGFzaCA9PT0gJycgfHwgZGxvYy5oYXNoID09PSAnIyc7XG59XG5cbnZhciBsaXN0ZW5lciA9IHtcbiAgbW9kZTogJ21vZGVybicsXG4gIGhhc2g6IGRsb2MuaGFzaCxcbiAgaGlzdG9yeTogZmFsc2UsXG5cbiAgY2hlY2s6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaCA9IGRsb2MuaGFzaDtcbiAgICBpZiAoaCAhPSB0aGlzLmhhc2gpIHtcbiAgICAgIHRoaXMuaGFzaCA9IGg7XG4gICAgICB0aGlzLm9uSGFzaENoYW5nZWQoKTtcbiAgICB9XG4gIH0sXG5cbiAgZmlyZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09ICdtb2Rlcm4nKSB7XG4gICAgICB0aGlzLmhpc3RvcnkgPT09IHRydWUgPyB3aW5kb3cub25wb3BzdGF0ZSgpIDogd2luZG93Lm9uaGFzaGNoYW5nZSgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMub25IYXNoQ2hhbmdlZCgpO1xuICAgIH1cbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbiAoZm4sIGhpc3RvcnkpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5oaXN0b3J5ID0gaGlzdG9yeTtcblxuICAgIGlmICghUm91dGVyLmxpc3RlbmVycykge1xuICAgICAgUm91dGVyLmxpc3RlbmVycyA9IFtdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uY2hhbmdlKG9uQ2hhbmdlRXZlbnQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gUm91dGVyLmxpc3RlbmVycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgUm91dGVyLmxpc3RlbmVyc1tpXShvbkNoYW5nZUV2ZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL25vdGUgSUU4IGlzIGJlaW5nIGNvdW50ZWQgYXMgJ21vZGVybicgYmVjYXVzZSBpdCBoYXMgdGhlIGhhc2hjaGFuZ2UgZXZlbnRcbiAgICBpZiAoJ29uaGFzaGNoYW5nZScgaW4gd2luZG93ICYmIChkb2N1bWVudC5kb2N1bWVudE1vZGUgPT09IHVuZGVmaW5lZFxuICAgICAgfHwgZG9jdW1lbnQuZG9jdW1lbnRNb2RlID4gNykpIHtcbiAgICAgIC8vIEF0IGxlYXN0IGZvciBub3cgSFRNTDUgaGlzdG9yeSBpcyBhdmFpbGFibGUgZm9yICdtb2Rlcm4nIGJyb3dzZXJzIG9ubHlcbiAgICAgIGlmICh0aGlzLmhpc3RvcnkgPT09IHRydWUpIHtcbiAgICAgICAgLy8gVGhlcmUgaXMgYW4gb2xkIGJ1ZyBpbiBDaHJvbWUgdGhhdCBjYXVzZXMgb25wb3BzdGF0ZSB0byBmaXJlIGV2ZW5cbiAgICAgICAgLy8gdXBvbiBpbml0aWFsIHBhZ2UgbG9hZC4gU2luY2UgdGhlIGhhbmRsZXIgaXMgcnVuIG1hbnVhbGx5IGluIGluaXQoKSxcbiAgICAgICAgLy8gdGhpcyB3b3VsZCBjYXVzZSBDaHJvbWUgdG8gcnVuIGl0IHR3aXNlLiBDdXJyZW50bHkgdGhlIG9ubHlcbiAgICAgICAgLy8gd29ya2Fyb3VuZCBzZWVtcyB0byBiZSB0byBzZXQgdGhlIGhhbmRsZXIgYWZ0ZXIgdGhlIGluaXRpYWwgcGFnZSBsb2FkXG4gICAgICAgIC8vIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTYzMDQwXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgd2luZG93Lm9ucG9wc3RhdGUgPSBvbmNoYW5nZTtcbiAgICAgICAgfSwgNTAwKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB3aW5kb3cub25oYXNoY2hhbmdlID0gb25jaGFuZ2U7XG4gICAgICB9XG4gICAgICB0aGlzLm1vZGUgPSAnbW9kZXJuJztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvL1xuICAgICAgLy8gSUUgc3VwcG9ydCwgYmFzZWQgb24gYSBjb25jZXB0IGJ5IEVyaWsgQXJ2aWRzb24gLi4uXG4gICAgICAvL1xuICAgICAgdmFyIGZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICBmcmFtZS5pZCA9ICdzdGF0ZS1mcmFtZSc7XG4gICAgICBmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChmcmFtZSk7XG4gICAgICB0aGlzLndyaXRlRnJhbWUoJycpO1xuXG4gICAgICBpZiAoJ29ucHJvcGVydHljaGFuZ2UnIGluIGRvY3VtZW50ICYmICdhdHRhY2hFdmVudCcgaW4gZG9jdW1lbnQpIHtcbiAgICAgICAgZG9jdW1lbnQuYXR0YWNoRXZlbnQoJ29ucHJvcGVydHljaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKGV2ZW50LnByb3BlcnR5TmFtZSA9PT0gJ2xvY2F0aW9uJykge1xuICAgICAgICAgICAgc2VsZi5jaGVjaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7IHNlbGYuY2hlY2soKTsgfSwgNTApO1xuXG4gICAgICB0aGlzLm9uSGFzaENoYW5nZWQgPSBvbmNoYW5nZTtcbiAgICAgIHRoaXMubW9kZSA9ICdsZWdhY3knO1xuICAgIH1cblxuICAgIFJvdXRlci5saXN0ZW5lcnMucHVzaChmbik7XG5cbiAgICByZXR1cm4gdGhpcy5tb2RlO1xuICB9LFxuXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uIChmbikge1xuICAgIGlmICghUm91dGVyIHx8ICFSb3V0ZXIubGlzdGVuZXJzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGxpc3RlbmVycyA9IFJvdXRlci5saXN0ZW5lcnM7XG5cbiAgICBmb3IgKHZhciBpID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldID09PSBmbikge1xuICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBzZXRIYXNoOiBmdW5jdGlvbiAocykge1xuICAgIC8vIE1vemlsbGEgYWx3YXlzIGFkZHMgYW4gZW50cnkgdG8gdGhlIGhpc3RvcnlcbiAgICBpZiAodGhpcy5tb2RlID09PSAnbGVnYWN5Jykge1xuICAgICAgdGhpcy53cml0ZUZyYW1lKHMpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhpc3RvcnkgPT09IHRydWUpIHtcbiAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh7fSwgZG9jdW1lbnQudGl0bGUsIHMpO1xuICAgICAgLy8gRmlyZSBhbiBvbnBvcHN0YXRlIGV2ZW50IG1hbnVhbGx5IHNpbmNlIHB1c2hpbmcgZG9lcyBub3Qgb2J2aW91c2x5XG4gICAgICAvLyB0cmlnZ2VyIHRoZSBwb3AgZXZlbnQuXG4gICAgICB0aGlzLmZpcmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGxvYy5oYXNoID0gKHNbMF0gPT09ICcvJykgPyBzIDogJy8nICsgcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgd3JpdGVGcmFtZTogZnVuY3Rpb24gKHMpIHtcbiAgICAvLyBJRSBzdXBwb3J0Li4uXG4gICAgdmFyIGYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhdGUtZnJhbWUnKTtcbiAgICB2YXIgZCA9IGYuY29udGVudERvY3VtZW50IHx8IGYuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgICBkLm9wZW4oKTtcbiAgICBkLndyaXRlKFwiPHNjcmlwdD5faGFzaCA9ICdcIiArIHMgKyBcIic7IG9ubG9hZCA9IHBhcmVudC5saXN0ZW5lci5zeW5jSGFzaDs8c2NyaXB0PlwiKTtcbiAgICBkLmNsb3NlKCk7XG4gIH0sXG5cbiAgc3luY0hhc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBJRSBzdXBwb3J0Li4uXG4gICAgdmFyIHMgPSB0aGlzLl9oYXNoO1xuICAgIGlmIChzICE9IGRsb2MuaGFzaCkge1xuICAgICAgZGxvYy5oYXNoID0gcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgb25IYXNoQ2hhbmdlZDogZnVuY3Rpb24gKCkge31cbn07XG5cbnZhciBSb3V0ZXIgPSBleHBvcnRzLlJvdXRlciA9IGZ1bmN0aW9uIChyb3V0ZXMpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJvdXRlcikpIHJldHVybiBuZXcgUm91dGVyKHJvdXRlcyk7XG5cbiAgdGhpcy5wYXJhbXMgICA9IHt9O1xuICB0aGlzLnJvdXRlcyAgID0ge307XG4gIHRoaXMubWV0aG9kcyAgPSBbJ29uJywgJ29uY2UnLCAnYWZ0ZXInLCAnYmVmb3JlJ107XG4gIHRoaXMuc2NvcGUgICAgPSBbXTtcbiAgdGhpcy5fbWV0aG9kcyA9IHt9O1xuXG4gIHRoaXMuX2luc2VydCA9IHRoaXMuaW5zZXJ0O1xuICB0aGlzLmluc2VydCA9IHRoaXMuaW5zZXJ0RXg7XG5cbiAgdGhpcy5oaXN0b3J5U3VwcG9ydCA9ICh3aW5kb3cuaGlzdG9yeSAhPSBudWxsID8gd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIDogbnVsbCkgIT0gbnVsbFxuXG4gIHRoaXMuY29uZmlndXJlKCk7XG4gIHRoaXMubW91bnQocm91dGVzIHx8IHt9KTtcbn07XG5cblJvdXRlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChyKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5oYW5kbGVyID0gZnVuY3Rpb24ob25DaGFuZ2VFdmVudCkge1xuICAgIHZhciBuZXdVUkwgPSBvbkNoYW5nZUV2ZW50ICYmIG9uQ2hhbmdlRXZlbnQubmV3VVJMIHx8IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIHZhciB1cmwgPSBzZWxmLmhpc3RvcnkgPT09IHRydWUgPyBzZWxmLmdldFBhdGgoKSA6IG5ld1VSTC5yZXBsYWNlKC8uKiMvLCAnJyk7XG4gICAgc2VsZi5kaXNwYXRjaCgnb24nLCB1cmwuY2hhckF0KDApID09PSAnLycgPyB1cmwgOiAnLycgKyB1cmwpO1xuICB9O1xuXG4gIGxpc3RlbmVyLmluaXQodGhpcy5oYW5kbGVyLCB0aGlzLmhpc3RvcnkpO1xuXG4gIGlmICh0aGlzLmhpc3RvcnkgPT09IGZhbHNlKSB7XG4gICAgaWYgKGRsb2NIYXNoRW1wdHkoKSAmJiByKSB7XG4gICAgICBkbG9jLmhhc2ggPSByO1xuICAgIH0gZWxzZSBpZiAoIWRsb2NIYXNoRW1wdHkoKSkge1xuICAgICAgc2VsZi5kaXNwYXRjaCgnb24nLCAnLycgKyBkbG9jLmhhc2gucmVwbGFjZSgvXigjXFwvfCN8XFwvKS8sICcnKSk7XG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIHZhciByb3V0ZVRvID0gZGxvY0hhc2hFbXB0eSgpICYmIHIgPyByIDogIWRsb2NIYXNoRW1wdHkoKSA/IGRsb2MuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6IG51bGw7XG4gICAgaWYgKHJvdXRlVG8pIHtcbiAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgZG9jdW1lbnQudGl0bGUsIHJvdXRlVG8pO1xuICAgIH1cblxuICAgIC8vIFJvdXRlciBoYXMgYmVlbiBpbml0aWFsaXplZCwgYnV0IGR1ZSB0byB0aGUgY2hyb21lIGJ1ZyBpdCB3aWxsIG5vdFxuICAgIC8vIHlldCBhY3R1YWxseSByb3V0ZSBIVE1MNSBoaXN0b3J5IHN0YXRlIGNoYW5nZXMuIFRodXMsIGRlY2lkZSBpZiBzaG91bGQgcm91dGUuXG4gICAgaWYgKHJvdXRlVG8gfHwgdGhpcy5ydW5faW5faW5pdCA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5oYW5kbGVyKCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmV4cGxvZGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB2ID0gdGhpcy5oaXN0b3J5ID09PSB0cnVlID8gdGhpcy5nZXRQYXRoKCkgOiBkbG9jLmhhc2g7XG4gIGlmICh2LmNoYXJBdCgxKSA9PT0gJy8nKSB7IHY9di5zbGljZSgxKSB9XG4gIHJldHVybiB2LnNsaWNlKDEsIHYubGVuZ3RoKS5zcGxpdChcIi9cIik7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLnNldFJvdXRlID0gZnVuY3Rpb24gKGksIHYsIHZhbCkge1xuICB2YXIgdXJsID0gdGhpcy5leHBsb2RlKCk7XG5cbiAgaWYgKHR5cGVvZiBpID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICB1cmxbaV0gPSB2O1xuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdXJsLnNwbGljZShpLCB2LCBzKTtcbiAgfVxuICBlbHNlIHtcbiAgICB1cmwgPSBbaV07XG4gIH1cblxuICBsaXN0ZW5lci5zZXRIYXNoKHVybC5qb2luKCcvJykpO1xuICByZXR1cm4gdXJsO1xufTtcblxuLy9cbi8vICMjIyBmdW5jdGlvbiBpbnNlcnRFeChtZXRob2QsIHBhdGgsIHJvdXRlLCBwYXJlbnQpXG4vLyAjIyMjIEBtZXRob2Qge3N0cmluZ30gTWV0aG9kIHRvIGluc2VydCB0aGUgc3BlY2lmaWMgYHJvdXRlYC5cbi8vICMjIyMgQHBhdGgge0FycmF5fSBQYXJzZWQgcGF0aCB0byBpbnNlcnQgdGhlIGByb3V0ZWAgYXQuXG4vLyAjIyMjIEByb3V0ZSB7QXJyYXl8ZnVuY3Rpb259IFJvdXRlIGhhbmRsZXJzIHRvIGluc2VydC5cbi8vICMjIyMgQHBhcmVudCB7T2JqZWN0fSAqKk9wdGlvbmFsKiogUGFyZW50IFwicm91dGVzXCIgdG8gaW5zZXJ0IGludG8uXG4vLyBpbnNlcnQgYSBjYWxsYmFjayB0aGF0IHdpbGwgb25seSBvY2N1ciBvbmNlIHBlciB0aGUgbWF0Y2hlZCByb3V0ZS5cbi8vXG5Sb3V0ZXIucHJvdG90eXBlLmluc2VydEV4ID0gZnVuY3Rpb24obWV0aG9kLCBwYXRoLCByb3V0ZSwgcGFyZW50KSB7XG4gIGlmIChtZXRob2QgPT09IFwib25jZVwiKSB7XG4gICAgbWV0aG9kID0gXCJvblwiO1xuICAgIHJvdXRlID0gZnVuY3Rpb24ocm91dGUpIHtcbiAgICAgIHZhciBvbmNlID0gZmFsc2U7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChvbmNlKSByZXR1cm47XG4gICAgICAgIG9uY2UgPSB0cnVlO1xuICAgICAgICByZXR1cm4gcm91dGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfShyb3V0ZSk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuX2luc2VydChtZXRob2QsIHBhdGgsIHJvdXRlLCBwYXJlbnQpO1xufTtcblxuUm91dGVyLnByb3RvdHlwZS5nZXRSb3V0ZSA9IGZ1bmN0aW9uICh2KSB7XG4gIHZhciByZXQgPSB2O1xuXG4gIGlmICh0eXBlb2YgdiA9PT0gXCJudW1iZXJcIikge1xuICAgIHJldCA9IHRoaXMuZXhwbG9kZSgpW3ZdO1xuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiB2ID09PSBcInN0cmluZ1wiKXtcbiAgICB2YXIgaCA9IHRoaXMuZXhwbG9kZSgpO1xuICAgIHJldCA9IGguaW5kZXhPZih2KTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXQgPSB0aGlzLmV4cGxvZGUoKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gIGxpc3RlbmVyLmRlc3Ryb3kodGhpcy5oYW5kbGVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmdldFBhdGggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICBpZiAocGF0aC5zdWJzdHIoMCwgMSkgIT09ICcvJykge1xuICAgIHBhdGggPSAnLycgKyBwYXRoO1xuICB9XG4gIHJldHVybiBwYXRoO1xufTtcbmZ1bmN0aW9uIF9ldmVyeShhcnIsIGl0ZXJhdG9yKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKGl0ZXJhdG9yKGFycltpXSwgaSwgYXJyKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gX2ZsYXR0ZW4oYXJyKSB7XG4gIHZhciBmbGF0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBuID0gYXJyLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgIGZsYXQgPSBmbGF0LmNvbmNhdChhcnJbaV0pO1xuICB9XG4gIHJldHVybiBmbGF0O1xufVxuXG5mdW5jdGlvbiBfYXN5bmNFdmVyeVNlcmllcyhhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICBpZiAoIWFyci5sZW5ndGgpIHtcbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgfVxuICB2YXIgY29tcGxldGVkID0gMDtcbiAgKGZ1bmN0aW9uIGl0ZXJhdGUoKSB7XG4gICAgaXRlcmF0b3IoYXJyW2NvbXBsZXRlZF0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVyciB8fCBlcnIgPT09IGZhbHNlKSB7XG4gICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbXBsZXRlZCArPSAxO1xuICAgICAgICBpZiAoY29tcGxldGVkID09PSBhcnIubGVuZ3RoKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVyYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSkoKTtcbn1cblxuZnVuY3Rpb24gcGFyYW1pZnlTdHJpbmcoc3RyLCBwYXJhbXMsIG1vZCkge1xuICBtb2QgPSBzdHI7XG4gIGZvciAodmFyIHBhcmFtIGluIHBhcmFtcykge1xuICAgIGlmIChwYXJhbXMuaGFzT3duUHJvcGVydHkocGFyYW0pKSB7XG4gICAgICBtb2QgPSBwYXJhbXNbcGFyYW1dKHN0cik7XG4gICAgICBpZiAobW9kICE9PSBzdHIpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtb2QgPT09IHN0ciA/IFwiKFsuX2EtekEtWjAtOS1dKylcIiA6IG1vZDtcbn1cblxuZnVuY3Rpb24gcmVnaWZ5U3RyaW5nKHN0ciwgcGFyYW1zKSB7XG4gIHZhciBtYXRjaGVzLCBsYXN0ID0gMCwgb3V0ID0gXCJcIjtcbiAgd2hpbGUgKG1hdGNoZXMgPSBzdHIuc3Vic3RyKGxhc3QpLm1hdGNoKC9bXlxcd1xcZFxcLSAlQCZdKlxcKlteXFx3XFxkXFwtICVAJl0qLykpIHtcbiAgICBsYXN0ID0gbWF0Y2hlcy5pbmRleCArIG1hdGNoZXNbMF0ubGVuZ3RoO1xuICAgIG1hdGNoZXNbMF0gPSBtYXRjaGVzWzBdLnJlcGxhY2UoL15cXCovLCBcIihbXy4oKSFcXFxcICVAJmEtekEtWjAtOS1dKylcIik7XG4gICAgb3V0ICs9IHN0ci5zdWJzdHIoMCwgbWF0Y2hlcy5pbmRleCkgKyBtYXRjaGVzWzBdO1xuICB9XG4gIHN0ciA9IG91dCArPSBzdHIuc3Vic3RyKGxhc3QpO1xuICB2YXIgY2FwdHVyZXMgPSBzdHIubWF0Y2goLzooW15cXC9dKykvaWcpLCBjYXB0dXJlLCBsZW5ndGg7XG4gIGlmIChjYXB0dXJlcykge1xuICAgIGxlbmd0aCA9IGNhcHR1cmVzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBjYXB0dXJlID0gY2FwdHVyZXNbaV07XG4gICAgICBpZiAoY2FwdHVyZS5zbGljZSgwLCAyKSA9PT0gXCI6OlwiKSB7XG4gICAgICAgIHN0ciA9IGNhcHR1cmUuc2xpY2UoMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShjYXB0dXJlLCBwYXJhbWlmeVN0cmluZyhjYXB0dXJlLCBwYXJhbXMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn1cblxuZnVuY3Rpb24gdGVybWluYXRvcihyb3V0ZXMsIGRlbGltaXRlciwgc3RhcnQsIHN0b3ApIHtcbiAgdmFyIGxhc3QgPSAwLCBsZWZ0ID0gMCwgcmlnaHQgPSAwLCBzdGFydCA9IChzdGFydCB8fCBcIihcIikudG9TdHJpbmcoKSwgc3RvcCA9IChzdG9wIHx8IFwiKVwiKS50b1N0cmluZygpLCBpO1xuICBmb3IgKGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNodW5rID0gcm91dGVzW2ldO1xuICAgIGlmIChjaHVuay5pbmRleE9mKHN0YXJ0LCBsYXN0KSA+IGNodW5rLmluZGV4T2Yoc3RvcCwgbGFzdCkgfHwgfmNodW5rLmluZGV4T2Yoc3RhcnQsIGxhc3QpICYmICF+Y2h1bmsuaW5kZXhPZihzdG9wLCBsYXN0KSB8fCAhfmNodW5rLmluZGV4T2Yoc3RhcnQsIGxhc3QpICYmIH5jaHVuay5pbmRleE9mKHN0b3AsIGxhc3QpKSB7XG4gICAgICBsZWZ0ID0gY2h1bmsuaW5kZXhPZihzdGFydCwgbGFzdCk7XG4gICAgICByaWdodCA9IGNodW5rLmluZGV4T2Yoc3RvcCwgbGFzdCk7XG4gICAgICBpZiAofmxlZnQgJiYgIX5yaWdodCB8fCAhfmxlZnQgJiYgfnJpZ2h0KSB7XG4gICAgICAgIHZhciB0bXAgPSByb3V0ZXMuc2xpY2UoMCwgKGkgfHwgMSkgKyAxKS5qb2luKGRlbGltaXRlcik7XG4gICAgICAgIHJvdXRlcyA9IFsgdG1wIF0uY29uY2F0KHJvdXRlcy5zbGljZSgoaSB8fCAxKSArIDEpKTtcbiAgICAgIH1cbiAgICAgIGxhc3QgPSAocmlnaHQgPiBsZWZ0ID8gcmlnaHQgOiBsZWZ0KSArIDE7XG4gICAgICBpID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFzdCA9IDA7XG4gICAgfVxuICB9XG4gIHJldHVybiByb3V0ZXM7XG59XG5cblJvdXRlci5wcm90b3R5cGUuY29uZmlndXJlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1ldGhvZHMubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLl9tZXRob2RzW3RoaXMubWV0aG9kc1tpXV0gPSB0cnVlO1xuICB9XG4gIHRoaXMucmVjdXJzZSA9IG9wdGlvbnMucmVjdXJzZSB8fCB0aGlzLnJlY3Vyc2UgfHwgZmFsc2U7XG4gIHRoaXMuYXN5bmMgPSBvcHRpb25zLmFzeW5jIHx8IGZhbHNlO1xuICB0aGlzLmRlbGltaXRlciA9IG9wdGlvbnMuZGVsaW1pdGVyIHx8IFwiL1wiO1xuICB0aGlzLnN0cmljdCA9IHR5cGVvZiBvcHRpb25zLnN0cmljdCA9PT0gXCJ1bmRlZmluZWRcIiA/IHRydWUgOiBvcHRpb25zLnN0cmljdDtcbiAgdGhpcy5ub3Rmb3VuZCA9IG9wdGlvbnMubm90Zm91bmQ7XG4gIHRoaXMucmVzb3VyY2UgPSBvcHRpb25zLnJlc291cmNlO1xuICB0aGlzLmhpc3RvcnkgPSBvcHRpb25zLmh0bWw1aGlzdG9yeSAmJiB0aGlzLmhpc3RvcnlTdXBwb3J0IHx8IGZhbHNlO1xuICB0aGlzLnJ1bl9pbl9pbml0ID0gdGhpcy5oaXN0b3J5ID09PSB0cnVlICYmIG9wdGlvbnMucnVuX2hhbmRsZXJfaW5faW5pdCAhPT0gZmFsc2U7XG4gIHRoaXMuZXZlcnkgPSB7XG4gICAgYWZ0ZXI6IG9wdGlvbnMuYWZ0ZXIgfHwgbnVsbCxcbiAgICBiZWZvcmU6IG9wdGlvbnMuYmVmb3JlIHx8IG51bGwsXG4gICAgb246IG9wdGlvbnMub24gfHwgbnVsbFxuICB9O1xuICByZXR1cm4gdGhpcztcbn07XG5cblJvdXRlci5wcm90b3R5cGUucGFyYW0gPSBmdW5jdGlvbih0b2tlbiwgbWF0Y2hlcikge1xuICBpZiAodG9rZW5bMF0gIT09IFwiOlwiKSB7XG4gICAgdG9rZW4gPSBcIjpcIiArIHRva2VuO1xuICB9XG4gIHZhciBjb21waWxlZCA9IG5ldyBSZWdFeHAodG9rZW4sIFwiZ1wiKTtcbiAgdGhpcy5wYXJhbXNbdG9rZW5dID0gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKGNvbXBpbGVkLCBtYXRjaGVyLnNvdXJjZSB8fCBtYXRjaGVyKTtcbiAgfTtcbn07XG5cblJvdXRlci5wcm90b3R5cGUub24gPSBSb3V0ZXIucHJvdG90eXBlLnJvdXRlID0gZnVuY3Rpb24obWV0aG9kLCBwYXRoLCByb3V0ZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmICghcm91dGUgJiYgdHlwZW9mIHBhdGggPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcm91dGUgPSBwYXRoO1xuICAgIHBhdGggPSBtZXRob2Q7XG4gICAgbWV0aG9kID0gXCJvblwiO1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHBhdGgpKSB7XG4gICAgcmV0dXJuIHBhdGguZm9yRWFjaChmdW5jdGlvbihwKSB7XG4gICAgICBzZWxmLm9uKG1ldGhvZCwgcCwgcm91dGUpO1xuICAgIH0pO1xuICB9XG4gIGlmIChwYXRoLnNvdXJjZSkge1xuICAgIHBhdGggPSBwYXRoLnNvdXJjZS5yZXBsYWNlKC9cXFxcXFwvL2lnLCBcIi9cIik7XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkobWV0aG9kKSkge1xuICAgIHJldHVybiBtZXRob2QuZm9yRWFjaChmdW5jdGlvbihtKSB7XG4gICAgICBzZWxmLm9uKG0udG9Mb3dlckNhc2UoKSwgcGF0aCwgcm91dGUpO1xuICAgIH0pO1xuICB9XG4gIHBhdGggPSBwYXRoLnNwbGl0KG5ldyBSZWdFeHAodGhpcy5kZWxpbWl0ZXIpKTtcbiAgcGF0aCA9IHRlcm1pbmF0b3IocGF0aCwgdGhpcy5kZWxpbWl0ZXIpO1xuICB0aGlzLmluc2VydChtZXRob2QsIHRoaXMuc2NvcGUuY29uY2F0KHBhdGgpLCByb3V0ZSk7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmRpc3BhdGNoID0gZnVuY3Rpb24obWV0aG9kLCBwYXRoLCBjYWxsYmFjaykge1xuICB2YXIgc2VsZiA9IHRoaXMsIGZucyA9IHRoaXMudHJhdmVyc2UobWV0aG9kLCBwYXRoLCB0aGlzLnJvdXRlcywgXCJcIiksIGludm9rZWQgPSB0aGlzLl9pbnZva2VkLCBhZnRlcjtcbiAgdGhpcy5faW52b2tlZCA9IHRydWU7XG4gIGlmICghZm5zIHx8IGZucy5sZW5ndGggPT09IDApIHtcbiAgICB0aGlzLmxhc3QgPSBbXTtcbiAgICBpZiAodHlwZW9mIHRoaXMubm90Zm91bmQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhpcy5pbnZva2UoWyB0aGlzLm5vdGZvdW5kIF0sIHtcbiAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgIHBhdGg6IHBhdGhcbiAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0aGlzLnJlY3Vyc2UgPT09IFwiZm9yd2FyZFwiKSB7XG4gICAgZm5zID0gZm5zLnJldmVyc2UoKTtcbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVBbmRJbnZva2UoKSB7XG4gICAgc2VsZi5sYXN0ID0gZm5zLmFmdGVyO1xuICAgIHNlbGYuaW52b2tlKHNlbGYucnVubGlzdChmbnMpLCBzZWxmLCBjYWxsYmFjayk7XG4gIH1cbiAgYWZ0ZXIgPSB0aGlzLmV2ZXJ5ICYmIHRoaXMuZXZlcnkuYWZ0ZXIgPyBbIHRoaXMuZXZlcnkuYWZ0ZXIgXS5jb25jYXQodGhpcy5sYXN0KSA6IFsgdGhpcy5sYXN0IF07XG4gIGlmIChhZnRlciAmJiBhZnRlci5sZW5ndGggPiAwICYmIGludm9rZWQpIHtcbiAgICBpZiAodGhpcy5hc3luYykge1xuICAgICAgdGhpcy5pbnZva2UoYWZ0ZXIsIHRoaXMsIHVwZGF0ZUFuZEludm9rZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW52b2tlKGFmdGVyLCB0aGlzKTtcbiAgICAgIHVwZGF0ZUFuZEludm9rZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB1cGRhdGVBbmRJbnZva2UoKTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLmludm9rZSA9IGZ1bmN0aW9uKGZucywgdGhpc0FyZywgY2FsbGJhY2spIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgYXBwbHk7XG4gIGlmICh0aGlzLmFzeW5jKSB7XG4gICAgYXBwbHkgPSBmdW5jdGlvbihmbiwgbmV4dCkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZm4pKSB7XG4gICAgICAgIHJldHVybiBfYXN5bmNFdmVyeVNlcmllcyhmbiwgYXBwbHksIG5leHQpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZm4gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGZuLmFwcGx5KHRoaXNBcmcsIGZucy5jYXB0dXJlcy5jb25jYXQobmV4dCkpO1xuICAgICAgfVxuICAgIH07XG4gICAgX2FzeW5jRXZlcnlTZXJpZXMoZm5zLCBhcHBseSwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpc0FyZywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBhcHBseSA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShmbikpIHtcbiAgICAgICAgcmV0dXJuIF9ldmVyeShmbiwgYXBwbHkpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZm4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgZm5zLmNhcHR1cmVzIHx8IFtdKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGZuID09PSBcInN0cmluZ1wiICYmIHNlbGYucmVzb3VyY2UpIHtcbiAgICAgICAgc2VsZi5yZXNvdXJjZVtmbl0uYXBwbHkodGhpc0FyZywgZm5zLmNhcHR1cmVzIHx8IFtdKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIF9ldmVyeShmbnMsIGFwcGx5KTtcbiAgfVxufTtcblxuUm91dGVyLnByb3RvdHlwZS50cmF2ZXJzZSA9IGZ1bmN0aW9uKG1ldGhvZCwgcGF0aCwgcm91dGVzLCByZWdleHAsIGZpbHRlcikge1xuICB2YXIgZm5zID0gW10sIGN1cnJlbnQsIGV4YWN0LCBtYXRjaCwgbmV4dCwgdGhhdDtcbiAgZnVuY3Rpb24gZmlsdGVyUm91dGVzKHJvdXRlcykge1xuICAgIGlmICghZmlsdGVyKSB7XG4gICAgICByZXR1cm4gcm91dGVzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWVwQ29weShzb3VyY2UpIHtcbiAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdFtpXSA9IEFycmF5LmlzQXJyYXkoc291cmNlW2ldKSA/IGRlZXBDb3B5KHNvdXJjZVtpXSkgOiBzb3VyY2VbaV07XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBhcHBseUZpbHRlcihmbnMpIHtcbiAgICAgIGZvciAodmFyIGkgPSBmbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZm5zW2ldKSkge1xuICAgICAgICAgIGFwcGx5RmlsdGVyKGZuc1tpXSk7XG4gICAgICAgICAgaWYgKGZuc1tpXS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGZucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghZmlsdGVyKGZuc1tpXSkpIHtcbiAgICAgICAgICAgIGZucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBuZXdSb3V0ZXMgPSBkZWVwQ29weShyb3V0ZXMpO1xuICAgIG5ld1JvdXRlcy5tYXRjaGVkID0gcm91dGVzLm1hdGNoZWQ7XG4gICAgbmV3Um91dGVzLmNhcHR1cmVzID0gcm91dGVzLmNhcHR1cmVzO1xuICAgIG5ld1JvdXRlcy5hZnRlciA9IHJvdXRlcy5hZnRlci5maWx0ZXIoZmlsdGVyKTtcbiAgICBhcHBseUZpbHRlcihuZXdSb3V0ZXMpO1xuICAgIHJldHVybiBuZXdSb3V0ZXM7XG4gIH1cbiAgaWYgKHBhdGggPT09IHRoaXMuZGVsaW1pdGVyICYmIHJvdXRlc1ttZXRob2RdKSB7XG4gICAgbmV4dCA9IFsgWyByb3V0ZXMuYmVmb3JlLCByb3V0ZXNbbWV0aG9kXSBdLmZpbHRlcihCb29sZWFuKSBdO1xuICAgIG5leHQuYWZ0ZXIgPSBbIHJvdXRlcy5hZnRlciBdLmZpbHRlcihCb29sZWFuKTtcbiAgICBuZXh0Lm1hdGNoZWQgPSB0cnVlO1xuICAgIG5leHQuY2FwdHVyZXMgPSBbXTtcbiAgICByZXR1cm4gZmlsdGVyUm91dGVzKG5leHQpO1xuICB9XG4gIGZvciAodmFyIHIgaW4gcm91dGVzKSB7XG4gICAgaWYgKHJvdXRlcy5oYXNPd25Qcm9wZXJ0eShyKSAmJiAoIXRoaXMuX21ldGhvZHNbcl0gfHwgdGhpcy5fbWV0aG9kc1tyXSAmJiB0eXBlb2Ygcm91dGVzW3JdID09PSBcIm9iamVjdFwiICYmICFBcnJheS5pc0FycmF5KHJvdXRlc1tyXSkpKSB7XG4gICAgICBjdXJyZW50ID0gZXhhY3QgPSByZWdleHAgKyB0aGlzLmRlbGltaXRlciArIHI7XG4gICAgICBpZiAoIXRoaXMuc3RyaWN0KSB7XG4gICAgICAgIGV4YWN0ICs9IFwiW1wiICsgdGhpcy5kZWxpbWl0ZXIgKyBcIl0/XCI7XG4gICAgICB9XG4gICAgICBtYXRjaCA9IHBhdGgubWF0Y2gobmV3IFJlZ0V4cChcIl5cIiArIGV4YWN0KSk7XG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKG1hdGNoWzBdICYmIG1hdGNoWzBdID09IHBhdGggJiYgcm91dGVzW3JdW21ldGhvZF0pIHtcbiAgICAgICAgbmV4dCA9IFsgWyByb3V0ZXNbcl0uYmVmb3JlLCByb3V0ZXNbcl1bbWV0aG9kXSBdLmZpbHRlcihCb29sZWFuKSBdO1xuICAgICAgICBuZXh0LmFmdGVyID0gWyByb3V0ZXNbcl0uYWZ0ZXIgXS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgIG5leHQubWF0Y2hlZCA9IHRydWU7XG4gICAgICAgIG5leHQuY2FwdHVyZXMgPSBtYXRjaC5zbGljZSgxKTtcbiAgICAgICAgaWYgKHRoaXMucmVjdXJzZSAmJiByb3V0ZXMgPT09IHRoaXMucm91dGVzKSB7XG4gICAgICAgICAgbmV4dC5wdXNoKFsgcm91dGVzLmJlZm9yZSwgcm91dGVzLm9uIF0uZmlsdGVyKEJvb2xlYW4pKTtcbiAgICAgICAgICBuZXh0LmFmdGVyID0gbmV4dC5hZnRlci5jb25jYXQoWyByb3V0ZXMuYWZ0ZXIgXS5maWx0ZXIoQm9vbGVhbikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWx0ZXJSb3V0ZXMobmV4dCk7XG4gICAgICB9XG4gICAgICBuZXh0ID0gdGhpcy50cmF2ZXJzZShtZXRob2QsIHBhdGgsIHJvdXRlc1tyXSwgY3VycmVudCk7XG4gICAgICBpZiAobmV4dC5tYXRjaGVkKSB7XG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBmbnMgPSBmbnMuY29uY2F0KG5leHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJlY3Vyc2UpIHtcbiAgICAgICAgICBmbnMucHVzaChbIHJvdXRlc1tyXS5iZWZvcmUsIHJvdXRlc1tyXS5vbiBdLmZpbHRlcihCb29sZWFuKSk7XG4gICAgICAgICAgbmV4dC5hZnRlciA9IG5leHQuYWZ0ZXIuY29uY2F0KFsgcm91dGVzW3JdLmFmdGVyIF0uZmlsdGVyKEJvb2xlYW4pKTtcbiAgICAgICAgICBpZiAocm91dGVzID09PSB0aGlzLnJvdXRlcykge1xuICAgICAgICAgICAgZm5zLnB1c2goWyByb3V0ZXNbXCJiZWZvcmVcIl0sIHJvdXRlc1tcIm9uXCJdIF0uZmlsdGVyKEJvb2xlYW4pKTtcbiAgICAgICAgICAgIG5leHQuYWZ0ZXIgPSBuZXh0LmFmdGVyLmNvbmNhdChbIHJvdXRlc1tcImFmdGVyXCJdIF0uZmlsdGVyKEJvb2xlYW4pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm5zLm1hdGNoZWQgPSB0cnVlO1xuICAgICAgICBmbnMuY2FwdHVyZXMgPSBuZXh0LmNhcHR1cmVzO1xuICAgICAgICBmbnMuYWZ0ZXIgPSBuZXh0LmFmdGVyO1xuICAgICAgICByZXR1cm4gZmlsdGVyUm91dGVzKGZucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cblJvdXRlci5wcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24obWV0aG9kLCBwYXRoLCByb3V0ZSwgcGFyZW50KSB7XG4gIHZhciBtZXRob2RUeXBlLCBwYXJlbnRUeXBlLCBpc0FycmF5LCBuZXN0ZWQsIHBhcnQ7XG4gIHBhdGggPSBwYXRoLmZpbHRlcihmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIHAgJiYgcC5sZW5ndGggPiAwO1xuICB9KTtcbiAgcGFyZW50ID0gcGFyZW50IHx8IHRoaXMucm91dGVzO1xuICBwYXJ0ID0gcGF0aC5zaGlmdCgpO1xuICBpZiAoL1xcOnxcXCovLnRlc3QocGFydCkgJiYgIS9cXFxcZHxcXFxcdy8udGVzdChwYXJ0KSkge1xuICAgIHBhcnQgPSByZWdpZnlTdHJpbmcocGFydCwgdGhpcy5wYXJhbXMpO1xuICB9XG4gIGlmIChwYXRoLmxlbmd0aCA+IDApIHtcbiAgICBwYXJlbnRbcGFydF0gPSBwYXJlbnRbcGFydF0gfHwge307XG4gICAgcmV0dXJuIHRoaXMuaW5zZXJ0KG1ldGhvZCwgcGF0aCwgcm91dGUsIHBhcmVudFtwYXJ0XSk7XG4gIH1cbiAgaWYgKCFwYXJ0ICYmICFwYXRoLmxlbmd0aCAmJiBwYXJlbnQgPT09IHRoaXMucm91dGVzKSB7XG4gICAgbWV0aG9kVHlwZSA9IHR5cGVvZiBwYXJlbnRbbWV0aG9kXTtcbiAgICBzd2l0Y2ggKG1ldGhvZFR5cGUpIHtcbiAgICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICBwYXJlbnRbbWV0aG9kXSA9IFsgcGFyZW50W21ldGhvZF0sIHJvdXRlIF07XG4gICAgICByZXR1cm47XG4gICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgIHBhcmVudFttZXRob2RdLnB1c2gocm91dGUpO1xuICAgICAgcmV0dXJuO1xuICAgICBjYXNlIFwidW5kZWZpbmVkXCI6XG4gICAgICBwYXJlbnRbbWV0aG9kXSA9IHJvdXRlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgcGFyZW50VHlwZSA9IHR5cGVvZiBwYXJlbnRbcGFydF07XG4gIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KHBhcmVudFtwYXJ0XSk7XG4gIGlmIChwYXJlbnRbcGFydF0gJiYgIWlzQXJyYXkgJiYgcGFyZW50VHlwZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgbWV0aG9kVHlwZSA9IHR5cGVvZiBwYXJlbnRbcGFydF1bbWV0aG9kXTtcbiAgICBzd2l0Y2ggKG1ldGhvZFR5cGUpIHtcbiAgICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICBwYXJlbnRbcGFydF1bbWV0aG9kXSA9IFsgcGFyZW50W3BhcnRdW21ldGhvZF0sIHJvdXRlIF07XG4gICAgICByZXR1cm47XG4gICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgIHBhcmVudFtwYXJ0XVttZXRob2RdLnB1c2gocm91dGUpO1xuICAgICAgcmV0dXJuO1xuICAgICBjYXNlIFwidW5kZWZpbmVkXCI6XG4gICAgICBwYXJlbnRbcGFydF1bbWV0aG9kXSA9IHJvdXRlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfSBlbHNlIGlmIChwYXJlbnRUeXBlID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBuZXN0ZWQgPSB7fTtcbiAgICBuZXN0ZWRbbWV0aG9kXSA9IHJvdXRlO1xuICAgIHBhcmVudFtwYXJ0XSA9IG5lc3RlZDtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByb3V0ZSBjb250ZXh0OiBcIiArIHBhcmVudFR5cGUpO1xufTtcblxuXG5cblJvdXRlci5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24obWV0aG9kcykge1xuICB2YXIgc2VsZiA9IHRoaXMsIGxlbiA9IG1ldGhvZHMubGVuZ3RoLCBpO1xuICBmdW5jdGlvbiBleHRlbmQobWV0aG9kKSB7XG4gICAgc2VsZi5fbWV0aG9kc1ttZXRob2RdID0gdHJ1ZTtcbiAgICBzZWxmW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBleHRyYSA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBbIG1ldGhvZCwgXCJcIiBdIDogWyBtZXRob2QgXTtcbiAgICAgIHNlbGYub24uYXBwbHkoc2VsZiwgZXh0cmEuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICB9O1xuICB9XG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGV4dGVuZChtZXRob2RzW2ldKTtcbiAgfVxufTtcblxuUm91dGVyLnByb3RvdHlwZS5ydW5saXN0ID0gZnVuY3Rpb24oZm5zKSB7XG4gIHZhciBydW5saXN0ID0gdGhpcy5ldmVyeSAmJiB0aGlzLmV2ZXJ5LmJlZm9yZSA/IFsgdGhpcy5ldmVyeS5iZWZvcmUgXS5jb25jYXQoX2ZsYXR0ZW4oZm5zKSkgOiBfZmxhdHRlbihmbnMpO1xuICBpZiAodGhpcy5ldmVyeSAmJiB0aGlzLmV2ZXJ5Lm9uKSB7XG4gICAgcnVubGlzdC5wdXNoKHRoaXMuZXZlcnkub24pO1xuICB9XG4gIHJ1bmxpc3QuY2FwdHVyZXMgPSBmbnMuY2FwdHVyZXM7XG4gIHJ1bmxpc3Quc291cmNlID0gZm5zLnNvdXJjZTtcbiAgcmV0dXJuIHJ1bmxpc3Q7XG59O1xuXG5Sb3V0ZXIucHJvdG90eXBlLm1vdW50ID0gZnVuY3Rpb24ocm91dGVzLCBwYXRoKSB7XG4gIGlmICghcm91dGVzIHx8IHR5cGVvZiByb3V0ZXMgIT09IFwib2JqZWN0XCIgfHwgQXJyYXkuaXNBcnJheShyb3V0ZXMpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBzZWxmID0gdGhpcztcbiAgcGF0aCA9IHBhdGggfHwgW107XG4gIGlmICghQXJyYXkuaXNBcnJheShwYXRoKSkge1xuICAgIHBhdGggPSBwYXRoLnNwbGl0KHNlbGYuZGVsaW1pdGVyKTtcbiAgfVxuICBmdW5jdGlvbiBpbnNlcnRPck1vdW50KHJvdXRlLCBsb2NhbCkge1xuICAgIHZhciByZW5hbWUgPSByb3V0ZSwgcGFydHMgPSByb3V0ZS5zcGxpdChzZWxmLmRlbGltaXRlciksIHJvdXRlVHlwZSA9IHR5cGVvZiByb3V0ZXNbcm91dGVdLCBpc1JvdXRlID0gcGFydHNbMF0gPT09IFwiXCIgfHwgIXNlbGYuX21ldGhvZHNbcGFydHNbMF1dLCBldmVudCA9IGlzUm91dGUgPyBcIm9uXCIgOiByZW5hbWU7XG4gICAgaWYgKGlzUm91dGUpIHtcbiAgICAgIHJlbmFtZSA9IHJlbmFtZS5zbGljZSgocmVuYW1lLm1hdGNoKG5ldyBSZWdFeHAoXCJeXCIgKyBzZWxmLmRlbGltaXRlcikpIHx8IFsgXCJcIiBdKVswXS5sZW5ndGgpO1xuICAgICAgcGFydHMuc2hpZnQoKTtcbiAgICB9XG4gICAgaWYgKGlzUm91dGUgJiYgcm91dGVUeXBlID09PSBcIm9iamVjdFwiICYmICFBcnJheS5pc0FycmF5KHJvdXRlc1tyb3V0ZV0pKSB7XG4gICAgICBsb2NhbCA9IGxvY2FsLmNvbmNhdChwYXJ0cyk7XG4gICAgICBzZWxmLm1vdW50KHJvdXRlc1tyb3V0ZV0sIGxvY2FsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGlzUm91dGUpIHtcbiAgICAgIGxvY2FsID0gbG9jYWwuY29uY2F0KHJlbmFtZS5zcGxpdChzZWxmLmRlbGltaXRlcikpO1xuICAgICAgbG9jYWwgPSB0ZXJtaW5hdG9yKGxvY2FsLCBzZWxmLmRlbGltaXRlcik7XG4gICAgfVxuICAgIHNlbGYuaW5zZXJ0KGV2ZW50LCBsb2NhbCwgcm91dGVzW3JvdXRlXSk7XG4gIH1cbiAgZm9yICh2YXIgcm91dGUgaW4gcm91dGVzKSB7XG4gICAgaWYgKHJvdXRlcy5oYXNPd25Qcm9wZXJ0eShyb3V0ZSkpIHtcbiAgICAgIGluc2VydE9yTW91bnQocm91dGUsIHBhdGguc2xpY2UoMCkpO1xuICAgIH1cbiAgfVxufTtcblxuXG5cbn0odHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgPyBleHBvcnRzIDogd2luZG93KSk7IiwiXG52YXIgTGV4ZXIgPSByZXF1aXJlKFwiLi9wYXJzZXIvTGV4ZXIuanNcIik7XG52YXIgUGFyc2VyID0gcmVxdWlyZShcIi4vcGFyc2VyL1BhcnNlci5qc1wiKTtcbnZhciBkb20gPSByZXF1aXJlKFwiLi9kb20uanNcIik7XG52YXIgY29uZmlnID0gcmVxdWlyZShcIi4vY29uZmlnLmpzXCIpO1xudmFyIEdyb3VwID0gcmVxdWlyZSgnLi9ncm91cC5qcycpO1xudmFyIF8gPSByZXF1aXJlKCcuL3V0aWwnKTtcbnZhciBleHRlbmQgPSByZXF1aXJlKCcuL2hlbHBlci9leHRlbmQuanMnKTtcbnZhciBFdmVudCA9IHJlcXVpcmUoJy4vaGVscGVyL2V2ZW50LmpzJyk7XG52YXIgY29tYmluZSA9IHJlcXVpcmUoJy4vaGVscGVyL2NvbWJpbmUuanMnKTtcbnZhciBXYXRjaGVyID0gcmVxdWlyZSgnLi9oZWxwZXIvd2F0Y2hlci5qcycpO1xudmFyIHBhcnNlID0gcmVxdWlyZSgnLi9oZWxwZXIvcGFyc2UuanMnKTtcbnZhciBkb2MgPSB0eXBlb2YgZG9jdW1lbnQ9PT0ndW5kZWZpbmVkJz8ge30gOiBkb2N1bWVudDtcbnZhciBlbnYgPSByZXF1aXJlKCcuL2Vudi5qcycpO1xuXG5cbi8qKlxuKiBgUmVndWxhcmAgaXMgcmVndWxhcmpzJ3MgTmFtZVNwYWNlIGFuZCBCYXNlQ2xhc3MuIEV2ZXJ5IENvbXBvbmVudCBpcyBpbmhlcml0ZWQgZnJvbSBpdFxuKiBcbiogQGNsYXNzIFJlZ3VsYXJcbiogQG1vZHVsZSBSZWd1bGFyXG4qIEBjb25zdHJ1Y3RvclxuKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBzcGVjaWZpY2F0aW9uIG9mIHRoZSBjb21wb25lbnRcbiovXG52YXIgUmVndWxhciA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICB2YXIgcHJldlJ1bm5pbmcgPSBlbnYuaXNSdW5uaW5nO1xuICBlbnYuaXNSdW5uaW5nID0gdHJ1ZTtcbiAgdmFyIG5vZGUsIHRlbXBsYXRlO1xuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBvcHRpb25zLmRhdGEgPSBvcHRpb25zLmRhdGEgfHwge307XG4gIG9wdGlvbnMuY29tcHV0ZWQgPSBvcHRpb25zLmNvbXB1dGVkIHx8IHt9O1xuICBpZih0aGlzLmRhdGEpIF8uZXh0ZW5kKG9wdGlvbnMuZGF0YSwgdGhpcy5kYXRhKTtcbiAgaWYodGhpcy5jb21wdXRlZCkgXy5leHRlbmQob3B0aW9ucy5jb21wdXRlZCwgdGhpcy5jb21wdXRlZCk7XG4gIF8uZXh0ZW5kKHRoaXMsIG9wdGlvbnMsIHRydWUpO1xuICBpZih0aGlzLiRwYXJlbnQpe1xuICAgICB0aGlzLiRwYXJlbnQuX2FwcGVuZCh0aGlzKTtcbiAgfVxuICB0aGlzLl9jaGlsZHJlbiA9IFtdO1xuICB0aGlzLiRyZWZzID0ge307XG5cbiAgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuXG4gIC8vIHRlbXBsYXRlIGlzIGEgc3RyaW5nIChsZW4gPCA0MCkuIHdlIHdpbGwgZmluZCBpdCBjb250YWluZXIgZmlyc3RcbiAgaWYoKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gJ3N0cmluZycgJiYgdGVtcGxhdGUubGVuZ3RoIDwgNDApICYmIChub2RlID0gZG9tLmZpbmQodGVtcGxhdGUpKSkge1xuICAgIHRlbXBsYXRlID0gbm9kZS5pbm5lckhUTUw7XG4gIH1cbiAgLy8gaWYgdGVtcGxhdGUgaXMgYSB4bWxcbiAgaWYodGVtcGxhdGUgJiYgdGVtcGxhdGUubm9kZVR5cGUpIHRlbXBsYXRlID0gdGVtcGxhdGUuaW5uZXJIVE1MO1xuICBpZih0eXBlb2YgdGVtcGxhdGUgPT09ICdzdHJpbmcnKSB0aGlzLnRlbXBsYXRlID0gbmV3IFBhcnNlcih0ZW1wbGF0ZSkucGFyc2UoKTtcblxuICB0aGlzLmNvbXB1dGVkID0gaGFuZGxlQ29tcHV0ZWQodGhpcy5jb21wdXRlZCk7XG4gIHRoaXMuJGNvbnRleHQgPSB0aGlzLiRjb250ZXh0IHx8IHRoaXM7XG4gIHRoaXMuJHJvb3QgPSB0aGlzLiRyb290IHx8IHRoaXM7XG4gIC8vIGlmIGhhdmUgZXZlbnRzXG4gIGlmKHRoaXMuZXZlbnRzKXtcbiAgICB0aGlzLiRvbih0aGlzLmV2ZW50cyk7XG4gICAgdGhpcy5ldmVudHMgPSBudWxsO1xuICB9XG5cbiAgdGhpcy5jb25maWcgJiYgdGhpcy5jb25maWcodGhpcy5kYXRhKTtcbiAgLy8gaGFuZGxlIGNvbXB1dGVkXG4gIGlmKHRlbXBsYXRlKXtcbiAgICB0aGlzLmdyb3VwID0gdGhpcy4kY29tcGlsZSh0aGlzLnRlbXBsYXRlLCB7bmFtZXNwYWNlOiBvcHRpb25zLm5hbWVzcGFjZX0pO1xuICAgIGNvbWJpbmUubm9kZSh0aGlzKTtcbiAgfVxuXG5cbiAgaWYodGhpcy4kcm9vdCA9PT0gdGhpcykgdGhpcy4kdXBkYXRlKCk7XG4gIHRoaXMuJHJlYWR5ID0gdHJ1ZTtcbiAgaWYodGhpcy4kY29udGV4dCA9PT0gdGhpcykgdGhpcy4kZW1pdChcIiRpbml0XCIpO1xuICBpZiggdGhpcy5pbml0ICkgdGhpcy5pbml0KHRoaXMuZGF0YSk7XG5cbiAgLy8gQFRPRE86IHJlbW92ZSwgbWF5YmUgLCB0aGVyZSBpcyBubyBuZWVkIHRvIHVwZGF0ZSBhZnRlciBpbml0OyBcbiAgLy8gaWYodGhpcy4kcm9vdCA9PT0gdGhpcykgdGhpcy4kdXBkYXRlKCk7XG4gIGVudi5pc1J1bm5pbmcgPSBwcmV2UnVubmluZztcblxuICAvLyBjaGlsZHJlbiBpcyBub3QgcmVxdWlyZWQ7XG59XG5cblxudmFyIHdhbGtlcnMgPSByZXF1aXJlKCcuL3dhbGtlcnMuanMnKTtcbndhbGtlcnMuUmVndWxhciA9IFJlZ3VsYXI7XG5cblxuLy8gZGVzY3JpcHRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIDEuIFJlZ3VsYXIgYW5kIGRlcml2ZWQgQ2xhc3MgdXNlIHNhbWUgZmlsdGVyXG5fLmV4dGVuZChSZWd1bGFyLCB7XG4gIC8vIHByaXZhdGUgZGF0YSBzdHVmZlxuICBfZGlyZWN0aXZlczogeyBfX3JlZ2V4cF9fOltdIH0sXG4gIF9wbHVnaW5zOiB7fSxcbiAgX2V4cHJDYWNoZTp7fSxcbiAgX3J1bm5pbmc6IGZhbHNlLFxuICBfY29uZmlnOiBjb25maWcsXG4gIF9wcm90b0luaGVyaXRDYWNoZTogWyd1c2UnLCAnZGlyZWN0aXZlJ10gLFxuICBfX2FmdGVyX186IGZ1bmN0aW9uKHN1cHIsIG8pIHtcblxuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB0aGlzLl9fYWZ0ZXJfXyA9IHN1cHIuX19hZnRlcl9fO1xuXG4gICAgaWYoby5uYW1lKSBSZWd1bGFyLmNvbXBvbmVudChvLm5hbWUsIHRoaXMpO1xuICAgIGlmKHRlbXBsYXRlID0gby50ZW1wbGF0ZSl7XG4gICAgICB2YXIgbm9kZSwgbmFtZTtcbiAgICAgIGlmKCB0eXBlb2YgdGVtcGxhdGUgPT09ICdzdHJpbmcnICYmIHRlbXBsYXRlLmxlbmd0aCA8IDIwICYmICggbm9kZSA9IGRvbS5maW5kKCB0ZW1wbGF0ZSApKSApe1xuICAgICAgICB0ZW1wbGF0ZSA9IG5vZGUuaW5uZXJIVE1MO1xuICAgICAgICBpZihuYW1lID0gZG9tLmF0dHIobm9kZSwgJ25hbWUnKSkgUmVndWxhci5jb21wb25lbnQobmFtZSwgdGhpcyk7XG4gICAgICB9XG5cbiAgICAgIGlmKHRlbXBsYXRlLm5vZGVUeXBlKSB0ZW1wbGF0ZSA9IHRlbXBsYXRlLmlubmVySFRNTDtcblxuICAgICAgaWYodHlwZW9mIHRlbXBsYXRlID09PSAnc3RyaW5nJyl7XG4gICAgICAgIHRoaXMucHJvdG90eXBlLnRlbXBsYXRlID0gbmV3IFBhcnNlcih0ZW1wbGF0ZSkucGFyc2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZihvLmNvbXB1dGVkKSB0aGlzLnByb3RvdHlwZS5jb21wdXRlZCA9IGhhbmRsZUNvbXB1dGVkKG8uY29tcHV0ZWQpO1xuICAgIC8vIGluaGVyaXQgZGlyZWN0aXZlIGFuZCBvdGhlciBjb25maWcgZnJvbSBzdXByXG4gICAgUmVndWxhci5faW5oZXJpdENvbmZpZyh0aGlzLCBzdXByKTtcblxuICB9LFxuICAvKipcbiAgICogRGVmaW5lIGEgZGlyZWN0aXZlXG4gICAqXG4gICAqIEBtZXRob2QgZGlyZWN0aXZlXG4gICAqIEByZXR1cm4ge09iamVjdH0gQ29weSBvZiAuLi5cbiAgICovICBcbiAgZGlyZWN0aXZlOiBmdW5jdGlvbihuYW1lLCBjZmcpe1xuXG4gICAgaWYoXy50eXBlT2YobmFtZSkgPT09IFwib2JqZWN0XCIpe1xuICAgICAgZm9yKHZhciBrIGluIG5hbWUpe1xuICAgICAgICBpZihuYW1lLmhhc093blByb3BlcnR5KGspKSB0aGlzLmRpcmVjdGl2ZShrLCBuYW1lW2tdKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgdHlwZSA9IF8udHlwZU9mKG5hbWUpO1xuICAgIHZhciBkaXJlY3RpdmVzID0gdGhpcy5fZGlyZWN0aXZlcywgZGlyZWN0aXZlO1xuICAgIGlmKGNmZyA9PSBudWxsKXtcbiAgICAgIGlmKCB0eXBlID09PSBcInN0cmluZ1wiICYmIChkaXJlY3RpdmUgPSBkaXJlY3RpdmVzW25hbWVdKSApIHJldHVybiBkaXJlY3RpdmU7XG4gICAgICBlbHNle1xuICAgICAgICB2YXIgcmVnZXhwID0gZGlyZWN0aXZlcy5fX3JlZ2V4cF9fO1xuICAgICAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSByZWdleHAubGVuZ3RoOyBpIDwgbGVuIDsgaSsrKXtcbiAgICAgICAgICBkaXJlY3RpdmUgPSByZWdleHBbaV07XG4gICAgICAgICAgdmFyIHRlc3QgPSBkaXJlY3RpdmUucmVnZXhwLnRlc3QobmFtZSk7XG4gICAgICAgICAgaWYodGVzdCkgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYodHlwZW9mIGNmZyA9PT0gJ2Z1bmN0aW9uJykgY2ZnID0geyBsaW5rOiBjZmcgfSBcbiAgICBpZih0eXBlID09PSAnc3RyaW5nJykgZGlyZWN0aXZlc1tuYW1lXSA9IGNmZztcbiAgICBlbHNlIGlmKHR5cGUgPT09ICdyZWdleHAnKXtcbiAgICAgIGNmZy5yZWdleHAgPSBuYW1lO1xuICAgICAgZGlyZWN0aXZlcy5fX3JlZ2V4cF9fLnB1c2goY2ZnKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBwbHVnaW46IGZ1bmN0aW9uKG5hbWUsIGZuKXtcbiAgICB2YXIgcGx1Z2lucyA9IHRoaXMuX3BsdWdpbnM7XG4gICAgaWYoZm4gPT0gbnVsbCkgcmV0dXJuIHBsdWdpbnNbbmFtZV07XG4gICAgcGx1Z2luc1tuYW1lXSA9IGZuO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICB1c2U6IGZ1bmN0aW9uKGZuKXtcbiAgICBpZih0eXBlb2YgZm4gPT09IFwic3RyaW5nXCIpIGZuID0gUmVndWxhci5wbHVnaW4oZm4pO1xuICAgIGlmKHR5cGVvZiBmbiAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdGhpcztcbiAgICBmbih0aGlzLCBSZWd1bGFyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgLy8gY29uZmlnIHRoZSBSZWd1bGFyanMncyBnbG9iYWxcbiAgY29uZmlnOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSl7XG4gICAgdmFyIG5lZWRHZW5MZXhlciA9IGZhbHNlO1xuICAgIGlmKHR5cGVvZiBuYW1lID09PSBcIm9iamVjdFwiKXtcbiAgICAgIGZvcih2YXIgaSBpbiBuYW1lKXtcbiAgICAgICAgLy8gaWYgeW91IGNvbmZpZ1xuICAgICAgICBpZiggaSA9PT1cIkVORFwiIHx8IGk9PT0nQkVHSU4nICkgIG5lZWRHZW5MZXhlciA9IHRydWU7XG4gICAgICAgIGNvbmZpZ1tpXSA9IG5hbWVbaV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmKG5lZWRHZW5MZXhlcikgTGV4ZXIuc2V0dXAoKTtcbiAgfSxcbiAgZXhwcmVzc2lvbjogcGFyc2UuZXhwcmVzc2lvbixcbiAgcGFyc2U6IHBhcnNlLnBhcnNlLFxuXG4gIFBhcnNlcjogUGFyc2VyLFxuICBMZXhlcjogTGV4ZXIsXG5cbiAgX2FkZFByb3RvSW5oZXJpdENhY2hlOiBmdW5jdGlvbihuYW1lKXtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggbmFtZSApICl7XG4gICAgICByZXR1cm4gbmFtZS5mb3JFYWNoKFJlZ3VsYXIuX2FkZFByb3RvSW5oZXJpdENhY2hlKTtcbiAgICB9XG4gICAgdmFyIGNhY2hlS2V5ID0gXCJfXCIgKyBuYW1lICsgXCJzXCJcbiAgICBSZWd1bGFyLl9wcm90b0luaGVyaXRDYWNoZS5wdXNoKG5hbWUpXG4gICAgUmVndWxhcltjYWNoZUtleV0gPSB7fTtcbiAgICBSZWd1bGFyW25hbWVdID0gZnVuY3Rpb24oa2V5LCBjZmcpe1xuICAgICAgdmFyIGNhY2hlID0gdGhpc1tjYWNoZUtleV07XG5cbiAgICAgIGlmKHR5cGVvZiBrZXkgPT09IFwib2JqZWN0XCIpe1xuICAgICAgICBmb3IodmFyIGkgaW4ga2V5KXtcbiAgICAgICAgICBpZihrZXkuaGFzT3duUHJvcGVydHkoaSkpIHRoaXNbbmFtZV0oaSwga2V5W2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGlmKGNmZyA9PSBudWxsKSByZXR1cm4gY2FjaGVba2V5XTtcbiAgICAgIGNhY2hlW2tleV0gPSBjZmc7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH0sXG4gIF9pbmhlcml0Q29uZmlnOiBmdW5jdGlvbihzZWxmLCBzdXByKXtcblxuICAgIC8vIHByb3RvdHlwZSBpbmhlcml0IHNvbWUgUmVndWxhciBwcm9wZXJ0eVxuICAgIC8vIHNvIGV2ZXJ5IENvbXBvbmVudCB3aWxsIGhhdmUgb3duIGNvbnRhaW5lciB0byBzZXJ2ZSBkaXJlY3RpdmUsIGZpbHRlciBldGMuLlxuICAgIHZhciBkZWZzID0gUmVndWxhci5fcHJvdG9Jbmhlcml0Q2FjaGU7XG4gICAgdmFyIGtleXMgPSBfLnNsaWNlKGRlZnMpO1xuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgc2VsZltrZXldID0gc3VwcltrZXldO1xuICAgICAgdmFyIGNhY2hlS2V5ID0gJ18nICsga2V5ICsgJ3MnO1xuICAgICAgaWYoc3VwcltjYWNoZUtleV0pIHNlbGZbY2FjaGVLZXldID0gXy5jcmVhdGVPYmplY3Qoc3VwcltjYWNoZUtleV0pO1xuICAgIH0pXG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxufSk7XG5cbmV4dGVuZChSZWd1bGFyKTtcblxuUmVndWxhci5fYWRkUHJvdG9Jbmhlcml0Q2FjaGUoW1wiZmlsdGVyXCIsIFwiY29tcG9uZW50XCJdKVxuXG5cbkV2ZW50Lm1peFRvKFJlZ3VsYXIpO1xuV2F0Y2hlci5taXhUbyhSZWd1bGFyKTtcblxuUmVndWxhci5pbXBsZW1lbnQoe1xuICBpbml0OiBmdW5jdGlvbigpe30sXG4gIGNvbmZpZzogZnVuY3Rpb24oKXt9LFxuICBkZXN0cm95OiBmdW5jdGlvbigpe1xuICAgIC8vIGRlc3Ryb3kgZXZlbnQgd29udCBwcm9wZ2F0aW9uO1xuICAgIGlmKHRoaXMuJGNvbnRleHQgPT09IHRoaXMpIHRoaXMuJGVtaXQoXCIkZGVzdHJveVwiKTtcbiAgICB0aGlzLmdyb3VwICYmIHRoaXMuZ3JvdXAuZGVzdHJveSh0cnVlKTtcbiAgICB0aGlzLmdyb3VwID0gbnVsbDtcbiAgICB0aGlzLnBhcmVudE5vZGUgPSBudWxsO1xuICAgIHRoaXMuX3dhdGNoZXJzID0gbnVsbDtcbiAgICB0aGlzLl9jaGlsZHJlbiA9IFtdO1xuICAgIHZhciBwYXJlbnQgPSB0aGlzLiRwYXJlbnQ7XG4gICAgaWYocGFyZW50KXtcbiAgICAgIHZhciBpbmRleCA9IHBhcmVudC5fY2hpbGRyZW4uaW5kZXhPZih0aGlzKTtcbiAgICAgIHBhcmVudC5fY2hpbGRyZW4uc3BsaWNlKGluZGV4LDEpO1xuICAgIH1cbiAgICB0aGlzLiRwYXJlbnQgPSBudWxsO1xuICAgIHRoaXMuJHJvb3QgPSBudWxsO1xuICAgIHRoaXMuX2hhbmRsZXMgPSBudWxsO1xuICAgIHRoaXMuJHJlZnMgPSBudWxsO1xuICB9LFxuXG4gIC8qKlxuICAgKiBjb21waWxlIGEgYmxvY2sgYXN0IDsgcmV0dXJuIGEgZ3JvdXA7XG4gICAqIEBwYXJhbSAge0FycmF5fSBwYXJzZWQgYXN0XG4gICAqIEBwYXJhbSAge1t0eXBlXX0gcmVjb3JkXG4gICAqIEByZXR1cm4ge1t0eXBlXX1cbiAgICovXG4gICRjb21waWxlOiBmdW5jdGlvbihhc3QsIG9wdGlvbnMpe1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIGlmKHR5cGVvZiBhc3QgPT09ICdzdHJpbmcnKXtcbiAgICAgIGFzdCA9IG5ldyBQYXJzZXIoYXN0KS5wYXJzZSgpXG4gICAgfVxuICAgIHZhciBwcmVOcyA9IHRoaXMuX19uc19fLFxuICAgICAgcmVjb3JkID0gb3B0aW9ucy5yZWNvcmQsIFxuICAgICAgcmVjb3JkcztcbiAgICBpZihvcHRpb25zLm5hbWVzcGFjZSkgdGhpcy5fX25zX18gPSBvcHRpb25zLm5hbWVzcGFjZTtcbiAgICBpZihyZWNvcmQpIHRoaXMuX3JlY29yZCgpO1xuICAgIHZhciBncm91cCA9IHRoaXMuX3dhbGsoYXN0LCBvcHRpb25zKTtcbiAgICBpZihyZWNvcmQpe1xuICAgICAgcmVjb3JkcyA9IHRoaXMuX3JlbGVhc2UoKTtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGlmKHJlY29yZHMubGVuZ3RoKXtcbiAgICAgICAgLy8gYXV0byBkZXN0cm95IGFsbCB3YXRoZXI7XG4gICAgICAgIGdyb3VwLm9uZGVzdHJveSA9IGZ1bmN0aW9uKCl7IHNlbGYuJHVud2F0Y2gocmVjb3Jkcyk7IH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYob3B0aW9ucy5uYW1lc3BhY2UpIHRoaXMuX19uc19fID0gcHJlTnM7XG4gICAgcmV0dXJuIGdyb3VwO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIGNyZWF0ZSB0d28td2F5IGJpbmRpbmcgd2l0aCBhbm90aGVyIGNvbXBvbmVudDtcbiAgICogKndhcm4qOiBcbiAgICogICBleHByMSBhbmQgZXhwcjIgbXVzdCBjYW4gb3BlcmF0ZSBzZXQmZ2V0LCBmb3IgZXhhbXBsZTogdGhlICdhLmInIG9yICdhW2IgKyAxXScgaXMgc2V0LWFibGUsIGJ1dCAnYS5iICsgMScgaXMgbm90LCBcbiAgICogICBiZWFjdXNlIFJlZ3VsYXIgZG9udCBrbm93IGhvdyB0byBpbnZlcnNlIHNldCB0aHJvdWdoIHRoZSBleHByZXNzaW9uO1xuICAgKiAgIFxuICAgKiAgIGlmIGJlZm9yZSAkYmluZCwgdHdvIGNvbXBvbmVudCdzIHN0YXRlIGlzIG5vdCBzeW5jLCB0aGUgY29tcG9uZW50KHBhc3NlZCBwYXJhbSkgd2lsbCBzeW5jIHdpdGggdGhlIGNhbGxlZCBjb21wb25lbnQ7XG4gICAqXG4gICAqICpleGFtcGxlOiAqXG4gICAqXG4gICAqIGBgYGphdmFzY3JpcHRcbiAgICogLy8gaW4gdGhpcyBleGFtcGxlLCB3ZSBuZWVkIHRvIGxpbmsgdHdvIHBhZ2VyIGNvbXBvbmVudFxuICAgKiB2YXIgcGFnZXIgPSBuZXcgUGFnZXIoe30pIC8vIHBhZ2VyIGNvbXBvZW5udFxuICAgKiB2YXIgcGFnZXIyID0gbmV3IFBhZ2VyKHt9KSAvLyBhbm90aGVyIHBhZ2VyIGNvbXBvbmVudFxuICAgKiBwYWdlci4kYmluZChwYWdlcjIsICdjdXJyZW50Jyk7IC8vIHR3byB3YXkgYmluZCB0aHJvdyB0d28gY29tcG9uZW50XG4gICAqIHBhZ2VyLiRiaW5kKHBhZ2VyMiwgJ3RvdGFsJyk7ICAgLy8gXG4gICAqIC8vIG9yIGp1c3RcbiAgICogcGFnZXIuJGJpbmQocGFnZXIyLCB7XCJjdXJyZW50XCI6IFwiY3VycmVudFwiLCBcInRvdGFsXCI6IFwidG90YWxcIn0pIFxuICAgKiBgYGBcbiAgICogXG4gICAqIEBwYXJhbSAge1JlZ3VsYXJ9IGNvbXBvbmVudCB0aGVcbiAgICogQHBhcmFtICB7U3RyaW5nfEV4cHJlc3Npb259IGV4cHIxICAgICByZXF1aXJlZCwgc2VsZiBleHByMSB0byBvcGVyYXRlIGJpbmRpbmdcbiAgICogQHBhcmFtICB7U3RyaW5nfEV4cHJlc3Npb259IGV4cHIyICAgICBvcHRpb25hbCwgb3RoZXIgY29tcG9uZW50J3MgZXhwciB0byBiaW5kIHdpdGgsIGlmIG5vdCBwYXNzZWQsIHRoZSBleHByMiB3aWxsIHVzZSB0aGUgZXhwcjE7XG4gICAqIEByZXR1cm4gICAgICAgICAgdGhpcztcbiAgICovXG4gICRiaW5kOiBmdW5jdGlvbihjb21wb25lbnQsIGV4cHIxLCBleHByMil7XG4gICAgdmFyIHR5cGUgPSBfLnR5cGVPZihleHByMSk7XG4gICAgaWYoIGV4cHIxLnR5cGUgPT09ICdleHByZXNzaW9uJyB8fCB0eXBlID09PSAnc3RyaW5nJyApe1xuICAgICAgdGhpcy5fYmluZChjb21wb25lbnQsIGV4cHIxLCBleHByMilcbiAgICB9ZWxzZSBpZiggdHlwZSA9PT0gXCJhcnJheVwiICl7IC8vIG11bHRpcGx5IHNhbWUgcGF0aCBiaW5kaW5nIHRocm91Z2ggYXJyYXlcbiAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IGV4cHIxLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcbiAgICAgICAgdGhpcy5fYmluZChjb21wb25lbnQsIGV4cHIxW2ldKTtcbiAgICAgIH1cbiAgICB9ZWxzZSBpZih0eXBlID09PSBcIm9iamVjdFwiKXtcbiAgICAgIGZvcih2YXIgaSBpbiBleHByMSkgaWYoZXhwcjEuaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICB0aGlzLl9iaW5kKGNvbXBvbmVudCwgaSwgZXhwcjFbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBkaWdlc3RcbiAgICBjb21wb25lbnQuJHVwZGF0ZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICAvKipcbiAgICogdW5iaW5kIG9uZSBjb21wb25lbnQoIHNlZSAkYmluZCBhbHNvKVxuICAgKlxuICAgKiB1bmJpbmQgd2lsbCB1bmJpbmQgYWxsIHJlbGF0aW9uIGJldHdlZW4gdHdvIGNvbXBvbmVudFxuICAgKiBcbiAgICogQHBhcmFtICB7UmVndWxhcn0gY29tcG9uZW50IFtkZXNjcmlwdGlvbl1cbiAgICogQHJldHVybiB7VGhpc30gICAgdGhpc1xuICAgKi9cbiAgJHVuYmluZDogZnVuY3Rpb24oKXtcbiAgICAvLyB0b2RvXG4gIH0sXG4gICRnZXQ6IGZ1bmN0aW9uKGV4cHIpe1xuICAgIHJldHVybiBwYXJzZS5leHByZXNzaW9uKGV4cHIpLmdldCh0aGlzKTtcbiAgfSxcbiAgJGluamVjdDogZnVuY3Rpb24obm9kZSwgcG9zaXRpb24pe1xuICAgIHZhciBmcmFnbWVudCA9IGNvbWJpbmUubm9kZSh0aGlzKTtcbiAgICBpZih0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIG5vZGUgPSBkb20uZmluZChub2RlKTtcbiAgICBpZighbm9kZSkgdGhyb3cgJ2luamVjdGVkIG5vZGUgaXMgbm90IGZvdW5kJztcbiAgICBpZighZnJhZ21lbnQpIHJldHVybjtcbiAgICBkb20uaW5qZWN0KGZyYWdtZW50LCBub2RlLCBwb3NpdGlvbik7XG4gICAgdGhpcy4kZW1pdChcIiRpbmplY3RcIiwgbm9kZSk7XG4gICAgdGhpcy5wYXJlbnROb2RlID0gQXJyYXkuaXNBcnJheShmcmFnbWVudCk/IGZyYWdtZW50WzBdLnBhcmVudE5vZGU6IGZyYWdtZW50LnBhcmVudE5vZGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIC8vIHByaXZhdGUgYmluZCBsb2dpY1xuICBfYmluZDogZnVuY3Rpb24oY29tcG9uZW50LCBleHByMSwgZXhwcjIpe1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vIGJhc2ljIGJpbmRpbmdcblxuICAgIGlmKCFjb21wb25lbnQgfHwgIShjb21wb25lbnQgaW5zdGFuY2VvZiBSZWd1bGFyKSkgdGhyb3cgXCIkYmluZCgpIHNob3VsZCBwYXNzIFJlZ3VsYXIgY29tcG9uZW50IGFzIGZpcnN0IGFyZ3VtZW50XCI7XG4gICAgaWYoIWV4cHIxKSB0aHJvdyBcIiRiaW5kKCkgc2hvdWxkICBwYXNzIGFzIGxlYXN0IG9uZSBleHByZXNzaW9uIHRvIGJpbmRcIjtcblxuICAgIGlmKCFleHByMikgZXhwcjIgPSBleHByMTtcblxuICAgIGV4cHIxID0gcGFyc2UuZXhwcmVzc2lvbiggZXhwcjEgKTtcbiAgICBleHByMiA9IHBhcnNlLmV4cHJlc3Npb24oIGV4cHIyICk7XG5cbiAgICAvLyBzZXQgaXMgbmVlZCB0byBvcGVyYXRlIHNldHRpbmcgO1xuICAgIGlmKGV4cHIyLnNldCl7XG4gICAgICB2YXIgd2lkMSA9IHRoaXMuJHdhdGNoKCBleHByMSwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICBjb21wb25lbnQuJHVwZGF0ZShleHByMiwgdmFsdWUpXG4gICAgICB9KTtcbiAgICAgIGNvbXBvbmVudC4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKXtcbiAgICAgICAgc2VsZi4kdW53YXRjaCh3aWQxKVxuICAgICAgfSlcbiAgICB9XG4gICAgaWYoZXhwcjEuc2V0KXtcbiAgICAgIHZhciB3aWQyID0gY29tcG9uZW50LiR3YXRjaChleHByMiwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICBzZWxmLiR1cGRhdGUoZXhwcjEsIHZhbHVlKVxuICAgICAgfSk7XG4gICAgICAvLyB3aGVuIGJyb3RoZXIgZGVzdHJveSwgd2UgdW5saW5rIHRoaXMgd2F0Y2hlclxuICAgICAgdGhpcy4kb24oJyRkZXN0cm95JywgY29tcG9uZW50LiR1bndhdGNoLmJpbmQoY29tcG9uZW50LHdpZDIpKVxuICAgIH1cbiAgICAvLyBzeW5jIHRoZSBjb21wb25lbnQncyBzdGF0ZSB0byBjYWxsZWQncyBzdGF0ZVxuICAgIGV4cHIyLnNldChjb21wb25lbnQsIGV4cHIxLmdldCh0aGlzKSk7XG4gIH0sXG4gIF93YWxrOiBmdW5jdGlvbihhc3QsIGFyZzEpe1xuICAgIGlmKCBfLnR5cGVPZihhc3QpID09PSAnYXJyYXknICl7XG4gICAgICB2YXIgcmVzID0gW107XG5cbiAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IGFzdC5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgIHJlcy5wdXNoKCB0aGlzLl93YWxrKGFzdFtpXSwgYXJnMSkgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBHcm91cChyZXMpO1xuICAgIH1cbiAgICBpZih0eXBlb2YgYXN0ID09PSAnc3RyaW5nJykgcmV0dXJuIGRvYy5jcmVhdGVUZXh0Tm9kZShhc3QpXG4gICAgcmV0dXJuIHdhbGtlcnNbYXN0LnR5cGUgfHwgXCJkZWZhdWx0XCJdLmNhbGwodGhpcywgYXN0LCBhcmcxKTtcbiAgfSxcbiAgX2FwcGVuZDogZnVuY3Rpb24oY29tcG9uZW50KXtcbiAgICB0aGlzLl9jaGlsZHJlbi5wdXNoKGNvbXBvbmVudCk7XG4gICAgY29tcG9uZW50LiRyb290ID0gdGhpcy4kcm9vdDtcbiAgICBjb21wb25lbnQuJHBhcmVudCA9IHRoaXM7XG4gIH0sXG4gIF9oYW5kbGVFdmVudDogZnVuY3Rpb24oZWxlbSwgdHlwZSwgdmFsdWUsIGF0dHJzKXtcbiAgICB2YXIgQ29tcG9uZW50ID0gdGhpcy5jb25zdHJ1Y3RvcixcbiAgICAgIGZpcmUgPSB0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIj8gXy5oYW5kbGVFdmVudC5jYWxsKCB0aGlzLCB2YWx1ZSwgdHlwZSApIDogdmFsdWUsXG4gICAgICBoYW5kbGVyID0gQ29tcG9uZW50LmV2ZW50KHR5cGUpLCBkZXN0cm95O1xuXG4gICAgaWYgKCBoYW5kbGVyICkge1xuICAgICAgZGVzdHJveSA9IGhhbmRsZXIuY2FsbCh0aGlzLCBlbGVtLCBmaXJlLCBhdHRycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvbS5vbihlbGVtLCB0eXBlLCBmaXJlKTtcbiAgICB9XG4gICAgcmV0dXJuIGhhbmRsZXIgPyBkZXN0cm95IDogZnVuY3Rpb24oKSB7XG4gICAgICBkb20ub2ZmKGVsZW0sIHR5cGUsIGZpcmUpO1xuICAgIH1cbiAgfSxcbiAgLy8gZmluZCBmaWx0ZXJcbiAgX2ZfOiBmdW5jdGlvbihuYW1lKXtcbiAgICB2YXIgQ29tcG9uZW50ID0gdGhpcy5jb25zdHJ1Y3RvcjtcbiAgICB2YXIgZmlsdGVyID0gQ29tcG9uZW50LmZpbHRlcihuYW1lKTtcbiAgICBpZih0eXBlb2YgZmlsdGVyICE9PSAnZnVuY3Rpb24nKSB0aHJvdyAnZmlsdGVyICcgKyBuYW1lICsgJ2lzIHVuZGVmaW5lZCc7XG4gICAgcmV0dXJuIGZpbHRlcjtcbiAgfSxcbiAgLy8gc2ltcGxlIGFjY2Vzc29yIGdldFxuICBfc2dfOmZ1bmN0aW9uKHBhdGgsIGRlZmF1bHRzKXtcbiAgICB2YXIgY29tcHV0ZWQgPSB0aGlzLmNvbXB1dGVkLFxuICAgICAgY29tcHV0ZWRQcm9wZXJ0eSA9IGNvbXB1dGVkW3BhdGhdO1xuICAgIGlmKGNvbXB1dGVkUHJvcGVydHkpe1xuICAgICAgaWYoY29tcHV0ZWRQcm9wZXJ0eS5nZXQpICByZXR1cm4gY29tcHV0ZWRQcm9wZXJ0eS5nZXQodGhpcyk7XG4gICAgICBlbHNlIF8ubG9nKFwidGhlIGNvbXB1dGVkICdcIiArIHBhdGggKyBcIicgZG9uJ3QgZGVmaW5lIHRoZSBnZXQgZnVuY3Rpb24sICBnZXQgZGF0YS5cIitwYXRoICsgXCIgYWx0bmF0ZWx5XCIsIFwiZXJyb3JcIilcbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRzO1xuXG4gIH0sXG4gIC8vIHNpbXBsZSBhY2Nlc3NvciBzZXRcbiAgX3NzXzpmdW5jdGlvbihwYXRoLCB2YWx1ZSwgZGF0YSwgb3Ape1xuICAgIHZhciBjb21wdXRlZCA9IHRoaXMuY29tcHV0ZWQsXG4gICAgICBvcCA9IG9wIHx8IFwiPVwiLFxuICAgICAgY29tcHV0ZWRQcm9wZXJ0eSA9IGNvbXB1dGVkW3BhdGhdLFxuICAgICAgcHJldjtcblxuICAgIGlmKG9wIT09ICc9Jyl7XG4gICAgICBwcmV2ID0gY29tcHV0ZWRQcm9wZXJ0eT8gY29tcHV0ZWRQcm9wZXJ0eS5nZXQodGhpcyk6IGRhdGFbcGF0aF07XG4gICAgICBzd2l0Y2gob3Ape1xuICAgICAgICBjYXNlIFwiKz1cIjpcbiAgICAgICAgICB2YWx1ZSA9IHByZXYgKyB2YWx1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIi09XCI6XG4gICAgICAgICAgdmFsdWUgPSBwcmV2IC0gdmFsdWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCIqPVwiOlxuICAgICAgICAgIHZhbHVlID0gcHJldiAqIHZhbHVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiLz1cIjpcbiAgICAgICAgICB2YWx1ZSA9IHByZXYgLyB2YWx1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIiU9XCI6XG4gICAgICAgICAgdmFsdWUgPSBwcmV2ICUgdmFsdWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSAgXG5cbiAgICBpZihjb21wdXRlZFByb3BlcnR5KSB7XG4gICAgICBpZihjb21wdXRlZFByb3BlcnR5LnNldCkgcmV0dXJuIGNvbXB1dGVkUHJvcGVydHkuc2V0KHRoaXMsIHZhbHVlKTtcbiAgICAgIGVsc2UgXy5sb2coXCJ0aGUgY29tcHV0ZWQgJ1wiICsgcGF0aCArIFwiJyBkb24ndCBkZWZpbmUgdGhlIHNldCBmdW5jdGlvbiwgIGFzc2lnbiBkYXRhLlwiK3BhdGggKyBcIiBhbHRuYXRlbHlcIiwgXCJlcnJvclwiIClcbiAgICB9XG4gICAgZGF0YVtwYXRoXSA9IHZhbHVlO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufSk7XG5cblJlZ3VsYXIucHJvdG90eXBlLmluamVjdCA9IFJlZ3VsYXIucHJvdG90eXBlLiRpbmplY3Q7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVndWxhcjtcblxuXG5cbnZhciBoYW5kbGVDb21wdXRlZCA9IChmdW5jdGlvbigpe1xuICAvLyB3cmFwIHRoZSBjb21wdXRlZCBnZXR0ZXI7XG4gIGZ1bmN0aW9uIHdyYXBHZXQoZ2V0KXtcbiAgICByZXR1cm4gZnVuY3Rpb24oY29udGV4dCl7XG4gICAgICB2YXIgY3R4ID0gY29udGV4dC4kY29udGV4dDtcbiAgICAgIHJldHVybiBnZXQuY2FsbChjdHgsIGN0eC5kYXRhICk7XG4gICAgfVxuICB9XG4gIC8vIHdyYXAgdGhlIGNvbXB1dGVkIHNldHRlcjtcbiAgZnVuY3Rpb24gd3JhcFNldChzZXQpe1xuICAgIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCB2YWx1ZSl7XG4gICAgICB2YXIgY3R4ID0gY29udGV4dC4kY29udGV4dDtcbiAgICAgIHNldC5jYWxsKCBjdHgsIHZhbHVlLCBjdHguZGF0YSApO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihjb21wdXRlZCl7XG4gICAgaWYoIWNvbXB1dGVkKSByZXR1cm47XG4gICAgdmFyIHBhcnNlZENvbXB1dGVkID0ge30sIGhhbmRsZSwgcGFpciwgdHlwZTtcbiAgICBmb3IodmFyIGkgaW4gY29tcHV0ZWQpe1xuICAgICAgaGFuZGxlID0gY29tcHV0ZWRbaV1cbiAgICAgIHR5cGUgPSB0eXBlb2YgaGFuZGxlO1xuXG4gICAgICBpZihoYW5kbGUudHlwZSA9PT0gJ2V4cHJlc3Npb24nKXtcbiAgICAgICAgcGFyc2VkQ29tcHV0ZWRbaV0gPSBoYW5kbGU7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYoIHR5cGUgPT09IFwic3RyaW5nXCIgKXtcbiAgICAgICAgcGFyc2VkQ29tcHV0ZWRbaV0gPSBwYXJzZS5leHByZXNzaW9uKGhhbmRsZSlcbiAgICAgIH1lbHNle1xuICAgICAgICBwYWlyID0gcGFyc2VkQ29tcHV0ZWRbaV0gPSB7dHlwZTogJ2V4cHJlc3Npb24nfTtcbiAgICAgICAgaWYodHlwZSA9PT0gXCJmdW5jdGlvblwiICl7XG4gICAgICAgICAgcGFpci5nZXQgPSB3cmFwR2V0KGhhbmRsZSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGlmKGhhbmRsZS5nZXQpIHBhaXIuZ2V0ID0gd3JhcEdldChoYW5kbGUuZ2V0KTtcbiAgICAgICAgICBpZihoYW5kbGUuc2V0KSBwYWlyLnNldCA9IHdyYXBTZXQoaGFuZGxlLnNldCk7XG4gICAgICAgIH1cbiAgICAgIH0gXG4gICAgfVxuICAgIHJldHVybiBwYXJzZWRDb21wdXRlZDtcbiAgfVxufSkoKTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSB7XG4nQkVHSU4nOiAne3snLFxuJ0VORCc6ICd9fSdcbn0iLCJcbi8vIHRoYW5rcyBmb3IgYW5ndWxhciAmJiBtb290b29scyBmb3Igc29tZSBjb25jaXNlJmNyb3NzLXBsYXRmb3JtICBpbXBsZW1lbnRpb25cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gVGhlIE1JVCBMaWNlbnNlXG4vLyBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxNCBHb29nbGUsIEluYy4gaHR0cDovL2FuZ3VsYXJqcy5vcmdcblxuLy8gLS0tXG4vLyBsaWNlbnNlOiBNSVQtc3R5bGUgbGljZW5zZS4gaHR0cDovL21vb3Rvb2xzLm5ldFxuXG52YXIgZG9tID0gbW9kdWxlLmV4cG9ydHM7XG52YXIgZW52ID0gcmVxdWlyZShcIi4vZW52LmpzXCIpO1xudmFyIF8gPSByZXF1aXJlKFwiLi91dGlsXCIpO1xudmFyIHROb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbnZhciBhZGRFdmVudCwgcmVtb3ZlRXZlbnQ7XG52YXIgbm9vcCA9IGZ1bmN0aW9uKCl7fVxuXG52YXIgbmFtZXNwYWNlcyA9IHtcbiAgaHRtbDogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXG4gIHN2ZzogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG59XG5cbmRvbS5ib2R5ID0gZG9jdW1lbnQuYm9keTtcblxuZG9tLmRvYyA9IGRvY3VtZW50O1xuXG4vLyBjYW1lbENhc2VcbmZ1bmN0aW9uIGNhbWVsQ2FzZShzdHIpe1xuICByZXR1cm4gKFwiXCIgKyBzdHIpLnJlcGxhY2UoLy1cXEQvZywgZnVuY3Rpb24obWF0Y2gpe1xuICAgIHJldHVybiBtYXRjaC5jaGFyQXQoMSkudG9VcHBlckNhc2UoKTtcbiAgfSk7XG59XG5cblxuZG9tLnROb2RlID0gdE5vZGU7XG5cbmlmKHROb2RlLmFkZEV2ZW50TGlzdGVuZXIpe1xuICBhZGRFdmVudCA9IGZ1bmN0aW9uKG5vZGUsIHR5cGUsIGZuKSB7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBmYWxzZSk7XG4gIH1cbiAgcmVtb3ZlRXZlbnQgPSBmdW5jdGlvbihub2RlLCB0eXBlLCBmbikge1xuICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgZmFsc2UpIFxuICB9XG59ZWxzZXtcbiAgYWRkRXZlbnQgPSBmdW5jdGlvbihub2RlLCB0eXBlLCBmbikge1xuICAgIG5vZGUuYXR0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGZuKTtcbiAgfVxuICByZW1vdmVFdmVudCA9IGZ1bmN0aW9uKG5vZGUsIHR5cGUsIGZuKSB7XG4gICAgbm9kZS5kZXRhY2hFdmVudCgnb24nICsgdHlwZSwgZm4pOyBcbiAgfVxufVxuXG5cbmRvbS5tc2llID0gcGFyc2VJbnQoKC9tc2llIChcXGQrKS8uZXhlYyhuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkpIHx8IFtdKVsxXSk7XG5pZiAoaXNOYU4oZG9tLm1zaWUpKSB7XG4gIGRvbS5tc2llID0gcGFyc2VJbnQoKC90cmlkZW50XFwvLio7IHJ2OihcXGQrKS8uZXhlYyhuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkpIHx8IFtdKVsxXSk7XG59XG5cbmRvbS5maW5kID0gZnVuY3Rpb24oc2wpe1xuICBpZihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKSB7XG4gICAgdHJ5e1xuICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2wpO1xuICAgIH1jYXRjaChlKXtcblxuICAgIH1cbiAgfVxuICBpZihzbC5pbmRleE9mKCcjJykhPT0tMSkgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBzbC5zbGljZSgxKSApO1xufVxuXG5kb20uaW5qZWN0ID0gZnVuY3Rpb24obm9kZSwgcmVmZXIsIHBvc2l0aW9uKXtcblxuICBwb3NpdGlvbiA9IHBvc2l0aW9uIHx8ICdib3R0b20nO1xuXG4gIGlmKEFycmF5LmlzQXJyYXkobm9kZSkpe1xuICAgIHZhciB0bXAgPSBub2RlO1xuICAgIG5vZGUgPSBkb20uZnJhZ21lbnQoKTtcbiAgICBmb3IodmFyIGkgPSAwLGxlbiA9IHRtcC5sZW5ndGg7IGkgPCBsZW4gO2krKyl7XG4gICAgICBub2RlLmFwcGVuZENoaWxkKHRtcFtpXSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGZpcnN0Q2hpbGQsIG5leHQ7XG4gIHN3aXRjaChwb3NpdGlvbil7XG4gICAgY2FzZSAnYm90dG9tJzpcbiAgICAgIHJlZmVyLmFwcGVuZENoaWxkKCBub2RlICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0b3AnOlxuICAgICAgaWYoIGZpcnN0Q2hpbGQgPSByZWZlci5maXJzdENoaWxkICl7XG4gICAgICAgIHJlZmVyLmluc2VydEJlZm9yZSggbm9kZSwgcmVmZXIuZmlyc3RDaGlsZCApO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJlZmVyLmFwcGVuZENoaWxkKCBub2RlICk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhZnRlcic6XG4gICAgICBpZiggbmV4dCA9IHJlZmVyLm5leHRTaWJsaW5nICl7XG4gICAgICAgIG5leHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIG5vZGUsIG5leHQgKTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZWZlci5wYXJlbnROb2RlLmFwcGVuZENoaWxkKCBub2RlICk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiZWZvcmUnOlxuICAgICAgcmVmZXIucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIG5vZGUsIHJlZmVyICk7XG4gIH1cbn1cblxuXG5kb20uaWQgPSBmdW5jdGlvbihpZCl7XG4gIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG59XG5cbi8vIGNyZWF0ZUVsZW1lbnQgXG5kb20uY3JlYXRlID0gZnVuY3Rpb24odHlwZSwgbnMsIGF0dHJzKXtcbiAgaWYobnMgPT09ICdzdmcnKXtcbiAgICBpZighZW52LnN2ZykgdGhyb3cgRXJyb3IoJ3RoZSBlbnYgbmVlZCBzdmcgc3VwcG9ydCcpXG4gICAgbnMgPSBuYW1lc3BhY2VzLnN2ZztcbiAgfVxuICByZXR1cm4gIW5zPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsIHR5cGUpO1xufVxuXG4vLyBkb2N1bWVudEZyYWdtZW50XG5kb20uZnJhZ21lbnQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xufVxuXG5cblxudmFyIHNwZWNpYWxBdHRyID0ge1xuICAnY2xhc3MnOiBmdW5jdGlvbihub2RlLCB2YWx1ZSl7XG4gICAgKCdjbGFzc05hbWUnIGluIG5vZGUgJiYgKG5vZGUubmFtZXNwYWNlVVJJID09PSBuYW1lc3BhY2VzLmh0bWwgfHwgIW5vZGUubmFtZXNwYWNlVVJJKSkgP1xuICAgICAgbm9kZS5jbGFzc05hbWUgPSAodmFsdWUgfHwgJycpIDogbm9kZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgdmFsdWUpO1xuICB9LFxuICAnZm9yJzogZnVuY3Rpb24obm9kZSwgdmFsdWUpe1xuICAgICgnaHRtbEZvcicgaW4gbm9kZSkgPyBub2RlLmh0bWxGb3IgPSB2YWx1ZSA6IG5vZGUuc2V0QXR0cmlidXRlKCdmb3InLCB2YWx1ZSk7XG4gIH0sXG4gICdzdHlsZSc6IGZ1bmN0aW9uKG5vZGUsIHZhbHVlKXtcbiAgICAobm9kZS5zdHlsZSkgPyBub2RlLnN0eWxlLmNzc1RleHQgPSB2YWx1ZSA6IG5vZGUuc2V0QXR0cmlidXRlKCdzdHlsZScsIHZhbHVlKTtcbiAgfSxcbiAgJ3ZhbHVlJzogZnVuY3Rpb24obm9kZSwgdmFsdWUpe1xuICAgIG5vZGUudmFsdWUgPSAodmFsdWUgIT0gbnVsbCkgPyB2YWx1ZSA6ICcnO1xuICB9XG59XG5cblxuLy8gYXR0cmlidXRlIFNldHRlciAmIEdldHRlclxuZG9tLmF0dHIgPSBmdW5jdGlvbihub2RlLCBuYW1lLCB2YWx1ZSl7XG4gIGlmIChfLmlzQm9vbGVhbkF0dHIobmFtZSkpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgaWYgKCEhdmFsdWUpIHtcbiAgICAgICAgbm9kZVtuYW1lXSA9IHRydWU7XG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKG5hbWUsIG5hbWUpO1xuICAgICAgICAvLyBsdCBpZTcgLiB0aGUgamF2YXNjcmlwdCBjaGVja2VkIHNldHRpbmcgaXMgaW4gdmFsaWRcbiAgICAgICAgLy9odHRwOi8vYnl0ZXMuY29tL3RvcGljL2phdmFzY3JpcHQvaW5zaWdodHMvNzk5MTY3LWJyb3dzZXItcXVpcmstZHluYW1pY2FsbHktYXBwZW5kZWQtY2hlY2tlZC1jaGVja2JveC1kb2VzLW5vdC1hcHBlYXItY2hlY2tlZC1pZVxuICAgICAgICBpZihkb20ubXNpZSAmJiBkb20ubXNpZSA8PTcgKSBub2RlLmRlZmF1bHRDaGVja2VkID0gdHJ1ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZVtuYW1lXSA9IGZhbHNlO1xuICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChub2RlW25hbWVdIHx8XG4gICAgICAgICAgICAgICAobm9kZS5hdHRyaWJ1dGVzLmdldE5hbWVkSXRlbShuYW1lKXx8IG5vb3ApLnNwZWNpZmllZCkgPyBuYW1lIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgKHZhbHVlKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBpZiBpbiBzcGVjaWFsQXR0cjtcbiAgICBpZihzcGVjaWFsQXR0cltuYW1lXSkgc3BlY2lhbEF0dHJbbmFtZV0obm9kZSwgdmFsdWUpO1xuICAgIGVsc2UgaWYodmFsdWUgPT09IG51bGwpIG5vZGUucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG4gICAgZWxzZSBub2RlLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAobm9kZS5nZXRBdHRyaWJ1dGUpIHtcbiAgICAvLyB0aGUgZXh0cmEgYXJndW1lbnQgXCIyXCIgaXMgdG8gZ2V0IHRoZSByaWdodCB0aGluZyBmb3IgYS5ocmVmIGluIElFLCBzZWUgalF1ZXJ5IGNvZGVcbiAgICAvLyBzb21lIGVsZW1lbnRzIChlLmcuIERvY3VtZW50KSBkb24ndCBoYXZlIGdldCBhdHRyaWJ1dGUsIHNvIHJldHVybiB1bmRlZmluZWRcbiAgICB2YXIgcmV0ID0gbm9kZS5nZXRBdHRyaWJ1dGUobmFtZSwgMik7XG4gICAgLy8gbm9ybWFsaXplIG5vbi1leGlzdGluZyBhdHRyaWJ1dGVzIHRvIHVuZGVmaW5lZCAoYXMgalF1ZXJ5KVxuICAgIHJldHVybiByZXQgPT09IG51bGwgPyB1bmRlZmluZWQgOiByZXQ7XG4gIH1cbn1cblxuXG5kb20ub24gPSBmdW5jdGlvbihub2RlLCB0eXBlLCBoYW5kbGVyKXtcbiAgdmFyIHR5cGVzID0gdHlwZS5zcGxpdCgnICcpO1xuICBoYW5kbGVyLnJlYWwgPSBmdW5jdGlvbihldil7XG4gICAgaGFuZGxlci5jYWxsKG5vZGUsIG5ldyBFdmVudChldikpO1xuICB9XG4gIHR5cGVzLmZvckVhY2goZnVuY3Rpb24odHlwZSl7XG4gICAgdHlwZSA9IGZpeEV2ZW50TmFtZShub2RlLCB0eXBlKTtcbiAgICBhZGRFdmVudChub2RlLCB0eXBlLCBoYW5kbGVyLnJlYWwpO1xuICB9KTtcbn1cbmRvbS5vZmYgPSBmdW5jdGlvbihub2RlLCB0eXBlLCBoYW5kbGVyKXtcbiAgdmFyIHR5cGVzID0gdHlwZS5zcGxpdCgnICcpO1xuICBoYW5kbGVyID0gaGFuZGxlci5yZWFsIHx8IGhhbmRsZXI7XG4gIHR5cGVzLmZvckVhY2goZnVuY3Rpb24odHlwZSl7XG4gICAgdHlwZSA9IGZpeEV2ZW50TmFtZShub2RlLCB0eXBlKTtcbiAgICByZW1vdmVFdmVudChub2RlLCB0eXBlLCBoYW5kbGVyKTtcbiAgfSlcbn1cblxuXG5kb20udGV4dCA9IChmdW5jdGlvbiAoKXtcbiAgdmFyIG1hcCA9IHt9O1xuICBpZiAoZG9tLm1zaWUgJiYgZG9tLm1zaWUgPCA5KSB7XG4gICAgbWFwWzFdID0gJ2lubmVyVGV4dCc7ICAgIFxuICAgIG1hcFszXSA9ICdub2RlVmFsdWUnOyAgICBcbiAgfSBlbHNlIHtcbiAgICBtYXBbMV0gPSBtYXBbM10gPSAndGV4dENvbnRlbnQnO1xuICB9XG4gIFxuICByZXR1cm4gZnVuY3Rpb24gKG5vZGUsIHZhbHVlKSB7XG4gICAgdmFyIHRleHRQcm9wID0gbWFwW25vZGUubm9kZVR5cGVdO1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGV4dFByb3AgPyBub2RlW3RleHRQcm9wXSA6ICcnO1xuICAgIH1cbiAgICBub2RlW3RleHRQcm9wXSA9IHZhbHVlO1xuICB9XG59KSgpO1xuXG5cbmRvbS5odG1sID0gZnVuY3Rpb24oIG5vZGUsIGh0bWwgKXtcbiAgaWYodHlwZW9mIGh0bWwgPT09IFwidW5kZWZpbmVkXCIpe1xuICAgIHJldHVybiBub2RlLmlubmVySFRNTDtcbiAgfWVsc2V7XG4gICAgbm9kZS5pbm5lckhUTUwgPSBodG1sO1xuICB9XG59XG5cbmRvbS5yZXBsYWNlID0gZnVuY3Rpb24obm9kZSwgcmVwbGFjZWQpe1xuICBpZihyZXBsYWNlZC5wYXJlbnROb2RlKSByZXBsYWNlZC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChub2RlLCByZXBsYWNlZCk7XG59XG5cbmRvbS5yZW1vdmUgPSBmdW5jdGlvbihub2RlKXtcbiAgaWYobm9kZS5wYXJlbnROb2RlKSBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG59XG5cbi8vIGNzcyBTZXR0bGUgJiBHZXR0ZXIgZnJvbSBhbmd1bGFyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIGl0IGlzbnQgY29tcHV0ZWQgc3R5bGUgXG5kb20uY3NzID0gZnVuY3Rpb24obm9kZSwgbmFtZSwgdmFsdWUpe1xuICBpZiggXy50eXBlT2YobmFtZSkgPT09IFwib2JqZWN0XCIgKXtcbiAgICBmb3IodmFyIGkgaW4gbmFtZSl7XG4gICAgICBpZiggbmFtZS5oYXNPd25Qcm9wZXJ0eShpKSApe1xuICAgICAgICBkb20uY3NzKCBub2RlLCBpLCBuYW1lW2ldICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICBpZiAoIHR5cGVvZiB2YWx1ZSAhPT0gXCJ1bmRlZmluZWRcIiApIHtcblxuICAgIG5hbWUgPSBjYW1lbENhc2UobmFtZSk7XG4gICAgaWYobmFtZSkgbm9kZS5zdHlsZVtuYW1lXSA9IHZhbHVlO1xuXG4gIH0gZWxzZSB7XG5cbiAgICB2YXIgdmFsO1xuICAgIGlmIChkb20ubXNpZSA8PSA4KSB7XG4gICAgICAvLyB0aGlzIGlzIHNvbWUgSUUgc3BlY2lmaWMgd2VpcmRuZXNzIHRoYXQgalF1ZXJ5IDEuNi40IGRvZXMgbm90IHN1cmUgd2h5XG4gICAgICB2YWwgPSBub2RlLmN1cnJlbnRTdHlsZSAmJiBub2RlLmN1cnJlbnRTdHlsZVtuYW1lXTtcbiAgICAgIGlmICh2YWwgPT09ICcnKSB2YWwgPSAnYXV0byc7XG4gICAgfVxuICAgIHZhbCA9IHZhbCB8fCBub2RlLnN0eWxlW25hbWVdO1xuICAgIGlmIChkb20ubXNpZSA8PSA4KSB7XG4gICAgICB2YWwgPSB2YWwgPT09ICcnID8gdW5kZWZpbmVkIDogdmFsO1xuICAgIH1cbiAgICByZXR1cm4gIHZhbDtcbiAgfVxufVxuXG5kb20uYWRkQ2xhc3MgPSBmdW5jdGlvbihub2RlLCBjbGFzc05hbWUpe1xuICB2YXIgY3VycmVudCA9IG5vZGUuY2xhc3NOYW1lIHx8IFwiXCI7XG4gIGlmICgoXCIgXCIgKyBjdXJyZW50ICsgXCIgXCIpLmluZGV4T2YoXCIgXCIgKyBjbGFzc05hbWUgKyBcIiBcIikgPT09IC0xKSB7XG4gICAgbm9kZS5jbGFzc05hbWUgPSBjdXJyZW50PyAoIGN1cnJlbnQgKyBcIiBcIiArIGNsYXNzTmFtZSApIDogY2xhc3NOYW1lO1xuICB9XG59XG5cbmRvbS5kZWxDbGFzcyA9IGZ1bmN0aW9uKG5vZGUsIGNsYXNzTmFtZSl7XG4gIHZhciBjdXJyZW50ID0gbm9kZS5jbGFzc05hbWUgfHwgXCJcIjtcbiAgbm9kZS5jbGFzc05hbWUgPSAoXCIgXCIgKyBjdXJyZW50ICsgXCIgXCIpLnJlcGxhY2UoXCIgXCIgKyBjbGFzc05hbWUgKyBcIiBcIiwgXCIgXCIpLnRyaW0oKTtcbn1cblxuZG9tLmhhc0NsYXNzID0gZnVuY3Rpb24obm9kZSwgY2xhc3NOYW1lKXtcbiAgdmFyIGN1cnJlbnQgPSBub2RlLmNsYXNzTmFtZSB8fCBcIlwiO1xuICByZXR1cm4gKFwiIFwiICsgY3VycmVudCArIFwiIFwiKS5pbmRleE9mKFwiIFwiICsgY2xhc3NOYW1lICsgXCIgXCIpICE9PSAtMTtcbn1cblxuXG5cbi8vIHNpbXBsZSBFdmVudCB3cmFwXG5cbi8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMTA2ODE5Ni9pZTgtaWU3LW9uY2hhbmdlLWV2ZW50LWlzLWVtaXRlZC1vbmx5LWFmdGVyLXJlcGVhdGVkLXNlbGVjdGlvblxuZnVuY3Rpb24gZml4RXZlbnROYW1lKGVsZW0sIG5hbWUpe1xuICByZXR1cm4gKG5hbWUgPT09ICdjaGFuZ2UnICAmJiAgZG9tLm1zaWUgPCA5ICYmIFxuICAgICAgKGVsZW0gJiYgZWxlbS50YWdOYW1lICYmIGVsZW0udGFnTmFtZS50b0xvd2VyQ2FzZSgpPT09J2lucHV0JyAmJiBcbiAgICAgICAgKGVsZW0udHlwZSA9PT0gJ2NoZWNrYm94JyB8fCBlbGVtLnR5cGUgPT09ICdyYWRpbycpXG4gICAgICApXG4gICAgKT8gJ2NsaWNrJzogbmFtZTtcbn1cblxudmFyIHJNb3VzZUV2ZW50ID0gL14oPzpjbGlja3xkYmxjbGlja3xjb250ZXh0bWVudXxET01Nb3VzZVNjcm9sbHxtb3VzZSg/OlxcdyspKSQvXG52YXIgZG9jID0gZG9jdW1lbnQ7XG5kb2MgPSAoIWRvYy5jb21wYXRNb2RlIHx8IGRvYy5jb21wYXRNb2RlID09PSAnQ1NTMUNvbXBhdCcpID8gZG9jLmRvY3VtZW50RWxlbWVudCA6IGRvYy5ib2R5O1xuZnVuY3Rpb24gRXZlbnQoZXYpe1xuICBldiA9IGV2IHx8IHdpbmRvdy5ldmVudDtcbiAgaWYoZXYuX2ZpeGVkKSByZXR1cm4gZXY7XG4gIHRoaXMuZXZlbnQgPSBldjtcbiAgdGhpcy50YXJnZXQgPSBldi50YXJnZXQgfHwgZXYuc3JjRWxlbWVudDtcblxuICB2YXIgdHlwZSA9IHRoaXMudHlwZSA9IGV2LnR5cGU7XG4gIHZhciBidXR0b24gPSB0aGlzLmJ1dHRvbiA9IGV2LmJ1dHRvbjtcblxuICAvLyBpZiBpcyBtb3VzZSBldmVudCBwYXRjaCBwYWdlWFxuICBpZihyTW91c2VFdmVudC50ZXN0KHR5cGUpKXsgLy9maXggcGFnZVhcbiAgICB0aGlzLnBhZ2VYID0gKGV2LnBhZ2VYICE9IG51bGwpID8gZXYucGFnZVggOiBldi5jbGllbnRYICsgZG9jLnNjcm9sbExlZnQ7XG4gICAgdGhpcy5wYWdlWSA9IChldi5wYWdlWCAhPSBudWxsKSA/IGV2LnBhZ2VZIDogZXYuY2xpZW50WSArIGRvYy5zY3JvbGxUb3A7XG4gICAgaWYgKHR5cGUgPT09ICdtb3VzZW92ZXInIHx8IHR5cGUgPT09ICdtb3VzZW91dCcpey8vIGZpeCByZWxhdGVkVGFyZ2V0XG4gICAgICB2YXIgcmVsYXRlZCA9IGV2LnJlbGF0ZWRUYXJnZXQgfHwgZXZbKHR5cGUgPT09ICdtb3VzZW92ZXInID8gJ2Zyb20nIDogJ3RvJykgKyAnRWxlbWVudCddO1xuICAgICAgd2hpbGUgKHJlbGF0ZWQgJiYgcmVsYXRlZC5ub2RlVHlwZSA9PT0gMykgcmVsYXRlZCA9IHJlbGF0ZWQucGFyZW50Tm9kZTtcbiAgICAgIHRoaXMucmVsYXRlZFRhcmdldCA9IHJlbGF0ZWQ7XG4gICAgfVxuICB9XG4gIC8vIGlmIGlzIG1vdXNlc2Nyb2xsXG4gIGlmICh0eXBlID09PSAnRE9NTW91c2VTY3JvbGwnIHx8IHR5cGUgPT09ICdtb3VzZXdoZWVsJyl7XG4gICAgLy8gZmYgZXYuZGV0YWlsOiAzICAgIG90aGVyIGV2LndoZWVsRGVsdGE6IC0xMjBcbiAgICB0aGlzLndoZWVsRGVsdGEgPSAoZXYud2hlZWxEZWx0YSkgPyBldi53aGVlbERlbHRhIC8gMTIwIDogLShldi5kZXRhaWwgfHwgMCkgLyAzO1xuICB9XG4gIFxuICAvLyBmaXggd2hpY2hcbiAgdGhpcy53aGljaCA9IGV2LndoaWNoIHx8IGV2LmtleUNvZGU7XG4gIGlmKCAhdGhpcy53aGljaCAmJiBidXR0b24gIT09IHVuZGVmaW5lZCl7XG4gICAgLy8gaHR0cDovL2FwaS5qcXVlcnkuY29tL2V2ZW50LndoaWNoLyB1c2Ugd2hpY2hcbiAgICB0aGlzLndoaWNoID0gKCBidXR0b24gJiAxID8gMSA6ICggYnV0dG9uICYgMiA/IDMgOiAoIGJ1dHRvbiAmIDQgPyAyIDogMCApICkgKTtcbiAgfVxuICB0aGlzLl9maXhlZCA9IHRydWU7XG59XG5cbl8uZXh0ZW5kKEV2ZW50LnByb3RvdHlwZSwge1xuICBpbW1lZGlhdGVTdG9wOiBfLmlzRmFsc2UsXG4gIHN0b3A6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5wcmV2ZW50RGVmYXVsdCgpLnN0b3BQcm9wZ2F0aW9uKCk7XG4gIH0sXG4gIHByZXZlbnREZWZhdWx0OiBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLmV2ZW50LnByZXZlbnREZWZhdWx0KSB0aGlzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZWxzZSB0aGlzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHN0b3BQcm9wZ2F0aW9uOiBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbikgdGhpcy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBlbHNlIHRoaXMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uOiBmdW5jdGlvbigpe1xuICAgIGlmKHRoaXMuZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKSB0aGlzLmV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICB9XG59KVxuXG5cbmRvbS5uZXh0RnJhbWUgPSAoZnVuY3Rpb24oKXtcbiAgICB2YXIgcmVxdWVzdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fCBcbiAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKXtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgMTYpXG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICB2YXIgY2FuY2VsID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRDYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICB3aW5kb3cubW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgd2luZG93LndlYmtpdENhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICBmdW5jdGlvbih0aWQpe1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGlkKVxuICAgICAgICAgICAgICAgICB9XG4gIFxuICByZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2spe1xuICAgIHZhciBpZCA9IHJlcXVlc3QoY2FsbGJhY2spO1xuICAgIHJldHVybiBmdW5jdGlvbigpeyBjYW5jZWwoaWQpOyB9XG4gIH1cbn0pKCk7XG5cbi8vIDNrcyBmb3IgYW5ndWxhcidzIHJhZiAgc2VydmljZVxudmFyIGs7XG5kb20ubmV4dFJlZmxvdyA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcbiAgZG9tLm5leHRGcmFtZShmdW5jdGlvbigpe1xuICAgIGsgPSBkb2N1bWVudC5ib2R5Lm9mZnNldFdpZHRoO1xuICAgIGNhbGxiYWNrKCk7XG4gIH0pXG59XG5cblxuXG4iLCIvLyBzb21lIGZpeHR1cmUgdGVzdDtcbi8vIC0tLS0tLS0tLS0tLS0tLVxudmFyIF8gPSByZXF1aXJlKCcuL3V0aWwnKTtcbmV4cG9ydHMuc3ZnID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0eXBlb2YgZG9jdW1lbnQgIT09IFwidW5kZWZpbmVkXCIgJiYgZG9jdW1lbnQuaW1wbGVtZW50YXRpb24uaGFzRmVhdHVyZSggXCJodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcxMS9mZWF0dXJlI0Jhc2ljU3RydWN0dXJlXCIsIFwiMS4xXCIgKTtcbn0pKCk7XG5cblxuZXhwb3J0cy50cmFuc2l0aW9uID0gKGZ1bmN0aW9uKCl7XG4gIFxufSkoKTtcblxuLy8gd2hldGhlciBoYXZlIGNvbXBvbmVudCBpbiBpbml0aWFsaXppbmdcbmV4cG9ydHMuZXhwckNhY2hlID0gXy5jYWNoZSgxMDApO1xuZXhwb3J0cy5pc1J1bm5pbmcgPSBmYWxzZTtcbiIsInZhciBfID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgY29tYmluZSA9IHJlcXVpcmUoJy4vaGVscGVyL2NvbWJpbmUnKVxuXG5mdW5jdGlvbiBHcm91cChsaXN0KXtcbiAgdGhpcy5jaGlsZHJlbiA9IGxpc3QgfHwgW107XG59XG5cblxuXy5leHRlbmQoR3JvdXAucHJvdG90eXBlLCB7XG4gIGRlc3Ryb3k6IGZ1bmN0aW9uKGZpcnN0KXtcbiAgICBjb21iaW5lLmRlc3Ryb3kodGhpcy5jaGlsZHJlbiwgZmlyc3QpO1xuICAgIGlmKHRoaXMub25kZXN0cm95KSB0aGlzLm9uZGVzdHJveSgpO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBudWxsO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uKGkpe1xuICAgIHJldHVybiB0aGlzLmNoaWxkcmVuW2ldXG4gIH0sXG4gIHB1c2g6IGZ1bmN0aW9uKGl0ZW0pe1xuICAgIHRoaXMuY2hpbGRyZW4ucHVzaCggaXRlbSApO1xuICB9XG5cbn0pXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEdyb3VwO1xuXG5cbiIsInZhciBfID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG52YXIgZG9tICA9IHJlcXVpcmUoXCIuLi9kb20uanNcIik7XG52YXIgYW5pbWF0ZSA9IHt9O1xudmFyIGVudiA9IHJlcXVpcmUoXCIuLi9lbnYuanNcIik7XG5cblxudmFyIFxuICB0cmFuc2l0aW9uRW5kID0gJ3RyYW5zaXRpb25lbmQnLCBcbiAgYW5pbWF0aW9uRW5kID0gJ2FuaW1hdGlvbmVuZCcsIFxuICB0cmFuc2l0aW9uUHJvcGVydHkgPSAndHJhbnNpdGlvbicsIFxuICBhbmltYXRpb25Qcm9wZXJ0eSA9ICdhbmltYXRpb24nO1xuXG5pZighKCdvbnRyYW5zaXRpb25lbmQnIGluIHdpbmRvdykpe1xuICBpZignb253ZWJraXR0cmFuc2l0aW9uZW5kJyBpbiB3aW5kb3cpIHtcbiAgICBcbiAgICAvLyBDaHJvbWUvU2FmICgrIE1vYmlsZSBTYWYpL0FuZHJvaWRcbiAgICB0cmFuc2l0aW9uRW5kICs9ICcgd2Via2l0VHJhbnNpdGlvbkVuZCc7XG4gICAgdHJhbnNpdGlvblByb3BlcnR5ID0gJ3dlYmtpdFRyYW5zaXRpb24nXG4gIH0gZWxzZSBpZignb25vdHJhbnNpdGlvbmVuZCcgaW4gZG9tLnROb2RlIHx8IG5hdmlnYXRvci5hcHBOYW1lID09PSAnT3BlcmEnKSB7XG5cbiAgICAvLyBPcGVyYVxuICAgIHRyYW5zaXRpb25FbmQgKz0gJyBvVHJhbnNpdGlvbkVuZCc7XG4gICAgdHJhbnNpdGlvblByb3BlcnR5ID0gJ29UcmFuc2l0aW9uJztcbiAgfVxufVxuaWYoISgnb25hbmltYXRpb25lbmQnIGluIHdpbmRvdykpe1xuICBpZiAoJ29ud2Via2l0YW5pbWF0aW9uZW5kJyBpbiB3aW5kb3cpe1xuICAgIC8vIENocm9tZS9TYWYgKCsgTW9iaWxlIFNhZikvQW5kcm9pZFxuICAgIGFuaW1hdGlvbkVuZCArPSAnIHdlYmtpdEFuaW1hdGlvbkVuZCc7XG4gICAgYW5pbWF0aW9uUHJvcGVydHkgPSAnd2Via2l0QW5pbWF0aW9uJztcblxuICB9ZWxzZSBpZiAoJ29ub2FuaW1hdGlvbmVuZCcgaW4gZG9tLnROb2RlKXtcbiAgICAvLyBPcGVyYVxuICAgIGFuaW1hdGlvbkVuZCArPSAnIG9BbmltYXRpb25FbmQnO1xuICAgIGFuaW1hdGlvblByb3BlcnR5ID0gJ29BbmltYXRpb24nO1xuICB9XG59XG5cbi8qKlxuICogaW5qZWN0IG5vZGUgd2l0aCBhbmltYXRpb25cbiAqIEBwYXJhbSAge1t0eXBlXX0gbm9kZSAgICAgIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge1t0eXBlXX0gcmVmZXIgICAgIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge1t0eXBlXX0gZGlyZWN0aW9uIFtkZXNjcmlwdGlvbl1cbiAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuYW5pbWF0ZS5pbmplY3QgPSBmdW5jdGlvbiggbm9kZSwgcmVmZXIgLGRpcmVjdGlvbiwgY2FsbGJhY2sgKXtcbiAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBfLm5vb3A7XG4gIGlmKCBBcnJheS5pc0FycmF5KG5vZGUpICl7XG4gICAgdmFyIGZyYWdtZW50ID0gZG9tLmZyYWdtZW50KCk7XG4gICAgdmFyIGNvdW50PTA7XG5cbiAgICBmb3IodmFyIGkgPSAwLGxlbiA9IG5vZGUubGVuZ3RoO2kgPCBsZW47IGkrKyApe1xuICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQobm9kZVtpXSk7IFxuICAgIH1cbiAgICBkb20uaW5qZWN0KGZyYWdtZW50LCByZWZlciwgZGlyZWN0aW9uKTtcblxuICAgIHZhciBlbnRlckNhbGxiYWNrID0gZnVuY3Rpb24gKCl7XG4gICAgICBjb3VudCsrO1xuICAgICAgaWYoIGNvdW50ID09PSBsZW4gKSBjYWxsYmFjaygpO1xuICAgIH1cbiAgICBpZihsZW4gPT09IGNvdW50KSBjYWxsYmFjaygpO1xuICAgIGZvciggaSA9IDA7IGkgPCBsZW47IGkrKyApe1xuICAgICAgaWYobm9kZVtpXS5vbmVudGVyKXtcbiAgICAgICAgbm9kZVtpXS5vbmVudGVyKGVudGVyQ2FsbGJhY2spO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGVudGVyQ2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9XG4gIH1lbHNle1xuICAgIGRvbS5pbmplY3QoIG5vZGUsIHJlZmVyLCBkaXJlY3Rpb24gKTtcbiAgICBpZihub2RlLm9uZW50ZXIpe1xuICAgICAgbm9kZS5vbmVudGVyKGNhbGxiYWNrKVxuICAgIH1lbHNle1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gICAgLy8gaWYoIG5vZGUubm9kZVR5cGUgPT09IDEgJiYgY2FsbGJhY2sgIT09IGZhbHNlICl7XG4gICAgLy8gICByZXR1cm4gc3RhcnRDbGFzc0FuaW1hdGUoIG5vZGUsICdyLWVudGVyJywgY2FsbGJhY2sgLCAyKTtcbiAgICAvLyB9XG4gICAgLy8gaWdub3JlZCBlbHNlXG4gICAgXG4gIH1cbn1cblxuLyoqXG4gKiByZW1vdmUgbm9kZSB3aXRoIGFuaW1hdGlvblxuICogQHBhcmFtICB7W3R5cGVdfSAgIG5vZGUgICAgIFtkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5hbmltYXRlLnJlbW92ZSA9IGZ1bmN0aW9uKG5vZGUsIGNhbGxiYWNrKXtcbiAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBfLm5vb3A7XG4gIGlmKG5vZGUub25sZWF2ZSl7XG4gICAgbm9kZS5vbmxlYXZlKGZ1bmN0aW9uKCl7XG4gICAgICBkb20ucmVtb3ZlKG5vZGUpO1xuICAgIH0pXG4gIH1lbHNle1xuICAgIGRvbS5yZW1vdmUobm9kZSkgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKTtcbiAgfVxufVxuXG5cblxuYW5pbWF0ZS5zdGFydENsYXNzQW5pbWF0ZSA9IGZ1bmN0aW9uICggbm9kZSwgY2xhc3NOYW1lLCAgY2FsbGJhY2ssIG1vZGUgKXtcbiAgdmFyIGFjdGl2ZUNsYXNzTmFtZSwgdGltZW91dCwgdGlkLCBvbmNlQW5pbTtcbiAgaWYoICghYW5pbWF0aW9uRW5kICYmICF0cmFuc2l0aW9uRW5kKSB8fCBlbnYuaXNSdW5uaW5nICl7XG4gICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gIH1cblxuXG4gIG9uY2VBbmltID0gXy5vbmNlKGZ1bmN0aW9uIG9uQW5pbWF0ZUVuZCgpe1xuICAgIGlmKHRpZCkgY2xlYXJUaW1lb3V0KHRpZCk7XG5cbiAgICBpZihtb2RlID09PSAyKSB7XG4gICAgICBkb20uZGVsQ2xhc3Mobm9kZSwgYWN0aXZlQ2xhc3NOYW1lKTtcbiAgICB9XG4gICAgaWYobW9kZSAhPT0gMyl7IC8vIG1vZGUgaG9sZCB0aGUgY2xhc3NcbiAgICAgIGRvbS5kZWxDbGFzcyhub2RlLCBjbGFzc05hbWUpO1xuICAgIH1cbiAgICBkb20ub2ZmKG5vZGUsIGFuaW1hdGlvbkVuZCwgb25jZUFuaW0pXG4gICAgZG9tLm9mZihub2RlLCB0cmFuc2l0aW9uRW5kLCBvbmNlQW5pbSlcblxuICAgIGNhbGxiYWNrKCk7XG5cbiAgfSk7XG4gIGlmKG1vZGUgPT09IDIpeyAvLyBhdXRvIHJlbW92ZWRcbiAgICBkb20uYWRkQ2xhc3MoIG5vZGUsIGNsYXNzTmFtZSApO1xuXG4gICAgYWN0aXZlQ2xhc3NOYW1lID0gY2xhc3NOYW1lLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKG5hbWUpe1xuICAgICAgIHJldHVybiBuYW1lICsgJy1hY3RpdmUnO1xuICAgIH0pLmpvaW4oXCIgXCIpO1xuXG4gICAgZG9tLm5leHRSZWZsb3coZnVuY3Rpb24oKXtcbiAgICAgIGRvbS5hZGRDbGFzcyggbm9kZSwgYWN0aXZlQ2xhc3NOYW1lICk7XG4gICAgICB0aW1lb3V0ID0gZ2V0TWF4VGltZW91dCggbm9kZSApO1xuICAgICAgdGlkID0gc2V0VGltZW91dCggb25jZUFuaW0sIHRpbWVvdXQgKTtcbiAgICB9KTtcblxuICB9ZWxzZXtcblxuICAgIGRvbS5uZXh0UmVmbG93KGZ1bmN0aW9uKCl7XG4gICAgICBkb20uYWRkQ2xhc3MoIG5vZGUsIGNsYXNzTmFtZSApO1xuICAgICAgdGltZW91dCA9IGdldE1heFRpbWVvdXQoIG5vZGUgKTtcbiAgICAgIHRpZCA9IHNldFRpbWVvdXQoIG9uY2VBbmltLCB0aW1lb3V0ICk7XG4gICAgfSk7XG5cbiAgfVxuXG5cbiAgZG9tLm9uKCBub2RlLCBhbmltYXRpb25FbmQsIG9uY2VBbmltIClcbiAgZG9tLm9uKCBub2RlLCB0cmFuc2l0aW9uRW5kLCBvbmNlQW5pbSApXG4gIHJldHVybiBvbmNlQW5pbTtcbn1cblxuXG5hbmltYXRlLnN0YXJ0U3R5bGVBbmltYXRlID0gZnVuY3Rpb24obm9kZSwgc3R5bGVzLCBjYWxsYmFjayl7XG4gIHZhciB0aW1lb3V0LCBvbmNlQW5pbSwgdGlkO1xuXG4gIGRvbS5uZXh0UmVmbG93KGZ1bmN0aW9uKCl7XG4gICAgZG9tLmNzcyggbm9kZSwgc3R5bGVzICk7XG4gICAgdGltZW91dCA9IGdldE1heFRpbWVvdXQoIG5vZGUgKTtcbiAgICB0aWQgPSBzZXRUaW1lb3V0KCBvbmNlQW5pbSwgdGltZW91dCApO1xuICB9KTtcblxuXG4gIG9uY2VBbmltID0gXy5vbmNlKGZ1bmN0aW9uIG9uQW5pbWF0ZUVuZCgpe1xuICAgIGlmKHRpZCkgY2xlYXJUaW1lb3V0KHRpZCk7XG5cbiAgICBkb20ub2ZmKG5vZGUsIGFuaW1hdGlvbkVuZCwgb25jZUFuaW0pXG4gICAgZG9tLm9mZihub2RlLCB0cmFuc2l0aW9uRW5kLCBvbmNlQW5pbSlcblxuICAgIGNhbGxiYWNrKCk7XG5cbiAgfSk7XG5cbiAgZG9tLm9uKCBub2RlLCBhbmltYXRpb25FbmQsIG9uY2VBbmltIClcbiAgZG9tLm9uKCBub2RlLCB0cmFuc2l0aW9uRW5kLCBvbmNlQW5pbSApXG5cbiAgcmV0dXJuIG9uY2VBbmltO1xufVxuXG5cbi8qKlxuICogZ2V0IG1heHRpbWVvdXRcbiAqIEBwYXJhbSAge05vZGV9IG5vZGUgXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBnZXRNYXhUaW1lb3V0KG5vZGUpe1xuICB2YXIgdGltZW91dCA9IDAsXG4gICAgdER1cmF0aW9uID0gMCxcbiAgICB0RGVsYXkgPSAwLFxuICAgIGFEdXJhdGlvbiA9IDAsXG4gICAgYURlbGF5ID0gMCxcbiAgICByYXRpbyA9IDUgLyAzLFxuICAgIHN0eWxlcyA7XG5cbiAgaWYod2luZG93LmdldENvbXB1dGVkU3R5bGUpe1xuXG4gICAgc3R5bGVzID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobm9kZSksXG4gICAgdER1cmF0aW9uID0gZ2V0TWF4VGltZSggc3R5bGVzW3RyYW5zaXRpb25Qcm9wZXJ0eSArICdEdXJhdGlvbiddKSB8fCB0RHVyYXRpb247XG4gICAgdERlbGF5ID0gZ2V0TWF4VGltZSggc3R5bGVzW3RyYW5zaXRpb25Qcm9wZXJ0eSArICdEZWxheSddKSB8fCB0RGVsYXk7XG4gICAgYUR1cmF0aW9uID0gZ2V0TWF4VGltZSggc3R5bGVzW2FuaW1hdGlvblByb3BlcnR5ICsgJ0R1cmF0aW9uJ10pIHx8IGFEdXJhdGlvbjtcbiAgICBhRGVsYXkgPSBnZXRNYXhUaW1lKCBzdHlsZXNbYW5pbWF0aW9uUHJvcGVydHkgKyAnRGVsYXknXSkgfHwgYURlbGF5O1xuICAgIHRpbWVvdXQgPSBNYXRoLm1heCggdER1cmF0aW9uK3REZWxheSwgYUR1cmF0aW9uICsgYURlbGF5ICk7XG5cbiAgfVxuICByZXR1cm4gdGltZW91dCAqIDEwMDAgKiByYXRpbztcbn1cblxuZnVuY3Rpb24gZ2V0TWF4VGltZShzdHIpe1xuXG4gIHZhciBtYXhUaW1lb3V0ID0gMCwgdGltZTtcblxuICBpZighc3RyKSByZXR1cm4gMDtcblxuICBzdHIuc3BsaXQoXCIsXCIpLmZvckVhY2goZnVuY3Rpb24oc3RyKXtcblxuICAgIHRpbWUgPSBwYXJzZUZsb2F0KHN0cik7XG4gICAgaWYoIHRpbWUgPiBtYXhUaW1lb3V0ICkgbWF4VGltZW91dCA9IHRpbWU7XG5cbiAgfSk7XG5cbiAgcmV0dXJuIG1heFRpbWVvdXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYW5pbWF0ZTsiLCIvLyBzb21lIG5lc3RlZCAgb3BlcmF0aW9uIGluIGFzdCBcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBkb20gPSByZXF1aXJlKFwiLi4vZG9tLmpzXCIpO1xuXG52YXIgY29tYmluZSA9IG1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8vIGdldCB0aGUgaW5pdGlhbCBkb20gaW4gb2JqZWN0XG4gIG5vZGU6IGZ1bmN0aW9uKGl0ZW0pe1xuICAgIHZhciBjaGlsZHJlbixub2RlO1xuICAgIGlmKGl0ZW0uZWxlbWVudCkgcmV0dXJuIGl0ZW0uZWxlbWVudDtcbiAgICBpZih0eXBlb2YgaXRlbS5ub2RlID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBpdGVtLm5vZGUoKTtcbiAgICBpZih0eXBlb2YgaXRlbS5ub2RlVHlwZSA9PT0gXCJudW1iZXJcIikgcmV0dXJuIGl0ZW07XG4gICAgaWYoaXRlbS5ncm91cCkgcmV0dXJuIGNvbWJpbmUubm9kZShpdGVtLmdyb3VwKVxuICAgIGlmKGNoaWxkcmVuID0gaXRlbS5jaGlsZHJlbil7XG4gICAgICBpZihjaGlsZHJlbi5sZW5ndGggPT09IDEpe1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGNvbWJpbmUubm9kZShjaGlsZHJlblswXSk7XG4gICAgICB9XG4gICAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgaSsrICl7XG4gICAgICAgIG5vZGUgPSBjb21iaW5lLm5vZGUoY2hpbGRyZW5baV0pO1xuICAgICAgICBpZihBcnJheS5pc0FycmF5KG5vZGUpKXtcbiAgICAgICAgICBub2Rlcy5wdXNoLmFwcGx5KG5vZGVzLCBub2RlKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG4gIH0sXG5cbiAgLy8gZ2V0IHRoZSBsYXN0IGRvbSBpbiBvYmplY3QoZm9yIGluc2VydGlvbiBvcGVyYXRpb24pXG4gIGxhc3Q6IGZ1bmN0aW9uKGl0ZW0pe1xuICAgIHZhciBjaGlsZHJlbiA9IGl0ZW0uY2hpbGRyZW47XG5cbiAgICBpZih0eXBlb2YgaXRlbS5sYXN0ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBpdGVtLmxhc3QoKTtcbiAgICBpZih0eXBlb2YgaXRlbS5ub2RlVHlwZSA9PT0gXCJudW1iZXJcIikgcmV0dXJuIGl0ZW07XG5cbiAgICBpZihjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGgpIHJldHVybiBjb21iaW5lLmxhc3QoY2hpbGRyZW5bY2hpbGRyZW4ubGVuZ3RoIC0gMV0pO1xuICAgIGlmKGl0ZW0uZ3JvdXApIHJldHVybiBjb21iaW5lLmxhc3QoaXRlbS5ncm91cCk7XG5cbiAgfSxcblxuICBkZXN0cm95OiBmdW5jdGlvbihpdGVtLCBmaXJzdCl7XG4gICAgaWYoIWl0ZW0pIHJldHVybjtcbiAgICBpZihBcnJheS5pc0FycmF5KGl0ZW0pKXtcbiAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IGl0ZW0ubGVuZ3RoOyBpIDwgbGVuOyBpKysgKXtcbiAgICAgICAgY29tYmluZS5kZXN0cm95KGl0ZW1baV0sIGZpcnN0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGNoaWxkcmVuID0gaXRlbS5jaGlsZHJlbjtcbiAgICBpZih0eXBlb2YgaXRlbS5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBpdGVtLmRlc3Ryb3koZmlyc3QpO1xuICAgIGlmKHR5cGVvZiBpdGVtLm5vZGVUeXBlID09PSBcIm51bWJlclwiICYmIGZpcnN0KSAgZG9tLnJlbW92ZShpdGVtKTtcbiAgICBpZihjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGgpe1xuICAgICAgY29tYmluZS5kZXN0cm95KGNoaWxkcmVuLCB0cnVlKTtcbiAgICAgIGl0ZW0uY2hpbGRyZW4gPSBudWxsO1xuICAgIH1cbiAgfVxuXG59IiwiLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMzU0MDY0L2hvdy10by1jb252ZXJ0LWNoYXJhY3RlcnMtdG8taHRtbC1lbnRpdGllcy11c2luZy1wbGFpbi1qYXZhc2NyaXB0XG52YXIgZW50aXRpZXMgPSB7XG4gICdxdW90JzozNCwgXG4gICdhbXAnOjM4LCBcbiAgJ2Fwb3MnOjM5LCBcbiAgJ2x0Jzo2MCwgXG4gICdndCc6NjIsIFxuICAnbmJzcCc6MTYwLCBcbiAgJ2lleGNsJzoxNjEsIFxuICAnY2VudCc6MTYyLCBcbiAgJ3BvdW5kJzoxNjMsIFxuICAnY3VycmVuJzoxNjQsIFxuICAneWVuJzoxNjUsIFxuICAnYnJ2YmFyJzoxNjYsIFxuICAnc2VjdCc6MTY3LCBcbiAgJ3VtbCc6MTY4LCBcbiAgJ2NvcHknOjE2OSwgXG4gICdvcmRmJzoxNzAsIFxuICAnbGFxdW8nOjE3MSwgXG4gICdub3QnOjE3MiwgXG4gICdzaHknOjE3MywgXG4gICdyZWcnOjE3NCwgXG4gICdtYWNyJzoxNzUsIFxuICAnZGVnJzoxNzYsIFxuICAncGx1c21uJzoxNzcsIFxuICAnc3VwMic6MTc4LCBcbiAgJ3N1cDMnOjE3OSwgXG4gICdhY3V0ZSc6MTgwLCBcbiAgJ21pY3JvJzoxODEsIFxuICAncGFyYSc6MTgyLCBcbiAgJ21pZGRvdCc6MTgzLCBcbiAgJ2NlZGlsJzoxODQsIFxuICAnc3VwMSc6MTg1LCBcbiAgJ29yZG0nOjE4NiwgXG4gICdyYXF1byc6MTg3LCBcbiAgJ2ZyYWMxNCc6MTg4LCBcbiAgJ2ZyYWMxMic6MTg5LCBcbiAgJ2ZyYWMzNCc6MTkwLCBcbiAgJ2lxdWVzdCc6MTkxLCBcbiAgJ0FncmF2ZSc6MTkyLCBcbiAgJ0FhY3V0ZSc6MTkzLCBcbiAgJ0FjaXJjJzoxOTQsIFxuICAnQXRpbGRlJzoxOTUsIFxuICAnQXVtbCc6MTk2LCBcbiAgJ0FyaW5nJzoxOTcsIFxuICAnQUVsaWcnOjE5OCwgXG4gICdDY2VkaWwnOjE5OSwgXG4gICdFZ3JhdmUnOjIwMCwgXG4gICdFYWN1dGUnOjIwMSwgXG4gICdFY2lyYyc6MjAyLCBcbiAgJ0V1bWwnOjIwMywgXG4gICdJZ3JhdmUnOjIwNCwgXG4gICdJYWN1dGUnOjIwNSwgXG4gICdJY2lyYyc6MjA2LCBcbiAgJ0l1bWwnOjIwNywgXG4gICdFVEgnOjIwOCwgXG4gICdOdGlsZGUnOjIwOSwgXG4gICdPZ3JhdmUnOjIxMCwgXG4gICdPYWN1dGUnOjIxMSwgXG4gICdPY2lyYyc6MjEyLCBcbiAgJ090aWxkZSc6MjEzLCBcbiAgJ091bWwnOjIxNCwgXG4gICd0aW1lcyc6MjE1LCBcbiAgJ09zbGFzaCc6MjE2LCBcbiAgJ1VncmF2ZSc6MjE3LCBcbiAgJ1VhY3V0ZSc6MjE4LCBcbiAgJ1VjaXJjJzoyMTksIFxuICAnVXVtbCc6MjIwLCBcbiAgJ1lhY3V0ZSc6MjIxLCBcbiAgJ1RIT1JOJzoyMjIsIFxuICAnc3psaWcnOjIyMywgXG4gICdhZ3JhdmUnOjIyNCwgXG4gICdhYWN1dGUnOjIyNSwgXG4gICdhY2lyYyc6MjI2LCBcbiAgJ2F0aWxkZSc6MjI3LCBcbiAgJ2F1bWwnOjIyOCwgXG4gICdhcmluZyc6MjI5LCBcbiAgJ2FlbGlnJzoyMzAsIFxuICAnY2NlZGlsJzoyMzEsIFxuICAnZWdyYXZlJzoyMzIsIFxuICAnZWFjdXRlJzoyMzMsIFxuICAnZWNpcmMnOjIzNCwgXG4gICdldW1sJzoyMzUsIFxuICAnaWdyYXZlJzoyMzYsIFxuICAnaWFjdXRlJzoyMzcsIFxuICAnaWNpcmMnOjIzOCwgXG4gICdpdW1sJzoyMzksIFxuICAnZXRoJzoyNDAsIFxuICAnbnRpbGRlJzoyNDEsIFxuICAnb2dyYXZlJzoyNDIsIFxuICAnb2FjdXRlJzoyNDMsIFxuICAnb2NpcmMnOjI0NCwgXG4gICdvdGlsZGUnOjI0NSwgXG4gICdvdW1sJzoyNDYsIFxuICAnZGl2aWRlJzoyNDcsIFxuICAnb3NsYXNoJzoyNDgsIFxuICAndWdyYXZlJzoyNDksIFxuICAndWFjdXRlJzoyNTAsIFxuICAndWNpcmMnOjI1MSwgXG4gICd1dW1sJzoyNTIsIFxuICAneWFjdXRlJzoyNTMsIFxuICAndGhvcm4nOjI1NCwgXG4gICd5dW1sJzoyNTUsIFxuICAnZm5vZic6NDAyLCBcbiAgJ0FscGhhJzo5MTMsIFxuICAnQmV0YSc6OTE0LCBcbiAgJ0dhbW1hJzo5MTUsIFxuICAnRGVsdGEnOjkxNiwgXG4gICdFcHNpbG9uJzo5MTcsIFxuICAnWmV0YSc6OTE4LCBcbiAgJ0V0YSc6OTE5LCBcbiAgJ1RoZXRhJzo5MjAsIFxuICAnSW90YSc6OTIxLCBcbiAgJ0thcHBhJzo5MjIsIFxuICAnTGFtYmRhJzo5MjMsIFxuICAnTXUnOjkyNCwgXG4gICdOdSc6OTI1LCBcbiAgJ1hpJzo5MjYsIFxuICAnT21pY3Jvbic6OTI3LCBcbiAgJ1BpJzo5MjgsIFxuICAnUmhvJzo5MjksIFxuICAnU2lnbWEnOjkzMSwgXG4gICdUYXUnOjkzMiwgXG4gICdVcHNpbG9uJzo5MzMsIFxuICAnUGhpJzo5MzQsIFxuICAnQ2hpJzo5MzUsIFxuICAnUHNpJzo5MzYsIFxuICAnT21lZ2EnOjkzNywgXG4gICdhbHBoYSc6OTQ1LCBcbiAgJ2JldGEnOjk0NiwgXG4gICdnYW1tYSc6OTQ3LCBcbiAgJ2RlbHRhJzo5NDgsIFxuICAnZXBzaWxvbic6OTQ5LCBcbiAgJ3pldGEnOjk1MCwgXG4gICdldGEnOjk1MSwgXG4gICd0aGV0YSc6OTUyLCBcbiAgJ2lvdGEnOjk1MywgXG4gICdrYXBwYSc6OTU0LCBcbiAgJ2xhbWJkYSc6OTU1LCBcbiAgJ211Jzo5NTYsIFxuICAnbnUnOjk1NywgXG4gICd4aSc6OTU4LCBcbiAgJ29taWNyb24nOjk1OSwgXG4gICdwaSc6OTYwLCBcbiAgJ3Jobyc6OTYxLCBcbiAgJ3NpZ21hZic6OTYyLCBcbiAgJ3NpZ21hJzo5NjMsIFxuICAndGF1Jzo5NjQsIFxuICAndXBzaWxvbic6OTY1LCBcbiAgJ3BoaSc6OTY2LCBcbiAgJ2NoaSc6OTY3LCBcbiAgJ3BzaSc6OTY4LCBcbiAgJ29tZWdhJzo5NjksIFxuICAndGhldGFzeW0nOjk3NywgXG4gICd1cHNpaCc6OTc4LCBcbiAgJ3Bpdic6OTgyLCBcbiAgJ2J1bGwnOjgyMjYsIFxuICAnaGVsbGlwJzo4MjMwLCBcbiAgJ3ByaW1lJzo4MjQyLCBcbiAgJ1ByaW1lJzo4MjQzLCBcbiAgJ29saW5lJzo4MjU0LCBcbiAgJ2ZyYXNsJzo4MjYwLCBcbiAgJ3dlaWVycCc6ODQ3MiwgXG4gICdpbWFnZSc6ODQ2NSwgXG4gICdyZWFsJzo4NDc2LCBcbiAgJ3RyYWRlJzo4NDgyLCBcbiAgJ2FsZWZzeW0nOjg1MDEsIFxuICAnbGFycic6ODU5MiwgXG4gICd1YXJyJzo4NTkzLCBcbiAgJ3JhcnInOjg1OTQsIFxuICAnZGFycic6ODU5NSwgXG4gICdoYXJyJzo4NTk2LCBcbiAgJ2NyYXJyJzo4NjI5LCBcbiAgJ2xBcnInOjg2NTYsIFxuICAndUFycic6ODY1NywgXG4gICdyQXJyJzo4NjU4LCBcbiAgJ2RBcnInOjg2NTksIFxuICAnaEFycic6ODY2MCwgXG4gICdmb3JhbGwnOjg3MDQsIFxuICAncGFydCc6ODcwNiwgXG4gICdleGlzdCc6ODcwNywgXG4gICdlbXB0eSc6ODcwOSwgXG4gICduYWJsYSc6ODcxMSwgXG4gICdpc2luJzo4NzEyLCBcbiAgJ25vdGluJzo4NzEzLCBcbiAgJ25pJzo4NzE1LCBcbiAgJ3Byb2QnOjg3MTksIFxuICAnc3VtJzo4NzIxLCBcbiAgJ21pbnVzJzo4NzIyLCBcbiAgJ2xvd2FzdCc6ODcyNywgXG4gICdyYWRpYyc6ODczMCwgXG4gICdwcm9wJzo4NzMzLCBcbiAgJ2luZmluJzo4NzM0LCBcbiAgJ2FuZyc6ODczNiwgXG4gICdhbmQnOjg3NDMsIFxuICAnb3InOjg3NDQsIFxuICAnY2FwJzo4NzQ1LCBcbiAgJ2N1cCc6ODc0NiwgXG4gICdpbnQnOjg3NDcsIFxuICAndGhlcmU0Jzo4NzU2LCBcbiAgJ3NpbSc6ODc2NCwgXG4gICdjb25nJzo4NzczLCBcbiAgJ2FzeW1wJzo4Nzc2LCBcbiAgJ25lJzo4ODAwLCBcbiAgJ2VxdWl2Jzo4ODAxLCBcbiAgJ2xlJzo4ODA0LCBcbiAgJ2dlJzo4ODA1LCBcbiAgJ3N1Yic6ODgzNCwgXG4gICdzdXAnOjg4MzUsIFxuICAnbnN1Yic6ODgzNiwgXG4gICdzdWJlJzo4ODM4LCBcbiAgJ3N1cGUnOjg4MzksIFxuICAnb3BsdXMnOjg4NTMsIFxuICAnb3RpbWVzJzo4ODU1LCBcbiAgJ3BlcnAnOjg4NjksIFxuICAnc2RvdCc6ODkwMSwgXG4gICdsY2VpbCc6ODk2OCwgXG4gICdyY2VpbCc6ODk2OSwgXG4gICdsZmxvb3InOjg5NzAsIFxuICAncmZsb29yJzo4OTcxLCBcbiAgJ2xhbmcnOjkwMDEsIFxuICAncmFuZyc6OTAwMiwgXG4gICdsb3onOjk2NzQsIFxuICAnc3BhZGVzJzo5ODI0LCBcbiAgJ2NsdWJzJzo5ODI3LCBcbiAgJ2hlYXJ0cyc6OTgyOSwgXG4gICdkaWFtcyc6OTgzMCwgXG4gICdPRWxpZyc6MzM4LCBcbiAgJ29lbGlnJzozMzksIFxuICAnU2Nhcm9uJzozNTIsIFxuICAnc2Nhcm9uJzozNTMsIFxuICAnWXVtbCc6Mzc2LCBcbiAgJ2NpcmMnOjcxMCwgXG4gICd0aWxkZSc6NzMyLCBcbiAgJ2Vuc3AnOjgxOTQsIFxuICAnZW1zcCc6ODE5NSwgXG4gICd0aGluc3AnOjgyMDEsIFxuICAnenduaic6ODIwNCwgXG4gICd6d2onOjgyMDUsIFxuICAnbHJtJzo4MjA2LCBcbiAgJ3JsbSc6ODIwNywgXG4gICduZGFzaCc6ODIxMSwgXG4gICdtZGFzaCc6ODIxMiwgXG4gICdsc3F1byc6ODIxNiwgXG4gICdyc3F1byc6ODIxNywgXG4gICdzYnF1byc6ODIxOCwgXG4gICdsZHF1byc6ODIyMCwgXG4gICdyZHF1byc6ODIyMSwgXG4gICdiZHF1byc6ODIyMiwgXG4gICdkYWdnZXInOjgyMjQsIFxuICAnRGFnZ2VyJzo4MjI1LCBcbiAgJ3Blcm1pbCc6ODI0MCwgXG4gICdsc2FxdW8nOjgyNDksIFxuICAncnNhcXVvJzo4MjUwLCBcbiAgJ2V1cm8nOjgzNjRcbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzICA9IGVudGl0aWVzOyIsIi8vIHNpbXBsZXN0IGV2ZW50IGVtaXR0ZXIgNjAgbGluZXNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbnZhciBzbGljZSA9IFtdLnNsaWNlLCBfID0gcmVxdWlyZShcIi4uL3V0aWwuanNcIik7XG52YXIgYnVpbGRpbiA9IFsnJGluamVjdCcsIFwiJGluaXRcIiwgXCIkZGVzdHJveVwiLCBcIiR1cGRhdGVcIl07XG52YXIgQVBJID0ge1xuICAgICRvbjogZnVuY3Rpb24oZXZlbnQsIGZuKSB7XG4gICAgICAgIGlmKHR5cGVvZiBldmVudCA9PT0gXCJvYmplY3RcIil7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kb24oaSwgZXZlbnRbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIC8vIEBwYXRjaDogZm9yIGxpc3RcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgICAgICAgIHZhciBoYW5kbGVzID0gY29udGV4dC5faGFuZGxlcyB8fCAoY29udGV4dC5faGFuZGxlcyA9IHt9KSxcbiAgICAgICAgICAgICAgICBjYWxscyA9IGhhbmRsZXNbZXZlbnRdIHx8IChoYW5kbGVzW2V2ZW50XSA9IFtdKTtcbiAgICAgICAgICAgIGNhbGxzLnB1c2goZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgJG9mZjogZnVuY3Rpb24oZXZlbnQsIGZuKSB7XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgICAgaWYoIWNvbnRleHQuX2hhbmRsZXMpIHJldHVybjtcbiAgICAgICAgaWYoIWV2ZW50KSB0aGlzLl9oYW5kbGVzID0ge307XG4gICAgICAgIHZhciBoYW5kbGVzID0gY29udGV4dC5faGFuZGxlcyxcbiAgICAgICAgICAgIGNhbGxzO1xuXG4gICAgICAgIGlmIChjYWxscyA9IGhhbmRsZXNbZXZlbnRdKSB7XG4gICAgICAgICAgICBpZiAoIWZuKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlc1tldmVudF0gPSBbXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxscy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChmbiA9PT0gY2FsbHNbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udGV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgfSxcbiAgICAvLyBidWJibGUgZXZlbnRcbiAgICAkZW1pdDogZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAvLyBAcGF0Y2g6IGZvciBsaXN0XG4gICAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgICAgdmFyIGhhbmRsZXMgPSBjb250ZXh0Ll9oYW5kbGVzLCBjYWxscywgYXJncywgdHlwZTtcbiAgICAgICAgaWYoIWV2ZW50KSByZXR1cm47XG4gICAgICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICB2YXIgdHlwZSA9IGV2ZW50O1xuXG4gICAgICAgIGlmKCFoYW5kbGVzKSByZXR1cm4gY29udGV4dDtcbiAgICAgICAgLy8gQGRlcHJlY2F0ZWQgMC4zLjBcbiAgICAgICAgLy8gd2lsbCBiZSByZW1vdmVkIHdoZW4gY29tcGxldGVseSByZW1vdmUgdGhlIG9sZCBldmVudHMoJ2Rlc3Ryb3knICdpbml0Jykgc3VwcG9ydFxuXG4gICAgICAgIC8qQHJlbW92ZSAwLjQuMCovXG4gICAgICAgIHZhciBpc0J1aWxkaW4gPSB+YnVpbGRpbi5pbmRleE9mKHR5cGUpO1xuICAgICAgICBpZihjYWxscyA9IGhhbmRsZXNbdHlwZS5zbGljZSgxKV0pe1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGxlbiA9IGNhbGxzLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICAgICAgY2FsbHNbal0uYXBwbHkoY29udGV4dCwgYXJncylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKi9yZW1vdmUqL1xuXG4gICAgICAgIGlmICghKGNhbGxzID0gaGFuZGxlc1t0eXBlXSkpIHJldHVybiBjb250ZXh0O1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGNhbGxzW2ldLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYoY2FsbHMubGVuZ3RoKSBjb250ZXh0LiR1cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQ7XG4gICAgfSxcbiAgICAvLyBjYXB0dXJlICBldmVudFxuICAgICRicm9hZGNhc3Q6IGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgIH1cbn1cbi8vIGNvbnRhaW5lciBjbGFzc1xuZnVuY3Rpb24gRXZlbnQoKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoKSB0aGlzLiRvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXy5leHRlbmQoRXZlbnQucHJvdG90eXBlLCBBUEkpXG5cbkV2ZW50Lm1peFRvID0gZnVuY3Rpb24ob2JqKXtcbiAgb2JqID0gdHlwZW9mIG9iaiA9PT0gXCJmdW5jdGlvblwiID8gb2JqLnByb3RvdHlwZSA6IG9iajtcbiAgXy5leHRlbmQob2JqLCBBUEkpXG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50OyIsIi8vIChjKSAyMDEwLTIwMTQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vIEJhY2tib25lIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuLy8gRm9yIGFsbCBkZXRhaWxzIGFuZCBkb2N1bWVudGF0aW9uOlxuLy8gaHR0cDovL2JhY2tib25lanMub3JnXG5cbi8vIGtsYXNzOiBhIGNsYXNzaWNhbCBKUyBPT1AgZmHDp2FkZVxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2RlZC9rbGFzc1xuLy8gTGljZW5zZSBNSVQgKGMpIER1c3RpbiBEaWF6IDIwMTRcbiAgXG4vLyBpbnNwaXJlZCBieSBiYWNrYm9uZSdzIGV4dGVuZCBhbmQga2xhc3NcbnZhciBfID0gcmVxdWlyZShcIi4uL3V0aWwuanNcIiksXG4gIGZuVGVzdCA9IC94eS8udGVzdChmdW5jdGlvbigpe1wieHlcIjt9KSA/IC9cXGJzdXByXFxiLzovLiovLFxuICBpc0ZuID0gZnVuY3Rpb24obyl7cmV0dXJuIHR5cGVvZiBvID09PSBcImZ1bmN0aW9uXCJ9O1xuXG5cbmZ1bmN0aW9uIHdyYXAoaywgZm4sIHN1cHJvKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRtcCA9IHRoaXMuc3VwcjtcbiAgICB0aGlzLnN1cHIgPSBzdXByb1trXTtcbiAgICB2YXIgcmV0ID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnN1cHIgPSB0bXA7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzKCB3aGF0LCBvLCBzdXBybyApIHtcbiAgZm9yICggdmFyIGsgaW4gbyApIHtcbiAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShrKSkge1xuXG4gICAgICB3aGF0W2tdID0gaXNGbiggb1trXSApICYmIGlzRm4oIHN1cHJvW2tdICkgJiYgXG4gICAgICAgIGZuVGVzdC50ZXN0KCBvW2tdICkgPyB3cmFwKGssIG9ba10sIHN1cHJvKSA6IG9ba107XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKG8pe1xuICBvID0gbyB8fCB7fTtcbiAgdmFyIHN1cHIgPSB0aGlzLCBwcm90byxcbiAgICBzdXBybyA9IHN1cHIgJiYgc3Vwci5wcm90b3R5cGUgfHwge307XG4gIGlmKHR5cGVvZiBvID09PSAnZnVuY3Rpb24nKXtcbiAgICBwcm90byA9IG8ucHJvdG90eXBlO1xuICAgIG8uaW1wbGVtZW50ID0gaW1wbGVtZW50O1xuICAgIG8uZXh0ZW5kID0gZXh0ZW5kO1xuICAgIHJldHVybiBvO1xuICB9IFxuICBcbiAgZnVuY3Rpb24gZm4oKSB7XG4gICAgc3Vwci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcHJvdG8gPSBfLmNyZWF0ZVByb3RvKGZuLCBzdXBybyk7XG5cbiAgZnVuY3Rpb24gaW1wbGVtZW50KG8pe1xuICAgIHByb2Nlc3MocHJvdG8sIG8sIHN1cHJvKTsgXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuXG5cbiAgZm4uaW1wbGVtZW50ID0gaW1wbGVtZW50XG4gIGZuLmltcGxlbWVudChvKVxuICBpZihzdXByLl9fYWZ0ZXJfXykgc3Vwci5fX2FmdGVyX18uY2FsbChmbiwgc3Vwciwgbyk7XG4gIGZuLmV4dGVuZCA9IGV4dGVuZDtcbiAgcmV0dXJuIGZuO1xufVxuXG4iLCJ2YXIgZXhwckNhY2hlID0gcmVxdWlyZSgnLi4vZW52JykuZXhwckNhY2hlO1xudmFyIF8gPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcbnZhciBQYXJzZXIgPSByZXF1aXJlKFwiLi4vcGFyc2VyL1BhcnNlci5qc1wiKTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBleHByZXNzaW9uOiBmdW5jdGlvbihleHByLCBzaW1wbGUpe1xuICAgIC8vIEBUT0RPIGNhY2hlXG4gICAgaWYoIHR5cGVvZiBleHByID09PSAnc3RyaW5nJyAmJiAoIGV4cHIgPSBleHByLnRyaW0oKSApICl7XG4gICAgICBleHByID0gZXhwckNhY2hlLmdldCggZXhwciApIHx8IGV4cHJDYWNoZS5zZXQoIGV4cHIsIG5ldyBQYXJzZXIoIGV4cHIsIHsgc3RhdGU6ICdKU1QnLCBtb2RlOiAyIH0gKS5leHByZXNzaW9uKCkgKVxuICAgIH1cbiAgICBpZihleHByKSByZXR1cm4gXy50b3VjaEV4cHJlc3Npb24oIGV4cHIgKTtcbiAgfSxcbiAgcGFyc2U6IGZ1bmN0aW9uKHRlbXBsYXRlKXtcbiAgICByZXR1cm4gbmV3IFBhcnNlcih0ZW1wbGF0ZSkucGFyc2UoKTtcbiAgfVxufVxuXG4iLCIvLyBzaGltIGZvciBlczVcbnZhciBzbGljZSA9IFtdLnNsaWNlO1xudmFyIHRzdHIgPSAoe30pLnRvU3RyaW5nO1xuXG5mdW5jdGlvbiBleHRlbmQobzEsIG8yICl7XG4gIGZvcih2YXIgaSBpbiBvMikgaWYoIG8xW2ldID09PSB1bmRlZmluZWQpe1xuICAgIG8xW2ldID0gbzJbaV1cbiAgfVxufVxuXG4vLyBTdHJpbmcgcHJvdG8gO1xuZXh0ZW5kKFN0cmluZy5wcm90b3R5cGUsIHtcbiAgdHJpbTogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gIH1cbn0pO1xuXG5cbi8vIEFycmF5IHByb3RvO1xuZXh0ZW5kKEFycmF5LnByb3RvdHlwZSwge1xuICBpbmRleE9mOiBmdW5jdGlvbihvYmosIGZyb20pe1xuICAgIGZyb20gPSBmcm9tIHx8IDA7XG4gICAgZm9yICh2YXIgaSA9IGZyb20sIGxlbiA9IHRoaXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmICh0aGlzW2ldID09PSBvYmopIHJldHVybiBpO1xuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH0sXG4gIGZvckVhY2g6IGZ1bmN0aW9uKGNhbGxiYWNrLCBjb250ZXh0KXtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY2FsbGJhY2suY2FsbChjb250ZXh0LCB0aGlzW2ldLCBpLCB0aGlzKTtcbiAgICB9XG4gIH0sXG4gIGZpbHRlcjogZnVuY3Rpb24oY2FsbGJhY2ssIGNvbnRleHQpe1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gdGhpcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHBhc3MgPSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIHRoaXNbaV0sIGksIHRoaXMpO1xuICAgICAgaWYocGFzcykgcmVzLnB1c2godGhpc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH0sXG4gIG1hcDogZnVuY3Rpb24oY2FsbGJhY2ssIGNvbnRleHQpe1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gdGhpcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzLnB1c2goY2FsbGJhY2suY2FsbChjb250ZXh0LCB0aGlzW2ldLCBpLCB0aGlzKSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG4gIH1cbn0pO1xuXG4vLyBGdW5jdGlvbiBwcm90bztcbmV4dGVuZChGdW5jdGlvbi5wcm90b3R5cGUsIHtcbiAgYmluZDogZnVuY3Rpb24oY29udGV4dCl7XG4gICAgdmFyIGZuID0gdGhpcztcbiAgICB2YXIgcHJlQXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBhcmdzID0gcHJlQXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB9XG4gIH1cbn0pXG5cbi8vIE9iamVjdFxuZXh0ZW5kKE9iamVjdCwge1xuICBrZXlzOiBmdW5jdGlvbihvYmope1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yKHZhciBpIGluIG9iaikgaWYob2JqLmhhc093blByb3BlcnR5KGkpKXtcbiAgICAgIGtleXMucHVzaChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG4gIH0gXG59KVxuXG4vLyBEYXRlXG5leHRlbmQoRGF0ZSwge1xuICBub3c6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuICtuZXcgRGF0ZTtcbiAgfVxufSlcbi8vIEFycmF5XG5leHRlbmQoQXJyYXksIHtcbiAgaXNBcnJheTogZnVuY3Rpb24oYXJyKXtcbiAgICByZXR1cm4gdHN0ci5jYWxsKGFycikgPT09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgfVxufSlcbiIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbC5qcycpO1xudmFyIHBhcnNlRXhwcmVzc2lvbiA9IHJlcXVpcmUoJy4vcGFyc2UuanMnKS5leHByZXNzaW9uO1xuXG5cbmZ1bmN0aW9uIFdhdGNoZXIoKXt9XG5cbnZhciBtZXRob2RzID0ge1xuICAkd2F0Y2g6IGZ1bmN0aW9uKGV4cHIsIGZuLCBvcHRpb25zKXtcbiAgICB2YXIgZ2V0LCBvbmNlLCB0ZXN0LCBybGVuOyAvL3JlY29yZHMgbGVuZ3RoXG4gICAgaWYoIXRoaXMuX3dhdGNoZXJzKSB0aGlzLl93YXRjaGVycyA9IFtdO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIGlmKG9wdGlvbnMgPT09IHRydWUpe1xuICAgICAgIG9wdGlvbnMgPSB7IGRlZXA6IHRydWUgfVxuICAgIH1cbiAgICB2YXIgdWlkID0gXy51aWQoJ3dfJyk7XG4gICAgaWYoQXJyYXkuaXNBcnJheShleHByKSl7XG4gICAgICB2YXIgdGVzdHMgPSBbXTtcbiAgICAgIGZvcih2YXIgaSA9IDAsbGVuID0gZXhwci5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgICAgdGVzdHMucHVzaChwYXJzZUV4cHJlc3Npb24oZXhwcltpXSkuZ2V0KSBcbiAgICAgIH1cbiAgICAgIHZhciBwcmV2ID0gW107XG4gICAgICB0ZXN0ID0gZnVuY3Rpb24oY29udGV4dCl7XG4gICAgICAgIHZhciBlcXVhbCA9IHRydWU7XG4gICAgICAgIGZvcih2YXIgaSA9MCwgbGVuID0gdGVzdHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspe1xuICAgICAgICAgIHZhciBzcGxpY2UgPSB0ZXN0c1tpXShjb250ZXh0KTtcbiAgICAgICAgICBpZighXy5lcXVhbHMoc3BsaWNlLCBwcmV2W2ldKSl7XG4gICAgICAgICAgICAgZXF1YWwgPSBmYWxzZTtcbiAgICAgICAgICAgICBwcmV2W2ldID0gXy5jbG9uZShzcGxpY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXF1YWw/IGZhbHNlOiBwcmV2O1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgZXhwciA9IHRoaXMuJGV4cHJlc3Npb24/IHRoaXMuJGV4cHJlc3Npb24oZXhwcikgOiBwYXJzZUV4cHJlc3Npb24oZXhwcik7XG4gICAgICBnZXQgPSBleHByLmdldDtcbiAgICAgIG9uY2UgPSBleHByLm9uY2UgfHwgZXhwci5jb25zdGFudDtcbiAgICB9XG5cbiAgICB2YXIgd2F0Y2hlciA9IHtcbiAgICAgIGlkOiB1aWQsIFxuICAgICAgZ2V0OiBnZXQsIFxuICAgICAgZm46IGZuLCBcbiAgICAgIG9uY2U6IG9uY2UsIFxuICAgICAgZm9yY2U6IG9wdGlvbnMuZm9yY2UsXG4gICAgICB0ZXN0OiB0ZXN0LFxuICAgICAgZGVlcDogb3B0aW9ucy5kZWVwXG4gICAgfVxuICAgIFxuICAgIHRoaXMuX3dhdGNoZXJzLnB1c2goIHdhdGNoZXIgKTtcblxuICAgIHJsZW4gPSB0aGlzLl9yZWNvcmRzICYmIHRoaXMuX3JlY29yZHMubGVuZ3RoO1xuICAgIGlmKHJsZW4pIHRoaXMuX3JlY29yZHNbcmxlbi0xXS5wdXNoKHVpZClcbiAgICAvLyBpbml0IHN0YXRlLlxuICAgIGlmKG9wdGlvbnMuaW5pdCA9PT0gdHJ1ZSl7XG4gICAgICB0aGlzLiRwaGFzZSA9ICdkaWdlc3QnO1xuICAgICAgdGhpcy5fY2hlY2tTaW5nbGVXYXRjaCggd2F0Y2hlciwgdGhpcy5fd2F0Y2hlcnMubGVuZ3RoLTEgKTtcbiAgICAgIHRoaXMuJHBoYXNlID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHVpZDtcbiAgfSxcbiAgJHVud2F0Y2g6IGZ1bmN0aW9uKHVpZCl7XG4gICAgaWYoIXRoaXMuX3dhdGNoZXJzKSB0aGlzLl93YXRjaGVycyA9IFtdO1xuICAgIGlmKEFycmF5LmlzQXJyYXkodWlkKSl7XG4gICAgICBmb3IodmFyIGkgPTAsIGxlbiA9IHVpZC5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgIHRoaXMuJHVud2F0Y2godWlkW2ldKTtcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHZhciB3YXRjaGVycyA9IHRoaXMuX3dhdGNoZXJzLCB3YXRjaGVyLCB3bGVuO1xuICAgICAgaWYoIXVpZCB8fCAhd2F0Y2hlcnMgfHwgISh3bGVuID0gd2F0Y2hlcnMubGVuZ3RoKSkgcmV0dXJuO1xuICAgICAgZm9yKDt3bGVuLS07KXtcbiAgICAgICAgd2F0Y2hlciA9IHdhdGNoZXJzW3dsZW5dO1xuICAgICAgICBpZih3YXRjaGVyICYmIHdhdGNoZXIuaWQgPT09IHVpZCApe1xuICAgICAgICAgIHdhdGNoZXJzLnNwbGljZSh3bGVuLCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgLyoqXG4gICAqIHRoZSB3aG9sZSBkaWdlc3QgbG9vcCAsanVzdCBsaWtlIGFuZ3VsYXIsIGl0IGp1c3QgYSBkaXJ0eS1jaGVjayBsb29wO1xuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGggIG5vdyByZWd1bGFyIHByb2Nlc3MgYSBwdXJlIGRpcnR5LWNoZWNrIGxvb3AsIGJ1dCBpbiBwYXJzZSBwaGFzZSwgXG4gICAqICAgICAgICAgICAgICAgICAgUmVndWxhcidzIHBhcnNlciBleHRyYWN0IHRoZSBkZXBlbmRlbmNpZXMsIGluIGZ1dHVyZSBtYXliZSBpdCB3aWxsIGNoYW5nZSB0byBkaXJ0eS1jaGVjayBjb21iaW5lIHdpdGggcGF0aC1hd2FyZSB1cGRhdGU7XG4gICAqIEByZXR1cm4ge1ZvaWR9ICAgXG4gICAqL1xuXG4gICRkaWdlc3Q6IGZ1bmN0aW9uKCl7XG4gICAgaWYodGhpcy4kcGhhc2UgPT09ICdkaWdlc3QnKSByZXR1cm47XG4gICAgdGhpcy4kcGhhc2UgPSAnZGlnZXN0JztcbiAgICB2YXIgZGlydHkgPSBmYWxzZSwgbiA9MDtcbiAgICB3aGlsZShkaXJ0eSA9IHRoaXMuX2RpZ2VzdCgpKXtcblxuICAgICAgaWYoKCsrbikgPiAyMCl7IC8vIG1heCBsb29wXG4gICAgICAgIHRocm93ICd0aGVyZSBtYXkgYSBjaXJjdWxhciBkZXBlbmRlbmNpZXMgcmVhY2hlcycgXG4gICAgICB9XG4gICAgfVxuICAgIGlmKCBuID4gMCAmJiB0aGlzLiRlbWl0KSB0aGlzLiRlbWl0KFwiJHVwZGF0ZVwiKTtcbiAgICB0aGlzLiRwaGFzZSA9IG51bGw7XG4gIH0sXG4gIC8vIHByaXZhdGUgZGlnZXN0IGxvZ2ljXG4gIF9kaWdlc3Q6IGZ1bmN0aW9uKCl7XG4gICAgLy8gaWYodGhpcy5jb250ZXh0KSByZXR1cm4gdGhpcy5jb250ZXh0LiRkaWdlc3QoKTtcbiAgICAvLyBpZih0aGlzLiRlbWl0KSB0aGlzLiRlbWl0KCdkaWdlc3QnKTtcbiAgICB2YXIgd2F0Y2hlcnMgPSB0aGlzLl93YXRjaGVycztcbiAgICB2YXIgZGlydHkgPSBmYWxzZSwgY2hpbGRyZW4sIHdhdGNoZXIsIHdhdGNoZXJEaXJ0eTtcbiAgICBpZih3YXRjaGVycyAmJiB3YXRjaGVycy5sZW5ndGgpe1xuICAgICAgZm9yKHZhciBpID0gMCwgbGVuID0gd2F0Y2hlcnMubGVuZ3RoO2kgPCBsZW47IGkrKyl7XG4gICAgICAgIHdhdGNoZXIgPSB3YXRjaGVyc1tpXTtcbiAgICAgICAgd2F0Y2hlckRpcnR5ID0gdGhpcy5fY2hlY2tTaW5nbGVXYXRjaCh3YXRjaGVyLCBpKTtcbiAgICAgICAgaWYod2F0Y2hlckRpcnR5KSBkaXJ0eSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIGNoZWNrIGNoaWxkcmVuJ3MgZGlydHkuXG4gICAgY2hpbGRyZW4gPSB0aGlzLl9jaGlsZHJlbjtcbiAgICBpZihjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGgpe1xuICAgICAgZm9yKHZhciBtID0gMCwgbWxlbiA9IGNoaWxkcmVuLmxlbmd0aDsgbSA8IG1sZW47IG0rKyl7XG4gICAgICAgIGlmKGNoaWxkcmVuW21dLl9kaWdlc3QoKSkgZGlydHkgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlydHk7XG4gIH0sXG4gIC8vIGNoZWNrIGEgc2luZ2xlIG9uZSB3YXRjaGVyIFxuICBfY2hlY2tTaW5nbGVXYXRjaDogZnVuY3Rpb24od2F0Y2hlciwgaSl7XG4gICAgdmFyIGRpcnR5ID0gZmFsc2U7XG4gICAgaWYoIXdhdGNoZXIpIHJldHVybjtcbiAgICBpZih3YXRjaGVyLnRlc3QpIHsgLy9tdWx0aSBcbiAgICAgIHZhciByZXN1bHQgPSB3YXRjaGVyLnRlc3QodGhpcyk7XG4gICAgICBpZihyZXN1bHQpe1xuICAgICAgICBkaXJ0eSA9IHRydWU7XG4gICAgICAgIHdhdGNoZXIuZm4uYXBwbHkodGhpcywgcmVzdWx0KVxuICAgICAgfVxuICAgIH1lbHNle1xuXG4gICAgICB2YXIgbm93ID0gd2F0Y2hlci5nZXQodGhpcyk7XG4gICAgICB2YXIgbGFzdCA9IHdhdGNoZXIubGFzdDtcbiAgICAgIHZhciBlcSA9IHRydWU7XG5cbiAgICAgIGlmKF8udHlwZU9mKCBub3cgKSA9PT0gJ29iamVjdCcgJiYgd2F0Y2hlci5kZWVwKXtcbiAgICAgICAgaWYoIXdhdGNoZXIubGFzdCl7XG4gICAgICAgICAgIGVxID0gZmFsc2U7XG4gICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBmb3IodmFyIGogaW4gbm93KXtcbiAgICAgICAgICAgIGlmKHdhdGNoZXIubGFzdFtqXSAhPT0gbm93W2pdKXtcbiAgICAgICAgICAgICAgZXEgPSBmYWxzZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKGVxICE9PSBmYWxzZSl7XG4gICAgICAgICAgICBmb3IodmFyIG4gaW4gbGFzdCl7XG4gICAgICAgICAgICAgIGlmKGxhc3Rbbl0gIT09IG5vd1tuXSl7XG4gICAgICAgICAgICAgICAgZXEgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIGVxID0gXy5lcXVhbHMobm93LCB3YXRjaGVyLmxhc3QpO1xuICAgICAgfVxuICAgICAgaWYoZXEgPT09IGZhbHNlIHx8IHdhdGNoZXIuZm9yY2UpeyAvLyBpbiBzb21lIGNhc2UuIGlmIHVuZGVmaW5lZCwgd2UgbXVzdCBmb3JjZSBkaWdlc3QuXG4gICAgICAgIGVxID0gZmFsc2U7XG4gICAgICAgIHdhdGNoZXIuZm9yY2UgPSBudWxsO1xuICAgICAgICBkaXJ0eSA9IHRydWU7XG4gICAgICAgIHdhdGNoZXIuZm4uY2FsbCh0aGlzLCBub3csIHdhdGNoZXIubGFzdCk7XG4gICAgICAgIGlmKHR5cGVvZiBub3cgIT09ICdvYmplY3QnfHwgd2F0Y2hlci5kZWVwKXtcbiAgICAgICAgICB3YXRjaGVyLmxhc3QgPSBfLmNsb25lKG5vdyk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHdhdGNoZXIubGFzdCA9IG5vdztcbiAgICAgICAgfVxuICAgICAgfWVsc2V7IC8vIGlmIGVxID09IHRydWVcbiAgICAgICAgaWYoIF8udHlwZU9mKGVxKSA9PT0gJ2FycmF5JyAmJiBlcS5sZW5ndGggKXtcbiAgICAgICAgICB3YXRjaGVyLmxhc3QgPSBfLmNsb25lKG5vdyk7XG4gICAgICAgICAgd2F0Y2hlci5mbi5jYWxsKHRoaXMsIG5vdywgZXEpO1xuICAgICAgICAgIGRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZXEgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBAVE9ET1xuICAgICAgaWYoZGlydHkgJiYgd2F0Y2hlci5vbmNlKSB0aGlzLl93YXRjaGVycy5zcGxpY2UoaSwgMSk7XG5cbiAgICAgIHJldHVybiBkaXJ0eTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqICoqdGlwcyoqOiB3aGF0ZXZlciBwYXJhbSB5b3UgcGFzc2VkIGluICR1cGRhdGUsIGFmdGVyIHRoZSBmdW5jdGlvbiBjYWxsZWQsIGRpcnR5LWNoZWNrKGRpZ2VzdCkgcGhhc2Ugd2lsbCBlbnRlcjtcbiAgICogXG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufFN0cmluZ3xFeHByZXNzaW9ufSBwYXRoICBcbiAgICogQHBhcmFtICB7V2hhdGV2ZXJ9IHZhbHVlIG9wdGlvbmFsLCB3aGVuIHBhdGggaXMgRnVuY3Rpb24sIHRoZSB2YWx1ZSBpcyBpZ25vcmVkXG4gICAqIEByZXR1cm4ge3RoaXN9ICAgICB0aGlzIFxuICAgKi9cbiAgJHVwZGF0ZTogZnVuY3Rpb24ocGF0aCwgdmFsdWUpe1xuICAgIGlmKHBhdGggIT0gbnVsbCl7XG4gICAgICB2YXIgdHlwZSA9IF8udHlwZU9mKHBhdGgpO1xuICAgICAgaWYoIHR5cGUgPT09ICdzdHJpbmcnIHx8IHBhdGgudHlwZSA9PT0gJ2V4cHJlc3Npb24nICl7XG4gICAgICAgIHBhdGggPSBwYXJzZUV4cHJlc3Npb24ocGF0aCk7XG4gICAgICAgIHBhdGguc2V0KHRoaXMsIHZhbHVlKTtcbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdmdW5jdGlvbicpe1xuICAgICAgICBwYXRoLmNhbGwodGhpcywgdGhpcy5kYXRhKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBmb3IodmFyIGkgaW4gcGF0aCkge1xuICAgICAgICAgIGlmKHBhdGguaGFzT3duUHJvcGVydHkoaSkpe1xuICAgICAgICAgICAgdGhpcy5kYXRhW2ldID0gcGF0aFtpXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYodGhpcy4kcm9vdCkgdGhpcy4kcm9vdC4kZGlnZXN0KClcbiAgfSxcbiAgLy8gYXV0byBjb2xsZWN0IHdhdGNoZXJzIGZvciBsb2dpYy1jb250cm9sLlxuICBfcmVjb3JkOiBmdW5jdGlvbigpe1xuICAgIGlmKCF0aGlzLl9yZWNvcmRzKSB0aGlzLl9yZWNvcmRzID0gW107XG4gICAgdGhpcy5fcmVjb3Jkcy5wdXNoKFtdKTtcbiAgfSxcbiAgX3JlbGVhc2U6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuX3JlY29yZHMucG9wKCk7XG4gIH1cbn1cblxuXG5fLmV4dGVuZChXYXRjaGVyLnByb3RvdHlwZSwgbWV0aG9kcylcblxuXG5XYXRjaGVyLm1peFRvID0gZnVuY3Rpb24ob2JqKXtcbiAgb2JqID0gdHlwZW9mIG9iaiA9PT0gXCJmdW5jdGlvblwiID8gb2JqLnByb3RvdHlwZSA6IG9iajtcbiAgcmV0dXJuIF8uZXh0ZW5kKG9iaiwgbWV0aG9kcylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXYXRjaGVyOyIsInZhciBfID0gcmVxdWlyZShcIi4uL3V0aWwuanNcIik7XG52YXIgY29uZmlnID0gcmVxdWlyZShcIi4uL2NvbmZpZy5qc1wiKTtcblxuLy8gc29tZSBjdXN0b20gdGFnICB3aWxsIGNvbmZsaWN0IHdpdGggdGhlIExleGVyIHByb2dyZXNzXG52YXIgY29uZmxpY3RUYWcgPSB7XCJ9XCI6IFwie1wiLCBcIl1cIjogXCJbXCJ9LCBtYXAxLCBtYXAyO1xuLy8gc29tZSBtYWNybyBmb3IgbGV4ZXJcbnZhciBtYWNybyA9IHtcbiAgJ05BTUUnOiAvKD86WzpfQS1aYS16XVstXFwuOl8wLTlBLVphLXpdKikvLFxuICAnSURFTlQnOiAvW1xcJF9BLVphLXpdW18wLTlBLVphLXpcXCRdKi8sXG4gICdTUEFDRSc6IC9bXFxyXFxuXFxmIF0vXG59XG5cblxudmFyIHRlc3QgPSAvYXwoYikvLmV4ZWMoXCJhXCIpO1xudmFyIHRlc3RTdWJDYXB1cmUgPSB0ZXN0ICYmIHRlc3RbMV0gPT09IHVuZGVmaW5lZD8gXG4gIGZ1bmN0aW9uKHN0cil7IHJldHVybiBzdHIgIT09IHVuZGVmaW5lZCB9XG4gIDpmdW5jdGlvbihzdHIpe3JldHVybiAhIXN0cn07XG5cbmZ1bmN0aW9uIHdyYXBIYW5kZXIoaGFuZGxlcil7XG4gIHJldHVybiBmdW5jdGlvbihhbGwpe1xuICAgIHJldHVybiB7dHlwZTogaGFuZGxlciwgdmFsdWU6IGFsbCB9XG4gIH1cbn1cblxuZnVuY3Rpb24gTGV4ZXIoaW5wdXQsIG9wdHMpe1xuICBpZihjb25mbGljdFRhZ1tjb25maWcuRU5EXSl7XG4gICAgdGhpcy5tYXJrU3RhcnQgPSBjb25mbGljdFRhZ1tjb25maWcuRU5EXTtcbiAgICB0aGlzLm1hcmtFbmQgPSBjb25maWcuRU5EO1xuICB9XG5cblxuICB0aGlzLmlucHV0ID0gKGlucHV0fHxcIlwiKS50cmltKCk7XG4gIHRoaXMub3B0cyA9IG9wdHMgfHwge307XG4gIHRoaXMubWFwID0gdGhpcy5vcHRzLm1vZGUgIT09IDI/ICBtYXAxOiBtYXAyO1xuICB0aGlzLnN0YXRlcyA9IFtcIklOSVRcIl07XG4gIGlmKHRoaXMub3B0cy5zdGF0ZSkgdGhpcy5zdGF0ZXMucHVzaCggdGhpcy5vcHRzLnN0YXRlICk7XG59XG5cbnZhciBsbyA9IExleGVyLnByb3RvdHlwZVxuXG5cbmxvLmxleCA9IGZ1bmN0aW9uKHN0cil7XG4gIHN0ciA9IChzdHIgfHwgdGhpcy5pbnB1dCkudHJpbSgpO1xuICB2YXIgdG9rZW5zID0gW10sIHNwbGl0LCB0ZXN0LG1sZW4sIHRva2VuLCBzdGF0ZTtcbiAgdGhpcy5pbnB1dCA9IHN0ciwgXG4gIHRoaXMubWFya3MgPSAwO1xuICAvLyBpbml0IHRoZSBwb3MgaW5kZXhcbiAgdGhpcy5pbmRleD0wO1xuICB2YXIgaSA9IDA7XG4gIHdoaWxlKHN0cil7XG4gICAgaSsrXG4gICAgc3RhdGUgPSB0aGlzLnN0YXRlKCk7XG4gICAgc3BsaXQgPSB0aGlzLm1hcFtzdGF0ZV0gXG4gICAgdGVzdCA9IHNwbGl0LlRSVU5LLmV4ZWMoc3RyKTtcbiAgICBpZighdGVzdCl7XG4gICAgICB0aGlzLmVycm9yKCdVbnJlY29naW5pemVkIFRva2VuJyk7XG4gICAgfVxuICAgIG1sZW4gPSB0ZXN0WzBdLmxlbmd0aDtcbiAgICBzdHIgPSBzdHIuc2xpY2UobWxlbilcbiAgICB0b2tlbiA9IHRoaXMuX3Byb2Nlc3MuY2FsbCh0aGlzLCB0ZXN0LCBzcGxpdCwgc3RyKVxuICAgIGlmKHRva2VuKSB0b2tlbnMucHVzaCh0b2tlbilcbiAgICB0aGlzLmluZGV4ICs9IG1sZW47XG4gICAgLy8gaWYoc3RhdGUgPT0gJ1RBRycgfHwgc3RhdGUgPT0gJ0pTVCcpIHN0ciA9IHRoaXMuc2tpcHNwYWNlKHN0cik7XG4gIH1cblxuICB0b2tlbnMucHVzaCh7dHlwZTogJ0VPRid9KTtcblxuICByZXR1cm4gdG9rZW5zO1xufVxuXG5sby5lcnJvciA9IGZ1bmN0aW9uKG1zZyl7XG4gIHRocm93IFwiUGFyc2UgRXJyb3I6IFwiICsgbXNnICsgICc6XFxuJyArIF8udHJhY2tFcnJvclBvcyh0aGlzLmlucHV0LCB0aGlzLmluZGV4KTtcbn1cblxubG8uX3Byb2Nlc3MgPSBmdW5jdGlvbihhcmdzLCBzcGxpdCxzdHIpe1xuICAvLyBjb25zb2xlLmxvZyhhcmdzLmpvaW4oXCIsXCIpLCB0aGlzLnN0YXRlKCkpXG4gIHZhciBsaW5rcyA9IHNwbGl0LmxpbmtzLCBtYXJjaGVkID0gZmFsc2UsIHRva2VuO1xuXG4gIGZvcih2YXIgbGVuID0gbGlua3MubGVuZ3RoLCBpPTA7aTxsZW4gO2krKyl7XG4gICAgdmFyIGxpbmsgPSBsaW5rc1tpXSxcbiAgICAgIGhhbmRsZXIgPSBsaW5rWzJdLFxuICAgICAgaW5kZXggPSBsaW5rWzBdO1xuICAgIC8vIGlmKGFyZ3NbNl0gPT09ICc+JyAmJiBpbmRleCA9PT0gNikgY29uc29sZS5sb2coJ2hhaGEnKVxuICAgIGlmKHRlc3RTdWJDYXB1cmUoYXJnc1tpbmRleF0pKSB7XG4gICAgICBtYXJjaGVkID0gdHJ1ZTtcbiAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICB0b2tlbiA9IGhhbmRsZXIuYXBwbHkodGhpcywgYXJncy5zbGljZShpbmRleCwgaW5kZXggKyBsaW5rWzFdKSlcbiAgICAgICAgaWYodG9rZW4pICB0b2tlbi5wb3MgPSB0aGlzLmluZGV4O1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmKCFtYXJjaGVkKXsgLy8gaW4gaWUgbHQ4IC4gc3ViIGNhcHR1cmUgaXMgXCJcIiBidXQgb250IFxuICAgIHN3aXRjaChzdHIuY2hhckF0KDApKXtcbiAgICAgIGNhc2UgXCI8XCI6XG4gICAgICAgIHRoaXMuZW50ZXIoXCJUQUdcIik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5lbnRlcihcIkpTVFwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0b2tlbjtcbn1cbmxvLmVudGVyID0gZnVuY3Rpb24oc3RhdGUpe1xuICB0aGlzLnN0YXRlcy5wdXNoKHN0YXRlKVxuICByZXR1cm4gdGhpcztcbn1cblxubG8uc3RhdGUgPSBmdW5jdGlvbigpe1xuICB2YXIgc3RhdGVzID0gdGhpcy5zdGF0ZXM7XG4gIHJldHVybiBzdGF0ZXNbc3RhdGVzLmxlbmd0aC0xXTtcbn1cblxubG8ubGVhdmUgPSBmdW5jdGlvbihzdGF0ZSl7XG4gIHZhciBzdGF0ZXMgPSB0aGlzLnN0YXRlcztcbiAgaWYoIXN0YXRlIHx8IHN0YXRlc1tzdGF0ZXMubGVuZ3RoLTFdID09PSBzdGF0ZSkgc3RhdGVzLnBvcCgpXG59XG5cblxuTGV4ZXIuc2V0dXAgPSBmdW5jdGlvbigpe1xuICBtYWNyby5FTkQgPSBjb25maWcuRU5EO1xuICBtYWNyby5CRUdJTiA9IGNvbmZpZy5CRUdJTjtcbiAgLy9cbiAgbWFwMSA9IGdlbk1hcChbXG4gICAgLy8gSU5JVFxuICAgIHJ1bGVzLkVOVEVSX0pTVCxcbiAgICBydWxlcy5FTlRFUl9UQUcsXG4gICAgcnVsZXMuVEVYVCxcblxuICAgIC8vVEFHXG4gICAgcnVsZXMuVEFHX05BTUUsXG4gICAgcnVsZXMuVEFHX09QRU4sXG4gICAgcnVsZXMuVEFHX0NMT1NFLFxuICAgIHJ1bGVzLlRBR19QVU5DSE9SLFxuICAgIHJ1bGVzLlRBR19FTlRFUl9KU1QsXG4gICAgcnVsZXMuVEFHX1VOUV9WQUxVRSxcbiAgICBydWxlcy5UQUdfU1RSSU5HLFxuICAgIHJ1bGVzLlRBR19TUEFDRSxcbiAgICBydWxlcy5UQUdfQ09NTUVOVCxcblxuICAgIC8vIEpTVFxuICAgIHJ1bGVzLkpTVF9PUEVOLFxuICAgIHJ1bGVzLkpTVF9DTE9TRSxcbiAgICBydWxlcy5KU1RfQ09NTUVOVCxcbiAgICBydWxlcy5KU1RfRVhQUl9PUEVOLFxuICAgIHJ1bGVzLkpTVF9JREVOVCxcbiAgICBydWxlcy5KU1RfU1BBQ0UsXG4gICAgcnVsZXMuSlNUX0xFQVZFLFxuICAgIHJ1bGVzLkpTVF9OVU1CRVIsXG4gICAgcnVsZXMuSlNUX1BVTkNIT1IsXG4gICAgcnVsZXMuSlNUX1NUUklORyxcbiAgICBydWxlcy5KU1RfQ09NTUVOVFxuICAgIF0pXG5cbiAgLy8gaWdub3JlZCB0aGUgdGFnLXJlbGF0aXZlIHRva2VuXG4gIG1hcDIgPSBnZW5NYXAoW1xuICAgIC8vIElOSVQgbm8gPCByZXN0cmljdFxuICAgIHJ1bGVzLkVOVEVSX0pTVDIsXG4gICAgcnVsZXMuVEVYVCxcbiAgICAvLyBKU1RcbiAgICBydWxlcy5KU1RfQ09NTUVOVCxcbiAgICBydWxlcy5KU1RfT1BFTixcbiAgICBydWxlcy5KU1RfQ0xPU0UsXG4gICAgcnVsZXMuSlNUX0VYUFJfT1BFTixcbiAgICBydWxlcy5KU1RfSURFTlQsXG4gICAgcnVsZXMuSlNUX1NQQUNFLFxuICAgIHJ1bGVzLkpTVF9MRUFWRSxcbiAgICBydWxlcy5KU1RfTlVNQkVSLFxuICAgIHJ1bGVzLkpTVF9QVU5DSE9SLFxuICAgIHJ1bGVzLkpTVF9TVFJJTkcsXG4gICAgcnVsZXMuSlNUX0NPTU1FTlRcbiAgICBdKVxufVxuXG5cbmZ1bmN0aW9uIGdlbk1hcChydWxlcyl7XG4gIHZhciBydWxlLCBtYXAgPSB7fSwgc2lnbjtcbiAgZm9yKHZhciBpID0gMCwgbGVuID0gcnVsZXMubGVuZ3RoOyBpIDwgbGVuIDsgaSsrKXtcbiAgICBydWxlID0gcnVsZXNbaV07XG4gICAgc2lnbiA9IHJ1bGVbMl0gfHwgJ0lOSVQnO1xuICAgICggbWFwW3NpZ25dIHx8IChtYXBbc2lnbl0gPSB7cnVsZXM6W10sIGxpbmtzOltdfSkgKS5ydWxlcy5wdXNoKHJ1bGUpO1xuICB9XG4gIHJldHVybiBzZXR1cChtYXApO1xufVxuXG5mdW5jdGlvbiBzZXR1cChtYXApe1xuICB2YXIgc3BsaXQsIHJ1bGVzLCB0cnVua3MsIGhhbmRsZXIsIHJlZywgcmV0YWluLCBydWxlO1xuICBmdW5jdGlvbiByZXBsYWNlRm4oYWxsLCBvbmUpe1xuICAgIHJldHVybiB0eXBlb2YgbWFjcm9bb25lXSA9PT0gJ3N0cmluZyc/IFxuICAgICAgXy5lc2NhcGVSZWdFeHAobWFjcm9bb25lXSkgXG4gICAgICA6IFN0cmluZyhtYWNyb1tvbmVdKS5zbGljZSgxLC0xKTtcbiAgfVxuXG4gIGZvcih2YXIgaSBpbiBtYXApe1xuXG4gICAgc3BsaXQgPSBtYXBbaV07XG4gICAgc3BsaXQuY3VySW5kZXggPSAxO1xuICAgIHJ1bGVzID0gc3BsaXQucnVsZXM7XG4gICAgdHJ1bmtzID0gW107XG5cbiAgICBmb3IodmFyIGogPSAwLGxlbiA9IHJ1bGVzLmxlbmd0aDsgajxsZW47IGorKyl7XG4gICAgICBydWxlID0gcnVsZXNbal07IFxuICAgICAgcmVnID0gcnVsZVswXTtcbiAgICAgIGhhbmRsZXIgPSBydWxlWzFdO1xuXG4gICAgICBpZih0eXBlb2YgaGFuZGxlciA9PT0gJ3N0cmluZycpe1xuICAgICAgICBoYW5kbGVyID0gd3JhcEhhbmRlcihoYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIGlmKF8udHlwZU9mKHJlZykgPT09ICdyZWdleHAnKSByZWcgPSByZWcudG9TdHJpbmcoKS5zbGljZSgxLCAtMSk7XG5cbiAgICAgIHJlZyA9IHJlZy5yZXBsYWNlKC9cXHsoXFx3KylcXH0vZywgcmVwbGFjZUZuKVxuICAgICAgcmV0YWluID0gXy5maW5kU3ViQ2FwdHVyZShyZWcpICsgMTsgXG4gICAgICBzcGxpdC5saW5rcy5wdXNoKFtzcGxpdC5jdXJJbmRleCwgcmV0YWluLCBoYW5kbGVyXSk7IFxuICAgICAgc3BsaXQuY3VySW5kZXggKz0gcmV0YWluO1xuICAgICAgdHJ1bmtzLnB1c2gocmVnKTtcbiAgICB9XG4gICAgc3BsaXQuVFJVTksgPSBuZXcgUmVnRXhwKFwiXig/OihcIiArIHRydW5rcy5qb2luKFwiKXwoXCIpICsgXCIpKVwiKVxuICB9XG4gIHJldHVybiBtYXA7XG59XG5cbnZhciBydWxlcyA9IHtcblxuICAvLyAxLiBJTklUXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIG1vZGUxJ3MgSlNUIEVOVEVSIFJVTEVcbiAgRU5URVJfSlNUOiBbL1teXFx4MDA8XSo/KD89e0JFR0lOfSkvLCBmdW5jdGlvbihhbGwpe1xuICAgIHRoaXMuZW50ZXIoJ0pTVCcpO1xuICAgIGlmKGFsbCkgcmV0dXJuIHt0eXBlOiAnVEVYVCcsIHZhbHVlOiBhbGx9XG4gIH1dLFxuXG4gIC8vIG1vZGUyJ3MgSlNUIEVOVEVSIFJVTEVcbiAgRU5URVJfSlNUMjogWy9bXlxceDAwXSo/KD89e0JFR0lOfSkvLCBmdW5jdGlvbihhbGwpe1xuICAgIHRoaXMuZW50ZXIoJ0pTVCcpO1xuICAgIGlmKGFsbCkgcmV0dXJuIHt0eXBlOiAnVEVYVCcsIHZhbHVlOiBhbGx9XG4gIH1dLFxuXG4gIEVOVEVSX1RBRzogWy9bXlxceDAwPD5dKj8oPz08KS8sIGZ1bmN0aW9uKGFsbCl7IFxuICAgIHRoaXMuZW50ZXIoJ1RBRycpO1xuICAgIGlmKGFsbCkgcmV0dXJuIHt0eXBlOiAnVEVYVCcsIHZhbHVlOiBhbGx9XG4gIH1dLFxuXG4gIFRFWFQ6IFsvW15cXHgwMF0rLywgJ1RFWFQnXSxcblxuICAvLyAyLiBUQUdcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgVEFHX05BTUU6IFsve05BTUV9LywgJ05BTUUnLCAnVEFHJ10sXG4gIFRBR19VTlFfVkFMVUU6IFsvW14mXCInPT48YFxcclxcblxcZiBdKy8sICdVTlEnLCAnVEFHJ10sXG5cbiAgVEFHX09QRU46IFsvPCh7TkFNRX0pXFxzKi8sIGZ1bmN0aW9uKGFsbCwgb25lKXtcbiAgICByZXR1cm4ge3R5cGU6ICdUQUdfT1BFTicsIHZhbHVlOiBvbmV9XG4gIH0sICdUQUcnXSxcbiAgVEFHX0NMT1NFOiBbLzxcXC8oe05BTUV9KVtcXHJcXG5cXGYgXSo+LywgZnVuY3Rpb24oYWxsLCBvbmUpe1xuICAgIHRoaXMubGVhdmUoKTtcbiAgICByZXR1cm4ge3R5cGU6ICdUQUdfQ0xPU0UnLCB2YWx1ZTogb25lIH1cbiAgfSwgJ1RBRyddLFxuXG4gICAgLy8gbW9kZTIncyBKU1QgRU5URVIgUlVMRVxuICBUQUdfRU5URVJfSlNUOiBbLyg/PXtCRUdJTn0pLywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVudGVyKCdKU1QnKTtcbiAgfSwgJ1RBRyddLFxuXG5cbiAgVEFHX1BVTkNIT1I6IFsvW1xcPlxcLz0mXS8sIGZ1bmN0aW9uKGFsbCl7XG4gICAgaWYoYWxsID09PSAnPicpIHRoaXMubGVhdmUoKTtcbiAgICByZXR1cm4ge3R5cGU6IGFsbCwgdmFsdWU6IGFsbCB9XG4gIH0sICdUQUcnXSxcbiAgVEFHX1NUUklORzogIFsgLycoW14nXSopJ3xcIihbXlwiXSopXCIvLCBmdW5jdGlvbihhbGwsIG9uZSwgdHdvKXsgLy9cIidcbiAgICB2YXIgdmFsdWUgPSBvbmUgfHwgdHdvIHx8IFwiXCI7XG5cbiAgICByZXR1cm4ge3R5cGU6ICdTVFJJTkcnLCB2YWx1ZTogdmFsdWV9XG4gIH0sICdUQUcnXSxcblxuICBUQUdfU1BBQ0U6IFsve1NQQUNFfSsvLCBudWxsLCAnVEFHJ10sXG4gIFRBR19DT01NRU5UOiBbLzxcXCEtLShbXlxceDAwXSo/KS0tXFw+LywgbnVsbCAsJ1RBRyddLFxuXG4gIC8vIDMuIEpTVFxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgSlNUX09QRU46IFsne0JFR0lOfSN7U1BBQ0V9Kih7SURFTlR9KScsIGZ1bmN0aW9uKGFsbCwgbmFtZSl7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdPUEVOJyxcbiAgICAgIHZhbHVlOiBuYW1lXG4gICAgfVxuICB9LCAnSlNUJ10sXG4gIEpTVF9MRUFWRTogWy97RU5EfS8sIGZ1bmN0aW9uKCl7XG4gICAgaWYoIXRoaXMubWFya0VuZCB8fCAhdGhpcy5tYXJrcyApe1xuICAgICAgdGhpcy5sZWF2ZSgnSlNUJyk7XG4gICAgICByZXR1cm4ge3R5cGU6ICdFTkQnfVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5tYXJrcy0tO1xuICAgICAgcmV0dXJuIHt0eXBlOiB0aGlzLm1hcmtFbmQsIHZhbHVlOiB0aGlzLm1hcmtFbmR9XG4gICAgfVxuICB9LCAnSlNUJ10sXG4gIEpTVF9DTE9TRTogWy97QkVHSU59XFxzKlxcLyh7SURFTlR9KVxccyp7RU5EfS8sIGZ1bmN0aW9uKGFsbCwgb25lKXtcbiAgICB0aGlzLmxlYXZlKCdKU1QnKTtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0NMT1NFJyxcbiAgICAgIHZhbHVlOiBvbmVcbiAgICB9XG4gIH0sICdKU1QnXSxcbiAgSlNUX0NPTU1FTlQ6IFsve0JFR0lOfVxcIShbXlxceDAwXSo/KVxcIXtFTkR9LywgZnVuY3Rpb24oKXtcbiAgICB0aGlzLmxlYXZlKCk7XG4gIH0sICdKU1QnXSxcbiAgSlNUX0VYUFJfT1BFTjogWyd7QkVHSU59JyxmdW5jdGlvbihhbGwsIG9uZSl7XG4gICAgaWYoYWxsID09PSB0aGlzLm1hcmtTdGFydCl7XG4gICAgICBpZih0aGlzLm1hcmtzKXtcbiAgICAgICAgcmV0dXJuIHt0eXBlOiB0aGlzLm1hcmtTdGFydCwgdmFsdWU6IHRoaXMubWFya1N0YXJ0IH07XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5tYXJrcysrO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgZXNjYXBlID0gb25lID09PSAnPSc7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdFWFBSX09QRU4nLFxuICAgICAgZXNjYXBlOiBlc2NhcGVcbiAgICB9XG4gIH0sICdKU1QnXSxcbiAgSlNUX0lERU5UOiBbJ3tJREVOVH0nLCAnSURFTlQnLCAnSlNUJ10sXG4gIEpTVF9TUEFDRTogWy9bIFxcclxcblxcZl0rLywgbnVsbCwgJ0pTVCddLFxuICBKU1RfUFVOQ0hPUjogWy9bPSFdPz09fFstPT48KypcXC8lXFwhXT9cXD18XFx8XFx8fCYmfFxcQFxcKHxcXC5cXC58WzxcXD5cXFtcXF1cXChcXClcXC1cXHxcXHt9XFwrXFwqXFwvJT86XFwuISxdLywgZnVuY3Rpb24oYWxsKXtcbiAgICByZXR1cm4geyB0eXBlOiBhbGwsIHZhbHVlOiBhbGwgfVxuICB9LCdKU1QnXSxcblxuICBKU1RfU1RSSU5HOiAgWyAvJyhbXiddKiknfFwiKFteXCJdKilcIi8sIGZ1bmN0aW9uKGFsbCwgb25lLCB0d28peyAvL1wiJ1xuICAgIHJldHVybiB7dHlwZTogJ1NUUklORycsIHZhbHVlOiBvbmUgfHwgdHdvIHx8IFwiXCJ9XG4gIH0sICdKU1QnXSxcbiAgSlNUX05VTUJFUjogWy8oPzpbMC05XSpcXC5bMC05XSt8WzAtOV0rKShlXFxkKyk/LywgZnVuY3Rpb24oYWxsKXtcbiAgICByZXR1cm4ge3R5cGU6ICdOVU1CRVInLCB2YWx1ZTogcGFyc2VGbG9hdChhbGwsIDEwKX07XG4gIH0sICdKU1QnXVxufVxuXG5cbi8vIHNldHVwIHdoZW4gZmlyc3QgY29uZmlnXG5MZXhlci5zZXR1cCgpO1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMZXhlcjtcblxuXG4iLCJ2YXIgXyA9IHJlcXVpcmUoXCIuLi91dGlsLmpzXCIpO1xudmFyIG5vZGUgPSByZXF1aXJlKFwiLi9ub2RlLmpzXCIpO1xudmFyIExleGVyID0gcmVxdWlyZShcIi4vTGV4ZXIuanNcIik7XG52YXIgdmFyTmFtZSA9IF8udmFyTmFtZTtcbnZhciBjdHhOYW1lID0gXy5jdHhOYW1lO1xudmFyIGlzUGF0aCA9IF8ubWFrZVByZWRpY2F0ZShcIlNUUklORyBJREVOVCBOVU1CRVJcIik7XG52YXIgaXNLZXlXb3JkID0gXy5tYWtlUHJlZGljYXRlKFwidHJ1ZSBmYWxzZSB1bmRlZmluZWQgbnVsbCB0aGlzIEFycmF5IERhdGUgSlNPTiBNYXRoIE5hTiBSZWdFeHAgZGVjb2RlVVJJIGRlY29kZVVSSUNvbXBvbmVudCBlbmNvZGVVUkkgZW5jb2RlVVJJQ29tcG9uZW50IHBhcnNlRmxvYXQgcGFyc2VJbnQgT2JqZWN0XCIpO1xuXG5cblxuXG5mdW5jdGlvbiBQYXJzZXIoaW5wdXQsIG9wdHMpe1xuICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gIHRoaXMudG9rZW5zID0gbmV3IExleGVyKGlucHV0LCBvcHRzKS5sZXgoKTtcbiAgdGhpcy5wb3MgPSAwO1xuICB0aGlzLm5vQ29tcHV0ZWQgPSAgb3B0cy5ub0NvbXB1dGVkO1xuICB0aGlzLmxlbmd0aCA9IHRoaXMudG9rZW5zLmxlbmd0aDtcbn1cblxuXG52YXIgb3AgPSBQYXJzZXIucHJvdG90eXBlO1xuXG5cbm9wLnBhcnNlID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5wb3MgPSAwO1xuICB2YXIgcmVzPSB0aGlzLnByb2dyYW0oKTtcbiAgaWYodGhpcy5sbCgpLnR5cGUgPT09ICdUQUdfQ0xPU0UnKXtcbiAgICB0aGlzLmVycm9yKFwiWW91IG1heSBnb3QgYSB1bmNsb3NlZCBUYWdcIilcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG5vcC5sbCA9ICBmdW5jdGlvbihrKXtcbiAgayA9IGsgfHwgMTtcbiAgaWYoayA8IDApIGsgPSBrICsgMTtcbiAgdmFyIHBvcyA9IHRoaXMucG9zICsgayAtIDE7XG4gIGlmKHBvcyA+IHRoaXMubGVuZ3RoIC0gMSl7XG4gICAgICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy5sZW5ndGgtMV07XG4gIH1cbiAgcmV0dXJuIHRoaXMudG9rZW5zW3Bvc107XG59XG4gIC8vIGxvb2thaGVhZFxub3AubGEgPSBmdW5jdGlvbihrKXtcbiAgcmV0dXJuICh0aGlzLmxsKGspIHx8ICcnKS50eXBlO1xufVxuXG5vcC5tYXRjaCA9IGZ1bmN0aW9uKHR5cGUsIHZhbHVlKXtcbiAgdmFyIGxsO1xuICBpZighKGxsID0gdGhpcy5lYXQodHlwZSwgdmFsdWUpKSl7XG4gICAgbGwgID0gdGhpcy5sbCgpO1xuICAgIHRoaXMuZXJyb3IoJ2V4cGVjdCBbJyArIHR5cGUgKyAodmFsdWUgPT0gbnVsbD8gJyc6JzonKyB2YWx1ZSkgKyAnXVwiIC0+IGdvdCBcIlsnICsgbGwudHlwZSArICh2YWx1ZT09bnVsbD8gJyc6JzonK2xsLnZhbHVlKSArICddJywgbGwucG9zKVxuICB9ZWxzZXtcbiAgICByZXR1cm4gbGw7XG4gIH1cbn1cblxub3AuZXJyb3IgPSBmdW5jdGlvbihtc2csIHBvcyl7XG4gIG1zZyA9ICBcIlBhcnNlIEVycm9yOiBcIiArIG1zZyArICAnOlxcbicgKyBfLnRyYWNrRXJyb3JQb3ModGhpcy5pbnB1dCwgdHlwZW9mIHBvcyA9PT0gJ251bWJlcic/IHBvczogdGhpcy5sbCgpLnBvc3x8MCk7XG4gIHRocm93IG5ldyBFcnJvcihtc2cpO1xufVxuXG5vcC5uZXh0ID0gZnVuY3Rpb24oayl7XG4gIGsgPSBrIHx8IDE7XG4gIHRoaXMucG9zICs9IGs7XG59XG5vcC5lYXQgPSBmdW5jdGlvbih0eXBlLCB2YWx1ZSl7XG4gIHZhciBsbCA9IHRoaXMubGwoKTtcbiAgaWYodHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnKXtcbiAgICBmb3IodmFyIGxlbiA9IHR5cGUubGVuZ3RoIDsgbGVuLS07KXtcbiAgICAgIGlmKGxsLnR5cGUgPT09IHR5cGVbbGVuXSkge1xuICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgcmV0dXJuIGxsO1xuICAgICAgfVxuICAgIH1cbiAgfWVsc2V7XG4gICAgaWYoIGxsLnR5cGUgPT09IHR5cGUgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbGwudmFsdWUgPT09IHZhbHVlKSApe1xuICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgIHJldHVybiBsbDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vLyBwcm9ncmFtXG4vLyAgOkVPRlxuLy8gIHwgKHN0YXRlbWVudCkqIEVPRlxub3AucHJvZ3JhbSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBzdGF0ZW1lbnRzID0gW10sICBsbCA9IHRoaXMubGwoKTtcbiAgd2hpbGUobGwudHlwZSAhPT0gJ0VPRicgJiYgbGwudHlwZSAhPT0nVEFHX0NMT1NFJyl7XG5cbiAgICBzdGF0ZW1lbnRzLnB1c2godGhpcy5zdGF0ZW1lbnQoKSk7XG4gICAgbGwgPSB0aGlzLmxsKCk7XG4gIH1cbiAgLy8gaWYobGwudHlwZSA9PT0gJ1RBR19DTE9TRScpIHRoaXMuZXJyb3IoXCJZb3UgbWF5IGhhdmUgdW5tYXRjaGVkIFRhZ1wiKVxuICByZXR1cm4gc3RhdGVtZW50cztcbn1cblxuLy8gc3RhdGVtZW50XG4vLyAgOiB4bWxcbi8vICB8IGpzdFxuLy8gIHwgdGV4dFxub3Auc3RhdGVtZW50ID0gZnVuY3Rpb24oKXtcbiAgdmFyIGxsID0gdGhpcy5sbCgpO1xuICBzd2l0Y2gobGwudHlwZSl7XG4gICAgY2FzZSAnTkFNRSc6XG4gICAgY2FzZSAnVEVYVCc6XG4gICAgICB2YXIgdGV4dCA9IGxsLnZhbHVlO1xuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICB3aGlsZShsbCA9IHRoaXMuZWF0KFsnTkFNRScsICdURVhUJ10pKXtcbiAgICAgICAgdGV4dCArPSBsbC52YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlLnRleHQodGV4dCk7XG4gICAgY2FzZSAnVEFHX09QRU4nOlxuICAgICAgcmV0dXJuIHRoaXMueG1sKCk7XG4gICAgY2FzZSAnT1BFTic6IFxuICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aXZlKCk7XG4gICAgY2FzZSAnRVhQUl9PUEVOJzpcbiAgICAgIHJldHVybiB0aGlzLmludGVycGxhdGlvbigpO1xuICAgIGNhc2UgJ1BBUlRfT1BFTic6XG4gICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZSgpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aGlzLmVycm9yKCdVbmV4cGVjdGVkIHRva2VuOiAnKyB0aGlzLmxhKCkpXG4gIH1cbn1cblxuLy8geG1sIFxuLy8gc3RhZyBzdGF0ZW1lbnQqIFRBR19DTE9TRT8oaWYgc2VsZi1jbG9zZWQgdGFnKVxub3AueG1sID0gZnVuY3Rpb24oKXtcbiAgdmFyIG5hbWUsIGF0dHJzLCBjaGlsZHJlbiwgc2VsZkNsb3NlZDtcbiAgbmFtZSA9IHRoaXMubWF0Y2goJ1RBR19PUEVOJykudmFsdWU7XG4gIGF0dHJzID0gdGhpcy5hdHRycygpO1xuICBzZWxmQ2xvc2VkID0gdGhpcy5lYXQoJy8nKVxuICB0aGlzLm1hdGNoKCc+Jyk7XG4gIGlmKCAhc2VsZkNsb3NlZCAmJiAhXy5pc1ZvaWRUYWcobmFtZSkgKXtcbiAgICBjaGlsZHJlbiA9IHRoaXMucHJvZ3JhbSgpO1xuICAgIGlmKCF0aGlzLmVhdCgnVEFHX0NMT1NFJywgbmFtZSkpIHRoaXMuZXJyb3IoJ2V4cGVjdCA8LycrbmFtZSsnPiBnb3QnKyAnbm8gbWF0Y2hlZCBjbG9zZVRhZycpXG4gIH1cbiAgcmV0dXJuIG5vZGUuZWxlbWVudChuYW1lLCBhdHRycywgY2hpbGRyZW4pO1xufVxuXG4vLyB4ZW50aXR5XG4vLyAgLXJ1bGUod3JhcCBhdHRyaWJ1dGUpXG4vLyAgLWF0dHJpYnV0ZVxuLy9cbi8vIF9fZXhhbXBsZV9fXG4vLyAgbmFtZSA9IDEgfCAgXG4vLyAgbmctaGlkZSB8XG4vLyAgb24tY2xpY2s9e3t9fSB8IFxuLy8gIHt7I2lmIG5hbWV9fW9uLWNsaWNrPXt7eHh9fXt7I2Vsc2V9fW9uLXRhcD17e319e3svaWZ9fVxuXG5vcC54ZW50aXR5ID0gZnVuY3Rpb24obGwpe1xuICB2YXIgbmFtZSA9IGxsLnZhbHVlLCB2YWx1ZTtcbiAgaWYobGwudHlwZSA9PT0gJ05BTUUnKXtcbiAgICBpZiggdGhpcy5lYXQoXCI9XCIpICkgdmFsdWUgPSB0aGlzLmF0dHZhbHVlKCk7XG4gICAgcmV0dXJuIG5vZGUuYXR0cmlidXRlKCBuYW1lLCB2YWx1ZSApO1xuICB9ZWxzZXtcbiAgICBpZiggbmFtZSAhPT0gJ2lmJykgdGhpcy5lcnJvcihcImN1cnJlbnQgdmVyc2lvbi4gT05MWSBSVUxFICNpZiAjZWxzZSAjZWxzZWlmIGlzIHZhbGlkIGluIHRhZywgdGhlIHJ1bGUgI1wiICsgbmFtZSArICcgaXMgaW52YWxpZCcpO1xuICAgIHJldHVybiB0aGlzWydpZiddKHRydWUpO1xuICB9XG5cbn1cblxuLy8gc3RhZyAgICAgOjo9ICAgICc8JyBOYW1lIChTIGF0dHIpKiBTPyAnPicgIFxuLy8gYXR0ciAgICA6Oj0gICAgIE5hbWUgRXEgYXR0dmFsdWVcbm9wLmF0dHJzID0gZnVuY3Rpb24oaXNBdHRyaWJ1dGUpe1xuICB2YXIgZWF0XG4gIGlmKCFpc0F0dHJpYnV0ZSl7XG4gICAgZWF0ID0gW1wiTkFNRVwiLCBcIk9QRU5cIl1cbiAgfWVsc2V7XG4gICAgZWF0ID0gW1wiTkFNRVwiXVxuICB9XG5cbiAgdmFyIGF0dHJzID0gW10sIGxsO1xuICB3aGlsZSAobGwgPSB0aGlzLmVhdChlYXQpKXtcbiAgICBhdHRycy5wdXNoKHRoaXMueGVudGl0eSggbGwgKSlcbiAgfVxuICByZXR1cm4gYXR0cnM7XG59XG5cbi8vIGF0dHZhbHVlXG4vLyAgOiBTVFJJTkcgIFxuLy8gIHwgTkFNRVxub3AuYXR0dmFsdWUgPSBmdW5jdGlvbigpe1xuICB2YXIgbGwgPSB0aGlzLmxsKCk7XG4gIHN3aXRjaChsbC50eXBlKXtcbiAgICBjYXNlIFwiTkFNRVwiOlxuICAgIGNhc2UgXCJVTlFcIjpcbiAgICBjYXNlIFwiU1RSSU5HXCI6XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIHZhciB2YWx1ZSA9IGxsLnZhbHVlO1xuICAgICAgaWYofnZhbHVlLmluZGV4T2YoJ3t7Jykpe1xuICAgICAgICB2YXIgY29uc3RhbnQgPSB0cnVlO1xuICAgICAgICB2YXIgcGFyc2VkID0gbmV3IFBhcnNlcih2YWx1ZSwgeyBtb2RlOiAyIH0pLnBhcnNlKCk7XG4gICAgICAgIGlmKHBhcnNlZC5sZW5ndGggPT09IDEgJiYgcGFyc2VkWzBdLnR5cGUgPT09ICdleHByZXNzaW9uJykgcmV0dXJuIHBhcnNlZFswXTtcbiAgICAgICAgdmFyIGJvZHkgPSBbXTtcbiAgICAgICAgcGFyc2VkLmZvckVhY2goZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgaWYoIWl0ZW0uY29uc3RhbnQpIGNvbnN0YW50PWZhbHNlO1xuICAgICAgICAgIGJvZHkucHVzaChpdGVtLmJvZHkgfHwgXCInXCIgKyBpdGVtLnRleHQgKyBcIidcIik7XG4gICAgICAgIH0pO1xuICAgICAgICBib2R5ID0gXCJbXCIgKyBib2R5LmpvaW4oXCIsXCIpICsgXCJdLmpvaW4oJycpXCI7XG4gICAgICAgIHZhbHVlID0gbm9kZS5leHByZXNzaW9uKGJvZHksIG51bGwsIGNvbnN0YW50KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICBjYXNlIFwiRVhQUl9PUEVOXCI6XG4gICAgICByZXR1cm4gdGhpcy5pbnRlcnBsYXRpb24oKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhpcy5lcnJvcignVW5leHBlY3RlZCB0b2tlbjogJysgdGhpcy5sYSgpKVxuICB9XG59XG5cblxuLy8ge3sjfX1cbm9wLmRpcmVjdGl2ZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBuYW1lID0gdGhpcy5sbCgpLnZhbHVlO1xuICB0aGlzLm5leHQoKTtcbiAgaWYodHlwZW9mIHRoaXNbbmFtZV0gPT09ICdmdW5jdGlvbicpe1xuICAgIHJldHVybiB0aGlzW25hbWVdKClcbiAgfWVsc2V7XG4gICAgdGhpcy5lcnJvcignVW5kZWZpbmVkIGRpcmVjdGl2ZVsnKyBuYW1lICsnXScpO1xuICB9XG59XG5cbi8vIHt7fX1cbm9wLmludGVycGxhdGlvbiA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMubWF0Y2goJ0VYUFJfT1BFTicpO1xuICB2YXIgcmVzID0gdGhpcy5leHByZXNzaW9uKHRydWUpO1xuICB0aGlzLm1hdGNoKCdFTkQnKTtcbiAgcmV0dXJuIHJlcztcbn1cblxuLy8ge3t+fX1cbm9wLmluY2x1ZGUgPSBmdW5jdGlvbigpe1xuICB2YXIgY29udGVudCA9IHRoaXMuZXhwcmVzc2lvbigpO1xuICB0aGlzLm1hdGNoKCdFTkQnKTtcbiAgcmV0dXJuIG5vZGUudGVtcGxhdGUoY29udGVudCk7XG59XG5cbi8vIHt7I2lmfX1cbm9wW1wiaWZcIl0gPSBmdW5jdGlvbih0YWcpe1xuICB2YXIgdGVzdCA9IHRoaXMuZXhwcmVzc2lvbigpO1xuICB2YXIgY29uc2VxdWVudCA9IFtdLCBhbHRlcm5hdGU9W107XG5cbiAgdmFyIGNvbnRhaW5lciA9IGNvbnNlcXVlbnQ7XG4gIHZhciBzdGF0ZW1lbnQgPSAhdGFnPyBcInN0YXRlbWVudFwiIDogXCJhdHRyc1wiO1xuXG4gIHRoaXMubWF0Y2goJ0VORCcpO1xuXG4gIHZhciBsbCwgY2xvc2U7XG4gIHdoaWxlKCAhIChjbG9zZSA9IHRoaXMuZWF0KCdDTE9TRScpKSApe1xuICAgIGxsID0gdGhpcy5sbCgpO1xuICAgIGlmKCBsbC50eXBlID09PSAnT1BFTicgKXtcbiAgICAgIHN3aXRjaCggbGwudmFsdWUgKXtcbiAgICAgICAgY2FzZSAnZWxzZSc6XG4gICAgICAgICAgY29udGFpbmVyID0gYWx0ZXJuYXRlO1xuICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgIHRoaXMubWF0Y2goICdFTkQnICk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Vsc2VpZic6XG4gICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgYWx0ZXJuYXRlLnB1c2goIHRoaXNbXCJpZlwiXSh0YWcpICk7XG4gICAgICAgICAgcmV0dXJuIG5vZGVbJ2lmJ10oIHRlc3QsIGNvbnNlcXVlbnQsIGFsdGVybmF0ZSApO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnRhaW5lci5wdXNoKCB0aGlzW3N0YXRlbWVudF0odHJ1ZSkgKTtcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGNvbnRhaW5lci5wdXNoKHRoaXNbc3RhdGVtZW50XSh0cnVlKSk7XG4gICAgfVxuICB9XG4gIC8vIGlmIHN0YXRlbWVudCBub3QgbWF0Y2hlZFxuICBpZihjbG9zZS52YWx1ZSAhPT0gXCJpZlwiKSB0aGlzLmVycm9yKCdVbm1hdGNoZWQgaWYgZGlyZWN0aXZlJylcbiAgcmV0dXJuIG5vZGVbXCJpZlwiXSh0ZXN0LCBjb25zZXF1ZW50LCBhbHRlcm5hdGUpO1xufVxuXG5cbi8vIEBtYXJrICAgbXVzdGFjaGUgc3ludGF4IGhhdmUgbmF0cnVyZSBkaXMsIGNhbm90IHdpdGggZXhwcmVzc2lvblxuLy8ge3sjbGlzdH19XG5vcC5saXN0ID0gZnVuY3Rpb24oKXtcbiAgLy8gc2VxdWVuY2UgY2FuIGJlIGEgbGlzdCBvciBoYXNoXG4gIHZhciBzZXF1ZW5jZSA9IHRoaXMuZXhwcmVzc2lvbigpLCB2YXJpYWJsZSwgbGw7XG4gIHZhciBjb25zZXF1ZW50ID0gW10sIGFsdGVybmF0ZT1bXTtcbiAgdmFyIGNvbnRhaW5lciA9IGNvbnNlcXVlbnQ7XG5cbiAgdGhpcy5tYXRjaCgnSURFTlQnLCAnYXMnKTtcblxuICB2YXJpYWJsZSA9IHRoaXMubWF0Y2goJ0lERU5UJykudmFsdWU7XG5cbiAgdGhpcy5tYXRjaCgnRU5EJyk7XG5cbiAgd2hpbGUoICEobGwgPSB0aGlzLmVhdCgnQ0xPU0UnKSkgKXtcbiAgICBpZih0aGlzLmVhdCgnT1BFTicsICdlbHNlJykpe1xuICAgICAgY29udGFpbmVyID0gIGFsdGVybmF0ZTtcbiAgICAgIHRoaXMubWF0Y2goJ0VORCcpO1xuICAgIH1lbHNle1xuICAgICAgY29udGFpbmVyLnB1c2godGhpcy5zdGF0ZW1lbnQoKSk7XG4gICAgfVxuICB9XG4gIGlmKGxsLnZhbHVlICE9PSAnbGlzdCcpIHRoaXMuZXJyb3IoJ2V4cGVjdCAnICsgJ3t7L2xpc3R9fSBnb3QgJyArICd7ey8nICsgbGwudmFsdWUgKyAnfX0nLCBsbC5wb3MgKTtcbiAgcmV0dXJuIG5vZGUubGlzdChzZXF1ZW5jZSwgdmFyaWFibGUsIGNvbnNlcXVlbnQsIGFsdGVybmF0ZSk7XG59XG5cblxub3AuZXhwcmVzc2lvbiA9IGZ1bmN0aW9uKCl7XG4gIHZhciBleHByZXNzaW9uO1xuICBpZih0aGlzLmVhdCgnQCgnKSl7IC8vb25jZSBiaW5kXG4gICAgZXhwcmVzc2lvbiA9IHRoaXMuZXhwcigpO1xuICAgIGV4cHJlc3Npb24ub25jZSA9IHRydWU7XG4gICAgdGhpcy5tYXRjaCgnKScpXG4gIH1lbHNle1xuICAgIGV4cHJlc3Npb24gPSB0aGlzLmV4cHIoKTtcbiAgfVxuICByZXR1cm4gZXhwcmVzc2lvbjtcbn1cblxub3AuZXhwciA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuZGVwZW5kID0gW107XG5cbiAgdmFyIGJ1ZmZlciA9IHRoaXMuZmlsdGVyKClcblxuICB2YXIgYm9keSA9IGJ1ZmZlci5nZXQgfHwgYnVmZmVyO1xuICB2YXIgc2V0Ym9keSA9IGJ1ZmZlci5zZXQ7XG4gIHJldHVybiBub2RlLmV4cHJlc3Npb24oYm9keSwgc2V0Ym9keSwgIXRoaXMuZGVwZW5kLmxlbmd0aCk7XG59XG5cblxuLy8gZmlsdGVyXG4vLyBhc3NpZ24gKCd8JyBmaWx0ZXJuYW1lWyc6JyBhcmdzXSkgKiBcbm9wLmZpbHRlciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBsZWZ0ID0gdGhpcy5hc3NpZ24oKTtcbiAgdmFyIGxsID0gdGhpcy5lYXQoJ3wnKTtcbiAgdmFyIGJ1ZmZlciwgYXR0cjtcbiAgaWYobGwpe1xuICAgIGJ1ZmZlciA9IFtcbiAgICAgIFwiKGZ1bmN0aW9uKCl7XCIsIFxuICAgICAgICAgIFwidmFyIFwiLCBhdHRyID0gXCJfZl9cIiwgXCI9XCIsIGxlZnQuZ2V0LCBcIjtcIl1cbiAgICBkb3tcblxuICAgICAgYnVmZmVyLnB1c2goYXR0ciArIFwiID0gXCIrY3R4TmFtZStcIi5fZl8oJ1wiICsgdGhpcy5tYXRjaCgnSURFTlQnKS52YWx1ZSsgXCInKShcIiArIGF0dHIpIDtcbiAgICAgIGlmKHRoaXMuZWF0KCc6Jykpe1xuICAgICAgICBidWZmZXIucHVzaChcIiwgXCIrIHRoaXMuYXJndW1lbnRzKFwifFwiKS5qb2luKFwiLFwiKSArIFwiKTtcIilcbiAgICAgIH1lbHNle1xuICAgICAgICBidWZmZXIucHVzaCgnKTsnKTtcbiAgICAgIH1cblxuICAgIH13aGlsZShsbCA9IHRoaXMuZWF0KCd8JykpO1xuICAgIGJ1ZmZlci5wdXNoKFwicmV0dXJuIFwiICsgYXR0ciArIFwifSkoKVwiKTtcbiAgICByZXR1cm4gdGhpcy5nZXRzZXQoYnVmZmVyLmpvaW4oXCJcIikpO1xuICB9XG4gIHJldHVybiBsZWZ0O1xufVxuXG4vLyBhc3NpZ25cbi8vIGxlZnQtaGFuZC1leHByID0gY29uZGl0aW9uXG5vcC5hc3NpZ24gPSBmdW5jdGlvbigpe1xuICB2YXIgbGVmdCA9IHRoaXMuY29uZGl0aW9uKCksIGxsO1xuICBpZihsbCA9IHRoaXMuZWF0KFsnPScsICcrPScsICctPScsICcqPScsICcvPScsICclPSddKSl7XG4gICAgaWYoIWxlZnQuc2V0KSB0aGlzLmVycm9yKCdpbnZhbGlkIGxlZnRoYW5kIGV4cHJlc3Npb24gaW4gYXNzaWdubWVudCBleHByZXNzaW9uJyk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0c2V0KCBsZWZ0LnNldC5yZXBsYWNlKFwiX3BfXCIsIHRoaXMuY29uZGl0aW9uKCkuZ2V0KS5yZXBsYWNlKFwiJz0nXCIsIFwiJ1wiK2xsLnR5cGUrXCInXCIpLCBsZWZ0LnNldCk7XG4gICAgLy8gcmV0dXJuIHRoaXMuZ2V0c2V0KCcoJyArIGxlZnQuZ2V0ICsgbGwudHlwZSAgKyB0aGlzLmNvbmRpdGlvbigpLmdldCArICcpJywgbGVmdC5zZXQpO1xuICB9XG4gIHJldHVybiBsZWZ0O1xufVxuXG4vLyBvclxuLy8gb3IgPyBhc3NpZ24gOiBhc3NpZ25cbm9wLmNvbmRpdGlvbiA9IGZ1bmN0aW9uKCl7XG5cbiAgdmFyIHRlc3QgPSB0aGlzLm9yKCk7XG4gIGlmKHRoaXMuZWF0KCc/Jykpe1xuICAgIHJldHVybiB0aGlzLmdldHNldChbdGVzdC5nZXQgKyBcIj9cIiwgXG4gICAgICB0aGlzLmFzc2lnbigpLmdldCwgXG4gICAgICB0aGlzLm1hdGNoKFwiOlwiKS50eXBlLCBcbiAgICAgIHRoaXMuYXNzaWduKCkuZ2V0XS5qb2luKFwiXCIpKTtcbiAgfVxuXG4gIHJldHVybiB0ZXN0O1xufVxuXG4vLyBhbmRcbi8vIGFuZCAmJiBvclxub3Aub3IgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBsZWZ0ID0gdGhpcy5hbmQoKTtcblxuICBpZih0aGlzLmVhdCgnfHwnKSl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0c2V0KGxlZnQuZ2V0ICsgJ3x8JyArIHRoaXMub3IoKS5nZXQpO1xuICB9XG5cbiAgcmV0dXJuIGxlZnQ7XG59XG4vLyBlcXVhbFxuLy8gZXF1YWwgJiYgYW5kXG5vcC5hbmQgPSBmdW5jdGlvbigpe1xuXG4gIHZhciBsZWZ0ID0gdGhpcy5lcXVhbCgpO1xuXG4gIGlmKHRoaXMuZWF0KCcmJicpKXtcbiAgICByZXR1cm4gdGhpcy5nZXRzZXQobGVmdC5nZXQgKyAnJiYnICsgdGhpcy5hbmQoKS5nZXQpO1xuICB9XG4gIHJldHVybiBsZWZ0O1xufVxuLy8gcmVsYXRpb25cbi8vIFxuLy8gZXF1YWwgPT0gcmVsYXRpb25cbi8vIGVxdWFsICE9IHJlbGF0aW9uXG4vLyBlcXVhbCA9PT0gcmVsYXRpb25cbi8vIGVxdWFsICE9PSByZWxhdGlvblxub3AuZXF1YWwgPSBmdW5jdGlvbigpe1xuICB2YXIgbGVmdCA9IHRoaXMucmVsYXRpb24oKSwgbGw7XG4gIC8vIEBwZXJmO1xuICBpZiggbGwgPSB0aGlzLmVhdChbJz09JywnIT0nLCAnPT09JywgJyE9PSddKSl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0c2V0KGxlZnQuZ2V0ICsgbGwudHlwZSArIHRoaXMuZXF1YWwoKS5nZXQpO1xuICB9XG4gIHJldHVybiBsZWZ0XG59XG4vLyByZWxhdGlvbiA8IGFkZGl0aXZlXG4vLyByZWxhdGlvbiA+IGFkZGl0aXZlXG4vLyByZWxhdGlvbiA8PSBhZGRpdGl2ZVxuLy8gcmVsYXRpb24gPj0gYWRkaXRpdmVcbi8vIHJlbGF0aW9uIGluIGFkZGl0aXZlXG5vcC5yZWxhdGlvbiA9IGZ1bmN0aW9uKCl7XG4gIHZhciBsZWZ0ID0gdGhpcy5hZGRpdGl2ZSgpLCBsbDtcbiAgLy8gQHBlcmZcbiAgaWYobGwgPSAodGhpcy5lYXQoWyc8JywgJz4nLCAnPj0nLCAnPD0nXSkgfHwgdGhpcy5lYXQoJ0lERU5UJywgJ2luJykgKSl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0c2V0KGxlZnQuZ2V0ICsgbGwudmFsdWUgKyB0aGlzLnJlbGF0aW9uKCkuZ2V0KTtcbiAgfVxuICByZXR1cm4gbGVmdFxufVxuLy8gYWRkaXRpdmUgOlxuLy8gbXVsdGl2ZVxuLy8gYWRkaXRpdmUgKyBtdWx0aXZlXG4vLyBhZGRpdGl2ZSAtIG11bHRpdmVcbm9wLmFkZGl0aXZlID0gZnVuY3Rpb24oKXtcbiAgdmFyIGxlZnQgPSB0aGlzLm11bHRpdmUoKSAsbGw7XG4gIGlmKGxsPSB0aGlzLmVhdChbJysnLCctJ10pICl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0c2V0KGxlZnQuZ2V0ICsgbGwudmFsdWUgKyB0aGlzLmFkZGl0aXZlKCkuZ2V0KTtcbiAgfVxuICByZXR1cm4gbGVmdFxufVxuLy8gbXVsdGl2ZSA6XG4vLyB1bmFyeVxuLy8gbXVsdGl2ZSAqIHVuYXJ5XG4vLyBtdWx0aXZlIC8gdW5hcnlcbi8vIG11bHRpdmUgJSB1bmFyeVxub3AubXVsdGl2ZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBsZWZ0ID0gdGhpcy5yYW5nZSgpICxsbDtcbiAgaWYoIGxsID0gdGhpcy5lYXQoWycqJywgJy8nICwnJSddKSApe1xuICAgIHJldHVybiB0aGlzLmdldHNldChsZWZ0LmdldCArIGxsLnR5cGUgKyB0aGlzLm11bHRpdmUoKS5nZXQpO1xuICB9XG4gIHJldHVybiBsZWZ0O1xufVxuXG5vcC5yYW5nZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBsZWZ0ID0gdGhpcy51bmFyeSgpLCBsbCwgcmlnaHQ7XG5cbiAgaWYobGwgPSB0aGlzLmVhdCgnLi4nKSl7XG4gICAgcmlnaHQgPSB0aGlzLnVuYXJ5KCk7XG4gICAgdmFyIGJvZHkgPSBcbiAgICAgIFwiKGZ1bmN0aW9uKHN0YXJ0LGVuZCl7dmFyIHJlcyA9IFtdLHN0ZXA9ZW5kPnN0YXJ0PzE6LTE7IGZvcih2YXIgaSA9IHN0YXJ0OyBlbmQ+c3RhcnQ/aSA8PSBlbmQ6IGk+PWVuZDsgaT1pK3N0ZXApe3Jlcy5wdXNoKGkpOyB9IHJldHVybiByZXMgfSkoXCIrbGVmdC5nZXQrXCIsXCIrcmlnaHQuZ2V0K1wiKVwiXG4gICAgcmV0dXJuIHRoaXMuZ2V0c2V0KGJvZHkpO1xuICB9XG5cbiAgcmV0dXJuIGxlZnQ7XG59XG5cblxuXG4vLyBsZWZ0aGFuZFxuLy8gKyB1bmFyeVxuLy8gLSB1bmFyeVxuLy8gfiB1bmFyeVxuLy8gISB1bmFyeVxub3AudW5hcnkgPSBmdW5jdGlvbigpe1xuICB2YXIgbGw7XG4gIGlmKGxsID0gdGhpcy5lYXQoWycrJywnLScsJ34nLCAnISddKSl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0c2V0KCcoJyArIGxsLnR5cGUgKyB0aGlzLnVuYXJ5KCkuZ2V0ICsgJyknKSA7XG4gIH1lbHNle1xuICAgIHJldHVybiB0aGlzLm1lbWJlcigpXG4gIH1cbn1cblxuLy8gY2FsbFtsZWZ0aGFuZF0gOlxuLy8gbWVtYmVyIGFyZ3Ncbi8vIG1lbWJlciBbIGV4cHJlc3Npb24gXVxuLy8gbWVtYmVyIC4gaWRlbnQgIFxuXG5vcC5tZW1iZXIgPSBmdW5jdGlvbihiYXNlLCBsYXN0LCBwYXRoZXMpe1xuICB2YXIgbGwsIHBhdGg7XG5cbiAgdmFyIG9ubHlTaW1wbGVBY2Nlc3NvciA9IGZhbHNlO1xuICBpZighYmFzZSl7IC8vZmlyc3RcbiAgICBwYXRoID0gdGhpcy5wcmltYXJ5KCk7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgcGF0aDtcbiAgICBpZih0eXBlID09PSAnc3RyaW5nJyl7IFxuICAgICAgcGF0aGVzID0gW107XG4gICAgICBwYXRoZXMucHVzaCggcGF0aCApO1xuICAgICAgbGFzdCA9IHBhdGg7XG4gICAgICBiYXNlID0gY3R4TmFtZSArIFwiLl9zZ18oJ1wiICsgcGF0aCArIFwiJywgXCIgKyB2YXJOYW1lICsgXCJbJ1wiICsgcGF0aCArIFwiJ10pXCI7XG4gICAgICBvbmx5U2ltcGxlQWNjZXNzb3IgPSB0cnVlO1xuICAgIH1lbHNleyAvL1ByaW1hdGl2ZSBUeXBlXG4gICAgICBpZihwYXRoLmdldCA9PT0gJ3RoaXMnKXtcbiAgICAgICAgYmFzZSA9IGN0eE5hbWU7XG4gICAgICAgIHBhdGhlcyA9IFsndGhpcyddO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHBhdGhlcyA9IG51bGw7XG4gICAgICAgIGJhc2UgPSBwYXRoLmdldDtcbiAgICAgIH1cbiAgICB9XG4gIH1lbHNleyAvLyBub3QgZmlyc3QgZW50ZXJcbiAgICBpZih0eXBlb2YgbGFzdCA9PT0gJ3N0cmluZycgJiYgaXNQYXRoKCBsYXN0KSApeyAvLyBpcyB2YWxpZCBwYXRoXG4gICAgICBwYXRoZXMucHVzaChsYXN0KTtcbiAgICB9ZWxzZXtcbiAgICAgIGlmKHBhdGhlcyAmJiBwYXRoZXMubGVuZ3RoKSB0aGlzLmRlcGVuZC5wdXNoKHBhdGhlcyk7XG4gICAgICBwYXRoZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuICBpZihsbCA9IHRoaXMuZWF0KFsnWycsICcuJywgJygnXSkpe1xuICAgIHN3aXRjaChsbC50eXBlKXtcbiAgICAgIGNhc2UgJy4nOlxuICAgICAgICAgIC8vIG1lbWJlcihvYmplY3QsIHByb3BlcnR5LCBjb21wdXRlZClcbiAgICAgICAgdmFyIHRtcE5hbWUgPSB0aGlzLm1hdGNoKCdJREVOVCcpLnZhbHVlO1xuICAgICAgICAgIGJhc2UgKz0gXCJbJ1wiICsgdG1wTmFtZSArIFwiJ11cIjtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVtYmVyKCBiYXNlLCB0bXBOYW1lLCBwYXRoZXMgKTtcbiAgICAgIGNhc2UgJ1snOlxuICAgICAgICAgIC8vIG1lbWJlcihvYmplY3QsIHByb3BlcnR5LCBjb21wdXRlZClcbiAgICAgICAgcGF0aCA9IHRoaXMuYXNzaWduKCk7XG4gICAgICAgIGJhc2UgKz0gXCJbXCIgKyBwYXRoLmdldCArIFwiXVwiO1xuICAgICAgICB0aGlzLm1hdGNoKCddJylcbiAgICAgICAgcmV0dXJuIHRoaXMubWVtYmVyKGJhc2UsIHBhdGgsIHBhdGhlcyk7XG4gICAgICBjYXNlICcoJzpcbiAgICAgICAgLy8gY2FsbChjYWxsZWUsIGFyZ3MpXG4gICAgICAgIHZhciBhcmdzID0gdGhpcy5hcmd1bWVudHMoKS5qb2luKCcsJyk7XG4gICAgICAgIGJhc2UgPSAgYmFzZStcIihcIiArIGFyZ3MgK1wiKVwiO1xuICAgICAgICB0aGlzLm1hdGNoKCcpJylcbiAgICAgICAgcmV0dXJuIHRoaXMubWVtYmVyKGJhc2UsIG51bGwsIHBhdGhlcyk7XG4gICAgfVxuICB9XG4gIGlmKCBwYXRoZXMgJiYgcGF0aGVzLmxlbmd0aCApIHRoaXMuZGVwZW5kLnB1c2goIHBhdGhlcyApO1xuICB2YXIgcmVzID0gIHtnZXQ6IGJhc2V9O1xuICBpZihsYXN0KXtcbiAgICBpZihvbmx5U2ltcGxlQWNjZXNzb3IpIHJlcy5zZXQgPSBjdHhOYW1lICsgXCIuX3NzXygnXCIgKyBwYXRoICsgXCInLFwiICsgXy5zZXROYW1lICsgXCIsXCIgKyBfLnZhck5hbWUgKyBcIiwgJz0nKVwiO1xuICAgIGVsc2UgcmVzLnNldCA9IGJhc2UgKyAnPScgKyBfLnNldE5hbWU7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBcbiAqL1xub3AuYXJndW1lbnRzID0gZnVuY3Rpb24oZW5kKXtcbiAgZW5kID0gZW5kIHx8ICcpJ1xuICB2YXIgYXJncyA9IFtdO1xuICBkb3tcbiAgICBpZih0aGlzLmxhKCkgIT09IGVuZCl7XG4gICAgICBhcmdzLnB1c2godGhpcy5hc3NpZ24oKS5nZXQpXG4gICAgfVxuICB9d2hpbGUoIHRoaXMuZWF0KCcsJykpO1xuICByZXR1cm4gYXJnc1xufVxuXG5cbi8vIHByaW1hcnkgOlxuLy8gdGhpcyBcbi8vIGlkZW50XG4vLyBsaXRlcmFsXG4vLyBhcnJheVxuLy8gb2JqZWN0XG4vLyAoIGV4cHJlc3Npb24gKVxuXG5vcC5wcmltYXJ5ID0gZnVuY3Rpb24oKXtcbiAgdmFyIGxsID0gdGhpcy5sbCgpO1xuICBzd2l0Y2gobGwudHlwZSl7XG4gICAgY2FzZSBcIntcIjpcbiAgICAgIHJldHVybiB0aGlzLm9iamVjdCgpO1xuICAgIGNhc2UgXCJbXCI6XG4gICAgICByZXR1cm4gdGhpcy5hcnJheSgpO1xuICAgIGNhc2UgXCIoXCI6XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbigpO1xuICAgIC8vIGxpdGVyYWwgb3IgaWRlbnRcbiAgICBjYXNlICdTVFJJTkcnOlxuICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICByZXR1cm4gdGhpcy5nZXRzZXQoXCInXCIgKyBsbC52YWx1ZSArIFwiJ1wiKVxuICAgIGNhc2UgJ05VTUJFUic6XG4gICAgICB0aGlzLm5leHQoKTtcbiAgICAgIHJldHVybiB0aGlzLmdldHNldChcIlwiK2xsLnZhbHVlKTtcbiAgICBjYXNlIFwiSURFTlRcIjpcbiAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgaWYoaXNLZXlXb3JkKGxsLnZhbHVlKSl7XG4gICAgICAgIHJldHVybiB0aGlzLmdldHNldCggbGwudmFsdWUgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsbC52YWx1ZTtcbiAgICBkZWZhdWx0OiBcbiAgICAgIHRoaXMuZXJyb3IoJ1VuZXhwZWN0ZWQgVG9rZW46ICcgKyBsbC50eXBlKTtcbiAgfVxufVxuXG4vLyBvYmplY3Rcbi8vICB7cHJvcEFzc2lnbiBbLCBwcm9wQXNzaWduXSAqIFssXX1cblxuLy8gcHJvcEFzc2lnblxuLy8gIHByb3AgOiBhc3NpZ25cblxuLy8gcHJvcFxuLy8gIFNUUklOR1xuLy8gIElERU5UXG4vLyAgTlVNQkVSXG5cbm9wLm9iamVjdCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBjb2RlID0gW3RoaXMubWF0Y2goJ3snKS50eXBlXTtcblxuICB2YXIgbGwgPSB0aGlzLmVhdCggWydTVFJJTkcnLCAnSURFTlQnLCAnTlVNQkVSJ10gKTtcbiAgd2hpbGUobGwpe1xuICAgIGNvZGUucHVzaChcIidcIiArIGxsLnZhbHVlICsgXCInXCIgKyB0aGlzLm1hdGNoKCc6JykudHlwZSk7XG4gICAgdmFyIGdldCA9IHRoaXMuYXNzaWduKCkuZ2V0O1xuICAgIGNvZGUucHVzaChnZXQpO1xuICAgIGxsID0gbnVsbDtcbiAgICBpZih0aGlzLmVhdChcIixcIikgJiYgKGxsID0gdGhpcy5lYXQoWydTVFJJTkcnLCAnSURFTlQnLCAnTlVNQkVSJ10pKSApIGNvZGUucHVzaChcIixcIik7XG4gIH1cbiAgY29kZS5wdXNoKHRoaXMubWF0Y2goJ30nKS50eXBlKTtcbiAgcmV0dXJuIHtnZXQ6IGNvZGUuam9pbihcIlwiKX1cbn1cblxuLy8gYXJyYXlcbi8vIFsgYXNzaWduWyxhc3NpZ25dKl1cbm9wLmFycmF5ID0gZnVuY3Rpb24oKXtcbiAgdmFyIGNvZGUgPSBbdGhpcy5tYXRjaCgnWycpLnR5cGVdLCBpdGVtO1xuICB3aGlsZShpdGVtID0gdGhpcy5hc3NpZ24oKSl7XG4gICAgY29kZS5wdXNoKGl0ZW0uZ2V0KTtcbiAgICBpZih0aGlzLmVhdCgnLCcpKSBjb2RlLnB1c2goXCIsXCIpO1xuICAgIGVsc2UgYnJlYWs7XG4gIH1cbiAgY29kZS5wdXNoKHRoaXMubWF0Y2goJ10nKS50eXBlKTtcbiAgcmV0dXJuIHtnZXQ6IGNvZGUuam9pbihcIlwiKX07XG59XG5cbi8vICcoJyBleHByZXNzaW9uICcpJ1xub3AucGFyZW4gPSBmdW5jdGlvbigpe1xuICB0aGlzLm1hdGNoKCcoJyk7XG4gIHZhciByZXMgPSB0aGlzLmZpbHRlcigpXG4gIHJlcy5nZXQgPSAnKCcgKyByZXMuZ2V0ICsgJyknO1xuICB0aGlzLm1hdGNoKCcpJyk7XG4gIHJldHVybiByZXM7XG59XG5cbm9wLmdldHNldCA9IGZ1bmN0aW9uKGdldCwgc2V0KXtcbiAgcmV0dXJuIHtcbiAgICBnZXQ6IGdldCxcbiAgICBzZXQ6IHNldFxuICB9XG59XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlcjtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBlbGVtZW50OiBmdW5jdGlvbihuYW1lLCBhdHRycywgY2hpbGRyZW4pe1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnZWxlbWVudCcsXG4gICAgICB0YWc6IG5hbWUsXG4gICAgICBhdHRyczogYXR0cnMsXG4gICAgICBjaGlsZHJlbjogY2hpbGRyZW5cbiAgICB9XG4gIH0sXG4gIGF0dHJpYnV0ZTogZnVuY3Rpb24obmFtZSwgdmFsdWUpe1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnYXR0cmlidXRlJyxcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICB2YWx1ZTogdmFsdWVcbiAgICB9XG4gIH0sXG4gIFwiaWZcIjogZnVuY3Rpb24odGVzdCwgY29uc2VxdWVudCwgYWx0ZXJuYXRlKXtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ2lmJyxcbiAgICAgIHRlc3Q6IHRlc3QsXG4gICAgICBjb25zZXF1ZW50OiBjb25zZXF1ZW50LFxuICAgICAgYWx0ZXJuYXRlOiBhbHRlcm5hdGVcbiAgICB9XG4gIH0sXG4gIGxpc3Q6IGZ1bmN0aW9uKHNlcXVlbmNlLCB2YXJpYWJsZSwgYm9keSl7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgIHNlcXVlbmNlOiBzZXF1ZW5jZSxcbiAgICAgIHZhcmlhYmxlOiB2YXJpYWJsZSxcbiAgICAgIGJvZHk6IGJvZHlcbiAgICB9XG4gIH0sXG4gIGV4cHJlc3Npb246IGZ1bmN0aW9uKCBib2R5LCBzZXRib2R5LCBjb25zdGFudCApe1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcImV4cHJlc3Npb25cIixcbiAgICAgIGJvZHk6IGJvZHksXG4gICAgICBjb25zdGFudDogY29uc3RhbnQgfHwgZmFsc2UsXG4gICAgICBzZXRib2R5OiBzZXRib2R5IHx8IGZhbHNlXG4gICAgfVxuICB9LFxuICB0ZXh0OiBmdW5jdGlvbih0ZXh0KXtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICB0ZXh0OiB0ZXh0XG4gICAgfVxuICB9LFxuICB0ZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGUpe1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAndGVtcGxhdGUnLFxuICAgICAgY29udGVudDogdGVtcGxhdGVcbiAgICB9XG4gIH1cbn1cbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbnJlcXVpcmUoJy4vaGVscGVyL3NoaW0uanMnKTtcbnZhciBfICA9IG1vZHVsZS5leHBvcnRzO1xudmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi9oZWxwZXIvZW50aXRpZXMuanMnKTtcbnZhciBzbGljZSA9IFtdLnNsaWNlO1xudmFyIG8yc3RyID0gKHt9KS50b1N0cmluZztcbnZhciB3aW4gPSB0eXBlb2Ygd2luZG93ICE9PSd1bmRlZmluZWQnPyB3aW5kb3c6IGdsb2JhbDtcblxuXG5fLm5vb3AgPSBmdW5jdGlvbigpe307XG5fLnVpZCA9IChmdW5jdGlvbigpe1xuICB2YXIgX3VpZD0wO1xuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gX3VpZCsrO1xuICB9XG59KSgpO1xuXG5fLnZhck5hbWUgPSAnX2RfJztcbl8uc2V0TmFtZSA9ICdfcF8nO1xuXy5jdHhOYW1lID0gJ19jXyc7XG5cbl8ucldvcmQgPSAvXltcXCRcXHddKyQvO1xuXy5yU2ltcGxlQWNjZXNzb3IgPSAvXltcXCRcXHddKyhcXC5bXFwkXFx3XSspKiQvO1xuXG5fLm5leHRUaWNrID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJz8gXG4gIHNldEltbWVkaWF0ZS5iaW5kKHdpbikgOiBcbiAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCAwKSBcbiAgfVxuXG5cblxudmFyIHByZWZpeCA9ICBcInZhciBcIiArIF8uY3R4TmFtZSArIFwiPWNvbnRleHQuJGNvbnRleHR8fGNvbnRleHQ7XCIgKyBcInZhciBcIiArIF8udmFyTmFtZSArIFwiPWNvbnRleHQuZGF0YTtcIjtcblxuXG5fLmhvc3QgPSBcImRhdGFcIjtcblxuXG5fLnNsaWNlID0gZnVuY3Rpb24ob2JqLCBzdGFydCwgZW5kKXtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IodmFyIGkgPSBzdGFydCB8fCAwLCBsZW4gPSBlbmQgfHwgb2JqLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcbiAgICB2YXIgaXRlbSA9IG9ialtpXTtcbiAgICByZXMucHVzaChpdGVtKVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbl8udHlwZU9mID0gZnVuY3Rpb24gKG8pIHtcbiAgcmV0dXJuIG8gPT0gbnVsbCA/IFN0cmluZyhvKSA6ICh7fSkudG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKTtcbn1cblxuXG5fLmV4dGVuZCA9IGZ1bmN0aW9uKCBvMSwgbzIsIG92ZXJyaWRlICl7XG4gIGlmKF8udHlwZU9mKG92ZXJyaWRlKSA9PT0gJ2FycmF5Jyl7XG4gICBmb3IodmFyIGkgPSAwLCBsZW4gPSBvdmVycmlkZS5sZW5ndGg7IGkgPCBsZW47IGkrKyApe1xuICAgIHZhciBrZXkgPSBvdmVycmlkZVtpXTtcbiAgICBvMVtrZXldID0gbzJba2V5XTtcbiAgIH0gXG4gIH1lbHNle1xuICAgIGZvcih2YXIgaSBpbiBvMil7XG4gICAgICBpZiggdHlwZW9mIG8xW2ldID09PSBcInVuZGVmaW5lZFwiIHx8IG92ZXJyaWRlID09PSB0cnVlICl7XG4gICAgICAgIG8xW2ldID0gbzJbaV1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG8xO1xufVxuXG5fLm1ha2VQcmVkaWNhdGUgPSBmdW5jdGlvbiBtYWtlUHJlZGljYXRlKHdvcmRzLCBwcmVmaXgpIHtcbiAgICBpZiAodHlwZW9mIHdvcmRzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHdvcmRzID0gd29yZHMuc3BsaXQoXCIgXCIpO1xuICAgIH1cbiAgICB2YXIgZiA9IFwiXCIsXG4gICAgY2F0cyA9IFtdO1xuICAgIG91dDogZm9yICh2YXIgaSA9IDA7IGkgPCB3b3Jkcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNhdHMubGVuZ3RoOyArK2ope1xuICAgICAgICAgIGlmIChjYXRzW2pdWzBdLmxlbmd0aCA9PT0gd29yZHNbaV0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGNhdHNbal0ucHVzaCh3b3Jkc1tpXSk7XG4gICAgICAgICAgICAgIGNvbnRpbnVlIG91dDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0cy5wdXNoKFt3b3Jkc1tpXV0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb21wYXJlVG8oYXJyKSB7XG4gICAgICAgIGlmIChhcnIubGVuZ3RoID09PSAxKSByZXR1cm4gZiArPSBcInJldHVybiBzdHIgPT09ICdcIiArIGFyclswXSArIFwiJztcIjtcbiAgICAgICAgZiArPSBcInN3aXRjaChzdHIpe1wiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSl7XG4gICAgICAgICAgIGYgKz0gXCJjYXNlICdcIiArIGFycltpXSArIFwiJzpcIjtcbiAgICAgICAgfVxuICAgICAgICBmICs9IFwicmV0dXJuIHRydWV9cmV0dXJuIGZhbHNlO1wiO1xuICAgIH1cblxuICAgIC8vIFdoZW4gdGhlcmUgYXJlIG1vcmUgdGhhbiB0aHJlZSBsZW5ndGggY2F0ZWdvcmllcywgYW4gb3V0ZXJcbiAgICAvLyBzd2l0Y2ggZmlyc3QgZGlzcGF0Y2hlcyBvbiB0aGUgbGVuZ3RocywgdG8gc2F2ZSBvbiBjb21wYXJpc29ucy5cbiAgICBpZiAoY2F0cy5sZW5ndGggPiAzKSB7XG4gICAgICAgIGNhdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYi5sZW5ndGggLSBhLmxlbmd0aDtcbiAgICAgICAgfSk7XG4gICAgICAgIGYgKz0gXCJzd2l0Y2goc3RyLmxlbmd0aCl7XCI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2F0cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGNhdCA9IGNhdHNbaV07XG4gICAgICAgICAgICBmICs9IFwiY2FzZSBcIiArIGNhdFswXS5sZW5ndGggKyBcIjpcIjtcbiAgICAgICAgICAgIGNvbXBhcmVUbyhjYXQpO1xuICAgICAgICB9XG4gICAgICAgIGYgKz0gXCJ9XCI7XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBzaW1wbHkgZ2VuZXJhdGUgYSBmbGF0IGBzd2l0Y2hgIHN0YXRlbWVudC5cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb21wYXJlVG8od29yZHMpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKFwic3RyXCIsIGYpO1xufVxuXG5cbl8udHJhY2tFcnJvclBvcyA9IChmdW5jdGlvbiAoKXtcbiAgLy8gbGluZWJyZWFrXG4gIHZhciBsYiA9IC9cXHJcXG58W1xcblxcclxcdTIwMjhcXHUyMDI5XS9nO1xuICBmdW5jdGlvbiBmaW5kTGluZShsaW5lcywgcG9zKXtcbiAgICB2YXIgdG1wTGVuID0gMDtcbiAgICBmb3IodmFyIGkgPSAwLGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcbiAgICAgIHZhciBsaW5lTGVuID0gKGxpbmVzW2ldIHx8IFwiXCIpLmxlbmd0aDtcbiAgICAgIGlmKHRtcExlbiArIGxpbmVMZW4gPiBwb3MpIHJldHVybiB7bnVtOiBpLCBsaW5lOiBsaW5lc1tpXSwgc3RhcnQ6IHBvcyAtIHRtcExlbn07XG4gICAgICAvLyAxIGlzIGZvciB0aGUgbGluZWJyZWFrXG4gICAgICB0bXBMZW4gPSB0bXBMZW4gKyBsaW5lTGVuICsgMTtcbiAgICB9XG4gICAgXG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0LCBwb3Mpe1xuICAgIGlmKHBvcyA+IGlucHV0Lmxlbmd0aC0xKSBwb3MgPSBpbnB1dC5sZW5ndGgtMTtcbiAgICBsYi5sYXN0SW5kZXggPSAwO1xuICAgIHZhciBsaW5lcyA9IGlucHV0LnNwbGl0KGxiKTtcbiAgICB2YXIgbGluZSA9IGZpbmRMaW5lKGxpbmVzLHBvcyk7XG4gICAgdmFyIGxlbiA9IGxpbmUubGluZS5sZW5ndGg7XG5cbiAgICB2YXIgbWluID0gbGluZS5zdGFydCAtIDEwO1xuICAgIGlmKG1pbiA8IDApIG1pbiA9IDA7XG5cbiAgICB2YXIgbWF4ID0gbGluZS5zdGFydCArIDEwO1xuICAgIGlmKG1heCA+IGxlbikgbWF4ID0gbGVuO1xuXG4gICAgdmFyIHJlbWFpbiA9IGxpbmUubGluZS5zbGljZShtaW4sIG1heCk7XG4gICAgdmFyIHByZWZpeCA9IChsaW5lLm51bSsxKSArIFwiPiBcIiArIChtaW4gPiAwPyBcIi4uLlwiIDogXCJcIilcbiAgICB2YXIgcG9zdGZpeCA9IG1heCA8IGxlbiA/IFwiLi4uXCI6IFwiXCI7XG5cbiAgICByZXR1cm4gcHJlZml4ICsgcmVtYWluICsgcG9zdGZpeCArIFwiXFxuXCIgKyBuZXcgQXJyYXkobGluZS5zdGFydCArIHByZWZpeC5sZW5ndGggKyAxKS5qb2luKFwiIFwiKSArIFwiXlwiO1xuICB9XG59KSgpO1xuXG5cbnZhciBpZ25vcmVkUmVmID0gL1xcKChcXD9cXCF8XFw/XFw6fFxcP1xcPSkvZztcbl8uZmluZFN1YkNhcHR1cmUgPSBmdW5jdGlvbiAocmVnU3RyKSB7XG4gIHZhciBsZWZ0ID0gMCxcbiAgICByaWdodCA9IDAsXG4gICAgbGVuID0gcmVnU3RyLmxlbmd0aCxcbiAgICBpZ25vcmVkID0gcmVnU3RyLm1hdGNoKGlnbm9yZWRSZWYpOyAvLyBpZ25vcmVkIHVuY2FwdHVyZVxuICBpZihpZ25vcmVkKSBpZ25vcmVkID0gaWdub3JlZC5sZW5ndGhcbiAgZWxzZSBpZ25vcmVkID0gMDtcbiAgZm9yICg7IGxlbi0tOykge1xuICAgIHZhciBsZXR0ZXIgPSByZWdTdHIuY2hhckF0KGxlbik7XG4gICAgaWYgKGxlbiA9PT0gMCB8fCByZWdTdHIuY2hhckF0KGxlbiAtIDEpICE9PSBcIlxcXFxcIiApIHsgXG4gICAgICBpZiAobGV0dGVyID09PSBcIihcIikgbGVmdCsrO1xuICAgICAgaWYgKGxldHRlciA9PT0gXCIpXCIpIHJpZ2h0Kys7XG4gICAgfVxuICB9XG4gIGlmIChsZWZ0ICE9PSByaWdodCkgdGhyb3cgXCJSZWdFeHA6IFwiKyByZWdTdHIgKyBcIidzIGJyYWNrZXQgaXMgbm90IG1hcmNoZWRcIjtcbiAgZWxzZSByZXR1cm4gbGVmdCAtIGlnbm9yZWQ7XG59O1xuXG5cbl8uZXNjYXBlUmVnRXhwID0gZnVuY3Rpb24oIHN0cil7Ly8gQ3JlZGl0OiBYUmVnRXhwIDAuNi4xIChjKSAyMDA3LTIwMDggU3RldmVuIExldml0aGFuIDxodHRwOi8vc3RldmVubGV2aXRoYW4uY29tL3JlZ2V4L3hyZWdleHAvPiBNSVQgTGljZW5zZVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL1stW1xcXXt9KCkqKz8uXFxcXF4kfCwjXFxzXS9nLCBmdW5jdGlvbihtYXRjaCl7XG4gICAgcmV0dXJuICdcXFxcJyArIG1hdGNoO1xuICB9KTtcbn07XG5cblxudmFyIHJFbnRpdHkgPSBuZXcgUmVnRXhwKFwiJihcIiArIE9iamVjdC5rZXlzKGVudGl0aWVzKS5qb2luKCd8JykgKyAnKTsnLCAnZ2knKTtcblxuXy5jb252ZXJ0RW50aXR5ID0gZnVuY3Rpb24oY2hyKXtcblxuICByZXR1cm4gKFwiXCIgKyBjaHIpLnJlcGxhY2UockVudGl0eSwgZnVuY3Rpb24oYWxsLCBjYXB0dXJlKXtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShlbnRpdGllc1tjYXB0dXJlXSlcbiAgfSk7XG5cbn1cblxuXG4vLyBzaW1wbGUgZ2V0IGFjY2Vzc29yXG5cbl8uY3JlYXRlT2JqZWN0ID0gZnVuY3Rpb24obywgcHJvcHMpe1xuICAgIGZ1bmN0aW9uIEZvbygpIHt9XG4gICAgRm9vLnByb3RvdHlwZSA9IG87XG4gICAgdmFyIHJlcyA9IG5ldyBGb287XG4gICAgaWYocHJvcHMpIF8uZXh0ZW5kKHJlcywgcHJvcHMpO1xuICAgIHJldHVybiByZXM7XG59XG5cbl8uY3JlYXRlUHJvdG8gPSBmdW5jdGlvbihmbiwgbyl7XG4gICAgZnVuY3Rpb24gRm9vKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZm47fVxuICAgIEZvby5wcm90b3R5cGUgPSBvO1xuICAgIHJldHVybiAoZm4ucHJvdG90eXBlID0gbmV3IEZvbygpKTtcbn1cblxuXG4vKipcbmNsb25lXG4qL1xuXy5jbG9uZSA9IGZ1bmN0aW9uIGNsb25lKG9iail7XG4gICAgdmFyIHR5cGUgPSBfLnR5cGVPZihvYmopO1xuICAgIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgICAgdmFyIGNsb25lZCA9IFtdO1xuICAgICAgZm9yKHZhciBpPTAsbGVuID0gb2JqLmxlbmd0aDsgaTwgbGVuO2krKyl7XG4gICAgICAgIGNsb25lZFtpXSA9IG9ialtpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIGNsb25lZDtcbiAgICB9XG4gICAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgICAgdmFyIGNsb25lZCA9IHt9O1xuICAgICAgZm9yKHZhciBpIGluIG9iaikgaWYob2JqLmhhc093blByb3BlcnR5KGkpKXtcbiAgICAgICAgY2xvbmVkW2ldID0gb2JqW2ldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNsb25lZDtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG5cbl8uZXF1YWxzID0gZnVuY3Rpb24obm93LCBvbGQpe1xuICB2YXIgdHlwZSA9IF8udHlwZU9mKG5vdyk7XG4gIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgIHZhciBzcGxpY2VzID0gbGQobm93LCBvbGR8fFtdKTtcbiAgICByZXR1cm4gc3BsaWNlcztcbiAgfVxuICBpZih0eXBlID09PSAnbnVtYmVyJyAmJiB0eXBlb2Ygb2xkID09PSAnbnVtYmVyJyYmIGlzTmFOKG5vdykgJiYgaXNOYU4ob2xkKSkgcmV0dXJuIHRydWVcbiAgcmV0dXJuIG5vdyA9PT0gb2xkO1xufVxuXG5cbi8vTGV2ZW5zaHRlaW5fZGlzdGFuY2Vcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8xLiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xldmVuc2h0ZWluX2Rpc3RhbmNlXG4vLzIuIGdpdGh1Yi5jb206cG9seW1lci9vYnNlcnZlLWpzXG5cbnZhciBsZCA9IChmdW5jdGlvbigpe1xuICBmdW5jdGlvbiBlcXVhbHMoYSxiKXtcbiAgICByZXR1cm4gYSA9PT0gYjtcbiAgfVxuICBmdW5jdGlvbiBsZChhcnJheTEsIGFycmF5Mil7XG4gICAgdmFyIG4gPSBhcnJheTEubGVuZ3RoO1xuICAgIHZhciBtID0gYXJyYXkyLmxlbmd0aDtcbiAgICB2YXIgbWF0cml4ID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8PSBuOyBpKyspe1xuICAgICAgbWF0cml4LnB1c2goW2ldKTtcbiAgICB9XG4gICAgZm9yKHZhciBqPTE7ajw9bTtqKyspe1xuICAgICAgbWF0cml4WzBdW2pdPWo7XG4gICAgfVxuICAgIGZvcih2YXIgaSA9IDE7IGkgPD0gbjsgaSsrKXtcbiAgICAgIGZvcih2YXIgaiA9IDE7IGogPD0gbTsgaisrKXtcbiAgICAgICAgaWYoZXF1YWxzKGFycmF5MVtpLTFdLCBhcnJheTJbai0xXSkpe1xuICAgICAgICAgIG1hdHJpeFtpXVtqXSA9IG1hdHJpeFtpLTFdW2otMV07XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIG1hdHJpeFtpXVtqXSA9IE1hdGgubWluKFxuICAgICAgICAgICAgbWF0cml4W2ktMV1bal0rMSwgLy9kZWxldGVcbiAgICAgICAgICAgIG1hdHJpeFtpXVtqLTFdKzEvL2FkZFxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtYXRyaXg7XG4gIH1cbiAgZnVuY3Rpb24gd2hvbGUoYXJyMiwgYXJyMSkge1xuICAgICAgdmFyIG1hdHJpeCA9IGxkKGFycjEsIGFycjIpXG4gICAgICB2YXIgbiA9IGFycjEubGVuZ3RoO1xuICAgICAgdmFyIGkgPSBuO1xuICAgICAgdmFyIG0gPSBhcnIyLmxlbmd0aDtcbiAgICAgIHZhciBqID0gbTtcbiAgICAgIHZhciBlZGl0cyA9IFtdO1xuICAgICAgdmFyIGN1cnJlbnQgPSBtYXRyaXhbaV1bal07XG4gICAgICB3aGlsZShpPjAgfHwgaj4wKXtcbiAgICAgIC8vIHRoZSBsYXN0IGxpbmVcbiAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICBlZGl0cy51bnNoaWZ0KDMpO1xuICAgICAgICAgIGotLTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyB0aGUgbGFzdCBjb2xcbiAgICAgICAgaWYgKGogPT09IDApIHtcbiAgICAgICAgICBlZGl0cy51bnNoaWZ0KDIpO1xuICAgICAgICAgIGktLTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbm9ydGhXZXN0ID0gbWF0cml4W2kgLSAxXVtqIC0gMV07XG4gICAgICAgIHZhciB3ZXN0ID0gbWF0cml4W2kgLSAxXVtqXTtcbiAgICAgICAgdmFyIG5vcnRoID0gbWF0cml4W2ldW2ogLSAxXTtcblxuICAgICAgICB2YXIgbWluID0gTWF0aC5taW4obm9ydGgsIHdlc3QsIG5vcnRoV2VzdCk7XG5cbiAgICAgICAgaWYgKG1pbiA9PT0gd2VzdCkge1xuICAgICAgICAgIGVkaXRzLnVuc2hpZnQoMik7IC8vZGVsZXRlXG4gICAgICAgICAgaS0tO1xuICAgICAgICAgIGN1cnJlbnQgPSB3ZXN0O1xuICAgICAgICB9IGVsc2UgaWYgKG1pbiA9PT0gbm9ydGhXZXN0ICkge1xuICAgICAgICAgIGlmIChub3J0aFdlc3QgPT09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGVkaXRzLnVuc2hpZnQoMCk7IC8vbm8gY2hhbmdlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVkaXRzLnVuc2hpZnQoMSk7IC8vdXBkYXRlXG4gICAgICAgICAgICBjdXJyZW50ID0gbm9ydGhXZXN0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpLS07XG4gICAgICAgICAgai0tO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVkaXRzLnVuc2hpZnQoMyk7IC8vYWRkXG4gICAgICAgICAgai0tO1xuICAgICAgICAgIGN1cnJlbnQgPSBub3J0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIExFQVZFID0gMDtcbiAgICAgIHZhciBBREQgPSAzO1xuICAgICAgdmFyIERFTEVMRSA9IDI7XG4gICAgICB2YXIgVVBEQVRFID0gMTtcbiAgICAgIHZhciBuID0gMDttPTA7XG4gICAgICB2YXIgc3RlcHMgPSBbXTtcbiAgICAgIHZhciBzdGVwID0ge2luZGV4OiBudWxsLCBhZGQ6MCwgcmVtb3ZlZDpbXX07XG5cbiAgICAgIGZvcih2YXIgaT0wO2k8ZWRpdHMubGVuZ3RoO2krKyl7XG4gICAgICAgIGlmKGVkaXRzW2ldID4gMCApeyAvLyBOT1QgTEVBVkVcbiAgICAgICAgICBpZihzdGVwLmluZGV4ID09PSBudWxsKXtcbiAgICAgICAgICAgIHN0ZXAuaW5kZXggPSBtO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgLy9MRUFWRVxuICAgICAgICAgIGlmKHN0ZXAuaW5kZXggIT0gbnVsbCl7XG4gICAgICAgICAgICBzdGVwcy5wdXNoKHN0ZXApXG4gICAgICAgICAgICBzdGVwID0ge2luZGV4OiBudWxsLCBhZGQ6MCwgcmVtb3ZlZDpbXX07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN3aXRjaChlZGl0c1tpXSl7XG4gICAgICAgICAgY2FzZSBMRUFWRTpcbiAgICAgICAgICAgIG4rKztcbiAgICAgICAgICAgIG0rKztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUREOlxuICAgICAgICAgICAgc3RlcC5hZGQrKztcbiAgICAgICAgICAgIG0rKztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgREVMRUxFOlxuICAgICAgICAgICAgc3RlcC5yZW1vdmVkLnB1c2goYXJyMVtuXSlcbiAgICAgICAgICAgIG4rKztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgVVBEQVRFOlxuICAgICAgICAgICAgc3RlcC5hZGQrKztcbiAgICAgICAgICAgIHN0ZXAucmVtb3ZlZC5wdXNoKGFycjFbbl0pXG4gICAgICAgICAgICBuKys7XG4gICAgICAgICAgICBtKys7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYoc3RlcC5pbmRleCAhPSBudWxsKXtcbiAgICAgICAgc3RlcHMucHVzaChzdGVwKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN0ZXBzXG4gICAgfVxuICAgIHJldHVybiB3aG9sZTtcbiAgfSkoKTtcblxuXG5cbl8udGhyb3R0bGUgPSBmdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0KXtcbiAgdmFyIHdhaXQgPSB3YWl0IHx8IDEwMDtcbiAgdmFyIGNvbnRleHQsIGFyZ3MsIHJlc3VsdDtcbiAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICB2YXIgcHJldmlvdXMgPSAwO1xuICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBwcmV2aW91cyA9ICtuZXcgRGF0ZTtcbiAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgfTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBub3cgPSArIG5ldyBEYXRlO1xuICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICBjb250ZXh0ID0gdGhpcztcbiAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKCF0aW1lb3V0KSB7XG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn07XG5cbi8vIGhvZ2FuIGVzY2FwZVxuLy8gPT09PT09PT09PT09PT1cbl8uZXNjYXBlID0gKGZ1bmN0aW9uKCl7XG4gIHZhciByQW1wID0gLyYvZyxcbiAgICAgIHJMdCA9IC88L2csXG4gICAgICByR3QgPSAvPi9nLFxuICAgICAgckFwb3MgPSAvXFwnL2csXG4gICAgICByUXVvdCA9IC9cXFwiL2csXG4gICAgICBoQ2hhcnMgPSAvWyY8PlxcXCJcXCddLztcblxuICByZXR1cm4gZnVuY3Rpb24oc3RyKSB7XG4gICAgcmV0dXJuIGhDaGFycy50ZXN0KHN0cikgP1xuICAgICAgc3RyXG4gICAgICAgIC5yZXBsYWNlKHJBbXAsICcmYW1wOycpXG4gICAgICAgIC5yZXBsYWNlKHJMdCwgJyZsdDsnKVxuICAgICAgICAucmVwbGFjZShyR3QsICcmZ3Q7JylcbiAgICAgICAgLnJlcGxhY2UockFwb3MsICcmIzM5OycpXG4gICAgICAgIC5yZXBsYWNlKHJRdW90LCAnJnF1b3Q7JykgOlxuICAgICAgc3RyO1xuICB9XG59KSgpO1xuXG5fLmNhY2hlID0gZnVuY3Rpb24obWF4KXtcbiAgbWF4ID0gbWF4IHx8IDEwMDA7XG4gIHZhciBrZXlzID0gW10sXG4gICAgICBjYWNoZSA9IHt9O1xuICByZXR1cm4ge1xuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgaWYgKGtleXMubGVuZ3RoID4gdGhpcy5tYXgpIHtcbiAgICAgICAgY2FjaGVba2V5cy5zaGlmdCgpXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIC8vIFxuICAgICAgaWYoY2FjaGVba2V5XSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICB9XG4gICAgICBjYWNoZVtrZXldID0gdmFsdWU7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gY2FjaGU7XG4gICAgICByZXR1cm4gY2FjaGVba2V5XTtcbiAgICB9LFxuICAgIG1heDogbWF4LFxuICAgIGxlbjpmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGtleXMubGVuZ3RoO1xuICAgIH1cbiAgfTtcbn1cblxuLy8gc2V0dXAgdGhlIHJhdyBFeHByZXNzaW9uXG5fLnRvdWNoRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKGV4cHIpe1xuICBpZihleHByLnR5cGUgPT09ICdleHByZXNzaW9uJyl7XG4gICAgaWYoIWV4cHIuZ2V0KXtcbiAgICAgIGV4cHIuZ2V0ID0gbmV3IEZ1bmN0aW9uKFwiY29udGV4dFwiLCBwcmVmaXggKyBcInJldHVybiAoXCIgKyBleHByLmJvZHkgKyBcIilcIik7XG4gICAgICBleHByLmJvZHkgPSBudWxsO1xuICAgICAgaWYoZXhwci5zZXRib2R5KXtcbiAgICAgICAgZXhwci5zZXQgPSBmdW5jdGlvbihjdHgsIHZhbHVlKXtcbiAgICAgICAgICBpZihleHByLnNldGJvZHkpe1xuICAgICAgICAgICAgZXhwci5zZXQgPSBuZXcgRnVuY3Rpb24oJ2NvbnRleHQnLCBfLnNldE5hbWUgLCAgcHJlZml4ICsgZXhwci5zZXRib2R5KTtcbiAgICAgICAgICAgIGV4cHIuc2V0Ym9keSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBleHByLnNldChjdHgsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gZXhwcjtcbn1cblxuXG4vLyBoYW5kbGUgdGhlIHNhbWUgbG9naWMgb24gY29tcG9uZW50J3MgYG9uLSpgIGFuZCBlbGVtZW50J3MgYG9uLSpgXG4vLyByZXR1cm4gdGhlIGZpcmUgb2JqZWN0XG5fLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24odmFsdWUsIHR5cGUgKXtcbiAgdmFyIHNlbGYgPSB0aGlzLCBldmFsdWF0ZTtcbiAgaWYodmFsdWUudHlwZSA9PT0gJ2V4cHJlc3Npb24nKXsgLy8gaWYgaXMgZXhwcmVzc2lvbiwgZ28gZXZhbHVhdGVkIHdheVxuICAgIGV2YWx1YXRlID0gdmFsdWUuZ2V0O1xuICB9XG4gIGlmKGV2YWx1YXRlKXtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmlyZShvYmope1xuICAgICAgc2VsZi5kYXRhLiRldmVudCA9IG9iajtcbiAgICAgIHZhciByZXMgPSBldmFsdWF0ZShzZWxmKTtcbiAgICAgIGlmKHJlcyA9PT0gZmFsc2UgJiYgb2JqICYmIG9iai5wcmV2ZW50RGVmYXVsdCkgb2JqLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBkZWxldGUgc2VsZi5kYXRhLiRldmVudDtcbiAgICAgIHNlbGYuJHVwZGF0ZSgpO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGZpcmUoKXtcbiAgICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpICAgICAgXG4gICAgICBhcmdzLnVuc2hpZnQodmFsdWUpO1xuICAgICAgc2VsZi4kZW1pdC5hcHBseShzZWxmLiRjb250ZXh0LCBhcmdzKTtcbiAgICAgIHNlbGYuJHVwZGF0ZSgpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBvbmx5IGNhbGwgb25jZVxuXy5vbmNlID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgdGltZSA9IDA7XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGlmKCB0aW1lKysgPT09IDApIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuXG5cblxuXG5cblxuXG5fLmxvZyA9IGZ1bmN0aW9uKG1zZywgdHlwZSl7XG4gIGlmKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiKSAgY29uc29sZVt0eXBlIHx8IFwibG9nXCJdKG1zZyk7XG59XG5cblxuXG5cbi8vaHR0cDovL3d3dy53My5vcmcvaHRtbC93Zy9kcmFmdHMvaHRtbC9tYXN0ZXIvc2luZ2xlLXBhZ2UuaHRtbCN2b2lkLWVsZW1lbnRzXG5fLmlzVm9pZFRhZyA9IF8ubWFrZVByZWRpY2F0ZShcImFyZWEgYmFzZSBiciBjb2wgZW1iZWQgaHIgaW1nIGlucHV0IGtleWdlbiBsaW5rIG1lbnVpdGVtIG1ldGEgcGFyYW0gc291cmNlIHRyYWNrIHdiciByLWNvbnRlbnRcIik7XG5fLmlzQm9vbGVhbkF0dHIgPSBfLm1ha2VQcmVkaWNhdGUoJ3NlbGVjdGVkIGNoZWNrZWQgZGlzYWJsZWQgcmVhZE9ubHkgcmVxdWlyZWQgb3BlbiBhdXRvZm9jdXMgY29udHJvbHMgYXV0b3BsYXkgY29tcGFjdCBsb29wIGRlZmVyIG11bHRpcGxlJyk7XG5cbl8uaXNGYWxzZSAtIGZ1bmN0aW9uKCl7cmV0dXJuIGZhbHNlfVxuXy5pc1RydWUgLSBmdW5jdGlvbigpe3JldHVybiB0cnVlfVxuXG5cbl8uYXNzZXJ0ID0gZnVuY3Rpb24odGVzdCwgbXNnKXtcbiAgaWYoIXRlc3QpIHRocm93IG1zZztcbn1cblxuXG5cbl8uZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbigpe1xuICBcbn1cblxuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJ2YXIgbm9kZSA9IHJlcXVpcmUoXCIuL3BhcnNlci9ub2RlLmpzXCIpO1xudmFyIGRvbSA9IHJlcXVpcmUoXCIuL2RvbS5qc1wiKTtcbnZhciBhbmltYXRlID0gcmVxdWlyZShcIi4vaGVscGVyL2FuaW1hdGUuanNcIik7XG52YXIgR3JvdXAgPSByZXF1aXJlKCcuL2dyb3VwLmpzJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIGNvbWJpbmUgPSByZXF1aXJlKCcuL2hlbHBlci9jb21iaW5lLmpzJyk7XG5cbnZhciB3YWxrZXJzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxud2Fsa2Vycy5saXN0ID0gZnVuY3Rpb24oYXN0KXtcblxuICB2YXIgUmVndWxhciA9IHdhbGtlcnMuUmVndWxhcjsgIFxuICB2YXIgcGxhY2Vob2xkZXIgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KFwiUmVndWxhciBsaXN0XCIpLFxuICAgIG5hbWVzcGFjZSA9IHRoaXMuX19uc19fO1xuICAvLyBwcm94eSBDb21wb25lbnQgdG8gaW1wbGVtZW50IGxpc3QgaXRlbSwgc28gdGhlIGJlaGF2aWFyIGlzIHNpbWlsYXIgd2l0aCBhbmd1bGFyO1xuICB2YXIgU2VjdGlvbiA9ICBSZWd1bGFyLmV4dGVuZCggeyBcbiAgICB0ZW1wbGF0ZTogYXN0LmJvZHksIFxuICAgICRjb250ZXh0OiB0aGlzLiRjb250ZXh0LFxuICAgIC8vIHByb3h5IHRoZSBldmVudCB0byAkY29udGV4dFxuICAgICRvbjogdGhpcy4kY29udGV4dC4kb24uYmluZCh0aGlzLiRjb250ZXh0KSxcbiAgICAkb2ZmOiB0aGlzLiRjb250ZXh0LiRvZmYuYmluZCh0aGlzLiRjb250ZXh0KSxcbiAgICAkZW1pdDogdGhpcy4kY29udGV4dC4kZW1pdC5iaW5kKHRoaXMuJGNvbnRleHQpXG4gIH0pO1xuICBSZWd1bGFyLl9pbmhlcml0Q29uZmlnKFNlY3Rpb24sIHRoaXMuY29uc3RydWN0b3IpO1xuXG4gIC8vIHZhciBmcmFnbWVudCA9IGRvbS5mcmFnbWVudCgpO1xuICAvLyBmcmFnbWVudC5hcHBlbmRDaGlsZChwbGFjZWhvbGRlcik7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGdyb3VwID0gbmV3IEdyb3VwKCk7XG4gIGdyb3VwLnB1c2gocGxhY2Vob2xkZXIpO1xuICB2YXIgaW5kZXhOYW1lID0gYXN0LnZhcmlhYmxlICsgJ19pbmRleCc7XG4gIHZhciB2YXJpYWJsZSA9IGFzdC52YXJpYWJsZTtcbiAgLy8gZ3JvdXAucHVzaChwbGFjZWhvbGRlcik7XG5cblxuICBmdW5jdGlvbiB1cGRhdGUobmV3VmFsdWUsIHNwbGljZXMpe1xuICAgIG5ld1ZhbHVlID0gbmV3VmFsdWUgfHwgW107XG4gICAgaWYoIXNwbGljZXMgfHwgIXNwbGljZXMubGVuZ3RoKSByZXR1cm47XG4gICAgdmFyIGN1ciA9IHBsYWNlaG9sZGVyO1xuICAgIHZhciBtID0gMCwgbGVuID0gbmV3VmFsdWUubGVuZ3RoLFxuICAgICAgbUluZGV4ID0gc3BsaWNlc1swXS5pbmRleDtcblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBzcGxpY2VzLmxlbmd0aDsgaSsrKXsgLy9pbml0XG4gICAgICB2YXIgc3BsaWNlID0gc3BsaWNlc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IHNwbGljZS5pbmRleDsgLy8gYmVhY3VzZSB3ZSB1c2UgYSBjb21tZW50IGZvciBwbGFjZWhvbGRlclxuXG4gICAgICBmb3IodmFyIGsgPSBtOyBrIDwgaW5kZXg7IGsrKyl7IC8vIG5vIGNoYW5nZVxuICAgICAgICB2YXIgc2VjdCA9IGdyb3VwLmdldCggayArIDEgKTtcbiAgICAgICAgc2VjdC5kYXRhW2luZGV4TmFtZV0gPSBrO1xuICAgICAgfVxuICAgICAgZm9yKHZhciBqID0gMCwgamxlbiA9IHNwbGljZS5yZW1vdmVkLmxlbmd0aDsgajwgamxlbjsgaisrKXsgLy9yZW1vdmVkXG4gICAgICAgIHZhciByZW1vdmVkID0gZ3JvdXAuY2hpbGRyZW4uc3BsaWNlKCBpbmRleCArIDEsIDEpWzBdO1xuICAgICAgICByZW1vdmVkLmRlc3Ryb3kodHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZvcih2YXIgbyA9IGluZGV4OyBvIDwgaW5kZXggKyBzcGxpY2UuYWRkOyBvKyspeyAvL2FkZFxuICAgICAgICAvLyBwcm90b3R5cGUgaW5oZXJpdFxuICAgICAgICB2YXIgaXRlbSA9IG5ld1ZhbHVlW29dO1xuICAgICAgICB2YXIgZGF0YSA9IF8uY3JlYXRlT2JqZWN0KHNlbGYuZGF0YSk7XG4gICAgICAgIGRhdGFbaW5kZXhOYW1lXSA9IG87XG4gICAgICAgIGRhdGFbdmFyaWFibGVdID0gaXRlbTtcblxuICAgICAgICAvL0BUT0RPXG4gICAgICAgIHZhciBzZWN0aW9uID0gbmV3IFNlY3Rpb24oe2RhdGE6IGRhdGEsICRwYXJlbnQ6IHNlbGYgLCBuYW1lc3BhY2U6IG5hbWVzcGFjZX0pO1xuXG5cbiAgICAgICAgLy8gYXV0b2xpbmtcbiAgICAgICAgdmFyIGluc2VydCA9ICBjb21iaW5lLmxhc3QoZ3JvdXAuZ2V0KG8pKTtcbiAgICAgICAgLy8gYW5pbWF0ZS5pbmplY3QoY29tYmluZS5ub2RlKHNlY3Rpb24pLGluc2VydCwnYWZ0ZXInKVxuICAgICAgICBpZihpbnNlcnQucGFyZW50Tm9kZSl7XG4gICAgICAgICAgYW5pbWF0ZS5pbmplY3QoY29tYmluZS5ub2RlKHNlY3Rpb24pLGluc2VydCwgJ2FmdGVyJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaW5zZXJ0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGNvbWJpbmUubm9kZShzZWN0aW9uKSwgaW5zZXJ0Lm5leHRTaWJsaW5nKTtcbiAgICAgICAgZ3JvdXAuY2hpbGRyZW4uc3BsaWNlKCBvICsgMSAsIDAsIHNlY3Rpb24pO1xuICAgICAgfVxuICAgICAgbSA9IGluZGV4ICsgc3BsaWNlLmFkZCAtIHNwbGljZS5yZW1vdmVkLmxlbmd0aDtcbiAgICAgIG0gID0gbSA8IDA/IDAgOiBtO1xuXG4gICAgfVxuICAgIGlmKG0gPCBsZW4pe1xuICAgICAgZm9yKHZhciBpID0gbTsgaSA8IGxlbjsgaSsrKXtcbiAgICAgICAgdmFyIHBhaXIgPSBncm91cC5nZXQoaSArIDEpO1xuICAgICAgICBwYWlyLmRhdGFbaW5kZXhOYW1lXSA9IGk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGhpcy4kd2F0Y2goYXN0LnNlcXVlbmNlLCB1cGRhdGUsIHsgaW5pdDogdHJ1ZSB9KTtcbiAgcmV0dXJuIGdyb3VwO1xufVxuXG53YWxrZXJzLnRlbXBsYXRlID0gZnVuY3Rpb24oYXN0KXtcbiAgdmFyIGNvbnRlbnQgPSBhc3QuY29udGVudCwgY29tcGlsZWQ7XG4gIHZhciBwbGFjZWhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJ3RlbXBsYXRlJyk7XG4gIHZhciBjb21waWxlZCwgbmFtZXNwYWNlID0gdGhpcy5fX25zX187XG4gIC8vIHZhciBmcmFnbWVudCA9IGRvbS5mcmFnbWVudCgpO1xuICAvLyBmcmFnbWVudC5hcHBlbmRDaGlsZChwbGFjZWhvbGRlcik7XG4gIHZhciBncm91cCA9IG5ldyBHcm91cCgpO1xuICBncm91cC5wdXNoKHBsYWNlaG9sZGVyKTtcbiAgaWYoY29udGVudCl7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuJHdhdGNoKGNvbnRlbnQsIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIGlmKCBjb21waWxlZCA9IGdyb3VwLmdldCgxKSl7XG4gICAgICAgIGNvbXBpbGVkLmRlc3Ryb3kodHJ1ZSk7IFxuICAgICAgICBncm91cC5jaGlsZHJlbi5wb3AoKTtcbiAgICAgIH1cbiAgICAgIGdyb3VwLnB1c2goIGNvbXBpbGVkID0gIHNlbGYuJGNvbXBpbGUodmFsdWUsIHtyZWNvcmQ6IHRydWUsIG5hbWVzcGFjZTogbmFtZXNwYWNlfSkgKTsgXG4gICAgICBpZihwbGFjZWhvbGRlci5wYXJlbnROb2RlKSBhbmltYXRlLmluamVjdChjb21iaW5lLm5vZGUoY29tcGlsZWQpLCBwbGFjZWhvbGRlciwgJ2JlZm9yZScpXG4gICAgfSwge1xuICAgICAgaW5pdDogdHJ1ZVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBncm91cDtcbn07XG5cblxuLy8gaG93IHRvIHJlc29sdmUgdGhpcyBwcm9ibGVtXG52YXIgaWkgPSAwO1xud2Fsa2Vyc1snaWYnXSA9IGZ1bmN0aW9uKGFzdCwgb3B0aW9ucyl7XG4gIHZhciBzZWxmID0gdGhpcywgY29uc2VxdWVudCwgYWx0ZXJuYXRlO1xuICBpZihvcHRpb25zICYmIG9wdGlvbnMuZWxlbWVudCl7IC8vIGF0dHJpYnV0ZSBpbnRlcGxhdGlvblxuICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbihudmFsdWUpe1xuICAgICAgaWYoISFudmFsdWUpe1xuICAgICAgICBpZihhbHRlcm5hdGUpIGNvbWJpbmUuZGVzdHJveShhbHRlcm5hdGUpXG4gICAgICAgIGlmKGFzdC5jb25zZXF1ZW50KSBjb25zZXF1ZW50ID0gc2VsZi4kY29tcGlsZShhc3QuY29uc2VxdWVudCwge3JlY29yZDogdHJ1ZSwgZWxlbWVudDogb3B0aW9ucy5lbGVtZW50IH0pO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKGNvbnNlcXVlbnQpIGNvbWJpbmUuZGVzdHJveShjb25zZXF1ZW50KVxuICAgICAgICBpZihhc3QuYWx0ZXJuYXRlKSBhbHRlcm5hdGUgPSBzZWxmLiRjb21waWxlKGFzdC5hbHRlcm5hdGUsIHtyZWNvcmQ6IHRydWUsIGVsZW1lbnQ6IG9wdGlvbnMuZWxlbWVudH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLiR3YXRjaChhc3QudGVzdCwgdXBkYXRlLCB7IGZvcmNlOiB0cnVlIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBkZXN0cm95OiBmdW5jdGlvbigpe1xuICAgICAgICBpZihjb25zZXF1ZW50KSBjb21iaW5lLmRlc3Ryb3koY29uc2VxdWVudCk7XG4gICAgICAgIGVsc2UgaWYoYWx0ZXJuYXRlKSBjb21iaW5lLmRlc3Ryb3koYWx0ZXJuYXRlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIHZhciB0ZXN0LCBjb25zZXF1ZW50LCBhbHRlcm5hdGUsIG5vZGU7XG4gIHZhciBwbGFjZWhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoXCJSZWd1bGFyIGlmXCIgKyBpaSsrKTtcbiAgdmFyIGdyb3VwID0gbmV3IEdyb3VwKCk7XG4gIGdyb3VwLnB1c2gocGxhY2Vob2xkZXIpO1xuICB2YXIgcHJlVmFsdWUgPSBudWxsLCBuYW1lc3BhY2U9IHRoaXMuX19uc19fO1xuXG5cbiAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uIChudmFsdWUsIG9sZCl7XG4gICAgdmFyIHZhbHVlID0gISFudmFsdWU7XG4gICAgaWYodmFsdWUgPT09IHByZVZhbHVlKSByZXR1cm47XG4gICAgcHJlVmFsdWUgPSB2YWx1ZTtcbiAgICBpZihncm91cC5jaGlsZHJlblsxXSl7XG4gICAgICBncm91cC5jaGlsZHJlblsxXS5kZXN0cm95KHRydWUpO1xuICAgICAgZ3JvdXAuY2hpbGRyZW4ucG9wKCk7XG4gICAgfVxuICAgIGlmKHZhbHVlKXsgLy90cnVlXG4gICAgICBpZihhc3QuY29uc2VxdWVudCAmJiBhc3QuY29uc2VxdWVudC5sZW5ndGgpe1xuICAgICAgICBjb25zZXF1ZW50ID0gc2VsZi4kY29tcGlsZSggYXN0LmNvbnNlcXVlbnQgLCB7cmVjb3JkOnRydWUsIG5hbWVzcGFjZTogbmFtZXNwYWNlIH0pXG4gICAgICAgIC8vIHBsYWNlaG9sZGVyLnBhcmVudE5vZGUgJiYgcGxhY2Vob2xkZXIucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIG5vZGUsIHBsYWNlaG9sZGVyICk7XG4gICAgICAgIGdyb3VwLnB1c2goY29uc2VxdWVudCk7XG4gICAgICAgIGlmKHBsYWNlaG9sZGVyLnBhcmVudE5vZGUpe1xuICAgICAgICAgIGFuaW1hdGUuaW5qZWN0KGNvbWJpbmUubm9kZShjb25zZXF1ZW50KSwgcGxhY2Vob2xkZXIsICdiZWZvcmUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1lbHNleyAvL2ZhbHNlXG4gICAgICBpZihhc3QuYWx0ZXJuYXRlICYmIGFzdC5hbHRlcm5hdGUubGVuZ3RoKXtcbiAgICAgICAgYWx0ZXJuYXRlID0gc2VsZi4kY29tcGlsZShhc3QuYWx0ZXJuYXRlLCB7cmVjb3JkOnRydWUsIG5hbWVzcGFjZTogbmFtZXNwYWNlfSk7XG4gICAgICAgIGdyb3VwLnB1c2goYWx0ZXJuYXRlKTtcbiAgICAgICAgaWYocGxhY2Vob2xkZXIucGFyZW50Tm9kZSl7XG4gICAgICAgICAgYW5pbWF0ZS5pbmplY3QoY29tYmluZS5ub2RlKGFsdGVybmF0ZSksIHBsYWNlaG9sZGVyLCAnYmVmb3JlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdGhpcy4kd2F0Y2goYXN0LnRlc3QsIHVwZGF0ZSwge2ZvcmNlOiB0cnVlLCBpbml0OiB0cnVlfSk7XG5cbiAgcmV0dXJuIGdyb3VwO1xufVxuXG5cbndhbGtlcnMuZXhwcmVzc2lvbiA9IGZ1bmN0aW9uKGFzdCl7XG4gIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIik7XG4gIHRoaXMuJHdhdGNoKGFzdCwgZnVuY3Rpb24obmV3dmFsKXtcbiAgICBkb20udGV4dChub2RlLCBcIlwiICsgKG5ld3ZhbCA9PSBudWxsPyBcIlwiOiBcIlwiICsgbmV3dmFsKSApO1xuICB9KVxuICByZXR1cm4gbm9kZTtcbn1cbndhbGtlcnMudGV4dCA9IGZ1bmN0aW9uKGFzdCl7XG4gIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXy5jb252ZXJ0RW50aXR5KGFzdC50ZXh0KSk7XG4gIHJldHVybiBub2RlO1xufVxuXG5cbnZhciBldmVudFJlZyA9IC9eb24tKC4rKSQvXG5cbi8qKlxuICogd2Fsa2VycyBlbGVtZW50IChjb250YWlucyBjb21wb25lbnQpXG4gKi9cbndhbGtlcnMuZWxlbWVudCA9IGZ1bmN0aW9uKGFzdCl7XG4gIHZhciBhdHRycyA9IGFzdC5hdHRycywgXG4gICAgY29tcG9uZW50LCBzZWxmID0gdGhpcyxcbiAgICBDb25zdHJ1Y3Rvcj10aGlzLmNvbnN0cnVjdG9yLFxuICAgIGNoaWxkcmVuID0gYXN0LmNoaWxkcmVuLFxuICAgIG5hbWVzcGFjZSA9IHRoaXMuX19uc19fLCByZWYsIGdyb3VwLCBcbiAgICBDb21wb25lbnQgPSBDb25zdHJ1Y3Rvci5jb21wb25lbnQoYXN0LnRhZyk7XG5cblxuICBpZihhc3QudGFnID09PSAnc3ZnJykgdmFyIG5hbWVzcGFjZSA9IFwic3ZnXCI7XG5cblxuICBpZihjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGgpe1xuICAgIGdyb3VwID0gdGhpcy4kY29tcGlsZShjaGlsZHJlbiwge25hbWVzcGFjZTogbmFtZXNwYWNlIH0pO1xuICB9XG5cblxuICBpZihDb21wb25lbnQpe1xuICAgIHZhciBkYXRhID0ge30sZXZlbnRzO1xuICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IGF0dHJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKXtcbiAgICAgIHZhciBhdHRyID0gYXR0cnNbaV07XG4gICAgICB2YXIgdmFsdWUgPSBhdHRyLnZhbHVlfHxcIlwiO1xuICAgICAgXy50b3VjaEV4cHJlc3Npb24odmFsdWUpO1xuICAgICAgdmFyIG5hbWUgPSBhdHRyLm5hbWU7XG4gICAgICB2YXIgZXRlc3QgPSBuYW1lLm1hdGNoKGV2ZW50UmVnKTtcbiAgICAgIC8vIGJpbmQgZXZlbnQgcHJveHlcbiAgICAgIGlmKGV0ZXN0KXtcbiAgICAgICAgZXZlbnRzID0gZXZlbnRzIHx8IHt9O1xuICAgICAgICBldmVudHNbZXRlc3RbMV1dID0gXy5oYW5kbGVFdmVudC5jYWxsKHRoaXMsIHZhbHVlLCBldGVzdFsxXSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZih2YWx1ZS50eXBlICE9PSAnZXhwcmVzc2lvbicpe1xuICAgICAgICBkYXRhW2F0dHIubmFtZV0gPSB2YWx1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICBkYXRhW2F0dHIubmFtZV0gPSB2YWx1ZS5nZXQoc2VsZik7IFxuICAgICAgfVxuICAgICAgaWYoIGF0dHIubmFtZSA9PT0gJ3JlZicgICYmIHZhbHVlICE9IG51bGwpe1xuICAgICAgICByZWYgPSB2YWx1ZS50eXBlID09PSAnZXhwcmVzc2lvbic/IHZhbHVlLmdldChzZWxmKTogdmFsdWU7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICB2YXIgJGJvZHk7XG4gICAgaWYoYXN0LmNoaWxkcmVuKSAkYm9keSA9IHRoaXMuJGNvbXBpbGUoYXN0LmNoaWxkcmVuKTtcbiAgICB2YXIgY29tcG9uZW50ID0gbmV3IENvbXBvbmVudCh7ZGF0YTogZGF0YSwgZXZlbnRzOiBldmVudHMsICRib2R5OiAkYm9keSwgJHBhcmVudDogdGhpcywgbmFtZXNwYWNlOiBuYW1lc3BhY2V9KTtcbiAgICBpZihyZWYgJiYgIHNlbGYuJGNvbnRleHQuJHJlZnMpIHNlbGYuJGNvbnRleHQuJHJlZnNbcmVmXSA9IGNvbXBvbmVudDtcbiAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSBhdHRycy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgICB2YXIgYXR0ciA9IGF0dHJzW2ldO1xuICAgICAgdmFyIHZhbHVlID0gYXR0ci52YWx1ZXx8XCJcIjtcbiAgICAgIGlmKHZhbHVlLnR5cGUgPT09ICdleHByZXNzaW9uJyAmJiBhdHRyLm5hbWUuaW5kZXhPZignb24tJyk9PT0tMSl7XG4gICAgICAgIHRoaXMuJHdhdGNoKHZhbHVlLCBjb21wb25lbnQuJHVwZGF0ZS5iaW5kKGNvbXBvbmVudCwgYXR0ci5uYW1lKSlcbiAgICAgICAgaWYodmFsdWUuc2V0KSBjb21wb25lbnQuJHdhdGNoKGF0dHIubmFtZSwgc2VsZi4kdXBkYXRlLmJpbmQoc2VsZiwgdmFsdWUpKVxuICAgICAgfVxuICAgIH1cbiAgICBpZihyZWYpe1xuICAgICAgY29tcG9uZW50LiRvbignZGVzdHJveScsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKHNlbGYuJGNvbnRleHQuJHJlZnMpIHNlbGYuJGNvbnRleHQuJHJlZnNbcmVmXSA9IG51bGw7XG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50O1xuICB9ZWxzZSBpZihhc3QudGFnID09PSAnci1jb250ZW50JyAmJiB0aGlzLiRib2R5KXtcbiAgICByZXR1cm4gdGhpcy4kYm9keTtcbiAgfVxuXG4gIHZhciBlbGVtZW50ID0gZG9tLmNyZWF0ZShhc3QudGFnLCBuYW1lc3BhY2UsIGF0dHJzKTtcbiAgLy8gY29udGV4dCBlbGVtZW50XG5cbiAgdmFyIGNoaWxkO1xuXG4gIGlmKGdyb3VwICYmICFfLmlzVm9pZFRhZyhhc3QudGFnKSl7XG4gICAgZG9tLmluamVjdCggY29tYmluZS5ub2RlKGdyb3VwKSAsIGVsZW1lbnQpXG4gIH1cblxuICAvLyBzb3J0IGJlZm9yZVxuICBhdHRycy5zb3J0KGZ1bmN0aW9uKGExLCBhMil7XG4gICAgdmFyIGQxID0gQ29uc3RydWN0b3IuZGlyZWN0aXZlKGExLm5hbWUpLFxuICAgICAgZDIgPSBDb25zdHJ1Y3Rvci5kaXJlY3RpdmUoYTIubmFtZSk7XG4gICAgaWYoZDEgJiYgZDIpIHJldHVybiAoZDIucHJpb3JpdHkgfHwgMSkgLSAoZDEucHJpb3JpdHkgfHwgMSk7XG4gICAgaWYoZDEpIHJldHVybiAxO1xuICAgIGlmKGQyKSByZXR1cm4gLTE7XG4gICAgaWYoYTIubmFtZSA9PT0gXCJ0eXBlXCIpIHJldHVybiAxO1xuICAgIHJldHVybiAtMTtcbiAgfSlcbiAgLy8gbWF5IGRpc3RpbmN0IHdpdGggaWYgZWxzZVxuICB2YXIgZGVzdHJvaWVzID0gd2Fsa0F0dHJpYnV0ZXMuY2FsbCh0aGlzLCBhdHRycywgZWxlbWVudCwgZGVzdHJvaWVzKTtcblxuXG5cbiAgdmFyIHJlcyAgPSB7XG4gICAgdHlwZTogXCJlbGVtZW50XCIsXG4gICAgZ3JvdXA6IGdyb3VwLFxuICAgIG5vZGU6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9LFxuICAgIGxhc3Q6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9LFxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKGZpcnN0KXtcbiAgICAgIGlmKCBmaXJzdCApe1xuICAgICAgICBhbmltYXRlLnJlbW92ZSggZWxlbWVudCwgZ3JvdXA/IGdyb3VwLmRlc3Ryb3kuYmluZCggZ3JvdXAgKTogXy5ub29wICk7XG4gICAgICB9XG4gICAgICAvLyBkZXN0cm95IHJlZlxuICAgICAgaWYoIGRlc3Ryb2llcy5sZW5ndGggKSB7XG4gICAgICAgIGRlc3Ryb2llcy5mb3JFYWNoKGZ1bmN0aW9uKCBkZXN0cm95ICl7XG4gICAgICAgICAgaWYoIGRlc3Ryb3kgKXtcbiAgICAgICAgICAgIGlmKCB0eXBlb2YgZGVzdHJveS5kZXN0cm95ID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICAgIGRlc3Ryb3kuZGVzdHJveSgpXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gd2Fsa0F0dHJpYnV0ZXMoYXR0cnMsIGVsZW1lbnQpe1xuICB2YXIgYmluZGluZ3MgPSBbXVxuICBmb3IodmFyIGkgPSAwLCBsZW4gPSBhdHRycy5sZW5ndGg7IGkgPCBsZW47IGkrKyl7XG4gICAgdmFyIGJpbmRpbmcgPSB0aGlzLl93YWxrKGF0dHJzW2ldLCB7ZWxlbWVudDogZWxlbWVudCwgZnJvbUVsZW1lbnQ6IHRydWUsIGF0dHJzOiBhdHRyc30pXG4gICAgaWYoYmluZGluZykgYmluZGluZ3MucHVzaChiaW5kaW5nKTtcbiAgfVxuICByZXR1cm4gYmluZGluZ3M7XG59XG5cbndhbGtlcnMuYXR0cmlidXRlID0gZnVuY3Rpb24oYXN0ICxvcHRpb25zKXtcbiAgdmFyIGF0dHIgPSBhc3Q7XG4gIHZhciBDb21wb25lbnQgPSB0aGlzLmNvbnN0cnVjdG9yO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBlbGVtZW50ID0gb3B0aW9ucy5lbGVtZW50O1xuICB2YXIgbmFtZSA9IGF0dHIubmFtZSxcbiAgICB2YWx1ZSA9IGF0dHIudmFsdWUgfHwgXCJcIiwgZGlyZWN0aXZlID0gQ29tcG9uZW50LmRpcmVjdGl2ZShuYW1lKTtcblxuICBfLnRvdWNoRXhwcmVzc2lvbih2YWx1ZSk7XG5cblxuICBpZihkaXJlY3RpdmUgJiYgZGlyZWN0aXZlLmxpbmspe1xuICAgIHZhciBiaW5kaW5nID0gZGlyZWN0aXZlLmxpbmsuY2FsbChzZWxmLCBlbGVtZW50LCB2YWx1ZSwgbmFtZSwgb3B0aW9ucy5hdHRycyk7XG4gICAgaWYodHlwZW9mIGJpbmRpbmcgPT09ICdmdW5jdGlvbicpIGJpbmRpbmcgPSB7ZGVzdHJveTogYmluZGluZ307IFxuICAgIHJldHVybiBiaW5kaW5nO1xuICB9ZWxzZXtcbiAgICBpZiggbmFtZSA9PT0gJ3JlZicgICYmIHZhbHVlICE9IG51bGwgJiYgb3B0aW9ucy5mcm9tRWxlbWVudCl7XG4gICAgICB2YXIgcmVmID0gdmFsdWUudHlwZSA9PT0gJ2V4cHJlc3Npb24nPyB2YWx1ZS5nZXQoc2VsZik6IHZhbHVlO1xuICAgICAgdmFyIHJlZnMgPSB0aGlzLiRjb250ZXh0LiRyZWZzO1xuICAgICAgaWYocmVmcyl7XG4gICAgICAgIHJlZnNbcmVmXSA9IGVsZW1lbnRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmVmc1tyZWZdID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYodmFsdWUudHlwZSA9PT0gJ2V4cHJlc3Npb24nICl7XG5cbiAgICAgIHRoaXMuJHdhdGNoKHZhbHVlLCBmdW5jdGlvbihudmFsdWUsIG9sZCl7XG4gICAgICAgIGRvbS5hdHRyKGVsZW1lbnQsIG5hbWUsIG52YWx1ZSk7XG4gICAgICB9LCB7aW5pdDogdHJ1ZX0pO1xuICAgIH1lbHNle1xuICAgICAgaWYoXy5pc0Jvb2xlYW5BdHRyKG5hbWUpKXtcbiAgICAgICAgZG9tLmF0dHIoZWxlbWVudCwgbmFtZSwgdHJ1ZSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgZG9tLmF0dHIoZWxlbWVudCwgbmFtZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZighb3B0aW9ucy5mcm9tRWxlbWVudCl7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbigpe1xuICAgICAgICAgIGRvbS5hdHRyKGVsZW1lbnQsIG5hbWUsIG51bGwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cblxuIiwiLyohXG4gICogUmVxd2VzdCEgQSBnZW5lcmFsIHB1cnBvc2UgWEhSIGNvbm5lY3Rpb24gbWFuYWdlclxuICAqIGxpY2Vuc2UgTUlUIChjKSBEdXN0aW4gRGlheiAyMDE0XG4gICogaHR0cHM6Ly9naXRodWIuY29tL2RlZC9yZXF3ZXN0XG4gICovXG5cbiFmdW5jdGlvbiAobmFtZSwgY29udGV4dCwgZGVmaW5pdGlvbikge1xuICBpZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBkZWZpbml0aW9uKClcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShkZWZpbml0aW9uKVxuICBlbHNlIGNvbnRleHRbbmFtZV0gPSBkZWZpbml0aW9uKClcbn0oJ3JlcXdlc3QnLCB0aGlzLCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIHdpbiA9IHdpbmRvd1xuICAgICwgZG9jID0gZG9jdW1lbnRcbiAgICAsIGh0dHBzUmUgPSAvXmh0dHAvXG4gICAgLCBwcm90b2NvbFJlID0gLyheXFx3Kyk6XFwvXFwvL1xuICAgICwgdHdvSHVuZG8gPSAvXigyMFxcZHwxMjIzKSQvIC8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDA0Njk3Mi9tc2llLXJldHVybnMtc3RhdHVzLWNvZGUtb2YtMTIyMy1mb3ItYWpheC1yZXF1ZXN0XG4gICAgLCBieVRhZyA9ICdnZXRFbGVtZW50c0J5VGFnTmFtZSdcbiAgICAsIHJlYWR5U3RhdGUgPSAncmVhZHlTdGF0ZSdcbiAgICAsIGNvbnRlbnRUeXBlID0gJ0NvbnRlbnQtVHlwZSdcbiAgICAsIHJlcXVlc3RlZFdpdGggPSAnWC1SZXF1ZXN0ZWQtV2l0aCdcbiAgICAsIGhlYWQgPSBkb2NbYnlUYWddKCdoZWFkJylbMF1cbiAgICAsIHVuaXFpZCA9IDBcbiAgICAsIGNhbGxiYWNrUHJlZml4ID0gJ3JlcXdlc3RfJyArICgrbmV3IERhdGUoKSlcbiAgICAsIGxhc3RWYWx1ZSAvLyBkYXRhIHN0b3JlZCBieSB0aGUgbW9zdCByZWNlbnQgSlNPTlAgY2FsbGJhY2tcbiAgICAsIHhtbEh0dHBSZXF1ZXN0ID0gJ1hNTEh0dHBSZXF1ZXN0J1xuICAgICwgeERvbWFpblJlcXVlc3QgPSAnWERvbWFpblJlcXVlc3QnXG4gICAgLCBub29wID0gZnVuY3Rpb24gKCkge31cblxuICAgICwgaXNBcnJheSA9IHR5cGVvZiBBcnJheS5pc0FycmF5ID09ICdmdW5jdGlvbidcbiAgICAgICAgPyBBcnJheS5pc0FycmF5XG4gICAgICAgIDogZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBhIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICB9XG5cbiAgICAsIGRlZmF1bHRIZWFkZXJzID0ge1xuICAgICAgICAgICdjb250ZW50VHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG4gICAgICAgICwgJ3JlcXVlc3RlZFdpdGgnOiB4bWxIdHRwUmVxdWVzdFxuICAgICAgICAsICdhY2NlcHQnOiB7XG4gICAgICAgICAgICAgICcqJzogICd0ZXh0L2phdmFzY3JpcHQsIHRleHQvaHRtbCwgYXBwbGljYXRpb24veG1sLCB0ZXh0L3htbCwgKi8qJ1xuICAgICAgICAgICAgLCAneG1sJzogICdhcHBsaWNhdGlvbi94bWwsIHRleHQveG1sJ1xuICAgICAgICAgICAgLCAnaHRtbCc6ICd0ZXh0L2h0bWwnXG4gICAgICAgICAgICAsICd0ZXh0JzogJ3RleHQvcGxhaW4nXG4gICAgICAgICAgICAsICdqc29uJzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvamF2YXNjcmlwdCdcbiAgICAgICAgICAgICwgJ2pzJzogICAnYXBwbGljYXRpb24vamF2YXNjcmlwdCwgdGV4dC9qYXZhc2NyaXB0J1xuICAgICAgICAgIH1cbiAgICAgIH1cblxuICAgICwgeGhyID0gZnVuY3Rpb24obykge1xuICAgICAgICAvLyBpcyBpdCB4LWRvbWFpblxuICAgICAgICBpZiAob1snY3Jvc3NPcmlnaW4nXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHZhciB4aHIgPSB3aW5beG1sSHR0cFJlcXVlc3RdID8gbmV3IFhNTEh0dHBSZXF1ZXN0KCkgOiBudWxsXG4gICAgICAgICAgaWYgKHhociAmJiAnd2l0aENyZWRlbnRpYWxzJyBpbiB4aHIpIHtcbiAgICAgICAgICAgIHJldHVybiB4aHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHdpblt4RG9tYWluUmVxdWVzdF0pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgWERvbWFpblJlcXVlc3QoKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBjcm9zcy1vcmlnaW4gcmVxdWVzdHMnKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh3aW5beG1sSHR0cFJlcXVlc3RdKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MSFRUUCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAsIGdsb2JhbFNldHVwT3B0aW9ucyA9IHtcbiAgICAgICAgZGF0YUZpbHRlcjogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gZGF0YVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgZnVuY3Rpb24gc3VjY2VlZChyKSB7XG4gICAgdmFyIHByb3RvY29sID0gcHJvdG9jb2xSZS5leGVjKHIudXJsKTtcbiAgICBwcm90b2NvbCA9IChwcm90b2NvbCAmJiBwcm90b2NvbFsxXSkgfHwgd2luZG93LmxvY2F0aW9uLnByb3RvY29sO1xuICAgIHJldHVybiBodHRwc1JlLnRlc3QocHJvdG9jb2wpID8gdHdvSHVuZG8udGVzdChyLnJlcXVlc3Quc3RhdHVzKSA6ICEhci5yZXF1ZXN0LnJlc3BvbnNlO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlUmVhZHlTdGF0ZShyLCBzdWNjZXNzLCBlcnJvcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyB1c2UgX2Fib3J0ZWQgdG8gbWl0aWdhdGUgYWdhaW5zdCBJRSBlcnIgYzAwYzAyM2ZcbiAgICAgIC8vIChjYW4ndCByZWFkIHByb3BzIG9uIGFib3J0ZWQgcmVxdWVzdCBvYmplY3RzKVxuICAgICAgaWYgKHIuX2Fib3J0ZWQpIHJldHVybiBlcnJvcihyLnJlcXVlc3QpXG4gICAgICBpZiAoci5fdGltZWRPdXQpIHJldHVybiBlcnJvcihyLnJlcXVlc3QsICdSZXF1ZXN0IGlzIGFib3J0ZWQ6IHRpbWVvdXQnKVxuICAgICAgaWYgKHIucmVxdWVzdCAmJiByLnJlcXVlc3RbcmVhZHlTdGF0ZV0gPT0gNCkge1xuICAgICAgICByLnJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gbm9vcFxuICAgICAgICBpZiAoc3VjY2VlZChyKSkgc3VjY2VzcyhyLnJlcXVlc3QpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBlcnJvcihyLnJlcXVlc3QpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2V0SGVhZGVycyhodHRwLCBvKSB7XG4gICAgdmFyIGhlYWRlcnMgPSBvWydoZWFkZXJzJ10gfHwge31cbiAgICAgICwgaFxuXG4gICAgaGVhZGVyc1snQWNjZXB0J10gPSBoZWFkZXJzWydBY2NlcHQnXVxuICAgICAgfHwgZGVmYXVsdEhlYWRlcnNbJ2FjY2VwdCddW29bJ3R5cGUnXV1cbiAgICAgIHx8IGRlZmF1bHRIZWFkZXJzWydhY2NlcHQnXVsnKiddXG5cbiAgICB2YXIgaXNBRm9ybURhdGEgPSB0eXBlb2YgRm9ybURhdGEgPT09ICdmdW5jdGlvbicgJiYgKG9bJ2RhdGEnXSBpbnN0YW5jZW9mIEZvcm1EYXRhKTtcbiAgICAvLyBicmVha3MgY3Jvc3Mtb3JpZ2luIHJlcXVlc3RzIHdpdGggbGVnYWN5IGJyb3dzZXJzXG4gICAgaWYgKCFvWydjcm9zc09yaWdpbiddICYmICFoZWFkZXJzW3JlcXVlc3RlZFdpdGhdKSBoZWFkZXJzW3JlcXVlc3RlZFdpdGhdID0gZGVmYXVsdEhlYWRlcnNbJ3JlcXVlc3RlZFdpdGgnXVxuICAgIGlmICghaGVhZGVyc1tjb250ZW50VHlwZV0gJiYgIWlzQUZvcm1EYXRhKSBoZWFkZXJzW2NvbnRlbnRUeXBlXSA9IG9bJ2NvbnRlbnRUeXBlJ10gfHwgZGVmYXVsdEhlYWRlcnNbJ2NvbnRlbnRUeXBlJ11cbiAgICBmb3IgKGggaW4gaGVhZGVycylcbiAgICAgIGhlYWRlcnMuaGFzT3duUHJvcGVydHkoaCkgJiYgJ3NldFJlcXVlc3RIZWFkZXInIGluIGh0dHAgJiYgaHR0cC5zZXRSZXF1ZXN0SGVhZGVyKGgsIGhlYWRlcnNbaF0pXG4gIH1cblxuICBmdW5jdGlvbiBzZXRDcmVkZW50aWFscyhodHRwLCBvKSB7XG4gICAgaWYgKHR5cGVvZiBvWyd3aXRoQ3JlZGVudGlhbHMnXSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGh0dHAud2l0aENyZWRlbnRpYWxzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgaHR0cC53aXRoQ3JlZGVudGlhbHMgPSAhIW9bJ3dpdGhDcmVkZW50aWFscyddXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhbENhbGxiYWNrKGRhdGEpIHtcbiAgICBsYXN0VmFsdWUgPSBkYXRhXG4gIH1cblxuICBmdW5jdGlvbiB1cmxhcHBlbmQgKHVybCwgcykge1xuICAgIHJldHVybiB1cmwgKyAoL1xcPy8udGVzdCh1cmwpID8gJyYnIDogJz8nKSArIHNcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUpzb25wKG8sIGZuLCBlcnIsIHVybCkge1xuICAgIHZhciByZXFJZCA9IHVuaXFpZCsrXG4gICAgICAsIGNia2V5ID0gb1snanNvbnBDYWxsYmFjayddIHx8ICdjYWxsYmFjaycgLy8gdGhlICdjYWxsYmFjaycga2V5XG4gICAgICAsIGNidmFsID0gb1snanNvbnBDYWxsYmFja05hbWUnXSB8fCByZXF3ZXN0LmdldGNhbGxiYWNrUHJlZml4KHJlcUlkKVxuICAgICAgLCBjYnJlZyA9IG5ldyBSZWdFeHAoJygoXnxcXFxcP3wmKScgKyBjYmtleSArICcpPShbXiZdKyknKVxuICAgICAgLCBtYXRjaCA9IHVybC5tYXRjaChjYnJlZylcbiAgICAgICwgc2NyaXB0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4gICAgICAsIGxvYWRlZCA9IDBcbiAgICAgICwgaXNJRTEwID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdNU0lFIDEwLjAnKSAhPT0gLTFcblxuICAgIGlmIChtYXRjaCkge1xuICAgICAgaWYgKG1hdGNoWzNdID09PSAnPycpIHtcbiAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoY2JyZWcsICckMT0nICsgY2J2YWwpIC8vIHdpbGRjYXJkIGNhbGxiYWNrIGZ1bmMgbmFtZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2J2YWwgPSBtYXRjaFszXSAvLyBwcm92aWRlZCBjYWxsYmFjayBmdW5jIG5hbWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdXJsID0gdXJsYXBwZW5kKHVybCwgY2JrZXkgKyAnPScgKyBjYnZhbCkgLy8gbm8gY2FsbGJhY2sgZGV0YWlscywgYWRkICdlbVxuICAgIH1cblxuICAgIHdpbltjYnZhbF0gPSBnZW5lcmFsQ2FsbGJhY2tcblxuICAgIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCdcbiAgICBzY3JpcHQuc3JjID0gdXJsXG4gICAgc2NyaXB0LmFzeW5jID0gdHJ1ZVxuICAgIGlmICh0eXBlb2Ygc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSAhPT0gJ3VuZGVmaW5lZCcgJiYgIWlzSUUxMCkge1xuICAgICAgLy8gbmVlZCB0aGlzIGZvciBJRSBkdWUgdG8gb3V0LW9mLW9yZGVyIG9ucmVhZHlzdGF0ZWNoYW5nZSgpLCBiaW5kaW5nIHNjcmlwdFxuICAgICAgLy8gZXhlY3V0aW9uIHRvIGFuIGV2ZW50IGxpc3RlbmVyIGdpdmVzIHVzIGNvbnRyb2wgb3ZlciB3aGVuIHRoZSBzY3JpcHRcbiAgICAgIC8vIGlzIGV4ZWN1dGVkLiBTZWUgaHR0cDovL2phdWJvdXJnLm5ldC8yMDEwLzA3L2xvYWRpbmctc2NyaXB0LWFzLW9uY2xpY2staGFuZGxlci1vZi5odG1sXG4gICAgICBzY3JpcHQuaHRtbEZvciA9IHNjcmlwdC5pZCA9ICdfcmVxd2VzdF8nICsgcmVxSWRcbiAgICB9XG5cbiAgICBzY3JpcHQub25sb2FkID0gc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICgoc2NyaXB0W3JlYWR5U3RhdGVdICYmIHNjcmlwdFtyZWFkeVN0YXRlXSAhPT0gJ2NvbXBsZXRlJyAmJiBzY3JpcHRbcmVhZHlTdGF0ZV0gIT09ICdsb2FkZWQnKSB8fCBsb2FkZWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBzY3JpcHQub25sb2FkID0gc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGxcbiAgICAgIHNjcmlwdC5vbmNsaWNrICYmIHNjcmlwdC5vbmNsaWNrKClcbiAgICAgIC8vIENhbGwgdGhlIHVzZXIgY2FsbGJhY2sgd2l0aCB0aGUgbGFzdCB2YWx1ZSBzdG9yZWQgYW5kIGNsZWFuIHVwIHZhbHVlcyBhbmQgc2NyaXB0cy5cbiAgICAgIGZuKGxhc3RWYWx1ZSlcbiAgICAgIGxhc3RWYWx1ZSA9IHVuZGVmaW5lZFxuICAgICAgaGVhZC5yZW1vdmVDaGlsZChzY3JpcHQpXG4gICAgICBsb2FkZWQgPSAxXG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSBzY3JpcHQgdG8gdGhlIERPTSBoZWFkXG4gICAgaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG5cbiAgICAvLyBFbmFibGUgSlNPTlAgdGltZW91dFxuICAgIHJldHVybiB7XG4gICAgICBhYm9ydDogZnVuY3Rpb24gKCkge1xuICAgICAgICBzY3JpcHQub25sb2FkID0gc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGxcbiAgICAgICAgZXJyKHt9LCAnUmVxdWVzdCBpcyBhYm9ydGVkOiB0aW1lb3V0Jywge30pXG4gICAgICAgIGxhc3RWYWx1ZSA9IHVuZGVmaW5lZFxuICAgICAgICBoZWFkLnJlbW92ZUNoaWxkKHNjcmlwdClcbiAgICAgICAgbG9hZGVkID0gMVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFJlcXVlc3QoZm4sIGVycikge1xuICAgIHZhciBvID0gdGhpcy5vXG4gICAgICAsIG1ldGhvZCA9IChvWydtZXRob2QnXSB8fCAnR0VUJykudG9VcHBlckNhc2UoKVxuICAgICAgLCB1cmwgPSB0eXBlb2YgbyA9PT0gJ3N0cmluZycgPyBvIDogb1sndXJsJ11cbiAgICAgIC8vIGNvbnZlcnQgbm9uLXN0cmluZyBvYmplY3RzIHRvIHF1ZXJ5LXN0cmluZyBmb3JtIHVubGVzcyBvWydwcm9jZXNzRGF0YSddIGlzIGZhbHNlXG4gICAgICAsIGRhdGEgPSAob1sncHJvY2Vzc0RhdGEnXSAhPT0gZmFsc2UgJiYgb1snZGF0YSddICYmIHR5cGVvZiBvWydkYXRhJ10gIT09ICdzdHJpbmcnKVxuICAgICAgICA/IHJlcXdlc3QudG9RdWVyeVN0cmluZyhvWydkYXRhJ10pXG4gICAgICAgIDogKG9bJ2RhdGEnXSB8fCBudWxsKVxuICAgICAgLCBodHRwXG4gICAgICAsIHNlbmRXYWl0ID0gZmFsc2VcblxuICAgIC8vIGlmIHdlJ3JlIHdvcmtpbmcgb24gYSBHRVQgcmVxdWVzdCBhbmQgd2UgaGF2ZSBkYXRhIHRoZW4gd2Ugc2hvdWxkIGFwcGVuZFxuICAgIC8vIHF1ZXJ5IHN0cmluZyB0byBlbmQgb2YgVVJMIGFuZCBub3QgcG9zdCBkYXRhXG4gICAgaWYgKChvWyd0eXBlJ10gPT0gJ2pzb25wJyB8fCBtZXRob2QgPT0gJ0dFVCcpICYmIGRhdGEpIHtcbiAgICAgIHVybCA9IHVybGFwcGVuZCh1cmwsIGRhdGEpXG4gICAgICBkYXRhID0gbnVsbFxuICAgIH1cblxuICAgIGlmIChvWyd0eXBlJ10gPT0gJ2pzb25wJykgcmV0dXJuIGhhbmRsZUpzb25wKG8sIGZuLCBlcnIsIHVybClcblxuICAgIC8vIGdldCB0aGUgeGhyIGZyb20gdGhlIGZhY3RvcnkgaWYgcGFzc2VkXG4gICAgLy8gaWYgdGhlIGZhY3RvcnkgcmV0dXJucyBudWxsLCBmYWxsLWJhY2sgdG8gb3Vyc1xuICAgIGh0dHAgPSAoby54aHIgJiYgby54aHIobykpIHx8IHhocihvKVxuXG4gICAgaHR0cC5vcGVuKG1ldGhvZCwgdXJsLCBvWydhc3luYyddID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSlcbiAgICBzZXRIZWFkZXJzKGh0dHAsIG8pXG4gICAgc2V0Q3JlZGVudGlhbHMoaHR0cCwgbylcbiAgICBpZiAod2luW3hEb21haW5SZXF1ZXN0XSAmJiBodHRwIGluc3RhbmNlb2Ygd2luW3hEb21haW5SZXF1ZXN0XSkge1xuICAgICAgICBodHRwLm9ubG9hZCA9IGZuXG4gICAgICAgIGh0dHAub25lcnJvciA9IGVyclxuICAgICAgICAvLyBOT1RFOiBzZWVcbiAgICAgICAgLy8gaHR0cDovL3NvY2lhbC5tc2RuLm1pY3Jvc29mdC5jb20vRm9ydW1zL2VuLVVTL2lld2ViZGV2ZWxvcG1lbnQvdGhyZWFkLzMwZWYzYWRkLTc2N2MtNDQzNi1iOGE5LWYxY2ExOWI0ODEyZVxuICAgICAgICBodHRwLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbigpIHt9XG4gICAgICAgIHNlbmRXYWl0ID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICBodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGhhbmRsZVJlYWR5U3RhdGUodGhpcywgZm4sIGVycilcbiAgICB9XG4gICAgb1snYmVmb3JlJ10gJiYgb1snYmVmb3JlJ10oaHR0cClcbiAgICBpZiAoc2VuZFdhaXQpIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBodHRwLnNlbmQoZGF0YSlcbiAgICAgIH0sIDIwMClcbiAgICB9IGVsc2Uge1xuICAgICAgaHR0cC5zZW5kKGRhdGEpXG4gICAgfVxuICAgIHJldHVybiBodHRwXG4gIH1cblxuICBmdW5jdGlvbiBSZXF3ZXN0KG8sIGZuKSB7XG4gICAgdGhpcy5vID0gb1xuICAgIHRoaXMuZm4gPSBmblxuXG4gICAgaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gIH1cblxuICBmdW5jdGlvbiBzZXRUeXBlKGhlYWRlcikge1xuICAgIC8vIGpzb24sIGphdmFzY3JpcHQsIHRleHQvcGxhaW4sIHRleHQvaHRtbCwgeG1sXG4gICAgaWYgKGhlYWRlci5tYXRjaCgnanNvbicpKSByZXR1cm4gJ2pzb24nXG4gICAgaWYgKGhlYWRlci5tYXRjaCgnamF2YXNjcmlwdCcpKSByZXR1cm4gJ2pzJ1xuICAgIGlmIChoZWFkZXIubWF0Y2goJ3RleHQnKSkgcmV0dXJuICdodG1sJ1xuICAgIGlmIChoZWFkZXIubWF0Y2goJ3htbCcpKSByZXR1cm4gJ3htbCdcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQobywgZm4pIHtcblxuICAgIHRoaXMudXJsID0gdHlwZW9mIG8gPT0gJ3N0cmluZycgPyBvIDogb1sndXJsJ11cbiAgICB0aGlzLnRpbWVvdXQgPSBudWxsXG5cbiAgICAvLyB3aGV0aGVyIHJlcXVlc3QgaGFzIGJlZW4gZnVsZmlsbGVkIGZvciBwdXJwb3NlXG4gICAgLy8gb2YgdHJhY2tpbmcgdGhlIFByb21pc2VzXG4gICAgdGhpcy5fZnVsZmlsbGVkID0gZmFsc2VcbiAgICAvLyBzdWNjZXNzIGhhbmRsZXJzXG4gICAgdGhpcy5fc3VjY2Vzc0hhbmRsZXIgPSBmdW5jdGlvbigpe31cbiAgICB0aGlzLl9mdWxmaWxsbWVudEhhbmRsZXJzID0gW11cbiAgICAvLyBlcnJvciBoYW5kbGVyc1xuICAgIHRoaXMuX2Vycm9ySGFuZGxlcnMgPSBbXVxuICAgIC8vIGNvbXBsZXRlIChib3RoIHN1Y2Nlc3MgYW5kIGZhaWwpIGhhbmRsZXJzXG4gICAgdGhpcy5fY29tcGxldGVIYW5kbGVycyA9IFtdXG4gICAgdGhpcy5fZXJyZWQgPSBmYWxzZVxuICAgIHRoaXMuX3Jlc3BvbnNlQXJncyA9IHt9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcblxuICAgIGZuID0gZm4gfHwgZnVuY3Rpb24gKCkge31cblxuICAgIGlmIChvWyd0aW1lb3V0J10pIHtcbiAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aW1lZE91dCgpXG4gICAgICB9LCBvWyd0aW1lb3V0J10pXG4gICAgfVxuXG4gICAgaWYgKG9bJ3N1Y2Nlc3MnXSkge1xuICAgICAgdGhpcy5fc3VjY2Vzc0hhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG9bJ3N1Y2Nlc3MnXS5hcHBseShvLCBhcmd1bWVudHMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9bJ2Vycm9yJ10pIHtcbiAgICAgIHRoaXMuX2Vycm9ySGFuZGxlcnMucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIG9bJ2Vycm9yJ10uYXBwbHkobywgYXJndW1lbnRzKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAob1snY29tcGxldGUnXSkge1xuICAgICAgdGhpcy5fY29tcGxldGVIYW5kbGVycy5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb1snY29tcGxldGUnXS5hcHBseShvLCBhcmd1bWVudHMpXG4gICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlIChyZXNwKSB7XG4gICAgICBvWyd0aW1lb3V0J10gJiYgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dClcbiAgICAgIHNlbGYudGltZW91dCA9IG51bGxcbiAgICAgIHdoaWxlIChzZWxmLl9jb21wbGV0ZUhhbmRsZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc2VsZi5fY29tcGxldGVIYW5kbGVycy5zaGlmdCgpKHJlc3ApXG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3VjY2VzcyAocmVzcCkge1xuICAgICAgdmFyIHR5cGUgPSBvWyd0eXBlJ10gfHwgcmVzcCAmJiBzZXRUeXBlKHJlc3AuZ2V0UmVzcG9uc2VIZWFkZXIoJ0NvbnRlbnQtVHlwZScpKSAvLyByZXNwIGNhbiBiZSB1bmRlZmluZWQgaW4gSUVcbiAgICAgIHJlc3AgPSAodHlwZSAhPT0gJ2pzb25wJykgPyBzZWxmLnJlcXVlc3QgOiByZXNwXG4gICAgICAvLyB1c2UgZ2xvYmFsIGRhdGEgZmlsdGVyIG9uIHJlc3BvbnNlIHRleHRcbiAgICAgIHZhciBmaWx0ZXJlZFJlc3BvbnNlID0gZ2xvYmFsU2V0dXBPcHRpb25zLmRhdGFGaWx0ZXIocmVzcC5yZXNwb25zZVRleHQsIHR5cGUpXG4gICAgICAgICwgciA9IGZpbHRlcmVkUmVzcG9uc2VcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc3AucmVzcG9uc2VUZXh0ID0gclxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBjYW4ndCBhc3NpZ24gdGhpcyBpbiBJRTw9OCwganVzdCBpZ25vcmVcbiAgICAgIH1cbiAgICAgIGlmIChyKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzcCA9IHdpbi5KU09OID8gd2luLkpTT04ucGFyc2UocikgOiBldmFsKCcoJyArIHIgKyAnKScpXG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gZXJyb3IocmVzcCwgJ0NvdWxkIG5vdCBwYXJzZSBKU09OIGluIHJlc3BvbnNlJywgZXJyKVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdqcyc6XG4gICAgICAgICAgcmVzcCA9IGV2YWwocilcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICdodG1sJzpcbiAgICAgICAgICByZXNwID0gclxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgJ3htbCc6XG4gICAgICAgICAgcmVzcCA9IHJlc3AucmVzcG9uc2VYTUxcbiAgICAgICAgICAgICAgJiYgcmVzcC5yZXNwb25zZVhNTC5wYXJzZUVycm9yIC8vIElFIHRyb2xvbG9cbiAgICAgICAgICAgICAgJiYgcmVzcC5yZXNwb25zZVhNTC5wYXJzZUVycm9yLmVycm9yQ29kZVxuICAgICAgICAgICAgICAmJiByZXNwLnJlc3BvbnNlWE1MLnBhcnNlRXJyb3IucmVhc29uXG4gICAgICAgICAgICA/IG51bGxcbiAgICAgICAgICAgIDogcmVzcC5yZXNwb25zZVhNTFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VsZi5fcmVzcG9uc2VBcmdzLnJlc3AgPSByZXNwXG4gICAgICBzZWxmLl9mdWxmaWxsZWQgPSB0cnVlXG4gICAgICBmbihyZXNwKVxuICAgICAgc2VsZi5fc3VjY2Vzc0hhbmRsZXIocmVzcClcbiAgICAgIHdoaWxlIChzZWxmLl9mdWxmaWxsbWVudEhhbmRsZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmVzcCA9IHNlbGYuX2Z1bGZpbGxtZW50SGFuZGxlcnMuc2hpZnQoKShyZXNwKVxuICAgICAgfVxuXG4gICAgICBjb21wbGV0ZShyZXNwKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRpbWVkT3V0KCkge1xuICAgICAgc2VsZi5fdGltZWRPdXQgPSB0cnVlXG4gICAgICBzZWxmLnJlcXVlc3QuYWJvcnQoKSAgICAgIFxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVycm9yKHJlc3AsIG1zZywgdCkge1xuICAgICAgcmVzcCA9IHNlbGYucmVxdWVzdFxuICAgICAgc2VsZi5fcmVzcG9uc2VBcmdzLnJlc3AgPSByZXNwXG4gICAgICBzZWxmLl9yZXNwb25zZUFyZ3MubXNnID0gbXNnXG4gICAgICBzZWxmLl9yZXNwb25zZUFyZ3MudCA9IHRcbiAgICAgIHNlbGYuX2VycmVkID0gdHJ1ZVxuICAgICAgd2hpbGUgKHNlbGYuX2Vycm9ySGFuZGxlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZWxmLl9lcnJvckhhbmRsZXJzLnNoaWZ0KCkocmVzcCwgbXNnLCB0KVxuICAgICAgfVxuICAgICAgY29tcGxldGUocmVzcClcbiAgICB9XG5cbiAgICB0aGlzLnJlcXVlc3QgPSBnZXRSZXF1ZXN0LmNhbGwodGhpcywgc3VjY2VzcywgZXJyb3IpXG4gIH1cblxuICBSZXF3ZXN0LnByb3RvdHlwZSA9IHtcbiAgICBhYm9ydDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5fYWJvcnRlZCA9IHRydWVcbiAgICAgIHRoaXMucmVxdWVzdC5hYm9ydCgpXG4gICAgfVxuXG4gICwgcmV0cnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGluaXQuY2FsbCh0aGlzLCB0aGlzLm8sIHRoaXMuZm4pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU21hbGwgZGV2aWF0aW9uIGZyb20gdGhlIFByb21pc2VzIEEgQ29tbW9uSnMgc3BlY2lmaWNhdGlvblxuICAgICAqIGh0dHA6Ly93aWtpLmNvbW1vbmpzLm9yZy93aWtpL1Byb21pc2VzL0FcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIGB0aGVuYCB3aWxsIGV4ZWN1dGUgdXBvbiBzdWNjZXNzZnVsIHJlcXVlc3RzXG4gICAgICovXG4gICwgdGhlbjogZnVuY3Rpb24gKHN1Y2Nlc3MsIGZhaWwpIHtcbiAgICAgIHN1Y2Nlc3MgPSBzdWNjZXNzIHx8IGZ1bmN0aW9uICgpIHt9XG4gICAgICBmYWlsID0gZmFpbCB8fCBmdW5jdGlvbiAoKSB7fVxuICAgICAgaWYgKHRoaXMuX2Z1bGZpbGxlZCkge1xuICAgICAgICB0aGlzLl9yZXNwb25zZUFyZ3MucmVzcCA9IHN1Y2Nlc3ModGhpcy5fcmVzcG9uc2VBcmdzLnJlc3ApXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2VycmVkKSB7XG4gICAgICAgIGZhaWwodGhpcy5fcmVzcG9uc2VBcmdzLnJlc3AsIHRoaXMuX3Jlc3BvbnNlQXJncy5tc2csIHRoaXMuX3Jlc3BvbnNlQXJncy50KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZnVsZmlsbG1lbnRIYW5kbGVycy5wdXNoKHN1Y2Nlc3MpXG4gICAgICAgIHRoaXMuX2Vycm9ySGFuZGxlcnMucHVzaChmYWlsKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBgYWx3YXlzYCB3aWxsIGV4ZWN1dGUgd2hldGhlciB0aGUgcmVxdWVzdCBzdWNjZWVkcyBvciBmYWlsc1xuICAgICAqL1xuICAsIGFsd2F5czogZnVuY3Rpb24gKGZuKSB7XG4gICAgICBpZiAodGhpcy5fZnVsZmlsbGVkIHx8IHRoaXMuX2VycmVkKSB7XG4gICAgICAgIGZuKHRoaXMuX3Jlc3BvbnNlQXJncy5yZXNwKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29tcGxldGVIYW5kbGVycy5wdXNoKGZuKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBgZmFpbGAgd2lsbCBleGVjdXRlIHdoZW4gdGhlIHJlcXVlc3QgZmFpbHNcbiAgICAgKi9cbiAgLCBmYWlsOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIGlmICh0aGlzLl9lcnJlZCkge1xuICAgICAgICBmbih0aGlzLl9yZXNwb25zZUFyZ3MucmVzcCwgdGhpcy5fcmVzcG9uc2VBcmdzLm1zZywgdGhpcy5fcmVzcG9uc2VBcmdzLnQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9lcnJvckhhbmRsZXJzLnB1c2goZm4pXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cbiAgLCAnY2F0Y2gnOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHJldHVybiB0aGlzLmZhaWwoZm4pXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVxd2VzdChvLCBmbikge1xuICAgIHJldHVybiBuZXcgUmVxd2VzdChvLCBmbilcbiAgfVxuXG4gIC8vIG5vcm1hbGl6ZSBuZXdsaW5lIHZhcmlhbnRzIGFjY29yZGluZyB0byBzcGVjIC0+IENSTEZcbiAgZnVuY3Rpb24gbm9ybWFsaXplKHMpIHtcbiAgICByZXR1cm4gcyA/IHMucmVwbGFjZSgvXFxyP1xcbi9nLCAnXFxyXFxuJykgOiAnJ1xuICB9XG5cbiAgZnVuY3Rpb24gc2VyaWFsKGVsLCBjYikge1xuICAgIHZhciBuID0gZWwubmFtZVxuICAgICAgLCB0ID0gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICAsIG9wdENiID0gZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAvLyBJRSBnaXZlcyB2YWx1ZT1cIlwiIGV2ZW4gd2hlcmUgdGhlcmUgaXMgbm8gdmFsdWUgYXR0cmlidXRlXG4gICAgICAgICAgLy8gJ3NwZWNpZmllZCcgcmVmOiBodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1Db3JlL2NvcmUuaHRtbCNJRC04NjI1MjkyNzNcbiAgICAgICAgICBpZiAobyAmJiAhb1snZGlzYWJsZWQnXSlcbiAgICAgICAgICAgIGNiKG4sIG5vcm1hbGl6ZShvWydhdHRyaWJ1dGVzJ11bJ3ZhbHVlJ10gJiYgb1snYXR0cmlidXRlcyddWyd2YWx1ZSddWydzcGVjaWZpZWQnXSA/IG9bJ3ZhbHVlJ10gOiBvWyd0ZXh0J10pKVxuICAgICAgICB9XG4gICAgICAsIGNoLCByYSwgdmFsLCBpXG5cbiAgICAvLyBkb24ndCBzZXJpYWxpemUgZWxlbWVudHMgdGhhdCBhcmUgZGlzYWJsZWQgb3Igd2l0aG91dCBhIG5hbWVcbiAgICBpZiAoZWwuZGlzYWJsZWQgfHwgIW4pIHJldHVyblxuXG4gICAgc3dpdGNoICh0KSB7XG4gICAgY2FzZSAnaW5wdXQnOlxuICAgICAgaWYgKCEvcmVzZXR8YnV0dG9ufGltYWdlfGZpbGUvaS50ZXN0KGVsLnR5cGUpKSB7XG4gICAgICAgIGNoID0gL2NoZWNrYm94L2kudGVzdChlbC50eXBlKVxuICAgICAgICByYSA9IC9yYWRpby9pLnRlc3QoZWwudHlwZSlcbiAgICAgICAgdmFsID0gZWwudmFsdWVcbiAgICAgICAgLy8gV2ViS2l0IGdpdmVzIHVzIFwiXCIgaW5zdGVhZCBvZiBcIm9uXCIgaWYgYSBjaGVja2JveCBoYXMgbm8gdmFsdWUsIHNvIGNvcnJlY3QgaXQgaGVyZVxuICAgICAgICA7KCEoY2ggfHwgcmEpIHx8IGVsLmNoZWNrZWQpICYmIGNiKG4sIG5vcm1hbGl6ZShjaCAmJiB2YWwgPT09ICcnID8gJ29uJyA6IHZhbCkpXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIGNhc2UgJ3RleHRhcmVhJzpcbiAgICAgIGNiKG4sIG5vcm1hbGl6ZShlbC52YWx1ZSkpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICBpZiAoZWwudHlwZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0LW9uZScpIHtcbiAgICAgICAgb3B0Q2IoZWwuc2VsZWN0ZWRJbmRleCA+PSAwID8gZWwub3B0aW9uc1tlbC5zZWxlY3RlZEluZGV4XSA6IG51bGwpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGkgPSAwOyBlbC5sZW5ndGggJiYgaSA8IGVsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZWwub3B0aW9uc1tpXS5zZWxlY3RlZCAmJiBvcHRDYihlbC5vcHRpb25zW2ldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIC8vIGNvbGxlY3QgdXAgYWxsIGZvcm0gZWxlbWVudHMgZm91bmQgZnJvbSB0aGUgcGFzc2VkIGFyZ3VtZW50IGVsZW1lbnRzIGFsbFxuICAvLyB0aGUgd2F5IGRvd24gdG8gY2hpbGQgZWxlbWVudHM7IHBhc3MgYSAnPGZvcm0+JyBvciBmb3JtIGZpZWxkcy5cbiAgLy8gY2FsbGVkIHdpdGggJ3RoaXMnPWNhbGxiYWNrIHRvIHVzZSBmb3Igc2VyaWFsKCkgb24gZWFjaCBlbGVtZW50XG4gIGZ1bmN0aW9uIGVhY2hGb3JtRWxlbWVudCgpIHtcbiAgICB2YXIgY2IgPSB0aGlzXG4gICAgICAsIGUsIGlcbiAgICAgICwgc2VyaWFsaXplU3VidGFncyA9IGZ1bmN0aW9uIChlLCB0YWdzKSB7XG4gICAgICAgICAgdmFyIGksIGosIGZhXG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRhZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGZhID0gZVtieVRhZ10odGFnc1tpXSlcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBmYS5sZW5ndGg7IGorKykgc2VyaWFsKGZhW2pdLCBjYilcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGUgPSBhcmd1bWVudHNbaV1cbiAgICAgIGlmICgvaW5wdXR8c2VsZWN0fHRleHRhcmVhL2kudGVzdChlLnRhZ05hbWUpKSBzZXJpYWwoZSwgY2IpXG4gICAgICBzZXJpYWxpemVTdWJ0YWdzKGUsIFsgJ2lucHV0JywgJ3NlbGVjdCcsICd0ZXh0YXJlYScgXSlcbiAgICB9XG4gIH1cblxuICAvLyBzdGFuZGFyZCBxdWVyeSBzdHJpbmcgc3R5bGUgc2VyaWFsaXphdGlvblxuICBmdW5jdGlvbiBzZXJpYWxpemVRdWVyeVN0cmluZygpIHtcbiAgICByZXR1cm4gcmVxd2VzdC50b1F1ZXJ5U3RyaW5nKHJlcXdlc3Quc2VyaWFsaXplQXJyYXkuYXBwbHkobnVsbCwgYXJndW1lbnRzKSlcbiAgfVxuXG4gIC8vIHsgJ25hbWUnOiAndmFsdWUnLCAuLi4gfSBzdHlsZSBzZXJpYWxpemF0aW9uXG4gIGZ1bmN0aW9uIHNlcmlhbGl6ZUhhc2goKSB7XG4gICAgdmFyIGhhc2ggPSB7fVxuICAgIGVhY2hGb3JtRWxlbWVudC5hcHBseShmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgIGlmIChuYW1lIGluIGhhc2gpIHtcbiAgICAgICAgaGFzaFtuYW1lXSAmJiAhaXNBcnJheShoYXNoW25hbWVdKSAmJiAoaGFzaFtuYW1lXSA9IFtoYXNoW25hbWVdXSlcbiAgICAgICAgaGFzaFtuYW1lXS5wdXNoKHZhbHVlKVxuICAgICAgfSBlbHNlIGhhc2hbbmFtZV0gPSB2YWx1ZVxuICAgIH0sIGFyZ3VtZW50cylcbiAgICByZXR1cm4gaGFzaFxuICB9XG5cbiAgLy8gWyB7IG5hbWU6ICduYW1lJywgdmFsdWU6ICd2YWx1ZScgfSwgLi4uIF0gc3R5bGUgc2VyaWFsaXphdGlvblxuICByZXF3ZXN0LnNlcmlhbGl6ZUFycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcnIgPSBbXVxuICAgIGVhY2hGb3JtRWxlbWVudC5hcHBseShmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgIGFyci5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWV9KVxuICAgIH0sIGFyZ3VtZW50cylcbiAgICByZXR1cm4gYXJyXG4gIH1cblxuICByZXF3ZXN0LnNlcmlhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gICAgdmFyIG9wdCwgZm5cbiAgICAgICwgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMClcblxuICAgIG9wdCA9IGFyZ3MucG9wKClcbiAgICBvcHQgJiYgb3B0Lm5vZGVUeXBlICYmIGFyZ3MucHVzaChvcHQpICYmIChvcHQgPSBudWxsKVxuICAgIG9wdCAmJiAob3B0ID0gb3B0LnR5cGUpXG5cbiAgICBpZiAob3B0ID09ICdtYXAnKSBmbiA9IHNlcmlhbGl6ZUhhc2hcbiAgICBlbHNlIGlmIChvcHQgPT0gJ2FycmF5JykgZm4gPSByZXF3ZXN0LnNlcmlhbGl6ZUFycmF5XG4gICAgZWxzZSBmbiA9IHNlcmlhbGl6ZVF1ZXJ5U3RyaW5nXG5cbiAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgYXJncylcbiAgfVxuXG4gIHJlcXdlc3QudG9RdWVyeVN0cmluZyA9IGZ1bmN0aW9uIChvLCB0cmFkKSB7XG4gICAgdmFyIHByZWZpeCwgaVxuICAgICAgLCB0cmFkaXRpb25hbCA9IHRyYWQgfHwgZmFsc2VcbiAgICAgICwgcyA9IFtdXG4gICAgICAsIGVuYyA9IGVuY29kZVVSSUNvbXBvbmVudFxuICAgICAgLCBhZGQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgIC8vIElmIHZhbHVlIGlzIGEgZnVuY3Rpb24sIGludm9rZSBpdCBhbmQgcmV0dXJuIGl0cyB2YWx1ZVxuICAgICAgICAgIHZhbHVlID0gKCdmdW5jdGlvbicgPT09IHR5cGVvZiB2YWx1ZSkgPyB2YWx1ZSgpIDogKHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlKVxuICAgICAgICAgIHNbcy5sZW5ndGhdID0gZW5jKGtleSkgKyAnPScgKyBlbmModmFsdWUpXG4gICAgICAgIH1cbiAgICAvLyBJZiBhbiBhcnJheSB3YXMgcGFzc2VkIGluLCBhc3N1bWUgdGhhdCBpdCBpcyBhbiBhcnJheSBvZiBmb3JtIGVsZW1lbnRzLlxuICAgIGlmIChpc0FycmF5KG8pKSB7XG4gICAgICBmb3IgKGkgPSAwOyBvICYmIGkgPCBvLmxlbmd0aDsgaSsrKSBhZGQob1tpXVsnbmFtZSddLCBvW2ldWyd2YWx1ZSddKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB0cmFkaXRpb25hbCwgZW5jb2RlIHRoZSBcIm9sZFwiIHdheSAodGhlIHdheSAxLjMuMiBvciBvbGRlclxuICAgICAgLy8gZGlkIGl0KSwgb3RoZXJ3aXNlIGVuY29kZSBwYXJhbXMgcmVjdXJzaXZlbHkuXG4gICAgICBmb3IgKHByZWZpeCBpbiBvKSB7XG4gICAgICAgIGlmIChvLmhhc093blByb3BlcnR5KHByZWZpeCkpIGJ1aWxkUGFyYW1zKHByZWZpeCwgb1twcmVmaXhdLCB0cmFkaXRpb25hbCwgYWRkKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNwYWNlcyBzaG91bGQgYmUgKyBhY2NvcmRpbmcgdG8gc3BlY1xuICAgIHJldHVybiBzLmpvaW4oJyYnKS5yZXBsYWNlKC8lMjAvZywgJysnKVxuICB9XG5cbiAgZnVuY3Rpb24gYnVpbGRQYXJhbXMocHJlZml4LCBvYmosIHRyYWRpdGlvbmFsLCBhZGQpIHtcbiAgICB2YXIgbmFtZSwgaSwgdlxuICAgICAgLCByYnJhY2tldCA9IC9cXFtcXF0kL1xuXG4gICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgLy8gU2VyaWFsaXplIGFycmF5IGl0ZW0uXG4gICAgICBmb3IgKGkgPSAwOyBvYmogJiYgaSA8IG9iai5sZW5ndGg7IGkrKykge1xuICAgICAgICB2ID0gb2JqW2ldXG4gICAgICAgIGlmICh0cmFkaXRpb25hbCB8fCByYnJhY2tldC50ZXN0KHByZWZpeCkpIHtcbiAgICAgICAgICAvLyBUcmVhdCBlYWNoIGFycmF5IGl0ZW0gYXMgYSBzY2FsYXIuXG4gICAgICAgICAgYWRkKHByZWZpeCwgdilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBidWlsZFBhcmFtcyhwcmVmaXggKyAnWycgKyAodHlwZW9mIHYgPT09ICdvYmplY3QnID8gaSA6ICcnKSArICddJywgdiwgdHJhZGl0aW9uYWwsIGFkZClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob2JqICYmIG9iai50b1N0cmluZygpID09PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgICAgLy8gU2VyaWFsaXplIG9iamVjdCBpdGVtLlxuICAgICAgZm9yIChuYW1lIGluIG9iaikge1xuICAgICAgICBidWlsZFBhcmFtcyhwcmVmaXggKyAnWycgKyBuYW1lICsgJ10nLCBvYmpbbmFtZV0sIHRyYWRpdGlvbmFsLCBhZGQpXG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2VyaWFsaXplIHNjYWxhciBpdGVtLlxuICAgICAgYWRkKHByZWZpeCwgb2JqKVxuICAgIH1cbiAgfVxuXG4gIHJlcXdlc3QuZ2V0Y2FsbGJhY2tQcmVmaXggPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrUHJlZml4XG4gIH1cblxuICAvLyBqUXVlcnkgYW5kIFplcHRvIGNvbXBhdGliaWxpdHksIGRpZmZlcmVuY2VzIGNhbiBiZSByZW1hcHBlZCBoZXJlIHNvIHlvdSBjYW4gY2FsbFxuICAvLyAuYWpheC5jb21wYXQob3B0aW9ucywgY2FsbGJhY2spXG4gIHJlcXdlc3QuY29tcGF0ID0gZnVuY3Rpb24gKG8sIGZuKSB7XG4gICAgaWYgKG8pIHtcbiAgICAgIG9bJ3R5cGUnXSAmJiAob1snbWV0aG9kJ10gPSBvWyd0eXBlJ10pICYmIGRlbGV0ZSBvWyd0eXBlJ11cbiAgICAgIG9bJ2RhdGFUeXBlJ10gJiYgKG9bJ3R5cGUnXSA9IG9bJ2RhdGFUeXBlJ10pXG4gICAgICBvWydqc29ucENhbGxiYWNrJ10gJiYgKG9bJ2pzb25wQ2FsbGJhY2tOYW1lJ10gPSBvWydqc29ucENhbGxiYWNrJ10pICYmIGRlbGV0ZSBvWydqc29ucENhbGxiYWNrJ11cbiAgICAgIG9bJ2pzb25wJ10gJiYgKG9bJ2pzb25wQ2FsbGJhY2snXSA9IG9bJ2pzb25wJ10pXG4gICAgfVxuICAgIHJldHVybiBuZXcgUmVxd2VzdChvLCBmbilcbiAgfVxuXG4gIHJlcXdlc3QuYWpheFNldHVwID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIGZvciAodmFyIGsgaW4gb3B0aW9ucykge1xuICAgICAgZ2xvYmFsU2V0dXBPcHRpb25zW2tdID0gb3B0aW9uc1trXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXF3ZXN0XG59KTtcbiJdfQ==
