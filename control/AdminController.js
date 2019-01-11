const Admin = require('../module/adminModel');
// const crypto = require('../utils/encrypt');

exports.index = async (ctx) => {
  await ctx.render('admin/index.pug');
}

exports.list = async (ctx) => {
  await ctx.render('admin/admin_list');
}

exports.add = async (ctx) => {
  await ctx.render('admin/admin_add');
}

exports.reg = async (ctx) => {

}
