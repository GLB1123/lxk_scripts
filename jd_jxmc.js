/*
京喜牧场
更新时间：2021-7-17
活动入口：京喜APP-我的-京喜牧场
温馨提示：请先手动完成【新手指导任务】再运行脚本
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#京喜牧场
20 0-23/3 * * * jd_jxmc.js, tag=京喜牧场, img-url=https://github.com/58xinian/icon/raw/master/jdgc.png, enabled=true

================Loon==============
[Script]
cron "20 0-23/3 * * *" script-path=jd_jxmc.js,tag=京喜牧场

===============Surge=================
京喜牧场 = type=cron,cronexp="20 0-23/3 * * *",wake-system=1,timeout=3600,script-path=jd_jxmc.js

============小火箭=========
京喜牧场 = type=cron,script-path=jd_jxmc.js, cronexpr="20 0-23/3 * * *", timeout=3600, enable=true
 */
// prettier-ignore
const $ = new Env('京喜牧场');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//京喜APP的UA。领取助力任务奖励需要京喜APP的UA,环境变量：JX_USER_AGENT，有能力的可以填上自己的UA
const JXUserAgent =  $.isNode() ? (process.env.JX_USER_AGENT ? process.env.JX_USER_AGENT : ``):``;
$.inviteCodeList = [];
let cookiesArr = [];
let UA, token, UAInfo = {}
$.appId = 10028;
$.helpCkList = [];
$.activeid = 'jxmc_active_0001'
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata("CookieJD"), $.getdata("CookieJD2"), ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
  $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
  await requestAlgo();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  console.log('京喜牧场\n' +
      '更新时间：2021-7-17\n' +
      '活动入口：京喜APP-我的-京喜牧场\n' +
      '温馨提示：请先手动完成【新手指导任务】再运行脚本')
  for (let i = 0; i < cookiesArr.length; i++) {
    $.index = i + 1;
    $.cookie = cookiesArr[i];
    $.isLogin = true;
    $.nickName = '';
    await TotalBean();
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    if (!$.isLogin) {
      $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

      if ($.isNode()) {
        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
      }
      continue
    }
    UA = `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    token = await getJxToken()
    await pasture();
    await $.wait(2000);
    UAInfo[$.UserName] = UA
  }
  console.log('\n##################开始账号内互助#################\n');
  let newCookiesArr = [];
  for(let i = 0; i < $.helpCkList.length; i += 4) {
    newCookiesArr.push($.helpCkList.slice(i, i + 4))
  }
  for (let i = 0; i < newCookiesArr.length; i++) {
    let thisCookiesArr = newCookiesArr[i];
    let codeList = [];
    for (let j = 0; j < thisCookiesArr.length; j++) {
      $.cookie = thisCookiesArr[j];
      $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
      UA = UAInfo[$.UserName]
      for (let k = 0; k < $.inviteCodeList.length; k++) {
        if ($.UserName === $.inviteCodeList[k].use) {
          codeList.push({
            'name': $.UserName,
            'code': $.inviteCodeList[k].code
          });
        }
      }
    }
    for (let j = 0; j < thisCookiesArr.length; j++) {
      $.cookie = thisCookiesArr[j];
      $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
      UA = UAInfo[$.UserName]
      for (let k = 0; k < codeList.length; k++) {
        $.oneCodeInfo = codeList[k];
        if(codeList[k].name === $.UserName){
          continue;
        } else {
          console.log(`\n${$.UserName}去助力${codeList[k].name},助力码：${codeList[k].code}\n`);
          await takeGetRequest('help');
          await $.wait(2000);
        }
      }
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })

async function pasture() {
  try {
    $.homeInfo = {};
    $.petidList = [];
    $.crowInfo = {};
    await takeGetRequest('GetHomePageInfo');
    if (JSON.stringify($.homeInfo) === '{}') {
      return;
    } else {
      if (!$.homeInfo.petinfo) {
        console.log(`\n温馨提示：${$.UserName} 请先手动完成【新手指导任务】再运行脚本再运行脚本\n`);
        return;
      }
      console.log('获取活动信息成功');
      console.log(`互助码：${$.homeInfo.sharekey}`);
      $.helpCkList.push($.cookie);
      $.inviteCodeList.push(
          {
            'use':$.UserName,
            'code':$.homeInfo.sharekey,
            'max':false
          }
      );
      for (let i = 0; i < $.homeInfo.petinfo.length; i++) {
        $.onepetInfo = $.homeInfo.petinfo[i];
        $.petidList.push($.onepetInfo.petid);
        if ($.onepetInfo.cangetborn === 1) {
          console.log(`开始收鸡蛋`);
          await takeGetRequest('GetEgg');
          await $.wait(1000);
        }
      }
      $.crowInfo = $.homeInfo.cow;
    }
    $.GetVisitBackInfo = {};
    await $.wait(2000);
    await takeGetRequest('GetVisitBackInfo');
    if($.GetVisitBackInfo.iscandraw === 1){
      await $.wait(2000);
      await takeGetRequest('GetVisitBackCabbage');
    }
    await $.wait(2000);
    $.GetSignInfo = {};
    await takeGetRequest('GetSignInfo');
    if(JSON.stringify($.GetSignInfo) !== '{}' && $.GetSignInfo.signlist){
      let signList = $.GetSignInfo.signlist;
      for (let j = 0; j < signList.length; j++) {
        if(signList[j].fortoday && !signList[j].hasdone){
          await $.wait(2000);
          console.log(`去签到`);
          await takeGetRequest('GetSignReward');
        }
      }
    }
    await $.wait(2000);
    if ($.crowInfo.lastgettime) {
      console.log('收奶牛金币');
      await takeGetRequest('cow');
      await $.wait(2000);
    }
    $.taskList = [];
    $.dateType = ``;
    for (let j = 2; j >= 0; j--) {
      if (j === 0) {
        $.dateType = ``;
      } else {
        $.dateType = j;
      }
      await takeGetRequest('GetUserTaskStatusList');
      await $.wait(2000);
      await doTask(j);
      await $.wait(2000);
      if (j === 2) {
        //割草
        console.log(`\n开始进行割草`);
        $.runFlag = true;
        for (let i = 0; i < 30 && $.runFlag; i++) {
          $.mowingInfo = {};
          console.log(`开始第${i + 1}次割草`);
          await takeGetRequest('mowing');
          await $.wait(2000);
          if ($.mowingInfo.surprise === true) {
            //除草礼盒
            console.log(`领取除草礼盒`);
            await takeGetRequest('GetSelfResult');
            await $.wait(3000);
          }
        }

        //横扫鸡腿
        $.runFlag = true;
        console.log(`\n开始进行横扫鸡腿`);
        for (let i = 0; i < 30 && $.runFlag; i++) {
          console.log(`开始第${i + 1}次横扫鸡腿`);
          await takeGetRequest('jump');
          await $.wait(2000);
        }
      }
    }
    await takeGetRequest('GetHomePageInfo');
    await $.wait(2000);
    let materialNumber = 0;
    let materialinfoList = $.homeInfo.materialinfo;
    for (let j = 0; j < materialinfoList.length; j++) {
      if (materialinfoList[j].type !== 1) {
        continue;
      }
      materialNumber = Number(materialinfoList[j].value);//白菜数量
    }
    if (Number($.homeInfo.coins) > 5000) {
      let canBuyTimes = Math.floor(Number($.homeInfo.coins) / 5000);
      console.log(`\n共有金币${$.homeInfo.coins},可以购买${canBuyTimes}次白菜`);
      if(Number(materialNumber) < 400){
        for (let j = 0; j < canBuyTimes && j < 4; j++) {
          console.log(`第${j + 1}次购买白菜`);
          await takeGetRequest('buy');
          await $.wait(2000);
        }
        await takeGetRequest('GetHomePageInfo');
        await $.wait(2000);
      }else{
        console.log(`现有白菜${materialNumber},大于400颗,不进行购买`);
      }
    }else{
      console.log(`\n共有金币${$.homeInfo.coins}`);
    }
    materialinfoList = $.homeInfo.materialinfo;
    for (let j = 0; j < materialinfoList.length; j++) {
      if (materialinfoList[j].type !== 1) {
        continue;
      }
      if (Number(materialinfoList[j].value) > 10) {
        $.canFeedTimes = Math.floor(Number(materialinfoList[j].value) / 10);
        console.log(`\n共有白菜${materialinfoList[j].value}颗，每次喂10颗，可以喂${$.canFeedTimes}次`);
        $.runFeed = true;
        for (let k = 0; k < $.canFeedTimes && $.runFeed && k < 40; k++) {
          $.pause = false;
          console.log(`开始第${k + 1}次喂白菜`);
          await takeGetRequest('feed');
          await $.wait(4000);
          if ($.pause) {
            await takeGetRequest('GetHomePageInfo');
            await $.wait(1000);
            for (let n = 0; n < $.homeInfo.petinfo.length; n++) {
              $.onepetInfo = $.homeInfo.petinfo[n];
              if ($.onepetInfo.cangetborn === 1) {
                console.log(`开始收鸡蛋`);
                await takeGetRequest('GetEgg');
                await $.wait(1000);
              }
            }
          }
        }
      }
    }
  } catch (e) {
    $.logErr(e)
  }
}

async function doTask(j) {
  for (let i = 0; i < $.taskList.length; i++) {
    $.oneTask = $.taskList[i];
    //console.log($.oneTask.taskId);
    if ($.oneTask.dateType === 1) {//成就任务
      if ($.oneTask.awardStatus === 2 && $.oneTask.completedTimes === $.oneTask.targetTimes) {
        console.log(`完成任务：${$.oneTask.taskName}`);
        await takeGetRequest('Award');
        await $.wait(2000);
      }
    } else {//每日任务
      if($.oneTask.awardStatus === 1){
        if(j===0){
          console.log(`任务：${$.oneTask.taskName},已完成`);
        }
      }else if($.oneTask.taskType === 4){
        if($.oneTask.awardStatus === 2 && $.oneTask.completedTimes === $.oneTask.targetTimes){
          console.log(`完成任务：${$.oneTask.taskName}`);
          await takeGetRequest('Award');
          await $.wait(2000);
        }else if(j===0){
          console.log(`任务：${$.oneTask.taskName},未完成`);
        }
      }else if ($.oneTask.awardStatus === 2 && $.oneTask.taskCaller === 1) {//浏览任务
        if (Number($.oneTask.completedTimes) > 0 && $.oneTask.completedTimes === $.oneTask.targetTimes) {
          console.log(`完成任务：${$.oneTask.taskName}`);
          await takeGetRequest('Award');
          await $.wait(2000);
        }
        for (let j = Number($.oneTask.completedTimes); j < Number($.oneTask.configTargetTimes); j++) {
          console.log(`去做任务：${$.oneTask.description}`);
          await takeGetRequest('DoTask');
          await $.wait(6000);
          console.log(`完成任务：${$.oneTask.description}`);
          await takeGetRequest('Award');
        }
      } else if ($.oneTask.awardStatus === 2 && $.oneTask.completedTimes === $.oneTask.targetTimes) {
        console.log(`完成任务：${$.oneTask.taskName}`);
        await takeGetRequest('Award');
        await $.wait(2000);
      }
    }
  }
}

async function takeGetRequest(type) {
  let url = ``;
  let myRequest = ``;
  switch (type) {
    case 'GetHomePageInfo':
      url = `https://m.jingxi.com/jxmc/queryservice/GetHomePageInfo?channel=7&sceneid=1001&activeid=${$.activeid}&isgift=1&isquerypicksite=1&_stk=channel%2Csceneid&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetHomePageInfo`, url);
      break;
    case 'GetUserTaskStatusList':
      url = `https://m.jingxi.com/newtasksys/newtasksys_front/GetUserTaskStatusList?_=${Date.now() + 2}&source=jxmc&bizCode=jxmc&dateType=${$.dateType}&_stk=bizCode%2CdateType%2Csource&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&sceneval=2&g_login_type=1&g_ty=ajax`;
      myRequest = getGetRequest(`GetUserTaskStatusList`, url);
      break;
    case 'mowing': //割草
      url = `https://m.jingxi.com/jxmc/operservice/Action?channel=7&sceneid=1001&activeid=${$.activeid}&type=2&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`mowing`, url);
      break;
    case 'GetSelfResult':
      url = `https://m.jingxi.com/jxmc/operservice/GetSelfResult?channel=7&sceneid=1001&activeid=${$.activeid}&type=14&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&itemid=undefined&_stk=channel%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetSelfResult`, url);
      break;
    case 'jump':
      let sar = Math.floor((Math.random() * $.petidList.length));
      url = `https://m.jingxi.com/jxmc/operservice/Action?channel=7&sceneid=1001&activeid=${$.activeid}&type=1&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&petid=${$.petidList[sar]}&_stk=channel%2Cpetid%2Csceneid%2Ctype&_ste=1`
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`jump`, url);
      break;
    case 'DoTask':
      url = `https://m.jingxi.com/newtasksys/newtasksys_front/DoTask?_=${Date.now() + 2}&source=jxmc&taskId=${$.oneTask.taskId}&bizCode=jxmc&configExtra=&_stk=bizCode%2CconfigExtra%2Csource%2CtaskId&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}` + `&sceneval=2&g_login_type=1&g_ty=ajax`;
      myRequest = getGetRequest(`DoTask`, url);
      break;
    case 'Award':
      url = `https://m.jingxi.com/newtasksys/newtasksys_front/Award?_=${Date.now() + 2}&source=jxmc&taskId=${$.oneTask.taskId}&bizCode=jxmc&_stk=bizCode%2Csource%2CtaskId&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}` + `&sceneval=2&g_login_type=1&g_ty=ajax`;
      myRequest = getGetRequest(`Award`, url);
      break;
    case 'cow':
      url = `https://m.jingxi.com/jxmc/operservice/GetCoin?channel=7&sceneid=1001&activeid=${$.activeid}&token=${($.crowInfo.lastgettime)}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid%2Ctoken&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`cow`, url);
      break;
    case 'buy':
      url = `https://m.jingxi.com/jxmc/operservice/Buy?channel=7&sceneid=1001&activeid=${$.activeid}&type=1&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`cow`, url);
      break;
    case 'feed':
      url = `https://m.jingxi.com/jxmc/operservice/Feed?channel=7&sceneid=1001&activeid=${$.activeid}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`cow`, url);
      break;
    case 'GetEgg':
      url = `https://m.jingxi.com/jxmc/operservice/GetSelfResult?channel=7&sceneid=1001&activeid=${$.activeid}&type=11&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&itemid=${$.onepetInfo.petid}&_stk=channel%2Citemid%2Csceneid%2Ctype&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetEgg`, url);
      break;
    case 'help':
      url = `https://m.jingxi.com/jxmc/operservice/EnrollFriend?sharekey=${$.oneCodeInfo.code}&channel=7&sceneid=1001&activeid=${$.activeid}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid%2Csharekey&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`help`, url);
    case 'GetVisitBackInfo':
      url = `https://m.jingxi.com/jxmc/queryservice/GetVisitBackInfo?channel=7&sceneid=1001&activeid=${$.activeid}&_stk=channel%2Csceneid&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetVisitBackInfo`, url);
      break;
    case 'GetVisitBackCabbage':
      url = `https://m.jingxi.com/jxmc/operservice/GetVisitBackCabbage?channel=7&sceneid=1001&activeid=${$.activeid}&jxmc_jstoken=${token['farm_jstoken']}&timestamp=${token['timestamp']}&phoneid=${token['phoneid']}&_stk=channel%2Csceneid&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetVisitBackCabbage`, url);
      break;
    case 'GetSignInfo':
      url = `https://m.jingxi.com/jxmc/queryservice/GetSignInfo?channel=7&sceneid=1001&activeid=${$.activeid}&_stk=channel%2Csceneid&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetSignInfo`, url);
      break;
    case 'GetSignReward':
      url = `https://m.jingxi.com/jxmc/operservice/GetSignReward?channel=7&sceneid=1001&activeid=${$.activeid}&currdate=${$.GetSignInfo.currdate}&_stk=channel%2Ccurrdate%2Csceneid&_ste=1`;
      url += `&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
      myRequest = getGetRequest(`GetSignReward`, url);
      break;
    default:
      console.log(`错误${type}`);
  }
  return new Promise(async resolve => {
    $.get(myRequest, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`API请求失败，请检查网路重试`)
          $.runFlag = false;
          console.log(`请求失败`)
        } else {
          dealReturn(type, data);
        }
      } catch (e) {
        console.log(data);
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function dealReturn(type, data) {
  switch (type) {
    case 'GetHomePageInfo':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        $.homeInfo = data.data;
        $.activeid = $.homeInfo.activeid
        if($.homeInfo.giftcabbagevalue){
          console.log(`登陆获得白菜：${$.homeInfo.giftcabbagevalue} 颗`);
        }
      } else {
        console.log(`获取活动信息异常：${JSON.stringify(data)}\n`);
      }
      break;
    case 'mowing':
    case 'jump':
    case 'cow':
      data = data.match(new RegExp(/jsonpCBK.?\((.*);*/));
      if (data && data[1]) {
        data = JSON.parse(data[1]);
        if (data.ret === 0) {
          $.mowingInfo = data.data;
          let add = ($.mowingInfo.addcoins || $.mowingInfo.addcoin) ? ($.mowingInfo.addcoins || $.mowingInfo.addcoin) : 0;
          console.log(`获得金币：${add}`);
          if(Number(add) >0 ){
            $.runFlag = true;
          }else{
            $.runFlag = false;
            console.log(`未获得金币暂停${type}`);
          }
        }
      } else {
        console.log(`cow 数据异常：${data}\n`);
      }
      break;
    case 'GetSelfResult':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`打开除草礼盒成功`);
        console.log(JSON.stringify(data));
      }
      break;
    case 'GetUserTaskStatusList':
      data = JSON.parse(data);
      if (data.ret === 0) {
        $.taskList = data.data.userTaskStatusList;
      }
      break;
    case 'Award':
      data = JSON.parse(data);
      if (data.ret === 0) {
        console.log(`领取金币成功，获得${JSON.parse(data.data.prizeInfo).prizeInfo}`);
      }
      break;
    case 'buy':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`购买成功，当前有白菜：${data.data.newnum}颗`);
      }
      break;
    case 'feed':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`投喂成功`);
      } else if (data.ret === 2020) {
        console.log(`投喂失败，需要先收取鸡蛋`);
        $.pause = true;
      } else {
        console.log(`投喂失败，${data.message}`);
        console.log(JSON.stringify(data));
        $.runFeed = false;
      }
      break;
    case 'GetEgg':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`成功收取${data.data.addnum}个蛋，现有鸡蛋${data.data.newnum}个`);
      }
      break;
    case 'DoTask':
      if (data.ret === 0) {
        console.log(`执行任务成功`);
      }
      break;
    case 'help':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0 && data.data.result === 0 ) {
        console.log(`助力成功`);
      }else if (data.ret === 0 && data.data.result === 4){
        console.log(`助力次数已用完 或者已助力`);
        //$.canHelp = false;
      }else if(data.ret === 0 && data.data.result === 5){
        console.log(`助力已满`);
        $.oneCodeInfo.max = true;
      }else{
        console.log(JSON.stringify(data))
      }
      break;
    case 'GetVisitBackInfo':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        $.GetVisitBackInfo = data.data;
      }
      //console.log(JSON.stringify(data));
      break;
    case 'GetVisitBackCabbage':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`收取白菜成功，获得${data.data.drawnum}`);
      }
      break;
    case 'GetSignInfo':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        $.GetSignInfo = data.data;
      }
      break;
    case 'GetSignReward':
      data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
      if (data.ret === 0) {
        console.log(`签到成功`);
      }
      break;
    default:
      console.log(JSON.stringify(data));
  }
}

function getGetRequest(type, url) {
  if(JXUserAgent){
    UA = JXUserAgent;
  }
  const method = `GET`;
  let headers = {
    'Origin': `https://st.jingxi.com`,
    'Cookie': $.cookie,
    'Connection': `keep-alive`,
    'Accept': `application/json`,
    'Referer': `https://st.jingxi.com/pingou/jxmc/index.html`,
    'Host': `m.jingxi.com`,
    'User-Agent': UA,
    'Accept-Encoding': `gzip, deflate, br`,
    'Accept-Language': `zh-cn`
  };
  return {url: url, method: method, headers: headers};
}
function randomString(e) {
  e = e || 32;
  let t = "0123456789abcdef", a = t.length, n = "";
  for (let i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}

function decrypt(time, stk, type, url) {
  stk = stk || (url ? getUrlData(url, '_stk') : '')
  if (stk) {
    const timestamp = new Date(time).Format("yyyyMMddhhmmssSSS");
    let hash1 = '';
    if ($.fingerprint && $.token && $.enCryptMethodJD) {
      hash1 = $.enCryptMethodJD($.token, $.fingerprint.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
    } else {
      const random = '5gkjB6SpmC9s';
      $.token = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
      $.fingerprint = 5287160221454703;
      const str = `${$.token}${$.fingerprint}${timestamp}${$.appId}${random}`;
      hash1 = $.CryptoJS.SHA512(str, $.token).toString($.CryptoJS.enc.Hex);
    }
    let st = '';
    stk.split(',').map((item, index) => {
      st += `${item}:${getUrlData(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
    })
    const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
    return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fingerprint.toString()), "".concat($.appId.toString()), "".concat($.token), "".concat(hash2)].join(";"))
  } else {
    return '20210318144213808;8277529360925161;10001;tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v;86054c036fe3bf0991bd9a9da1a8d44dd130c6508602215e50bb1e385326779d'
  }
}

async function requestAlgo() {
  $.fingerprint = await generateFp();
  const options = {
    "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
    "headers": {
      'Authority': 'cactus.jd.com',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Accept': 'application/json',
      'User-Agent':$.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      //'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
      'Content-Type': 'application/json',
      'Origin': 'https://st.jingxi.com',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'Referer': 'https://st.jingxi.com/',
      'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
    },
    'body': JSON.stringify({
      "version": "1.0",
      "fp": $.fingerprint,
      "appId": $.appId.toString(),
      "timestamp": Date.now(),
      "platform": "web",
      "expandParams": ""
    })
  }
  new Promise(async resolve => {
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`request_algo 签名参数API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['status'] === 200) {
              $.token = data.data.result.tk;
              let enCryptMethodJDString = data.data.result.algo;
              if (enCryptMethodJDString) $.enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
              // console.log(`获取签名参数成功！`)
              // console.log(`fp: ${$.fingerprint}`)
              // console.log(`token: ${$.token}`)
              // console.log(`enCryptMethodJD: ${enCryptMethodJDString}`)
            } else {
              // console.log(`fp: ${$.fingerprint}`)
              console.log('request_algo 签名参数API请求失败:')
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

Date.prototype.Format = function (fmt) {
  var e,
      n = this, d = fmt, l = {
        "M+": n.getMonth() + 1,
        "d+": n.getDate(),
        "D+": n.getDate(),
        "h+": n.getHours(),
        "H+": n.getHours(),
        "m+": n.getMinutes(),
        "s+": n.getSeconds(),
        "w+": n.getDay(),
        "q+": Math.floor((n.getMonth() + 3) / 3),
        "S+": n.getMilliseconds()
      };
  /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
  for (var k in l) {
    if (new RegExp("(".concat(k, ")")).test(d)) {
      var t, a = "S+" === k ? "000" : "00";
      d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
    }
  }
  return d;
}

function getUrlData(url, name) {
  if (typeof URL !== "undefined") {
    let urls = new URL(url);
    let data = urls.searchParams.get(name);
    return data ? data : '';
  } else {
    const query = url.match(/\?.*/)[0].substring(1)
    const vars = query.split('&')
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=')
      if (pair[0] === name) {
        return vars[i].substr(vars[i].indexOf('=') + 1);
      }
    }
    return ''
  }
}

function generateFp() {
  let e = "0123456789";
  let a = 13;
  let i = '';
  for (; a--;)
    i += e[Math.random() * e.length | 0];
  return (i + Date.now()).slice(0, 16)
}
function getJxToken() {
  var _0x1e2686 = {
    'kElFH': 'abcdefghijklmnopqrstuvwxyz1234567890',
    'MNRFu': function(_0x433b6d, _0x308057) {
      return _0x433b6d < _0x308057;
    },
    'gkPpb': function(_0x531855, _0xce2a99) {
      return _0x531855(_0xce2a99);
    },
    'KPODZ': function(_0x3394ff, _0x3181f7) {
      return _0x3394ff * _0x3181f7;
    },
    'TjSvK': function(_0x2bc1b7, _0x130f17) {
      return _0x2bc1b7(_0x130f17);
    }
  };

  function _0xe18f69(_0x5487a9) {
    let _0x3f25a6 = _0x1e2686['kElFH'];
    let _0x2b8bca = '';
    for (let _0x497a6a = 0x0; _0x1e2686['MNRFu'](_0x497a6a, _0x5487a9); _0x497a6a++) {
      _0x2b8bca += _0x3f25a6[_0x1e2686['gkPpb'](parseInt, _0x1e2686['KPODZ'](Math['random'](), _0x3f25a6['length']))];
    }
    return _0x2b8bca;
  }
  return new Promise(_0x1b19fc => {
    let _0x901291 = _0x1e2686['TjSvK'](_0xe18f69, 0x28);
    let _0x5b2fde = (+new Date())['toString']();
    if (!$.cookie['match'](/pt_pin=([^; ]+)(?=;?)/)) {
      console['log']('此账号cookie填写不规范,你的pt_pin=xxx后面没分号(;)\n');
      _0x1e2686['TjSvK'](_0x1b19fc, null);
    }
    let _0x1bb53f = $.cookie['match'](/pt_pin=([^; ]+)(?=;?)/)[0x1];
    let _0x367e43 = $['md5']('' + decodeURIComponent(_0x1bb53f) + _0x5b2fde + _0x901291 + 'tPOamqCuk9NLgVPAljUyIHcPRmKlVxDy')['toString']();
    _0x1e2686['TjSvK'](_0x1b19fc, {
      'timestamp': _0x5b2fde,
      'phoneid': _0x901291,
      'farm_jstoken': _0x367e43
    });
  });
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: $.cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            console.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}
//md5
!function(n){"use strict";function r(n,r){var t=(65535&n)+(65535&r);return(n>>16)+(r>>16)+(t>>16)<<16|65535&t}function t(n,r){return n<<r|n>>>32-r}function u(n,u,e,o,c,f){return r(t(r(r(u,n),r(o,f)),c),e)}function e(n,r,t,e,o,c,f){return u(r&t|~r&e,n,r,o,c,f)}function o(n,r,t,e,o,c,f){return u(r&e|t&~e,n,r,o,c,f)}function c(n,r,t,e,o,c,f){return u(r^t^e,n,r,o,c,f)}function f(n,r,t,e,o,c,f){return u(t^(r|~e),n,r,o,c,f)}function i(n,t){n[t>>5]|=128<<t%32,n[14+(t+64>>>9<<4)]=t;var u,i,a,h,g,l=1732584193,d=-271733879,v=-1732584194,C=271733878;for(u=0;u<n.length;u+=16)i=l,a=d,h=v,g=C,d=f(d=f(d=f(d=f(d=c(d=c(d=c(d=c(d=o(d=o(d=o(d=o(d=e(d=e(d=e(d=e(d,v=e(v,C=e(C,l=e(l,d,v,C,n[u],7,-680876936),d,v,n[u+1],12,-389564586),l,d,n[u+2],17,606105819),C,l,n[u+3],22,-1044525330),v=e(v,C=e(C,l=e(l,d,v,C,n[u+4],7,-176418897),d,v,n[u+5],12,1200080426),l,d,n[u+6],17,-1473231341),C,l,n[u+7],22,-45705983),v=e(v,C=e(C,l=e(l,d,v,C,n[u+8],7,1770035416),d,v,n[u+9],12,-1958414417),l,d,n[u+10],17,-42063),C,l,n[u+11],22,-1990404162),v=e(v,C=e(C,l=e(l,d,v,C,n[u+12],7,1804603682),d,v,n[u+13],12,-40341101),l,d,n[u+14],17,-1502002290),C,l,n[u+15],22,1236535329),v=o(v,C=o(C,l=o(l,d,v,C,n[u+1],5,-165796510),d,v,n[u+6],9,-1069501632),l,d,n[u+11],14,643717713),C,l,n[u],20,-373897302),v=o(v,C=o(C,l=o(l,d,v,C,n[u+5],5,-701558691),d,v,n[u+10],9,38016083),l,d,n[u+15],14,-660478335),C,l,n[u+4],20,-405537848),v=o(v,C=o(C,l=o(l,d,v,C,n[u+9],5,568446438),d,v,n[u+14],9,-1019803690),l,d,n[u+3],14,-187363961),C,l,n[u+8],20,1163531501),v=o(v,C=o(C,l=o(l,d,v,C,n[u+13],5,-1444681467),d,v,n[u+2],9,-51403784),l,d,n[u+7],14,1735328473),C,l,n[u+12],20,-1926607734),v=c(v,C=c(C,l=c(l,d,v,C,n[u+5],4,-378558),d,v,n[u+8],11,-2022574463),l,d,n[u+11],16,1839030562),C,l,n[u+14],23,-35309556),v=c(v,C=c(C,l=c(l,d,v,C,n[u+1],4,-1530992060),d,v,n[u+4],11,1272893353),l,d,n[u+7],16,-155497632),C,l,n[u+10],23,-1094730640),v=c(v,C=c(C,l=c(l,d,v,C,n[u+13],4,681279174),d,v,n[u],11,-358537222),l,d,n[u+3],16,-722521979),C,l,n[u+6],23,76029189),v=c(v,C=c(C,l=c(l,d,v,C,n[u+9],4,-640364487),d,v,n[u+12],11,-421815835),l,d,n[u+15],16,530742520),C,l,n[u+2],23,-995338651),v=f(v,C=f(C,l=f(l,d,v,C,n[u],6,-198630844),d,v,n[u+7],10,1126891415),l,d,n[u+14],15,-1416354905),C,l,n[u+5],21,-57434055),v=f(v,C=f(C,l=f(l,d,v,C,n[u+12],6,1700485571),d,v,n[u+3],10,-1894986606),l,d,n[u+10],15,-1051523),C,l,n[u+1],21,-2054922799),v=f(v,C=f(C,l=f(l,d,v,C,n[u+8],6,1873313359),d,v,n[u+15],10,-30611744),l,d,n[u+6],15,-1560198380),C,l,n[u+13],21,1309151649),v=f(v,C=f(C,l=f(l,d,v,C,n[u+4],6,-145523070),d,v,n[u+11],10,-1120210379),l,d,n[u+2],15,718787259),C,l,n[u+9],21,-343485551),l=r(l,i),d=r(d,a),v=r(v,h),C=r(C,g);return[l,d,v,C]}function a(n){var r,t="",u=32*n.length;for(r=0;r<u;r+=8)t+=String.fromCharCode(n[r>>5]>>>r%32&255);return t}function h(n){var r,t=[];for(t[(n.length>>2)-1]=void 0,r=0;r<t.length;r+=1)t[r]=0;var u=8*n.length;for(r=0;r<u;r+=8)t[r>>5]|=(255&n.charCodeAt(r/8))<<r%32;return t}function g(n){return a(i(h(n),8*n.length))}function l(n,r){var t,u,e=h(n),o=[],c=[];for(o[15]=c[15]=void 0,e.length>16&&(e=i(e,8*n.length)),t=0;t<16;t+=1)o[t]=909522486^e[t],c[t]=1549556828^e[t];return u=i(o.concat(h(r)),512+8*r.length),a(i(c.concat(u),640))}function d(n){var r,t,u="";for(t=0;t<n.length;t+=1)r=n.charCodeAt(t),u+="0123456789abcdef".charAt(r>>>4&15)+"0123456789abcdef".charAt(15&r);return u}function v(n){return unescape(encodeURIComponent(n))}function C(n){return g(v(n))}function A(n){return d(C(n))}function m(n,r){return l(v(n),v(r))}function s(n,r){return d(m(n,r))}function b(n,r,t){return r?t?m(r,n):s(r,n):t?C(n):A(n)}$.md5=b}();

// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
