const Admin = require('../module/adminModel');
const crypto = require('../utils/encrypt');

exports.index = async (ctx) => {
  await ctx.render('admin/index.pug');
}

exports.reg = async (ctx) => {

}
