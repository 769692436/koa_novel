const Router = require('koa-router');
const router = new Router;

const book = require('../control/bookController');
const admin = require('../control/adminController');


router.get('/', async (ctx) => {
  await ctx.render('index',{});
})


//后台路由
router.get('/admin/list', admin.list); //所有管理员
router.get('/admin/add', admin.add); //添加管理员
router.get('/admin/book', book.list);

module.exports = router;
