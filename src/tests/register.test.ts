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

// afterAll(() => {
//   app.close();
// });

const email = "eunice@bill.com";
const password = "whoopie";

const mutation = `
mutation {
  register(email: "${email}", password: "${password}"){
    path,
    message
  }
}
`;

test("Register user", async done => {
  interface Response {
    register: [
      {
        path: string;
        message: string;
      }
    ];
  }

  const response: Response = await request(getHost(), mutation);

  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  const response2: Response = await request(getHost(), mutation);

  expect(response2.register).toHaveLength(1);
  expect(response2.register[0].path).toEqual("email");

  done();
});
