export const invalidLogin = "invalid login";

export const confirmEmailErrorText = "please confirm your email";

export const confirmEmailError = [
  { path: "email", message: confirmEmailErrorText }
];

export const invalidError = [
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

export const forgotPasswordLockedError = "account is locked";

export const forgotPasswordLockedErrorArr = [
  {
    path: "email",
    message: "account is locked"
  }
];
