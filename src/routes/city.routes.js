import express from 'express';
import CityController from '../controllers/city.controller.js';

const router = express.Router();

router.get('/', CityController.getCities);
router.post('/', CityController.addCity);
router.post('/bulk', CityController.addBulkCities);
router.put('/deactivate/:id', CityController.deactivateCity);
router.put('/activate/:id', CityController.activateCity);
router.delete('/:id', CityController.deleteCity);

export default router;