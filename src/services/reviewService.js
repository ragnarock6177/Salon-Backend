import db from '../config/db.js';

class ReviewService {
    // ==================== CREATE REVIEW ====================
    static async createReview(userId, salonId, reviewData, images = []) {
        const trx = await db.transaction();
        try {
            const { rating, comment, title, visit_date } = reviewData;

            // Check if user already reviewed this salon
            const existingReview = await trx('salon_reviews')
                .where({ user_id: userId, salon_id: salonId })
                .first();

            if (existingReview) {
                throw new Error('You have already reviewed this salon');
            }

            // Check if salon exists
            const salon = await trx('salons').where({ id: salonId }).first();
            if (!salon) {
                throw new Error('Salon not found');
            }

            // Check if user had a verified visit (coupon redemption)
            const verifiedVisit = await trx('coupon_redemptions as cr')
                .join('coupons as c', 'cr.coupon_id', 'c.id')
                .where({
                    'c.salon_id': salonId,
                    'cr.customer_id': userId,
                    'cr.status': 'redeemed'
                })
                .first();

            // Insert review
            const [reviewId] = await trx('salon_reviews').insert({
                salon_id: salonId,
                user_id: userId,
                rating,
                comment,
                title,
                visit_date: visit_date || null,
                is_verified_visit: !!verifiedVisit,
                status: 'approved' // Auto-approve for now, can change to 'pending' for moderation
            });

            // Insert images if provided
            if (images.length > 0) {
                const imageData = images.map((url, index) => ({
                    review_id: reviewId,
                    image_url: url,
                    display_order: index
                }));
                await trx('review_images').insert(imageData);
            }

            // Update salon's average rating
            await this._updateSalonRating(trx, salonId);

            await trx.commit();

            // Fetch and return the created review
            return await this.getReviewById(reviewId);
        } catch (err) {
            await trx.rollback();
            console.error('Create Review Error:', err.message);
            throw err;
        }
    }

    // ==================== UPDATE REVIEW ====================
    static async updateReview(userId, reviewId, updateData, images = null) {
        const trx = await db.transaction();
        try {
            // Check if review exists and belongs to user
            const review = await trx('salon_reviews')
                .where({ id: reviewId, user_id: userId })
                .first();

            if (!review) {
                throw new Error('Review not found or you do not have permission to edit it');
            }

            const { rating, comment, title, visit_date } = updateData;

            // Update review
            await trx('salon_reviews')
                .where({ id: reviewId })
                .update({
                    rating: rating || review.rating,
                    comment: comment !== undefined ? comment : review.comment,
                    title: title !== undefined ? title : review.title,
                    visit_date: visit_date !== undefined ? visit_date : review.visit_date,
                    updated_at: trx.fn.now()
                });

            // Update images if provided
            if (images !== null) {
                // Remove old images
                await trx('review_images').where({ review_id: reviewId }).del();

                // Insert new images
                if (images.length > 0) {
                    const imageData = images.map((url, index) => ({
                        review_id: reviewId,
                        image_url: url,
                        display_order: index
                    }));
                    await trx('review_images').insert(imageData);
                }
            }

            // Update salon's average rating
            await this._updateSalonRating(trx, review.salon_id);

            await trx.commit();

            return await this.getReviewById(reviewId);
        } catch (err) {
            await trx.rollback();
            console.error('Update Review Error:', err.message);
            throw err;
        }
    }

    // ==================== DELETE REVIEW ====================
    static async deleteReview(userId, reviewId, isAdmin = false) {
        const trx = await db.transaction();
        try {
            const review = await trx('salon_reviews').where({ id: reviewId }).first();

            if (!review) {
                throw new Error('Review not found');
            }

            // Check permission
            if (!isAdmin && review.user_id !== userId) {
                throw new Error('You do not have permission to delete this review');
            }

            const salonId = review.salon_id;

            // Delete the review (cascades to images, likes, reports)
            await trx('salon_reviews').where({ id: reviewId }).del();

            // Update salon's average rating
            await this._updateSalonRating(trx, salonId);

            await trx.commit();

            return { message: 'Review deleted successfully' };
        } catch (err) {
            await trx.rollback();
            console.error('Delete Review Error:', err.message);
            throw err;
        }
    }

