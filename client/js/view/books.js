var Regular = require("regularjs");
var html = require("./books.html");

var BooksView = Regular.extend({
	name: 'books',
	template: html
});

module.exports = BooksView;