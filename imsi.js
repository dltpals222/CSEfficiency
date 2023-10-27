// 시간당 필요 전력(기본값 소수점 3자리까지)
function hourRequireKWH(totalKWh, hour, toFixed = 3) {
  return (totalKWh / hour).toFixed(toFixed);
}

let needKwh = hourRequireKWH(7, 12);
let maxKwh = hourRequireKWH(7, 7);

console.log(needKwh, maxKwh, needKwh - maxKwh);

needKwh = hourRequireKWH(39, 9);
maxKwh = hourRequireKWH(39, 7);

console.log(needKwh, maxKwh, needKwh - maxKwh);

console.log(5 / 2);
console.log(5 % 2);

const testString = "012"

console.log(testString.slice(-2))