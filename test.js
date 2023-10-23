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
const timeSet = [5, 3, 8, 1, 3]; // 각각 충전 시간

// startTransaction일때 초기 설정
function initDumpData(resultData, cond) {
  resultData.LastAction = "startTransaction";
  resultData.remain.kWh = cond.kWh;
  resultData.startDate = new Date("2023-01-01 14:00:00");
}

// 시간마다 해당 번호의 충전 킬로와트 축적용 함수
function chargingProgress(resultData, chargingKw, lastDate) {
  resultData.cumulative.charging += chargingKw;
  resultData.cumulative.hour += 1;
  resultData.lastDate = new Date(lastDate);
}

// chargingProgress loop문
function loopChargingProgress(resultData, chargingKw, count) {
  resultData.forEach((e) => {
    if (e.LastAction === "startTransaction" && typeof e.TransactionId === "number") {
      for (let i = 0; i < count; i++) {
        chargingProgress(e, chargingKw);
      }
    }
  });
}

// 현재 충전 시작한 커넥터의 갯수
function countCharging(dumpData) {
  let countConnected = 0;
  dumpData.forEach((ele) => {
    if (ele.LastAction === "startTransaction") countConnected += 1;
  });
  return countConnected;
}

// 시간당 필요 전력(기본값 0자리 올림)
function hourRequireKWH(totalKWh, hour, toFixed = 0) {
  return (totalKWh / hour).toFixed(toFixed);
}

// 잉여전력 (kWh)
function getRemainPower(dumpData, maxKWh = 20) {
  let result = 0;
  for (let i of dumpData) {
    result += hourRequireKWH(i.remain.kWh);
  }
  return maxKWh - result;
}

new Promise((resolve, reject) => {
  if (dumpData) {
    resolve();
  } else {
    reject();
  }
}) // 첫번째 분기점
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
    logData.push(resultData);
    return resultData;
  }) // 두번째 분기점
  .then(async (res) => {
    // 5시간 경과 후 19시 2대 추가
    await loopChargingProgress(res, 7, 5);
    const baseA = baseInfo.cond.A;
    const baseB = baseInfo.cond.B;
    initDumpData(res[1], baseA);
    initDumpData(res[2], baseB);
    logData.push(res);
    console.log("19:00", res);

    return res;
  }) // 세번째 분기점
  .then((res) => {});
