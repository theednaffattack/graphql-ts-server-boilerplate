function sum(a: any, b: any) {
  return a + b;
}
//   module.exports = sum;

//   const sum = require('./sum');

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
