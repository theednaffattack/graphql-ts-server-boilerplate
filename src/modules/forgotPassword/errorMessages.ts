export const invalidLogin = "invalid login";

export const confirmEmailError = [
  { path: "email", message: "please confirm your email" }
];

export const errorResponse = [
  {
    path: "email",
    message: invalidLogin
  }
];

export const sessionError = (loginName: any) => {
  return [
    {
      path: "email",
      message: `Session Error: ${loginName} An error occurred setting "userId" to the SESSION object`
    }
  ];
};

export const passwordIsTooShort = "password is too short";

export const expiredKeyError = "key has expired";

export const userNotFoundError = "could not find user with that email";
