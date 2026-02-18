import cron from 'node-cron';
import db from '../config/db.js';

/**
 * Cron Job: Expired Coupon Cleanup
 *
 * Runs every day at midnight IST (00:00 Asia/Kolkata).
 * Three steps:
 *  1. Collects all coupon IDs where `valid_to` has passed.
 *  2. Marks linked customer_coupons still in 'active' status as 'expired'
 *     (already 'used' ones are left untouched).
 *  3. Deletes the expired coupons from the `coupons` table entirely.
 *     (FK CASCADE removes any remaining customer_coupons rows automatically.)
 */
export function startCouponCleanupJob() {
    // Schedule: every 15 seconds for testing  →  '*/15 * * * * *'
    // For production change back to  '0 0 * * *'  (daily at midnight IST)
    cron.schedule('0 0 * * *', async () => {
        const now = new Date();
        console.log(`[CouponCleanup] ⏰ Running at ${now.toISOString()}`);

        try {
            // ── Step 1: Collect all expired coupon IDs ───────────────────────
            const expiredCouponIds = await db('coupons')
                .where('valid_to', '<', now)
                .pluck('id');

            if (expiredCouponIds.length === 0) {
                console.log('[CouponCleanup] ✅ No expired coupons found. Nothing to do.');
                return;
            }

            console.log(`[CouponCleanup] 🔍 Found ${expiredCouponIds.length} expired coupon(s).`);

            // ── Step 2: Mark customer_coupons as 'expired' ───────────────────
            // Only touch 'active' ones — leave 'used' ones untouched
            const expiredCustomerCoupons = await db('customer_coupons')
                .whereIn('coupon_id', expiredCouponIds)
                .where('status', 'active')
                .update({ status: 'expired' });

            console.log(`[CouponCleanup] ✅ Marked ${expiredCustomerCoupons} customer coupon(s) as expired.`);

            // ── Step 3: Delete expired coupons from the coupons table ────────
            // FK CASCADE will also remove any remaining customer_coupons rows
            const deletedCoupons = await db('coupons')
                .whereIn('id', expiredCouponIds)
                .del();

            console.log(`[CouponCleanup] 🗑️  Deleted ${deletedCoupons} expired coupon(s) from the database.`);
            console.log(`[CouponCleanup] 🏁 Done.`);
        } catch (err) {
            console.error('[CouponCleanup] ❌ Error during cleanup:', err.message);
        }
    }, {
        scheduled: true,
        timezone: 'Asia/Kolkata'   // IST — change if your server runs in a different TZ
    });

    console.log('[CouponCleanup] 🗓️  Cron job scheduled — runs daily at midnight IST.');
}
