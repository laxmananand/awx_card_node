import express from "express";
import * as functions from "../Controllers/ZohoController.js";

const router = express.Router();

router.post("/generateaccesstoken", functions.getZohoOAuthToken);

router.post("/createleads", functions.createlead);

export default router;