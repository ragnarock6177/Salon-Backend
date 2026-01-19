/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('salons', function (table) {
        table.time('opening_time').nullable();
        table.time('closing_time').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('salons', function (table) {
        table.dropColumn('opening_time');
        table.dropColumn('closing_time');
    });
};
