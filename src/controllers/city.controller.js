import CityService from '../services/cityService.js';
import { sendSuccess, sendError } from '../utils/response.formatter.js';

const CityController = {
    // ✅ Add new city
    async addCity(req, res) {
        try {
            const city = await CityService.addCity(req.body);
            return sendSuccess(res, 'City added successfully', city, 201);
        } catch (error) {
            return sendError(res, error.message, error.statusCode || 400);
        }
    },

    // ✅ Add Bulk city
    async addBulkCities(req, res) {
        try {
            const city = await CityService.addBulkCities(req.body.cities);
            return sendSuccess(res, 'Cities added successfully', city, 201);
        } catch (error) {
            return sendError(res, error.message, error.statusCode || 400);
        }
    },

    // ✅ Deactivate city
    async deactivateCity(req, res) {
        try {
            const { id } = req.params;
            const result = await CityService.deactiveCity(id);
            return sendSuccess(res, 'City deactivated successfully', result, 200);
        } catch (error) {
            return sendError(res, error.message, error.statusCode || 400);
        }
    },

    // ✅ Activate city
    async activateCity(req, res) {
        try {
            const { id } = req.params;
            const result = await CityService.activateCity(id);
            return sendSuccess(res, 'City activated successfully', result, 200);
        } catch (error) {
            return sendError(res, error.message, error.statusCode || 400);
        }
    },

    // ✅ Get cities (optionally only active)
    async getCities(req, res) {
        try {
            const cities = await CityService.getCities();
            return sendSuccess(res, 'Cities fetched successfully', cities, 200);
        } catch (error) {
            return sendError(res, error.message, error.statusCode || 404);
        }
    },

    // ✅ Delete city
    async deleteCity(req, res) {
        try {
            const { id } = req.params;
            const result = await CityService.deleteCity(id);
            return sendSuccess(res, 'City deleted successfully', result, 200);
        } catch (error) {
            return sendError(res, error.message, error.statusCode || 400);
        }
    }
};

export default CityController;
