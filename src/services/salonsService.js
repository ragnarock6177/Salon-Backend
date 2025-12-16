import db from '../config/db.js';

class SalonsService {
    // ✅ Add new salon
    static async addSalon(salonData, images = []) {
        try {
            const {
                name,
                email,
                address,
                phone,
                owner_name,
                services,
                rating,
                city_id,
                is_active = true,
                total_reviews = 10
            } = salonData;

            console.log("---", salonData)

            // Insert salon
            const [salonId] = await db('salons').insert({
                name,
                email,
                address,
                phone,
                owner_name,
                services: JSON.stringify(services),
                rating,
                city_id,
                total_reviews,
                is_active
            });

            // Insert images if provided
            if (images.length > 0) {
                const imageData = images.map((img) => ({
                    salon_id: salonId,
                    image_url: img
                }));
                await db('salon_images').insert(imageData);
            }

            const newSalon = await db('salons').where({ id: salonId }).first();
            return newSalon;
        } catch (err) {
            console.error('Add Salon Error:', err.message);
            throw new Error('Failed to add salon');
        }
    }

    // ✅ Update salon details
    static async updateSalon(salonId, updateData, images = []) {
        try {
            await db('salons').where({ id: salonId }).update(updateData);

            if (images.length > 0) {
                // Remove old images
                await db('salon_images').where({ salon_id: salonId }).del();

                // Insert new images
                const imageData = images.map((img) => ({
                    salon_id: salonId,
                    image_url: img
                }));
                await db('salon_images').insert(imageData);
            }

            const updatedSalon = await db('salons').where({ id: salonId }).first();

            return updatedSalon;
        } catch (err) {
            console.error('Update Salon Error:', err.message);
            throw new Error('Failed to update salon');
        }
    }

    // ✅ Fetch all salons (with images)
    static async getSalons() {
        try {
            const salons = await db('salons')
                .select('salons.*')
                .leftJoin('cities', 'salons.city_id', 'cities.id');

            if (!salons.length) return [];

            const salonIds = salons.map(s => s.id);

            const images = await db('salon_images')
                .whereIn('salon_id', salonIds)
                .select('salon_id', 'image_url');

            // Map images to salons
            const imageMap = {};
            for (const img of images) {
                if (!imageMap[img.salon_id]) {
                    imageMap[img.salon_id] = [];
                }
                imageMap[img.salon_id].push(img.image_url);
            }

            // Attach images
            for (const salon of salons) {
                salon.images = imageMap[salon.id] || [];
            }

            return salons;
        } catch (err) {
            console.error('Get Salons Error:', err.message);
            throw new Error('Failed to fetch salons');
        }
    }

    // ✅ Delete salon
    static async deleteSalon(salonId) {
        try {
            await db('salon_images').where({ salon_id: salonId }).del();
            await db('salons').where({ id: salonId }).del();
            return { message: 'Salon deleted successfully' };
        } catch (err) {
            console.error('Delete Salon Error:', err.message);
            throw new Error('Failed to delete salon');
        }
    }

    // ✅ Activate/Deactivate salon
    static async toggleSalonStatus(salonId, isActive) {
        try {
            await db('salons').where({ id: salonId }).update({ is_active: isActive });
            return { message: `Salon ${isActive ? 'activated' : 'deactivated'} successfully` };
        } catch (err) {
            console.error('Toggle Salon Status Error:', err.message);
            throw new Error('Failed to update salon status');
        }
    }

    static async saveImage(salon_id, imagePath) {
        try {
            await db('salon_images').insert({
                salon_id: salon_id,
                image_url: imagePath,
                is_primary: 0,
                type: 'gallery'
            })
        } catch (error) {
            console.error('Toggle Salon Status Error:', err.message);
            throw new Error('Failed to update salon status');
        }
    }
}

export default SalonsService;
