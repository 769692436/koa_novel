const path = require('path');
const fs = require('fs');

const Book = require('../module/bookModel');
const Counter = require('../module/counterModel');
const dirExists = require('../utils/dirExists');



const rootDir = path.join(__dirname, '../');


exports.listPage = async (ctx) => {
  await ctx.render('admin/book_list', {
    session: ctx.session
  });
}

exports.list = async (ctx) => {
  // console.log(ctx.request.query,"123");
  let {page, limit} = ctx.request.query;
  page = parseInt(page);
  limit = parseInt(limit);
  let count = await Book.count().then(data => data, err => {
    return 0;
  });
  if(!count){
    return ctx.body = {
      status: 1,
      msg: '暂无数据'
    }
  }
  let bookList = await Book
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .then(data => data, err => {
        return [];
      });
  if(bookList.length === 0){
    return ctx.body = {
      status: 1,
      msg: '无法获取数据'
    }
  }
   return ctx.body = {
     status: 0,
     data: bookList,
     msg: '成功获取小说列表',
     count: count
   }
}

exports.addPage = async (ctx) => {
  await ctx.render('admin/book_add', {
    session: ctx.session
  });
}

/*
添加小说基本信息
返回状态：
1.book_already_exists: 书名重复
2.read_cover_failed: 读取封面失败
3.save_cover_failed: 保存封面失败
4.book_save_error: 小说保存报错
5.book_save_success: 成功保存小说
*/

exports.add = async (ctx) => {
  console.log(ctx.request.body);
  const file = ctx.request.files.file; //获取上传文件
  let {name, author, description, state} = ctx.request.body;
  let classification = ctx.request.body.classification.split(',');//传进来为字符串，转化成数组进行存储
  let isExists = await new Promise((res, rej) => {
    Book.find({name}, (err, data) => {
      if(err) return rej(true);
      if(data.length !== 0){
        return res(true);
      }else{
        return res(false);
      }
    });
  });
  if(isExists){
    return ctx.body = {
      status: 'book_already_exists',
    }
  }
  let filePath = path.join(rootDir, 'public/upload/cover/');
  await dirExists(filePath); //判断是否存在改路径，没有则创建
  let fileData = await new Promise((res, rej) => {
    fs.readFile(file.path, (err, data) => {
      if(err) return rej('');
      return res(data);
    })
  });
  if(!fileData){
    return ctx.body= {
      status: 'read_cover_failed'
    }
  }
  let ext = file.name.split('.').pop();//字符串分割成数组，删除最后一个元素并返回，取返回值
  let coverName = name + '.' + ext;
  let fileDir = path.join(filePath, coverName);
  let uploadStatus = await new Promise((res, rej) => {
    fs.writeFile(fileDir, fileData, err => {
      if(err) return rej(false);
      return res(true);
    });
  });
  if(!uploadStatus){
    return crx.body = {
      status: 'save_cover_failed'
    }
  }
  let bookId = await new Promise((res, rej) => {
    Counter.findByIdAndUpdate({'_id': 'books'}, {$inc: { seq: 1}}, {new: true, upsert: true}, (err, counter) => {
      if(err) return rej(err);
      return res(counter.seq);
    })
  });

  const BookObj = {
    name,
    author,
    description,
    classification: classification,
    state,
    currentLength: 0,
    bookId: bookId || 0,
    cover: path.join('/upload/cover/', coverName),
  }
  await new Promise((res, rej) => {
    Book.create(BookObj, err => {
      if(err){
        console.log(err);
        return rej('book_save_error');
      }else{
        return res('book_save_success');
      }
    });
  }).then(data =>{
    return ctx.body = {
      status: data,
      url: '/admin/book/listPage'
    }
  }, err => {
    return ctx.body = {
      status: err
    }
  })
}

exports.coverModify = async (ctx) => {
  let file = ctx.request.files.file,
      {oPath, _id, name} = ctx.request.body;
  let filePath = path.join(rootDir, 'public/upload/cover/');
  await dirExists(filePath);
  let data = await new Promise((res, rej) => {
    fs.readFile(file.path, (err, data) => {
      if(err) return rej('');
      return res(data);
    });
  });
  if(!data){
    return ctx.body = {
      status: 1,
      msg: '小说封面修改失败!'
    }
  }
  let ext = file.name.split('.').pop();
  let filename = name + '.' + ext;
  let fileDir = path.join(filePath, filename);
  let uploadStatus = await new Promise((res, rej) => {
    fs.writeFile(fileDir, data, err => {
      if(err) return rej(false);
      return res(true);
    });
  });
  // console.log(uploadStatus);
  if(!uploadStatus){
    return ctx.body = {
      status: 2,
      msg: '修改失败!'
    }
  }
  await Book.findOneAndUpdate({_id}, {cover: path.join('/upload/cover/', filename)}, err => {
    if(err) {
      ctx.body = {
        status: 3,
        msg: '修改失败!'
      }
    }else{
      ctx.body = {
        status: 0,
        msg: '修改成功!'
      }
    }
  })
}

exports.modify = async (ctx) => {
  let {_id, name, author, description, state, classification} = ctx.request.body;
  await Book.findOneAndUpdate({ _id }, {name, author, description, state, classification}, err => {
    if(err) {
      ctx.body = {
        status: 1,
        msg: '修改失败!'
      }
    }else{
      ctx.body = {
        status: 0,
        msg: '修改成功!'
      }
    }
  });
}

exports.del = async (ctx) => {
  let {_id} = ctx.request.body;
  await Book.deleteOne({_id}, err => {
    if(err){
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
  })
}
