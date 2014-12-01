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