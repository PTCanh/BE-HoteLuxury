import express from "express";
import locationController from "../controllers/LocationController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../utils/UploadFile.js";

const router = express.Router();

router.get('/filter', locationController.filterLocation)
router.post('/', upload.single("locationImage"), locationController.createLocation)
router.put('/:id', upload.single("locationImage"), locationController.updateLocation)
router.delete('/:id', locationController.deleteLocation)
router.get('/:id', locationController.getDetailLocation)
router.get('/', locationController.getAllLocation)


export default router