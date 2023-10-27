const fs = require("fs");

const baseInfo = {
  limit: {
    totalkWh: 20,
    oneConnector: 7,
  },
  cond: {
    A: {
      kWh: 60,
      hours: 12,
      start: 19,
      end: 7,
    },
    B: {
      kWh: 72,
      hours: 12,
      start: 19,
      end: 7,
    },
    C: {
      kWh: 48,
      hours: 8,
      start: 22,
      end: 6,
    },
    D: {
      kWh: 60,
      hours: 20,
      start: 14,
      end: 10,
    },
  },
};

const dumpData = [
  {
    TransactionId: 221,
    LastAction: "",
    cumulative: {
      // 누적값
      charging: 0,
      hour: 0,
    },
    remain: {
      // 남은 값
      kWh: 0,
    },
  },
  {
    TransactionId: 227,
    LastAction: "",
    cumulative: {
      // 누적값
      charging: 0,
      hour: 0,
    },
    remain: {
      // 남은 값
      kWh: 0,
    },
  },
  {
    TransactionId: 231,
    LastAction: "",
    cumulative: {
      // 누적값
      charging: 0,
      hour: 0,
    },
    remain: {
      // 남은 값
      kWh: 0,
    },
  },
  {
    TransactionId: 234,
    LastAction: "",
    cumulative: {
      // 누적값
      charging: 0,
      hour: 0,
    },
    remain: {
      // 남은 값
      kWh: 0,
    },
  },
];

let logData = [];
let count = 0;

// startTransaction일때 초기 설정
function initDumpData(resultData, cond) {
  resultData.LastAction = "startTransaction";
  resultData.remain.kWh = cond.kWh;

  const convertToKoreaTime = (start) => {
    return start + 9 > 24 ? start - 15 : start + 9;
  };

  resultData.startDate = new Date(`2023-01-02 ${convertToKoreaTime(cond.start)}:00:00`);
  resultData.endDate = new Date(`2023-01-02 ${cond.end + 9}:00:00`);
}

// endTransaction 확인
function endTransaction(resultData) {
  if (resultData.lastDate >= resultData.endDate) {
    resultData.LastAction = "endTransaction";
  } else if (resultData.remain.kWh <= 0) {
    resultData.LastAction = "endTransaction";
  }
}

// 시간마다 해당 번호의 충전 킬로와트 축적용 함수
function chargingProgress(resultData, chargingKw, lastDate) {
  resultData.cumulative.charging += chargingKw;
  resultData.cumulative.hour += 1;
  resultData.remain.kWh -= chargingKw;
  resultData.lastDate = new Date(lastDate);
}

// chargingProgress loop문
function loopChargingProgress(resultData, chargingKw, lastDate, count) {
  if (
    resultData.LastAction === "startTransaction" &&
    typeof resultData.TransactionId === "number"
  ) {
    for (let i = 0; i < count; i++) {
      chargingProgress(resultData, chargingKw, lastDate);
    }
    endTransaction(resultData);
  }
}

// 현재 충전 시작한 커넥터의 갯수
function countCharging(dumpData) {
  let countConnected = 0;
  dumpData.forEach((ele) => {
    if (ele.LastAction === "startTransaction") countConnected += 1;
  });
  return countConnected;
}

// 시간당 필요 전력(기본값 소수점 3자리까지)
// hour에 7 입력 시 최대전력으로 충전할때 필요한 시간이 return 됨
function hourRequireKWH(totalKWh, hour, toFixed = 3) {
  // console.log((totalKWh / hour).toFixed(toFixed));
  return (totalKWh / hour).toFixed(toFixed);
}

// 잉여전력 (kWh)
function getRemainPower(dumpDataArr, maxKWh = 20) {
  let result = 0;
  for (let i of dumpDataArr) {
    if (i.lastDate) {
      result += Math.ceil(
        hourRequireKWH(i.remain.kWh, (i.endDate - i.lastDate) / (1000 * 60 * 60))
      );
    } else {
      result += Math.ceil(
        hourRequireKWH(i.remain.kWh, (i.endDate - i.startDate) / (1000 * 60 * 60))
      );
    }
  }
  return maxKWh - result;
}

// 순위 매기기 (기본값 내림차순)
function assignRank(numbers, descending = "desc") {
  const sortedNumbers = numbers.slice().sort((a, b) => {
    if (descending === "desc") {
      return b - a; // "desc"일떄 내림차순 정렬
    } else if (descending === "asc") {
      return a - b; // "asc"일때 오름차순 정렬
    } else {
      return console.log("desc, asc만 입력이 가능합니다. 기본값 desc");
    }
  });

  const ranks = {};

  for (let i = 0; i < sortedNumbers.length; i++) {
    const number = sortedNumbers[i];
    if (!ranks[number]) {
      ranks[number] = i + 1;
    }
  }

  return numbers.map((number) => ranks[number]);
}

