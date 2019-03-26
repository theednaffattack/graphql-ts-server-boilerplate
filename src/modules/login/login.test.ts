import { request } from "graphql-request";
// import { User } from "../../entity/User";
import { LoginResponse } from "../../types/graphql-utils";
import { invalidLogin } from "./errorMessages";
// import { registerMutation } from "../register/register.test";

const email = "asfgdasg";
const password = "123";

const goodEmail = "eddienaff@gmail.com";
const goodPassword = "booyakasha";

export const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password: "${p}"){
    path,
    message
  }
}
`;

const login = async (e: string, p: string) => {
  const response: LoginResponse = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, p)
  );
  expect(response).toEqual({
    login: [{ message: invalidLogin, path: "email" }]
  });
};

describe("Login testing", () => {
  test("email not found send back error", async done => {
    await login(email, password);
    done();
  });

  test("email not confirmed", async done => {
    await login(goodEmail, goodPassword);
    done();
  });
});
