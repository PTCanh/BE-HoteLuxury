import hotelService from "../services/HotelService.js";
import Hotel from '../models/Hotel.js'

const createHotel = async (req, res) => {
    try {
        const hotelData = {
            ...req.body,
            hotelImage: req.thumbnailUrl || "", // Single image (thumbnail)
            hotelImages: req.galleryUrls || []  // Multiple images (gallery)
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
        // Conditionally update hotelImage if it exists
        if (req.thumbnailUrl) {
            hotelData.hotelImage = req.thumbnailUrl;
        }
        // Conditionally update hotelImages if they exist
        if (req.galleryUrls && req.galleryUrls.length > 0) {
            hotelData.hotelImages = [...req.body.hotelImages, ...req.galleryUrls];
        }
        const response = await hotelService.updateHotel(hotelData, id);
        return res.status(response.statusCode).json(response);
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
        return res.status(response.statusCode).json(response);
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
        return res.status(response.statusCode).json(response);
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
        return res.status(response.statusCode).json(response);
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
        return res.status(response.statusCode).json(response);
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

const getSimilarHotel = async (req, res) => {
    const id = req.params.id
    try {
        const response = await hotelService.getSimilarHotel(id);
        return res.status(response.statusCode).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

const getTop12MostBookingHotel = async (req, res) => {
    try {
        const response = await hotelService.getTop12MostBookingHotel();
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
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
    suggestedHotel,
    getSimilarHotel,
    getTop12MostBookingHotel
}