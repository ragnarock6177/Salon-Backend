import express from 'express';
import SalonsController from '../controllers/salons.controller.js';

const router = express.Router();

router.post('/', SalonsController.addSalon);
router.put('/:id', SalonsController.updateSalon);
router.get('/', SalonsController.getSalons);
router.delete('/:id', SalonsController.deleteSalon);
router.post('/bulk-delete', SalonsController.bulkDeleteSalons);
router.patch('/:id/status', SalonsController.toggleSalonStatus);

export default router;