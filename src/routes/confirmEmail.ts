import { Request, Response } from "express";
import { redis } from "../redis";

import { User } from "../entity/User";
import { createTypeOrmConn } from "../utils/createTypeormConnection";

export const confirmEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = await redis.get(id);
  console.log(await redis.get("8ab36f6d-e52e-408b-980a-0b14375bac87"));
  // console.log(redis.get());
  if (userId) {
    await createTypeOrmConn();

    const myId: string = userId;

    await User.update({ id: myId }, { confirmed: true });
    await redis.del(id);
    res.send("ok");
  } else {
    res.send("invalid");
  }
};
