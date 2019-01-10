const Koa = require('koa');
const static = require('koa-static');
const views = require('koa-views');
const logger = require('koa-logger');
const body = require('koa-body');
const session = require('koa-session');
const {join} = require('path');
const router = require('./routers/routes');


const app = new Koa();

app.keys = ['kel_koa_blog'];

const CONFIG = {
  key: 'sessionId',
  maxAge: 1000*60*60*12,
  overwrite: true,
  httpOnly: true
}

app
    .use(logger())
    .use(session(CONFIG, app))
    .use(body({
      multipart:true
    }))
    .use(static(join(__dirname, 'public')))
    .use(views(join(__dirname, 'views'), {
      extension: 'pug'
    }));

//注册路由信息
app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000, () => {
  console.log(__dirname);
  console.log("项目启动，开始监听3000端口！");
});
