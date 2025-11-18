/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // Yeh function migration run karne par chalta hai (table banata hai)
  return knex.schema.createTable('cities', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // Yeh function migration ko rollback karne par chalta hai (table delete karta hai)
  return knex.schema.dropTable('cities');
};