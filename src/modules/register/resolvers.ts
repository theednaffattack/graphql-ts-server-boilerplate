import { ResolverMap } from "../../types/graphql-utils";
import * as bcrypt from "bcryptjs";
import * as yup from "yup";
import { User } from "../../entity/User";
import { formatYupError } from "../../utils/formatYupError";
import {
  duplicateEmail,
  emailInvalid,
  emailNotLongEnough,
  passwordNotLongEnough
} from "./errorMessages";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(4, emailNotLongEnough)
    .max(255)
    .email(emailInvalid),
  password: yup
    .string()
    .min(9, passwordNotLongEnough)
    .max(255)
});

export const resolvers: ResolverMap = {
  Query: {
    dummy: (_, {}) => "just a string"
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }
      let { email, password } = args;

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

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = User.create({
        email,
        password: hashedPassword
      });

      await user.save();
      return null;
    }
  }
};
