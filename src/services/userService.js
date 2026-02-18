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
      const user = await db('users').where({ id: userId }).select('id', 'name', 'email', 'phone').first();
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (err) {
      console.error('Get Profile Error:', err.message);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Verify Firebase ID token and handle phone-based authentication
   * Creates a new user if phone number doesn't exist, otherwise returns existing user
   * @param {string} token - Firebase ID token
   * @returns {Object} JWT token and user data
   */
  static async verifyPhoneToken(token) {
    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { phone_number, uid: firebaseUid } = decodedToken;

      if (!phone_number) {
        throw new Error('Phone number not found in token');
      }

      // Check if user exists with this phone number
      let user = await db('users').where({ phone: phone_number }).first();
      let isNewUser = false;

      if (!user) {
        // Create new user with phone number
        const [id] = await db('users').insert({
          phone: phone_number,
          firebase_uid: firebaseUid,
          auth_provider: 'phone',
          created_at: new Date(),
          updated_at: new Date()
        });
        user = await db('users').where({ id }).first();
        isNewUser = true;
      }

      // Generate JWT token with user ID
      const jwt_token = sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '24h' });

      return {
        jwt_token,
        user: {
          id: user.id,
          name: user.name || null,
          phone: user.phone,
          email: user.email || null,
          isNewUser
        }
      };
    } catch (error) {
      console.error('Verify Phone Token Error:', error.message);
      throw new Error(error.message);
    }
  }

  static async getAllUsers() {
    try {
      const users = await db('users').select('id', 'name', 'email', 'phone', 'firebase_uid', 'auth_provider', 'role', 'created_at', 'updated_at');
      return users;
    } catch (err) {
      console.error('Get All Users Error:', err.message);
      throw new Error('Failed to fetch users');
    }
  }
}

export default UserService;