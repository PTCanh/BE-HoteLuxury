import pointHistoryService from "../services/PointHistoryService.js";

const createPointHistory = async (req, res) => {
    try {
        const response = await pointHistoryService.createPointHistory(req.body);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

const updatePointHistory = async (req, res) => {
    const id = req.params.id
    try {
        const response = await pointHistoryService.updatePointHistory(id, req.body);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};
const deletePointHistory = async (req, res) => {
    const id = req.params.id
    try {
        const response = await pointHistoryService.deletePointHistory(id);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};


const getAllPointHistory = async (req, res) => {
    try {
        const response = await pointHistoryService.getAllPointHistory(req.headers);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

export default {
    createPointHistory,
    updatePointHistory,
    deletePointHistory,
    getAllPointHistory,
}