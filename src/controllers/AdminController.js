import adminService from "../services/AdminService.js";

const adminHomePage = async (req, res) => {
    try {
      const response = await adminService.adminHomePage();
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

export default {adminHomePage,
  adminAvatar
}