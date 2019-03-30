// import { getRepository } from "typeorm";

// import { Connection } from "typeorm";
import { User } from "../../entity/User";
import { TestClient } from "../../utils/TestClient";
import { createTestConn } from "../../utils/createTestConnection";
// import { clearDb } from "../../utils/deleteUsersAfterTestRun";

// const connection = getConnection("default");
// const userRepository = getConnection("default").getRepository(User);
// const userRepository = getRepository(User);
let connection: any = null;
const email = "LOGOUT_TEST@mac.com";
const password = "kasdjfksafdj";

let user: any;
let userId: string;

beforeAll(async done => {
  // if (!connection) {
  connection = await createTestConn();
  user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
  done();
  // }
});

console.log(connection ? "connection established" : " no connection");
// afterAll(async done => {
//   // clearDb(connection);
//   await User.remove(user);
//   connection.close();
//   done();
// });

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

    // we should be signed in
    expect(response1.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    await client.logout();
    // sign out should be null (not sure why null, actually)
    const responseToo = await client.me();
    expect(responseToo.data.me).toBeNull();

    done();
  });
});
