var Router = require('director').Router;
var book = require('./controller/book.js');
var currentView;
function show(controller){
	return function(){
		var args = [].slice.call(arguments);
		args.push(function cb(html){
			document.getElementById("view").innerHTML = html;
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