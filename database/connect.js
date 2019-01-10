//连接对应数据库的操作
const mongoose = require("mongoose");
const db = mongoose.createConnection
("mongodb://localhost:27017/koa_novel", {
    useNewUrlParser : true
});
mongoose.Promise = global.Promise;

db.on("error", () => {
    console.log("数据库连接失败");
});

db.on("open", () => {
    console.log("数据库连接成功");
});

const Schema = mongoose.Schema; //得到Schema类

module.exports = {
    db,
    Schema
};
