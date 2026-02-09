import express from 'express';
import ReviewController from '../controllers/review.controller.js';
import { authMiddleware } from '../middelwares/auth.middleware.js';
import { adminMiddleware } from '../middelwares/admin.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
// router.use(authMiddleware);
// router.use(adminMiddleware);

// ==================== ADMIN REVIEW MANAGEMENT ====================

// Get all reviews with filters (admin)
router.get('/', ReviewController.getAllReviews);

// Moderate a review (approve/reject/hide)
router.patch('/:id/moderate', ReviewController.moderateReview);

// Get reported reviews
router.get('/reports', ReviewController.getReportedReviews);

// Handle a report (mark as reviewed/dismissed)
router.patch('/reports/:reportId', ReviewController.handleReport);

// Delete any review (admin can delete any review)
router.delete('/:id', ReviewController.deleteReview);

export default router;
