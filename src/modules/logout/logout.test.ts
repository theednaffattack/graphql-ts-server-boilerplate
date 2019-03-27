import { Connection } from "typeorm";

import { createTypeOrmConn } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";
import { TestClient } from "../../utils/testClient";

let connection: Connection;

const email = "esad@mac.com";
const password = "kasdjfksafdj";

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

describe("logout", () => {
  test("test LOGGING IN and then LOGGING OUT a user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.login(email, password);

    const response1 = await client.me();

    expect(response1.data).toEqual({
      me: {
        id: "cecec352-b002-4e62-bfb1-16acc5789592",
        email: "esad@mac.com"
      }
    });

    await client.logout();

    const responseToo = await client.me();

    expect(responseToo.data.me).toBeNull();
  });
});
