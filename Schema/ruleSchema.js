const {Schema} = require('../database/connect');

const ObjectId = Schema.Types.ObjectId;

const ruleSchema = new Schema({
  bookName: String,
  targetUrl: String,
  listSign: String,
  sectionNumReg: String,
  inWhatAtrr: String,
  contentSign: String,
  titleSign: String,
  charset: String,
  book: {
    type: ObjectId,
    ref: 'books'
  }
},{
  versionKey: false,
  timestamps: {
    createdAt: 'createTime',
    updatedAt: 'updateTime'
  }
});

module.exports = ruleSchema;
