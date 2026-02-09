import ReviewService from '../services/reviewService.js';
import { sendSuccess, sendError } from '../utils/response.formatter.js';

const ReviewController = {
    // ==================== CREATE REVIEW ====================
    async createReview(req, res) {
        try {
            const userId = req.user.id;
            const { salon_id, rating, comment, title, visit_date, images } = req.body;

            if (!salon_id || !rating) {
                return sendError(res, 'Salon ID and rating are required', 400);
            }

            if (rating < 1 || rating > 5) {
                return sendError(res, 'Rating must be between 1 and 5', 400);
            }

            const review = await ReviewService.createReview(
                userId,
                salon_id,
                { rating, comment, title, visit_date },
                images || []
            );

            return sendSuccess(res, 'Review created successfully', review, 201);
        } catch (error) {
            console.error('Create Review Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== UPDATE REVIEW ====================
    async updateReview(req, res) {
        try {
            const userId = req.user.id;
            const reviewId = req.params.id;
            const { rating, comment, title, visit_date, images } = req.body;

            if (rating && (rating < 1 || rating > 5)) {
                return sendError(res, 'Rating must be between 1 and 5', 400);
            }

            const review = await ReviewService.updateReview(
                userId,
                reviewId,
                { rating, comment, title, visit_date },
                images !== undefined ? images : null
            );

            return sendSuccess(res, 'Review updated successfully', review, 200);
        } catch (error) {
            console.error('Update Review Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== DELETE REVIEW ====================
    async deleteReview(req, res) {
        try {
            const userId = req.user.id;
            const reviewId = req.params.id;
            const isAdmin = req.user.role === 'admin';

            const result = await ReviewService.deleteReview(userId, reviewId, isAdmin);

            return sendSuccess(res, result.message, null, 200);
        } catch (error) {
            console.error('Delete Review Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== GET REVIEW BY ID ====================
    async getReviewById(req, res) {
        try {
            const reviewId = req.params.id;
            const review = await ReviewService.getReviewById(reviewId);

            if (!review) {
                return sendError(res, 'Review not found', 404);
            }

            return sendSuccess(res, 'Review fetched successfully', review, 200);
        } catch (error) {
            console.error('Get Review Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== GET REVIEWS BY SALON ====================
    async getReviewsBySalon(req, res) {
        try {
            const salonId = req.params.salonId;
            const {
                page = 1,
                limit = 10,
                sortBy = 'created_at',
                sortOrder = 'desc',
                status = 'approved',
                rating
            } = req.query;

            // Get current user ID if authenticated (for like status)
            const userId = req.user?.id || null;

            const result = await ReviewService.getReviewsBySalon(salonId, {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy,
                sortOrder,
                status,
                rating: rating ? parseInt(rating) : null,
                userId
            });

            return sendSuccess(res, 'Reviews fetched successfully', result, 200);
        } catch (error) {
            console.error('Get Salon Reviews Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== GET MY REVIEWS ====================
    async getMyReviews(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;

            const result = await ReviewService.getReviewsByUser(userId, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            return sendSuccess(res, 'Your reviews fetched successfully', result, 200);
        } catch (error) {
            console.error('Get My Reviews Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== TOGGLE LIKE ====================
    async toggleLike(req, res) {
        try {
            const userId = req.user.id;
            const reviewId = req.params.id;

            const result = await ReviewService.toggleLike(userId, reviewId);

            const message = result.liked ? 'Review liked' : 'Review unliked';
            return sendSuccess(res, message, result, 200);
        } catch (error) {
            console.error('Toggle Like Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== REPORT REVIEW ====================
    async reportReview(req, res) {
        try {
            const userId = req.user.id;
            const reviewId = req.params.id;
            const { reason, description } = req.body;

            const validReasons = ['spam', 'inappropriate', 'fake', 'offensive', 'other'];
            if (!reason || !validReasons.includes(reason)) {
                return sendError(res, 'Valid reason is required (spam, inappropriate, fake, offensive, other)', 400);
            }

            const result = await ReviewService.reportReview(userId, reviewId, { reason, description });

            return sendSuccess(res, result.message, { id: result.id }, 201);
        } catch (error) {
            console.error('Report Review Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== GET SALON REVIEW STATS ====================
    async getSalonReviewStats(req, res) {
        try {
            const salonId = req.params.salonId;
            const stats = await ReviewService.getSalonReviewStats(salonId);

            return sendSuccess(res, 'Review statistics fetched successfully', stats, 200);
        } catch (error) {
            console.error('Get Stats Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== OWNER: ADD RESPONSE ====================
    async addOwnerResponse(req, res) {
        try {
            const responderId = req.user.id;
            const reviewId = req.params.id;
            const { response } = req.body;

            if (!response || response.trim().length === 0) {
                return sendError(res, 'Response text is required', 400);
            }

            const result = await ReviewService.addOwnerResponse(responderId, reviewId, response);

            return sendSuccess(res, 'Response added successfully', result, 201);
        } catch (error) {
            console.error('Add Response Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== OWNER: UPDATE RESPONSE ====================
    async updateOwnerResponse(req, res) {
        try {
            const responderId = req.user.id;
            const reviewId = req.params.id;
            const { response } = req.body;

            if (!response || response.trim().length === 0) {
                return sendError(res, 'Response text is required', 400);
            }

            const result = await ReviewService.updateOwnerResponse(responderId, reviewId, response);

            return sendSuccess(res, 'Response updated successfully', result, 200);
        } catch (error) {
            console.error('Update Response Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== OWNER: DELETE RESPONSE ====================
    async deleteOwnerResponse(req, res) {
        try {
            const responderId = req.user.id;
            const reviewId = req.params.id;
            const isAdmin = req.user.role === 'admin';

            const result = await ReviewService.deleteOwnerResponse(responderId, reviewId, isAdmin);

            return sendSuccess(res, result.message, null, 200);
        } catch (error) {
            console.error('Delete Response Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== ADMIN: GET ALL REVIEWS ====================
    async getAllReviews(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                salon_id,
                user_id,
                sortBy = 'created_at',
                sortOrder = 'desc'
            } = req.query;

            const result = await ReviewService.getAllReviews({
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                salonId: salon_id,
                userId: user_id,
                sortBy,
                sortOrder
            });

            return sendSuccess(res, 'Reviews fetched successfully', result, 200);
        } catch (error) {
            console.error('Get All Reviews Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== ADMIN: MODERATE REVIEW ====================
    async moderateReview(req, res) {
        try {
            const reviewId = req.params.id;
            const { status } = req.body;
            const adminId = req.user.id;

            const validStatuses = ['pending', 'approved', 'rejected', 'hidden'];
            if (!status || !validStatuses.includes(status)) {
                return sendError(res, 'Valid status is required (pending, approved, rejected, hidden)', 400);
            }

            const result = await ReviewService.moderateReview(reviewId, status, adminId);

            return sendSuccess(res, result.message, result, 200);
        } catch (error) {
            console.error('Moderate Review Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== ADMIN: GET REPORTED REVIEWS ====================
    async getReportedReviews(req, res) {
        try {
            const { status = 'pending', page = 1, limit = 20 } = req.query;

            const result = await ReviewService.getReportedReviews({
                status,
                page: parseInt(page),
                limit: parseInt(limit)
            });

            return sendSuccess(res, 'Reported reviews fetched successfully', result, 200);
        } catch (error) {
            console.error('Get Reported Reviews Error:', error.message);
            return sendError(res, error.message, 400);
        }
    },

    // ==================== ADMIN: HANDLE REPORT ====================
    async handleReport(req, res) {
        try {
            const reportId = req.params.reportId;
            const { status } = req.body;
            const adminId = req.user.id;

            const validStatuses = ['reviewed', 'dismissed'];
            if (!status || !validStatuses.includes(status)) {
                return sendError(res, 'Valid status is required (reviewed, dismissed)', 400);
            }

            const result = await ReviewService.handleReport(reportId, status, adminId);

            return sendSuccess(res, result.message, result, 200);
        } catch (error) {
            console.error('Handle Report Error:', error.message);
            return sendError(res, error.message, 400);
        }
    }
};

export default ReviewController;
