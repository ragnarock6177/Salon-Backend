/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable('coupons', (table) => {
        table.increments('id').primary();
        table.integer('salon_id').unsigned().references('id').inTable('salons').onDelete('CASCADE');
        table.string('code').notNullable();
        table.text('description');
        table.decimal('discount', 5, 2).notNullable();
        table.integer('max_usage').notNullable();
        table.timestamp('valid_from').notNullable();
        table.timestamp('valid_to').notNullable();
        table.enum('status', ['active', 'inactive']).defaultTo('active');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['salon_id', 'code']); // Coupon codes unique per salon
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTable('coupons');
};