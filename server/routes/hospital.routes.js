import express from "express";
import {
  getHospitalAppointments,
  updateAppointmentStatus,
} from "../controller/hospital.controller.js";

const router = express.Router();

router.get("/:hospitalId", getHospitalAppointments);
router.patch("/:bookingId", updateAppointmentStatus);
export default router;