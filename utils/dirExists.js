const fs = require('fs');
const path = require('path');

let dirExists = async (dir) => {
  let isExists = await getStat(dir);
  if(isExists && isExists.isDirectory()){
    return true;
  }else if(isExists){
    return false;
  }
  let tempDir = path.parse(dir).dir; //拿到上一级路径
  //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
  let status = await dirExists(tempDir);
  let mkDirStatus;
  if(status){
    mkDirStatus = await mkdir(dir);
  }
  return mkDirStatus;
}


let getStat = (dir) => {
  return new Promise((res, rej) => {
    fs.stat(dir, (err, stats) => {
        if(err){
          res(false);
        }else{
          res(stats);
        }
    });
  });
}
let mkdir = (dir) => {
  return new Promise((res, rej) => {
    fs.mkdir(dir, err => {
      if(err){
        res(false);
      }else{
        res(true);
      }
    });
  });
}

module.exports = dirExists;
