const Book = require('../module/bookModel');

exports.list = async (ctx) => {
  await ctx.render('admin/book_list', {});
}
