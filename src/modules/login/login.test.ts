import { Connection } from "typeorm";

import { invalidLogin, confirmEmailErrorText } from "./errorMessages";
import { TestClient } from "../../utils/testClient";
import { User } from "../../entity/User";
import { createTestConn } from "../../utils/createTestConnection";

let connection: Connection;

beforeAll(async () => {
  if (!connection) {
    connection = await createTestConn();
  }
});

// since we don't create these in a BeforeAll block Login tests
// depending on these values will always fail.
// const badEmail = "asfgdasg";
const badPassword = "123";

const goodEmail = "LOGIN_TEST@gmail.com";
const goodPassword = "booyakasha";

// a function that attempts to log in and
// runs a (hopefully) failing login
const loginExpectError = async (
  client: TestClient,
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await client.login(e, p);

  expect(response.data).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  });
};

describe("Login testing", () => {
  test("email not found send back error", async done => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await loginExpectError(client, goodEmail, goodPassword, invalidLogin);
    done();
  });

  test("email not confirmed", async done => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // register someone for real
    await client.register(goodEmail, goodPassword);

    // run a test to ensure than an unconfirmed user
    // can't login
    await loginExpectError(
      client,
      goodEmail,
      goodPassword,
      confirmEmailErrorText
    );

    // update the user (registered above) so that they are confirmed
    await User.update({ email: goodEmail }, { confirmed: true });

    // ensure that a confirmed user cannot login with a bad password
    await loginExpectError(client, goodEmail, badPassword, invalidLogin);

    const response = await client.login(goodEmail, goodPassword);

    // test to ensure that we can login when confirmed
    // with valid email and password
    expect(response.data).toEqual({ login: null });
    done();
  });
});
