import scheduleService from "../services/ScheduleService.js";

const createSchedule = async (req, res) => {
    try {
        const response = await scheduleService.createSchedule(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const updateSchedule = async (req, res) => {
    const id = req.params.id
    try {
        const response = await scheduleService.updateSchedule(req.body, id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const deleteSchedule = async (req, res) => {
    const id = req.params.id
    try {
        const response = await scheduleService.deleteSchedule(id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getDetailSchedule = async (req, res) => {
    const id = req.params.id
    try {
        const response = await scheduleService.getDetailSchedule(id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const getAllSchedule = async (req, res) => {
    try {
        const response = await scheduleService.getAllSchedule();
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const searchSchedule = async (req, res) => {
    try {
        const response = await scheduleService.searchSchedule(req.query);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

export default {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getDetailSchedule,
    getAllSchedule,
    searchSchedule
}