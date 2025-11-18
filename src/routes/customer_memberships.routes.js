// routes/customerMembershipRoutes.js
import express from "express";
import customerMembershipController from "../controllers/customer_memberships.controller.js";

const router = express.Router();

// Get all memberships for customer
router.get("/:customerId", customerMembershipController.getAll);

// Get only active memberships for customer
router.get("/:customerId/active", customerMembershipController.getActive);

export default router;
