var bookService = require("../service/book.js");
var bookController = {};
bookController.list = function(req, res) {
	bookService.getList(function(books) {
		res.render("../view/books.ejs", {books: books});
	});
};
bookController.get = function(req, res) {
	var id = req.query.id;
	bookService.getBookById(parseInt(id), function(book) {
		console.log(book);
		res.render("../view/book.ejs", {book: book});
	});
};
module.exports = bookController;