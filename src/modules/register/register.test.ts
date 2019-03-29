// import { createConnection } from "typeorm";

import { User } from "../../entity/User";
import {
  emailNotLongEnough,
  duplicateEmail,
  emailInvalid,
  passwordNotLongEnough
} from "./errorMessages";
// import {
//   // deleteUsersAfterTestsRun,
//   clearDb
// } from "../../utils/deleteUsersAfterTestRun";
import { TestClient } from "../../utils/TestClient";
import { createTypeOrmConn } from "../../utils/createTypeormConnection";
import { Connection } from "typeorm";

// needed for test setup
let user: any;
let connection: Connection;

const email = "REGISTER_TEST@bill.com";
const password = "whoopiebl";

// jest commands - START

beforeAll(async () => {
  connection = await createTypeOrmConn();
});

afterAll(async () => {
  if (connection) {
    connection.close();
  }
});

// jest commands - END

// tests
describe("User registration testing", () => {
  it("Register user with properly formatted information", async done => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response = await client.register(email, password);

    expect(response.data).toEqual({ register: null });

    const users = await User.find({ where: { email } });

    expect(users).toHaveLength(1);

    user = users[0];

    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    done();
  });

  it("Test for duplicate emails", async done => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response2 = await client.register(email, password);
    expect(response2.data.register).toHaveLength(1);
    expect(response2.data.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });

    done();
  });

  it("Test for emails that are too short", async done => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response3 = await client.register("b", password);

    expect(response3.data).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: emailInvalid
        }
      ]
    });

    done();
  });

  it("Test for passwords that are too short", async done => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response4 = await client.register(email, "bx");

    expect(response4.data.register[0]).toEqual({
      path: "password",
      message: passwordNotLongEnough
    });

    done();
  });

  it("Catch bad password and bad email (too short and mal formatted)", async done => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response5 = await client.register("jd", "yt");

    expect(response5.data).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: emailInvalid
        },
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });

    done();
  });
});
