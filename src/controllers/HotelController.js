import hotelService from "../services/HotelService.js";

const createHotel = async (req, res) => {
    try {
        const response = await hotelService.createHotel(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const updateHotel = async (req, res) => {
    const id = req.params.id
    try {
        const response = await hotelService.updateHotel(req.body, id);
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

export default {
    createHotel,
    updateHotel,
    deleteHotel,
    getDetailHotel,
    getAllHotel,
    searchHotel
}