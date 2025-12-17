export async function up(knex) {
    await knex.schema.alterTable('salons', table => {
        table.index('city_id', 'idx_salons_city_id');
    });

    await knex.schema.alterTable('salon_images', table => {
        table.index('salon_id', 'idx_salon_images_salon_id');
    });
}

export async function down(knex) {
    await knex.schema.alterTable('salons', table => {
        table.dropIndex('city_id', 'idx_salons_city_id');
    });

    await knex.schema.alterTable('salon_images', table => {
        table.dropIndex('salon_id', 'idx_salon_images_salon_id');
    });
}
