import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import {
  errorResponse,
  confirmEmailError
  // sessionError
} from "./errorMessages";

export const resolvers: ResolverMap = {
  Query: {
    dummy2: (_, {}) => "just a string"
  },
  Mutation: {
    login: async function loginMut(
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      context
    ) {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return errorResponse;
      }

      if (!user.confirmed) {
        return confirmEmailError;
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return errorResponse;
      }

      // login successful
      // if (session) {
      context.session.userId = user.id;

      if (context.req.session) {
        context.req.session.userId = user.id;
      } else {
        throw Error("no session object!");
      }
      //   return [{ path: "login", message: "login successful" }];
      // } else {
      //   return sessionError(this.login.name);
      // }

      // return [{ path: "login", message: "error! should be unreachable" }];
      return null;
    }
  }
};
