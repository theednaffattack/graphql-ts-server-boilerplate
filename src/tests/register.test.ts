import { request } from "graphql-request";
import { createConnection } from "typeorm";
import { User } from "../entity/User";
//   module.exports = sum;

//   const sum = require('./sum');
const email = "eunice@bill.com";
const password = "whoopie";

// import { port } from "../index";
const port = 4000;
const host = `http://192.168.1.40:${port}`;

const mutation = `
mutation {
  register(email: "${email}", password: "${password}")
}
`;

test("Register user", async done => {
  const response = await request(host, mutation);
  expect(response).toEqual({
    register: true
  });

  createConnection()
    .then(async connection => {
      const users = await User.find({ where: { email } });
      const user = users[0];
      expect(user.email).toEqual(email);
      expect(user.password).not.toEqual(password);
      connection.close();
      done();
    })
    .catch(e => console.error(e));
  // expect(users).toHaveLength(1);
});
