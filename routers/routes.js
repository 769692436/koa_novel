const Router = require('koa-router');
const router = new Router;

const book = require('../control/bookController');
const admin = require('../control/adminController');


router.get('/', async (ctx) => {
  await ctx.render('index',{});
})


//后台路由 页面请求
router.get('/admin/login', admin.loginPage);
router.get('/admin', admin.isLogin, admin.index);
router.get('/admin/listPage', admin.isLogin, admin.listPage); //所有管理员页
router.get('/admin/addPage', admin.isLogin, admin.addPage); //添加管理员页
router.get('/admin/book/listPage', admin.isLogin, book.listPage);
router.get('/admin/book/addPage', admin.isLogin, book.addPage);
router.get('/admin/logout', admin.logout);
router.get('/admin/book/rule/addPage', admin.isLogin, rule.addPage);

//后台路由 异步数据接口

//管理员相关
router.post('/admin/login', admin.login);
router.get('/admin/baseinfo/get', admin.isLogin, admin.baseinfo);
router.post('/admin/add', admin.isLogin, admin.add);
router.get('/admin/list', admin.isLogin, admin.list);
router.post('/admin/modify', admin.isLogin, admin.modify);
router.post('/admin/avatar/modify', admin.isLogin, admin.avatarModify);

//小说相关
router.post('/admin/book/add', admin.isLogin, book.add);
router.get('/admin/book/list', admin.isLogin, book.list);

module.exports = router;
