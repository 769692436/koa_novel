const Mongoose = require('mongoose');
const ObjectId = Mongoose.Types.ObjectId;

const Section = require('../module/sectionModel');
const Book = require('../module/bookModel');

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
        .sort({sectionNum: 1})
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

exports.del = async (ctx) => {
  let _id = ctx.request.body._id;
  await Section.deleteOne({_id: _id}, err => {
    if(err) {
      console.log(err);
      ctx.body = {
        status: 1,
        msg: '删除失败!'
      }
    }else{
      ctx.body = {
        status: 0,
        msg: '删除成功!'
      }
    }
  });
}

exports.delAll = async (ctx) => {
  let data = ctx.request.body._ids;
  await Section.deleteMany({_id: {$in: data}}, err => {
    if(err){
      console.log(err);
      ctx.body = {
        status: 1,
        msg: '删除失败!'
      }
    }else{
      ctx.body = {
        status: 0,
        msg: '删除成功!'
      }
    }

  });
}

exports.modify = async (ctx) => {
  let {_id, title, content} = ctx.request.body;
  await Section.updateOne({_id}, {title, content}, err => {
    if(err){
      ctx.body = {
        status: 1,
        msg: '修改失败!'
      }
    }else{
      ctx.body = {
        status: 1,
        msg: '修改成功!'
      }
    }
  });
}

exports.getMissSection = async (ctx) => {
  let {book} = ctx.request.body;
  let sectionNums = await Section.aggregate([
    {$match: {book: ObjectId(book)}},
    {$sort: {sectionNum: 1}},
    {$project: {_id: 0, sectionNum: 1}}
  ]).then(data => {
    return data;
  }, err => {
    console.log(err);
    return [];
  });
  sectionNums = sectionNums.map(item => (item.sectionNum));
  let n = await Book.findById(book).then(data => (data.currentLength));
  let missSections = [],
      j = 1;
  for(let i = 0; i < sectionNums.length; i++){
    // console.log(sectionNums[i].sectionNum);
    let x = sectionNums[i] - i;
    let xx = i + j;
    while(x != j){
      missSections.push(xx);
      xx++;
      j++
    }
  }
  missSections = missSections.filter(item => {
    if(item <= n){
      return item;
    }
  });
  ctx.body = {
    status: 0,
    list: missSections
  }
  // console.log(missSections);
}
