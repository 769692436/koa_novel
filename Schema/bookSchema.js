//得到Schema对象
{ Schema } = require('../database/connect');

//声明ObjectId
const ObjectId = Schema.Types.ObjectId;

const bookSchema = new Schema({
  name: String, //小说名称
  author: String, //作者
  description: String, //简介
  classification: Array, //分类
  state: String, //连载状态
  cover: String, //封面保存地址
  currentLength: Number, //当前收录最新章节数
  // resources: {
  //   type: ObjectId,
  //   ref: 'rules'
  // }, //爬取来源及规则
  bookId: Number, //自增id
}, {
  versionKey: false,
  timestamps: {
    createdAt: 'createTime',
    updateAt: 'updateTime'
  }
})

module.exports = bookSchema;
