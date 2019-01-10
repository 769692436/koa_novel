const { db } = require('../database/connect'); //得到数据库的操控对象
const BookSchema = require('../Schema/bookSchema'); //得到book表数据规范
const ObjBook = db.model('books', BookSchema);

module.exports = ObjBook;
