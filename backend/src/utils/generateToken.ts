import jwt from "jsonwebtoken";
import { UserRole } from "../models/user";

const generateToken = (
  userId: string,
  role: UserRole
): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      userId,
      role,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    }
  );
};

export default generateToken;