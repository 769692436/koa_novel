const Router = require('koa-router');
const router = new Router;

const book = require('../control/bookController');
const admin = require('../control/adminController');


router.get('/', async (ctx) => {
  await ctx.render('index',{});
})


//后台路由 get请求
router.get('/admin/login', admin.loginPage);
router.get('/admin', admin.isLogin, admin.index);
router.get('/admin/list', admin.isLogin, admin.list); //所有管理员
router.get('/admin/add', admin.isLogin, admin.addPage); //添加管理员
router.get('/admin/book', admin.isLogin, book.list);

//后台路由 post请求
router.post('/admin/login', admin.login);
router.post('/admin/add', admin.isLogin, admin.add);

module.exports = router;
