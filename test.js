function ChargingSystemConnector(input, total, time) {
  return input / total;
}

function totalCharging(kW, hour) {
  return kW * hour;
}

const baseInfo = {
  A: {
    kWh: 60,
    hours: 12,
  },
  B: {
    kWh: 72,
    hours: 12,
  },
  C: {
    kWh: 48,
    hours: 8,
  },
  D: {
    kWh: 60,
    hours: 20,
  },
};

new Promise((resolve, reject) => {
  if (baseInfo) {
    resolve();
  } else {
    reject("데이터가 비어있습니다.");
  }
})
  .then(() => {
    // 균등 테스트 결과
    const equalTest = {};

    for (let key in baseInfo) {
      equalTest[key] = totalCharging(5, baseInfo[key].hours);
    }

    // 7kWh 시 결과
    const sevenkWh = {};

    for (let key in baseInfo) {
      sevenkWh[key] = totalCharging(7, baseInfo[key].hours);
    }

    const rslt = {
      equalTest: equalTest,
      sevenkWh: sevenkWh,
    };

    return rslt;
  })
  .then((res) => {
    const { equalTest, sevenkWh } = res;
    console.log(res);

    // case 1 테스트
    const case1Test = [];
    for (let key in baseInfo) {
      equalTest[key] === baseInfo[key].kWh
        ? case1Test.push("충전시간 일치")
        : equalTest[key] - baseInfo[key].kWh > 0
        ? case1Test.push(`잉여 전력 ${equalTest[key] - baseInfo[key].kWh} kWh`)
        : case1Test.push(`충전 부족 ${baseInfo[key].kWh - equalTest[key]} kWh`);
    }

    console.log(case1Test);
  });
