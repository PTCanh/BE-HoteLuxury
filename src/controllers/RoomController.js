import roomService from "../services/RoomService.js";

const createRoom = async (req, res) => {
    try {
        const response = await roomService.createRoom(req.body);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const updateRoom = async (req, res) => {
    const id = req.params.id
    try {
        const response = await roomService.updateRoom(req.body, id);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const deleteRoom = async (req, res) => {
    const id = req.params.id
    try {
        const response = await roomService.deleteRoom(id);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getDetailRoom = async (req, res) => {
    const id = req.params.id
    try {
        const response = await roomService.getDetailRoom(id);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getAllRoom = async (req, res) => {
    try {
        const response = await roomService.getAllRoom();
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const filterRoom = async (req, res) => {
    try {
        const response = await roomService.filterRoom(req.headers, req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

export default {
    createRoom,
    updateRoom,
    deleteRoom,
    getDetailRoom,
    getAllRoom,
    filterRoom
}