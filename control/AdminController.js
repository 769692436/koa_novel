const fs = require('fs');
const path = require('path');

const Admin = require('../module/adminModel');
const dirExists = require('../utils/dirExists');
const crypto = require('../utils/encrypto');


const rootDir = path.join(__dirname, '../');

exports.index = async (ctx) => {
  console.log(ctx.session,'654');
  await ctx.render('admin/admin_list',{
    session: ctx.session
  });
}

exports.loginPage = async (ctx) => {
  await ctx.render('admin/login');
}
/*
返回状态：
1.admin_not_exists: 用户不存在
2.password_err: 密码错误
3.login_success: 成功登录
4.login_err: 登录失败
*/
exports.login = async (ctx) => {
  console.log(ctx.request.body);
  let {username, password} = ctx.request.body;
  await new Promise((res, rej) => {
    Admin.find({username}, (err, data) => {
      if(err) return rej(err);
      if(data.length === 0){
        return res(0);
      }
      if(data[0].password == crypto(password)){
        return res(data);
      }else{
        return res(1);
      }
    })
  }).then(data => {
    if(data === 0){
        ctx.body = {status: 'admin_not_exists'};
    }else if(data === 1){
      ctx.body = {status: 'password_err'};
    }else{
      ctx.cookies.set('username', username, {
        domain: 'localhost',
        path: '/',
        maxAge: 1000*60*60*8,
        httpOnly: true,
        overwrite: false
      });
      ctx.cookies.set('userId', data[0]._id, {
        domain: 'localhost',
        path: '/',
        maxAge: 1000*60*60*8,
        httpOnly: true,
        overwrite: false
      });
      ctx.cookies.set('avatar', data[0].avatar, {
        domain: 'localhost',
        path: '/',
        maxAge: 1000*60*60*8,
        httpOnly: true,
        overwrite: false
      });
      console.log(data[0].avatar.replace('/\\', '/'),'123');
      ctx.session = {
          username,
          userId: data[0]._id,
          avatar: data[0].avatar.replace('/\\', '/') || 'upload/'  //取到用户头像
      };
      console.log(ctx.session);
      ctx.body = {status: 'login_success', url: '/admin'};
    }
  }, err => {
    if(err) ctx.body = {status: 'login_err'};
  });
}

exports.listPage = async (ctx) => {
  console.log(ctx.session);
  await ctx.render('admin/admin_list', {
    session: ctx.session,

  });
}

exports.list = async (ctx) => {
  console.log(ctx.request.query);
  let { page, limit } = ctx.request.query;
  page = parseInt(page);
  limit = parseInt(limit);
  let count = await Admin.count().then(data => data, err => {
    if(err) {
      console.log('获取管理员列表长度发生错误：', err);
      return ctx.body = {
        status: 1,
        msg: '查询管理员列表报错！'
      }
    }
  });
  console.log('count:' , count);
  let adminList = await Admin
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .then(data => {
        return data;
      }, err => {
        if(err) {
          console.log('获取管理员列表发生错误：', err);
          return ctx.body = {
            status: 1,
            msg: '查询管理员列表报错！'
          }
        }
      });
  console.log(adminList.length);
  ctx.body = {
    status: 0,
    data: adminList,
    msg: '成功获取管理员列表',
    count: count
  }
}

exports.addPage = async (ctx) => {
  await ctx.render('admin/admin_add',{
    session: ctx.session
  });
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
      status: 'admin_exists'
    }
  }
  let filePath = path.join(rootDir, 'public/upload/admin/avatar/');
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
    avatar: path.join('/upload/admin/avatar/', filename)
  }
  console.log(AdminObj.avatar,'321');
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
      url: '/admin/listPage'
    }
  }, err => {
    if(err){
      return ctx.body = {
        status: err
      }
    }
  });
}

//退出登录
exports.logout = async (ctx) => {
  ctx.session = null;
  ctx.cookies.set('username', null, {
      maxAge: 0
  });
  ctx.cookies.set('userId', null, {
      maxAge: 0
  });
  ctx.cookies.set('avatar', null, {
    maxAge: 0
  });
  ctx.redirect('/admin/login');
}

exports.isLogin = async (ctx, next) => {
  if(ctx.session.isNew){
    //从未登录过
    if(ctx.cookies.get('userId')){
      //cookie有，session 没有
      //更新一下session
      ctx.session = {
        username: ctx.cookies.get('username'),
        userId: ctx.cookies.get('userId'),
        avatar: ctx.cookies.get('avatar')
      }
    }else{
      return ctx.redirect('/admin/login');
    }
  }else{
    await next();
  }
}
