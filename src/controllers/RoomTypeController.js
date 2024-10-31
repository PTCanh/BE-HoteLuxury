import roomTypeService from "../services/RoomTypeService.js";

const createRoomType = async (req, res) => {
    try {
        const response = await roomTypeService.createRoomType(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const updateRoomType = async (req, res) => {
    const id = req.params.id
    try {
        const response = await roomTypeService.updateRoomType(req.body, id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const deleteRoomType = async (req, res) => {
    const id = req.params.id
    try {
        const response = await roomTypeService.deleteRoomType(id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getDetailRoomType = async (req, res) => {
    const id = req.params.id
    try {
        const response = await roomTypeService.getDetailRoomType(id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getAllRoomType = async (req, res) => {
    try {
        const response = await roomTypeService.getAllRoomType();
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const searchRoomType = async (req, res) => {
    try {
        const response = await roomTypeService.searchRoomType(req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

export default {
    createRoomType,
    updateRoomType,
    deleteRoomType,
    getDetailRoomType,
    getAllRoomType,
    searchRoomType
}