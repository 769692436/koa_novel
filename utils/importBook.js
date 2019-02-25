const EventProxy = require('eventproxy');

const Section = require('../module/sectionModel');

const removeNaN = require('./removeNaN');
const chinese2Int = require('./chinese2Int');

let ep = new EventProxy();

const importBook = async (bookString, regData) => {
  let sectionList = await getSectionList(bookString, regData);
  console.log(sectionList.length);
  let saveStatusList = await saveBookSection(sectionList);
  // console.log(saveStatusList);
  return saveStatusList;
}


const getSectionList = async (bookString, regData) => {
  let rsLen = regData.splitReg.exec(bookString)[0].length;
  let sIndex = regData.splitReg.lastIndex;
  let importSectionList = await getEachSectionDoc(rsLen, sIndex, bookString, regData);
  return importSectionList;
}
const getEachSectionDoc = (rsLen, sIndex, bookString, regData) => {
  let importSectionList = [];
  return new Promise((res, rej) => {
    let rs,
        rSections = [];
    while((rs = regData.splitReg.exec(bookString)) != null){
      let eIndex = regData.splitReg.lastIndex;
      if((regData.sectionNumReg.exec(bookString.substring(sIndex - rsLen, eIndex - rs[0].length).split('\n')[0])) != null){
        let title = bookString.substring(sIndex, eIndex).split('\n')[0],
            content = bookString.substring(sIndex + title.length, eIndex - rs[0].length);
        let updateDoc = {
          title: title,
          content: content,
          sectionNum: getSectionNum(regData.sectionNumReg.exec(bookString.substring(sIndex - rsLen, eIndex - rs[0].length).split('\n')[0])[0]),
          status: 3, // 导入的章节
          book: regData.book,
          originUrl: ''
        }
        if(content.length < 50) {
          updateDoc.status = 4
        }
        if(!rSections.includes(updateDoc.sectionNum)){
          rSections.push(updateDoc.sectionNum);
          importSectionList.push(updateDoc);
        }
      }
      sIndex = eIndex;
      rsLen = rs[0].length;
    }
    res(importSectionList);
  });
}

// const getEachSectionDoc = (bookString, regData, ele, nextEle) => {
//   let sIndex = 0,
//       eIndex = 0;
//   let cReg = new RegExp(ele, 'g'),
//       nReg = new RegExp(nextEle, 'g');
//   if(cReg.test(bookString) === true) {
//     // console.log(cReg.lastIndex);
//     sIndex = cReg.lastIndex - ele.length;
//   }
//   if(nReg.test(bookString) === true) {
//     eIndex = nReg.lastIndex - nextEle.length;
//   }
//   if(ele == '第五十四章'){
//     console.log(bookString.substring(sIndex, eIndex), ele, nextEle, sIndex, eIndex);
//   }
//   if(bookString.substring(sIndex, eIndex).split('\n')[0] && regData.sectionNumReg.exec(bookString.substring(sIndex, eIndex))[0]){
//     let updateDoc = {
//       title: bookString.substring(sIndex, eIndex).split('\n')[0],
//       content: bookString.substring(sIndex, eIndex),
//       sectionNum: getSectionNum(regData.sectionNumReg.exec(bookString.substring(sIndex, eIndex))[0]),
//       test: regData.sectionNumReg.exec(ele),
//       status: 3, // 导入的章节
//       book: regData.book,
//       originUrl: ''
//     }
//     ep.emit('splitSection', updateDoc);
//   }else{
//     ep.emit('splitSection', {});
//   }
// }

const saveBookSection = (sectionList) => {
  return new Promise((res, rej) => {
    ep.after('saveSection', sectionList.length, data => {
      res(data);
    });
    sectionList.forEach((v, i) => {
      saveEachSection(v);
    });
  })
}

const saveEachSection = async (ele) => {
  if(ele.sectionNum){
    await Section
        .updateOne({sectionNum: ele.sectionNum}, ele, {upsert: true})
        .then(data => {
          ep.emit('saveSection', {
            status: 0,
            sectionNum: ele.sectionNum
          });
        }, err => {
          console.log(err);
          ep.emit('saveSection', {
            status: 1,
            sectionNum: ele.sectionNum
          });
        });
  }else{
    ep.emit('saveSection',{status: 2, sectionNum: 0})
  }

}

let getSectionNum  = (flag) => {
  let secNum = removeNaN(flag);
  if(isNaN(parseInt(secNum))){
    secNum = chinese2Int(secNum);
  }else{
    secNum = parseInt(secNum);
  }
  return secNum;
}

module.exports = importBook;
