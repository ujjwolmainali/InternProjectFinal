// middleware/verify.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  email: string;
  profile?: string;
  fname?: string;
  lname?: string;
  bio?: string;
  phone?:string;
  address?: string;
  iat?: number;
  exp?: number;
}

// Extend Request to include user
declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

const verify = (req: Request, res: Response, next: NextFunction) => {
  // Get token from Authorization header or cookie
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.accessToken;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : cookieToken;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default verify;
