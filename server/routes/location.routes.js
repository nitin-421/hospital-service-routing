import { allLocations, nearestLocations } from "../controller/location.controller.js";
import express from "express";
const router = express.Router();


router.get("/",allLocations);
router.get("/nearest",nearestLocations);

export default router;