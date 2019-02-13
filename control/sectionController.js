const Section = require('../module/sectionModel');

exports.listPage = async (ctx) => {
  await ctx.render('admin/section_list', {
    session: ctx.session,
  });
}


exports.list = async (ctx) => {
  let bookId = ctx.params.id,
      {page, limit} = ctx.request.query;
  page = parseInt(page);
  limit = parseInt(limit)
  console.log(bookId, '12312313132');
  let count = await Section
        .find({book: bookId})
        .count()
        .then(data => {
          return data;
        }, err => {
          console.log(err);
          return 0;
        });
  if(!count) {
    return ctx.body = {
      status: 1,
      msg: '暂无录入章节'
    }
  }
  let sectionList = await Section
        .find({book: bookId})
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('book', 'name')
        .then(data => {
          return data;
        }, err => {
          console.log(err);
          return [];
        });
  if(sectionList.length === 0){
    return ctx.body = {
      status: 1,
      msg: '无法获取章节列表'
    }
  }
  return ctx.body = {
    status: 0,
    data: sectionList,
    msg: '',
    count: count
  }
}
