import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import { errorResponse, confirmEmailError } from "./errorMessages";

export const resolvers: ResolverMap = {
  Query: {
    dummy2: (_, {}) => "just a string"
  },
  Mutation: {
    login: async function loginMut(
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session }
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
      if (session) {
        session.userId = user.id;
      } else {
        throw Error(
          `Resolver Error:${
            this.login.name
          } An error occurred setting "userId" to the SESSION object`
        );
      }

      return null;
    }
  }
};
