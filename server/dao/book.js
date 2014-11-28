var bookDAO = {};
var bookMap;

var books = [{
	id: 1,
	name: "活着",
	author: "余华",
	publisher: "作家出版社"
}, {
	id: 2,
	name: "百年孤独",
	author: "加西亚·马尔克斯",
	publisher: "南海出版公司"
}];
bookDAO.getList = function(cb) {
	return cb(books);
};
bookDAO.getBookById = function(id, cb) {
	for (var i = 0, book; book = books[i]; i++) {
		if(book.id === id){
			return cb(book);
		}
	}
	return cb(null);
};
module.exports = bookDAO;