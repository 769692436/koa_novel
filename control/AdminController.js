const fs = require('fs');
const path = require('path');

const Admin = require('../module/adminModel');
// const crypto = require('../utils/encrypt');
const dirExists = require('../utils/dirExists');
const crypto = require('../utils/encrypto');


const rootDir = path.join(__dirname, '../')

exports.index = async (ctx) => {
  await ctx.render('admin/index.pug');
}

exports.list = async (ctx) => {
  await ctx.render('admin/admin_list');
}

exports.addPage = async (ctx) => {
  await ctx.render('admin/admin_add');
}
/********
返回状态：
1.admin_exists: 管理员已存在
2.upload_failed: 头像上传失败
3.admin_add_failed: 管理员保存失败
4.admin_add_success: 成功添加管理员
*********/
exports.add = async (ctx) => {
  const file = ctx.request.files.file; //获取上传文件
  const { username, password } = ctx.request.body;

  let isExists = await new Promise((res, rej) => {
    Admin.find({username}, (err, data) => {
      if(err) return rej(err);
      if(data.length !== 0){
        return res(true);
      }else{
        return res(false);
      }
    });
  });
  if(isExists){
    return ctx.body = {
      status: 'admin_exists'
    }
  }
  let filePath = path.join(rootDir, 'upload/admin/avator/');
  await dirExists(filePath); //判断是否存在路径，否则创建
  let data = await new Promise((res, rej) => {
    fs.readFile(file.path, (err, data) => {
      if(err) return rej('');
      return res(data);
    });
  });
  console.log(!data);
  if(!data){
    return ctx.body = {
      status: 'upload_failed',
    }
  }
  let ext = file.name.split('.').pop();
  let filename = ctx.request.body.username + (new Date()).getTime() + '.' + ext;
  let fileDir = path.join(filePath , filename);
  let uploadStatus = await new Promise((res, rej) => {
    fs.writeFile(fileDir, data, err => {
      if(err) return rej(false);
      return res(true);
    });
  });
  console.log(uploadStatus);
  if(!uploadStatus){
    return ctx.body = {
      status: 'upload_failed',
    }
  }
  const AdminObj = {
    username,
    password: crypto(password),
    avator: path.join('/upload/admin/avator/', filename)
  }
  await new Promise((res, rej) => {
    Admin.create(AdminObj, err => {
      if(err){
        console.log(err);
        return rej('admin_add_failed');
      }
      return res('admin_add_success')
    });
  }).then(data => {
    return ctx.body = {
      status: data,
      url: '/admin/list'
    }
  }, err => {
    return ctx.body = {
      status: err
    }
  });
}
