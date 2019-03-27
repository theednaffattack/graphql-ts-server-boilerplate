import axios from "axios";
import { createTypeOrmConn } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";

import { Connection } from "typeorm";

let connection: Connection;
const email = "esad@mac.com";
const password = "kasdjfksafdj";

export const loginAndQueryMeTest = async () => {
  test("get currrent user", async done => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    );

    await axios.post(
      process.env.TEST_HOST as string,
      { query: meQuery },
      { withCredentials: true }
    );

    done();
  });
};

beforeAll(async () => {
  if (connection) {
    await User.create({
      email,
      password,
      confirmed: true
    }).save();
  } else {
    connection = await createTypeOrmConn();
    await User.create({
      email,
      password,
      confirmed: true
    }).save();
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

describe("me", () => {
  test("get currrent user", async done => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    );

    await axios.post(
      process.env.TEST_HOST as string,
      { query: meQuery },
      { withCredentials: true }
    );

    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    );

    await axios.post(
      process.env.TEST_HOST as string,
      { query: meQuery },
      { withCredentials: true }
    );

    done();
  });
});

export const testNoCookie = () => {
  describe("more me?", () => {
    test("return null if no cookie", async () => {
      const response = await axios.post(
        process.env.TEST_HOST as string,
        { query: meQuery },
        { withCredentials: true }
      );
      expect(response.data.data.data.me).toBeNull();
    });
  });
};
