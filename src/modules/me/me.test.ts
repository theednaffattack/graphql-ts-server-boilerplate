import axios from "axios";
import { createTypeOrmConn } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";

import { loginMutation } from "../login/login.test";

// const redis = new Redis();
import { Connection } from "typeorm";

// let userId: any;

let connection: Connection;
const email = "esad@mac.com";
const password = "kasdjfksafdj";

// const goodEmail = "eddienaff@gmail.com";
// const goodPassword = "booyakasha";

beforeAll(async () => {
  if (connection) {
    console.log("CONNECTED ALREADY!");
    const user = await User.create({
      email,
      password,
      confirmed: true
    }).save();

    console.log(user);
  } else {
    connection = await createTypeOrmConn();
    const user = await User.create({
      email,
      password,
      confirmed: true
    }).save();

    console.log(user);
  }
});

afterAll(async () => {
  if (connection) {
    connection.close();
  }
});

// export const loginMutatiogn = (e: string, p: string) => `
// mutation {
//   login(email: "${e}", password: "${p}"){
//     path,
//     message
//   }
// }
// `;

const meQuery = `
{
    me {
        id
        email
    }
}
`;

describe("me", () => {
  //   test("can't get user if not logged in", async () => {
  //     // later
  //   });

  test("get currrent user", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    );
    const response = await axios.post(
      process.env.TEST_HOST as string,
      { query: meQuery },
      { withCredentials: true }
    );
    console.log(response.data);
  });
});
