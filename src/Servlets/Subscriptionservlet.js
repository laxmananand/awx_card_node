// Common Routes
import express from "express";

import * as functions from "../Controllers/SubscriptionController.js";

//Node Part of Subscription by Pabitra

const router = express.Router();


router.post("/createsubscription", functions.createSubscription2);
router.get("/getsubscription", functions.getsubscription);

export default router;
