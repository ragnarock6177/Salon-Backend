/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('salon_images', function (table) {
    table.increments('id').primary();

    // Foreign key -> salons
    table.integer('salon_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('salons')
      .onDelete('CASCADE');

    table.text('image_url').notNullable();
    table.boolean('is_primary').defaultTo(false);
    table.string('type', 20).defaultTo('gallery'); // cover, gallery, logo, etc.

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('salon_images');
};
