import CartService from "../services/CartService.js";

const addToCart = async (req, res) => {
    const access_token = req.headers.access_token
    try {
        const response = await CartService.addToCart(req.body, access_token);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

// const updateCart = async (req, res) => {
//     const id = req.params.id
//     try {
//         const response = await CartService.updateCart(req.body, id);
//         return res.status(200).json(response);
//     } catch (e) {
//         return res.status(404).json({
//             message: e,
//         });
//     }
// };

const deleteRoomTypeFromCart = async (req, res) => {
    const id = req.params.id
    try {
        const response = await CartService.deleteRoomTypeFromCart(id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getDetailCart = async (req, res) => {
    const access_token = req.headers.access_token
    try {
        const response = await CartService.getDetailCart(access_token);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

// const getAllCart = async (req, res) => {
//     try {
//         const response = await CartService.getAllCart();
//         return res.status(200).json(response);
//     } catch (e) {
//         return res.status(404).json({
//             message: e,
//         });
//     }
// };

// const searchCart = async (req, res) => {
//     try {
//         const response = await CartService.searchCart(req.headers);
//         return res.status(200).json(response);
//     } catch (e) {
//         return res.status(404).json({
//             message: e,
//         });
//     }
// };

export default {
    addToCart,
    //updateCart,
    deleteRoomTypeFromCart,
    getDetailCart,
    //getAllCart,
    //searchCart
}