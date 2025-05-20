import notificationService from "../services/NotificationService.js";

const createNotification = async (req, res) => {
    try {
        const response = await notificationService.createNotification(req.body);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

const updateNotification = async (req, res) => {
    const id = req.params.id
    try {
        const response = await notificationService.updateNotification(id, req.body);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};
const deleteNotification = async (req, res) => {
    const id = req.params.id
    try {
        const response = await notificationService.deleteNotification(id);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};


const getAllNotification = async (req, res) => {
    try {
        const response = await notificationService.getAllNotification(req.headers);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

const readAllNotification = async (req, res) => {
    try {
        const response = await notificationService.readAllNotification(req.headers);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

const deleteAllNotification = async (req, res) => {
    try {
        const response = await notificationService.deleteAllNotification(req.headers);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

export default {
    createNotification,
    updateNotification,
    deleteNotification,
    getAllNotification,
    readAllNotification,
    deleteAllNotification
}