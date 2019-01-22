const Book = require('../module/bookModel');

exports.listPage = async (ctx) => {
  await ctx.render('admin/book_list', {
    session: ctx.session
  });
}

exports.addPage = async (ctx) => {
  await ctx.render('admin/book_add', {
    session: ctx.session
  })
}

exports.add = async (ctx) => {
  console.log(ctx.request.body);
}
