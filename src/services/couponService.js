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
     * Buy a coupon
     */
    async buyCoupon(customerId, salonId, couponId) {
        const trx = await db.transaction();
        try {
            // 1. Verify membership
            const membership = await MembershipService.hasActiveMembership(customerId, salonId);
            if (!membership) throw new Error('No active membership for this salon');

            // 2. Get coupon
            const coupon = await trx('coupons').where({ id: couponId, salon_id: salonId }).first();
            if (!coupon) throw new Error('Coupon not found');

            // 3. Validate status and dates
            if (coupon.status !== 'active') throw new Error('Coupon is inactive');
            const now = new Date();
            if (now < new Date(coupon.valid_from) || now > new Date(coupon.valid_to)) {
                throw new Error('Coupon expired or not active yet');
            }

            // 4. Record purchase
            const purchase = await trx('customer_coupons').insert({
                customer_id: customerId,
                coupon_id: couponId,
                status: 'active',
                purchased_at: now
            }).returning('*');

            await trx.commit();
            return purchase;
        } catch (err) {
            await trx.rollback();
            throw err;
        }
    },

    /**
     * Purchase multiple coupons
     */
    async purchaseCoupons(customerId, salonId, items) {
        console.log(customerId, salonId, items)
        const trx = await db.transaction();
        try {
            // 1. Verify membership
            // const membership = await MembershipService.hasActiveMembership(customerId, salonId);
            // if (!membership) throw new Error('No active membership for this salon');

            const results = [];
            const now = new Date();

            for (const item of items) {
                const { couponId, quantity = 1 } = item;

                // 2. Get coupon
                const coupon = await trx('coupons').where({ id: couponId, salon_id: salonId }).first();
                if (!coupon) throw new Error(`Coupon ID ${couponId} not found`);

                // 3. Validate status and dates
                if (coupon.status !== 'active') throw new Error(`Coupon ${coupon.code} is inactive`);

                if (now < new Date(coupon.valid_from) || now > new Date(coupon.valid_to)) {
                    throw new Error(`Coupon ${coupon.code} expired or not active yet`);
                }

                // 4. Record purchase
                for (let i = 0; i < quantity; i++) {
                    await trx('customer_coupons').insert({
                        customer_id: customerId,
                        coupon_id: couponId,
                        status: 'active',
                        purchased_at: now
                    });
                }

                results.push({ couponId, quantity, status: 'purchased' });
            }

            await trx.commit();
            return results;
        } catch (err) {
            await trx.rollback();
            throw err;
        }
    },

    /**
     * Get purchased coupons for a customer
     */
    async getCustomerPurchasedCoupons(customerId) {
        return db('customer_coupons')
            .join('coupons', 'customer_coupons.coupon_id', 'coupons.id')
            .where({ 'customer_coupons.customer_id': customerId })
            .select(
                'customer_coupons.id as purchase_id',
                'customer_coupons.status as purchase_status',
                'customer_coupons.purchased_at',
                'coupons.*'
            );
    },

    /**
     * Redeem a coupon
     */
    async redeemCoupon({ customerId, salonId, couponCode }) {
        console.log(customerId, salonId, couponCode)
        const trx = await db.transaction();

        try {
            // 1. Verify membership (Optional: already checked during purchase, but good for sanity)
            // const membership = await MembershipService.hasActiveMembership(customerId, salonId);
            // if (!membership) throw new Error('No active membership for this salon');

            // 2. Get the coupon
            const coupon = await trx('coupons').where({ salon_id: salonId, code: couponCode }).first();
            if (!coupon) throw new Error('Invalid coupon for this salon');

            const now = new Date();
            // 3. Validate coupon dates
            if (now < coupon.valid_from || now > coupon.valid_to) {
                throw new Error('Coupon expired or not active yet');
            }

            // 4. Check for active purchased coupon
            const purchasedCoupon = await trx('customer_coupons')
                .where({
                    customer_id: customerId,
                    coupon_id: coupon.id,
                    status: 'active'
                })
                .first();

            if (!purchasedCoupon) {
                throw new Error('No active purchased coupon found for this customer');
            }

            // 5. Check max usage (Global limit check, if applicable, though purchase limit handles user side)
            const count = await trx('coupon_redemptions')
                .where({ coupon_id: coupon.id, status: 'redeemed' })
                .count('id as total')
                .first();

            // if (parseInt(count.total, 10) >= coupon.max_usage) {
            //     throw new Error('Coupon global usage limit reached');
            // }

            // 6. Mark purchased coupon as used
            await trx('customer_coupons')
                .where({ id: purchasedCoupon.id })
                .update({ status: 'used' });

            // 7. Record redemption
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
