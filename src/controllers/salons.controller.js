import SalonsService from '../services/salonsService.js';
import { sendSuccess, sendError } from '../utils/response.formatter.js';

const SalonsController = {
  // ✅ Add new salon
  async addSalon(req, res) {
    try {
      const salonData = req.body;
      const images = req.body.images || []; // expecting array of image URLs
      console.log(req.body)
      const newSalon = await SalonsService.addSalon(salonData, images);
      return sendSuccess(res, 'Salon added successfully', newSalon, 201);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  },

  // ✅ Update salon
  async updateSalon(req, res) {
    try {
      const salonId = req.params.id;
      const updateData = req.body;
      const images = req.body.images || [];
      const updatedSalon = await SalonsService.updateSalon(salonId, updateData, images);
      return sendSuccess(res, 'Salon updated successfully', updatedSalon, 200);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  },

  // ✅ Get all salons
  async getSalons(req, res) {
    try {
      const salons = await SalonsService.getSalons();
      return sendSuccess(res, 'Salons fetched successfully', salons, 200);
    } catch (error) {
      return sendError(res, error.message, 404);
    }
  },

  // ✅ Delete salon
  async deleteSalon(req, res) {
    try {
      const salonId = req.params.id;
      const result = await SalonsService.deleteSalon(salonId);
      return sendSuccess(res, result.message, null, 200);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  },

  // ✅ Bulk delete salons
  async bulkDeleteSalons(req, res) {
    try {
      const { ids } = req.body; // expecting { ids: [1, 2, 3] }
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return sendError(res, 'Please provide an array of salon IDs', 400);
      }
      const result = await SalonsService.bulkDeleteSalons(ids);
      return sendSuccess(res, result.message, { deletedCount: result.deletedCount }, 200);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  },

  // ✅ Toggle active/inactive
  async toggleSalonStatus(req, res) {
    try {
      const salonId = req.params.id;
      const { is_active } = req.body; // expecting { is_active: true/false }
      const result = await SalonsService.toggleSalonStatus(salonId, is_active);
      return sendSuccess(res, result.message, null, 200);
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }
};

export default SalonsController;