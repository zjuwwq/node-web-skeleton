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