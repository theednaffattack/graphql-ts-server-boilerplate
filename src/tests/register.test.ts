import { request } from "graphql-request";
//   module.exports = sum;

//   const sum = require('./sum');
const email = "bill@bill.com";
const password = "whoopie";

// import { port } from "../index";
const port = 4000;

const mutation = `
mutation {
  register(email: "${email}", password: "${password}")
}
`;

test("Register user", async () => {
  const response = await request(`http://192.168.1.40:${port}`, mutation);
  console.log(response);
  expect(response).toEqual({
    register: true
  });
});

// test("adds 1 + 2 to equal 3", () => {
//   expect(sum(1, 2)).toBe(3);
// });

// simple arithmatic
test("two plus two is four", () => {
  expect(2 + 2).toBe(4);
});

test("object assignment", () => {
  interface DataObject {
    [key: string]: number;
  }
  const data: DataObject = { one: 1 };
  data["two"] = 2;
  expect(data).toEqual({ one: 1, two: 2 });
});
