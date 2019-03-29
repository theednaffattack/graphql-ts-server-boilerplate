import { userSessionIdPrefix, redisSessionPrefix } from "../constants";
import { Redis } from "ioredis";

export const removeAllUserSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(
    `${userSessionIdPrefix}${userId}`,
    0,
    -1
  );

  const promises = [];

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < sessionIds.length; i += 1) {
    promises.push(redis.del(`${redisSessionPrefix}${sessionIds[i]}`));
  }

  const viewRemovePromises = await Promise.all(promises);

  return viewRemovePromises;
};
