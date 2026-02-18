import { CouponService } from '../services/couponService.js';

export const CouponController = {
  /**
   * Create coupon for a specific salon
   */
  async createCoupon(req, res) {
    try {
      const { salonId } = req.params;
      const coupon = await CouponService.createCoupon(salonId, req.body);
      res.status(201).json({ success: true, data: coupon });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * Update coupon
   */
  async updateCoupon(req, res) {
    try {
      const { salonId, couponId } = req.params;
      const updatedCoupon = await CouponService.updateCoupon(salonId, couponId, req.body);
      res.json({ success: true, data: updatedCoupon });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * Delete coupon
   */
  async deleteCoupon(req, res) {
    try {
      const { salonId, couponId } = req.params;
      await CouponService.deleteCoupon(salonId, couponId);
      res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * Get all coupons for a salon
   */
  async getCouponsBySalon(req, res) {
    try {
      const { salonId } = req.params;
      const coupons = await CouponService.getCouponsBySalon(salonId);
      res.json({ success: true, data: coupons });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getAllCoupons(req, res) {
    try {
      const coupons = await CouponService.getAllCoupons();
      res.json({ success: true, data: coupons });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Redeem coupon
   */
  async redeemCoupon(req, res) {
    try {
      const { salonId } = req.params;
      const { customerId, couponCode } = req.body;

      const redemption = await CouponService.redeemCoupon({ customerId, salonId, couponCode });
      res.json({ success: true, data: redemption });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async buyCoupon(req, res) {
    try {
      const { salonId, couponId } = req.params;
      const { customerId } = req.body;

      const result = await CouponService.buyCoupon(customerId, salonId, couponId);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async purchaseCoupons(req, res) {
    try {
      const { salonId } = req.params;
      const { customerId, items } = req.body;

      const result = await CouponService.purchaseCoupons(customerId, salonId, items);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getCustomerPurchasedCoupons(req, res) {
    try {
      const { customerId } = req.params;
      const result = await CouponService.getCustomerPurchasedCoupons(customerId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};
