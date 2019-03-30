import * as Redis from "ioredis";
import { Connection } from "typeorm";
import fetch from "node-fetch";

import { createConfirmedEmailLink } from "./createConfirmedEmailLink";
import { User } from "../../entity/User";
import { createTypeOrmConn } from "../../utils/createTypeormConnection";

const redis = new Redis();

let userId: any;

let connection: Connection;

beforeAll(async () => {
  if (connection && connection.isConnected) {
    console.log("CONNECTED ALREADY!");
    const user = await User.create({
      email: "bob9@bob.com",
      password: "ldfkjdkfjkaf"
    }).save();
    userId = user.id;
  } else {
    connection = await createTypeOrmConn();
    const user = await User.create({
      email: "bob9@bob.com",
      password: "ldfkjdkfjkaf"
    }).save();
    userId = user.id;
  }
});

afterAll(async () => {
  if (connection) {
    connection.close();
  }
});

test("Make sure createtConfirmationEmailLink confirms user and clears key in redis", async () => {
  const url = await createConfirmedEmailLink(
    process.env.TEST_HOST as string,
    userId,
    new Redis()
  );
  const response = await fetch(url, { method: "GET" });
  const text = await response.text();
  expect(text).toEqual("ok");
  const user = await User.findOne({ where: { id: userId } });
  expect((user as User).confirmed).toBeTruthy();
  const chunks = url.split("/");
  const key = chunks[chunks.length - 1];
  const value = await redis.get(key);
  expect(value).toBeNull();
});
