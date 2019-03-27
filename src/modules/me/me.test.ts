import axios from "axios";
import { createTypeOrmConn } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";

// const redis = new Redis();
import { Connection } from "typeorm";

// let userId: any;

let connection: Connection;
const email = "esad@mac.com";
const password = "kasdjfksafdj";

// const goodEmail = "eddienaff@gmail.com";
// const goodPassword = "booyakasha";

export const loginAndQueryMeTest = async () => {
  test("get currrent user", async done => {
    const loginThing = await axios.post(
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

    console.log("From test: response.data");
    console.log("loginThing.headers");
    console.log(loginThing.headers);
    console.log("response.headers");
    console.log(response.headers);
    console.log(response.data.data);

    console.log(Object.keys(response.headers));
    console.log(Object.keys(loginThing.headers));
    done();
  });
};

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

describe("me", () => {
  //   test("can't get user if not logged in", async () => {
  //     // later
  //   });

  test("get currrent user", async done => {
    const loginThing2 = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true
      }
    );

    const response2 = await axios.post(
      process.env.TEST_HOST as string,
      { query: meQuery },
      { withCredentials: true }
    );

    console.log("From test: response.data");
    console.log("loginThing.headers");
    console.log(loginThing2.headers);
    console.log("response.headers");
    console.log(response2.headers);
    console.log(response2.data.data);

    console.log(Object.keys(response2.headers));
    console.log(Object.keys(loginThing2.headers));
    // done();
    const loginThing = await axios.post(
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

    console.log("From test: response.data");
    console.log("loginThing.headers");
    console.log(loginThing.headers);
    console.log("response.headers");
    console.log(response.headers);
    console.log(response.data.data);

    console.log(Object.keys(response.headers));
    console.log(Object.keys(loginThing.headers));
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
