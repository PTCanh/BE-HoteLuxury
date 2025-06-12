import ratingService from "../services/RatingService.js";

const createRating = async (req, res) => {
    try {
        const ratingData = {
            ...req.body,
            ratingImages: req.fileUrls || []  // Multiple images (gallery)
        }
        const response = await ratingService.createRating(req.headers, ratingData, req.query.bookingId);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

const getAllRatingByHotelId = async (req, res) => {
    try {
        const response = await ratingService.getAllRatingByHotelId(req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            message: e,
        });
    }
};

export default {
    createRating,
    getAllRatingByHotelId
}