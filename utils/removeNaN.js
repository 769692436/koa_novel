const isInArr = require('./isInArr');
//清除字符串中的非数字部分，得到数值
let removeNaN = (str) => {
  let standardNum = [
    '零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
   '千', '百', '万', '亿',
   '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
  ];
  if(typeof str === 'string'){
    let strArr = str.split('');
    let len = strArr.length;
    for(let i = 0; i < len; i++){
      if(!isInArr(standardNum, strArr[i])){
        strArr[i] = '';
      }
    }
    return strArr.join('');
  }else{
    console.log('你传给removeNaN的参数格式错误，不是一个string！');
    return '';
  }
}
module.exports = removeNaN;
