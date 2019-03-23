import { request } from "graphql-request";
import { User } from "../entity/User";
// import { createTypeOrmConn } from "../utils/createTypeormConnection";

import { startServer } from "../startServer";
import { AddressInfo } from "net";

// let getHost: any = () => "";

// let app;

let getHost = () => "";

let app: any;

beforeAll(async () => {
  app = await startServer();
  const { port } = (await app.address()) as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});

afterAll(() => {
  app.close();
});

const email = "eunice@bill.com";
const password = "whoopie";

const mutation = `
mutation {
  register(email: "${email}", password: "${password}"){
    email,
    password
  }
}
`;

test("Register user", async done => {
  interface Response {
    register: {
      email: string;
      password: string;
    };
  }
  // await createTypeOrmConn();
  const response: Response = await request(getHost(), mutation);

  console.log("RESPONSE!!!");
  console.log(response);
  expect(response.register.email).toEqual(email);
  expect(response.register.password).not.toEqual(password);
  const users = await User.find({ where: { email } });
  const user = users[0];
  console.log("USERS!!!");
  console.log(users);
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  done();
});
