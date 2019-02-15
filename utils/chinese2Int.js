
let chinese2Int = (str) => {
  let chnNumChar = {
    零:0,
    一:1,
    二:2,
    三:3,
    四:4,
    五:5,
    六:6,
    七:7,
    八:8,
    九:9,
  };
  let chnNameValue = {
      十:{value:10, secUnit:false},
      百:{value:100, secUnit:false},
      千:{value:1000, secUnit:false},
      万:{value:10000, secUnit:true},
      亿:{value:100000000, secUnit:true}
  }
  let rtn = 0;
  let section = 0;
  let number = 0;
  let secUnit = false;
  let nstr = str.split('');
  if(nstr[0] == '十'){
    number = 1;
  }
  for(let i = 0; i < nstr.length; i++){
    let num = chnNumChar[nstr[i]];
    if(typeof num !== 'undefined'){
      number = num;
      if(i === nstr.length - 1){
        section += number;
      }
    }else{
      let unit = chnNameValue[nstr[i]].value;
      secUnit = chnNameValue[nstr[i]].secUnit;
      if(secUnit){
          section = (section + number) * unit;
          rtn += section;
          section = 0;
      }else{
          section += (number * unit);
      }
      number = 0;
    }
  }
  return parseInt(rtn + section);
}

module.exports = chinese2Int;
