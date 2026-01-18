import express from 'express';
import SalonsController from '../controllers/salons.controller.js';

const router = express.Router();

router.post('/', SalonsController.addSalon);
router.put('/:id', SalonsController.updateSalon);
router.get('/', SalonsController.getSalons);
router.get('/:id', SalonsController.getSalonById);
router.delete('/:id', SalonsController.deleteSalon);
router.post('/bulk-delete', SalonsController.bulkDeleteSalons);
router.patch('/:id/status', SalonsController.toggleSalonStatus);
router.get('/:id/qrcode', SalonsController.generateQRCode);

export default router;