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
        const hotelData = req.body
        const hotelImage = req.file ? `${req.file.filename}` : "";
        if (hotelImage) {
            hotelData.hotelImage = hotelImage
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
        const response = await hotelService.getAllHotel(req.headers);
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

const filterHotel = async (req, res) => {
    try {
        const response = await hotelService.filterHotel(req.headers, req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const suggestedHotel = async (req, res) => {
    try {
        const response = await hotelService.suggestedHotel(req.query);
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
    filterHotel,
    suggestedHotel
}