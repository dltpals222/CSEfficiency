let verifyBaseData = [
  {
  charge:1264.8800000000206,
  chargingType:'AI',
  connectorId:311,
  evInfo:{kw: 60, start: 14, end: 10},
  nowDate:'23-10-31 20:20:16',
  remain:{needKw: 25000, ChargingKw: 35000, nowHour: '20'},
  timeType:'minute',
  transactionId:'955',
},
{
  charge:1292.0400000000213,
chargingType:'AI',
connectorId:313,
evInfo:{kw: 60, start: 19, end: 7},
nowDate:'23-10-31 20:20:32',
remain:{needKw: 60000, ChargingKw: 0},
timeType:'minute',
transactionId:'956',
},
{
  chargingType:'AI',
connectorId:315,
evInfo:{kw: 72, start: 19, end: 7},
nowDate:'23-10-31 20:20:37',
remain:{needKw: 72000, ChargingKw: 0},
timeType:'minute',
transactionId:'958',
},
]


/**
 * 남은 시간 구하는 함수
 * @param {object} selectVerifyData 해당 verifyBaseData의 객체
 * @returns {number} 남은 시간을 return
 */
function getHourLeft(selectVerifyData){
  const {start, end} = selectVerifyData.evInfo;
  let hour = 24 - start + end;
  let nowHour = -1; //만약 nowDate의 시간이 없을때의 초기값
  if(selectVerifyData.remain && selectVerifyData.remain.ChargingKw > 0){
      const sNowHour = selectVerifyData.remain.nowHour;
      nowHour = parseInt(sNowHour,10);
      // 만약 충전이 이루어졌다면
      if(nowHour > start){ // 시작시간과 같은 날짜일때
          hour = hour - (nowHour - start);
      } else if(nowHour < end) { // 시작시간 다음날일때
          hour = end - nowHour;
      }
  }
  return hour;
}

function getMillisecondsLeft(selectVerifyData){
  const {start, end} = selectVerifyData.evInfo;
  let nowDate = new Date(); // 현재 시간
  nowDate.setHours(19,0,0)
  let startDate = new Date(nowDate);
  startDate.setHours(start, 0, 0); // 시작 시간
  let endDate = new Date(nowDate);
  endDate.setHours(end, 0, 0); // 종료 시간

  if(end <= start) {
      // 종료 시간이 시작 시간보다 작거나 같은 경우, 다음 날로 간주
      endDate.setDate(endDate.getDate() + 1);
  }
  
  let millisecondsLeft;
  if (nowDate >= startDate && nowDate < endDate) {
      // 현재 시간이 시작 시간과 종료 시간 사이인 경우
      millisecondsLeft = endDate - nowDate;
  } 
  console.log("millisecondsLeft",millisecondsLeft);
  console.log("hour",millisecondsLeft/(1000*60*60));
  return millisecondsLeft;
}



/**
 * 1. 시간당 필요 전력(기본값 소수점 3자리까지)
 * 2. hour에 7 입력 시 최대전력으로 충전할때 필요한 시간이 return 됨
 * @param {number} needWh 충전해야할 총 남은 w(와트)
 * @param {number} hour 남은 시간 (잉여전력은 밀리초를 직접 입력해야됩니다.)
 * @param {number} toFixed 소수 자릿수 (기본값 3)
 * @returns {number} 시간당 필요 전력
 */
function hourRequireKWH(needWh, hour, toFixed = 3) {
  // console.log((totalKWh / hour).toFixed(toFixed));
  return ((needWh/1000) / hour).toFixed(toFixed);
}

/**
* 잉여전력 (kWh)
* 1. 데이터를 순회하여 시간당 필요 전력을 모두 더한 값을 최대값에서 뺀 남은 값
* @param {object} verifyBaseData 기본정보가 담긴 Arrays
* @param {number} maxKWh 최대 전력값 (기본값 20)
* @returns {number} 잉여 전력값
*/
function getRemainPower(verifyBaseData, maxKWh = 20) {
  let result = 0;
  for (let i of verifyBaseData) {
      let nowHour = i.nowHour;
      nowHour = parseInt(nowHour,10);
      if (nowHour) {
          result += Math.ceil(
          hourRequireKWH(i.remain.needKw, getMillisecondsLeft(i) / (1000 * 60 * 60))
          );
      } else {
          result += Math.ceil(
          hourRequireKWH(i.remain.needKw, getMillisecondsLeft(i) / (1000 * 60 * 60))
          );
      }
  }
  return maxKWh - result;
}


let requirei = getRemainPower(verifyBaseData)

console.log(requirei)

function requireHour(selectVerifyData){
  let hours;

  if (selectVerifyData.remain.ChargingKw > 0) {
      // 충전이 이루어졌을 때
      if (selectVerifyData.remain.nowHour >= selectVerifyData.evInfo.start) {
          // 시작 시간과 같은 날짜일 때
          hours = selectVerifyData.evInfo.end - selectVerifyData.remain.nowHour;
      } else {
          // 시작 시간 다음 날일 때
          hours = 24 - selectVerifyData.evInfo.start + selectVerifyData.evInfo.end;
      }
  } else {
      // 충전이 이루어지지 않았을 때
      hours = selectVerifyData.evInfo.end - selectVerifyData.evInfo.start;
  }

  console.log(hours);

}

