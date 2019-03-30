import { User } from "../../entity/User";
import { TestClient } from "../../utils/TestClient";
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink";
import * as Redis from "ioredis";
import { forgotPasswordLockAccount } from "../../utils/forgotPasswordLockAccount";
import { passwordIsTooShort, expiredKeyError } from "./errorMessages";
import { forgotPasswordLockedError } from "../login/errorMessages";
import { createTestConn } from "../../utils/createTestConnection";
// import {
//   // deleteUsersAfterTestsRun,
//   clearDb
// } from "../../utils/deleteUsersAfterTestRun";

let connection: any;

let userId: string;
let user: any;

export const redis = new Redis();

const email = "FORGOT_PASSWORD_TESTS@mac.com";
const password = "kasdjfksafdj";
const newPassword = "ddksfjdaouiew";

beforeAll(async done => {
  connection = await createTestConn();
  user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
  done();
});

console.log(connection);

describe("forgot password", () => {
  test("make sure it works", async done => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // lock account
    await forgotPasswordLockAccount(userId, redis);
    const url = await createForgotPasswordLink("", userId, redis);

    // get the key from the forgot password link
    const parts = url.split("/");
    const key = parts[parts.length - 1];

    // make sure you can't login to a locked account
    expect(await client.login(email, password)).toEqual({
      data: {
        login: [{ path: "email", message: forgotPasswordLockedError }]
      }
    });

    // we'll have to unlock the account to move forward
    // we'll have to change the password to unlock it, first let's...
    // try changing to a password that is too short
    expect(await client.forgotPasswordChange("a", key)).toEqual({
      data: {
        forgotPasswordChange: {
          path: "key",
          message: passwordIsTooShort
        }
      }
    });

    // change the password
    const response = await client.forgotPasswordChange(newPassword, key);
    expect(response.data).toEqual({
      forgotPasswordChange: null
    });

    // make sure redis key expires after password change
    expect(await client.forgotPasswordChange("sdkfjskdsjf", key)).toEqual({
      data: {
        forgotPasswordChange: {
          path: "key",
          message: expiredKeyError
        }
      }
    });

    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    });

    done();
  });
});
