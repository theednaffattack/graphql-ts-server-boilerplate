import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import {
  invalidError,
  confirmEmailError,
  forgotPasswordLockedError
  // sessionError
} from "./errorMessages";
import { userSessionIdPrefix } from "../../../constants";
// import { redisSessionPrefix } from "../../constants";

export const resolvers: ResolverMap = {
  Mutation: {
    login: async function loginMut(
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { redis, req, session }
    ) {
      const user = await User.findOne({ where: { email } });

      // can't find user
      if (!user) {
        return invalidError;
      }

      // user is found but has not confirmed their account yet
      if (user.confirmed === false) {
        return confirmEmailError;
      }

      if (user.forgotPasswordLocked === true) {
        return [{ path: "email", message: forgotPasswordLockedError }];
      }
      // compare the supplied password to the db password for this user
      const valid = await bcrypt.compare(password, user.password as string);

      // password is incorrect (does not match db record)
      if (valid === false) {
        return invalidError;
      }

      // login successful
      session.userId = user.id;
      if (req.sessionID && user.forgotPasswordLocked === false) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID); // creates an array and adds one element or adds to existing

        // return [{ path: "login", message: "login successful" }];
        return null;
      }

      return null;
    }
  }
};
