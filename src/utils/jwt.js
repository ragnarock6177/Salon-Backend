// utils/jwt.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "f93e8f7b3d0c4e55b2a1d89c77f04b1eaf93c942cd0b8ef2c4b11e7d53f8ae91"; // keep in .env
const JWT_EXPIRES_IN = "7d"; // token validity

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}