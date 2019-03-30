import * as yup from "yup";
import { passwordNotLongEnough } from "./modules/user/register/errorMessages";

export const registerPasswordValidation = yup
  .string()
  .min(9, passwordNotLongEnough)
  .max(255);
