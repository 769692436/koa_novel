const {Schema} = require('../database/connect');
const ObjectId = Schema.Types.ObjectId;

let sectionSchema = new Schema({
  sectionNum: Number,
  title: String,
  content: String,
  book: {
    type: ObjectId,
    ref: 'books'
  },
  status: Number,
  originUrl: String
},{
  versionKey: false,
  timestamps: {
    createdAt: 'createTime',
    updatedAt: 'updateTime'
  }
});

module.exports = sectionSchema;
