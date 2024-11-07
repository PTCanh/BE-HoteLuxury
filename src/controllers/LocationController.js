import locationService from "../services/LocationService.js";

const createLocation = async (req, res) => {
  try {
    const response = await locationService.createLocation(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const updateLocation = async (req, res) => {
  const id = req.params.id
  try {
    const response = await locationService.updateLocation(req.body, id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const deleteLocation = async (req, res) => {
  const id = req.params.id
  try {
    const response = await locationService.deleteLocation(id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getDetailLocation = async (req, res) => {
  const id = req.params.id
  try {
    const response = await locationService.getDetailLocation(id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllLocation = async (req, res) => {
  try {
    const response = await locationService.getAllLocation();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const filterLocation = async (req, res) => {
  try {
    const response = await locationService.filterLocation(req.query);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

export default {
  createLocation,
  updateLocation,
  deleteLocation,
  getDetailLocation,
  getAllLocation,
  filterLocation
}