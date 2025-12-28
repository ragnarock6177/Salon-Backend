import db from '../config/db.js';

class CityService {
    // ✅ Add new city
    static async addCity({ name }) {
        try {
            if (!name) throw new Error('City name is required');

            // check if city exists
            const existingCity = await db('cities').where({ name }).first();

            if (existingCity) throw new Error('City already exists');

            const [id] = await db('cities').insert({ name, is_active: true });

            const newCity = await db('cities').where({ id }).first();
            return newCity;
        } catch (err) {
            console.error('Add City Error:', err.message);
            throw new Error(err.message);
        }
    }

    // ✅ Deactivate city
    static async deactiveCity(id) {
        try {
            const city = await db('cities').where({ id }).first();
            if (!city) throw new Error('City not found');

            await db('cities').where({ id }).update({ is_active: false, updated_at: new Date() });

            return { message: 'City deactivated successfully' };
        } catch (err) {
            console.error('Deactivate City Error:', err.message);
            throw new Error(err.message);
        }
    }

    // ✅ Activate city
    static async activateCity(id) {
        try {
            const city = await db('cities').where({ id }).first();
            if (!city) throw new Error('City not found');

            await db('cities').where({ id }).update({ is_active: true, updated_at: new Date() });

            return { message: 'City activated successfully' };
        } catch (err) {
            console.error('Deactivate City Error:', err.message);
            throw new Error(err.message);
        }
    }

    // ✅ Get all cities
    static async getCities() {
        try {
            console.log("==============", db.client.pool)
            let query = db('cities').select('id', 'name', 'is_active');
            // console.log(query)
            // query = query.where({ is_active: true });
            const cities = await query;
            return cities;
        } catch (err) {
            console.error('Get Cities Error:', err.message);
            throw new Error('Failed to fetch cities');
        }
    }

    // ✅ Delete city
    static async deleteCity(id) {
        try {
            const city = await db('cities').where({ id }).first();
            if (!city) throw new Error('City not found');

            await db('cities').where({ id }).del();
            return { message: 'City deleted successfully' };
        } catch (err) {
            console.error('Delete City Error:', err.message);
            throw new Error(err.message);
        }
    }

    static async addBulkCities(cityNames = []) {
        try {
            if (!Array.isArray(cityNames) || cityNames.length === 0) {
                throw new Error('City names array is required');
            }

            // Clean + normalize input
            const cleanNames = cityNames
                .map((name) => name && name.trim())
                .filter((name) => !!name);

            if (cleanNames.length === 0) {
                throw new Error('No valid city names provided');
            }

            // Find existing cities (avoid duplicates)
            const existing = await db('cities')
                .whereIn('name', cleanNames)
                .select('name');

            const existingNames = existing.map((c) => c.name);

            // Only insert new ones
            const newCities = cleanNames
                .filter((name) => !existingNames.includes(name))
                .map((name) => ({
                    name,
                    is_active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                }));

            if (newCities.length === 0) {
                return { message: 'All cities already exist', inserted: [] };
            }

            // Insert new cities
            await db('cities').insert(newCities);

            return {
                message: 'Bulk cities added successfully',
                inserted: newCities.map(c => c.name)
            };
        } catch (err) {
            console.error('Bulk Add Cities Error:', err.message);
            throw new Error(err.message);
        }
    }

}

export default CityService;