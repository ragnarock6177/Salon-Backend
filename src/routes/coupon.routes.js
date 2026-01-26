import express from 'express';
import { CouponController } from '../controllers/coupon.controller.js';

const router = express.Router();

// Get purchased coupons for a customer
router.get('/customer/:customerId', CouponController.getCustomerPurchasedCoupons);

// Create coupon for a specific salon
router.post('/:salonId', CouponController.createCoupon);

// Get all coupons for a specific salon
router.get('/:salonId', CouponController.getCouponsBySalon);

// Get all coupons
router.get('/', CouponController.getAllCoupons);

// Buy a coupon
router.post('/:salonId/:couponId/buy', CouponController.buyCoupon);

// Buy multiple coupons (Cart)
router.post('/:salonId/purchase', CouponController.purchaseCoupons);

// Redeem coupon for a specific salon
router.post('/:salonId/redeem', CouponController.redeemCoupon);

export default router;
