const Router = require('koa-router');
const router = new Router;

const book = require('../control/bookController');
const admin = require('../control/adminController');
const rule = require('../control/ruleController');
const section = require('../control/sectionController');

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
router.get('/admin/book/rule/listPage', admin.isLogin, rule.listPage);
router.get('/admin/book/section/listPage/:id', admin.isLogin, section.listPage);

//后台路由 异步数据接口
//管理员相关
router.post('/admin/login', admin.login);
router.get('/admin/baseinfo/get', admin.isLogin, admin.baseinfo);
router.post('/admin/add', admin.isLogin, admin.add);
router.get('/admin/list', admin.isLogin, admin.list);
router.post('/admin/modify', admin.isLogin, admin.modify);
router.post('/admin/avatar/modify', admin.isLogin, admin.avatarModify);
//小说基本信息相关
router.post('/admin/book/add', admin.isLogin, book.add);
router.get('/admin/book/list', admin.isLogin, book.list);
router.post('/admin/book/cover/modify', admin.isLogin, book.coverModify);
router.post('/admin/book/modify', admin.isLogin, book.modify);
router.post('/admin/book/del', admin.isLogin, book.del);
//爬取规则相关
router.post('/admin/book/rule/add', admin.isLogin, rule.add);
router.post('/admin/book/rule/del', admin.isLogin, rule.del);
router.post('/admin/book/rule/modify', admin.isLogin, rule.modify);
router.get('/admin/book/rule/list', admin.isLogin, rule.list);
router.post('/admin/book/rule/crawl', admin.isLogin, rule.crawl);
//小说章节相关
router.get('/admin/book/section/list/:id', admin.isLogin, section.list);
router.post('/admin/book/section/del', admin.isLogin, section.del);
module.exports = router;