    // ==================== GET REVIEW BY ID ====================
    static async getReviewById(reviewId) {
        try {
            const review = await db('salon_reviews as r')
                .select(
                    'r.*',
                    'u.name as user_name',
                    's.name as salon_name'
                )
                .leftJoin('users as u', 'r.user_id', 'u.id')
                .leftJoin('salons as s', 'r.salon_id', 's.id')
                .where('r.id', reviewId)
                .first();

            if (!review) return null;

            // Fetch images and owner response in parallel
            const [images, response] = await Promise.all([
                db('review_images')
                    .where({ review_id: reviewId })
                    .orderBy('display_order', 'asc')
                    .select('id', 'image_url', 'display_order'),
                db('review_responses as rr')
                    .select('rr.*', 'u.name as responder_name')
                    .leftJoin('users as u', 'rr.responder_id', 'u.id')
                    .where('rr.review_id', reviewId)
                    .first()
            ]);

            review.images = images;
            review.owner_response = response || null;

            return review;
        } catch (err) {
            console.error('Get Review By ID Error:', err.message);
            throw new Error('Failed to fetch review');
        }
    }

    // ==================== GET REVIEWS BY SALON ====================
    static async getReviewsBySalon(salonId, options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = 'created_at',
                sortOrder = 'desc',
                status = 'approved',
                rating = null,
                userId = null // To check if current user liked
            } = options;

            const offset = (page - 1) * limit;

            let query = db('salon_reviews as r')
                .select(
                    'r.*',
                    'u.name as user_name'
                )
                .leftJoin('users as u', 'r.user_id', 'u.id')
                .where('r.salon_id', salonId);

            // Filter by status
            if (status) {
                query = query.where('r.status', status);
            }

            // Filter by rating
            if (rating) {
                query = query.where('r.rating', rating);
            }

            const validSortColumns = ['created_at', 'rating', 'likes_count'];
            const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
            const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

            // Run COUNT and paginated SELECT in parallel
            const [countResult, reviews] = await Promise.all([
                query.clone().count('* as count').first(),
                query.clone()
                    .orderBy(`r.${sortColumn}`, order)
                    .limit(limit)
                    .offset(offset)
            ]);

            const total = parseInt(countResult.count);

            // Fetch images, responses, and user likes in parallel
            const reviewIds = reviews.map(r => r.id);

            const [images, responses, userLikes] = await Promise.all([
                db('review_images')
                    .whereIn('review_id', reviewIds)
                    .orderBy('display_order', 'asc'),
                db('review_responses as rr')
                    .select('rr.*', 'u.name as responder_name')
                    .leftJoin('users as u', 'rr.responder_id', 'u.id')
                    .whereIn('rr.review_id', reviewIds),
                userId
                    ? db('review_likes')
                        .whereIn('review_id', reviewIds)
                        .where('user_id', userId)
                        .select('review_id')
                    : Promise.resolve([])
            ]);

            const likedReviewIds = new Set(userLikes.map(l => l.review_id));

            // Map images and responses to reviews
            const imageMap = {};
            for (const img of images) {
                if (!imageMap[img.review_id]) {
                    imageMap[img.review_id] = [];
                }
                imageMap[img.review_id].push(img);
            }

            const responseMap = {};
            for (const resp of responses) {
                responseMap[resp.review_id] = resp;
            }

            // Attach data to reviews
            for (const review of reviews) {
                review.images = imageMap[review.id] || [];
                review.owner_response = responseMap[review.id] || null;
                review.is_liked_by_user = likedReviewIds.has(review.id);
            }

            return {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (err) {
            console.error('Get Reviews By Salon Error:', err.message);
            throw new Error('Failed to fetch reviews');
        }
    }

