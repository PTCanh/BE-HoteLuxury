import roomTypeService from "../services/RoomTypeService.js";

const createRoomType = async (req, res) => {
    try {
        const roomTypeImage = req.file ? `${req.file.filename}` : "1.png";
        const roomTypeData = {
            ...req.body,
            roomTypeImage
        }
        const response = await roomTypeService.createRoomType(roomTypeData);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const updateRoomType = async (req, res) => {
    try {
        const id = req.params.id
        const roomTypeData = req.body
        const roomTypeImage = req.file ? `${req.file.filename}` : "";
        if (roomTypeImage) {
            roomTypeData.roomTypeImage = roomTypeImage
        }
        const response = await roomTypeService.updateRoomType(roomTypeData, id);
        return res.status(response.statusCode).json(response);
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
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getDetailRoomType = async (req, res) => {
    const id = req.params.id
    try {
        const response = await roomTypeService.getDetailRoomType(id, req.query,req.headers);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getAllRoomType = async (req, res) => {
    try {
        const response = await roomTypeService.getAllRoomType(req.headers);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};
const getRoomTypeByHotelId = async (req, res) => {
    try {
        const response = await roomTypeService.getRoomTypeByHotelId(req.params.hotelId);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const filterRoomType = async (req, res) => {
    try {
        const response = await roomTypeService.filterRoomType(req.headers, req.query);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const availableRoomTypes = async (req, res) => {
    try {
        const response = await roomTypeService.availableRoomTypes(req.query);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getDetailRoomTypeByHotelManager = async (req, res) => {
    const id = req.params.id
    try {
        const response = await roomTypeService.getDetailRoomTypeByHotelManager(id, req.query,req.headers);
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
    filterRoomType,
    getRoomTypeByHotelId,
    availableRoomTypes,
    getDetailRoomTypeByHotelManager
}