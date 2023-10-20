const dumpData = [
  {
    TransactionId: 221,
    LastAction: "",
  },
  {
    TransactionId: 227,
    LastAction: "",
  },
  {
    TransactionId: 231,
    LastAction: "",
  },
  {
    TransactionId: 234,
    LastAction: "",
  },
];

const testA = [];

const rsltKeys = ["startDate", "total"];
const initTotal = {
  charging: 0,
  hour: 0,
};

dumpData.forEach((e) => {
  rsltKeys.forEach((ele, i) => {
    e[ele] = i === 0 ? new Date() : initTotal;
  });
  testA.push(e);
});

console.log(testA);
