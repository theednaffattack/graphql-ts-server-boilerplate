import * as yup from "yup";
import * as bcrypt from "bcryptjs";

import { ResolverMap } from "../../types/graphql-utils";
import { forgotPasswordLockAccount } from "../../utils/forgotPasswordLockAccount";
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink";
import { User } from "../../entity/User";
import { userNotFound, expiredKeyError } from "./errorMessages";
import { forgotPasswordPrefix } from "../../constants";
import { registerPasswordValidation } from "../../yupSchemas";
import { formatYupError } from "../../utils/formatYupError";

const schema = yup.object().shape({
  newPassword: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Query: {
    dummy4: (_, {}) => "just a string"
  },
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [
          {
            path: "email",
            message: userNotFound
          }
        ];
      }

      await forgotPasswordLockAccount(user.id, redis);

      // @todo add frontend url
      await createForgotPasswordLink("", user.id, redis);
      // @todo send email with url

      console.log(email);
      return true;
    },
    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const userId = await redis.get(`${forgotPasswordPrefix}${key}`);
      if (!userId) {
        return [
          {
            path: "key",
            message: expiredKeyError
          }
        ];
      }

      try {
        await schema.validate({ newPassword }, { abortEarly: true });
      } catch (error) {
        return formatYupError(error);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      console.log(newPassword, key);
      await User.update(
        { id: userId as string },
        {
          forgotPasswordLocked: false,
          password: hashedPassword
        }
      );

      return false;
    }
  }
};