    // ==================== GET REVIEWS BY USER ====================
    static async getReviewsByUser(userId, options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            const offset = (page - 1) * limit;

            const query = db('salon_reviews as r')
                .select(
                    'r.*',
                    's.name as salon_name',
                    's.address as salon_address'
                )
                .leftJoin('salons as s', 'r.salon_id', 's.id')
                .where('r.user_id', userId);

            // Get total count
            const countQuery = query.clone();
            const [{ count }] = await countQuery.count('* as count');
            const total = parseInt(count);

            const reviews = await query
                .orderBy('r.created_at', 'desc')
                .limit(limit)
                .offset(offset);

            // Fetch images
            const reviewIds = reviews.map(r => r.id);
            const images = await db('review_images')
                .whereIn('review_id', reviewIds)
                .orderBy('display_order', 'asc');

            const imageMap = {};
            for (const img of images) {
                if (!imageMap[img.review_id]) {
                    imageMap[img.review_id] = [];
                }
                imageMap[img.review_id].push(img);
            }

            for (const review of reviews) {
                review.images = imageMap[review.id] || [];
            }

            return {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (err) {
            console.error('Get Reviews By User Error:', err.message);
            throw new Error('Failed to fetch user reviews');
        }
    }

    // ==================== LIKE/UNLIKE REVIEW ====================
    static async toggleLike(userId, reviewId) {
        const trx = await db.transaction();
        try {
            // Check if review exists
            const review = await trx('salon_reviews').where({ id: reviewId }).first();
            if (!review) {
                throw new Error('Review not found');
            }

            // Check if already liked
            const existingLike = await trx('review_likes')
                .where({ user_id: userId, review_id: reviewId })
                .first();

            let liked;
            if (existingLike) {
                // Unlike
                await trx('review_likes')
                    .where({ user_id: userId, review_id: reviewId })
                    .del();
                await trx('salon_reviews')
                    .where({ id: reviewId })
                    .decrement('likes_count', 1);
                liked = false;
            } else {
                // Like
                await trx('review_likes').insert({
                    user_id: userId,
                    review_id: reviewId
                });
                await trx('salon_reviews')
                    .where({ id: reviewId })
                    .increment('likes_count', 1);
                liked = true;
            }

            // Get updated count
            const updatedReview = await trx('salon_reviews')
                .where({ id: reviewId })
                .select('likes_count')
                .first();

            await trx.commit();

            return {
                liked,
                likes_count: updatedReview.likes_count
            };
        } catch (err) {
            await trx.rollback();
            console.error('Toggle Like Error:', err.message);
            throw err;
        }
    }

    // ==================== REPORT REVIEW ====================
    static async reportReview(userId, reviewId, reportData) {
        try {
            const { reason, description } = reportData;

            // Check if review exists
            const review = await db('salon_reviews').where({ id: reviewId }).first();
            if (!review) {
                throw new Error('Review not found');
            }

            // Check if user is trying to report their own review
            if (review.user_id === userId) {
                throw new Error('You cannot report your own review');
            }

            // Check if already reported by this user
            const existingReport = await db('review_reports')
                .where({ user_id: userId, review_id: reviewId })
                .first();

            if (existingReport) {
                throw new Error('You have already reported this review');
            }

            // Create report
            const [reportId] = await db('review_reports').insert({
                review_id: reviewId,
                user_id: userId,
                reason,
                description: description || null
            });

            return {
                id: reportId,
                message: 'Review reported successfully. Our team will review it shortly.'
            };
        } catch (err) {
            console.error('Report Review Error:', err.message);
            throw err;
        }
    }

    // ==================== ADMIN: MODERATE REVIEW ====================
    static async moderateReview(reviewId, status, adminId = null) {
        try {
            const validStatuses = ['pending', 'approved', 'rejected', 'hidden'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid status');
            }

            const review = await db('salon_reviews').where({ id: reviewId }).first();
            if (!review) {
                throw new Error('Review not found');
            }

            await db('salon_reviews')
                .where({ id: reviewId })
                .update({
                    status,
                    updated_at: db.fn.now()
                });

            // Update salon rating (only count approved reviews)
            await this._updateSalonRatingDirectly(review.salon_id);

            return {
                message: `Review ${status} successfully`,
                review_id: reviewId,
                new_status: status
            };
        } catch (err) {
            console.error('Moderate Review Error:', err.message);
            throw err;
        }
    }

    // ==================== ADMIN: GET REPORTED REVIEWS ====================
    static async getReportedReviews(options = {}) {
        try {
            const { status = 'pending', page = 1, limit = 20 } = options;
            const offset = (page - 1) * limit;

            const query = db('review_reports as rp')
                .select(
                    'rp.*',
                    'r.rating as review_rating',
                    'r.comment as review_comment',
                    'r.status as review_status',
                    'u.name as reporter_name',
                    'ru.name as review_author_name',
                    's.name as salon_name'
                )
                .leftJoin('salon_reviews as r', 'rp.review_id', 'r.id')
                .leftJoin('users as u', 'rp.user_id', 'u.id')
                .leftJoin('users as ru', 'r.user_id', 'ru.id')
                .leftJoin('salons as s', 'r.salon_id', 's.id')
                .where('rp.status', status);

            const countQuery = query.clone();
            const [{ count }] = await countQuery.count('* as count');
            const total = parseInt(count);

            const reports = await query
                .orderBy('rp.created_at', 'desc')
                .limit(limit)
                .offset(offset);

            return {
                reports,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (err) {
            console.error('Get Reported Reviews Error:', err.message);
            throw new Error('Failed to fetch reported reviews');
        }
    }

    // ==================== ADMIN: HANDLE REPORT ====================
    static async handleReport(reportId, status, adminId) {
        try {
            const validStatuses = ['reviewed', 'dismissed'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid status');
            }

            const report = await db('review_reports').where({ id: reportId }).first();
            if (!report) {
                throw new Error('Report not found');
            }

            await db('review_reports')
                .where({ id: reportId })
                .update({
                    status,
                    reviewed_by: adminId,
                    reviewed_at: db.fn.now(),
                    updated_at: db.fn.now()
                });

            return {
                message: `Report ${status} successfully`,
                report_id: reportId
            };
        } catch (err) {
            console.error('Handle Report Error:', err.message);
            throw err;
        }
    }

    // ==================== OWNER: ADD RESPONSE ====================
    static async addOwnerResponse(responderId, reviewId, responseText) {
        try {
            // Check if review exists
            const review = await db('salon_reviews').where({ id: reviewId }).first();
            if (!review) {
                throw new Error('Review not found');
            }

            // Check if response already exists
            const existingResponse = await db('review_responses')
                .where({ review_id: reviewId })
                .first();

            if (existingResponse) {
                throw new Error('A response already exists for this review');
            }

            const [responseId] = await db('review_responses').insert({
                review_id: reviewId,
                responder_id: responderId,
                response: responseText
            });

            return await db('review_responses as rr')
                .select('rr.*', 'u.name as responder_name')
                .leftJoin('users as u', 'rr.responder_id', 'u.id')
                .where('rr.id', responseId)
                .first();
        } catch (err) {
            console.error('Add Owner Response Error:', err.message);
            throw err;
        }
    }

    // ==================== OWNER: UPDATE RESPONSE ====================
    static async updateOwnerResponse(responderId, reviewId, responseText) {
        try {
            const existingResponse = await db('review_responses')
                .where({ review_id: reviewId })
                .first();

            if (!existingResponse) {
                throw new Error('Response not found');
            }

            if (existingResponse.responder_id !== responderId) {
                throw new Error('You do not have permission to edit this response');
            }

            await db('review_responses')
                .where({ review_id: reviewId })
                .update({
                    response: responseText,
                    updated_at: db.fn.now()
                });

            return await db('review_responses as rr')
                .select('rr.*', 'u.name as responder_name')
                .leftJoin('users as u', 'rr.responder_id', 'u.id')
                .where('rr.review_id', reviewId)
                .first();
        } catch (err) {
            console.error('Update Owner Response Error:', err.message);
            throw err;
        }
    }

    // ==================== OWNER: DELETE RESPONSE ====================
    static async deleteOwnerResponse(responderId, reviewId, isAdmin = false) {
        try {
            const existingResponse = await db('review_responses')
                .where({ review_id: reviewId })
                .first();

            if (!existingResponse) {
                throw new Error('Response not found');
            }

            if (!isAdmin && existingResponse.responder_id !== responderId) {
                throw new Error('You do not have permission to delete this response');
            }

            await db('review_responses').where({ review_id: reviewId }).del();

            return { message: 'Response deleted successfully' };
        } catch (err) {
            console.error('Delete Owner Response Error:', err.message);
            throw err;
        }
    }

    // ==================== GET SALON REVIEW STATISTICS ====================
    static async getSalonReviewStats(salonId) {
        try {
            // Check if salon exists
            const salon = await db('salons').where({ id: salonId }).first();
            if (!salon) {
                throw new Error('Salon not found');
            }

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Run all 3 stat queries in parallel
            const [stats, imageStats, recentStats] = await Promise.all([
                // Aggregate stats
                db('salon_reviews')
                    .where({ salon_id: salonId, status: 'approved' })
                    .select(
                        db.raw('COUNT(*) as total_reviews'),
                        db.raw('COALESCE(AVG(rating), 0) as average_rating'),
                        db.raw('SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star'),
                        db.raw('SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star'),
                        db.raw('SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star'),
                        db.raw('SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star'),
                        db.raw('SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star'),
                        db.raw('SUM(CASE WHEN is_verified_visit = true THEN 1 ELSE 0 END) as verified_reviews')
                    )
                    .first(),
                // Count reviews with images
                db('salon_reviews as r')
                    .join('review_images as ri', 'r.id', 'ri.review_id')
                    .where({ 'r.salon_id': salonId, 'r.status': 'approved' })
                    .countDistinct('r.id as reviews_with_images')
                    .first(),
                // Recent stats (last 30 days)
                db('salon_reviews')
                    .where({ salon_id: salonId, status: 'approved' })
                    .where('created_at', '>=', thirtyDaysAgo)
                    .select(
                        db.raw('COUNT(*) as recent_reviews'),
                        db.raw('COALESCE(AVG(rating), 0) as recent_average')
                    )
                    .first()
            ]);

            const totalReviews = parseInt(stats.total_reviews) || 0;

            return {
                salon_id: salonId,
                total_reviews: totalReviews,
                average_rating: parseFloat(stats.average_rating).toFixed(1),
                verified_reviews: parseInt(stats.verified_reviews) || 0,
                reviews_with_images: parseInt(imageStats?.reviews_with_images) || 0,
                rating_distribution: {
                    five_star: {
                        count: parseInt(stats.five_star) || 0,
                        percentage: totalReviews ? ((parseInt(stats.five_star) / totalReviews) * 100).toFixed(1) : '0'
                    },
                    four_star: {
                        count: parseInt(stats.four_star) || 0,
                        percentage: totalReviews ? ((parseInt(stats.four_star) / totalReviews) * 100).toFixed(1) : '0'
                    },
                    three_star: {
                        count: parseInt(stats.three_star) || 0,
                        percentage: totalReviews ? ((parseInt(stats.three_star) / totalReviews) * 100).toFixed(1) : '0'
                    },
                    two_star: {
                        count: parseInt(stats.two_star) || 0,
                        percentage: totalReviews ? ((parseInt(stats.two_star) / totalReviews) * 100).toFixed(1) : '0'
                    },
                    one_star: {
                        count: parseInt(stats.one_star) || 0,
                        percentage: totalReviews ? ((parseInt(stats.one_star) / totalReviews) * 100).toFixed(1) : '0'
                    }
                },
                recent_activity: {
                    last_30_days_reviews: parseInt(recentStats?.recent_reviews) || 0,
                    last_30_days_average: parseFloat(recentStats?.recent_average || 0).toFixed(1)
                }
            };
        } catch (err) {
            console.error('Get Salon Review Stats Error:', err.message);
            throw err;
        }
    }

    // ==================== HELPER: UPDATE SALON RATING ====================
    static async _updateSalonRating(trx, salonId) {
        try {
            const result = await trx('salon_reviews')
                .where({ salon_id: salonId, status: 'approved' })
                .select(
                    trx.raw('COUNT(*) as total_reviews'),
                    trx.raw('COALESCE(AVG(rating), 0) as average_rating')
                )
                .first();

            const totalReviews = parseInt(result.total_reviews) || 0;
            const averageRating = parseFloat(result.average_rating) || 0;

            await trx('salons')
                .where({ id: salonId })
                .update({
                    rating: averageRating.toFixed(1),
                    total_reviews: totalReviews,
                    updated_at: trx.fn.now()
                });
        } catch (err) {
            console.error('Update Salon Rating Error:', err.message);
            throw err;
        }
    }

    // Helper without transaction (for moderation)
    static async _updateSalonRatingDirectly(salonId) {
        try {
            const result = await db('salon_reviews')
                .where({ salon_id: salonId, status: 'approved' })
                .select(
                    db.raw('COUNT(*) as total_reviews'),
                    db.raw('COALESCE(AVG(rating), 0) as average_rating')
                )
                .first();

            const totalReviews = parseInt(result.total_reviews) || 0;
            const averageRating = parseFloat(result.average_rating) || 0;

            await db('salons')
                .where({ id: salonId })
                .update({
                    rating: averageRating.toFixed(1),
                    total_reviews: totalReviews,
                    updated_at: db.fn.now()
                });
        } catch (err) {
            console.error('Update Salon Rating Directly Error:', err.message);
            throw err;
        }
    }

    // ==================== GET ALL REVIEWS (ADMIN) ====================
    static async getAllReviews(options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                status = null,
                salonId = null,
                userId = null,
                sortBy = 'created_at',
                sortOrder = 'desc'
            } = options;

            const offset = (page - 1) * limit;

            let query = db('salon_reviews as r')
                .select(
                    'r.*',
                    'u.name as user_name',
                    'u.email as user_email',
                    's.name as salon_name'
                )
                .leftJoin('users as u', 'r.user_id', 'u.id')
                .leftJoin('salons as s', 'r.salon_id', 's.id');

            if (status) {
                query = query.where('r.status', status);
            }
            if (salonId) {
                query = query.where('r.salon_id', salonId);
            }
            if (userId) {
                query = query.where('r.user_id', userId);
            }

            const countQuery = query.clone();
            const [{ count }] = await countQuery.count('* as count');
            const total = parseInt(count);

            const validSortColumns = ['created_at', 'rating', 'likes_count', 'status'];
            const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
            const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

            const reviews = await query
                .orderBy(`r.${sortColumn}`, order)
                .limit(limit)
                .offset(offset);

            return {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (err) {
            console.error('Get All Reviews Error:', err.message);
            throw new Error('Failed to fetch reviews');
        }
    }
}

export default ReviewService;
