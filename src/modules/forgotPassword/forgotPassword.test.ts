import { Connection } from "typeorm";

import { User } from "../../entity/User";
import { createTypeOrmConn } from "../../utils/createTypeormConnection";
import { TestClient } from "../../utils/TestClient";
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink";
import * as Redis from "ioredis";
import { forgotPasswordLockAccount } from "../../utils/forgotPasswordLockAccount";
import { passwordIsTooShort, expiredKeyError } from "./errorMessages";
import { forgotPasswordLockedError } from "../login/errorMessages";
import {
  // deleteUsersAfterTestsRun,
  clearDb
} from "../../utils/deleteUsersAfterTestRun";

let connection: Connection;

let userId: string;
let user: any;

export const redis = new Redis();

const email = "FORGOT_PASSWORD_TESTS@mac.com";
const password = "kasdjfksafdj";
const newPassword = "ddksfjdaouiew";

beforeAll(async done => {
  connection = await createTypeOrmConn();
  user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
  done();
});

afterAll(async done => {
  // get rid of any users created

  await clearDb(connection);
  connection.close();
  done();
});

describe("forgot password", () => {
  test("make sure it works", async done => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const checkLock = await forgotPasswordLockAccount(userId, redis);
    const url = await createForgotPasswordLink("", userId, redis);
    const parts = url.split("/");

    console.log("checkLock");
    console.log(checkLock);

    // make sure you can't login to a locked account
    expect(await client.login(email, password)).toEqual({
      data: {
        login: [{ path: "email", message: forgotPasswordLockedError }]
      }
    });

    const key = parts[parts.length - 1];
    const response = await client.forgotPasswordChange(newPassword, key);

    // try changing to a password that is too short
    expect(await client.forgotPasswordChange("a", key)).toEqual({
      data: {
        forgotPasswordChange: {
          path: "key",
          message: passwordIsTooShort
        }
      }
    });

    // ???
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
