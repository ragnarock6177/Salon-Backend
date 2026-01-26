/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Add price to coupons
    await knex.schema.alterTable('coupons', (table) => {
        table.decimal('price', 10, 2).defaultTo(0);
    });

    // Create customer_coupons table
    await knex.schema.createTable('customer_coupons', (table) => {
        table.increments('id').primary();
        table.integer('coupon_id').unsigned().references('id').inTable('coupons').onDelete('CASCADE');
        table.integer('customer_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.enum('status', ['active', 'used', 'expired']).defaultTo('active');
        table.timestamp('purchased_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTable('customer_coupons');
    await knex.schema.alterTable('coupons', (table) => {
        table.dropColumn('price');
    });
};
