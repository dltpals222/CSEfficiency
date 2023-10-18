function totalCharging(kW, hour) {
  return kW * hour;
}

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

// 사용하고 있는 커넥터의 수
baseInfo.limit.connectorCount = Object.keys(baseInfo.cond).length;

new Promise((resolve, reject) => {
  if (baseInfo.cond && Object.keys(baseInfo.cond).length > 0) {
    resolve();
  } else {
    reject(error);
  }
})
  .then(() => {
    //todo 균등 테스트 결과
    const equalTest = {};

    if (baseInfo.limit.connectorCount === 4) {
      for (let key in baseInfo.cond) {
        equalTest[key] = totalCharging(5, baseInfo.cond[key].hours);
      }
    } else if (baseInfo.limit.connectorCount === 3) {
    }

    //todo 7kWh 시 결과
    const sevenkWh = {};

    for (let key in baseInfo.cond) {
      sevenkWh[key] = totalCharging(baseInfo.limit.totalkWh, baseInfo.cond[key].hours);
    }

    const rslt = {
      equalTest: equalTest,
      sevenkWh: sevenkWh,
    };

    return rslt;
  })
  .then((res) => {
    const { equalTest, sevenkWh } = res;
    const case1rslt = {
      first: 0,
    };
    // case 1 테스트
    // const case1Test = [];
    // for (let key in baseInfo.cond) {
    //   equalTest[key] === baseInfo.cond[key].kWh
    //     ? case1Test.push("충전시간 일치")
    //     : equalTest[key] - baseInfo.cond[key].kWh > 0
    //     ? case1Test.push(`잉여 전력 ${equalTest[key] - baseInfo.cond[key].kWh} kWh`)
    //     : case1Test.push(`충전 부족 ${baseInfo.cond[key].kWh - equalTest[key]} kWh`);
    // }

    //todo 총 잉여전력 - 총 필요전력
    for (let key in baseInfo.cond) {
      case1rslt.first += equalTest[key] - baseInfo.cond[key].kWh;
    }

    if (case1rslt.first >= 0) {
      const data = {};
      const dataKeys = ["id", "isKW", "amount", "startHour", "endHour"];
      for (let key in baseInfo.cond) {
        dataKeys.forEach((e) => {});
      }
    }
  })
  .catch((err) => {
    console.error("Error :", err);
  });
