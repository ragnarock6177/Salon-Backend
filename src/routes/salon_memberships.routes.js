import express from 'express';
import { MembershipController } from '../controllers/salon-memberships.controller.js';

const router = express.Router();

// Create membership plan for salon
router.post('/:salonId', MembershipController.createMembershipPlan);

// Purchase membership
router.post('/:salonId/purchase', MembershipController.purchaseMembership);

// Get all coupons available to a customer through membership
router.get('/:salonId/:customerId/coupons', MembershipController.getCouponsForCustomer);

export default router;
