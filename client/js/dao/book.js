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