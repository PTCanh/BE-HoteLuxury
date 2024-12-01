import ratingService from "../services/RatingService.js";

const createRating = async (req, res) => {
    try {
        const response = await ratingService.createRating(req.headers, req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getAllRatingByHotelId = async (req, res) => {
    try {
        const response = await ratingService.getAllRatingByHotelId(req.query.hotelId);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

export default {
    createRating,
    getAllRatingByHotelId
}