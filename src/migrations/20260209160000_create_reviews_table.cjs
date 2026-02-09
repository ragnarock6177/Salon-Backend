/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Create reviews table
    await knex.schema.createTable('salon_reviews', (table) => {
        table.increments('id').primary();
        table.integer('salon_id').unsigned().notNullable()
            .references('id').inTable('salons').onDelete('CASCADE');
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');
        table.integer('rating').unsigned().notNullable().checkIn([1, 2, 3, 4, 5]);
        table.text('comment').nullable();
        table.string('title', 200).nullable();
        table.enum('status', ['pending', 'approved', 'rejected', 'hidden']).defaultTo('approved');
        table.integer('likes_count').unsigned().defaultTo(0);
        table.boolean('is_verified_visit').defaultTo(false); // If user had a verified appointment
        table.timestamp('visit_date').nullable(); // When did they visit
        table.timestamps(true, true);

        // Ensure one review per user per salon
        table.unique(['salon_id', 'user_id']);
        // Indexes for performance
        table.index(['salon_id', 'status']);
        table.index(['user_id']);
        table.index(['created_at']);
    });

    // Create review images table
    await knex.schema.createTable('review_images', (table) => {
        table.increments('id').primary();
        table.integer('review_id').unsigned().notNullable()
            .references('id').inTable('salon_reviews').onDelete('CASCADE');
        table.text('image_url').notNullable();
        table.integer('display_order').unsigned().defaultTo(0);
        table.timestamps(true, true);
        
        table.index(['review_id']);
    });

    // Create review likes table
    await knex.schema.createTable('review_likes', (table) => {
        table.increments('id').primary();
        table.integer('review_id').unsigned().notNullable()
            .references('id').inTable('salon_reviews').onDelete('CASCADE');
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // One like per user per review
        table.unique(['review_id', 'user_id']);
        table.index(['review_id']);
        table.index(['user_id']);
    });

    // Create review reports table
    await knex.schema.createTable('review_reports', (table) => {
        table.increments('id').primary();
        table.integer('review_id').unsigned().notNullable()
            .references('id').inTable('salon_reviews').onDelete('CASCADE');
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');
        table.enum('reason', ['spam', 'inappropriate', 'fake', 'offensive', 'other']).notNullable();
        table.text('description').nullable();
        table.enum('status', ['pending', 'reviewed', 'dismissed']).defaultTo('pending');
        table.integer('reviewed_by').unsigned().nullable()
            .references('id').inTable('users').onDelete('SET NULL');
        table.timestamp('reviewed_at').nullable();
        table.timestamps(true, true);

        // One report per user per review
        table.unique(['review_id', 'user_id']);
        table.index(['review_id']);
        table.index(['status']);
    });

    // Create owner responses table (salon owners can respond to reviews)
    await knex.schema.createTable('review_responses', (table) => {
        table.increments('id').primary();
        table.integer('review_id').unsigned().notNullable().unique()
            .references('id').inTable('salon_reviews').onDelete('CASCADE');
        table.integer('responder_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');
        table.text('response').notNullable();
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('review_responses');
    await knex.schema.dropTableIfExists('review_reports');
    await knex.schema.dropTableIfExists('review_likes');
    await knex.schema.dropTableIfExists('review_images');
    await knex.schema.dropTableIfExists('salon_reviews');
};
