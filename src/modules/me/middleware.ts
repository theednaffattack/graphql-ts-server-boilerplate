import { Resolver } from "../../types/graphql-utils";
// import { User } from "../../entity/User";
// import { logger } from "../../utils/logger";

export default async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  // logging middleware

  // logger(resolver, args, context);

  // security middleware
  if (!context.session || !context.session.userId) {
    // this this should probably be a client-safe erorr and logging
    return null;
  }

  // check if user is an admin
  // const user = await User.findOne({ where: { id: context.session.userId } });
  // if (!user || !user.admin) {
  //   throw Error("not admin sorry");
  //   return null;
  // }

  // middleware
  const result = await resolver(parent, args, context, info);
  // afterware

  return result;
};
