import hotelService from "../services/HotelService.js";

const createHotel = async (req, res) => {
    try {
        const hotelImage = req.file ? `${req.file.filename}` : "1.png";
        const hotelData = {
            ...req.body,
            hotelImage
        }
        const response = await hotelService.createHotel(hotelData);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const updateHotel = async (req, res) => {
    try {
        const id = req.params.id
        const hotelImage = req.file ? `${req.file.filename}` : "1.png";
        const hotelData = {
            ...req.body,
            hotelImage
        }
        const response = await hotelService.updateHotel(hotelData, id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const deleteHotel = async (req, res) => {
    const id = req.params.id
    try {
        const response = await hotelService.deleteHotel(id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getDetailHotel = async (req, res) => {
    const id = req.params.id
    try {
        const response = await hotelService.getDetailHotel(id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getAllHotel = async (req, res) => {
    try {
        const response = await hotelService.getAllHotel();
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const searchHotel = async (req, res) => {
    try {
        const response = await hotelService.searchHotel(req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const userFilterHotel = async (req, res) => {
    try {
        const response = await hotelService.userFilterHotel(req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const adminFilterHotel = async (req, res) => {
    try {
        const response = await hotelService.adminFilterHotel(req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

export default {
    createHotel,
    updateHotel,
    deleteHotel,
    getDetailHotel,
    getAllHotel,
    searchHotel,
    userFilterHotel,
    adminFilterHotel
}