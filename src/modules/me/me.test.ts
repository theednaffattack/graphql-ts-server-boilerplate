import { clearDb } from "../../utils/deleteUsersAfterTestRun";
import { createTypeOrmConn } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";

import { Connection } from "typeorm";
import { TestClient } from "../../utils/TestClient";
// import { userSessionIdPrefix } from "../../constants";

let connection: Connection;
const email = "ME_TESTING@mac.com";
const password = "ME_PASSWORD";

let user: any;

beforeAll(async () => {
  if (connection) {
    user = await User.create({
      email,
      password,
      confirmed: true
    }).save();
  } else {
    connection = await createTypeOrmConn();
    user = await User.create({
      email,
      password,
      confirmed: true
    }).save();
  }
});

afterAll(async () => {
  if (connection) {
    clearDb(connection);
    connection.close();
  }
});

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
