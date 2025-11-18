/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('salons', function (table) {
    table.increments('id').primary();
    table.string('name', 150).notNullable();
    table.string('owner_name', 100);
    table.string('email', 150).unique();
    table.string('phone', 20).notNullable();
    table.text('address').notNullable();

    // Foreign key -> cities
    table.integer('city_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('cities')
      .onDelete('CASCADE');

    table.jsonb('services'); // Example: ["Haircut", "Facial", "Spa"]
    table.decimal('rating', 2, 1).defaultTo(0);
    table.integer('total_reviews').defaultTo(0);
    table.boolean('is_active').defaultTo(true);

    table.timestamps(true, true); // created_at & updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('salons');
};
