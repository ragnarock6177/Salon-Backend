// middleware/adminMiddleware.js
import { sendError } from "../utils/response.formatter.js";

/**
 * Middleware to check if the authenticated user has admin role
 * Should be used after authMiddleware
 */
export function adminMiddleware(req, res, next) {
    try {
        if (!req.user) {
            return sendError(res, 'Authentication required', 401);
        }

        if (req.user.role !== 'admin') {
            return sendError(res, 'Admin access required', 403);
        }

        next();
    } catch (error) {
        return sendError(res, 'Authorization failed', 403);
    }
}

/**
 * Middleware to check if user is either admin or the owner of the resource
 * Useful for operations where both admin and owner can perform actions
 */
export function adminOrOwnerMiddleware(getOwnerId) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return sendError(res, 'Authentication required', 401);
            }

            // Admin can do anything
            if (req.user.role === 'admin') {
                return next();
            }

            // Check if user is the owner
            const ownerId = await getOwnerId(req);
            if (ownerId && req.user.id === ownerId) {
                return next();
            }

            return sendError(res, 'You do not have permission to perform this action', 403);
        } catch (error) {
            return sendError(res, 'Authorization failed', 403);
        }
    };
}
