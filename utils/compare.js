//对比两个元素是否相同
let Compare = (a, b) => {
  if(!isObj(a) || !isObj(b)) return false;
  if(getLength(a) !== getLength(b)) return false;
  return CompareObj(a, b);
}

//对比对象
let CompareObj = (oA, oB) => {
  let flag = true;
  for(let key in oA){
    if(!flag) break;
    if(!oB.hasOwnProperty(key)) {flag = false;break;} //oB中不存在该键名，则两个对象不一致
    if(!isArr(oA[key])){ //键名相同的两个非数组元素对比
      if(oB[key] !== oA[key]) {flag = false;break;}
    }else{
      if(!isArr(oB[key])) {flag = false;break;} //两个元素其中一个为数组，不一致
      let oAEle = oA[key],
          oBEle = oB[key];
      if(oAEle.length !== oBEle.length){flag = false; break;} //长度不一致
      for(let k in oAEle){
        if(!flag) break;
        flag = CompareObj(oAEle[k], oBEle[k]);
      }
    }
  }
  return flag;
}

//判断是否对象
let isObj = (obj) => {
  return obj && typeof (obj) == 'object' && Object.prototype.toString.call(obj).toLowerCase() == "[object object]";
}
//判断是否数组
let isArr = (arr) => {
  return arr && typeof (arr) == 'object' && arr.constructor == Array;
}
//获取对象长度
let getLength = (obj) => {
  let count = 0;
  for(let i in obj) count++;
  return count;
}


module.exports = Compare;