//시간 더하기
function addHour(date, hours) {
  const oldDate = new Date(date);
  const addedHours = new Date(oldDate.getTime() + hours * 60 * 60 * 1000);
  return addedHours.toISOString();
}

new Promise((resolve, reject) => {
  if (dumpData) {
    resolve();
  } else {
    reject();
  }
}) // 첫번째
  .then(() => {
    let resultData = JSON.parse(JSON.stringify(dumpData));
    console.log("resultData", resultData);
    //14시 한개의 커넥터에서 startTransaction이 발생
    count += 1;
    const baseD = baseInfo.cond.D;
    if (count < 3) {
      for (let i = 0; i < count; i++) {
        initDumpData(resultData[0], baseD);
      }
    }
    console.log("14:00", resultData);
    logData.push(JSON.parse(JSON.stringify(resultData)));
    return resultData;
  }) // 두번째
  .then(async (res) => {
    // 5시간 경과 후 19시 2대 추가
    await loopChargingProgress(res[0], 7, "2023-01-02 04:00:00", 5); // 5시간 추가
    const baseA = baseInfo.cond.A;
    const baseB = baseInfo.cond.B;
    initDumpData(res[1], baseA);
    initDumpData(res[2], baseB);
    logData.push(JSON.parse(JSON.stringify(res)));
    console.log("19:00", res);

    return res;
  }) // 세번째
  .then(async (res) => {
    // connector 3개
    let priority = [];
    await res.map(async (e) => {
      if (e.LastAction === "startTransaction" && e.TransactionId) {
        priority.push(await hourRequireKWH(e.remain.kWh, 22 - e.endDate.getHours()));
      }
    });
    priority = assignRank(priority);
    await priority.forEach(async (e, i) => {
      if (e === 1 || e === 2) {
        await loopChargingProgress(res[i], 7, "2023-01-02 07:00:00", 3); // 3시간 추가
      } else {
        await loopChargingProgress(res[i], 6, "2023-01-02 07:00:00", 3); // 3시간 추가
      }
    });
    //connector 1개 추가
    initDumpData(res[3], baseInfo.cond.C);
    logData.push(JSON.parse(JSON.stringify(res)));
    console.log("priority", priority);
    console.log("22:00", res);

    return res;
  }) // 네번째
  .then(async (res) => {
    // connector 4개
    const remainArr = []; // 시간당 필요 전력
    const maxKWhArr = []; // 최대전력시 필요 시간
    let priority = []; // 시간당 필요 전력 기준 우선순위
    const remainHour = []; // 커넥터당 남은 시간
    for (let i of res) {
      let needHour = 0;
      if (i.lastDate) {
        needHour = (i.endDate - i.lastDate) / (1000 * 60 * 60);
      } else {
        needHour = (i.endDate - i.startDate) / (1000 * 60 * 60);
      }
      remainHour.push(needHour);
      remainArr.push(await hourRequireKWH(i.remain.kWh, needHour));
      maxKWhArr.push(await hourRequireKWH(i.remain.kWh, 7));
    }
    let remainKwh = getRemainPower(res); // 잉여전력값
    // let remainKwh = -1; // 잉여전력값
    // let remainKwh = 0; // 잉여전력값
    console.log("remainHour", remainHour); // 남은시간
    console.log("remainKwh", remainKwh); // 남은 kw
    console.log("remainArr", remainArr); // 시간당 필요 kw의 배열
    priority = assignRank(remainArr);
    console.log("priority", priority); // 시간당 필요 kw의 순위
    console.log("maxKWhArr", maxKWhArr); // 최대전력시 필요 시간

    //! 잉여 전력값으로 계산
    if (remainKwh === 0) {
      //? 잉여전력값이 0 일 경우 시간당 필요 전력값 그대로 돌리기
      await res.forEach(async (e, i) => {
        await loopChargingProgress(
          e,
          Math.ceil(remainArr[i]),
          e.lastDate && addHour(e.lastDate, remainHour.slice().sort((a, b) => a - b)[0]),
          remainHour.slice().sort((a, b) => a - b)[0]
        );
      });
      console.log("다음날 6시", res);
      logData.push(JSON.parse(JSON.stringify(res)));
      return res;
    } else if (remainKwh < 0) {
      //? 잉여전력값이 음수일 경우(부족할 경우)
      let count = []; //필요값 중 균등 배분인 5보다 작은 숫자가 있을 경우 [index, 필요한 전력(kwh), 5(균등) - 시간당 필요 전력값]
      remainArr.forEach((e, i) => {
        const MCnumber = Math.ceil(e);
        count.push([i, MCnumber, 5 - MCnumber]);
      });
      console.log("count", count);
      let mRemainKwh = 0;
      count.forEach(async (e, i) => {
        // 균등배분의 5보다 작은 수를 요구할떄 남는 총 kwh
        if (e[2] > 0) {
          mRemainKwh += e[2];
          await loopChargingProgress(
            res[i].remain.kWh,
            e[1],
            res[i].lastDate && addHour(res[i].lastDate, remainHour[i]),
            remainHour[i]
          );
        } else if (e[2] === 0) {
          await loopChargingProgress(
            res[i].remain.kWh,
            5,
            res[i].lastDate && addHour(res[i].lastDate, remainHour[i]),
            remainHour[i]
          );
        }
      });
      console.log("남는 kwh", mRemainKwh);
      const rePriorityCount = count.slice().sort((a, b) => a[2] - b[2]);
      console.log("rePriorityCount", rePriorityCount);
      rePriorityCount.forEach(async (e, i) => {
        if (mRemainKwh >= 2) {
          mRemainKwh -= 2;
          await loopChargingProgress(
            res[e[0]].remain.kWh,
            7,
            res[e[0]].lastDate && addHour(res[e[0]].lastDate, remainHour[e[0]]),
            remainHour[e[0]]
          );
        } else if (mRemainKwh === 1) {
          mRemainKwh -= 1;
          await loopChargingProgress(
            res[e[0]].remain.kWh,
            6,
            res[e[0]].lastDate && addHour(res[e[0]].lastDate, remainHour[e[0]]),
            remainHour[e[0]]
          );
        } else {
          await loopChargingProgress(
            res[e[0]].remain.kWh,
            5,
            res[e[0]].lastDate && addHour(res[e[0]].lastDate, remainHour[e[0]]),
            remainHour[e[0]]
          );
        }
      });
      console.log("네번째 결과값이 잉여값이 음수일 경우", res);
      logData.push(JSON.parse(JSON.stringify(res)));
      return res;
    } else {
      //? 잉여전력값이 양수일 경우(남는 경우)
      let count = [];
      let currUsage = 0;
      await remainArr.forEach((e, i) => {
        // 여기서 사용될 배열 만들기
        count.push({
          index: i,
          remainKwh: Math.ceil(e),
          maxKWh: Math.ceil(maxKWhArr[i]),
        });
      });
      await count.sort((a, b) => b.remainKwh - a.remainKwh); //시간당 필요 전력기준 내림차순 정렬
      console.log("count", count);
      let reCount = [];
      for (let i = 0; i < count.length; i++) {
        // 시간당 필요전력이 7이상일 경우
        if (count[i].remainKwh >= 7) {
          currUsage += 7;
          await loopChargingProgress(
            res[count[i].index].remain.kWh,
            7,
            count[i].lastDate && addHour(count[i].lastDate, remainHour[count[i].index]),
            remainHour[count[i].index]
          );
          console.log("currUsage", currUsage);
        } else {
          // 시간당 필요전력이 7 미만일 경우
          reCount.push(count[i]); // 사용되지 않은 객체의 정보 재배치
        }
      }
      console.log("reCount", reCount);
      await reCount.forEach(async (e, i) => {
        // 하나의 커넥터도 안쉬고 계속 돌아가게 만들때
        if (remainKwh > 0) {
          let usageKwh = 7 - e.remainKwh;
          if (remainKwh >= usageKwh) {
            remainKwh -= usageKwh;
            await loopChargingProgress(
              res[e.index],
              e.remainKwh + usageKwh,
              res[e.index].lastDate
                ? addHour(res[e.index].lastDate, 8)
                : addHour("2023-01-01T22:00:00.000Z", 8),
              8
            );
          } else {
            await loopChargingProgress(
              res[e.index],
              e.remainKwh,
              res[e.index].lastDate
                ? addHour(res[e.index].lastDate, 8)
                : addHour("2023-01-01T22:00:00.000Z", 8),
              8
            );
          }
        } else {
          await loopChargingProgress(
            res[e.index],
            e.remainKwh,
            res[e.index].lastDate
              ? addHour(res[e.index].lastDate, 8)
              : addHour("2023-01-01T22:00:00.000Z", 8),
            8
          );
        }
      });
      console.log("네번째 잉여값이 양수일 경우", res);
      logData.push(JSON.parse(JSON.stringify(res)));
      return res;
    }
    // console.log("잉여값 0보다 작을때", res);
  })
  .then((res) => {
    const result = {};
    logData.map((e, i) => {
      result[`${i + 1}번째 로그`] = e;
    });
    console.log("logData", result);
    const JSONData = JSON.stringify(result);

    try {
      fs.writeFileSync("./logData.json", JSONData, "utf8");
      console.log("logData가 성공적으로 파일에 저장되었습니다.");
    } catch (err) {
      console.error("파일 저장 중 오류가 발생했습니다.", err);
    }
  });
