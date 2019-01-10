const { Schema } = require('../database/connect'); //得到Schema对象

const ObjectId = Schema.Types.ObjectId; //声明ObjectId

const adminSchema = new Schema({
  username: String,
  password: String,
  avator: String
}, {
  versionKey: false,
  timestamps: {
    createdAt: 'createTime',
  }
});

module.exports = adminSchema;
