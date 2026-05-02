import express from "express";
import { createAppointment, getAppointments } from "../controller/user.controller.js";

const router = express.Router();

router.post("/appointment", createAppointment);
router.get("/appointment", getAppointments);

export default router;