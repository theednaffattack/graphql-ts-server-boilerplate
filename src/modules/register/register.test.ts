import { request } from "graphql-request";
import { User } from "../../entity/User";

// import { startServer } from "../../startServer";
// import { AddressInfo } from "net";
import {
  emailNotLongEnough,
  duplicateEmail,
  emailInvalid,
  passwordNotLongEnough
} from "./errorMessages";
import { createTypeOrmConn } from "../../utils/createTypeormConnection";

beforeAll(async () => {
  await createTypeOrmConn();
});

const email = "eunice@bill.com";
// const email = "eu";
const password = "whoopiebl";
// const password = "wh";

export const registerMutation = (e: string, p: string) => `
mutation {
  register(email: "${e}", password: "${p}"){
    path,
    message
  }
}
`;

interface Response {
  register: [
    {
      path: string;
      message: string;
    }
  ];
}

describe("User registration testing", () => {
  it("Register user with properly formatted information", async done => {
    const response: Response = await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );

    expect(response).toEqual({ register: null });

    const users = await User.find({ where: { email } });
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    done();
  });

  it("Test for duplicate emails", async done => {
    const response2: Response = await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );

    expect(response2.register).toHaveLength(1);
    expect(response2.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });

    done();
  });

  it("Test for emails that are too short", async done => {
    const response3: Response = await request(
      process.env.TEST_HOST as string,
      registerMutation("b", password)
    );

    expect(response3).toEqual({
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
    const response4: Response = await request(
      process.env.TEST_HOST as string,
      registerMutation(email, "fake")
    );
    expect(response4.register[0]).toEqual({
      path: "password",
      message: passwordNotLongEnough
    });

    done();
  });

  it("Catch bad password and bad email (too short and mal formatted)", async done => {
    const response5: Response = await request(
      process.env.TEST_HOST as string,
      registerMutation("bu", "fake")
    );
    expect(response5).toEqual({
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
