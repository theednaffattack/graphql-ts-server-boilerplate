import * as yup from "yup";

import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { formatYupError } from "../../../utils/formatYupError";
import {
  duplicateEmail,
  emailInvalid,
  emailNotLongEnough
} from "./errorMessages";
import { registerPasswordValidation } from "../../../yupSchemas";
// import { createConfirmedEmailLink } from "../../utils/createConfirmedEmailLink";
// import { sendEmail } from "../../sendEmail";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(4, emailNotLongEnough)
    .max(255)
    .email(emailInvalid),
  password: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments
      // { redis, url }
    ) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }

      const { email, password } = args;

      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      });

      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ];
      }

      const user = User.create({
        email,
        password
      });

      await user.save();

      // console.log("process.env.SPARKPOST_API_KEY");
      // console.log(process.env.SPARKPOST_API_KEY);

      // await sendEmail(
      //   email,
      //   await createConfirmedEmailLink(url, user.id, redis)
      // );

      // [
      //   {
      //     path: "email",
      //     message: await createConfirmedEmailLink(url, user.id, redis)
      //   }
      // ];

      return null;
    }
  }
};
