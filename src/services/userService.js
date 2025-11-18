import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import admin from '../config/firebase.js';

const { sign } = jwt;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

class UserService {
  static async register(userData) {
    try {
      const { email, password, name } = userData;
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) throw new Error('User already exists');
      const hashedPassword = await hash(password, 10);
      const [id] = await db('users').insert({ name, email, password: hashedPassword, });
      const newUser = await db('users').select('id', 'name', 'email').where({ id }).first();
      return newUser;
    } catch (err) {
      console.error('Register Error:', err.message);
      throw new Error(err.message);
    }
  }

  static async login({ email, password }) {
    try {
      const user = await db('users').where({ email }).first();
      if (!user) {
        throw new Error('User not found');
      }
      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
      const token = sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
      return { token, user: { id: user.id, email: user.email } };
    } catch (err) {
      console.error('Login Error:', err.message);
      throw new Error('Failed to login');
    }
  }

  static async getProfile(userId) {
    try {
      const user = await db('users').where({ id: userId }).select('id', 'name', 'email').first();
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (err) {
      console.error('Get Profile Error:', err.message);
      throw new Error('Failed to fetch user profile');
    }
  }

  static async verifyToken(token) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { phone_number } = decodedToken;
      const jwt_token = sign({ phone_number }, JWT_SECRET, { expiresIn: '1h' });
      return { jwt_token, user: decodedToken };
    } catch (error) {
      console.error('Verify Token Error:', error.message);
      throw new Error(error.message);
    }
  }
}

export default UserService;