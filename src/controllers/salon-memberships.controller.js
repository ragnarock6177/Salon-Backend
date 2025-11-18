import { MembershipService } from '../services/salonMemberships.js';
import { CouponService } from '../services/couponService.js';

export const MembershipController = {
    async createMembershipPlan(req, res) {
        try {
            const { salonId } = req.params;
            console.log("Salon ID:", salonId);
            console.log("Request Body:", req.body);

            const result = await MembershipService.createMembershipPlan(salonId, req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },


    async purchaseMembership(req, res) {
        try {
            const { salonId } = req.params;
            const { customerId, membershipId } = req.body;
            const result = await MembershipService.purchaseMembership(customerId, salonId, membershipId);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async getCouponsForCustomer(req, res) {
        try {
            const { salonId, customerId } = req.params;
            const coupons = await CouponService.getCouponsForCustomer(customerId, salonId);
            res.json({ success: true, data: coupons });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
};
