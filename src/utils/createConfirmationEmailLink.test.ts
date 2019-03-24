import { createConfirmedEmailLink } from "./createConfirmedEmailLink";
import { createTypeOrmConn } from "./createTypeormConnection";
import { User } from "../entity/User";
import fetch from "node-fetch";
import * as Redis from "ioredis";

const redis = new Redis();

let userId: any;

let connection: any;

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

describe("test createConfirmEmailLink", () => {
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
    console.log(text);
    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);
    expect(value).toBeNull();
  });
  // this test belongs in its own file
  test("sends invalid back if bad id is sent", async () => {
    const response = await fetch(`${process.env.TEST_HOST}/confirm/45678`, {
      method: "GET"
    });
    const text = await response.text();
    expect(text).toEqual("invalid");
  });
});
