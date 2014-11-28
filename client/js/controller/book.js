var bookTemplate = require("../../view/book.ejs");
var booksTemplate = require("../../view/books.ejs");
var bookService = require("../service/book.js");
var bookController = {};
bookController.list = function(cb) {
	bookService.getList(function(books) {
		cb(booksTemplate({books: books}));
	});
};
bookController.get = function(bookId, cb) {
	bookService.getBookById(parseInt(bookId), function(book) {
		cb(bookTemplate({book: book}));
	});
};
module.exports = bookController;