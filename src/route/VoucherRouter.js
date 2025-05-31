import express from "express";
import voucherController from "../controllers/VoucherController.js"
import { authMiddleware , authUserMiddleware} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/', authMiddleware, voucherController.createVoucher)
router.put('/:id',authMiddleware,  voucherController.updateVoucher)
router.delete('/:id',authMiddleware,  voucherController.deleteVoucher)
router.get('/suitable-voucher', authUserMiddleware, voucherController.getSuitableVoucher)
router.get('/', authUserMiddleware, voucherController.getAllVoucher)

export default router