import db from '../config/db.js';
import { MembershipService } from '../services/salonMemberships.js';

export const CouponService = {


    /**
     * Create coupon for a specific salon
     */
    async createCoupon(salonId, data) {
        return db('coupons').insert({ ...data, salon_id: salonId }).returning('*');
    },

    /**
     * Get all coupons for a specific salon
     */
    async getCouponsBySalon(salonId) {
        return db('coupons').where({ salon_id: salonId }).select('*');
    },

    async getAllCoupons() {
        return await db('coupons').select('*');
    },

    /**
     * Get a single coupon by salon and coupon code
     */
    async getCouponByCode(salonId, couponCode) {
        return db('coupons').where({ salon_id: salonId, code: couponCode }).first();
    },

    /**
     * Get all coupons available to a customer based on membership
     */
    async getCouponsForCustomer(customerId, salonId) {
        const membership = await MembershipService.hasActiveMembership(customerId, salonId);
        if (!membership) {
            throw new Error('Customer does not have an active membership for this salon');
        }

        // Return all active coupons of the salon
        return db('coupons')
            .where({
                salon_id: salonId,
                status: 'active'
            })
            .select('*');
    },

    /**
     * Redeem a coupon
     */
    async redeemCoupon({ customerId, salonId, couponCode }) {
        console.log(customerId, salonId, couponCode)
        const trx = await db.transaction();

        try {
            // 1. Verify membership
            const membership = await MembershipService.hasActiveMembership(customerId, salonId);
            if (!membership) throw new Error('No active membership for this salon');

            // 2. Get the coupon
            const coupon = await trx('coupons').where({ salon_id: salonId, code: couponCode }).first();
            if (!coupon) throw new Error('Invalid coupon for this salon');

            const now = new Date();
            console.log(now, coupon)
            // 3. Validate coupon dates
            if (now < coupon.valid_from || now > coupon.valid_to) {
                throw new Error('Coupon expired or not active yet');
            }

            // 4. Check max usage
            const count = await trx('coupon_redemptions')
                .where({ coupon_id: coupon.id, status: 'redeemed' })
                .count('id as total')
                .first();

            if (parseInt(count.total, 10) >= coupon.max_usage) {
                throw new Error('Coupon usage limit reached');
            }

            // 5. Redeem
            const redemption = await trx('coupon_redemptions')
                .insert({
                    coupon_id: coupon.id,
                    customer_id: customerId,
                    status: 'redeemed',
                    redeemed_at: now
                })
                .returning('*');

            await trx.commit();
            return redemption;
        } catch (err) {
            await trx.rollback();
            throw err;
        }
    }
};
