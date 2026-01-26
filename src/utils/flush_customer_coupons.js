import db from '../config/db.js';

const flush = async () => {
    try {
        console.log('Flushing customer_coupons table...');
        await db('customer_coupons').del();
        console.log('customer_coupons table flushed successfully.');
    } catch (err) {
        console.error('Error flushing table:', err);
    } finally {
        // Allow time for logger or pending queries
        setTimeout(() => process.exit(0), 500);
    }
};

flush();
