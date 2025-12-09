
import AppError from "../utils/AppError.js";
import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  email: z.email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
/* ---------------------------------------------
   VALIDATION MIDDLEWARE
---------------------------------------------- */

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    return next();
  } catch (error) {
    console.log("ZOD RAW ERROR:", error);

    // Zod v4 uses .issues
    if (error.issues && error.issues.length > 0) {
      const issue = error.issues[0];
      return next(new AppError(issue.message, 400));
    }

    // Not a Zod error
    return next(new AppError("Invalid input", 400));
  }
};