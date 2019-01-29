const charset = require('superagent-charset');
const request = charset(require('superagent'));
const cheerio = require('cheerio');
const myUrl = require('url');
const EventProxy = require('eventproxy');
require('superagent-proxy')(request);

const fs = require('fs');
const path = require('path');

const Rule = require('../module/ruleModel');
const Section = require('../module/sectionModel');

const removeNaN = require('./removeNaN');
const chinese2Int = require('./chinese2Int');

let ep = new EventProxy();

const userAgents = require('./userAgents').userAgents;
const proxyIPs = require('./proxyIPs').proxyIPs;


let updateSection = async (rule) => {
  let ruleObj = await Rule.find({_id: rule._id}).populate('book').exec();
  let currentLen = ruleObj[0].book.currentLength;
  let updateSectionList = await getUpdateSectionList(ruleObj[0], currentLen);
  console.log('总共可更新数量', updateSectionList.length);
  if(updateSectionList.length > 0){
    let sectionList = await getEachSection(ruleObj[0], updateSectionList);
    let saveSectionStatusLlist = await getSaveSectionStatus(sectionList, ruleObj[0].book._id);
    return saveSectionStatusLlist;
  }else{//不存在可更新章节
    return [];
  }
}

let getUpdateSectionList = (rule, currentLen) => {
  return new Promise((res, rej) => {
    let sectionList = [];
    request
        .get(rule.targetUrl)
        .buffer(true)
        .charset('gbk')
        .end((err, response) => {
          if(err){
            console.log(err,'请求报错');
            res([]);
          }else{
            let $ = cheerio.load(response.text);
            let reg = new RegExp(rule.sectionNumReg);
            let flag = reg.exec($(rule.listSign).last().text());
            let latestSecNum = getSectionNum(flag[0]);
            console.log('最新章节：', latestSecNum, $(rule.listSign).last().text(), currentLen, flag);
            if(latestSecNum < currentLen){
              res([]);
            }else{
              $(rule.listSign).slice(currentLen + 6).each((i, v) => {//需要清除相同的章节链接？
                let flag = reg.exec($(v).text());
                if(!!flag){
                  let sectionNum = getSectionNum(flag[0]);
                  if(sectionNum > currentLen){
                    let tempData = {
                      url: myUrl.resolve(rule.targetUrl, $(v).attr(rule.inWhatAtrr)),
                      sectionNum: sectionNum
                    }
                    sectionList.push(tempData);
                  }
                }
              });
            }
            res(sectionList);
          }
        });
  });
}

let getEachSection = (rule, list) => {
  return new Promise((res, rej) => {
    ep.after('getSection', list.length, (data) => {
      console.log('所有更新章节请求完毕！');
      res(data);
    });
    list.forEach((v, i) => {
      getSectionData(rule, i, v);
    });
  });
}

let getSectionData = (rule, index, ele) => {
  const agent = request.agent();
  let userAgent = userAgents[parseInt(Math.random() * userAgents.length)];
  let proxyIP = proxyIPs[parseInt(Math.random() * proxyIPs.length)];
  agent
      .get(ele.url)
      // .proxy() // 代理ip
      .set({'User-Agent': userAgent})
      .buffer(true)
      .charset('gbk')
      .retry(3)
      .end((err, res) => {
        if(err){
          console.log('无法访问该章节网址');
          let saveData = {
            sectionNum: ele.sectionNum,
            title: '空缺',
            content: '正在手打中！'
          }
          ep.emit('getSection', saveData);
        }else{
          if(res.statusCode == 200 || res.statusCode == 304){
            let $ = cheerio.load(res.text);
            let title = $(rule.titleSign).text();
            let content = $(rule.contentSign).text();
            let saveData = {
              sectionNum: ele.sectionNum,
              title: title,
              content: content
            }
            ep.emit('getSection', saveData)
          }else{
            console.log(res.statusCode,'请求返回不正确');
            let saveData = {
              sectionNum: ele.sectionNum,
              title: '空缺',
              content: '正在手打中！'
            }
            ep.emit('getSection', saveData);
          }
        }
      });
}

let getSaveSectionStatus = (sectionList, book) => {
  return new Promise((res, rej) => {
    ep.after('saveSection', sectionList.length, data => {
      res(data);
    });
    sectionList.forEach((v, i) => {
      saveSection(v, book);
    });
  });
}

let saveSection = async (sectionData, book) => {
  let sectionNum = sectionData.sectionNum;
  let saveData = {
    sectionNum: sectionNum,
    title: sectionData.title,
    content: sectionData.content,
    book: book
  }
  let isExists = await Section
        .find({$and:[{sectionNum: sectionNum}, {book:book}]})
        .then(data => {
          if(data.length !== 0){
            return true;
          }else{
            return false;
          }
        }, err => {
          return false;
        });

  if(isExists){
    console.log(sectionNum,'章已存在！');
    ep.emit('saveSection', {
      status: 1,
      sectionNum: sectionNum,
      msg: '第'+ sectionNum +'章已存在'
    });
  }else{
    Section.create(saveData, err => {
      if(err){
        console.log('保存第' + sectionNum + '章失败');
        ep.emit('saveSection', {
          status: 2,
          sectionNum: sectionNum,
          msg: '保存第' +sectionNum + '章失败',
        });
      }else{
        ep.emit('saveScetion', {
          status: 0,
          sectionNum: sectionNum,
          msg: '成功爬取保存第' +sectionNum + '章',
        });
      }
    })
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


module.exports = updateSection;
