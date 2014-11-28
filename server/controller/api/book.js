var bookService = require("../../service/book.js");
var bookController = {};
bookController.getList = function(req, res) {
	bookService.getList(function(books) {
		res.json(books);
	});
};
bookController.get = function(req, res) {
	var id = req.query.id;
	bookService.getBookById(parseInt(id), function(book) {
		res.json(book);
	});
};
module.exports = bookController;