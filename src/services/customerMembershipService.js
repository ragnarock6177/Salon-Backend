// services/customerMembershipService.js
import db from "../config/db.js";
import dayjs from "dayjs";

class CustomerMembershipService {
    // Get all memberships for a customer
    async getAllMemberships(customerId) {
        return await db("customer_memberships as cm")
            .join("salon_memberships as m", "cm.membership_id", "m.id")
            .join("salons as s", "cm.salon_id", "s.id")
            .select(
                "cm.id as customer_membership_id",
                "cm.start_date",
                "cm.end_date",
                "m.id as membership_id",
                "m.name as membership_name",
                "m.price",
                "m.duration_days",
                "s.id as salon_id",
                "s.name as salon_name",
            )
            .where("cm.customer_id", customerId)
            .orderBy("cm.created_at", "desc");
    }

    // Get only active memberships
    async getActiveMemberships(customerId) {
        const today = dayjs().format("YYYY-MM-DD");

        return await db("customer_memberships as cm")
            .join("salon_memberships as m", "cm.membership_id", "m.id")
            .join("salons as s", "cm.salon_id", "s.id")
            .select(
                "cm.id as customer_membership_id",
                "cm.start_date",
                "cm.end_date",
                "m.id as membership_id",
                "m.name as membership_name",
                "m.price",
                "m.duration_days",
                "s.id as salon_id",
                "s.name as salon_name",
            )
            .where("cm.customer_id", customerId)
            .andWhere("cm.end_date", ">=", today)
            .orderBy("cm.end_date", "asc");
    }
}

export default new CustomerMembershipService();