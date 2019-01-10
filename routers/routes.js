const Router = require('koa-router');
const router = new Router;

const book = require('../control/bookController');


router.get('/', async (ctx) => {
  await ctx.render('index',{});
})


//后台路由
router.get('/admin/book', book.list);

module.exports = router;
