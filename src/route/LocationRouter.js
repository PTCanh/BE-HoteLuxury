import express from "express";
import locationController from "../controllers/LocationController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/search', locationController.searchLocation)
router.post('/', locationController.createLocation)
router.put('/:id', locationController.updateLocation)
router.delete('/:id', locationController.deleteLocation)
router.get('/:id', locationController.getDetailLocation)
router.get('/', locationController.getAllLocation)


export default router