import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import {
  errorResponse,
  confirmEmailError
  // sessionError
} from "./errorMessages";
import { userSessionIdPrefix } from "../../constants";
// import { redisSessionPrefix } from "../../constants";

export const resolvers: ResolverMap = {
  Query: {
    dummy2: (_, {}) => "just a string"
  },
  Mutation: {
    login: async function loginMut(
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { redis, req, session }
    ) {
      const user = await User.findOne({ where: { email } });
      // can't find user
      if (!user) {
        return errorResponse;
      }

      // user is found but has not confirmed their account yet
      if (!user.confirmed) {
        return confirmEmailError;
      }

      // compare the supplied password to the db password for this user
      const valid = await bcrypt.compare(password, user.password);

      // password is incorrect (does not match db record)
      if (!valid) {
        return errorResponse;
      }

      // login successful
      session.userId = user.id;
      if (req.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID); // creates an array and adds one element or adds to existing

        return [{ path: "login", message: "login successful" }];
      }

      return null;
    }
  }
};
