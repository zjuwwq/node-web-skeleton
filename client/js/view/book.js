var Regular = require("regularjs");
var html = require("./book.html");

var BookView = Regular.extend({
	name: 'book',
	template: html
});
module.exports = BookView;