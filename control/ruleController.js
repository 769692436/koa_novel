const Rule = require('../module/ruleModel');
const Book = require('../module/bookModel');

const updateSection = require('../utils/updateSection');

exports.addPage = async (ctx) => {
  let bookList = await Book.find({}, {name: 1, bookId: 1}).exec();
  console.log(bookList);
  await ctx.render('admin/rule_add', {
    bookList: bookList,
    session: ctx.session
  })
}

exports.add = async (ctx) => {
  let {book, targetUrl, listSign, inWhatAtrr, contentSign, titleSign, sectionNumReg} = ctx.request.body;
  let ruleObj = {
    book,
    targetUrl,
    listSign,
    sectionNumReg,
    inWhatAtrr,
    contentSign,
    titleSign
  }
  console.log(ctx.request.body);
  await new Promise((res, rej) => {
    Rule.create(ruleObj, err => {
      if(err){
        rej('save_rule_failed');
      }else{
        res('save_rule_success');
      }
    });
  }).then(data => {
    return ctx.body = {
      status: data
    }
  }, err => {
    return ctx.body = {
      status: err
    }
  });
}

exports.listPage = async (ctx) => {
  await ctx.render('admin/rule_list', {
    session: ctx.session
  })
}

exports.list = async (ctx) => {
  let {page, limit} = ctx.request.body;
  page = parseInt(page);
  limit = parseInt(limit);
  let count = await Rule.count().then(data => {
    return data;
  }, err => {
    console.log('获取规则列表报错：', err);
    return 0;
  });
  if(!count){
    return ctx.body = {
      status: 1,
      msg: '暂无数据'
    }
  }
  let ruleList = await Rule
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('book', 'name')
      .then(data => {
        return data;
      }, err => {
        return [];
      });
  if(ruleList.length === 0){
    return ctx.body = {
      status: 1,
      msg: '无法获取列表数据'
    }
  }
  console.log(ruleList);
  return ctx.body = {
    status: 0,
    data: ruleList,
    msg: '成功获取规则列表',
    count: count
  }
}

exports.crawl = async (ctx) => {
  let rule = ctx.request.body;
  let saveSectionStatusLlist = await updateSection(rule);
  let updateCount = 0;
  let resData = [];
  if(saveSectionStatusLlist.length <= 0){
    return ctx.body = {
      status: 2,
      msg: '目标网址没有可更新章节'
    }
  }
  console.log(saveSectionStatusLlist[saveSectionStatusLlist.length-1]);

  for(let i = 0; i < saveSectionStatusLlist.length; i++){
    if(saveSectionStatusLlist[i].status > 0){
      continue;
    }else{
      updateCount++;
      resData.push({
        sectionNum: saveSectionStatusLlist[i].sectionNum,
        msg: '成功爬取第' + saveSectionStatusLlist[i].sectionNum + '章'
      });
    }
  }
  console.log(updateCount,'updateCount');
  await Book.updateOne({_id: ctx.request.body.book._id}, {$inc: {currentLength: updateCount/2}}, (err, raw) => {
    console.log(err, raw);
  });
  if(updateCount > 0){
    ctx.body = {
      status: 0,
      data: resData
    }
  }else{
    ctx.body = {
      status: 1,
      msg: '没有更新'
    }
  }

}
