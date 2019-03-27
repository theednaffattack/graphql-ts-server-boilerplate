import axios from "axios";
import { createTypeOrmConn } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";

// const redis = new Redis();
import { Connection } from "typeorm";
// import { loginAndQueryMeTest } from "../me/me.test";

// let userId: any;

let connection: Connection;
const email = "LOGOUTTEST@mac.com";
const password = "kasdjfksafdj";

const loginEmail = "esad@mac.com";
const loginPassword = "kasdjfksafdj";

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

    console.log("VIEW user");
    console.log(user);
  } else {
    connection = await createTypeOrmConn();
    const user = await User.create({
      email,
      password,
      confirmed: true
    }).save();

    console.log("VIEW user");
    console.log(user);
  }
});

afterAll(async () => {
  if (connection) {
    connection.close();
  }
});

const meQuery = `
{
    me {
        id
        email
    }
}
`;

const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password: "${p}"){
    path,
    message
  }
}
`;

const logoutMutation = `
mutation {
  logout
}
`;

describe("logout", async () => {
  test("test logout a user", async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(loginEmail, loginPassword)
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
    expect(response.data.data.me).toEqual({
      me: {
        id: "2531c33a-5d69-4f99-91a7-ee1653b49155",
        email: "esad@mac.com"
      }
    });

    // later
    await axios.post(
      process.env.TEST_HOST as string,
      { query: logoutMutation },
      { withCredentials: true }
    );

    const responseToo = await axios.post(
      process.env.TEST_HOST as string,
      { query: meQuery },
      { withCredentials: true }
    );

    expect(responseToo.data.data.me).toBeNull();
  });
});
