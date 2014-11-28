var bookDAO = require("../dao/book.js");
var bookService = {};

bookService.getList = function(cb) {
	bookDAO.getList(cb);
};
bookService.getBookById = function(id, cb) {
	bookDAO.getBookById(id, cb);
};
module.exports = bookService;