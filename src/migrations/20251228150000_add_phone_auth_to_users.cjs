/**
 * Migration to add phone authentication fields to users table
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.alterTable('users', function (table) {
        // Add phone authentication fields
        table.string('phone').unique().nullable();
        table.string('firebase_uid').unique().nullable();
        table.string('auth_provider').defaultTo('email'); // 'email' or 'phone'
    });

    // Make name, email, and password nullable for phone-based auth
    // Note: This uses raw SQL as Knex doesn't directly support altering nullability
    await knex.raw('ALTER TABLE users MODIFY name VARCHAR(255) NULL');
    await knex.raw('ALTER TABLE users MODIFY email VARCHAR(255) NULL');
    await knex.raw('ALTER TABLE users MODIFY password VARCHAR(255) NULL');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.alterTable('users', function (table) {
        table.dropColumn('phone');
        table.dropColumn('firebase_uid');
        table.dropColumn('auth_provider');
    });

    // Revert name, email, password back to NOT NULL
    await knex.raw('ALTER TABLE users MODIFY name VARCHAR(255) NOT NULL');
    await knex.raw('ALTER TABLE users MODIFY email VARCHAR(255) NOT NULL');
    await knex.raw('ALTER TABLE users MODIFY password VARCHAR(255) NOT NULL');
};
