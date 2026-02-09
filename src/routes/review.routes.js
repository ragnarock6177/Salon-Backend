import express from 'express';
import ReviewController from '../controllers/review.controller.js';
import { authMiddleware } from '../middelwares/auth.middleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get reviews by salon (public - no auth required)
router.get('/salon/:salonId', ReviewController.getReviewsBySalon);

// Get review statistics for a salon (public)
router.get('/salon/:salonId/stats', ReviewController.getSalonReviewStats);

// ==================== AUTHENTICATED USER ROUTES ====================

// Get my reviews (requires auth) - MUST be before /:id route
router.get('/user/me', authMiddleware, ReviewController.getMyReviews);

// Create a new review (requires auth)
router.post('/', authMiddleware, ReviewController.createReview);

// Like/Unlike a review (requires auth)
router.post('/:id/like', authMiddleware, ReviewController.toggleLike);

// Report a review (requires auth)
router.post('/:id/report', authMiddleware, ReviewController.reportReview);

// ==================== OWNER/RESPONDER ROUTES ====================

// Add owner response to a review (requires auth)
router.post('/:id/response', authMiddleware, ReviewController.addOwnerResponse);

// Update owner response (requires auth)
router.put('/:id/response', authMiddleware, ReviewController.updateOwnerResponse);

// Delete owner response (requires auth)
router.delete('/:id/response', authMiddleware, ReviewController.deleteOwnerResponse);

// ==================== GENERIC :id ROUTES (must be last) ====================

// Get single review by ID (public)
router.get('/:id', ReviewController.getReviewById);

// Update own review (requires auth)
router.put('/:id', authMiddleware, ReviewController.updateReview);

// Delete own review (requires auth)
router.delete('/:id', authMiddleware, ReviewController.deleteReview);

export default router;

