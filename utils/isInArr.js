const Compare = require('./compare');

//判断元素是否在数组中
let isInArr = (arr, ele) => {
  if(!arr instanceof Array){ //传入的非数组
    return false;
  }
  let len = arr.length;
  for(let i = 0; i < len; i++){
    if(ele instanceof Object){ //传入的元素为对象
      if(Compare(arr[i], ele) === true){
        return true;
      }else{
        continue;
      }
    }else{
      if(arr[i] === ele){
        return true;
      }else{
        continue;
      }
    }
  }
  return false;
}

module.exports = isInArr;
