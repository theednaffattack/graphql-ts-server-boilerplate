import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    dummy3: () => "dummy"
  },
  Mutation: {
    logout: (_, __, { session }) =>
      new Promise(resolve => {
        session.destroy(error => {
          if (error) {
            return console.log("Logout error: " + error);
          }
          resolve(true);
        });
      })
  }
};
