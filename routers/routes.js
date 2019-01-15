const Router = require('koa-router');
const router = new Router;

const book = require('../control/bookController');
const admin = require('../control/adminController');


router.get('/', async (ctx) => {
  await ctx.render('index',{});
})


//后台路由 get请求
router.get('/admin/list', admin.list); //所有管理员
router.get('/admin/add', admin.addPage); //添加管理员
router.get('/admin/book', book.list);

//后台路由 post请求
router.post('/admin/add', admin.add);

module.exports = router;
