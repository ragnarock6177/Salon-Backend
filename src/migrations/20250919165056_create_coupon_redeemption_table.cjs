/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable('coupon_redemptions', (table) => {
        table.increments('id').primary();
        table.integer('coupon_id').unsigned().references('id').inTable('coupons').onDelete('CASCADE');
        table.integer('customer_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.enum('status', ['pending', 'redeemed', 'cancelled']).defaultTo('pending');
        table.timestamp('redeemed_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTable('coupon_redemptions');
};