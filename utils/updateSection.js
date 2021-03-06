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
  let ruleObj = await Rule.find({_id: rule._id}).populate('book').exec();//获取小说基本信息
  let currentLen = ruleObj[0].book.currentLength;
  let updateSectionList = await getUpdateSectionList(ruleObj[0], currentLen);
  console.log('总共可更新数量', updateSectionList.sectionList.length);
  if(updateSectionList.sectionList.length > 0){
    let sectionList = await getEachSection(ruleObj[0], updateSectionList.sectionList.slice(0, 1));//获取3章内容
    let saveSectionStatusList = await getSaveSectionStatus(sectionList, ruleObj[0].book._id);
    return {
      saveSectionStatusList: saveSectionStatusList,
      latestSecNum: ruleObj[0].book.currentLength + 3
    }
  }else{//不存在可更新章节
    return {
      saveSectionStatusList: [],
      latestSecNum: ruleObj[0].book.currentLength
    };
  }
}

let getUpdateSectionList = (rule, currentLen) => {
  return new Promise((res, rej) => {
    let tSectionList = [];
    let sectionList = new Map();
    request
        .get(rule.targetUrl)
        .buffer(true)
        .charset(rule.charset)
        .end((err, response) => {
          if(err){
            console.log(err,'请求报错');
            res({
              sectionList: [],
              latestSecNum: 0
            });
          }else{
            let $ = cheerio.load(response.text);
            //获取最新章节数
            let reg = new RegExp(rule.sectionNumReg);
            let flag = reg.exec($(rule.listSign).last().text());
            console.log(flag,'flag',$(rule.listSign).last().text());
            let latestSecNum = getSectionNum(flag[0]);//最新章节数

            if(latestSecNum < currentLen){
              res({
                sectionList: [],
                latestSecNum: 0
              });
            }else{//小说有更新
              //将更新的章节内容页链接存放入数组中
              $(rule.listSign).slice(currentLen).each((i, v) => {
                let flag = reg.exec($(v).text());
                if(!!flag){
                  let sectionNum = getSectionNum(flag[0]);
                  if(sectionNum > currentLen){
                    let tempData = {
                      url: myUrl.resolve(rule.targetUrl, $(v).attr(rule.inWhatAtrr)),
                      sectionNum: sectionNum
                    }
                    tSectionList.push(tempData);
                  }
                }
              });
              tSectionList.forEach(item => {
                sectionList.set(item.sectionNum, item);
              });//清除重复的章节
              sectionList = [...sectionList.values()].sort((a, b) => {
                return a.sectionNum - b.sectionNum;
              });//将map对象转成数组,并升序排序
              let sectionListLen = sectionList.length;
              let j = currentLen;
              for(let i = 0; i < sectionListLen; i++){//查缺
                  if(parseInt(sectionList[i].sectionNum) != j){
                    sectionList.push({
                      url: '',
                      sectionNum: j
                    });
                    j = j + 2;
                  }else{
                    j++;
                    continue;
                  }
              }
              console.log(sectionList[1364]);
              res({
                sectionList: sectionList,
                latestSecNum: latestSecNum
              });
            }
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
  if(ele.url == ''){
    let saveData = {
      sectionNum: ele.sectionNum,
      title: '空缺',
      content: '正在手打中！',
      status: 2,
      originUrl: ele.url
    }
    return ep.emit('getSection', saveData);
  }
  agent
      .get(ele.url)
      // .proxy(proxyIP) // 代理ip
      .set({'User-Agent': userAgent})
      .buffer(true)
      .charset(rule.charset)
      .retry(3)
      .end((err, res) => {
        if(err){
          console.log('无法访问该章节网址', err);
          let saveData = {
            sectionNum: ele.sectionNum,
            title: '请求失败！',
            content: '请求失败！',
            status: 0,
            originUrl: ele.url
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
              content: content,
              status: 1,
              originUrl: ele.url
            }
            ep.emit('getSection', saveData)
          }else{
            console.log(res.statusCode,'请求返回不正确');
            let saveData = {
              sectionNum: ele.sectionNum,
              title: '请求失败！',
              content: '请求失败！',
              status: 0,
              originUrl: ele.url
            }
            ep.emit('getSection', saveData);
          }
        }
      });
}

let getSaveSectionStatus = (sectionList, book) => {
  return new Promise((res, rej) => {
    ep.after('saveSection', sectionList.length, data => {
      console.log(data);
      res(data);
    });
    sectionList.forEach((v, i) => {
      saveSection(v, book);
    });
  });
}

let saveSection = async (sectionData, book) => {
  let sectionNum = sectionData.sectionNum;
  if(sectionData.status != 0){
    let saveData = {
      sectionNum: sectionNum,
      title: sectionData.title,
      content: sectionData.content,
      book: book,
      status: sectionData.status,
      originUrl: sectionData.originUrl
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
        status: 0,
        sectionNum: sectionNum,
        msg: '第' + sectionNum + '章已存在'
      });
    }else{
      Section.create(saveData, err => {
        if(err){
          console.log('保存第' + sectionNum + '章失败');
          ep.emit('saveSection', {
            status: 2,
            sectionNum: sectionNum,
            msg: '保存第' + sectionNum + '章失败',
          });
        }else{
          ep.emit('saveSection', {
            status: 1,
            sectionNum: sectionNum,
            msg: '成功爬取保存第' + sectionNum + '章',
          });
        }
      })
    }
  }else{
    ep.emit('saveSection', {
      status: 2,
      sectionNum: sectionNum,
      msg: '保存第' + sectionNum + '章失败',
    });
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
