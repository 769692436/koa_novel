const {Schema} = require('../database/connect');

const ObjectId = Schema.Types.ObjectId;

const counterSchema = new Schema({
    _id: { type: String, required: true },
   seq: { type: Number, default: 0 }
},{
  versionKey: false
});

module.exports = counterSchema;
