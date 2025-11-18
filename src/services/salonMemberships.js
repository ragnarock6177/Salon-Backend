import db from '../config/db.js';

export const MembershipService = {

    async createMembershipPlan(salonId, data) {
        console.log(data)
        return await db('salon_memberships').insert({ ...data, salon_id: salonId }).returning('*');
    },

    async getMembershipPlans(salonId) {
        return await db('salon_memberships').where({ salon_id: salonId, status: 'active' });
    },

    async purchaseMembership(customerId, salonId, membershipId) {
        const trx = await db.transaction();

        try {
            // Get membership details
            const membership = await trx('salon_memberships').where({ id: membershipId, salon_id: salonId }).first();
            if (!membership) throw new Error('Membership plan not found');

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + membership.duration_days);

            // Insert customer membership
            const record = await trx('customer_memberships')
                .insert({
                    customer_id: customerId,
                    salon_id: salonId,
                    membership_id: membershipId,
                    start_date: startDate,
                    end_date: endDate,
                    status: 'active'
                })
                .returning('*');

            await trx.commit();
            return record;
        } catch (err) {
            await trx.rollback();
            throw err;
        }
    },

    /**
     * Check if a customer has an active membership
     */
    async hasActiveMembership(customerId, salonId) {
        console.log(customerId, salonId)
        const now = new Date();
        return await db('customer_memberships').where({
            customer_id: customerId,
            salon_id: salonId,
            status: 'active'
        }).first();
    }
};
