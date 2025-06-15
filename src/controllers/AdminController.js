import adminService from "../services/AdminService.js";

const adminHomePage = async (req, res) => {
  try {
    const response = await adminService.adminHomePage(req.query);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const adminAvatar = async (req, res) => {
  try {
    const response = await adminService.adminAvatar(req.headers);
    return res.status(response.statusCode).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllHotel = async (req, res) => {
  try {
    const response = await adminService.getAllHotel(req.query);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllVoucher = async (req, res) => {
  try {
    const response = await adminService.getAllVoucher();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e,
    });
  }
};

const getAllRating = async (req, res) => {
  try {
    const response = await adminService.getAllRating(req.query);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e,
    });
  }
};

const updateRating = async (req, res) => {
  try {
    const response = await adminService.updateRating(req.params.id, req.body);
    return res.status(response.statusCode).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e,
    });
  }
};
const deleteRating = async (req, res) => {
  try {
    const response = await adminService.deleteRating(req.params.id);
    return res.status(response.statusCode).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e,
    });
  }
};

export default {
  adminHomePage,
  adminAvatar,
  getAllHotel,
  getAllVoucher,
  getAllRating,
  updateRating,
  deleteRating
}