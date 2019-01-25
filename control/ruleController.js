const Rule = require('../module/ruleModel');
const Book = require('../module/bookModel');

exports.addPage = async (ctx) => {
  let bookList = await Book.find({}, {name: 1, bookId: 1}).exec();
  console.log(bookList);
  await ctx.render('admin/rule_add', {
    bookList: bookList,
    session: ctx.session
  })
}
