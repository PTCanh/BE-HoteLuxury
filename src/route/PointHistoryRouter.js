import express from "express";
import pointHistoryController from "../controllers/pointHistoryController.js"
import { authMiddleware , authUserMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/', authMiddleware, pointHistoryController.createPointHistory)
router.put('/:id',authMiddleware,  pointHistoryController.updatePointHistory)
router.delete('/:id',authMiddleware,  pointHistoryController.deletePointHistory)
router.get('/', authUserMiddleware, pointHistoryController.getAllPointHistory)

export default router