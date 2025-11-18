/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Salon memberships table
    await knex.schema.createTable('salon_memberships', (table) => {
        table.increments('id').primary();
        table.integer('salon_id').unsigned().references('id').inTable('salons').onDelete('CASCADE');
        table.string('name').notNullable();
        table.text('description');
        table.decimal('price', 10, 2).notNullable();
        table.integer('duration_days').notNullable(); // Duration in days
        table.enum('status', ['active', 'inactive']).defaultTo('active');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });

    // Customer memberships table
    await knex.schema.createTable('customer_memberships', (table) => {
        table.increments('id').primary();
        table.integer('customer_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.integer('salon_id').unsigned().references('id').inTable('salons').onDelete('CASCADE');
        table.integer('membership_id').unsigned().references('id').inTable('salon_memberships').onDelete('CASCADE');
        table.timestamp('start_date').notNullable();
        table.timestamp('end_date').notNullable();
        table.enum('status', ['active', 'expired']).defaultTo('active');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['customer_id', 'salon_id']); // A customer can only have ONE active membership per salon
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTable('salon_memberships');
    await knex.schema.dropTable('customer_memberships');
};