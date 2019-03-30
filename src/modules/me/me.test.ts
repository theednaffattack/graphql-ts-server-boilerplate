import { User } from "../../entity/User";

import { TestClient } from "../../utils/TestClient";
import { createTestConn } from "../../utils/createTestConnection";
// import { userSessionIdPrefix } from "../../constants";

let connection: any = null;
const email = "ME_TESTING@mac.com";
const password = "ME_PASSWORD";

let user: any;

beforeAll(async () => {
  connection = await createTestConn();
  user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
});

console.log(connection ? "connection established" : " no connection");
// afterAll(async () => {
//   if (connection) {
//     connection.close();
//   }
// });

describe("me", () => {
  test("return null if no cookie", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response = await client.me();
    expect(response.data.me).toBeNull();
  });

  test("get currrent user", async done => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.login(email, password);

    const response = await client.me();
    const userId = user.id;

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    done();
  });
});
