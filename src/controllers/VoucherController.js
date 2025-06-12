import voucherService from "../services/VoucherService.js";

const createVoucher = async (req, res) => {
    try {
        const response = await voucherService.createVoucher(req.body);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

const updateVoucher = async (req, res) => {
    const id = req.params.id
    try {
        const response = await voucherService.updateVoucher(id, req.body);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};
const deleteVoucher = async (req, res) => {
    const id = req.params.id
    try {
        const response = await voucherService.deleteVoucher(id);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

const getDetailVoucher = async (req, res) => {
    const id = req.params.id
    try {
        const response = await voucherService.getDetailVoucher(id);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};


const getAllVoucher = async (req, res) => {
    try {
        const response = await voucherService.getAllVoucher(req.headers);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

const getSuitableVoucher = async (req, res) => {
    try {
        const response = await voucherService.getSuitableVoucher(req.headers, req.query);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

const getFestivalVoucher = async (req, res) => {
    try {
        const response = await voucherService.getFestivalVoucher();
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

export default {
    createVoucher,
    updateVoucher,
    deleteVoucher,
    getDetailVoucher,
    getAllVoucher,
    getSuitableVoucher,
    getFestivalVoucher
}