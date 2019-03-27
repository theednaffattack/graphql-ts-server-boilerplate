import { Connection } from "typeorm";

import { createTypeOrmConn } from "../../utils/createTypeormConnection";
import { User } from "../../entity/User";
import { TestClient } from "../../utils/testClient";

let connection: Connection;

const email = "esad@mac.com";
const password = "kasdjfksafdj";

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

describe("logout", () => {
  test("multiple sessions: test LOGGING IN and LOGGING OUT all clients", async done => {
    const session1 = new TestClient(process.env.TEST_HOST as string);
    const session2 = new TestClient(process.env.TEST_HOST as string);

    // log one user into two machines
    await session1.login(email, password);
    await session2.login(email, password);
    expect(await session1.me()).toEqual(await session2.me());

    // logout of the first machine, only
    await session1.logout();
    expect(await session1.me()).toEqual(await session2.me());
    done();
  });

  test("single session: test LOGGING IN and then LOGGING OUT a user", async done => {
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

    done();
  });
});
