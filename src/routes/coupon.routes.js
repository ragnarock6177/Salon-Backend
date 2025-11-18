import express from 'express';
import { CouponController } from '../controllers/coupon.controller.js';

const router = express.Router();

// Create coupon for a specific salon
router.post('/:salonId', CouponController.createCoupon);

// Get all coupons for a specific salon
router.get('/:salonId', CouponController.getCouponsBySalon);

// Get all coupons
router.get('/', CouponController.getAllCoupons);

// Redeem coupon for a specific salon
router.post('/:salonId/redeem', CouponController.redeemCoupon);

export default router;
