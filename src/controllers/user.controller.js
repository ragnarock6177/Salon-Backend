import UserService from '../services/userService.js';
import { sendSuccess, sendError } from '../utils/response.formatter.js';

const UserController = {
  async register(req, res) {
    try {
      const user = await UserService.register(req.body);
      return sendSuccess(res, 'User registered successfully', user, 201);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 400);
    }
  },

  async login(req, res) {
    try {
      const result = await UserService.login(req.body);
      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('auth_token', result.token, {
        httpOnly: true,
        secure: isProduction,        // true in production (HTTPS), false in development
        sameSite: isProduction ? 'Strict' : 'Lax',
        maxAge: 3600000              // 1 hour
      });

      return sendSuccess(res, 'Login successful', result, 200);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 401);
    }
  },

  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await UserService.getProfile(userId);
      return sendSuccess(res, 'Profile fetched successfully', profile, 200);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 404);
    }
  },

  /**
   * Verify Firebase phone auth token and login/register user
   * POST /api/auth/verify-token
   * Body: { idToken: string }
   */
  async verifyToken(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return sendError(res, 'Firebase ID token is required', 400);
      }

      const result = await UserService.verifyPhoneToken(idToken);
      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('auth_token', result.jwt_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'Strict' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return sendSuccess(res, result.user.isNewUser ? 'User registered successfully' : 'Login successful', result, 200);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 401);
    }
  },

  async listUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      return sendSuccess(res, 'Users fetched successfully', users, 200);
    } catch (error) {
      return sendError(res, error.message, error.statusCode || 500);
    }
  }
};

export default UserController;
